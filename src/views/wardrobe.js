// Ansicht: Kleiderschrank – Chip-Filter, Karten (Bild + Name), Bearbeiten im Popup.

import { el, blobUrl } from '../helpers.js';
import { getAllGarments, putGarment, deleteGarment } from '../db.js';
import { KATEGORIE_TREE_FEMALE, KATEGORIE_TREE_MALE } from '../kategorien.js';
import { icon } from '../icons.js';
import { mountTagForm, tagStateFromGarment, garmentPatch, istVollstaendig } from '../tagForm.js';

const TOP_ORDER = KATEGORIE_TREE_FEMALE.map((n) => n.label);
const cap = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Kanonische (korrekt großgeschriebene) Oberkategorie-Labels aus dem Baum.
// Altbestand mit kleingeschriebenen Pfaden wird darüber normalisiert.
const TOP_CANON = {};
for (const n of [...KATEGORIE_TREE_FEMALE, ...KATEGORIE_TREE_MALE]) TOP_CANON[n.label.toLowerCase()] = n.label;

function topLevelOf(g) {
  const raw = (g.kategoriePfad && g.kategoriePfad[0]) || g.grobkategorie || g.kategorie || 'sonstige';
  return TOP_CANON[raw.toLowerCase()] || cap(raw);
}

export function wardrobeView(rerender, goTo) {
  const root = el('div', { class: 'view' });
  root.appendChild(el('h2', {}, 'Mein Kleiderschrank'));

  const pillBar = el('div', { class: 'pill-bar scroll' });
  const grid = el('div', { class: 'pick-grid' });
  const modalHost = el('div');
  root.appendChild(pillBar);
  root.appendChild(grid);
  root.appendChild(el('div', { class: 'fab-spacer' }));
  root.appendChild(el('button', { class: 'fab with-icon', onclick: () => goTo('hinzufuegen') }, [icon('plus'), 'Hinzufügen']));
  root.appendChild(modalHost);

  let filter = 'alles';
  let garments = [];

  async function load() {
    garments = await getAllGarments();
    renderPills();
    renderGrid();
  }

  function renderPills() {
    pillBar.replaceChildren();
    if (!garments.length) return;
    const vorhanden = [...new Set(garments.map(topLevelOf))];
    vorhanden.sort((a, b) => {
      const ia = TOP_ORDER.indexOf(a);
      const ib = TOP_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    for (const p of ['alles', ...vorhanden]) {
      pillBar.appendChild(
        el('button', {
          class: 'pill' + (filter === p ? ' active' : ''),
          onclick: () => { filter = (filter === p && p !== 'alles') ? 'alles' : p; renderPills(); renderGrid(); },
        }, p === 'alles' ? 'Alles' : p)
      );
    }
  }

  function renderGrid() {
    grid.replaceChildren();
    if (!garments.length) {
      grid.appendChild(
        el('p', { class: 'muted' }, [
          'Noch keine Kleidungsstücke. ',
          el('a', { href: '#', onclick: (e) => (e.preventDefault(), goTo('hinzufuegen')) }, 'Jetzt eins hinzufügen →'),
        ])
      );
      return;
    }
    const sichtbar = filter === 'alles' ? garments : garments.filter((g) => topLevelOf(g) === filter);
    for (const g of sichtbar) grid.appendChild(thumb(g));
  }

  function thumb(g) {
    return el('button', {
      class: 'pick-item', title: g.name || '',
      onclick: () => showDetail(g),
    }, [el('img', { src: blobUrl(g.bild), class: 'pick-img', alt: g.name || '' })]);
  }

  // Detail-Overlay beim Antippen (wie das Kalender-Popup): Bild + Bearbeiten/Löschen + ×
  function showDetail(g) {
    const card = el('div', { class: 'overlay-card', onclick: (e) => e.stopPropagation() }, [
      el('button', { class: 'overlay-close', title: 'Schließen', onclick: closeModal }, [icon('close')]),
      el('div', { class: 'overlay-titel' }, g.name || 'Kleidungsstück'),
      el('img', { src: blobUrl(g.bild), class: 'detail-img', alt: g.name || '' }),
      el('div', { class: 'overlay-aktionen' }, [
        el('button', { class: 'with-icon', onclick: () => openEdit(g) }, [icon('edit'), 'Bearbeiten']),
        el('button', { class: 'with-icon danger-btn', onclick: () => remove(g) }, [icon('trash'), 'Löschen']),
      ]),
    ]);
    modalHost.replaceChildren(el('div', { class: 'overlay-backdrop', onclick: closeModal }, [card]));
  }

  // Bearbeiten-Popup: gleiches Formular wie beim Anlegen, mit vorbelegten Werten
  function openEdit(g) {
    const st = tagStateFromGarment(g);
    const formHost = el('div', { class: 'tagform' });

    const saveBtn = el('button', {
      class: 'primary with-icon',
      onclick: async () => { await putGarment({ ...g, ...garmentPatch(st) }); closeModal(); load(); },
    }, [icon('check'), 'Speichern']);
    const updateSave = () => { saveBtn.disabled = !istVollstaendig(st); };

    const modalCard = el('div', { class: 'overlay-card edit-modal', onclick: (e) => e.stopPropagation() }, [
      el('button', { class: 'overlay-close', title: 'Schließen', onclick: closeModal }, [icon('close')]),
      el('div', { class: 'overlay-titel' }, 'Kleidungsstück bearbeiten'),
      el('div', { class: 'preview' }, [el('img', { src: blobUrl(g.bild), class: 'preview-img', alt: g.name || '' })]),
      formHost,
      el('div', { class: 'row' }, [saveBtn, el('button', { onclick: closeModal }, 'Abbrechen')]),
    ]);
    mountTagForm(formHost, st, updateSave);
    updateSave();

    modalHost.replaceChildren(
      el('div', { class: 'overlay-backdrop', onclick: closeModal }, [modalCard])
    );
  }

  function closeModal() {
    modalHost.replaceChildren();
  }

  async function remove(g) {
    const name = g.name || 'dieses Kleidungsstück';
    if (!confirm(`Möchten Sie „${name}" wirklich löschen?`)) return;
    await deleteGarment(g.id);
    closeModal();
    load();
  }

  load();
  return root;
}
