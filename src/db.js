// Lokale Persistenz über IndexedDB. Bilder werden als Blob gespeichert,
// nichts verlässt den Browser. Kein Server, keine Cloud.

const DB_NAME = 'kleiderschrank';
const DB_VERSION = 3;

const STORES = {
  garments: 'garments',   // Kleidungsstücke
  outfits: 'outfits',     // gespeicherte Outfits
  calendar: 'calendar',   // Datum -> Outfit-Zuweisung
  looks: 'looks',         // hochgeladene Fotos getragener Outfits
};

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.garments)) {
        db.createObjectStore(STORES.garments, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.outfits)) {
        db.createObjectStore(STORES.outfits, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.calendar)) {
        // Schlüssel = ISO-Datum (YYYY-MM-DD)
        db.createObjectStore(STORES.calendar, { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains(STORES.looks)) {
        db.createObjectStore(STORES.looks, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(store, mode, fn) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, mode);
        const os = t.objectStore(store);
        let result;
        Promise.resolve(fn(os)).then((r) => {
          result = r;
        });
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      })
  );
}

function reqToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Einfache ID ohne externe Abhängigkeit
export function makeId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

// ---- Kleidungsstücke ----
export function putGarment(garment) {
  return tx(STORES.garments, 'readwrite', (os) => reqToPromise(os.put(garment)));
}
export function getAllGarments() {
  return tx(STORES.garments, 'readonly', (os) => reqToPromise(os.getAll()));
}
export function getGarment(id) {
  return tx(STORES.garments, 'readonly', (os) => reqToPromise(os.get(id)));
}
export function deleteGarment(id) {
  return tx(STORES.garments, 'readwrite', (os) => reqToPromise(os.delete(id)));
}

// ---- Outfits ----
export function putOutfit(outfit) {
  return tx(STORES.outfits, 'readwrite', (os) => reqToPromise(os.put(outfit)));
}
export function getAllOutfits() {
  return tx(STORES.outfits, 'readonly', (os) => reqToPromise(os.getAll()));
}
export function getOutfit(id) {
  return tx(STORES.outfits, 'readonly', (os) => reqToPromise(os.get(id)));
}
export function deleteOutfit(id) {
  return tx(STORES.outfits, 'readwrite', (os) => reqToPromise(os.delete(id)));
}

// ---- Kalender ----
export function putCalendarEntry(entry) {
  return tx(STORES.calendar, 'readwrite', (os) => reqToPromise(os.put(entry)));
}
export function getAllCalendarEntries() {
  return tx(STORES.calendar, 'readonly', (os) => reqToPromise(os.getAll()));
}
export function deleteCalendarEntry(date) {
  return tx(STORES.calendar, 'readwrite', (os) => reqToPromise(os.delete(date)));
}

// ---- Looks (getragene Outfit-Fotos) ----
export function putLook(look) {
  return tx(STORES.looks, 'readwrite', (os) => reqToPromise(os.put(look)));
}
export function getAllLooks() {
  return tx(STORES.looks, 'readonly', (os) => reqToPromise(os.getAll()));
}
export function deleteLook(id) {
  return tx(STORES.looks, 'readwrite', (os) => reqToPromise(os.delete(id)));
}
