// Ansicht: Outfits – Favoriten (Standard) & Looks. Outfit erstellen / Look
// hochladen über festverankerte Buttons unten (wie "Hinzufügen" im Schrank).

import { el, blobUrl } from '../helpers.js';
import {
  getAllGarments, getAllOutfits, putOutfit, makeId,
  getAllLooks, putLook, deleteLook,
} from '../db.js';
import { bewerteOutfitDetail } from '../outfitEngine.js';
import { outfitTile } from '../outfitTile.js';
import { icon } from '../icons.js';

export function outfitsView(rerender, goTo) {
  const root = el('div', { class: 'view' });

  let mode = 'favoriten'; // 'favoriten' | 'looks'
  let garments = [];
  let garmentsById = {};
  let favoriten = [];
  let looks = [];
  const selection = new Set();
  const modalHost = el('div');

  async function load() {
    garments = await getAllGarments();
    garmentsById = {};
    for (const g of garments) garmentsById[g.id] = g;
    favoriten = (await getAllOutfits()).filter((o) => o.favorit);
    looks = await getAllLooks();
    render();
  }

  function render() {
    root.replaceChildren();
    root.appendChild(el('h2', {}, 'Outfits'));
    root.appendChild(
      el('div', { class: 'pill-bar' }, [
        chip('favoriten', 'Favoriten', 'heart'),
        chip('looks', 'Looks', 'gallery'),
      ])
    );

    if (mode === 'favoriten') renderFavoriten();
    else renderLooks();

    root.appendChild(el('div', { class: 'fab-spacer' }));
    if (mode === 'looks') {
      const inp = el('input', {
        type: 'file', accept: 'image/*', style: { display: 'none' },
        onchange: (e) => uploadLook(e.target.files[0]),
      });
      root.appendChild(inp);
      root.appendChild(
        el('button', { class: 'fab with-icon', onclick: () => inp.click() }, [icon('camera'), 'Getragenen Look hochladen'])
      );
    } else {
      root.appendChild(
        el('button', { class: 'fab with-icon', onclick: openBuilder }, [icon('plus'), 'Outfit erstellen'])
      );
    }
    root.appendChild(modalHost);
  }

  function chip(id, label, iconName) {
    return el('button', {
      class: 'pill with-icon' + (mode === id ? ' active' : ''),
      onclick: () => { mode = id; render(); },
    }, [icon(iconName), label]);
  }

  // ---------- Looks ----------
  function renderLooks() {
    if (!looks.length) {
      root.appendChild(el('p', { class: 'muted' }, 'Noch keine Looks. Lade unten ein Foto deines getragenen Outfits hoch.'));
      return;
    }
    const grid = el('div', { class: 'looks-grid' });
    for (const l of looks) grid.appendChild(lookCard(l));
    root.appendChild(grid);
  }

  // Looks sind automatisch Favoriten: Herz (gefüllt) entfernt = löscht den Look.
  function lookCard(l) {
    return el('div', { class: 'look-card' }, [
      el('div', { class: 'oc-top' }, [
        el('button', { class: 'icon-pill active', title: 'Look entfernen', onclick: () => entferneLook(l) }, [icon('heartFill')]),
        el('button', { class: 'icon-pill', title: 'In den Kalender', onclick: () => lookZumKalender(l) }, [icon('calendar')]),
      ]),
      el('div', { class: 'look-imgwrap' }, [el('img', { src: blobUrl(l.bild), class: 'look-img', alt: '' })]),
    ]);
  }

  function lookZumKalender(l) {
    goTo('kalender', { pendingLookId: l.id });
  }

  async function uploadLook(file) {
    if (!file) return;
    await putLook({ id: makeId(), bild: file, datum: new Date().toISOString(), favorit: true });
    looks = await getAllLooks();
    render();
  }

  async function entferneLook(l) {
    if (!confirm('Möchtest du den Look wirklich löschen?')) return;
    await deleteLook(l.id);
    looks = looks.filter((x) => x.id !== l.id);
    render();
  }

  // ---------- Favoriten (nur Outfits; Looks erscheinen nur im Looks-Tab) ----------
  function renderFavoriten() {
    if (!favoriten.length) {
      root.appendChild(el('p', { class: 'muted' }, 'Noch keine Favoriten. Speichere Outfits mit dem Herz-Icon.'));
      return;
    }
    const list = el('div', { class: 'outfit-list' });
    root.appendChild(list);
    for (const o of favoriten) {
      const teile = o.garmentIds.map((id) => garmentsById[id]).filter(Boolean);
      list.appendChild(
        el('div', { class: 'outfit-card' }, [
          el('div', { class: 'oc-top' }, [
            el('button', { class: 'icon-pill active', title: 'Favorit entfernen', onclick: () => unfavorisieren(o) }, [icon('heartFill')]),
            el('button', { class: 'icon-pill', title: 'In den Kalender', onclick: () => zumKalender(o.garmentIds) }, [icon('calendar')]),
          ]),
          outfitTile(teile),
        ])
      );
    }
  }

  async function unfavorisieren(o) {
    if (!confirm('Das Outfit wirklich entfernen?')) return;
    await putOutfit({ ...o, favorit: false });
    favoriten = favoriten.filter((x) => x.id !== o.id);
    render();
  }

  async function zumKalender(garmentIds) {
    const id = makeId();
    await putOutfit({ id, garmentIds, favorit: false, angelegtAm: new Date().toISOString() });
    goTo('kalender', { pendingOutfitId: id });
  }

  // ---------- Outfit erstellen (Overlay) ----------
  function openBuilder() {
    selection.clear();
    renderBuilder();
  }
  function closeBuilder() {
    modalHost.replaceChildren();
  }
  // Kategorie-Slider im Builder – Reihenfolge von oben nach unten.
  const GRUPPEN = [
    { label: 'Jacken & Mäntel', cats: ['jacke', 'mantel'] },
    { label: 'Oberteile', cats: ['oberteil', 'einteiler'] },
    { label: 'Unterteile', cats: ['unterteil'] },
    { label: 'Schuhe', cats: ['schuhe'] },
    { label: 'Accessoires', cats: ['accessoire'] },
  ];
  const grobOf = (g) => (g.grobkategorie || g.kategorie || '').toLowerCase();

  function renderBuilder() {
    const gewaehlt = garments.filter((g) => selection.has(g.id));
    const card = el('div', { class: 'overlay-card builder-modal', onclick: (e) => e.stopPropagation() }, [
      el('button', { class: 'overlay-close', title: 'Schließen', onclick: closeBuilder }, [icon('close')]),
      el('div', { class: 'overlay-titel' }, 'Outfit erstellen'),
    ]);

    if (!garments.length) {
      card.appendChild(el('p', { class: 'muted' }, 'Noch keine Kleidungsstücke im Schrank.'));
      modalHost.replaceChildren(el('div', { class: 'overlay-backdrop', onclick: closeBuilder }, [card]));
      return;
    }

    // Zusammengestelltes Outfit – oben im Overlay
    if (gewaehlt.length) {
      const { verdikt, hinweise } = bewerteOutfitDetail(gewaehlt);
      const vollstaendig = verdikt !== 'unvollständig';
      card.appendChild(
        el('div', { class: 'outfit-card' }, [
          el('div', { class: 'oc-top' }, [
            el('button', {
              class: 'icon-pill', disabled: !vollstaendig,
              title: vollstaendig ? 'Als Favorit speichern' : 'Erst vervollständigen (Oberteil, Unterteil, Schuhe)',
              onclick: () => favorisieren(gewaehlt.map((g) => g.id)),
            }, [icon('heart')]),
            el('button', { class: 'icon-pill', title: 'In den Kalender', onclick: () => zumKalender(gewaehlt.map((g) => g.id)) }, [icon('calendar')]),
          ]),
          outfitTile(gewaehlt),
        ])
      );
      card.appendChild(bewertungsBox(verdikt, hinweise));
    } else {
      card.appendChild(el('p', { class: 'muted small' }, 'Tippe unten Teile an – pro Kategorie ein Teil.'));
    }

    // Kategorie-Slider (Jacken, Oberteile, Unterteile, Schuhe, Accessoires)
    for (const grp of GRUPPEN) {
      const teile = garments.filter((g) => grp.cats.includes(grobOf(g)));
      if (!teile.length) continue;
      card.appendChild(el('div', { class: 'builder-gruppe-titel' }, grp.label));
      const slider = el('div', { class: 'builder-slider' });
      for (const g of teile) {
        const selied = selection.has(g.id);
        slider.appendChild(
          el('button', {
            class: 'pick-item' + (selied ? ' selected' : ''),
            title: g.name || '',
            onclick: () => { toggleTeil(g); renderBuilder(); },
          }, [el('img', { src: pickUrl(g), class: 'pick-img', alt: g.name || '' })])
        );
      }
      card.appendChild(slider);
    }

    modalHost.replaceChildren(el('div', { class: 'overlay-backdrop', onclick: closeBuilder }, [card]));
  }

  // Oberkategorie eines Teils (kategoriePfad[0]); nur eins pro Oberkategorie erlaubt.
  function topKey(g) {
    return ((g.kategoriePfad && g.kategoriePfad[0]) || g.grobkategorie || g.kategorie || '').toLowerCase();
  }
  function toggleTeil(g) {
    if (selection.has(g.id)) { selection.delete(g.id); return; }
    const key = topKey(g);
    for (const id of [...selection]) {
      const other = garmentsById[id];
      if (other && topKey(other) === key) selection.delete(id); // vorheriges Teil derselben Kategorie ersetzen
    }
    selection.add(g.id);
  }

  async function favorisieren(garmentIds) {
    await putOutfit({ id: makeId(), garmentIds, favorit: true, angelegtAm: new Date().toISOString() });
    closeBuilder(); // Overlay schließen
    await load();   // Favoriten neu laden + rendern
    flash('Als Favorit gespeichert.');
  }

  const VERDIKT = {
    gut: { icon: 'checkCircle', text: 'Passt gut zusammen!', cls: 'gut' },
    ok: { icon: 'thumbsUp', text: 'Kann man tragen.', cls: 'ok' },
    kritisch: { icon: 'alert', text: 'Eher kritisch.', cls: 'kritisch' },
    'unvollständig': { icon: 'info', text: 'Outfit noch unvollständig.', cls: 'ok' },
  };

  function bewertungsBox(verdikt, hinweise) {
    const v = VERDIKT[verdikt] || VERDIKT.ok;
    const box = el('div', { class: 'bewertung ' + v.cls });
    box.appendChild(el('div', { class: 'bewertung-titel with-icon' }, [icon(v.icon), v.text]));
    if (hinweise.length) {
      box.appendChild(el('ul', { class: 'bewertung-tipps' }, hinweise.map((h) => el('li', {}, h))));
    } else {
      box.appendChild(el('div', { class: 'muted small' }, 'Keine Einwände – gute Kombi!'));
    }
    return box;
  }

  const urlCache = new Map();
  function pickUrl(g) {
    if (!urlCache.has(g.id)) urlCache.set(g.id, URL.createObjectURL(g.bild));
    return urlCache.get(g.id);
  }

  function flash(msg) {
    const nn = el('div', { class: 'flash' }, msg);
    document.body.appendChild(nn);
    setTimeout(() => nn.remove(), 1800);
  }

  load();
  return root;
}
