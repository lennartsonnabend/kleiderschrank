// Ansicht: Kalender – Outfit-Kacheln pro Tag, Klick vergrößert sie.

import { el, blobUrl } from '../helpers.js';
import {
  getAllCalendarEntries,
  putCalendarEntry,
  deleteCalendarEntry,
  getAllOutfits,
  getAllGarments,
  getAllLooks,
  putOutfit,
} from '../db.js';
import { outfitTile } from '../outfitTile.js';
import { icon } from '../icons.js';

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONATE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function isoDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function calendarView(rerender, goTo, params = {}) {
  const root = el('div', { class: 'view' });

  const today = new Date();
  const s = {
    year: today.getFullYear(),
    month: today.getMonth(),
    pendingOutfitId: params.pendingOutfitId || null,
    pendingLookId: params.pendingLookId || null,
    entries: {},
    outfits: {},
    garments: {},
    looks: {},
    enlarged: params.openDate || null, // Datum des vergrößerten Eintrags (z.B. via Heute-Kachel)
    editing: false, // Bearbeiten-Modus im Overlay
    editSel: null, // Set der garment-ids beim Bearbeiten
  };

  async function load() {
    const [entriesArr, outfitsArr, garmentsArr, looksArr] = await Promise.all([
      getAllCalendarEntries(),
      getAllOutfits(),
      getAllGarments(),
      getAllLooks(),
    ]);
    s.entries = {};
    for (const e of entriesArr) s.entries[e.date] = e;
    s.outfits = {};
    for (const o of outfitsArr) s.outfits[o.id] = o;
    s.garments = {};
    for (const g of garmentsArr) s.garments[g.id] = g;
    s.looks = {};
    for (const l of looksArr) s.looks[l.id] = l;
    render();
  }

  const pending = () => s.pendingOutfitId || s.pendingLookId;
  const lookFor = (entry) => (entry && entry.lookId ? s.looks[entry.lookId] : null);

  function garmentsFor(outfit) {
    if (!outfit) return [];
    return outfit.garmentIds.map((id) => s.garments[id]).filter(Boolean);
  }

  function render() {
    root.replaceChildren();
    root.appendChild(
      el('div', { class: 'view-header' }, [
        el('h2', {}, 'Kalender'),
        el('button', { class: 'profil-btn', title: 'Einstellungen', onclick: () => goTo('einstellungen') }, [icon('user')]),
      ])
    );

    if (pending()) {
      root.appendChild(
        el('div', { class: 'hint' }, [
          (s.pendingLookId ? 'Look' : 'Outfit') + ' ausgewählt – klick auf einen Tag, um es einzuplanen. ',
          el('button', { class: 'link', onclick: () => { s.pendingOutfitId = null; s.pendingLookId = null; render(); } }, 'Abbrechen'),
        ])
      );
    }

    root.appendChild(
      el('div', { class: 'row cal-nav' }, [
        el('button', { onclick: () => shift(-1) }, '‹'),
        el('strong', {}, `${MONATE[s.month]} ${s.year}`),
        el('button', { onclick: () => shift(1) }, '›'),
      ])
    );

    const head = el('div', { class: 'cal-grid' });
    for (const w of WOCHENTAGE) head.appendChild(el('div', { class: 'cal-head' }, w));

    const first = new Date(s.year, s.month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(s.year, s.month + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) head.appendChild(el('div', { class: 'cal-cell empty' }));
    for (let d = 1; d <= daysInMonth; d++) head.appendChild(dayCell(d));
    root.appendChild(head);

    if (s.enlarged && s.entries[s.enlarged]) root.appendChild(enlargeOverlay());
  }

  function dayCell(d) {
    const date = isoDate(s.year, s.month, d);
    const entry = s.entries[date];
    const outfit = entry ? s.outfits[entry.outfitId] : null;
    const look = lookFor(entry);
    const cell = el('div', { class: 'cal-cell' + (pending() ? ' selectable' : '') });
    cell.appendChild(el('div', { class: 'cal-daynum' }, String(d)));

    if (outfit || look) {
      const inhalt = look
        ? el('img', { src: blobUrl(look.bild), class: 'cal-look', alt: '' })
        : (() => { const m = outfitTile(garmentsFor(outfit)); m.classList.add('mini'); return m; })();
      cell.appendChild(el('div', { class: 'cal-outfit' }, [inhalt]));
    }

    cell.addEventListener('click', () => {
      if (pending()) onDayClick(date);
      else if (outfit || look) { s.enlarged = date; render(); }
    });
    return cell;
  }

  function schliessen() {
    s.enlarged = null;
    s.editing = false;
    s.editSel = null;
    render();
  }

  function enlargeOverlay() {
    const entry = s.entries[s.enlarged];
    const outfit = entry ? s.outfits[entry.outfitId] : null;
    const look = lookFor(entry);
    const [y, m, d] = s.enlarged.split('-');
    const titel = `${Number(d)}. ${MONATE[Number(m) - 1]} ${y}`;

    const card = el('div', { class: 'overlay-card', onclick: (e) => e.stopPropagation() });
    card.appendChild(el('button', { class: 'overlay-close', title: 'Schließen', onclick: schliessen }, [icon('close')]));
    card.appendChild(el('div', { class: 'overlay-titel' }, titel));

    // Look: Foto groß + Löschen (kein Bearbeiten)
    if (look) {
      card.appendChild(el('img', { src: blobUrl(look.bild), class: 'look-big', alt: '' }));
      card.appendChild(
        el('div', { class: 'overlay-aktionen' }, [
          el('button', { class: 'with-icon danger-btn', onclick: () => loeschen() }, [icon('trash'), 'Löschen']),
        ])
      );
      return el('div', { class: 'overlay-backdrop', onclick: schliessen }, [card]);
    }

    if (!s.editing) {
      card.appendChild(outfitTile(garmentsFor(outfit), { big: true }));
      card.appendChild(
        el('div', { class: 'overlay-aktionen' }, [
          el('button', { class: 'with-icon', onclick: () => startEdit(outfit) }, [icon('edit'), 'Bearbeiten']),
          el('button', { class: 'with-icon danger-btn', onclick: () => loeschen() }, [icon('trash'), 'Löschen']),
        ])
      );
    } else {
      // Bearbeiten: Teile an-/abwählen
      card.appendChild(el('div', { class: 'muted small' }, 'Teile antippen zum Hinzufügen/Entfernen.'));
      const gallery = el('div', { class: 'pick-grid' });
      for (const g of Object.values(s.garments)) {
        const sel = s.editSel.has(g.id);
        gallery.appendChild(
          el('button', {
            class: 'pick-item' + (sel ? ' selected' : ''),
            title: g.name || '',
            onclick: () => { if (sel) s.editSel.delete(g.id); else s.editSel.add(g.id); render(); },
          }, [el('img', { src: blobUrl(g.bild), class: 'pick-img', alt: g.name || '' })])
        );
      }
      card.appendChild(gallery);
      const teile = [...s.editSel].map((id) => s.garments[id]).filter(Boolean);
      card.appendChild(outfitTile(teile, { big: true }));
      card.appendChild(
        el('div', { class: 'overlay-aktionen' }, [
          el('button', { class: 'primary', onclick: () => speichernEdit(outfit) }, '✔ Speichern'),
          el('button', { class: 'link', onclick: () => { s.editing = false; s.editSel = null; render(); } }, 'Abbrechen'),
        ])
      );
    }

    return el('div', { class: 'overlay-backdrop', onclick: schliessen }, [card]);
  }

  function startEdit(outfit) {
    s.editing = true;
    s.editSel = new Set(outfit ? outfit.garmentIds : []);
    render();
  }

  async function speichernEdit(outfit) {
    if (outfit) {
      await putOutfit({ ...outfit, garmentIds: [...s.editSel] });
    }
    s.editing = false;
    s.editSel = null;
    load();
  }

  async function loeschen() {
    await deleteCalendarEntry(s.enlarged);
    s.enlarged = null;
    s.editing = false;
    s.editSel = null;
    load();
  }

  async function onDayClick(date) {
    if (s.pendingLookId) {
      await putCalendarEntry({ date, lookId: s.pendingLookId });
      s.pendingLookId = null;
      load();
    } else if (s.pendingOutfitId) {
      await putCalendarEntry({ date, outfitId: s.pendingOutfitId });
      s.pendingOutfitId = null;
      load();
    }
  }

  function shift(delta) {
    s.month += delta;
    if (s.month < 0) { s.month = 11; s.year--; }
    if (s.month > 11) { s.month = 0; s.year++; }
    render();
  }

  load();
  return root;
}
