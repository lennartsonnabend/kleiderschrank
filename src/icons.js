// Klassische Linien-Icons (Inline-SVG, currentColor). Größe skaliert per font-size (1em).

import { el } from './helpers.js';

const SVG = {
  // Kleiderbügel (OOTD)
  hanger:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9V8c0-1 .8-1.6 1.6-2 .8-.4 1.4-1 1.4-1.9A2.5 2.5 0 0 0 12 2.5"/><path d="M12 9 4 14.7c-1 .7-.5 2.2.7 2.2h14.6c1.2 0 1.7-1.5.7-2.2L12 9Z"/></svg>',
  // Kleiderschrank
  wardrobe:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2.8" width="14" height="18.4" rx="1.4"/><line x1="12" y1="2.8" x2="12" y2="21.2"/><line x1="10.2" y1="10.5" x2="10.2" y2="13"/><line x1="13.8" y1="10.5" x2="13.8" y2="13"/></svg>',
  heart:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.3 4.7 13a4.6 4.6 0 0 1 6.5-6.5l.8.8.8-.8A4.6 4.6 0 0 1 19.3 13L12 20.3Z"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><line x1="3.5" y1="9.2" x2="20.5" y2="9.2"/><line x1="8" y1="2.8" x2="8" y2="6"/><line x1="16" y1="2.8" x2="16" y2="6"/></svg>',
  // Bearbeiten (Stift auf Quadrat)
  edit:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>',
  // Löschen (Mülleimer)
  trash:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  // Kamera
  camera:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.2l1.8-2.7h8l1.8 2.7H21a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="3.8"/></svg>',
  // Galerie (Bild)
  gallery:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2.2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 14.5 16 9.5 5 20.5"/></svg>',
  // Doppelpfeile (anderes Outfit / neu laden)
  refresh:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/></svg>',
  plus:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  scissors:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
  checkCircle:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  thumbsUp:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  info:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  // Profil / Einstellungen
  user:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20.5a8 8 0 0 1 16 0"/></svg>',
  back:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 5 8 12 15 19"/></svg>',
  // Wetter
  sun:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><line x1="12" y1="2.5" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="21.5"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="2.5" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="21.5" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>',
  cloudSun:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 6.5V5"/><path d="M3.4 8.4 2.4 7.4"/><path d="M11.6 8.4l1-1"/><path d="M2 12h1.4"/><path d="M9.8 12a2.8 2.8 0 1 0-5.5-.7"/><path d="M17.5 19H8a3.5 3.5 0 0 1-.3-7 5 5 0 0 1 9.6 1.2A3.3 3.3 0 0 1 17.5 19Z"/></svg>',
  cloud:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H7a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.4A3.6 3.6 0 0 1 17.5 19Z"/></svg>',
  fog:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 13H7a3.5 3.5 0 0 1-.4-7 5 5 0 0 1 9.5 1.3A3.2 3.2 0 0 1 16.5 13Z"/><line x1="5" y1="17" x2="19" y2="17"/><line x1="7" y1="20.5" x2="17" y2="20.5"/></svg>',
  rain:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 12.5H7a3.5 3.5 0 0 1-.4-7 5 5 0 0 1 9.5 1.3A3.2 3.2 0 0 1 16.5 12.5Z"/><line x1="8" y1="16" x2="7" y2="19"/><line x1="12" y1="16" x2="11" y2="19"/><line x1="16" y1="16" x2="15" y2="19"/></svg>',
  snow:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 12.5H7a3.5 3.5 0 0 1-.4-7 5 5 0 0 1 9.5 1.3A3.2 3.2 0 0 1 16.5 12.5Z"/><line x1="8" y1="17" x2="8" y2="17"/><line x1="12" y1="19" x2="12" y2="19"/><line x1="16" y1="17" x2="16" y2="17"/></svg>',
  thunder:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 11.5H7a3.5 3.5 0 0 1-.4-7 5 5 0 0 1 9.5 1.3A3.2 3.2 0 0 1 16.5 11.5Z"/><polyline points="12 14 10 17.5 13 17.5 11 21"/></svg>',
  // gefüllte Varianten (aktiver Tab / Favorit)
  heartFill:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"><path d="M12 20.3 4.7 13a4.6 4.6 0 0 1 6.5-6.5l.8.8.8-.8A4.6 4.6 0 0 1 19.3 13L12 20.3Z"/></svg>',
  hangerFill:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9V8c0-1 .8-1.6 1.6-2 .8-.4 1.4-1 1.4-1.9A2.5 2.5 0 0 0 12 2.5"/><path d="M12 9 4 14.7c-1 .7-.5 2.2.7 2.2h14.6c1.2 0 1.7-1.5.7-2.2L12 9Z" fill="currentColor" stroke="none"/></svg>',
  wardrobeFill:
    '<svg viewBox="0 0 24 24" width="1em" height="1em"><rect x="5" y="2.8" width="14" height="18.4" rx="1.6" fill="currentColor"/><g stroke="#fff" stroke-width="1.3" stroke-linecap="round"><line x1="12" y1="4.4" x2="12" y2="19.6"/><line x1="10.1" y1="10.6" x2="10.1" y2="13"/><line x1="13.9" y1="10.6" x2="13.9" y2="13"/></g></svg>',
  calendarFill:
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3.5" y="5.5" width="17" height="15" rx="2.2" stroke="none"/><line x1="8" y1="3" x2="8" y2="6.5"/><line x1="16" y1="3" x2="16" y2="6.5"/></svg>',
};

export function icon(name, cls = '') {
  return el('span', { class: 'icon' + (cls ? ' ' + cls : ''), html: SVG[name] || '' });
}
