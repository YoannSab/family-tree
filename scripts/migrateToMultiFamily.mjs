/**
 * Migration script: familyMembers (flat) → families/{familyId}/members (subcollection)
 *
 * Usage:
 *   1. Copy your .env file to the project root (or set the vars below manually)
 *   2. Run:  node scripts/migrateToMultiFamily.mjs
 *   3. The script prints the new familyId — save it, it's your access URL segment.
 *   4. After verifying the data in Firestore console, you can delete familyMembers manually.
 *
 * The script is idempotent: running it twice creates a second family entry,
 * it does NOT modify or delete the original familyMembers collection.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

// ── Load .env manually (no dotenv dependency needed) ──────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');
try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = val;
  }
} catch {
  console.warn('No .env file found — relying on environment variables already set.');
}

// ── Firebase setup ─────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

const SOURCE_COLLECTION = 'familyMembers'; // your current flat collection
const FAMILY_NAME        = 'Famiglia Colanero'; // edit if needed
const PASSWORD_HASH      = process.env.VITE_TARGET_HASH || '';

// ── Run ────────────────────────────────────────────────────────────────────────
async function migrate() {
  const app = initializeApp(firebaseConfig);
  const db  = getFirestore(app);

  // 1. Read all existing members
  console.log(`Reading from "${SOURCE_COLLECTION}"…`);
  const snap = await getDocs(collection(db, SOURCE_COLLECTION));
  if (snap.empty) {
    console.error('No documents found in', SOURCE_COLLECTION);
    process.exit(1);
  }
  console.log(`  Found ${snap.size} members.`);

  // 2. Generate a new family ID (UUID v4 — hard to guess)
  const familyId = randomUUID();
  console.log(`\nNew familyId: ${familyId}`);
  console.log(`Access URL:   /f/${familyId}`);

  // 3. Write family metadata doc
  await setDoc(doc(db, 'families', familyId), {
    name:         FAMILY_NAME,
    passwordHash: PASSWORD_HASH,
    createdAt:    new Date().toISOString(),
  });
  console.log('\nFamily metadata written.');

  // 4. Copy members in batches of 500 (Firestore batch limit)
  const membersCol = collection(db, 'families', familyId, 'members');
  let batchCount = 0;
  let batch = writeBatch(db);
  let opCount = 0;

  for (const memberDoc of snap.docs) {
    batch.set(doc(db, 'families', familyId, 'members', memberDoc.id), memberDoc.data());
    opCount++;
    if (opCount === 499) {
      await batch.commit();
      batchCount++;
      batch = writeBatch(db);
      opCount = 0;
    }
  }
  if (opCount > 0) {
    await batch.commit();
    batchCount++;
  }

  console.log(`Members copied (${batchCount} batch(es)).`);
  console.log('\n✅  Migration complete.');
  console.log(`\n👉  Add this to your .env (or Firestore Console):`);
  console.log(`    VITE_EXISTING_FAMILY_ID=${familyId}`);
  console.log('\n    Then share the URL:');
  console.log(`    https://your-site.web.app/f/${familyId}\n`);
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
