// Minimale DOM-Helfer (kein Framework).

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v !== null && v !== undefined && v !== false) {
      node.setAttribute(k, v === true ? '' : v);
    }
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) {
    if (c === null || c === undefined || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// Object-URLs zentral verwalten, damit wir sie bei Re-Render freigeben können.
const urlRegistry = new Set();
export function blobUrl(blob) {
  const url = URL.createObjectURL(blob);
  urlRegistry.add(url);
  return url;
}
export function revokeAllUrls() {
  for (const url of urlRegistry) URL.revokeObjectURL(url);
  urlRegistry.clear();
}

export const KATEGORIE_LABEL = {
  oberteil: 'Oberteil',
  unterteil: 'Unterteil',
  einteiler: 'Einteiler',
  schuhe: 'Schuhe',
  jacke: 'Jacke',
  mantel: 'Mantel',
  accessoire: 'Accessoire',
};
