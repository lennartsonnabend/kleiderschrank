import { defineConfig } from 'vite';

export default defineConfig({
  // Das Freistell-Modell (@imgly/background-removal) lädt seine WASM/ONNX-Assets
  // zur Laufzeit selbst nach und darf nicht mitgebündelt werden.
  optimizeDeps: {
    exclude: ['@imgly/background-removal', '@huggingface/transformers'],
  },
  server: {
    port: 5273,
    open: true,
  },
});
