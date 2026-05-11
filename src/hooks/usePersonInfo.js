import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDisclosure, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { updateFamilyMemberByInternalId } from '../services/familyService';
import { DATA_SOURCE, THEME } from '../config/config';
import { uploadImage, deleteImageFromStorage, getImageUrl } from '../services/storageService';
import { parseDate } from '../utils/dateUtils';

export const usePersonInfo = (person, familyData, setPerson, onPersonUpdate, isEditing, setIsEditing, familyId = null) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState({ src: '', name: '' });
  const [editForm, setEditForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const cardBg = THEME.bgCard;
  const italianGold = 'var(--theme-accent)';
  const italianGreen = 'var(--theme-primary)';

  useEffect(() => {
    if (person) {
      setEditForm({
        firstName: person.data.firstName || '',
        lastName: person.data.lastName || '',
        birthday: person.data.birthday || '',
        death: person.data.death || '',
        occupation: person.data.occupation || '',
        reliable: person.data.reliable !== false,
      });
    }
  }, [person]);

  const handleEditStart = useCallback(() => {
    setIsEditing(true);
  }, [setIsEditing]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    if (person) {
      setEditForm({
        firstName: person.data.firstName || '',
        lastName: person.data.lastName || '',
        birthday: person.data.birthday || '',
        death: person.data.death || '',
        occupation: person.data.occupation || '',
        reliable: person.data.reliable !== false,
      });
    }
  }, [setIsEditing, person]);

  const handleEditSave = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedData = {
        data: {
          ...person.data,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          birthday: editForm.birthday ? String(editForm.birthday).trim() : (person.data.birthday != null ? String(person.data.birthday) : null),
          death: editForm.death !== undefined ? (editForm.death === '' ? null : String(editForm.death).trim()) : (person.data.death != null ? String(person.data.death) : null),
          occupation: editForm.occupation,
          reliable: editForm.reliable,
        },
      };
      await updateFamilyMemberByInternalId(person.id, updatedData, familyId);
      const updatedPerson = { ...person, ...updatedData };
      setPerson(updatedPerson);
      if (onPersonUpdate) {
        onPersonUpdate(updatedPerson);
      }
      setIsEditing(false);
      toast({
        title: t('updateSuccess'),
        description: t('personInformationUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: t('updateError'),
        description: t('errorUpdatingPerson'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [person, editForm, setPerson, onPersonUpdate, setIsEditing, t, toast]);

  const handleInputChange = useCallback((field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleImageClick = useCallback(async (imageSrc, personName) => {
    if (!imageSrc) return; // no image — don't open modal
    // Resolve the actual URL if we only have a filename (not a blob/http/local URL)
    let resolvedSrc = imageSrc;
    const isResolved = imageSrc.startsWith('http') || imageSrc.startsWith('blob:') || imageSrc.startsWith('/');
    if (!isResolved && familyId) {
      resolvedSrc = await getImageUrl(familyId, imageSrc);
    }
    if (!resolvedSrc) return; // image failed to load
    setSelectedImage({ src: resolvedSrc, name: personName });
    onOpen();
  }, [onOpen, familyId]);

  const handlePhotoUpload = useCallback(async (file) => {
    if (!file || DATA_SOURCE !== 'firebase') return;
    setIsLoading(true);
    try {
      const oldFilename = person.data.image;
      const filename = await uploadImage(
        familyId,
        person.id,
        editForm.firstName || person.data.firstName,
        editForm.lastName  || person.data.lastName,
        file,
      );
      const updatedData = { data: { ...person.data, image: filename } };
      await updateFamilyMemberByInternalId(person.id, updatedData, familyId);
      // Delete old photo from Storage only if it's a DIFFERENT file.
      // buildImageFilename is deterministic (firstName+lastName+personId),
      // so re-uploading for the same person often generates the same filename —
      // in that case Firebase Storage already overwrote it in place; don't delete.
      if (oldFilename && oldFilename !== 'default' && oldFilename !== filename) {
        deleteImageFromStorage(familyId, oldFilename);
      }
      const updatedPerson = { ...person, ...updatedData };
      setPerson(updatedPerson);
      if (onPersonUpdate) onPersonUpdate(updatedPerson);
      setIsEditing(false);
      toast({ title: t('photoUpdated'), status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      console.error('Photo upload failed:', err);
      toast({ title: t('uploadError'), description: err.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  }, [person, familyId, editForm, setPerson, onPersonUpdate, setIsEditing, toast, t]);

  const isLiving = useMemo(() => !person?.data.death, [person]);
  const age = useMemo(() => {
    if (!person) return null;
    const birthParsed = parseDate(person.data.birthday);
    const deathParsed = parseDate(person.data.death);
    if (!birthParsed) return null;
    return deathParsed
      ? deathParsed.year - birthParsed.year
      : new Date().getFullYear() - birthParsed.year;
  }, [person]);

  const relatedPeople = useMemo(() => {
    if (!person || !familyData) return { spouses: [], children: [], parents: [], siblings: [] };
    const spouses = person.rels.spouses ? familyData.filter(p => person.rels.spouses.includes(p.id)) : [];
    const children = person.rels.children ? familyData.filter(p => person.rels.children.includes(p.id)) : [];
    const parents = familyData.filter(p => p.rels.children && p.rels.children.includes(person.id));
    const siblings = familyData.filter(p =>
      p.id !== person.id &&
      parents.some(parent => parent.rels.children && parent.rels.children.includes(p.id))
    );
    return { spouses, children, parents, siblings };
  }, [person, familyData]);

  return {
    t,
    isOpen,
    onClose,
    selectedImage,
    editForm,
    isLoading,
    cardBg,
    italianGold,
    italianGreen,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    handleInputChange,
    handleImageClick,
    handlePhotoUpload,
    isLiving,
    age,
    relatedPeople,
    DATA_SOURCE,
  };
};
