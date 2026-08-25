// Dominante Farben aus dem freigestellten Bild bestimmen.
// Reine Mathematik (k-Means auf den nicht-transparenten Pixeln), keine KI.

// ---- Farbraum-Helfer ----
export function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

export function rgbToHex(r, g, b) {
  const c = (n) => Math.round(n).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

// Neutral = geht farblich mit allem zusammen (schwarz/weiß/grau/beige/navy).
export function istNeutral({ s, v }) {
  if (s < 0.18) return true;         // grau/weiß/schwarz
  if (v < 0.22) return true;         // sehr dunkel -> navy/schwarz-artig
  if (s < 0.35 && v > 0.55 && v < 0.9) return true; // beige/greige-Bereich
  return false;
}

// ---- Bild -> Pixel ----
function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

// ---- k-Means ----
function kmeans(pixels, k, iterations = 10) {
  if (pixels.length === 0) return [];
  k = Math.min(k, pixels.length);
  // Startzentren: gleichmäßig verteilt aus den Daten
  const centers = [];
  for (let i = 0; i < k; i++) {
    centers.push(pixels[Math.floor((i / k) * pixels.length)].slice());
  }
  const assign = new Array(pixels.length).fill(0);

  for (let iter = 0; iter < iterations; iter++) {
    // Zuordnen
    for (let i = 0; i < pixels.length; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const dr = pixels[i][0] - centers[c][0];
        const dg = pixels[i][1] - centers[c][1];
        const db = pixels[i][2] - centers[c][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      assign[i] = best;
    }
    // Neu berechnen
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < pixels.length; i++) {
      const a = assign[i];
      sums[a][0] += pixels[i][0];
      sums[a][1] += pixels[i][1];
      sums[a][2] += pixels[i][2];
      sums[a][3] += 1;
    }
    for (let c = 0; c < centers.length; c++) {
      if (sums[c][3] > 0) {
        centers[c] = [
          sums[c][0] / sums[c][3],
          sums[c][1] / sums[c][3],
          sums[c][2] / sums[c][3],
        ];
      }
    }
  }

  // Cluster-Größen zählen
  const counts = centers.map(() => 0);
  for (let i = 0; i < pixels.length; i++) counts[assign[i]]++;
  return centers.map((c, i) => ({ rgb: c, count: counts[i] }));
}

// Liefert bis zu `maxColors` dominante Farben, nach Anteil sortiert.
export async function extractColors(blob, maxColors = 3) {
  const img = await blobToImage(blob);
  const size = 80; // klein -> schnell, für Farbanalyse ausreichend
  const scale = Math.min(size / img.width, size / img.height, 1);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 128) continue; // transparenter Hintergrund -> ignorieren
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (pixels.length === 0) return [];

  const clusters = kmeans(pixels, maxColors, 12).filter((c) => c.count > 0);
  clusters.sort((a, b) => b.count - a.count);
  const total = pixels.length;

  return clusters.map((c) => {
    const [r, g, b] = c.rgb;
    const hsv = rgbToHsv(r, g, b);
    return {
      hex: rgbToHex(r, g, b),
      h: hsv.h,
      s: hsv.s,
      v: hsv.v,
      anteil: c.count / total,
      neutral: istNeutral(hsv),
    };
  });
}
