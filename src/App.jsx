import './css/App.css';
import FamilyTree from './components/FamilyTree.jsx';
import FamilyStatsModal from './components/FamilyStatsModal.jsx';
import FaceRecognition from './components/FaceRecognition.jsx';
import PasswordProtection from './components/PasswordProtection.jsx';
import Header from './components/App/Header.jsx';
import TreeSectionHeader from './components/App/TreeSectionHeader.jsx';
import MobilePersonButton from './components/App/MobilePersonButton.jsx';
import DesktopPersonInfo from './components/App/DesktopPersonInfo.jsx';
import MobilePersonDrawer from './components/App/MobilePersonDrawer.jsx';
import {
  Box,
  Flex,
  VStack,
  Container,
} from '@chakra-ui/react';
import { useApp } from './hooks/useApp';
import { useMemo, memo } from 'react';

const App = memo(() => {
  const {
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
    handleResetView,
    handleCenterPerson,
    resetTreeView,
    totalMembers,
    livingMembers,
    deceasedMembers,
    setIsPersonEditingMode,
    setSelectedPerson,
    FAMILY_CONFIG,
  } = useApp();

  const memoizedFamilyData = useMemo(() => familyData, [familyData]);
  const memoizedSelectedPerson = useMemo(() => selectedPerson, [selectedPerson]);
  const memoizedSearchResults = useMemo(() => searchResults, [searchResults]);

  if (!isAuthenticated) {
    return <PasswordProtection onUnlock={handleUnlock} />;
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Header
        onStatsModalOpen={onStatsModalOpen}
        totalMembers={totalMembers}
        livingMembers={livingMembers}
        deceasedMembers={deceasedMembers}
        FAMILY_CONFIG={FAMILY_CONFIG}
        isMobile={isMobile}
      />
      {/* Main Content */}
      <Container maxW="full" px={0}>
        {/* Family Tree Section */}
        <Box
          flex="1"
          bg={cardBg}
          borderRight={{ base: "none", md: "1px" }}
          borderColor="gray.200"
        >
          <VStack spacing={{ base: 3, md: 4 }} p={{ base: 3, md: 6 }} align="stretch">
            {/* Section Header */}
            <TreeSectionHeader
              t={t}
              isMobile={isMobile}
              searchQuery={searchQuery}
              showSearchResults={showSearchResults}
              searchResults={memoizedSearchResults}
              handleSearchChange={handleSearchChange}
              handleSearchSelect={handleSearchSelect}
              onFaceRecognitionOpen={onFaceRecognitionOpen}
              onResetView={resetTreeView}
            />

            <Flex flexDirection='row' gap={6} alignItems="stretch">
              <VStack spacing={4} alignItems="stretch" flex={1}>
                <FamilyTree 
                  onPersonClick={handlePersonClick} 
                  familyData={memoizedFamilyData} 
                  onResetView={handleResetView}
                  onCenterPerson={handleCenterPerson}
                />
                {/* Mobile "See more" button */}
                {isMobile && (
                  <MobilePersonButton
                    selectedPerson={memoizedSelectedPerson}
                    onPersonDrawerOpen={onPersonDrawerOpen}
                    t={t}
                  />
                )}
              </VStack>

              {/* Desktop Person Info */}
              {!isMobile && (
                <DesktopPersonInfo
                  selectedPerson={memoizedSelectedPerson}
                  familyData={memoizedFamilyData}
                  setSelectedPerson={setSelectedPerson}
                  isTablet={isTablet}
                  handlePersonUpdate={handlePersonUpdate}
                  isPersonEditingMode={isPersonEditingMode}
                  setIsPersonEditingMode={setIsPersonEditingMode}
                  handlePersonClick={handlePersonClick}
                  t={t}
                />
              )}
            </Flex>
          </VStack>
        </Box>
      </Container>
      {/* Mobile Person Details Drawer */}
      <MobilePersonDrawer
        isPersonDrawerOpen={isPersonDrawerOpen}
        onPersonDrawerClose={onPersonDrawerClose}
        drawerRef={drawerRef}
        drawerHeaderRef={drawerHeaderRef}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        selectedPerson={memoizedSelectedPerson}
        familyData={memoizedFamilyData}
        setSelectedPerson={setSelectedPerson}
        handlePersonUpdate={handlePersonUpdate}
        isPersonEditingMode={isPersonEditingMode}
        setIsPersonEditingMode={setIsPersonEditingMode}
        handlePersonClick={handlePersonClick}
        FAMILY_CONFIG={FAMILY_CONFIG}
        t={t}
      />

      {/* Stats Modal */}
      <FamilyStatsModal
        isOpen={isStatsModalOpen}
        onClose={onStatsModalClose}
        familyData={memoizedFamilyData}
      />

      {/* Face Recognition Modal */}
      <FaceRecognition
        isOpen={isFaceRecognitionOpen}
        onClose={onFaceRecognitionClose}
        familyData={memoizedFamilyData}
        onPersonSelect={handleFaceRecognitionPersonSelect}
      />
    </Box>
  );
});

App.displayName = 'App';

export default App;
