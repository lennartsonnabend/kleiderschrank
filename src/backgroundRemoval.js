// Freistellen komplett lokal im Browser.
// @imgly/background-removal lädt das Modell beim ersten Aufruf einmalig nach
// und cacht es danach im Browser -> anschließend offline & kostenlos.

import { removeBackground } from '@imgly/background-removal';

// file: File | Blob  ->  Blob (PNG mit transparentem Hintergrund)
export async function freistellen(file, onProgress) {
  const config = {};
  if (onProgress) {
    // Fortschritt: 'fetch:...' beim Modell-Download, 'compute:...' bei Inferenz
    config.progress = (key, current, total) => {
      onProgress(key, current, total);
    };
  }
  const blob = await removeBackground(file, config);
  return blob;
}
