// Outfit-Regelwerk v2 (deterministische Spezifikation, siehe outfit-regelwerk.md).
// 4 Item-Formalitätsstufen -> 3 tägliche Ausgabekategorien. Hard-Filter =
// bestehen/verwerfen, Scoring = feste Punktzahlen (max. 100).

import { grobkategorieFor } from './kategorien.js';

// --- Ausgabekategorien -> erlaubte Formalitätsstufen (Abschnitt 3) ---
export const OUTFIT_TYPEN = {
  FREIZEIT: { erlaubt: [1], label: 'Freizeit' },
  ALLTAG: { erlaubt: [2], label: 'Alltag' },
  CHIC: { erlaubt: [3, 4], label: 'Chic' },
};

// Gewichte (Abschnitt 7) – als Konstanten konfigurierbar
export const SCORE_MAX = { farbharmonie: 32, formalitaet: 24, muster: 22, wetter: 22 };

// Muster, die NICHT als auffällig gelten
const SCHLICHT = ['einfarbig', 'uni'];

// --- Farbfamilien (Abschnitt 4) ---
const FAMILIEN = [
  ['ROT', 0], ['ORANGE', 30], ['GELB', 60], ['GRUEN', 120],
  ['BLAU', 210], ['LILA', 270], ['ROSA', 330],
];
function hueDist(a, b) { let d = Math.abs(a - b) % 360; if (d > 180) d = 360 - d; return d; }
function famRep(name) { const f = FAMILIEN.find((x) => x[0] === name); return f ? f[1] : null; }

function hauptfarbe(g) { return g.farben && g.farben.length ? g.farben[0] : null; }
function famOf(color) {
  if (!color) return null;
  if (color.neutral) return 'NEUTRAL';
  if (color.bunt) return 'BUNT';
  let best = 'ROT', bd = 999;
  for (const [name, h] of FAMILIEN) { const d = hueDist(color.h, h); if (d < bd) { bd = d; best = name; } }
  return best;
}

// --- Kategorie -> SlotTyp (Abschnitt 2) ---
const SCHMUCK = ['ring', 'ohrringe', 'armband', 'armbanduhr', 'kette'];
function accSlot(leaf, path) {
  const p = (path || []).map((x) => x.toLowerCase());
  const has = (s) => p.includes(s);
  if (SCHMUCK.includes(leaf)) return 'ACCESSOIRE_SCHMUCK';
  if (leaf === 'gürtel') return 'ACCESSOIRE_GUERTEL';
  if (has('mützen & hüte') || ['beanie / mütze', 'cap', 'hut'].includes(leaf)) return 'ACCESSOIRE_KOPF';
  if (leaf === 'schal & tuch') return 'ACCESSOIRE_SCHAL';
  if (has('krawatte & fliege') || ['krawatte', 'fliege'].includes(leaf)) return 'ACCESSOIRE_KRAWATTE';
  if (has('taschen') || ['handtasche', 'umhängetasche', 'rucksack', 'aktentasche'].includes(leaf)) return 'ACCESSOIRE_TASCHE';
  return 'ACCESSOIRE_SONSTIGES'; // Sonnenbrille u. a.
}

export function slotTypFor(g) {
  const top = ((g.kategoriePfad && g.kategoriePfad[0]) || '').toLowerCase();
  const leaf = (g.kategorie || '').toLowerCase();
  // Sakko/Blazer & Anzugsweste zählen als Außenlage, nicht als Oberteil
  if (top === 'anzüge & blazer') return 'AUSSENLAGE';
  // Slot bevorzugt aus dem Pfad ableiten (grobkategorie kann veraltet/falsch sein)
  const grob = grobkategorieFor(g.kategoriePfad) || g.grobkategorie || '';
  switch (grob) {
    case 'schuhe': return 'SCHUHE';
    case 'einteiler': return 'GANZKOERPER';
    case 'unterteil': return 'UNTERTEIL';
    case 'jacke': case 'mantel': return 'AUSSENLAGE';
    case 'oberteil': return 'OBERTEIL';
    case 'accessoire': return accSlot(leaf, g.kategoriePfad);
    default: return 'OBERTEIL';
  }
}

// --- Item-Attribute ---
function formalOf(g) { return Number(g.formalitaet) || 0; }
function musterOf(g) { return g.muster || 'einfarbig'; }
// waerme: 1=Warm, 2=Mild, 3=Kalt -> Wetter-Set.
// Ein Wärmegrad deckt auch die benachbarte Wetterlage mit ab (mehr Vorschläge):
//   Warm  -> WARM + MILD
//   Mild  -> WARM + MILD + KALT
//   Kalt  -> KALT + MILD
function wetterOf(g) {
  if (Array.isArray(g.wetter)) return g.wetter;
  const map = { 1: ['WARM', 'MILD'], 2: ['WARM', 'MILD', 'KALT'], 3: ['KALT', 'MILD'] };
  return map[Number(g.waerme)] || ['WARM', 'MILD', 'KALT']; // untagged: überall tragbar
}

// Temperatur -> Tages-Wetter
export function wetterFromTemp(temp) {
  if (temp == null) return 'MILD';
  if (temp < 12) return 'KALT';
  if (temp < 20) return 'MILD';
  return 'WARM';
}

const KERN_SLOTS = ['OBERTEIL', 'UNTERTEIL', 'GANZKOERPER', 'SCHUHE'];
const FARB_SLOTS = ['OBERTEIL', 'UNTERTEIL', 'GANZKOERPER', 'SCHUHE', 'AUSSENLAGE'];

// ---------- Hard-Filter (Abschnitt 6) ----------
function anzahlAccessoireSlots(slots) {
  const c = (s) => slots.filter((x) => x === s).length;
  return (c('ACCESSOIRE_SCHMUCK') > 0 ? 1 : 0)
    + c('ACCESSOIRE_KOPF') + c('ACCESSOIRE_TASCHE') + c('ACCESSOIRE_GUERTEL')
    + c('ACCESSOIRE_SCHAL') + c('ACCESSOIRE_KRAWATTE') + c('ACCESSOIRE_SONSTIGES');
}
function hatPassendesOberteilOderBlazer(items) {
  return items.some((g) => {
    const slot = slotTypFor(g);
    const leaf = (g.kategorie || '').toLowerCase();
    if (slot === 'OBERTEIL' && /hemd|bluse/.test(leaf)) return true;
    if (slot === 'AUSSENLAGE' && ((g.kategoriePfad && (g.kategoriePfad[0] || '').toLowerCase() === 'anzüge & blazer') || /sakko|blazer/.test(leaf))) return true;
    return false;
  });
}

export function istGueltig(items, tagesWetter, zielTyp, wetterFilter = true) {
  const slots = items.map(slotTypFor);
  const has = (s) => slots.includes(s);
  const cnt = (s) => slots.filter((x) => x === s).length;
  const hatGanz = has('GANZKOERPER');

  // 6.1 Pflichtslots
  if (!((has('OBERTEIL') && has('UNTERTEIL')) || hatGanz)) return false;
  if (cnt('SCHUHE') !== 1) return false;
  if (hatGanz && (has('OBERTEIL') || has('UNTERTEIL'))) return false;

  // 6.2 Wetter (optional abschaltbar über die Einstellungen)
  if (wetterFilter) {
    for (const g of items) { if (!wetterOf(g).includes(tagesWetter)) return false; }
    if (tagesWetter === 'KALT' && !has('AUSSENLAGE')) return false;
  }

  // 6.3 Formalität (mit Joker-Regel). Schuhe dürfen generell ±1 Stufe abweichen.
  const erlaubt = OUTFIT_TYPEN[zielTyp].erlaubt;
  for (const g of items) {
    const f = formalOf(g);
    if (erlaubt.includes(f)) continue;
    const abstand = Math.min(...erlaubt.map((e) => Math.abs(f - e)));
    const schuhKulanz = slotTypFor(g) === 'SCHUHE'; // Schuhe: ±1 immer erlaubt
    if (abstand === 1 && (schuhKulanz || g.istJoker)) continue;
    return false;
  }

  // 6.4 Slot-Limits
  if (cnt('ACCESSOIRE_KOPF') > 1) return false;
  if (cnt('ACCESSOIRE_TASCHE') > 1) return false;
  if (cnt('ACCESSOIRE_GUERTEL') > 1) return false;
  if (cnt('ACCESSOIRE_SCHMUCK') > 3) return false;
  if (anzahlAccessoireSlots(slots) > 3) return false;
  if (has('ACCESSOIRE_KRAWATTE') && !hatPassendesOberteilOderBlazer(items)) return false;

  return true;
}

// ---------- Scoring (Abschnitt 7) ----------
function farbHarmonie(items) {
  const fams = [];
  for (const g of items) {
    if (!FARB_SLOTS.includes(slotTypFor(g))) continue;
    const f = famOf(hauptfarbe(g));
    if (f && f !== 'NEUTRAL') fams.push(f);
  }
  const distinct = [...new Set(fams)];
  if (distinct.length === 0) return 32;
  if (distinct.length === 1) return 30;
  if (distinct.length === 2) {
    const [a, b] = distinct;
    if (a === 'BUNT' || b === 'BUNT') return 12;
    const d = hueDist(famRep(a), famRep(b));
    if (d <= 40) return 27;
    if (d >= 150 && d <= 210) return 25;
    return 12;
  }
  return 0;
}

function formalScore(items, erlaubt) {
  const jokerCount = items.filter((g) => g.istJoker && !erlaubt.includes(formalOf(g))).length;
  const stufen = [...new Set(items.map(formalOf))];
  if (jokerCount === 0 && stufen.length === 1) return 24;
  if (jokerCount === 0) return 20; // z. B. CHIC mit Mix aus Stufe 3 & 4
  if (jokerCount === 1) return 14;
  return 8;
}

function musterScore(items) {
  const gem = items.filter((g) => !SCHLICHT.includes(musterOf(g)));
  if (gem.length === 0) return 22;
  if (gem.length === 1) return 19;
  if (gem.length === 2) return new Set(gem.map(musterOf)).size === 2 ? 10 : 3;
  return 0;
}

function wetterScore(items, tagesWetter) {
  const hatAussen = items.some((g) => slotTypFor(g) === 'AUSSENLAGE');
  if (tagesWetter === 'KALT') return 22;      // Außenlage per Hard-Filter Pflicht
  if (tagesWetter === 'MILD') return hatAussen ? 22 : 16;
  return 22;                                   // WARM
}

export function berechneScore(items, tagesWetter, zielTyp) {
  const erlaubt = OUTFIT_TYPEN[zielTyp].erlaubt;
  const farbharmonie = farbHarmonie(items);
  const formalitaet = formalScore(items, erlaubt);
  const muster = musterScore(items);
  const wetter = wetterScore(items, tagesWetter);
  return {
    score: farbharmonie + formalitaet + muster + wetter,
    details: { farbharmonie, formalitaet, muster, wetter },
  };
}

// ---------- Kombinationen (Abschnitt 8) ----------
// Basis-Sets (Ober+Unter ODER Ganzkörper) + Schuhe + 0–1 Außenlage.
// Accessoires werden ausgelassen: sie können den Score nie erhöhen (Farbe der
// Accessoires zählt nicht, Formalität/Muster können ihn nur senken).
function erzeugeBasisKombinationen(items) {
  const bySlot = {};
  for (const g of items) { const s = slotTypFor(g); (bySlot[s] || (bySlot[s] = [])).push(g); }
  const ober = bySlot.OBERTEIL || [], unter = bySlot.UNTERTEIL || [];
  const ganz = bySlot.GANZKOERPER || [], schuhe = bySlot.SCHUHE || [], aussen = bySlot.AUSSENLAGE || [];

  const basis = [];
  for (const o of ober) for (const u of unter) basis.push([o, u]);
  for (const g of ganz) basis.push([g]);

  const komb = [];
  for (const b of basis) {
    for (const s of schuhe) {
      komb.push([...b, s]);
      for (const a of aussen) komb.push([...b, s, a]);
    }
  }
  return komb;
}

// ---------- Diversität (Abschnitt 9) ----------
const sig = (o) => o.garmentIds.slice().sort().join('|');
function coreSig(items) {
  return items.filter((g) => KERN_SLOTS.includes(slotTypFor(g))).map((g) => g.id).sort().join('|');
}
function wendeDiversitaet(sortierte, usage) {
  const ausgewaehlt = [];
  for (const kand of sortierte) {
    if (ausgewaehlt.length === 3) break;
    const maxNutzung = Math.max(0, ...kand.teile.map((g) => usage[g.id] || 0));
    if (maxNutzung >= 2) continue; // Item käme zum 3. Mal am Tag -> überspringen
    if (ausgewaehlt.length >= 1) {
      const core = coreSig(kand.teile);
      if (ausgewaehlt.some((a) => coreSig(a.teile) === core)) continue;
    }
    ausgewaehlt.push(kand);
    for (const g of kand.teile) usage[g.id] = (usage[g.id] || 0) + 1;
  }
  return ausgewaehlt;
}

// ---------- Gesamt-Algorithmus (Abschnitt 8) ----------
// Rückgabe: { FREIZEIT:{top,alle}, ALLTAG:{top,alle}, CHIC:{top,alle} }
export function generiereTagesOutfits(garments, tagesWetter, opts = {}) {
  const wetterFilter = opts.wetterFilter !== false;
  const kombis = erzeugeBasisKombinationen(garments);
  const usage = {};
  const ergebnis = {};
  for (const zielTyp of ['FREIZEIT', 'ALLTAG', 'CHIC']) {
    const valid = [];
    for (const teile of kombis) {
      if (!istGueltig(teile, tagesWetter, zielTyp, wetterFilter)) continue;
      const { score, details } = berechneScore(teile, tagesWetter, zielTyp);
      valid.push({ teile, garmentIds: teile.map((g) => g.id), score, scoreDetails: details, outfitTyp: zielTyp });
    }
    valid.sort((a, b) => b.score - a.score);
    ergebnis[zielTyp] = { top: wendeDiversitaet(valid, usage), alle: valid };
  }
  return ergebnis;
}

// Welche Basiskategorien fehlen im Schrank ganz? (für Hinweis-Text)
export function fehlendeBasics(garments) {
  const slots = garments.map(slotTypFor);
  const has = (s) => slots.includes(s);
  const fehlt = [];
  if (!has('GANZKOERPER')) {
    if (!has('OBERTEIL')) fehlt.push('Oberteil');
    if (!has('UNTERTEIL')) fehlt.push('Unterteil');
  }
  if (!has('SCHUHE')) fehlt.push('Schuhe');
  return fehlt;
}

// ---------- Bewertung für den manuellen Builder ----------
// Nutzt dieselben Teil-Scores, aber ohne Wetter-Hard-Filter (der Nutzer stellt
// frei zusammen) und leitet den Anlass aus den gewählten Stufen ab.
export function bewerteOutfitDetail(items) {
  const has = (s) => items.some((g) => slotTypFor(g) === s);
  const hatGanz = has('GANZKOERPER');
  const hinweise = [];
  const fehlt = [];
  if (!hatGanz) {
    if (!has('OBERTEIL')) fehlt.push('ein Oberteil');
    if (!has('UNTERTEIL')) fehlt.push('ein Unterteil (Hose/Rock)');
  }
  if (!has('SCHUHE')) fehlt.push('Schuhe');
  const ganzKonflikt = hatGanz && (has('OBERTEIL') || has('UNTERTEIL'));
  if (fehlt.length) hinweise.push('Es fehlt noch: ' + fehlt.join(', ') + '.');
  if (ganzKonflikt) hinweise.push('Ein Kleid/Jumpsuit ersetzt Ober- und Unterteil – kombiniere es nicht zusätzlich.');

  const stufen = [...new Set(items.map(formalOf).filter(Boolean))];
  const farbharmonie = farbHarmonie(items);
  const muster = musterScore(items);
  // Formalität: gleiche Stufe = 24, CHIC-Mix (3&4) = 20, sonst nach Spannweite
  let formalitaet;
  if (stufen.length <= 1) formalitaet = 24;
  else if (stufen.every((s) => s >= 3)) formalitaet = 20;
  else formalitaet = (Math.max(...stufen) - Math.min(...stufen) <= 1) ? 14 : 8;
  // Wetter: Konsistenz der Wärmegrade
  const waermen = [...new Set(items.map((g) => Number(g.waerme)).filter(Boolean))];
  const wetter = waermen.length <= 1 ? 22 : 12;
  const score = farbharmonie + formalitaet + muster + wetter;

  if (items.length >= 2 && farbharmonie <= 12) {
    hinweise.push('Die Farben harmonieren nicht ideal – neutrale Töne (Schwarz, Weiß, Grau, Beige, Marineblau) lassen sich leichter kombinieren.');
  }
  const gemCount = items.filter((g) => !SCHLICHT.includes(musterOf(g))).length;
  if (gemCount >= 2) hinweise.push('Mehrere Muster wirken unruhig – kombiniere höchstens ein auffälliges Muster.');
  if (stufen.length > 1 && (Math.max(...stufen) - Math.min(...stufen)) >= 2) {
    hinweise.push('Die Teile passen vom Anlass her nicht zusammen (z. B. sportlich mit festlich).');
  }
  if (waermen.length > 1) hinweise.push('Die Teile sind für unterschiedliches Wetter gedacht.');

  let verdikt;
  if (fehlt.length || ganzKonflikt) verdikt = 'unvollständig';
  else if (score >= 82 && farbharmonie >= 27) verdikt = 'gut';
  else if (score >= 64) verdikt = 'ok';
  else verdikt = 'kritisch';

  return { score, verdikt, hinweise };
}
