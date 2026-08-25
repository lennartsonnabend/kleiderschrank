// Feste Farbpalette (benannte Farben). Die automatische Erkennung ordnet die
// extrahierten Farben der nächstgelegenen Palettenfarbe zu; der Nutzer kann
// danach Farben entfernen oder ergänzen.
//
// Jede Farbe trägt HSV + neutral-Flag, damit die Outfit-Regel-Engine
// (Farbharmonie) unverändert weiterarbeitet.

import { rgbToHsv, istNeutral } from './colorExtract.js';

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// C(name, hex, opts) -> Farbobjekt
function C(name, hex, opts = {}) {
  if (opts.bunt) {
    return { name, hex: null, h: 0, s: 0, v: 0, neutral: false, bunt: true };
  }
  const [r, g, b] = hexToRgb(hex);
  const { h, s, v } = rgbToHsv(r, g, b);
  const neutral = opts.neutral !== undefined ? opts.neutral : istNeutral({ s, v });
  return { name, hex, h, s, v, neutral, bunt: false };
}

// Reihenfolge wie vom Nutzer vorgegeben. Hex-Werte sind Platzhalter/Repräsentanten
// und lassen sich später feinjustieren.
export const FARB_PALETTE = [
  C('Schwarz', '#1a1a1a', { neutral: true }),
  C('Grau', '#8a8a8a', { neutral: true }),
  C('Weiß', '#f7f7f7', { neutral: true }),
  C('Creme', '#f3ead0', { neutral: true }),
  C('Beige', '#d8c4a0', { neutral: true }),
  C('Aprikose', '#f4b183'),
  C('Orange', '#e8720c'),
  C('Korallenrot', '#ff6f61'),
  C('Rot', '#d81f26'),
  C('Burgunderrot', '#6b1f2a'),
  C('Pink', '#ff3d8b'),
  C('Rose', '#f4a6b8'),
  C('Lila', '#8a3ab0'),
  C('Flieder', '#c8a2d6'),
  C('Hellblau', '#8ecae6'),
  C('Blau', '#1f6fe0'),
  C('Marineblau', '#1b2a4a', { neutral: true }),
  C('Türkis', '#1ab5b0'),
  C('Mintgrün', '#a8e6c0'),
  C('Grün', '#2fa53a'),
  C('Dunkelgrün', '#14532d'),
  C('Khaki', '#7c7539'),
  C('Braun', '#6b4423'),
  C('Senffarben', '#d4a017'),
  C('Gelb', '#ffd400'),
  C('Silber', '#c0c0c0', { neutral: true }),
  C('Gold', '#d4af37', { neutral: true }),
  C('Bunt', '', { bunt: true }),
];

export function farbeByName(name) {
  const n = String(name).toLowerCase();
  return FARB_PALETTE.find((c) => c.name.toLowerCase() === n);
}

// Nächstgelegene Palettenfarbe zu einem Hex-Wert (einfache RGB-Distanz).
export function nearestFarbe(hex) {
  const [r, g, b] = hexToRgb(hex);
  let best = null;
  let bestD = Infinity;
  for (const c of FARB_PALETTE) {
    if (c.bunt || !c.hex) continue;
    const [cr, cg, cb] = hexToRgb(c.hex);
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}
