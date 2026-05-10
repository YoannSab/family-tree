/**
 * Migration: add .JPG extension to legacy data.image fields in Firestore.
 *
 * For every member across all families where data.image exists but has no
 * file extension (e.g. "meme" → "meme.JPG"), updates the Firestore document.
 *
 * Run ONCE, then the legacy normalizeFilename fallback can be removed.
 *
 * Usage:
 *   node scripts/addImageExtension.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

async function migrate() {
  const app = initializeApp(firebaseConfig);
  const db  = getFirestore(app);

  const familiesSnap = await getDocs(collection(db, 'families'));
  console.log(`Found ${familiesSnap.size} families\n`);

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const familyDoc of familiesSnap.docs) {
    const familyId = familyDoc.id;
    const membersSnap = await getDocs(collection(db, `families/${familyId}/members`));
    const toUpdate = [];

    for (const memberDoc of membersSnap.docs) {
      const image = memberDoc.data()?.data?.image;
      if (!image || image === 'default' || image.includes('.')) {
        totalSkipped++;
        continue;
      }
      // Legacy: no extension → add .JPG
      toUpdate.push({ ref: memberDoc.ref, newImage: `${image}.JPG` });
    }

    if (toUpdate.length === 0) {
      console.log(`  ${familyId}: nothing to update`);
      continue;
    }

    // Batch write (max 499 per batch)
    const BATCH_SIZE = 499;
    for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      toUpdate.slice(i, i + BATCH_SIZE).forEach(({ ref, newImage }) => {
        batch.update(ref, { 'data.image': newImage });
      });
      await batch.commit();
    }

    console.log(`  ${familyId}: updated ${toUpdate.length} members`);
    totalUpdated += toUpdate.length;
  }

  console.log(`\n✅ Done. Updated: ${totalUpdated}, Skipped: ${totalSkipped}`);
  process.exit(0);
}

migrate().catch(e => { console.error('❌', e); process.exit(1); });
