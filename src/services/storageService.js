import { DATA_SOURCE } from '../config/config.js';

// ── Module-level URL cache ────────────────────────────────────────────────────
// Key: `${familyId}::${normalizedFilename}`, Value: resolved download URL
const urlCache = new Map();
// ── Cache update listeners ──────────────────────────────────────────
// Allows useImageUrl hooks to react when the blob URL for a key is updated
// (e.g. after an upload that overwrites an existing file with the same name).
const cacheListeners = new Set();
export const subscribeToCacheUpdate = (fn) => {
  cacheListeners.add(fn);
  return () => cacheListeners.delete(fn);
};
const notifyCacheUpdate = (cacheKey) => cacheListeners.forEach(fn => fn(cacheKey));
// ── Lazy Firebase Storage dependencies ───────────────────────────────────────
let _storageDeps = null;
const getStorageDeps = async () => {
  if (_storageDeps) return _storageDeps;
  const [configModule, { getStorage, ref, uploadBytes, getDownloadURL, deleteObject }] =
    await Promise.all([import('../config/config.js'), import('firebase/storage')]);
  await configModule.initFirebase();
  const { getApp } = await import('firebase/app');
  const storage = getStorage(getApp());
  _storageDeps = { storage, ref, uploadBytes, getDownloadURL, deleteObject };
  return _storageDeps;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalize filename:
 *  - 'default' → null (no image)
 *  - 'meme'    → 'meme.JPG'  (legacy: no extension → add .JPG)
 *  - 'meme.JPG'→ 'meme.JPG'  (already correct)
 *  - 'photo.jpg'→ 'photo.jpg' (new format)
 */
const normalizeFilename = (filename) => {
  if (!filename || filename === 'default') return null;
  return filename.includes('.') ? filename : `${filename}.JPG`;
};

/**
 * Convert a display name to a URL-safe slug.
 * "Jean-Pierre" → "jean_pierre"
 */
const toSlug = (str) =>
  (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

/**
 * Build a Storage filename for a new upload.
 * Result: "jean_dupont_abc123.jpg"
 */
export const buildImageFilename = (firstName, lastName, personId) =>
  `${toSlug(firstName)}_${toSlug(lastName)}_${personId}.jpg`;

// ── Image compression ─────────────────────────────────────────────────────────

/**
 * Compress an image File via Canvas.
 * Resizes to maxDimension and re-encodes as JPEG at the given quality.
 * Targets ~200-300 KB output.
 */
export const compressImage = (file, maxDimension = 1200, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas compression failed'));
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed during compression'));
    };
    img.src = objectUrl;
  });

// ── URL resolution ────────────────────────────────────────────────────────────

/**
 * Synchronous URL getter — returns cached URL if available, otherwise the
 * local fallback. Safe to call in D3 HTML string builders.
 */
export const getImageUrlCached = (familyId, filename) => {
  const normalized = normalizeFilename(filename);
  if (!normalized) return null;
  if (DATA_SOURCE !== 'firebase') return `${import.meta.env.BASE_URL}images/${normalized}`;
  const cacheKey = `${familyId}::${normalized}`;
  return urlCache.has(cacheKey) ? urlCache.get(cacheKey) : null;
};

/**
 * Returns true when the URL is already resolved in the module-level cache
 * (including fallbacks). If true, no async fetch is needed.
 */
export const hasCachedUrl = (familyId, filename) => {
  const normalized = normalizeFilename(filename);
  if (!normalized || DATA_SOURCE !== 'firebase') return true;
  return urlCache.has(`${familyId}::${normalized}`);
};

/**
 * Async URL resolver — fetches the Storage download URL on first call,
 * downloads the image as a blob and creates a blob:// URL.
 * Blob URLs live in RAM for the session — subsequent <img src=blobUrl> mounts
 * (e.g. D3 tree rebuilds) are served instantly with zero network requests,
 * regardless of Firebase Storage Cache-Control headers.
 * Requires CORS to be configured on the Storage bucket (see cors.json).
 */
export const getImageUrl = async (familyId, filename) => {
  const normalized = normalizeFilename(filename);
  if (!normalized) return null;
  if (DATA_SOURCE !== 'firebase') return `${import.meta.env.BASE_URL}images/${normalized}`;

  const cacheKey = `${familyId}::${normalized}`;
  if (urlCache.has(cacheKey)) return urlCache.get(cacheKey);

  try {
    const { storage, ref, getDownloadURL } = await getStorageDeps();
    const storageUrl = await getDownloadURL(ref(storage, `family-images/${familyId}/${normalized}`));
    const resp = await fetch(storageUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    urlCache.set(cacheKey, blobUrl);
    notifyCacheUpdate(cacheKey);
    return blobUrl;
  } catch {
    // Not found in Storage — cache null so we don't retry on every render
    urlCache.set(cacheKey, null);
    return null;
  }
};

/**
 * Prefetch all image URLs for a family's members in parallel.
 * Call this after loading family data so the cache is warm before render.
 */
export const prefetchImageUrls = async (familyId, members) => {
  if (DATA_SOURCE !== 'firebase' || !familyId || !members?.length) return;
  await Promise.allSettled(
    members
      .filter((m) => m.data?.image && m.data.image !== 'default')
      .map((m) => getImageUrl(familyId, m.data.image)),
  );
};

// ── Upload / Delete ───────────────────────────────────────────────────────────

/**
 * Compress and upload an image to Firebase Storage.
 * Returns the new filename (to store in data.image).
 */
export const uploadImage = async (familyId, personId, firstName, lastName, file) => {
  if (DATA_SOURCE !== 'firebase') throw new Error('Storage not available in local mode');
  const { storage, ref, uploadBytes } = await getStorageDeps();
  const blob = await compressImage(file);
  const filename = buildImageFilename(firstName, lastName, personId);
  const storageRef = ref(storage, `family-images/${familyId}/${filename}`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  // Revoke old blob URL for this filename if one existed (overwrite case)
  const cacheKey = `${familyId}::${filename}`;
  const existing = urlCache.get(cacheKey);
  if (existing?.startsWith('blob:')) URL.revokeObjectURL(existing);
  // Re-use the already-compressed blob — no extra network round-trip needed
  const blobUrl = URL.createObjectURL(blob);
  urlCache.set(cacheKey, blobUrl);
  notifyCacheUpdate(cacheKey);
  return filename;
};

/**
 * Delete an image from Firebase Storage and purge from cache.
 * Silently ignores errors (e.g. file not in Storage for local-mode images).
 */
export const deleteImageFromStorage = async (familyId, filename) => {
  if (!filename || filename === 'default' || DATA_SOURCE !== 'firebase') return;
  const normalized = normalizeFilename(filename);
  if (!normalized) return;
  const cacheKey = `${familyId}::${normalized}`;
  // Revoke blob URL to free RAM before removing from cache
  const existing = urlCache.get(cacheKey);
  if (existing?.startsWith('blob:')) URL.revokeObjectURL(existing);
  urlCache.delete(cacheKey);
  try {
    const { storage, ref, deleteObject } = await getStorageDeps();
    await deleteObject(ref(storage, `family-images/${familyId}/${normalized}`));
  } catch {
    // File may be missing — ignore
  }
};

export const invalidateImageCache = (familyId, filename) => {
  const normalized = normalizeFilename(filename);
  if (!normalized) return;
  const cacheKey = `${familyId}::${normalized}`;
  const existing = urlCache.get(cacheKey);
  if (existing?.startsWith('blob:')) URL.revokeObjectURL(existing);
  urlCache.delete(cacheKey);
};
