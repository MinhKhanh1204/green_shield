/**
 * Lưu ảnh AI đã generate vào IndexedDB.
 * IndexedDB cho phép lưu nhiều hơn localStorage (thường 50MB+), không cần giới hạn dung lượng.
 */

const DB_NAME = 'greenshield_ai';
const STORE_NAME = 'generated';
const DB_VERSION = 1;
const LEGACY_STORAGE_KEY = 'greenshield_ai_generated';

/**
 * @typedef {Object} AiGeneratedItem
 * @property {string} id
 * @property {string} prompt
 * @property {string} [frontDataUrl]
 * @property {string} [backDataUrl]
 * @property {'front'|'back'} [side]
 * @property {number} timestamp
 */

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function migrateFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return;
    const valid = parsed.filter(
      (x) => x && typeof x.id === 'string' && typeof x.prompt === 'string' && typeof x.timestamp === 'number'
    );
    if (valid.length === 0) return;
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const item of valid) {
        store.put(item);
      }
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore migration errors
  }
}

/**
 * @returns {Promise<AiGeneratedItem[]>}
 */
export async function loadAiGenerated() {
  try {
    await migrateFromLocalStorage();
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = (req.result || []).filter(
          (x) =>
            x &&
            typeof x.id === 'string' &&
            typeof x.prompt === 'string' &&
            typeof x.timestamp === 'number'
        );
        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        db.close();
        resolve(items);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch {
    return [];
  }
}

/**
 * Thêm item mới. Khi có cả front và back, lưu 2 item riêng.
 * @param {Omit<AiGeneratedItem, 'id' | 'timestamp'>} item
 * @returns {Promise<AiGeneratedItem[]>}
 */
export async function addAiGenerated(item) {
  const baseId = `ai-${Date.now()}`;
  const added = [];

  const pushOne = async (partial) => {
    const full = {
      ...partial,
      id: `${baseId}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    };
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(full);
      req.onsuccess = () => {
        added.push(full);
        db.close();
        resolve();
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  };

  const hasFront = item.frontDataUrl && item.frontDataUrl.length > 10;
  const hasBack = item.backDataUrl && item.backDataUrl.length > 10;

  if (hasFront && hasBack) {
    await pushOne({ prompt: `${item.prompt} — Mặt trước`, frontDataUrl: item.frontDataUrl, side: 'front' });
    await pushOne({ prompt: `${item.prompt} — Mặt sau`, backDataUrl: item.backDataUrl, side: 'back' });
  } else if (hasFront) {
    await pushOne({ prompt: item.prompt, frontDataUrl: item.frontDataUrl, side: 'front' });
  } else if (hasBack) {
    await pushOne({ prompt: item.prompt, backDataUrl: item.backDataUrl, side: 'back' });
  }

  return added;
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function removeAiGenerated(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => {
      db.close();
      resolve();
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}
