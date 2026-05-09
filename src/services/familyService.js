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
      writeBatch: firestore.writeBatch,
      setDoc: firestore.setDoc,
      deleteField: firestore.deleteField,
      arrayRemove: firestore.arrayRemove,
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
    _firestoreId: doc.id,   // Real Firestore document ID (always reliable)
    id: doc.id,             // May be overwritten by stored id field below
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

/**
 * Creates a new family member and wires the bidirectional relationship atomically
 * via a Firestore batch write.
 *
 * @param {{ firstName, lastName, birthday, image, gender }} newData
 * @param {'father'|'mother'|'spouse'|'child'} relationType
 * @param {{ id, _firestoreId, data, rels }} relatedPerson - full person object from local state
 * @returns {Promise<string>} The new member's id (= Firestore doc ID)
 */
export const addFamilyMemberWithRelation = async (newData, relationType, relatedPerson, otherParentPerson = null) => {
  if (DATA_SOURCE !== 'firebase') throw new Error('Only supported with Firebase data source');

  const { collection: col, doc: docFn, writeBatch } = await getFirebaseDeps();

  const familyCol = col(db, COLLECTION_NAME);
  // Get a new auto-generated doc reference
  const newDocRef = docFn(familyCol);
  const newId = newDocRef.id;

  const newMemberRels = {};
  const relatedPersonUpdate = {};

  switch (relationType) {
    case 'father':
      newMemberRels.children = [relatedPerson.id];
      relatedPersonUpdate['rels.father'] = newId;
      break;
    case 'mother':
      newMemberRels.children = [relatedPerson.id];
      relatedPersonUpdate['rels.mother'] = newId;
      break;
    case 'spouse':
      newMemberRels.spouses = [relatedPerson.id];
      relatedPersonUpdate['rels.spouses'] = [
        ...(relatedPerson.rels?.spouses || []),
        newId,
      ];
      break;
    case 'child':
      // Assign the correct parent role based on the related person's gender
      if (relatedPerson.data?.gender === 'F') {
        newMemberRels.mother = relatedPerson.id;
        if (otherParentPerson) newMemberRels.father = otherParentPerson.id;
      } else {
        newMemberRels.father = relatedPerson.id;
        if (otherParentPerson) newMemberRels.mother = otherParentPerson.id;
      }
      relatedPersonUpdate['rels.children'] = [
        ...(relatedPerson.rels?.children || []),
        newId,
      ];
      break;
    default:
      throw new Error(`Unknown relation type: ${relationType}`);
  }

  const newMemberDocument = {
    id: newId,
    data: {
      firstName: newData.firstName,
      lastName: newData.lastName,
      birthday: newData.birthday || null,
      death: null,
      occupation: '',
      image: newData.image || 'default',
      gender: newData.gender || 'M',
      family: relatedPerson.data?.family || '',
      reliable: true,
    },
    rels: newMemberRels,
  };

  // Use _firestoreId (real Firestore doc ID) to update the related person
  const relatedFirestoreId = relatedPerson._firestoreId || relatedPerson.id;
  const relatedDocRef = docFn(db, COLLECTION_NAME, relatedFirestoreId);

  const batch = writeBatch(db);
  batch.set(newDocRef, newMemberDocument);
  batch.update(relatedDocRef, relatedPersonUpdate);

  // Also update the other parent's children list (child case only)
  if (relationType === 'child' && otherParentPerson) {
    const otherParentFirestoreId = otherParentPerson._firestoreId || otherParentPerson.id;
    batch.update(docFn(db, COLLECTION_NAME, otherParentFirestoreId), {
      'rels.children': [...(otherParentPerson.rels?.children || []), newId],
    });
  }

  await batch.commit();

  // Return both the id and the full document so the caller can do an optimistic update
  return { newId, newMemberDocument };
};

/**
 * Deletes a family member and removes all references to them from every other
 * member's rels, using a single atomic Firestore batch.
 *
 * @param {string} personId - The person's internal id (person.id in local state)
 * @param {Array}  allFamilyData - Current full local family data array
 */
export const deleteFamilyMemberAndCleanRefs = async (personId, allFamilyData) => {
  if (DATA_SOURCE !== 'firebase') throw new Error('Only supported with Firebase data source');

  const { doc: docFn, writeBatch, deleteField, arrayRemove } = await getFirebaseDeps();

  const target = allFamilyData.find(p => p.id === personId);
  if (!target) throw new Error(`Person with id "${personId}" not found in local data`);

  const batch = writeBatch(db);

  // Delete the target document
  const targetFirestoreId = target._firestoreId || target.id;
  batch.delete(docFn(db, COLLECTION_NAME, targetFirestoreId));

  // Clean up references in all other documents
  for (const person of allFamilyData) {
    if (person.id === personId) continue;

    const updates = {};
    if (person.rels?.father === personId) updates['rels.father'] = deleteField();
    if (person.rels?.mother === personId) updates['rels.mother'] = deleteField();
    if (person.rels?.spouses?.includes(personId)) updates['rels.spouses'] = arrayRemove(personId);
    if (person.rels?.children?.includes(personId)) updates['rels.children'] = arrayRemove(personId);

    if (Object.keys(updates).length > 0) {
      const firestoreId = person._firestoreId || person.id;
      batch.update(docFn(db, COLLECTION_NAME, firestoreId), updates);
    }
  }

  await batch.commit();
};
