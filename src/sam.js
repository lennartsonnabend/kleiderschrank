// Prompt-basierte Segmentierung mit SAM (Segment Anything), lokal im Browser.
// Modell: Xenova/slimsam-77-uniform (schlank). Wird beim ersten Nutzen aus dem
// HuggingFace-Hub geladen und im Browser gecacht -> danach offline & kostenlos.
//
// Ablauf: einmal pro Bild die Bild-Embeddings berechnen (teuer), danach pro
// Klick/Box nur den leichten Mask-Decoder laufen lassen (schnell).

import {
  SamModel,
  SamProcessor,
  RawImage,
} from '@huggingface/transformers';

// sam-vit-base: deutlich bessere Maskenqualität als slimsam-77.
// Vision-Encoder quantisiert (kleiner/schneller), Mask-Decoder in voller
// Präzision (beste Maskenränder). Größerer Einmal-Download, danach gecacht/offline.
const MODEL_ID = 'Xenova/sam-vit-base';

let modelPromise = null;
let processor = null;

async function ensureModel(onProgress) {
  if (!modelPromise) {
    modelPromise = (async () => {
      processor = await SamProcessor.from_pretrained(MODEL_ID);
      const model = await SamModel.from_pretrained(MODEL_ID, {
        dtype: {
          vision_encoder: 'q8',
          prompt_encoder_mask_decoder: 'fp32',
        },
        progress_callback: onProgress,
      });
      return model;
    })();
  }
  return modelPromise;
}

// Zustand des aktuell geladenen Bildes
let current = null;

// Bild laden und Embeddings vorberechnen.
// source: Blob | File | URL des ORIGINAL-Fotos (voller Kontext für SAM).
export async function samSetImage(source, onProgress) {
  const model = await ensureModel(onProgress);
  const rawImage = await RawImage.read(source);
  const baseInputs = await processor(rawImage);
  const embeddings = await model.get_image_embeddings(baseInputs);
  current = { model, rawImage, embeddings };
  return { width: rawImage.width, height: rawImage.height };
}

export function samReady() {
  return !!current;
}

// Segmentierung anfragen.
// points: [{x, y}] in Original-Pixelkoordinaten (positive Auswahl)
// box: {x1, y1, x2, y2} in Original-Pixelkoordinaten oder null
// -> liefert { mask: Uint8-artiges Array (1 = Teil der Auswahl), width, height }
export async function samSegment({ points = [], box = null }) {
  if (!current) throw new Error('SAM: kein Bild geladen');
  const { model, rawImage, embeddings } = current;

  const opts = {};
  if (points.length) opts.input_points = [points.map((p) => [p.x, p.y])];
  if (box) opts.input_boxes = [[[box.x1, box.y1, box.x2, box.y2]]];

  const inputs = await processor(rawImage, opts);
  // Gecachte Embeddings einsetzen -> Vision-Encoder wird übersprungen
  inputs.image_embeddings = embeddings.image_embeddings;
  inputs.image_positional_embeddings = embeddings.image_positional_embeddings;

  const { pred_masks, iou_scores } = await model(inputs);
  const masks = await processor.post_process_masks(
    pred_masks,
    inputs.original_sizes,
    inputs.reshaped_input_sizes
  );

  const maskTensor = masks[0]; // dims [pb, nMasks, H, W], bool
  const dims = maskTensor.dims;
  const H = dims[dims.length - 2];
  const W = dims[dims.length - 1];
  const nMasks = dims[dims.length - 3];

  // beste Maske per IoU-Score wählen
  const scores = iou_scores.data;
  let best = 0;
  for (let i = 1; i < scores.length; i++) {
    if (scores[i] > scores[best]) best = i;
  }
  best = Math.min(best, nMasks - 1);

  const data = maskTensor.data;
  const off = best * H * W;
  const mask =
    data.subarray?.(off, off + H * W) ?? data.slice(off, off + H * W);

  return { mask, width: W, height: H };
}

export function samReset() {
  current = null;
}
