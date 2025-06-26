import { useState, useEffect, useRef, useCallback } from 'react';
import { useDisclosure, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { fetchFamilyMembers } from '../services/familyService';
import { FAMILY_CONFIG } from '../config/config';

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
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

export const useApp = () => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [familyData, setFamilyData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isPersonEditingMode, setIsPersonEditingMode] = useState(false);
  const { isOpen: isStatsModalOpen, onOpen: onStatsModalOpen, onClose: onStatsModalClose } = useDisclosure();
  const { isOpen: isPersonDrawerOpen, onOpen: onPersonDrawerOpen, onClose: onPersonDrawerClose } = useDisclosure();
  const { isOpen: isFaceRecognitionOpen, onOpen: onFaceRecognitionOpen, onClose: onFaceRecognitionClose } = useDisclosure();

  const drawerRef = useRef(null);
  const drawerHeaderRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const isDragging = useRef(false);
  const canSwipe = useRef(false);
  const isPersonEditingModeRef = useRef(isPersonEditingMode);

  const { isMobile, isTablet, isDesktop } = useResponsive();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFamilyMembers();
      setFamilyData(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    isPersonEditingModeRef.current = isPersonEditingMode;
  }, [isPersonEditingMode]);

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
  }, [isPersonEditingMode, onFaceRecognitionClose, isMobile, isTablet, onPersonDrawerOpen]);

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
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
  }, [isPersonEditingMode, selectedPerson, isMobile, onPersonDrawerOpen]);

  const handleUnlock = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const totalMembers = familyData.length;
  const livingMembers = familyData.filter(p => !p.data.death || p.data.death === "").length;
  const deceasedMembers = totalMembers - livingMembers;

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
    handlePersonUpdate,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handlePersonClick,
    handleFaceRecognitionPersonSelect,
    handleSearchChange,
    handleSearchSelect,
    handleUnlock,
    totalMembers,
    livingMembers,
    deceasedMembers,
    setIsPersonEditingMode,
    setSelectedPerson,
    FAMILY_CONFIG,
  };
};
