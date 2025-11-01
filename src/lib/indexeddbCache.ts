// Simple IndexedDB cache with TTL and LRU eviction
const DB_NAME = 'rebook-cache-db';
const STORE_NAME = 'cache';
const DB_VERSION = 1;

type CacheEntry = {
  key: string;
  value: any;
  createdAt: number;
  lastAccessed: number;
  ttl?: number | null; // milliseconds
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const os = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        os.createIndex('lastAccessed', 'lastAccessed');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getStore(mode: IDBTransactionMode = 'readonly') {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, mode);
  const store = tx.objectStore(STORE_NAME);
  return { db, tx, store };
}

export async function setCacheItem(key: string, value: any, ttlMs: number | null = 7 * 24 * 60 * 60 * 1000) {
  try {
    const now = Date.now();
    const entry: CacheEntry = { key, value, createdAt: now, lastAccessed: now, ttl: ttlMs };
    const { tx, store } = await getStore('readwrite');
    store.put(entry);
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onabort = rej; tx.onerror = rej; });
    await enforceMaxItems();
  } catch (e) {
    console.warn('setCacheItem error', e);
  }
}

export async function getCacheItem(key: string) {
  try {
    const { tx, store } = await getStore('readwrite');
    const req = store.get(key);
    const result = await new Promise<any>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (!result) return null;
    const now = Date.now();
    if (result.ttl && result.createdAt + result.ttl < now) {
      // expired
      store.delete(key);
      await new Promise((res, rej) => { tx.oncomplete = res; tx.onabort = rej; tx.onerror = rej; });
      return null;
    }
    // update lastAccessed
    result.lastAccessed = now;
    store.put(result);
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onabort = rej; tx.onerror = rej; });
    return result.value;
  } catch (e) {
    console.warn('getCacheItem error', e);
    return null;
  }
}

export async function deleteCacheItem(key: string) {
  try {
    const { tx, store } = await getStore('readwrite');
    store.delete(key);
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onabort = rej; tx.onerror = rej; });
  } catch (e) {
    console.warn('deleteCacheItem error', e);
  }
}

// LRU enforcement: keep max number of entries
const MAX_CACHE_ITEMS = 1000; // configurable, increased to allow more thumbnails

async function enforceMaxItems() {
  try {
    const { db, tx, store } = await getStore('readwrite');
    const idx = store.index('lastAccessed');
    const items: CacheEntry[] = [];
    const req = idx.openCursor();
    await new Promise((resolve, reject) => {
      req.onsuccess = (ev: any) => {
        const cursor = ev.target.result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });

    if (items.length > MAX_CACHE_ITEMS) {
      const toDelete = items.slice(0, items.length - MAX_CACHE_ITEMS);
      for (const it of toDelete) {
        store.delete(it.key);
      }
    }

    await new Promise((res, rej) => { tx.oncomplete = res; tx.onabort = rej; tx.onerror = rej; });
  } catch (e) {
    console.warn('enforceMaxItems error', e);
  }
}

// Helper: fetch image URL, resize to thumbnail, and convert to data URL for storage
export async function fetchAndCacheImage(key: string, url: string, ttlMs: number | null = 7 * 24 * 60 * 60 * 1000, maxWidth = 600, maxHeight = 600, quality = 0.75) {
  try {
    // Try to get cached value first
    const existing = await getCacheItem(key);
    if (existing) return existing;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Image fetch failed');
    const blob = await res.blob();

    // Resize to thumbnail to reduce size
    const dataUrl = await resizeBlobToDataURL(blob, maxWidth, maxHeight, quality);
    await setCacheItem(key, dataUrl, ttlMs);
    return dataUrl;
  } catch (e) {
    console.warn('fetchAndCacheImage error', e);
    return null;
  }
}

async function resizeBlobToDataURL(blob: Blob, maxWidth = 600, maxHeight = 600, quality = 0.75) {
  try {
    const imgBitmap = await createImageBitmap(blob);
    const { width: iw, height: ih } = imgBitmap;
    const ratio = Math.min(1, maxWidth / iw, maxHeight / ih);
    const w = Math.max(1, Math.floor(iw * ratio));
    const h = Math.max(1, Math.floor(ih * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(imgBitmap, 0, 0, w, h);
    // Prefer webp if supported
    const mime = 'image/webp';
    return canvas.toDataURL(mime, quality);
  } catch (e) {
    // fallback to original blob conversion
    return blobToDataURL(blob);
  }
}

function blobToDataURL(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Small utility to generate cache keys
export function cacheKeyForPlaceDetails(placeId: string) {
  return `place:details:${placeId}`;
}
export function cacheKeyForPhoto(placeId: string, photoRef: string) {
  return `place:photo:${placeId}:${photoRef}`;
}

export async function clearCache() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onabort = rej; tx.onerror = rej; });
  } catch (e) {
    console.warn('clearCache error', e);
  }
}
