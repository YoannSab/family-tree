import { db, DATA_SOURCE } from '../config/config.js';

let firestoreDeps;

const getFirebaseDeps = async () => {
  if (!firestoreDeps && DATA_SOURCE === 'firebase') {
    const firestore = await import('firebase/firestore');
    firestoreDeps = {
      collection:      firestore.collection,
      doc:             firestore.doc,
      getDocs:         firestore.getDocs,
      getDoc:          firestore.getDoc,
      updateDoc:       firestore.updateDoc,
      deleteDoc:       firestore.deleteDoc,
      addDoc:          firestore.addDoc,
      writeBatch:      firestore.writeBatch,
      setDoc:          firestore.setDoc,
      deleteField:     firestore.deleteField,
      arrayRemove:     firestore.arrayRemove,
      arrayUnion:      firestore.arrayUnion,
    };
  }
  return firestoreDeps;
};

// ── Path helpers ────────────────────────────────────────────────────────────────────
const getMembersColPath = (familyId) => `families/${familyId}/members`;

const getMembersCol = async (familyId) => {
  const { collection } = await getFirebaseDeps();
  return collection(db, getMembersColPath(familyId));
};

// ── Family metadata ──────────────────────────────────────────────────────────────

export const fetchFamilyMeta = async (familyId) => {
  if (DATA_SOURCE !== 'firebase') return null;
  const { doc, getDoc } = await getFirebaseDeps();
  const snap = await getDoc(doc(db, 'families', familyId));
  return snap.exists() ? snap.data() : null;
};

export const createFamily = async ({ name, passwordHash, theme = null }) => {
  if (DATA_SOURCE !== 'firebase') throw new Error('Only supported with Firebase');
  const { collection, doc: docFn, setDoc } = await getFirebaseDeps();
  const familiesCol = collection(db, 'families');
  const newRef = docFn(familiesCol);
  await setDoc(newRef, {
    name,
    passwordHash: passwordHash || '',
    createdAt: new Date().toISOString(),
    ...(theme ? { theme } : {}),
  });
  return newRef.id;
};

// ── Members ───────────────────────────────────────────────────────────────────────

export const createFirstMember = async (newData, familyId = null) => {
  if (DATA_SOURCE !== 'firebase') throw new Error('Only supported with Firebase');
  const { collection: col, doc: docFn, setDoc } = await getFirebaseDeps();
  const membersCol = col(db, getMembersColPath(familyId));
  const newRef = docFn(membersCol);
  const newId = newRef.id;
  const doc = {
    id: newId,
    data: {
      firstName:  newData.firstName,
      lastName:   newData.lastName,
      birthday:   newData.birthday || null,
      death:      newData.death    || null,
      occupation: '',
      image:      newData.image || 'default',
      gender:     newData.gender || 'M',
      family:     '',
      reliable:   true,
    },
    rels: {},
  };
  await setDoc(newRef, doc);
  return { newId, newMemberDocument: doc };
};

export const fetchFamilyMembers = async (familyId = null) => {
  if (DATA_SOURCE === 'local') {
    const response = await fetch('/data/data.json');
    if (!response.ok) throw new Error('Failed to fetch local data');
    return await response.json();
  }
  if (DATA_SOURCE !== 'firebase') return [];

  const { getDocs } = await getFirebaseDeps();
  const col = await getMembersCol(familyId);
  const snapshot = await getDocs(col);
  return snapshot.docs.map(d => ({
    _firestoreId: d.id,
    id: d.id,
    ...d.data(),
  }));
};

export const updateFamilyMember = async (firestoreId, updatedData, familyId = null) => {
  if (DATA_SOURCE !== 'firebase') return;
  const { doc, updateDoc } = await getFirebaseDeps();
  await updateDoc(doc(db, getMembersColPath(familyId), firestoreId), updatedData);
};

export const updateFamilyMemberByInternalId = async (internalId, updatedData, familyId = null) => {
  if (DATA_SOURCE !== 'firebase') return;
  const { doc, updateDoc, getDocs } = await getFirebaseDeps();
  const col = await getMembersCol(familyId);
  const snapshot = await getDocs(col);
  const found = snapshot.docs.find(d => d.data().id === internalId);
  if (!found) throw new Error(`No member with internal id: ${internalId}`);
  await updateDoc(doc(db, getMembersColPath(familyId), found.id), updatedData);
};

export const addFamilyMemberWithRelation = async (
  newData,
  relationType,
  relatedPerson,
  otherParentPerson = null,
  familyId = null,
) => {
  if (DATA_SOURCE !== 'firebase') throw new Error('Only supported with Firebase');

  const { collection: col, doc: docFn, writeBatch, arrayUnion } = await getFirebaseDeps();

  const colPath    = getMembersColPath(familyId);
  const membersCol = col(db, colPath);
  const newDocRef  = docFn(membersCol);
  const newId      = newDocRef.id;

  const newMemberRels      = {};
  const relatedPersonUpdate = {};
  let existingOtherParent  = null;

  switch (relationType) {
    case 'father': {
      newMemberRels.children = [relatedPerson.id];
      relatedPersonUpdate['rels.father'] = newId;
      const existingMotherId = relatedPerson.rels?.mother;
      if (existingMotherId) {
        existingOtherParent = { id: existingMotherId };
        newMemberRels.spouses = [existingMotherId];
      }
      break;
    }
    case 'mother': {
      newMemberRels.children = [relatedPerson.id];
      relatedPersonUpdate['rels.mother'] = newId;
      const existingFatherId = relatedPerson.rels?.father;
      if (existingFatherId) {
        existingOtherParent = { id: existingFatherId };
        newMemberRels.spouses = [existingFatherId];
      }
      break;
    }
    case 'spouse':
      newMemberRels.spouses = [relatedPerson.id];
      relatedPersonUpdate['rels.spouses'] = [
        ...(relatedPerson.rels?.spouses || []),
        newId,
      ];
      break;
    case 'child':
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
      firstName:  newData.firstName,
      lastName:   newData.lastName,
      birthday:   newData.birthday || null,
      death:      newData.death    || null,
      occupation: '',
      image:      newData.image || 'default',
      gender:     newData.gender || 'M',
      family:     relatedPerson.data?.family || '',
      reliable:   true,
    },
    rels: newMemberRels,
  };

  const relatedFirestoreId = relatedPerson._firestoreId || relatedPerson.id;
  const batch = writeBatch(db);
  batch.set(newDocRef, newMemberDocument);
  batch.update(docFn(db, colPath, relatedFirestoreId), relatedPersonUpdate);

  if (existingOtherParent) {
    batch.update(docFn(db, colPath, existingOtherParent.id), {
      'rels.spouses': arrayUnion(newId),
    });
  }

  if (relationType === 'child' && otherParentPerson) {
    batch.update(docFn(db, colPath, otherParentPerson._firestoreId || otherParentPerson.id), {
      'rels.children': [...(otherParentPerson.rels?.children || []), newId],
    });
  }

  await batch.commit();
  return { newId, newMemberDocument, existingOtherParentId: existingOtherParent?.id || null };
};

export const deleteFamilyMemberAndCleanRefs = async (personId, allFamilyData, familyId = null) => {
  if (DATA_SOURCE !== 'firebase') throw new Error('Only supported with Firebase');

  const { doc: docFn, writeBatch, deleteField, arrayRemove } = await getFirebaseDeps();
  const colPath = getMembersColPath(familyId);
  const target  = allFamilyData.find(p => p.id === personId);
  if (!target) throw new Error(`Person "${personId}" not found`);

  const batch = writeBatch(db);
  batch.delete(docFn(db, colPath, target._firestoreId || target.id));

  for (const person of allFamilyData) {
    if (person.id === personId) continue;
    const updates = {};
    if (person.rels?.father === personId)           updates['rels.father']   = deleteField();
    if (person.rels?.mother === personId)           updates['rels.mother']   = deleteField();
    if (person.rels?.spouses?.includes(personId))  updates['rels.spouses']  = arrayRemove(personId);
    if (person.rels?.children?.includes(personId)) updates['rels.children'] = arrayRemove(personId);
    if (Object.keys(updates).length > 0) {
      batch.update(docFn(db, colPath, person._firestoreId || person.id), updates);
    }
  }

  await batch.commit();
};


