import './style.css';
import { el, clear, revokeAllUrls } from './helpers.js';
import { wardrobeView } from './views/wardrobe.js';
import { addItemView } from './views/addItem.js';
import { outfitsView } from './views/outfits.js';
import { calendarView } from './views/calendarView.js';
import { ootdView } from './views/ootd.js';
import { settingsView } from './views/settingsView.js';
import { onboardingView } from './views/onboarding.js';
import { istOnboarded } from './settings.js';
import { enableDragScroll } from './dragScroll.js';
import { icon } from './icons.js';

const app = document.getElementById('app');
enableDragScroll(app); // Ziehen mit der Maus scrollt (Desktop)

// "hinzufuegen" ist bewusst NICHT in der Leiste – erreichbar über den
// festverankerten Button im Schrank.
const TABS = [
  { id: 'ootd', label: 'OOTD', icon: 'hanger', iconFill: 'hangerFill' },
  { id: 'schrank', label: 'Schrank', icon: 'wardrobe', iconFill: 'wardrobeFill' },
  { id: 'outfits', label: 'Outfits', icon: 'heart', iconFill: 'heartFill' },
  { id: 'kalender', label: 'Kalender', icon: 'calendar', iconFill: 'calendarFill' },
];

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
        el('span', { class: 'tab-label' }, t.label),
      ])
    )
  );
  app.appendChild(tabbar);
}

render();
