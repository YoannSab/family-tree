import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDisclosure, useToast, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { updateFamilyMemberByInternalId } from '../services/familyService';
import { DATA_SOURCE } from '../config/config';

export const usePersonInfo = (person, familyData, setPerson, onPersonUpdate, isEditing, setIsEditing) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState({ src: '', name: '' });
  const [editForm, setEditForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue('linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 'gray.700');
  const italianGold = '#c8a882';
  const italianGreen = '#2d5a27';

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
          birthday: editForm.birthday ? parseInt(editForm.birthday) : person.data.birthday,
          death: editForm.death ? parseInt(editForm.death) : (editForm.death === '' ? null : person.data.death),
          occupation: editForm.occupation,
          reliable: editForm.reliable,
        },
      };
      await updateFamilyMemberByInternalId(person.id, updatedData);
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

  const handleImageClick = useCallback((imageSrc, personName) => {
    setSelectedImage({ src: imageSrc, name: personName });
    onOpen();
  }, [onOpen]);

  const isLiving = useMemo(() => !person?.data.death, [person]);
  const age = useMemo(() => {
    if (!person) return null;
    return person.data.death
      ? person.data.death - person.data.birthday
      : new Date().getFullYear() - person.data.birthday;
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
    isLiving,
    age,
    relatedPeople,
    DATA_SOURCE,
  };
};
