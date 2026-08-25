// Ansicht: Outfit of the Day – 3 vorgeschlagene Outfits, je mit Favorit/Kalender/Neu.

import { el, blobUrl } from '../helpers.js';
import {
  getAllGarments, getAllOutfits, getAllCalendarEntries, getAllLooks,
  putOutfit, makeId,
} from '../db.js';
import { generiereTagesOutfits, fehlendeBasics, wetterFromTemp } from '../outfitEngine.js';
import { outfitTile } from '../outfitTile.js';
import { icon } from '../icons.js';
import { getWetter, wetterInfo } from '../weather.js';
import { getShowWeather, getWetterVorschlaege, getTempUnit } from '../settings.js';

const ANZAHL = 3;
const sig = (o) => (o ? o.garmentIds.slice().sort().join('|') : '');

// Drei tägliche Ausgabekategorien (Regelwerk v2). Anzeige oben -> unten:
// Alltag, Chic (= Business/Formal + Elegant/Chic), Freizeit.
const REIHEN = [
  { key: 'ALLTAG', label: 'Alltag' },
  { key: 'CHIC', label: 'Chic' },
  { key: 'FREIZEIT', label: 'Freizeit' },
];

export function ootdView(rerender, goTo) {
  const root = el('div', { class: 'view' });

  let garments = [];
  let tagesWetter = 'MILD'; // aus dem heutigen Wetter abgeleitet
  let fehltGlobal = [];
  let reihen = []; // pro Ausgabekategorie: { key, label, all, slots, cursor, cardEls }

  async function load() {
    garments = await getAllGarments();
    try {
      const w = await getWetter();
      tagesWetter = wetterFromTemp(w.temp);
    } catch {
      tagesWetter = 'MILD';
    }
    compute();
    render();
  }

  function compute() {
    fehltGlobal = fehlendeBasics(garments);
    const res = generiereTagesOutfits(garments, tagesWetter, { wetterFilter: getWetterVorschlaege() });
    reihen = REIHEN.map(({ key, label }) => {
      const { top, alle } = res[key];
      const slots = top.slice(0, ANZAHL);
      const last = slots[slots.length - 1];
      const cursor = last ? Math.max(0, alle.findIndex((o) => sig(o) === sig(last))) : -1;
      return { key, label, all: alle, slots, cursor, cardEls: [] };
    });
  }

  function reloadSlot(reihe, i) {
    if (reihe.all.length === 0) return;
    const shown = new Set(reihe.slots.filter((o, idx) => idx !== i).map(sig));
    // nächsten Kandidaten finden, der aktuell nicht angezeigt wird
    let gefunden = null;
    for (let k = 1; k <= reihe.all.length; k++) {
      const pos = (reihe.cursor + k) % reihe.all.length;
      const cand = reihe.all[pos];
      if (!shown.has(sig(cand))) { gefunden = cand; reihe.cursor = pos; break; }
    }
    if (!gefunden) return;
    reihe.slots[i] = gefunden;
    // nur diese eine Karte austauschen -> nur sie „blinkt"
    if (reihe.cardEls[i]) {
      const neu = buildCard(reihe, reihe.slots[i], i);
      reihe.cardEls[i].replaceWith(neu);
      reihe.cardEls[i] = neu;
    }
  }

  function render() {
    root.replaceChildren();
    root.appendChild(el('h2', {}, 'Outfit of the Day'));

    const topKacheln = getShowWeather() ? [wetterKachel(), heuteKachel()] : [heuteKachel()];
    root.appendChild(el('div', { class: 'ootd-top' }, topKacheln));

    if (fehltGlobal.length) {
      root.appendChild(
        el('p', { class: 'muted' }, [
          'Für Vorschläge fehlt noch: ' + fehltGlobal.join(', ') + '. ',
          el('a', { href: '#', onclick: (e) => (e.preventDefault(), goTo('schrank')) }, 'Teile hinzufügen →'),
        ])
      );
      return;
    }

    for (const reihe of reihen) {
      root.appendChild(el('h3', { class: 'ootd-reihe-titel' }, reihe.label));
      if (!reihe.slots.length) {
        root.appendChild(
          el('p', { class: 'muted small ootd-reihe-leer' }, `Noch keine Kombination – markiere Teile als „${reihe.label}".`)
        );
        continue;
      }
      const strip = el('div', { class: 'ootd-reihe' });
      reihe.cardEls = reihe.slots.map((outfit, i) => buildCard(reihe, outfit, i));
      reihe.cardEls.forEach((c) => strip.appendChild(c));
      root.appendChild(strip);
    }
  }

  function buildCard(reihe, outfit, i) {
    return el('div', { class: 'outfit-card ootd-card' }, [
      el('div', { class: 'oc-top' }, [
        iconPill('heart', 'Als Favorit speichern', (e) => favorisieren(outfit.garmentIds, e.currentTarget)),
        iconPill('calendar', 'In den Kalender', () => zumKalender(outfit.garmentIds)),
      ]),
      outfitTile(outfit.teile),
      el('div', { class: 'oc-bottom' }, [
        iconPill('refresh', 'Anderes Outfit', () => reloadSlot(reihe, i)),
      ]),
    ]);
  }

  // Kompakte Wetter-Kachel: zeigt zunächst "…", füllt sich, sobald die Daten da sind.
  function wetterKachel() {
    const ikon = el('span', { class: 'wetter-icon' }, [icon('cloud')]);
    const temp = el('span', { class: 'wetter-temp' }, '…');
    const text = el('span', { class: 'wetter-text' }, 'Wetter wird geladen');
    const regen = el('span', { class: 'wetter-regen' }, '');
    const tile = el('div', { class: 'wetter-tile' }, [
      ikon,
      el('div', { class: 'wetter-info' }, [temp, text, regen]),
    ]);
    getWetter()
      .then((w) => {
        const info = wetterInfo(w.code);
        ikon.replaceChildren(icon(info.icon));
        temp.textContent = getTempUnit() === 'F' ? `${Math.round(w.temp * 9 / 5 + 32)}°F` : `${w.temp}°C`;
        text.textContent = w.ort ? `${info.text} · ${w.ort}` : info.text;
        if (w.regen != null) regen.replaceChildren(icon('rain'), `${w.regen}% Regen`);
      })
      .catch(() => {
        temp.textContent = '–';
        text.textContent = 'Wetter nicht verfügbar';
      });
    return tile;
  }

  // Kachel neben dem Wetter: der Kalendereintrag für heute (Outfit/Look klein) oder Hinweis.
  // Nur klickbar, wenn ein Eintrag vorliegt – Klick öffnet dann das heutige Popup im Kalender.
  function heuteKachel() {
    const t = new Date();
    const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    const body = el('div', { class: 'heute-body' }, el('span', { class: 'muted small' }, '…'));
    const tile = el('div', { class: 'heute-tile' }, [el('span', { class: 'heute-label' }, 'Heute'), body]);
    const klickbarMachen = () => {
      tile.classList.add('klickbar');
      tile.title = 'Zum Kalender';
      tile.onclick = () => goTo('kalender', { openDate: iso });
    };
    ladeHeute()
      .then((res) => {
        if (res.teile && res.teile.length) {
          const mini = el('div', { class: 'heute-mini' });
          for (const g of res.teile.slice(0, 4)) {
            mini.appendChild(el('img', { src: blobUrl(g.bild), class: 'heute-thumb', alt: g.name || '' }));
          }
          body.replaceChildren(mini);
          klickbarMachen();
        } else if (res.look) {
          body.replaceChildren(el('img', { src: blobUrl(res.look.bild), class: 'heute-look', alt: '' }));
          klickbarMachen();
        } else {
          body.replaceChildren(el('span', { class: 'muted small' }, 'Merk dir Outfits vor'));
        }
      })
      .catch(() => body.replaceChildren(el('span', { class: 'muted small' }, 'Merk dir Outfits vor')));
    return tile;
  }

  async function ladeHeute() {
    const t = new Date();
    const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    const [entries, outfits, garms, looks] = await Promise.all([
      getAllCalendarEntries(), getAllOutfits(), getAllGarments(), getAllLooks(),
    ]);
    const entry = entries.find((e) => e.date === iso);
    if (!entry) return {};
    if (entry.outfitId) {
      const o = outfits.find((x) => x.id === entry.outfitId);
      if (o) return { teile: o.garmentIds.map((id) => garms.find((g) => g.id === id)).filter(Boolean) };
    }
    if (entry.lookId) {
      const l = looks.find((x) => x.id === entry.lookId);
      if (l) return { look: l };
    }
    return {};
  }

  function iconPill(name, title, onclick, disabled = false) {
    return el('button', { class: 'icon-pill', title, disabled, onclick }, [icon(name)]);
  }

  async function favorisieren(garmentIds, btn) {
    await putOutfit({ id: makeId(), garmentIds, favorit: true, angelegtAm: new Date().toISOString() });
    if (btn) { btn.replaceChildren(icon('heartFill')); btn.classList.add('active'); }
    flash('Als Favorit gespeichert.');
  }

  async function zumKalender(garmentIds) {
    const id = makeId();
    await putOutfit({ id, garmentIds, favorit: false, angelegtAm: new Date().toISOString() });
    goTo('kalender', { pendingOutfitId: id });
  }

  function flash(msg) {
    const n = el('div', { class: 'flash' }, msg);
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1800);
  }

  load();
  return root;
}
