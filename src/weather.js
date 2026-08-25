// Aktuelles Wetter über Open-Meteo (kostenlos, ohne API-Key).
// Standort per Geolocation, mit Hamburg als Fallback. Ergebnis wird gecacht,
// damit nicht bei jedem Render neu geladen (und neu nachgefragt) wird.

const HAMBURG = { lat: 53.5511, lon: 9.9937, ort: 'Hamburg' };

let cache = null; // { temp, code, ort }
let laufend = null; // laufendes Promise, um Doppelabfragen zu vermeiden

function holeKoordinaten() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(HAMBURG);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, ort: null }),
      () => resolve(HAMBURG),
      { timeout: 6000, maximumAge: 3600000 }
    );
  });
}

export async function getWetter() {
  if (cache) return cache;
  if (laufend) return laufend;
  laufend = (async () => {
    const { lat, lon, ort } = await holeKoordinaten();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
      + `&current=temperature_2m,weather_code`
      + `&daily=precipitation_probability_max&forecast_days=1&timezone=auto`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Wetter nicht verfügbar');
    const j = await r.json();
    const regen = j.daily && j.daily.precipitation_probability_max
      ? j.daily.precipitation_probability_max[0] : null;
    cache = {
      temp: Math.round(j.current.temperature_2m),
      code: j.current.weather_code,
      regen: typeof regen === 'number' ? regen : null,
      ort,
    };
    return cache;
  })();
  try {
    return await laufend;
  } finally {
    laufend = null;
  }
}

// WMO-Wettercode -> Icon-Name + kurzer Text
export function wetterInfo(code) {
  if (code === 0) return { icon: 'sun', text: 'Klar' };
  if (code === 1) return { icon: 'sun', text: 'Meist klar' };
  if (code === 2) return { icon: 'cloudSun', text: 'Teils bewölkt' };
  if (code === 3) return { icon: 'cloud', text: 'Bewölkt' };
  if (code === 45 || code === 48) return { icon: 'fog', text: 'Neblig' };
  if (code >= 51 && code <= 57) return { icon: 'rain', text: 'Nieselregen' };
  if (code >= 61 && code <= 67) return { icon: 'rain', text: 'Regen' };
  if (code >= 71 && code <= 77) return { icon: 'snow', text: 'Schnee' };
  if (code >= 80 && code <= 82) return { icon: 'rain', text: 'Schauer' };
  if (code === 85 || code === 86) return { icon: 'snow', text: 'Schneeschauer' };
  if (code >= 95) return { icon: 'thunder', text: 'Gewitter' };
  return { icon: 'cloud', text: 'Wetter' };
}
