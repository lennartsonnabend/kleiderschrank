// Wiederverwendbares Tagging-Formular (Farben, Kategorie-Baum, Wetter+Regen,
// Anlass, Muster, Name). Genutzt beim Anlegen UND beim Bearbeiten.

import { el } from './helpers.js';
import { FARB_PALETTE } from './palette.js';
import { kategorieTree, grobkategorieFor } from './kategorien.js';
import { getGarderobe } from './settings.js';
import { icon } from './icons.js';

const WAERME_ICON = { 1: 'sun', 2: 'cloudSun', 3: 'snow' };

export const WAERME_STUFEN = [
  ['1', 'Warm'],
  ['2', 'Mild'],
  ['3', 'Kalt'],
];
export const FORMAL_STUFEN = [
  ['1', 'Freizeit'],
  ['2', 'Alltag'],
  ['3', 'Business/Formal'],
  ['4', 'Elegant/Chic'],
];
export const MUSTER_OPTIONEN = [
  ['einfarbig', 'einfarbig'],
  ['gestreift', 'gestreift'],
  ['kariert', 'kariert'],
  ['animalprint', 'Animalprint'],
  ['geblümt', 'geblümt'],
  ['gemustert', 'Sonstiges Muster'],
];
export const PASSFORM_STUFEN = [
  ['slim', 'Slim'],
  ['regular', 'Regular'],
  ['oversized', 'Oversized'],
];

export function emptyTagState() {
  return {
    colors: [], flyoutOpen: false,
    kategorie: null, kategoriePath: null, katFlyoutOpen: false, katExpanded: new Set(), gender: getGarderobe(),
    waerme: '', formalitaet: '', muster: '', passform: '', regentauglich: false,
    name: '', nameManual: false,
  };
}

// Formular-State aus einem gespeicherten Kleidungsstück vorbelegen
export function tagStateFromGarment(g) {
  const st = emptyTagState();
  st.colors = (g.farben || []).slice();
  st.kategorie = g.kategorie || null;
  st.kategoriePath = g.kategoriePfad || (g.kategorie ? [g.kategorie] : null);
  st.waerme = g.waerme ? String(g.waerme) : '';
  st.formalitaet = g.formalitaet ? String(g.formalitaet) : '';
  st.muster = g.muster || '';
  st.passform = g.passform || '';
  st.regentauglich = !!g.regentauglich;
  st.name = g.name || '';
  // Nur als "manuell" behandeln, wenn der Name NICHT dem Auto-Namen entspricht.
  // So aktualisiert sich ein Auto-Name beim Bearbeiten mit (z. B. Farbe ändern).
  st.nameManual = !!(g.name && g.name !== defaultName(st));
  return st;
}

// Sind alle Pflichtfelder ausgefüllt?
export function istVollstaendig(s) {
  return s.colors.length > 0 && !!s.kategorie && !!s.waerme && !!s.formalitaet && !!s.muster && !!s.passform;
}

// Generische Unterkategorien, die allein nicht aussagekräftig sind und den
// Oberbegriff im Namen brauchen (z. B. "Hemd, klassisch" statt nur "klassisch").
const GENERISCH = ['klassisch', 'kurzarm'];
function elternBegriff(parent) {
  const p = (parent || '').toLowerCase();
  if (p === 'hemden') return 'Hemd';
  if (p === 'pullover & sweater') return 'Pullover';
  return parent;
}
function kategorieName(path, leaf) {
  if (!leaf) return '';
  if (path && path.length >= 2 && GENERISCH.includes(leaf.toLowerCase())) {
    return `${elternBegriff(path[path.length - 2])}, ${leaf.toLowerCase()}`;
  }
  return leaf;
}

export function defaultName(s) {
  const catPart = kategorieName(s.kategoriePath, s.kategorie);
  const farbe = s.colors[0]?.name?.toLowerCase() || '';
  return [catPart, farbe].filter(Boolean).join(', ');
}

// Speicherbare Eigenschaften aus dem Formular-State
export function garmentPatch(s) {
  return {
    name: s.nameManual && s.name.trim() ? s.name.trim() : defaultName(s),
    kategorie: s.kategorie,
    kategoriePfad: s.kategoriePath,
    grobkategorie: grobkategorieFor(s.kategoriePath),
    farben: s.colors,
    waerme: s.waerme ? Number(s.waerme) : null,
    formalitaet: s.formalitaet ? Number(s.formalitaet) : null,
    muster: s.muster || null,
    passform: s.passform || null,
    regentauglich: s.regentauglich,
  };
}

// Rendert die Tag-Felder in `container` und verwaltet sein eigenes Re-Rendern.
// onChange (optional) wird nach jedem Render aufgerufen (z. B. für Pflichtfeld-Prüfung).
export function mountTagForm(container, s, onChange) {
  function render() {
    container.replaceChildren();

    let nameInput;
    const refreshName = () => { if (nameInput && !s.nameManual) nameInput.value = defaultName(s); };

    container.appendChild(buildColorEditor(refreshName));

    const box = el('div', { class: 'tagging' });
    box.appendChild(buildKategorieField());
    box.appendChild(buildWetterField());
    box.appendChild(feld('Für welchen Anlass?', chipSelect(FORMAL_STUFEN, () => s.formalitaet, (v) => { s.formalitaet = v; })));
    box.appendChild(feld('Muster', chipSelect(MUSTER_OPTIONEN, () => s.muster, (v) => { s.muster = v; })));
    box.appendChild(feld('Passform', chipSelect(PASSFORM_STUFEN, () => s.passform, (v) => { s.passform = v; })));
    container.appendChild(box);

    nameInput = el('input', {
      type: 'text', class: 'name-input', placeholder: 'Name des Kleidungsstücks',
      value: s.nameManual ? s.name : defaultName(s),
      oninput: (e) => { s.name = e.target.value; s.nameManual = true; },
    });
    container.appendChild(
      el('label', { class: 'field name-field' }, [
        el('span', { class: 'field-label' }, 'Name'),
        nameInput,
      ])
    );

    onChange?.();
  }

  function swatchEl(c, size = 'chip') {
    const base = { class: 'swatch ' + (size === 'tiny' ? 'tiny' : ''), title: c.name };
    base.style = c.bunt
      ? { background: 'conic-gradient(red, orange, yellow, green, blue, violet, red)' }
      : { background: c.hex };
    return el('span', base);
  }

  function buildColorEditor(refreshName) {
    const box = el('div', { class: 'colors' });
    box.appendChild(el('div', { class: 'field-label' }, 'Farben'));

    const chips = el('div', { class: 'color-chips' });
    const flyoutBtns = new Map();
    const isSelected = (c) => s.colors.some((x) => x.name === c.name);
    const markFlyout = (name, on) => { const b = flyoutBtns.get(name); if (b) b.classList.toggle('selected', on); };

    const renderChips = () => {
      chips.replaceChildren();
      for (const c of s.colors) {
        chips.appendChild(
          el('span', { class: 'color-chip' }, [
            el('button', {
              class: 'chip-main', type: 'button', title: 'Farbe ändern',
              onclick: () => { s.flyoutOpen = true; render(); },
            }, [swatchEl(c), el('span', { class: 'chip-name' }, c.name)]),
            el('button', { class: 'chip-x', title: 'entfernen', onclick: () => removeColor(c) }, '×'),
          ])
        );
      }
      chips.appendChild(
        el('button', { class: 'add-color', onclick: () => { s.flyoutOpen = !s.flyoutOpen; render(); } },
          s.flyoutOpen ? '✓ Fertig' : '+ Farbe')
      );
    };

    const toggleColor = (c) => {
      if (isSelected(c)) s.colors = s.colors.filter((x) => x.name !== c.name);
      else s.colors.push(c);
      markFlyout(c.name, isSelected(c));
      renderChips();
      refreshName?.();
      onChange?.();
    };
    const removeColor = (c) => {
      s.colors = s.colors.filter((x) => x.name !== c.name);
      markFlyout(c.name, false);
      renderChips();
      refreshName?.();
      onChange?.();
    };

    renderChips();
    box.appendChild(chips);

    if (s.flyoutOpen) {
      const fly = el('div', { class: 'flyout' });
      for (const c of FARB_PALETTE) {
        const btn = el('button', {
          class: 'flyout-item' + (isSelected(c) ? ' selected' : ''),
          onclick: () => toggleColor(c),
        }, [swatchEl(c, 'tiny'), el('span', {}, c.name)]);
        flyoutBtns.set(c.name, btn);
        fly.appendChild(btn);
      }
      box.appendChild(fly);
    }
    return box;
  }

  function buildWetterField() {
    const waermeOpts = WAERME_STUFEN.map(([v, l]) => [v, l, WAERME_ICON[v]]);
    const wrap = feld('Für welches Wetter?', chipSelect(waermeOpts, () => s.waerme, (v) => { s.waerme = v; }));
    // Regentauglich als Toggle-Chip
    const regen = el('button', {
      type: 'button',
      class: 'chip-choice' + (s.regentauglich ? ' active' : ''),
      onclick: (e) => { s.regentauglich = !s.regentauglich; e.currentTarget.classList.toggle('active', s.regentauglich); onChange?.(); },
    }, [icon('rain'), el('span', {}, 'regentauglich')]);
    wrap.appendChild(el('div', { class: 'chips regen-row' }, [regen]));
    return wrap;
  }

  // Moderne Auswahl-Chips statt Dropdown (Single-Select)
  function chipSelect(options, getVal, setVal) {
    const wrap = el('div', { class: 'chips' });
    const draw = () => {
      wrap.replaceChildren(...options.map(([val, label, ic]) =>
        el('button', {
          type: 'button',
          class: 'chip-choice' + (String(val) === String(getVal() ?? '') ? ' active' : ''),
          onclick: () => { setVal(val); draw(); onChange?.(); },
        }, ic ? [icon(ic), el('span', {}, label)] : [el('span', {}, label)])
      ));
    };
    draw();
    return wrap;
  }

  function feld(label, ...kinder) {
    return el('div', { class: 'field' }, [el('span', { class: 'field-label' }, label), ...kinder]);
  }

  function buildKategorieField() {
    const wrap = el('label', { class: 'field' }, [el('span', { class: 'field-label' }, 'Kategorie')]);
    const btn = el('button', {
      class: 'kat-select' + (s.kategorie ? '' : ' empty'), type: 'button',
      onclick: () => { s.katFlyoutOpen = !s.katFlyoutOpen; render(); },
    }, s.kategorie ? s.kategorie : '– Kategorie wählen –');
    wrap.appendChild(btn);

    if (s.katFlyoutOpen) {
      const fly = el('div', { class: 'flyout kat-flyout' });
      const tree = kategorieTree(s.gender);
      const renderNodes = (nodes, path, depth) => {
        for (const node of nodes) {
          const nodePath = [...path, node.label];
          const key = nodePath.join('>');
          const hasChildren = node.children && node.children.length;
          const selected = !hasChildren && s.kategoriePath && s.kategoriePath.join('>') === key;
          const row = el('button', {
            class: 'kat-item' + (selected ? ' selected' : '') + (hasChildren ? ' parent' : ''),
            type: 'button', style: { paddingLeft: 10 + depth * 16 + 'px' },
            onclick: hasChildren
              ? () => { if (s.katExpanded.has(key)) s.katExpanded.delete(key); else s.katExpanded.add(key); rebuild(); }
              : () => selectKategorie(nodePath),
          }, [
            el('span', { class: 'kat-caret' }, hasChildren ? (s.katExpanded.has(key) ? '▾' : '▸') : ''),
            el('span', {}, node.label),
          ]);
          fly.appendChild(row);
          if (hasChildren && s.katExpanded.has(key)) renderNodes(node.children, nodePath, depth + 1);
        }
      };
      const rebuild = () => { fly.replaceChildren(); renderNodes(tree, [], 0); };
      rebuild();
      wrap.appendChild(fly);
    }
    return wrap;
  }

  function selectKategorie(nodePath) {
    s.kategoriePath = nodePath;
    s.kategorie = nodePath[nodePath.length - 1];
    s.katFlyoutOpen = false;
    render();
  }

  function field(label, control) {
    return el('label', { class: 'field' }, [el('span', { class: 'field-label' }, label), control]);
  }

  function dropdown(options, value, onChange) {
    const opts = [['', '– wählen –'], ...options];
    const sel = el('select', { onchange: (e) => onChange(e.target.value) });
    for (const [val, label] of opts) {
      const o = el('option', { value: val }, label);
      if (String(val) === String(value ?? '')) o.selected = true;
      sel.appendChild(o);
    }
    return sel;
  }

  render();
}
