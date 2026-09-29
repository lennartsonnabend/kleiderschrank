import './style.css';
import { el, clear, revokeAllUrls } from './helpers.js';
import { wardrobeView } from './views/wardrobe.js';
import { addItemView } from './views/addItem.js';
import { outfitsView } from './views/outfits.js';
import { calendarView } from './views/calendarView.js';
import { ootdView } from './views/ootd.js';
import { settingsView } from './views/settingsView.js';
import { onboardingView } from './views/onboarding.js';
import { istOnboarded, getLang, setLang } from './settings.js';
import { enableDragScroll } from './dragScroll.js';
import { icon } from './icons.js';
import { t as tr } from './i18n.js';

const app = document.getElementById('app');
enableDragScroll(app); // Ziehen mit der Maus scrollt (Desktop)
// Steuerung ausserhalb des Geraets (oben rechts): Wiki + Sprachwechsel
const langBtn = makeLangButton();
document.body.appendChild(el('div', { class: 'app-controls' }, [makeWikiButton(), langBtn]));

// "hinzufuegen" ist bewusst NICHT in der Leiste – erreichbar über den
// festverankerten Button im Schrank.
const TABS = [
  { id: 'ootd', label: 'OOTD', icon: 'hanger', iconFill: 'hangerFill' },
  { id: 'schrank', label: 'Schrank', icon: 'wardrobe', iconFill: 'wardrobeFill' },
  { id: 'outfits', label: 'Outfits', icon: 'heart', iconFill: 'heartFill' },
  { id: 'kalender', label: 'Kalender', icon: 'calendar', iconFill: 'calendarFill' },
];
// 'OOTD'/'Outfits' bleiben in beiden Sprachen gleich – kein t() nötig.

let current = 'ootd';

// goTo erlaubt Views, zwischen Tabs zu wechseln und Parameter mitzugeben
function goTo(tab, params = {}) {
  current = tab;
  render(params);
}

function render(params = {}) {
  revokeAllUrls(); // alte Object-URLs freigeben
  clear(app);

  // Erstnutzung: Onboarding zeigen (ohne Tab-Leiste), bis abgeschlossen
  if (!istOnboarded()) {
    app.setAttribute('data-screen', 'ootd');
    app.appendChild(onboardingView(() => { current = 'ootd'; render(); }));
    return;
  }

  // pro Screen ein Attribut -> anderes Linien-Hintergrundmuster (siehe CSS)
  const screenAlias = { hinzufuegen: 'schrank', einstellungen: 'kalender' };
  app.setAttribute('data-screen', screenAlias[current] || current);

  const main = el('main', { class: 'app-main' });
  app.appendChild(main);

  let view;
  if (current === 'ootd') view = ootdView(render, goTo);
  else if (current === 'schrank') view = wardrobeView(render, goTo);
  else if (current === 'hinzufuegen') view = addItemView(render, goTo);
  else if (current === 'outfits') view = outfitsView(render, goTo);
  else if (current === 'kalender') view = calendarView(render, goTo, params);
  else if (current === 'einstellungen') view = settingsView(render, goTo);
  main.appendChild(view);

  // Untere Tab-Leiste (Mobile-App-Stil). "hinzufuegen" bleibt bewusst außen vor.
  const highlight = screenAlias[current] || current;
  const tabbar = el('nav', { class: 'tab-bar' },
    TABS.map((t) =>
      el('button', {
        class: 'tab-item' + (t.id === highlight ? ' active' : ''),
        onclick: () => goTo(t.id),
      }, [
        icon(t.id === highlight ? t.iconFill : t.icon, 'tab-icon'),
        el('span', { class: 'tab-label' }, tr(t.label)),
      ])
    )
  );
  app.appendChild(tabbar);
}

// Wiki-/Info-Button oben rechts: kurzes Erklaer-Popup
function makeWikiButton() {
  return el('button', { class: 'wiki-btn', title: tr('Wie funktioniert die App?'), onclick: showWiki }, [icon('info'), el('span', {}, 'Wiki')]);
}

// Sprach-Button rechts neben Wiki: zeigt die AKTUELLE Sprache als Flagge,
// Klick schaltet zwischen Deutsch und Englisch um und rendert neu.
function makeLangButton() {
  const b = el('button', { class: 'lang-btn', title: 'Deutsch / English', onclick: toggleLang });
  paintLang(b);
  return b;
}

function paintLang(b) {
  b.replaceChildren(icon(getLang() === 'en' ? 'flagEN' : 'flagDE'));
}

function toggleLang() {
  setLang(getLang() === 'en' ? 'de' : 'en');
  paintLang(langBtn);
  render();
}

function showWiki() {
  closeWiki();
  const card = el('div', { class: 'overlay-card wiki-card', onclick: (e) => e.stopPropagation() }, [
    el('button', { class: 'overlay-close', title: tr('Schließen'), onclick: closeWiki }, [icon('close')]),
    el('div', { class: 'overlay-titel' }, tr('Wie funktioniert die App?')),
    el('p', {}, [el('b', {}, tr('Kleiderschrank füllen: ')), tr('Kleidung fotografieren, freistellen lassen und danach Kategorie, Farben, Wetter, Anlass, Muster und Passform festlegen.')]),
    el('p', {}, [el('b', {}, tr('Vorschläge: ')), tr('Die App stellt täglich Outfits zusammen – nach Anlass (Alltag, Chic, Freizeit) und passend zum Wetter (Temperatur und Regen).')]),
    el('p', {}, [el('b', {}, tr('Merken und planen: ')), tr('Outfits favorisieren, eigene Looks hochladen und einzelnen Tagen im Kalender zuordnen.')]),
    el('p', {}, [el('b', {}, tr('Daten: ')), tr('Alle Daten bleiben lokal im Browser gespeichert. Lediglich der Standort kann für regengerechte Outfits abgerufen werden.')]),
  ]);
  const backdrop = el('div', { class: 'overlay-backdrop', onclick: closeWiki }, [card]);
  backdrop.id = 'wiki-overlay';
  document.body.appendChild(backdrop);
}

function closeWiki() {
  const o = document.getElementById('wiki-overlay');
  if (o) o.remove();
}

render();
