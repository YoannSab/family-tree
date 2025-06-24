// familyService.js
import { db } from '../config/firebase.js'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where
} from 'firebase/firestore';

const familyCollection = collection(db, 'familyMembers');

/**
 * Récupère tous les membres de la famille.
 */
export const fetchFamilyMembers = async () => {
  const snapshot = await getDocs(familyCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Récupère un membre spécifique par son ID.
 */
export const fetchFamilyMemberById = async (id) => {
  const docRef = doc(db, 'familyMembers', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error(`Document with id ${id} not found`);
  }
};

/**
 * Ajoute un nouveau membre.
 */
export const addFamilyMember = async (memberData) => {
  const docRef = await addDoc(familyCollection, memberData);
  return docRef.id;
};

/**
 * Met à jour un membre existant.
 * @param {string} firestoreId - L'ID du document Firestore
 * @param {object} updatedData - Les données à mettre à jour
 */
export const updateFamilyMember = async (firestoreId, updatedData) => {
  const docRef = doc(db, 'familyMembers', firestoreId);
  await updateDoc(docRef, updatedData);
};

/**
 * Trouve un membre de la famille par son ID interne (dans les données) et retourne son ID Firestore
 * @param {string} internalId - L'ID interne utilisé dans les relations familiales
 */
export const findFirestoreIdByInternalId = async (internalId) => {
  const snapshot = await getDocs(familyCollection);
  const doc = snapshot.docs.find(doc => doc.data().id === internalId);
  return doc ? doc.id : null;
};

/**
 * Met à jour un membre existant en utilisant son ID interne
 * @param {string} internalId - L'ID interne de la personne
 * @param {object} updatedData - Les données à mettre à jour
 */
export const updateFamilyMemberByInternalId = async (internalId, updatedData) => {
  const firestoreId = await findFirestoreIdByInternalId(internalId);
  if (!firestoreId) {
    throw new Error(`Aucun membre trouvé avec l'ID interne: ${internalId}`);
  }
  const docRef = doc(db, 'familyMembers', firestoreId);
  await updateDoc(docRef, updatedData);
};

/**
 * Supprime un membre de la famille.
 */
export const deleteFamilyMember = async (id) => {
  const docRef = doc(db, 'familyMembers', id);
  await deleteDoc(docRef);
};

/**
 * Vérifie la cohérence entre les IDs internes et Firestore
 * Utile pour le débogage et la migration de données
 */
export const validateDataConsistency = async () => {
  const snapshot = await getDocs(familyCollection);
  const inconsistencies = [];
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const firestoreId = doc.id;
    const internalId = data.id;
    
    if (!internalId) {
      inconsistencies.push({
        type: 'missing_internal_id',
        firestoreId,
        message: `Document ${firestoreId} n'a pas d'ID interne`
      });
    }
  });
  
  return inconsistencies;
};
