// Ansicht: Kleidungsstück hinzufügen.
// Ablauf: Foto (Kamera/Galerie) -> freistellen -> "Passt so"/"Bearbeiten"/"Verwerfen"
//   -> "Bearbeiten": SAM-Editor (Klick-Punkt + Box entfernt Kopf/Hände lokal, ohne
//      pixelgenaues Radieren) -> "Fertig"
//   -> Farben werden gezogen -> taggen -> speichern.

import { el, blobUrl } from '../helpers.js';
import { freistellen } from '../backgroundRemoval.js';
import { extractColors } from '../colorExtract.js';
import { putGarment, makeId } from '../db.js';
import { nearestFarbe } from '../palette.js';
import { icon } from '../icons.js';
import { mountTagForm, garmentPatch, istVollstaendig } from '../tagForm.js';

export function addItemView(rerender, goTo) {
  const root = el('div', { class: 'view' });

  const s = {
    stage: 'idle', // idle | processing | review | editing | tagging
    originalFile: null,
    workingBlob: null, // aktuelles freigestelltes (ggf. bearbeitetes) Bild
    colors: [], // benannte Palettenfarben (editierbar)
    flyoutOpen: false, // Farb-Auswahl-Flyout offen?
    name: '',
    nameManual: false, // hat der Nutzer den Namen manuell geändert?
    kategorie: null, // ausgewähltes Blatt (Detailkategorie), z. B. "t-shirt"
    kategoriePath: null, // voller Pfad im Baum
    katFlyoutOpen: false,
    katExpanded: new Set(), // aufgeklappte Baum-Knoten
    gender: 'female', // TODO: bei Erstnutzung abfragen (männlich/weiblich/beides)
    waerme: '',
    formalitaet: '',
    muster: '',
    regentauglich: false,
    busy: false,
    status: '',
    // Editor
    mode: 'remove', // Freistellen: nur punktuelles Entfernen
    editCanvas: null,
    samSize: null,
    undoStack: [],
    samModule: null,
    editEls: null,
  };

  // ---------- Bild-Helfer ----------
  function loadImg(blob) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); res(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); rej(e); };
      img.src = url;
    });
  }
  async function blobToCanvas(blob) {
    const img = await loadImg(blob);
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext('2d', { willReadFrequently: true }).drawImage(img, 0, 0);
    return c;
  }
  function canvasToBlob(c) {
    return new Promise((res) => c.toBlob(res, 'image/png'));
  }

  // ---------- Render-Dispatch ----------
  function render() {
    root.replaceChildren();
    root.appendChild(el('h2', {}, 'Kleidungsstück hinzufügen'));

    if (s.stage === 'idle' || s.stage === 'processing') renderIdle();
    else if (s.stage === 'review') renderReview();
    else if (s.stage === 'editing') renderEditor();
    else if (s.stage === 'tagging') renderTagging();
  }

  // ---------- Schritt 1: Foto wählen ----------
  function renderIdle() {
    root.appendChild(
      el('div', { class: 'hint' }, [
        '💡 Tipp: Kleidungsstück am besten ',
        el('strong', {}, 'ungetragen'),
        ' und vor einem glatten Hintergrund fotografieren. ',
        'Getragene Fotos kannst du im nächsten Schritt mit „Bearbeiten" bereinigen.',
      ])
    );

    const galerieInput = el('input', {
      type: 'file', accept: 'image/*',
      style: { display: 'none' },
      onchange: (e) => handleFile(e.target.files[0]),
    });
    const kameraInput = el('input', {
      type: 'file', accept: 'image/*', capture: 'environment',
      style: { display: 'none' },
      onchange: (e) => handleFile(e.target.files[0]),
    });

    root.appendChild(
      el('div', { class: 'row' }, [
        el('button', { class: 'with-icon', onclick: () => kameraInput.click(), disabled: s.busy }, [icon('camera'), 'Foto aufnehmen']),
        el('button', { class: 'with-icon', onclick: () => galerieInput.click(), disabled: s.busy }, [icon('gallery'), 'Aus Galerie wählen']),
        galerieInput, kameraInput,
      ])
    );

    if (s.status) root.appendChild(el('p', { class: 'status' }, s.status));
  }

  async function handleFile(file) {
    if (!file) return;
    s.originalFile = file;
    s.stage = 'processing';
    s.busy = true;
    s.status = 'Schneide Kleidungsstück aus …';
    render();
    try {
      const blob = await freistellen(file, (key, current, total) => {
        if (key.startsWith('fetch')) {
          const pct = total ? Math.round((current / total) * 100) : 0;
          s.status = `Schneide Kleidungsstück aus … ${pct}%`;
          render();
        }
      });
      s.workingBlob = blob;
      s.busy = false;
      s.stage = 'review';
      render();
    } catch (err) {
      console.error(err);
      s.busy = false;
      s.stage = 'idle';
      s.status = 'Fehler beim Freistellen: ' + (err?.message || err);
      render();
    }
  }

  // ---------- Schritt 2: Review ----------
  function renderReview() {
    root.appendChild(previewBox(s.workingBlob));
    root.appendChild(
      el('div', { class: 'row' }, [
        el('button', { class: 'primary with-icon', onclick: passtSo }, [icon('check'), 'Passt so']),
        el('button', { class: 'with-icon', onclick: startEditing }, [icon('scissors'), 'Bearbeiten']),
        el('button', { onclick: reset }, 'Verwerfen'),
      ])
    );
    root.appendChild(
      el('p', { class: 'muted small' }, '„Bearbeiten": Kleidungsstück antippen (Rest wird weggeschnitten) – oder gezielt Kopf/Hände entfernen.')
    );
  }

  function previewBox(blob) {
    return el('div', { class: 'preview' }, [
      el('img', { src: blobUrl(blob), class: 'preview-img', alt: 'Freigestelltes Kleidungsstück' }),
    ]);
  }

  async function passtSo() {
    await zuFarbenUndTagging(s.workingBlob);
  }

  // ---------- Schritt 3: SAM-Editor ----------
  async function startEditing() {
    s.stage = 'editing';
    s.undoStack = [];
    s.editCanvas = await blobToCanvas(s.workingBlob);
    render(); // baut Editor-DOM einmalig auf

    // SAM lazy laden + Bild einlesen
    setEditStatus('Wird vorbereitet …');
    try {
      if (!s.samModule) s.samModule = await import('../sam.js');
      const size = await s.samModule.samSetImage(s.originalFile, (p) => {
        if (p && p.status === 'progress' && p.total) {
          const pct = Math.round((p.loaded / p.total) * 100);
          setEditStatus(`Wird vorbereitet … ${pct}%`);
        }
      });
      s.samSize = size;
      setEditStatus('Bereit.');
      setEditReady(true);
    } catch (err) {
      console.error(err);
      setEditStatus('SAM konnte nicht geladen werden: ' + (err?.message || err));
    }
  }

  function renderEditor() {
    const canvas = s.editCanvas;
    canvas.className = 'edit-canvas';
    const wrap = el('div', { class: 'edit-wrap' }, [canvas]);

    const status = el('p', { class: 'status' }, '…');
    const undoBtn = el('button', { onclick: undo, disabled: true }, '↶ Rückgängig');

    s.editEls = { status, undoBtn, ready: false, busy: false };

    root.appendChild(el('div', { class: 'hint' }, 'Klicke an, was gelöscht werden soll.'));
    root.appendChild(wrap);
    root.appendChild(status);
    root.appendChild(
      el('div', { class: 'row' }, [
        undoBtn,
        el('button', { class: 'primary', onclick: fertig }, '✔ Fertig'),
        el('button', { onclick: () => { s.stage = 'review'; render(); } }, 'Abbrechen'),
      ])
    );

    attachEditorHandlers(canvas);
  }

  function setEditStatus(msg) { if (s.editEls) s.editEls.status.textContent = msg; }
  function setEditReady(v) { if (s.editEls) s.editEls.ready = v; }
  function updateUndoBtn() { if (s.editEls) s.editEls.undoBtn.disabled = s.undoStack.length === 0; }

  function attachEditorHandlers(canvas) {
    canvas.addEventListener('pointerup', async (e) => {
      if (!s.editEls?.ready || s.editEls.busy) return;
      const r = canvas.getBoundingClientRect();
      const nx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const ny = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      await doSegment({ points: [{ x: nx * s.samSize.width, y: ny * s.samSize.height }] });
    });
  }

  async function doSegment(prompt) {
    if (s.editEls.busy) return;
    s.editEls.busy = true;
    setEditStatus('Entferne…');
    try {
      const { mask, width, height } = await s.samModule.samSegment(prompt);
      applyMask(mask, width, height);
      setEditStatus('Entfernt. Weiter klicken oder „Fertig".');
    } catch (err) {
      console.error(err);
      setEditStatus('Fehler bei der Segmentierung: ' + (err?.message || err));
    } finally {
      s.editEls.busy = false;
    }
  }

  // Maske (in SAM-Größe) auf das Arbeits-Canvas anwenden.
  // mode 'remove': markierte Pixel transparent machen.
  // mode 'keep':   alles AUSSER der Markierung transparent machen.
  function applyMask(mask, mW, mH) {
    const c = s.editCanvas;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const W = c.width, H = c.height;
    // Snapshot für Undo
    s.undoStack.push(ctx.getImageData(0, 0, W, H));
    if (s.undoStack.length > 12) s.undoStack.shift();

    const keep = s.mode === 'keep';
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    const sx = mW / W, sy = mH / H;
    for (let y = 0; y < H; y++) {
      const my = Math.min(mH - 1, (y * sy) | 0);
      const rowM = my * mW;
      const rowC = y * W;
      for (let x = 0; x < W; x++) {
        const mx = Math.min(mW - 1, (x * sx) | 0);
        const on = !!mask[rowM + mx];
        // remove: weg wenn on ; keep: weg wenn NICHT on
        if (keep ? !on : on) d[(rowC + x) * 4 + 3] = 0;
      }
    }
    ctx.putImageData(img, 0, 0);
    updateUndoBtn();
  }

  function undo() {
    const prev = s.undoStack.pop();
    if (prev) s.editCanvas.getContext('2d').putImageData(prev, 0, 0);
    updateUndoBtn();
  }

  async function fertig() {
    const blob = await canvasToBlob(s.editCanvas);
    s.workingBlob = blob;
    if (s.samModule) s.samModule.samReset();
    await zuFarbenUndTagging(blob);
  }

  // ---------- Schritt 4: Farben + Taggen ----------
  async function zuFarbenUndTagging(blob) {
    s.busy = true;
    s.stage = 'tagging';
    s.status = '';
    render();
    try {
      // nur die dominanteste Farbe (höchster Anteil) automatisch übernehmen
      const extrahiert = await extractColors(blob, 3);
      s.colors = [];
      if (extrahiert.length) {
        const p = nearestFarbe(extrahiert[0].hex);
        if (p) s.colors = [p];
      }
    } catch (err) {
      console.error(err);
      s.colors = [];
    }
    s.busy = false;
    render();
  }

  function renderTagging() {
    root.appendChild(previewBox(s.workingBlob));

    if (s.busy && !s.colors.length) {
      root.appendChild(el('p', { class: 'status' }, 'Farben werden analysiert…'));
    }

    const taggingWrap = el('div', { class: 'tagform' });
    root.appendChild(taggingWrap);

    const saveBtn = el('button', { class: 'primary with-icon', onclick: speichern }, [icon('check'), 'Speichern']);
    const pflichtHint = el('p', { class: 'muted small' }, '');
    const updateSave = () => {
      const ok = istVollstaendig(s);
      saveBtn.disabled = s.busy || !ok;
      pflichtHint.textContent = ok ? '' : 'Bitte alle Felder ausfüllen.';
    };
    mountTagForm(taggingWrap, s, updateSave);

    root.appendChild(pflichtHint);
    root.appendChild(
      el('div', { class: 'row' }, [
        saveBtn,
        el('button', { disabled: s.busy, onclick: reset }, 'Verwerfen'),
      ])
    );
    updateSave();
  }

  async function speichern() {
    if (!s.workingBlob || !istVollstaendig(s)) return;
    s.busy = true;
    render();
    await putGarment({
      id: makeId(),
      bild: s.workingBlob,
      angelegtAm: new Date().toISOString(),
      ...garmentPatch(s),
    });
    reset();
    goTo('schrank');
  }

  function reset() {
    s.stage = 'idle';
    s.originalFile = null;
    s.workingBlob = null;
    s.colors = [];
    s.flyoutOpen = false;
    s.name = '';
    s.nameManual = false;
    s.kategorie = null;
    s.kategoriePath = null;
    s.katFlyoutOpen = false;
    s.katExpanded = new Set();
    s.waerme = '';
    s.formalitaet = '';
    s.muster = '';
    s.regentauglich = false;
    s.busy = false;
    s.status = '';
    s.editCanvas = null;
    s.samSize = null;
    s.undoStack = [];
    s.editEls = null;
    if (s.samModule) s.samModule.samReset();
    render();
  }

  render();
  return root;
}
