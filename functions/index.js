const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

const ALLOWED_THEME_KEYS = new Set([
  'primary', 'primaryDark', 'primaryDarker', 'primaryRgb',
  'accent', 'accentDark', 'accentRgb',
  'flagLeft', 'flagRight',
]);

// Strip any unexpected keys from the theme object before storing it
const sanitizeTheme = (theme) => {
  if (!theme || typeof theme !== 'object') return null;
  const safe = {};
  for (const key of ALLOWED_THEME_KEYS) {
    if (typeof theme[key] === 'string') safe[key] = theme[key];
  }
  return Object.keys(safe).length ? safe : null;
};

/**
 * Creates a new family.
 * - Stores passwordHash in the private subcollection (inaccessible to clients).
 * - Returns a custom auth token so the creator is immediately signed in.
 */
exports.createFamily = onCall({ invoker: 'public' }, async (request) => {
  const { name, passwordHash, theme, isPublic } = request.data;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new HttpsError('invalid-argument', 'name is required');
  }
  if (passwordHash !== undefined && passwordHash !== null && typeof passwordHash !== 'string') {
    throw new HttpsError('invalid-argument', 'passwordHash must be a string');
  }

  const familyRef = admin.firestore().collection('families').doc();
  const familyId  = familyRef.id;
  const safeTheme = sanitizeTheme(theme);

  const batch = admin.firestore().batch();

  // Public document — no passwordHash stored here
  batch.set(familyRef, {
    name: name.trim(),
    hasPassword: Boolean(passwordHash),
    isPublic: isPublic === true,
    createdAt: new Date().toISOString(),
    ...(safeTheme ? { theme: safeTheme } : {}),
  });

  // Private document — only accessible via Cloud Functions (Admin SDK)
  if (passwordHash) {
    batch.set(familyRef.collection('private').doc('auth'), { passwordHash });
  }

  await batch.commit();

  const uid   = `family_${familyId}`;
  const token = await admin.auth().createCustomToken(uid, { familyId });

  return { familyId, token };
});

/**
 * Validates the SHA-256 hash of the entered password against the one stored
 * in the family's private subcollection (read via Admin SDK, bypassing rules).
 * On success returns a Firebase Custom Auth Token with a `familyId` claim
 * so that Firestore rules can enforce per-family access.
 */
exports.verifyFamilyPassword = onCall({ invoker: 'public' }, async (request) => {
  const { familyId, passwordHash } = request.data;

  if (!familyId || typeof familyId !== 'string') {
    throw new HttpsError('invalid-argument', 'familyId is required');
  }
  if (passwordHash !== undefined && passwordHash !== null && typeof passwordHash !== 'string') {
    throw new HttpsError('invalid-argument', 'passwordHash must be a string');
  }

  const familySnap = await admin.firestore().doc(`families/${familyId}`).get();
  if (!familySnap.exists) {
    throw new HttpsError('not-found', 'Family not found');
  }

  // passwordHash is stored in the private subcollection, not the public family doc
  const privateSnap = await admin.firestore().doc(`families/${familyId}/private/auth`).get();
  const storedHash  = privateSnap.exists ? privateSnap.data().passwordHash : null;

  // If the family has no password configured, grant access freely
  if (storedHash && storedHash !== passwordHash) {
    throw new HttpsError('permission-denied', 'Invalid password');
  }

  const uid   = `family_${familyId}`;
  const token = await admin.auth().createCustomToken(uid, { familyId });

  return { token };
});
