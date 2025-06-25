// 'firebase' or 'local'. 
// If local, it will use public/data/data.json file.
// If firebase, it will use Firebase Firestore, make sure to set up Firebase config.
const DATA_SOURCE = "firebase";
// Collection name in Firestore
const COLLECTION_NAME = "familyMembers";

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
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { db, DATA_SOURCE, FAMILY_CONFIG, COLLECTION_NAME };
