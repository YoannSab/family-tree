import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDisclosure, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import CryptoJS from 'crypto-js';
import { fetchFamilyMembers, addFamilyMemberWithRelation, deleteFamilyMemberAndCleanRefs, createFirstMember, updateFamilyMember } from '../services/familyService';
import { prefetchImageUrls, uploadImage, deleteImageFromStorage } from '../services/storageService';
import { FAMILY_CONFIG as DEFAULT_FAMILY_CONFIG, THEME } from '../config/config';

// Custom hook for responsive design that updates in real-time
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    updateScreenSize();
    let timeoutId;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenSize, 150);
    };
    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenSize;
};

export const useApp = ({ familyId = null, familyConfigProp = null, passwordHash = '' } = {}) => {
  const FAMILY_CONFIG = familyConfigProp || DEFAULT_FAMILY_CONFIG;
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isFamilyDataLoaded, setIsFamilyDataLoaded] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [familyData, setFamilyData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isPersonEditingMode, setIsPersonEditingMode] = useState(false);
  const { isOpen: isStatsModalOpen, onOpen: onStatsModalOpen, onClose: onStatsModalClose } = useDisclosure();
  const { isOpen: isPersonDrawerOpen, onOpen: onPersonDrawerOpen, onClose: onPersonDrawerClose } = useDisclosure();
  const { isOpen: isFaceRecognitionOpen, onOpen: onFaceRecognitionOpen, onClose: onFaceRecognitionClose } = useDisclosure();
  const { isOpen: isUpcomingEventsOpen, onOpen: onUpcomingEventsOpen, onClose: onUpcomingEventsClose } = useDisclosure();
  const { isOpen: isAddMemberOpen, onOpen: onAddMemberOpen, onClose: onAddMemberClose } = useDisclosure();
  const { isOpen: isDeleteConfirmOpen, onOpen: onDeleteConfirmOpen, onClose: onDeleteConfirmClose } = useDisclosure();
  const { isOpen: isCreateFirstMemberOpen, onOpen: onCreateFirstMemberOpen, onClose: onCreateFirstMemberClose } = useDisclosure();

  const toast = useToast();

  // Context menu state
  const [contextMenuPerson,   setContextMenuPerson]   = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isContextMenuOpen,   setIsContextMenuOpen]   = useState(false);

  // Add-member modal state
  const [addRelationType,    setAddRelationType]    = useState(null);
  const [addMemberSpouses,   setAddMemberSpouses]   = useState([]);

  // Delete-confirm modal state
  const [personToDelete,     setPersonToDelete]     = useState(null);

  // Loading state shared by both operations
  const [memberActionLoading, setMemberActionLoading] = useState(false);

  const drawerRef = useRef(null);
  const drawerHeaderRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const isDragging = useRef(false);
  const canSwipe = useRef(false);
  const isPersonEditingModeRef = useRef(isPersonEditingMode);
  const selectedPersonRef = useRef(selectedPerson);
  const resetTreeViewRef = useRef(null);
  const centerOnPersonRef = useRef(null);

  const { isMobile, isTablet, isDesktop } = useResponsive();
  const bgColor = THEME.bgPage;
  const cardBg = THEME.bgSurface;

  // ── Auth check — runs from localStorage, no component mounting required ──
  useEffect(() => {
    if (!passwordHash) {
      setIsAuthenticated(true);
      setIsAuthChecked(true);
      return;
    }
    const stored = localStorage.getItem(`familyTreePassword_${passwordHash}`);
    if (stored && CryptoJS.SHA256(stored).toString() === passwordHash) {
      setIsAuthenticated(true);
    }
    setIsAuthChecked(true);
  }, [passwordHash]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFamilyMembers(familyId);
      setFamilyData(data);
      setIsFamilyDataLoaded(true);
      // Prefetch images in background — cache updates are broadcast via
      // subscribeToCacheUpdate so the D3 tree patches avatars in-place.
      prefetchImageUrls(familyId, data);
    };
    fetchData();
  }, [familyId]);

  useEffect(() => {
    isPersonEditingModeRef.current = isPersonEditingMode;
  }, [isPersonEditingMode]);

  useEffect(() => {
    selectedPersonRef.current = selectedPerson;
  }, [selectedPerson]);

  const handlePersonUpdate = useCallback((updatedPerson) => {
    setFamilyData(prevData =>
      prevData.map(person =>
        person.id === updatedPerson.id ? updatedPerson : person
      )
    );
    if (selectedPerson && selectedPerson.id === updatedPerson.id) {
      setSelectedPerson(updatedPerson);
    }
  }, [selectedPerson]);

  useEffect(() => {
    if (isDesktop && isPersonDrawerOpen) {
      onPersonDrawerClose();
    }
  }, [isDesktop, isPersonDrawerOpen, onPersonDrawerClose]);

  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;

    const rect = drawerRef.current?.getBoundingClientRect();
    if (rect) {
      const touchY = e.touches[0].clientY;
      const headerHeight = 100;
      canSwipe.current = touchY - rect.top <= headerHeight;
    }

    if (canSwipe.current) {
      touchStartY.current = e.touches[0].clientY;
      isDragging.current = false;
    }
  }, [isMobile]);

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !canSwipe.current) return;

    touchEndY.current = e.touches[0].clientY;
    const diff = touchEndY.current - touchStartY.current;

    if (diff > 10) {
      isDragging.current = true;
    }
  }, [isMobile]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isDragging.current || !canSwipe.current) return;

    const swipeDistance = touchEndY.current - touchStartY.current;
    const minSwipeDistance = 80;

    if (swipeDistance > minSwipeDistance) {
      onPersonDrawerClose();
    }

    touchStartY.current = 0;
    touchEndY.current = 0;
    isDragging.current = false;
    canSwipe.current = false;
  }, [isMobile, onPersonDrawerClose]);

  const handlePersonClick = useCallback((person) => {
    if (isPersonEditingModeRef.current) {
      setIsPersonEditingMode(false);
    }
    setSelectedPerson(person);
    
    // Center the tree on the selected person
    if (centerOnPersonRef.current) {
      centerOnPersonRef.current(person);
    }
  }, []);

  const handleFaceRecognitionPersonSelect = useCallback((person) => {
    if (isPersonEditingMode) {
      setIsPersonEditingMode(false);
    }
    onFaceRecognitionClose();
    setSelectedPerson(person);
    if (isMobile || isTablet) {
      onPersonDrawerOpen();
    }
    
    // Center the tree on the selected person
    if (centerOnPersonRef.current) {
      centerOnPersonRef.current(person);
    }
  }, [isPersonEditingMode, onFaceRecognitionClose, isMobile, isTablet, onPersonDrawerOpen]);

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      const results = familyData.filter(person =>
        person.data.firstName.toLowerCase().includes(query.toLowerCase()) ||
        person.data.lastName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [familyData]);

  const handleSearchSelect = useCallback((person) => {
    if (isPersonEditingMode && selectedPerson && person.id !== selectedPerson.id) {
      setIsPersonEditingMode(false);
    }
    setSelectedPerson(person);
    if (isMobile) {
      onPersonDrawerOpen();
    }
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
    
    // Center the tree on the selected person
    if (centerOnPersonRef.current) {
      centerOnPersonRef.current(person);
    }
  }, [isPersonEditingMode, selectedPerson, isMobile, onPersonDrawerOpen]);

  const handleUnlock = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleAuthChecked = useCallback(() => {
    // kept for PasswordProtection compat but no longer needed for the gate
    setIsAuthChecked(true);
  }, []);

  const handleResetView = useCallback((resetFunction) => {
    resetTreeViewRef.current = resetFunction;
  }, []);

  const handleCenterPerson = useCallback((centerFunction) => {
    centerOnPersonRef.current = centerFunction;
  }, []);

  const resetTreeView = useCallback(() => {
    if (resetTreeViewRef.current) {
      resetTreeViewRef.current();
    }
  }, []);

  // ── Create first member (empty tree) ────────────────────────────────────────
  const handleCreateFirstMember = useCallback(async (newData) => {
    setMemberActionLoading(true);
    try {
      const { imageFile, ...memberData } = newData;
      const { newId, newMemberDocument } = await createFirstMember(memberData, familyId);

      if (imageFile && familyId) {
        try {
          const filename = await uploadImage(familyId, newId, memberData.firstName, memberData.lastName, imageFile);
          await updateFamilyMember(newId, { 'data.image': filename }, familyId);
          newMemberDocument.data.image = filename;
        } catch (uploadErr) {
          console.warn('Photo upload failed (member created without photo):', uploadErr);
        }
      }

      setFamilyData([{ ...newMemberDocument, _firestoreId: newId }]);
      onCreateFirstMemberClose();
      toast({ title: t('memberAdded'), status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      console.error('Failed to create first member:', err);
      toast({ title: t('error'), description: err.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setMemberActionLoading(false);
    }
  }, [familyId, onCreateFirstMemberClose, toast, t]);

  // ── Re-fetch family data from Firestore ────────────────────────────────────
  const refreshFamilyData = useCallback(async () => {
    const data = await fetchFamilyMembers(familyId);
    setFamilyData(data);
  }, [familyId]);

  // ── Context menu ───────────────────────────────────────────────────────────
  const handleContextMenu = useCallback((person, position) => {
    setContextMenuPerson(person);
    setContextMenuPosition(position);
    setIsContextMenuOpen(true);
  }, []);

  const closeContextMenu = useCallback(() => {
    setIsContextMenuOpen(false);
  }, []);

  const handleOpenAddMember = useCallback((relationType) => {
    setAddRelationType(relationType);
    if (relationType === 'child' && contextMenuPerson) {
      const spouseIds = contextMenuPerson.rels?.spouses || [];
      setAddMemberSpouses(familyData.filter(p => spouseIds.includes(p.id)));
    } else {
      setAddMemberSpouses([]);
    }
    onAddMemberOpen();
  }, [onAddMemberOpen, contextMenuPerson, familyData]);

  // ── Add member ─────────────────────────────────────────────────────────────
  const handleAddMemberSubmit = useCallback(async (newData) => {
    if (!contextMenuPerson || !addRelationType) return;

    // Extract spouse selection and optional image file before passing to service
    const { selectedSpouseId, imageFile, ...memberData } = newData;
    const otherParentPerson = selectedSpouseId
      ? familyData.find(p => p.id === selectedSpouseId) ?? null
      : null;

    setMemberActionLoading(true);
    try {
      const { newId, newMemberDocument, existingOtherParentId } = await addFamilyMemberWithRelation(
        memberData, addRelationType, contextMenuPerson, otherParentPerson, familyId
      );

      // Upload photo after member creation so we have the newId for the filename
      if (imageFile && familyId) {
        try {
          const filename = await uploadImage(familyId, newId, memberData.firstName, memberData.lastName, imageFile);
          await updateFamilyMember(newId, { 'data.image': filename }, familyId);
          newMemberDocument.data.image = filename;
        } catch (uploadErr) {
          console.warn('Photo upload failed (member created without photo):', uploadErr);
        }
      }

      // Optimistic local update — no Firestore re-fetch needed
      const contextPersonId = contextMenuPerson.id;
      setFamilyData(prev => {
        const updated = prev.map(p => {
          if (p.id === contextPersonId) {
            const updatedRels = { ...p.rels };
            switch (addRelationType) {
              case 'father':  updatedRels.father   = newId; break;
              case 'mother':  updatedRels.mother   = newId; break;
              case 'spouse':  updatedRels.spouses  = [...(updatedRels.spouses  || []), newId]; break;
              case 'child':   updatedRels.children = [...(updatedRels.children || []), newId]; break;
            }
            return { ...p, rels: updatedRels };
          }
          // existing opposite parent gets the new parent wired as a spouse
          if (existingOtherParentId && p.id === existingOtherParentId) {
            return { ...p, rels: { ...p.rels, spouses: [...(p.rels?.spouses || []), newId] } };
          }
          if (otherParentPerson && p.id === otherParentPerson.id) {
            return { ...p, rels: { ...p.rels, children: [...(p.rels?.children || []), newId] } };
          }
          return p;
        });
        return [...updated, { ...newMemberDocument, _firestoreId: newId }];
      });

      onAddMemberClose();
      toast({ title: t('memberAdded'), status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      console.error('Failed to add member:', err);
      toast({ title: t('error'), description: err.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setMemberActionLoading(false);
    }
  }, [contextMenuPerson, addRelationType, familyData, onAddMemberClose, toast, t]);

  // ── Delete member ──────────────────────────────────────────────────────────
  const handleOpenDeleteConfirm = useCallback(() => {
    if (!contextMenuPerson) return;
    setPersonToDelete(contextMenuPerson);
    onDeleteConfirmOpen();
  }, [contextMenuPerson, onDeleteConfirmOpen]);

  const handleDeleteMember = useCallback(async () => {
    if (!personToDelete) return;
    setMemberActionLoading(true);
    try {
      // Delete photo from Storage first (silently ignores errors)
      const imageFilename = personToDelete.data?.image;
      if (familyId && imageFilename && imageFilename !== 'default') {
        await deleteImageFromStorage(familyId, imageFilename);
      }
      await deleteFamilyMemberAndCleanRefs(personToDelete.id, familyData, familyId);

      // Optimistic local update — no Firestore re-fetch needed
      const deletedId = personToDelete.id;
      setFamilyData(prev =>
        prev
          .filter(p => p.id !== deletedId)
          .map(p => {
            const rels = { ...p.rels };
            let changed = false;
            if (rels.father === deletedId)             { delete rels.father;  changed = true; }
            if (rels.mother === deletedId)             { delete rels.mother;  changed = true; }
            if (rels.spouses?.includes(deletedId))    { rels.spouses  = rels.spouses.filter(id => id !== deletedId);  changed = true; }
            if (rels.children?.includes(deletedId))   { rels.children = rels.children.filter(id => id !== deletedId); changed = true; }
            return changed ? { ...p, rels } : p;
          })
      );

      if (selectedPerson?.id === deletedId) setSelectedPerson(null);
      onDeleteConfirmClose();
      toast({ title: t('memberDeleted'), status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      console.error('Failed to delete member:', err);
      toast({ title: t('error'), description: err.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setMemberActionLoading(false);
      setPersonToDelete(null);
    }
  }, [personToDelete, familyData, selectedPerson, onDeleteConfirmClose, toast, t]);

  const totalMembers   = useMemo(() => familyData.length, [familyData]);
  const livingMembers  = useMemo(() => familyData.filter(p => !p.data.death || p.data.death === '').length, [familyData]);
  const deceasedMembers = useMemo(() => totalMembers - livingMembers, [totalMembers, livingMembers]);

  return {
    t,
    isAuthenticated,
    selectedPerson,
    familyData,
    searchQuery,
    searchResults,
    showSearchResults,
    isPersonEditingMode,
    isStatsModalOpen,
    isPersonDrawerOpen,
    isFaceRecognitionOpen,
    isUpcomingEventsOpen,
    drawerRef,
    drawerHeaderRef,
    isMobile,
    isTablet,
    isDesktop,
    bgColor,
    cardBg,
    onStatsModalOpen,
    onStatsModalClose,
    onPersonDrawerOpen,
    onPersonDrawerClose,
    onFaceRecognitionOpen,
    onFaceRecognitionClose,
    onUpcomingEventsOpen,
    onUpcomingEventsClose,
    handlePersonUpdate,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handlePersonClick,
    handleFaceRecognitionPersonSelect,
    handleSearchChange,
    handleSearchSelect,
    handleUnlock,
    handleAuthChecked,
    isAppReady: isAuthChecked && isFamilyDataLoaded,
    handleResetView,
    handleCenterPerson,
    resetTreeView,
    totalMembers,
    livingMembers,
    deceasedMembers,
    setIsPersonEditingMode,
    setSelectedPerson,
    FAMILY_CONFIG,
    // Context menu
    isContextMenuOpen,
    contextMenuPerson,
    contextMenuPosition,
    closeContextMenu,
    handleContextMenu,
    handleOpenAddMember,
    // Add member modal
    isAddMemberOpen,
    onAddMemberClose,
    addRelationType,
    addMemberSpouses,
    memberActionLoading,
    handleAddMemberSubmit,
    // Delete confirm modal
    isDeleteConfirmOpen,
    onDeleteConfirmClose,
    personToDelete,
    handleOpenDeleteConfirm,
    handleDeleteMember,
    // First member creation
    isCreateFirstMemberOpen,
    onCreateFirstMemberOpen,
    onCreateFirstMemberClose,
    handleCreateFirstMember,
  };
};
