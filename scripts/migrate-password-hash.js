/**
 * Migration: move passwordHash from the public families/{id} document
 * to the private subcollection families/{id}/private/auth
 *
 * Run once from the project root:
 *   firebase login          (if not already authenticated)
 *   node scripts/migrate-password-hash.js
 *
 * Uses Application Default Credentials via the Firebase CLI — no service account key needed.
 */

const admin = require('../functions/node_modules/firebase-admin');

// ADC picks up credentials from `firebase login --reauth` automatically
admin.initializeApp({ projectId: 'family-tree-8ac12' });

const db = admin.firestore();

async function migrate() {
  const familiesSnap = await db.collection('families').get();

  if (familiesSnap.empty) {
    console.log('No families found.');
    return;
  }

  let migrated = 0;
  let skipped  = 0;

  for (const familyDoc of familiesSnap.docs) {
    const data = familyDoc.data();

    if (!data.passwordHash) {
      // No password — just ensure hasPassword flag is set correctly and clean up
      if (data.hasPassword !== false) {
        await familyDoc.ref.update({ hasPassword: false });
        console.log(`[${familyDoc.id}] set hasPassword=false (no hash present)`);
      } else {
        console.log(`[${familyDoc.id}] skipped (already clean)`);
      }
      skipped++;
      continue;
    }

    const privateRef = familyDoc.ref.collection('private').doc('auth');
    const privateSnap = await privateRef.get();

    if (privateSnap.exists) {
      console.log(`[${familyDoc.id}] skipped (private/auth already exists)`);
      skipped++;
      continue;
    }

    const batch = db.batch();

    // Write hash to private subcollection
    batch.set(privateRef, { passwordHash: data.passwordHash });

    // Remove hash from public doc, add hasPassword flag
    batch.update(familyDoc.ref, {
      passwordHash: admin.firestore.FieldValue.delete(),
      hasPassword: true,
    });

    await batch.commit();

    console.log(`[${familyDoc.id}] migrated "${data.name}"`);
    migrated++;
  }

  console.log(`\nDone — ${migrated} migrated, ${skipped} skipped.`);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
