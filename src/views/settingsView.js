// Einstellungen: Garderobe ändern + weitere App-Optionen.
// Erreichbar über das Profil-Icon in der Kalender-Ansicht.

import { el } from '../helpers.js';
import { icon } from '../icons.js';
import {
  getGarderobe, getGarderobeLabel, setGarderobe,
  getTempUnit, setTempUnit,
  getShowWeather, setShowWeather,
  getWetterVorschlaege, setWetterVorschlaege,
  setOnboarded,
} from '../settings.js';

const GARDEROBE_OPT = [
  ['Herrengarderobe', 'male'],
  ['Damengarderobe', 'female'],
  ['Gemischt', 'female'],
];

export function settingsView(rerender, goTo) {
  const root = el('div', { class: 'view' });

  function render() {
    root.replaceChildren();

    root.appendChild(
      el('div', { class: 'view-header' }, [
        el('button', { class: 'profil-btn back', title: 'Zurück', onclick: () => goTo('kalender') }, [icon('back')]),
        el('h2', {}, 'Einstellungen'),
        el('span', { class: 'profil-spacer' }),
      ])
    );

    // --- Kleiderschrank ---
    const aktLabel = getGarderobeLabel() || (getGarderobe() === 'male' ? 'Herrengarderobe' : 'Damengarderobe');
    root.appendChild(sektion('Kleiderschrank', [
      settingRow('Garderobe', 'Bestimmt die verfügbaren Kategorien.',
        segmented(GARDEROBE_OPT.map(([l]) => l), aktLabel, (label) => {
          const opt = GARDEROBE_OPT.find(([l]) => l === label);
          setGarderobe(opt[1], opt[0]);
          render();
        }), true),
    ]));

    // --- Startseite / Vorschläge ---
    root.appendChild(sektion('Startseite & Vorschläge', [
      settingRow('Wetter anzeigen', 'Wetter-Kachel auf der OOTD-Startseite.',
        toggle(getShowWeather(), (v) => setShowWeather(v))),
      settingRow('Wetterbasierte Vorschläge', 'Outfits passend zum heutigen Wetter filtern.',
        toggle(getWetterVorschlaege(), (v) => setWetterVorschlaege(v))),
      settingRow('Temperatureinheit', null,
        segmented([['°C', 'C'], ['°F', 'F']].map(([l]) => l), getTempUnit() === 'F' ? '°F' : '°C',
          (label) => { setTempUnit(label === '°F' ? 'F' : 'C'); render(); })),
    ]));

    // --- Sonstiges ---
    root.appendChild(sektion('Sonstiges', [
      el('button', { class: 'set-action', onclick: () => { setOnboarded(false); rerender(); } },
        [icon('refresh'), 'Einführung erneut ansehen']),
    ]));

    root.appendChild(el('p', { class: 'muted small set-fuss' }, 'Alle Daten bleiben lokal auf deinem Gerät.'));
  }

  // ---- Bausteine ----
  function sektion(titel, rows) {
    return el('div', { class: 'set-section' }, [
      el('div', { class: 'set-section-titel' }, titel),
      el('div', { class: 'set-card' }, rows),
    ]);
  }

  function settingRow(label, hint, control, vertikal = false) {
    return el('div', { class: 'set-row' + (vertikal ? ' vertikal' : '') }, [
      el('div', { class: 'set-info' }, [
        el('span', { class: 'set-label' }, label),
        hint ? el('span', { class: 'set-hint muted small' }, hint) : null,
      ].filter(Boolean)),
      control,
    ]);
  }

  function segmented(labels, active, onSelect) {
    return el('div', { class: 'seg' }, labels.map((l) =>
      el('button', { class: 'seg-item' + (l === active ? ' active' : ''), onclick: () => onSelect(l) }, l)
    ));
  }

  function toggle(value, onChange) {
    const cb = el('input', { type: 'checkbox', onchange: (e) => onChange(e.target.checked) });
    cb.checked = value;
    return el('label', { class: 'switch' }, [cb, el('span', { class: 'switch-track' }, [el('span', { class: 'switch-thumb' })])]);
  }

  render();
  return root;
}
