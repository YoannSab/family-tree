import './App.css';
import FamilyTree from './components/FamilyTree.jsx';
import PersonInfo from './components/PersonInfo.jsx';
import FamilyStatsModal from './components/FamilyStatsModal.jsx';
import FaceRecognition from './components/FaceRecognition.jsx';
import PasswordProtection from './components/PasswordProtection.jsx';
import Header from './components/Header.jsx';
import {
  Box,
  Flex,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Container,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Spacer,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Collapse,
  Divider,
  InputRightElement,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ViewIcon, SearchIcon } from '@chakra-ui/icons';
import { FiCamera } from 'react-icons/fi';
import { useApp } from './hooks/useApp';
import { useMemo } from 'react';

export default function App() {
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
      />
      {/* Main Content */}
      <Container maxW="full" px={0}>
        <Flex direction={{ base: 'column', lg: 'row' }} minH={{ base: "calc(100vh - 150px)", lg: "calc(100vh - 200px)" }}>
          {/* Family Tree Section */}
          <Box
            flex="1"
            bg={cardBg}
            borderRight={{ base: "none", lg: "1px" }}
            borderColor="gray.200"
          >
            <VStack spacing={{ base: 3, md: 4 }} p={{ base: 3, md: 6 }} align="stretch">
              {/* Section Header */}
              <Box>
                <Flex flexDirection={{ base: 'column', md: 'row' }} alignItems="center" justifyContent="center" mb={4} gap={5}>
                  <HStack spacing={3}>
                    <Box
                      w={12}
                      h={12}
                      bg="linear-gradient(135deg, #2d5a27 0%, #1e3a1a 100%)"
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow="0 4px 12px rgba(45, 90, 39, 0.3)"
                    >
                      <Text fontSize="2xl">🌳</Text>
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading
                        size={{ base: 'md', md: 'lg' }}
                        color="gray.800"
                        fontFamily="serif"
                      >
                        {t('interactiveTree')}
                      </Heading>
                      <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        color="gray.600"
                        fontStyle="italic"
                      >
                        {isMobile
                          ? t('treeDescriptionMobile')
                          : t('treeDescription')
                        }
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Search Bar */}
                  <Box position="relative" maxW="400px" w="full">
                    <InputGroup size={isMobile ? "md" : "lg"}>
                      <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder={t('searchPlaceholder')}
                        fontSize={isMobile ? "sm" : "md"}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        bg="white"
                        border="2px solid #c8a882"
                        borderRadius="xl"
                        _focus={{
                          borderColor: "#d4af37",
                          boxShadow: "0 0 0 1px #d4af37"
                        }}
                        _hover={{
                          borderColor: "#d4af37"
                        }}
                      />

                      <InputRightElement>
                        {(
                          <IconButton
                            icon={<FiCamera />}
                            onClick={onFaceRecognitionOpen}
                            variant="ghost"
                            size={"lg"}
                            aria-label="Clear search"
                            color="gray.600"
                            // remove _hover style
                            _hover={{ bg: "transparent", transform: "scale(1.2)" }}
                          />
                        )}
                      </InputRightElement>
                    </InputGroup>

                    {/* Search Results */}
                    <Collapse in={showSearchResults}>
                      <Box
                        position="absolute"
                        top="100%"
                        left={0}
                        right={0}
                        mt={2}
                        bg="white"
                        border="2px solid #c8a882"
                        borderRadius="xl"
                        boxShadow="0 8px 25px rgba(0,0,0,0.15)"
                        zIndex={10}
                        maxH="300px"
                        overflowY="auto"
                      >
                        <List spacing={0}>
                          {memoizedSearchResults.map((person) => (
                            <ListItem
                              key={person.id}
                              p={3}
                              cursor="pointer"
                              _hover={{
                                bg: "rgba(200, 168, 130, 0.1)"
                              }}
                              onClick={() => handleSearchSelect(person)}
                              borderBottom="1px solid"
                              borderColor="gray.100"
                            >
                              <HStack spacing={3}>
                                <Box>
                                  <Text fontWeight="bold" color="#2d5a27" fontSize="sm">
                                    {person.data.firstName} {person.data.lastName}
                                  </Text>
                                  <Text fontSize="xs" color="gray.600">
                                    {person.data.birthday}
                                    {person.data.death ? ` - ${person.data.death}` : ''}
                                    {person.data.occupation && ` • ${person.data.occupation}`}
                                  </Text>
                                </Box>
                                <Spacer />
                              </HStack>
                              <Divider mt={2} />
                            </ListItem>
                          ))}
                          {memoizedSearchResults.length === 0 && searchQuery && (
                            <ListItem p={3}>
                              <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                {t('noResults')} "{searchQuery}"
                              </Text>
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    </Collapse>
                  </Box>
                </Flex>

                {/* Decorative separator */}
                <Box
                  w="full"
                  h="2px"
                  bg="linear-gradient(90deg, transparent 0%, #c8a882 20%, #d4af37 50%, #c8a882 80%, transparent 100%)"
                  borderRadius="full"
                  mb={4}
                />

              </Box>

              <Flex flexDirection={{ base: 'column', lg: 'row' }} gap={6} alignItems="stretch">
                <VStack spacing={4} alignItems="stretch" flex={1}>
                  <FamilyTree onPersonClick={handlePersonClick} familyData={memoizedFamilyData} />
                  {/* Mobile "See more" button */}
                  {isMobile && memoizedSelectedPerson && (
                    <Box w="full" px={2}>
                      <Button
                        onClick={onPersonDrawerOpen}
                        size="lg"
                        w="full"
                        bg="linear-gradient(135deg, #2d5a27 0%, #1e3a1a 100%)"
                        color="white"
                        _hover={{
                          bg: "linear-gradient(135deg, #1e3a1a 0%, #0f2e0d 100%)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 20px rgba(45, 90, 39, 0.4)"
                        }}
                        _active={{ transform: "translateY(0)" }}
                        boxShadow="0 4px 12px rgba(45, 90, 39, 0.3)"
                        borderRadius="xl"
                        leftIcon={<ViewIcon />}
                        transition="all 0.2s"
                        fontWeight="bold"
                        border="1px solid rgba(255,255,255,0.1)"
                      >
                        <VStack spacing={0}>
                          <Text fontSize="sm">{t('seeDetailsOn')} {memoizedSelectedPerson.data.firstName} {memoizedSelectedPerson.data.lastName}</Text>
                        </VStack>
                      </Button>
                    </Box>
                  )}
                </VStack>

                {/* Desktop Person Info */}
                {!isMobile && (
                  memoizedSelectedPerson ? (
                    <Box
                      w={{ lg: '420px' }}
                      p={6}
                      bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
                      borderWidth={1}
                      borderColor="gray.300"
                      borderRadius="xl"
                      boxShadow="0 8px 32px rgba(0,0,0,0.08)"
                      maxHeight="calc(100vh - 350px)"
                      overflowY="auto"
                    >
                      <PersonInfo
                        person={memoizedSelectedPerson}
                        familyData={memoizedFamilyData}
                        setPerson={setSelectedPerson}
                        compact={isTablet}
                        onPersonUpdate={handlePersonUpdate}
                        isEditing={isPersonEditingMode}
                        setIsEditing={setIsPersonEditingMode}
                        handlePersonClick={handlePersonClick}
                      />
                    </Box>
                  ) : (
                    <Box
                      w={{ lg: '420px' }}
                      p={8}
                      h="calc(100vh - 350px)"
                      bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
                      borderRadius="xl"
                      boxShadow="0 8px 32px rgba(0,0,0,0.08)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="2px dashed #d0d0d0"
                    >
                      <VStack spacing={3} textAlign="center">
                        <Box fontSize="4xl" opacity={0.6}>👤</Box>
                        <Text fontSize="md" color="gray.600" fontWeight="medium">
                          {t('selectMember')}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {t('viewDetails')}
                        </Text>
                      </VStack>
                    </Box>
                  )
                )}
              </Flex>
            </VStack>
          </Box>
        </Flex>
      </Container>
      {/* Mobile Person Details Drawer */}
      <Drawer isOpen={isPersonDrawerOpen} placement="bottom" onClose={onPersonDrawerClose} size="full">
        <DrawerOverlay />
        <DrawerContent
          borderTopRadius="xl"
          maxH="90vh"
          bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
          ref={drawerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <DrawerHeader
            pb={2}
            borderBottom="1px solid #e0e0e0"
            ref={drawerHeaderRef}
            position="relative"
          >
            {/* Swipe indicator */}
            <Box
              w="60px"
              h="4px"
              bg="gray.300"
              borderRadius="full"
              mx="auto"
              mb={3}
              cursor="pointer"
              _hover={{ bg: "gray.400" }}
              transition="background-color 0.2s"
            />
            {/* Swipe zone indicator */}
            <Text
              fontSize="xs"
              color="gray.400"
              textAlign="center"
              mb={2}
              fontStyle="italic"
            >
            </Text>
            <Flex alignItems="center" gap={3}>
              <IconButton
                icon={<ChevronLeftIcon />}
                onClick={onPersonDrawerClose}
                variant="ghost"
                size="sm"
                aria-label="Close"
                color="gray.600"
                _hover={{ bg: "gray.200" }}
              />
              <HStack spacing={2}>
                <Box fontSize="lg">👤</Box>
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {t('memberDetails')}
                </Text>
              </HStack>
              <Spacer />
              <Box fontSize="sm">
                {FAMILY_CONFIG.countryIcon}
              </Box>
            </Flex>
          </DrawerHeader>
          <DrawerBody pb={6} overflowY="auto">
            {memoizedSelectedPerson && (
              <PersonInfo
                person={memoizedSelectedPerson}
                familyData={memoizedFamilyData}
                compact={true}
                setPerson={setSelectedPerson}
                onPersonUpdate={handlePersonUpdate}
                isEditing={isPersonEditingMode}
                setIsEditing={setIsPersonEditingMode}
                handlePersonClick={handlePersonClick}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
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
}
