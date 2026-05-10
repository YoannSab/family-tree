/**
 * Migration script: Firebase Storage images
 *
 * Moves images for family 9174d428-a290-428e-834b-6a9317508bda from:
 *   family-images/{filename}.JPG   (flat, legacy)
 * to:
 *   family-images/{FAMILY_ID}/{filename}.JPG   (scoped, new)
 *
 * Also updates each Firestore member document so data.image includes
 * the .JPG extension (e.g. "meme" → "meme.JPG").
 *
 * Usage:
 *   node scripts/migrateImages.mjs
 *
 * The script is safe to re-run: it uses getDownloadURL to verify the source
 * exists and skips files that are already migrated.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env ─────────────────────────────────────────────────────────────────
try {
  const env = readFileSync(resolve(__dirname, '../.env'), 'utf8');
  for (const line of env.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
} catch { /* no .env */ }

// ── Firebase ──────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

const FAMILY_ID = '9174d428-a290-428e-834b-6a9317508bda';

// ── Helper ────────────────────────────────────────────────────────────────────
const normalizeFilename = (image) => {
  if (!image || image === 'default') return null;
  return image.includes('.') ? image : `${image}.JPG`;
};

// ── Run ───────────────────────────────────────────────────────────────────────
async function migrate() {
  const app     = initializeApp(firebaseConfig);
  const db      = getFirestore(app);
  const storage = getStorage(app);

  const colRef = collection(db, `families/${FAMILY_ID}/members`);
  const snap   = await getDocs(colRef);

  if (snap.empty) {
    console.error('No members found in family', FAMILY_ID);
    process.exit(1);
  }

  console.log(`Found ${snap.size} members in family ${FAMILY_ID}\n`);

  const updates = []; // { docRef, newFilename }
  let copied = 0, skipped = 0, errors = 0;

  for (const docSnap of snap.docs) {
    const data     = docSnap.data();
    const rawImage = data.data?.image;
    const filename = normalizeFilename(rawImage);

    if (!filename) {
      console.log(`  skip (no image): ${data.data?.firstName} ${data.data?.lastName}`);
      skipped++;
      continue;
    }

    const srcPath  = `family-images/${filename}`;
    const destPath = `family-images/${FAMILY_ID}/${filename}`;
    const srcRef   = ref(storage, srcPath);
    const destRef  = ref(storage, destPath);

    // Check if destination already exists
    try {
      await getDownloadURL(destRef);
      console.log(`  already migrated: ${filename}`);
      // Still update Firestore if extension was missing
      if (!rawImage.includes('.')) {
        updates.push({ docRef: docSnap.ref, newFilename: filename });
      }
      skipped++;
      continue;
    } catch { /* not found at dest — proceed */ }

    // Download from source
    let bytes;
    try {
      const url  = await getDownloadURL(srcRef);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      bytes = await resp.arrayBuffer();
    } catch (e) {
      console.warn(`  ⚠ cannot download ${filename}: ${e.message}`);
      errors++;
      continue;
    }

    // Upload to destination
    try {
      await uploadBytes(destRef, bytes, { contentType: 'image/jpeg' });
      console.log(`  ✔ copied: ${filename}`);
      copied++;
      updates.push({ docRef: docSnap.ref, newFilename: filename });
    } catch (e) {
      console.warn(`  ⚠ upload failed for ${filename}: ${e.message}`);
      errors++;
    }
  }

  // Update Firestore documents (data.image now includes extension)
  if (updates.length > 0) {
    console.log(`\nUpdating ${updates.length} Firestore documents…`);
    const BATCH = 499;
    for (let i = 0; i < updates.length; i += BATCH) {
      const batch = writeBatch(db);
      updates.slice(i, i + BATCH).forEach(({ docRef, newFilename }) => {
        batch.update(docRef, { 'data.image': newFilename });
      });
      await batch.commit();
      console.log(`  batch ${Math.ceil((i + 1) / BATCH)} committed`);
    }
  }

  console.log(`\n✅ Migration complete.`);
  console.log(`   Copied : ${copied}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors : ${errors}`);
  process.exit(errors > 0 ? 1 : 0);
}

migrate().catch(e => { console.error('❌', e); process.exit(1); });
