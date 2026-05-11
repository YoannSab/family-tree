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
import TreeContextMenu from './components/FamilyTree/TreeContextMenu.jsx';
import AddMemberModal from './components/FamilyTree/AddMemberModal.jsx';
import DeleteConfirmModal from './components/FamilyTree/DeleteConfirmModal.jsx';
import CreateFirstMemberModal from './components/FamilyTree/CreateFirstMemberModal.jsx';
import UpcomingEventsModal from './components/UpcomingEventsModal.jsx';
import TodayEventsBanner from './components/TodayEventsBanner.jsx';
import {
  Box,
  Flex,
  VStack,
  Container,
  Center,
  Button,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { useApp } from './hooks/useApp';
import { useMemo, memo, useEffect } from 'react';

// Converts #rrggbb → 'r, g, b'
const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

const applyCssVars = (theme) => {
  if (theme?.primary) {
    document.documentElement.style.setProperty('--theme-primary',        theme.primary);
    document.documentElement.style.setProperty('--theme-primary-dark',   theme.primaryDark    || theme.primary);
    document.documentElement.style.setProperty('--theme-primary-darker', theme.primaryDarker  || theme.primary);
    document.documentElement.style.setProperty('--theme-primary-rgb',    hexToRgb(theme.primary));
  }
  if (theme?.accent) {
    document.documentElement.style.setProperty('--theme-accent',     theme.accent);
    document.documentElement.style.setProperty('--theme-accent-dark', theme.accentDark || theme.accent);
    document.documentElement.style.setProperty('--theme-accent-rgb',  hexToRgb(theme.accent));
  }
  if (theme?.flagLeft)  document.documentElement.style.setProperty('--theme-flag-left',  theme.flagLeft);
  if (theme?.flagRight) document.documentElement.style.setProperty('--theme-flag-right', theme.flagRight);
};

const App = memo(({ familyId = null, familyConfig: familyConfigProp = null, passwordHash = '', theme = null }) => {
  // Apply per-family theme CSS vars whenever theme changes
  useEffect(() => {
    if (theme) applyCssVars(theme);
  }, [theme]);

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
    isUpcomingEventsOpen,
    onUpcomingEventsOpen,
    onUpcomingEventsClose,
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
    handleAuthChecked,
    isAppReady,
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
  } = useApp({ familyId, familyConfigProp, passwordHash });

  const memoizedFamilyData = useMemo(() => familyData, [familyData]);
  const memoizedSelectedPerson = useMemo(() => selectedPerson, [selectedPerson]);
  const memoizedSearchResults = useMemo(() => searchResults, [searchResults]);

  // Show full-screen spinner until auth check AND initial data fetch are both settled
  if (!isAppReady) {
    return (
      <Center minH="100vh" bg="var(--theme-bg-page)">
        <Spinner size="xl" color="var(--theme-primary)" thickness="4px" speed="0.7s" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <PasswordProtection onUnlock={handleUnlock} passwordHash={passwordHash} />;
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Header
        onStatsModalOpen={onStatsModalOpen}
        onUpcomingEventsOpen={onUpcomingEventsOpen}
        totalMembers={totalMembers}
        livingMembers={livingMembers}
        deceasedMembers={deceasedMembers}
        FAMILY_CONFIG={FAMILY_CONFIG}
        isMobile={isMobile}
        familyData={memoizedFamilyData}
      />
      <TodayEventsBanner
        familyData={memoizedFamilyData}
        familyId={familyId}
        onPersonClick={handlePersonClick}
        onOpenModal={onUpcomingEventsOpen}
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
          <VStack spacing={{ base: 3, md: 4 }} p={{ base: 3, md: 3 }} align="stretch">
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
                 {/* Mobile "See more" button */}
                {isMobile && (
                  <MobilePersonButton
                    selectedPerson={memoizedSelectedPerson}
                    onPersonDrawerOpen={onPersonDrawerOpen}
                    t={t}
                  />
                )}
                {familyData.length === 0 ? (
                  <Center
                    h="400px"
                    flexDirection="column"
                    gap={5}
                    bg={`linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-dark) 100%)`}
                    borderRadius="12px"
                    border={`3px solid var(--theme-accent)`}
                    boxShadow={`0 8px 32px rgba(var(--theme-primary-rgb), 0.3)`}
                  >
                    <Text fontSize="5xl">🌱</Text>
                    <Text color="white" fontSize="lg" fontWeight="semibold" textAlign="center">
                      {t('emptyTreeTitle', 'This family tree is empty')}
                    </Text>
                    <Text color="whiteAlpha.700" fontSize="sm" textAlign="center" px={8}>
                      {t('emptyTreeSubtitle', 'Add the first person to get started')}
                    </Text>
                    <Button
                      bg={'var(--theme-accent)'}
                      color={'var(--theme-primary-darker)'}
                      _hover={{ bg: 'var(--theme-accent-dark)', color: 'white' }}
                      fontWeight="bold"
                      size="lg"
                      onClick={onCreateFirstMemberOpen}
                    >
                      {t('addFirstPerson', '+ Add first person')}
                    </Button>
                  </Center>
                ) : (
                  <FamilyTree
                    onPersonClick={handlePersonClick}
                    familyData={memoizedFamilyData}
                    onResetView={handleResetView}
                    onCenterPerson={handleCenterPerson}
                    onContextMenu={handleContextMenu}
                    familyId={familyId}
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
                  familyId={familyId}
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
        familyId={familyId}
        t={t}
      />

      {/* Stats Modal */}
      <FamilyStatsModal
        isOpen={isStatsModalOpen}
        onClose={onStatsModalClose}
        familyData={memoizedFamilyData}
      />

      {/* Upcoming Events Modal */}
      <UpcomingEventsModal
        isOpen={isUpcomingEventsOpen}
        onClose={onUpcomingEventsClose}
        familyData={memoizedFamilyData}
        familyId={familyId}
        onPersonClick={handlePersonClick}
      />

      {/* Face Recognition Modal */}
      <FaceRecognition
        isOpen={isFaceRecognitionOpen}
        onClose={onFaceRecognitionClose}
        familyData={memoizedFamilyData}
        onPersonSelect={handleFaceRecognitionPersonSelect}
        familyId={familyId}
      />

      {/* ── Dynamic member management ────────────────────────────────────── */}
      {isContextMenuOpen && contextMenuPerson && (
        <TreeContextMenu
          person={contextMenuPerson}
          position={contextMenuPosition}
          onClose={closeContextMenu}
          onAddFather={() => handleOpenAddMember('father')}
          onAddMother={() => handleOpenAddMember('mother')}
          onAddSpouse={() => handleOpenAddMember('spouse')}
          onAddChild={() => handleOpenAddMember('child')}
          onDelete={handleOpenDeleteConfirm}
        />
      )}

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={onAddMemberClose}
        relationType={addRelationType}
        relatedPerson={contextMenuPerson}
        spouses={addMemberSpouses}
        onSubmit={handleAddMemberSubmit}
        isLoading={memberActionLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={onDeleteConfirmClose}
        person={personToDelete}
        onConfirm={handleDeleteMember}
        isLoading={memberActionLoading}
      />

      <CreateFirstMemberModal
        isOpen={isCreateFirstMemberOpen}
        onClose={onCreateFirstMemberClose}
        onSubmit={handleCreateFirstMember}
        isLoading={memberActionLoading}
      />
    </Box>
  );
});

App.displayName = 'App';

export default App;
