// ─────────────────────────────────────────────────────────────────────────────
// THEME — Edit these to restyle the entire app.
// All colors in components, hooks and CSS must derive from these values.
// ─────────────────────────────────────────────────────────────────────────────
const THEME = {
  // Primary brand color (Italian green)
  primary:        '#2d5a27',
  primaryDark:    '#1e3a1a',
  primaryDarker:  '#0f2e0d',
  primaryRgb:     '45, 90, 39',   // use inside rgba(${THEME.primaryRgb}, alpha)

  // Accent color (Italian gold)
  accent:         '#e7c59a',
  accentDark:     '#d4af37',
  accentRgb:      '200, 168, 130', // use inside rgba(${THEME.accentRgb}, alpha)

  // Backgrounds
  bgPage:         '#fafafa',
  bgCard:         'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
  bgSurface:      '#ffffff',

  // Text colors
  textMuted:      '#666',   // secondary text (dates, etc.)
  textSubtle:     '#888',   // tertiary text (occupation, etc.)

  // Italian flag stripe colors
  flagLeft:      '#00a531',
  flagRight:        '#ce2b37',
};

// 'firebase' or 'local'. 
// If local, it will use public/data/data.json file.
// If firebase, it will use Firebase Firestore, make sure to set up Firebase config.
const DATA_SOURCE = "firebase";
// Collection name in Firestore
const COLLECTION_NAME = "familyMembers";

// Password Hash
const TARGET_HASH = import.meta.env.VITE_TARGET_HASH || "";

// Family Configuration - Edit these values to customize your family tree
const FAMILY_CONFIG = {
  familyName: "Famiglia Colanero",
  subtitle: "Dalle montagne Abruzzesi",
  countryIcon: "🇮🇹",
};

let app, db;

if (DATA_SOURCE === "firebase") {
  const { initializeApp } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
  };

  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { db, DATA_SOURCE, FAMILY_CONFIG, COLLECTION_NAME, TARGET_HASH, THEME };
