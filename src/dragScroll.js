// Ziehen mit der Maus scrollt (wie auf dem Touchscreen). Delegiert an das
// nächste scrollbare Element unter dem Startpunkt – vertikal (Inhalt) wie
// horizontal (Slider). Nur für Maus aktiv; Touch scrollt weiterhin nativ.

export function enableDragScroll(rootEl) {
  let active = false, dragging = false, sx = 0, sy = 0, startTarget = null;
  let scrollEl = null, axis = null, startScroll = 0;

  const findScrollable = (el, ax) => {
    while (el && el !== document.body && el !== document.documentElement) {
      const cs = getComputedStyle(el);
      if (ax === 'x') {
        if (/(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 2) return el;
      } else if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  };

  rootEl.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return; // Texteingaben nicht kapern
    active = true; dragging = false; sx = e.clientX; sy = e.clientY; startTarget = e.target;
  });

  const onMove = (e) => {
    if (!active) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!dragging) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return; // erst ab kleiner Schwelle -> Klicks bleiben Klicks
      dragging = true;
      axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      scrollEl = findScrollable(startTarget, axis);
      if (!scrollEl) { active = false; return; }
      startScroll = axis === 'x' ? scrollEl.scrollLeft : scrollEl.scrollTop;
      document.body.style.userSelect = 'none';
    }
    e.preventDefault();
    if (axis === 'x') scrollEl.scrollLeft = startScroll - dx;
    else scrollEl.scrollTop = startScroll - dy;
  };

  const onUp = () => {
    if (dragging) {
      // den Klick, der auf ein echtes Ziehen folgt, unterdrücken
      const supp = (ev) => { ev.stopPropagation(); ev.preventDefault(); window.removeEventListener('click', supp, true); };
      window.addEventListener('click', supp, true);
      setTimeout(() => window.removeEventListener('click', supp, true), 40);
    }
    active = false; dragging = false; document.body.style.userSelect = '';
  };

  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
}
