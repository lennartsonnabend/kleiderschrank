// Lokale Einstellungen (localStorage): Garderobe-Präferenz & Onboarding-Status.

const KEY_GARDEROBE = 'ks-garderobe';   // 'male' | 'female' (Baum-Variante)
const KEY_LABEL = 'ks-garderobe-label'; // Anzeige: 'Herrengarderobe' | 'Damengarderobe' | 'Gemischt'
const KEY_ONBOARD = 'ks-onboarded';
const KEY_TEMP = 'ks-temp-unit';        // 'C' | 'F'
const KEY_SHOW_WEATHER = 'ks-show-weather';
const KEY_WETTER_VORSCHLAEGE = 'ks-wetter-vorschlaege';

function getBool(key, def) {
  try { const v = localStorage.getItem(key); return v === null ? def : v === '1'; } catch { return def; }
}
function setBool(key, v) { try { localStorage.setItem(key, v ? '1' : '0'); } catch { /* ignore */ } }

export function getTempUnit() { try { return localStorage.getItem(KEY_TEMP) || 'C'; } catch { return 'C'; } }
export function setTempUnit(v) { try { localStorage.setItem(KEY_TEMP, v); } catch { /* ignore */ } }

export function getShowWeather() { return getBool(KEY_SHOW_WEATHER, true); }
export function setShowWeather(v) { setBool(KEY_SHOW_WEATHER, v); }

// Wetter-basierte Vorschläge: wenn aus, ignoriert die Engine den Wetter-Hard-Filter
export function getWetterVorschlaege() { return getBool(KEY_WETTER_VORSCHLAEGE, true); }
export function setWetterVorschlaege(v) { setBool(KEY_WETTER_VORSCHLAEGE, v); }

export function getGarderobe() {
  try { return localStorage.getItem(KEY_GARDEROBE) || 'female'; } catch { return 'female'; }
}
export function getGarderobeLabel() {
  try { return localStorage.getItem(KEY_LABEL) || ''; } catch { return ''; }
}
export function setGarderobe(gender, label) {
  try {
    localStorage.setItem(KEY_GARDEROBE, gender);
    if (label) localStorage.setItem(KEY_LABEL, label);
  } catch { /* ignore */ }
}
export function istOnboarded() {
  try { return localStorage.getItem(KEY_ONBOARD) === '1'; } catch { return false; }
}
export function setOnboarded(v = true) {
  try {
    if (v) localStorage.setItem(KEY_ONBOARD, '1');
    else localStorage.removeItem(KEY_ONBOARD);
  } catch { /* ignore */ }
}
