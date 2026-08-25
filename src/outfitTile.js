// Wiederverwendbare Outfit-Kachel als 2-spaltige Collage (Vorlage-Layout):
//   links  (groß):  Oberteile / Kleider, darunter Unterteile   – die Hauptteile
//   rechts (klein): Jacken & Mäntel, Accessoires, Schuhe        – die Extras
// Mehrere Teile einer Sorte werden in ihrer Spalte gestapelt.

import { el, blobUrl } from './helpers.js';

export function outfitTile(garments, opts = {}) {
  const grob = (g) => g.grobkategorie || g.kategorie;
  const pick = (...cats) => garments.filter((g) => cats.includes(grob(g)));

  const links = [...pick('oberteil', 'einteiler'), ...pick('unterteil')];
  const rechts = [...pick('jacke', 'mantel'), ...pick('accessoire'), ...pick('schuhe')];

  const tile = el('div', { class: 'outfit-tile' + (opts.big ? ' big' : '') });

  const spalte = (items, cls) =>
    el('div', { class: 'tile-col ' + cls },
      items.map((g) =>
        el('img', { src: blobUrl(g.bild), class: 'tile-img', alt: g.name || '', title: g.name || '' })
      )
    );

  if (links.length) tile.appendChild(spalte(links, 'main'));
  if (rechts.length) tile.appendChild(spalte(rechts, 'side'));
  if (!links.length && !rechts.length) {
    tile.appendChild(el('div', { class: 'muted small' }, 'leeres Outfit'));
  }
  return tile;
}
