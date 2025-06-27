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

export { db, DATA_SOURCE, FAMILY_CONFIG, COLLECTION_NAME, TARGET_HASH };
