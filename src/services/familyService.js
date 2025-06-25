import { db, DATA_SOURCE, COLLECTION_NAME } from '../config/config.js';

let firestoreDeps;

/**
 * Charge les fonctions Firestore dynamiquement si nécessaire.
 */
const getFirebaseDeps = async () => {
  if (!firestoreDeps && DATA_SOURCE === 'firebase') {
    const firestore = await import('firebase/firestore');
    firestoreDeps = {
      collection: firestore.collection,
      doc: firestore.doc,
      getDocs: firestore.getDocs,
      getDoc: firestore.getDoc,
      updateDoc: firestore.updateDoc,
      deleteDoc: firestore.deleteDoc,
      addDoc: firestore.addDoc,
    };
  }
  return firestoreDeps;
};

const getFamilyCollection = async () => {
  const { collection } = await getFirebaseDeps();
  return collection(db, COLLECTION_NAME);
};

export const fetchFamilyMembers = async () => {
  if (DATA_SOURCE === 'local') {
    const response = await fetch("/data/data.json");
    if (!response.ok) {
      throw new Error("Failed to fetch local data");
    }
    return await response.json();
  }
  if (DATA_SOURCE !== 'firebase') return [];

  const { getDocs } = await getFirebaseDeps();
  const familyCollection = await getFamilyCollection();

  const snapshot = await getDocs(familyCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const fetchFamilyMemberById = async (id) => {
  if (DATA_SOURCE === 'local') {
    const familyMembers = await fetchFamilyMembers();
    return familyMembers.find(member => member.id === id) || null;
  }

  if (DATA_SOURCE !== 'firebase') return null;

  const { doc, getDoc } = await getFirebaseDeps();
  const docRef = doc(db, 'familyMembers', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error(`Document with id ${id} not found`);
  }
};

export const addFamilyMember = async (memberData) => {
  if (DATA_SOURCE !== 'firebase') return null;

  const { addDoc } = await getFirebaseDeps();
  const familyCollection = await getFamilyCollection();

  const docRef = await addDoc(familyCollection, memberData);
  return docRef.id;
};

export const updateFamilyMember = async (firestoreId, updatedData) => {
  if (DATA_SOURCE !== 'firebase') return;

  const { doc, updateDoc } = await getFirebaseDeps();
  const docRef = doc(db, 'familyMembers', firestoreId);
  await updateDoc(docRef, updatedData);
};

export const findFirestoreIdByInternalId = async (internalId) => {
  if (DATA_SOURCE !== 'firebase') return null;

  const { getDocs } = await getFirebaseDeps();
  const familyCollection = await getFamilyCollection();
  const snapshot = await getDocs(familyCollection);
  const found = snapshot.docs.find(doc => doc.data().id === internalId);
  return found ? found.id : null;
};

export const updateFamilyMemberByInternalId = async (internalId, updatedData) => {
  if (DATA_SOURCE !== 'firebase') return;

  const { doc, updateDoc } = await getFirebaseDeps();
  const firestoreId = await findFirestoreIdByInternalId(internalId);
  if (!firestoreId) {
    throw new Error(`Aucun membre trouvé avec l'ID interne: ${internalId}`);
  }
  const docRef = doc(db, 'familyMembers', firestoreId);
  await updateDoc(docRef, updatedData);
};

export const deleteFamilyMember = async (id) => {
  if (DATA_SOURCE !== 'firebase') return;

  const { doc, deleteDoc } = await getFirebaseDeps();
  const docRef = doc(db, 'familyMembers', id);
  await deleteDoc(docRef);
};
