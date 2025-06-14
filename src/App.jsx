import './App.css'
import FamilyTree from './components/FamilyTree.jsx'
import PersonInfo from './components/PersonInfo.jsx'
import FamilyStatsModal from './components/FamilyStatsModal.jsx'
import FaceRecognition from './components/FaceRecognition.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import PasswordProtection from './components/PasswordProtection.jsx'
import {
  Box,
  Flex,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  useDisclosure,
  Container,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useColorModeValue,
  Spacer,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Collapse,
  Divider,
  InputRightElement,
  transform
} from '@chakra-ui/react'
import { InfoIcon, ChevronLeftIcon, ViewIcon, SearchIcon } from '@chakra-ui/icons'
import { FiCamera } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Custom hook for responsive design that updates in real-time
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      })
    }

    // Set initial size
    updateScreenSize()

    // Add event listener for resize
    window.addEventListener('resize', updateScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return screenSize
}

export default function App() {
  const { t } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [familyData, setFamilyData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const { isOpen: isStatsModalOpen, onOpen: onStatsModalOpen, onClose: onStatsModalClose } = useDisclosure()
  const { isOpen: isPersonDrawerOpen, onOpen: onPersonDrawerOpen, onClose: onPersonDrawerClose } = useDisclosure()
  const { isOpen: isFaceRecognitionOpen, onOpen: onFaceRecognitionOpen, onClose: onFaceRecognitionClose } = useDisclosure()

  // Use custom responsive hook instead of Chakra's useBreakpointValue
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    fetch('/data/data_819811684156.json')
      .then(response => response.json())
      .then(data => setFamilyData(data))
  }, [])

  // Close drawer when screen becomes desktop
  useEffect(() => {
    if (isDesktop && isPersonDrawerOpen) {
      onPersonDrawerClose()
    }
  }, [isDesktop, isPersonDrawerOpen, onPersonDrawerClose])
  const handlePersonClick = (person) => {
    setSelectedPerson(person)
  }

  const handleFaceRecognitionPersonSelect = (person) => {
    // Fermer la modal de reconnaissance faciale
    onFaceRecognitionClose()
    // Sélectionner la personne
    setSelectedPerson(person)
    // Ouvrir le drawer sur mobile/tablet
    if (isMobile || isTablet) {
      onPersonDrawerOpen()
    }
  }

  // Search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 0) {
      const results = familyData.filter(person =>
        person.data.firstName.toLowerCase().includes(query.toLowerCase()) ||
        person.data.lastName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5) // Limit to 5 results

      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  const handleSearchSelect = (person) => {
    setSelectedPerson(person)
    if (isMobile) {
      onPersonDrawerOpen()
    } setSearchQuery('')
    setShowSearchResults(false)
    setSearchResults([])
  }

  const handleUnlock = () => {
    setIsAuthenticated(true)
  }

  // Show password protection if not authenticated
  if (!isAuthenticated) {
    return <PasswordProtection onUnlock={handleUnlock} />
  }

  // Calculate quick stats
  const totalMembers = familyData.length
  const livingMembers = familyData.filter(p => !p.data.death || p.data.death === "").length
  const deceasedMembers = totalMembers - livingMembers
  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Header */}
      <Box
        bg="linear-gradient(135deg, #2d5a27 0%, #1e3a1a 50%,rgb(16, 62, 12) 100%)"
        position="sticky"
        top={0}
        zIndex={10}
        borderBottom="3px solid #c8a882"
        boxShadow="0 4px 20px rgba(0,0,0,0.15)"
      >
        <Container maxW="full" px={{ base: 4, md: 6 }}>
          {/* Main Header Content */}
          <VStack spacing={0} py={{ base: 4, md: 6 }}>
            {/* Top Row with Title and Stats */}
            <Flex
              w="full"
              alignItems="center"
              justifyContent="space-between"
              mb={3}
            >
              <HStack spacing={{ base: 3, md: 4 }}>
                <Box fontSize={{ base: '2xl', md: '3xl' }}>🇮🇹</Box>
                <VStack align="start" spacing={0}>
                  <Heading
                    size={{ base: 'lg', md: 'xl' }}
                    color="white"
                    fontWeight="bold"
                    fontFamily="serif"
                    textShadow="2px 2px 4px rgba(0,0,0,0.3)"
                  >
                    {t('familyName')}
                  </Heading>
                  <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    color="rgba(255,255,255,0.9)"
                    fontStyle="italic"
                    letterSpacing="0.5px"
                  >
                    {t('subtitle')}
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={2}>
                <LanguageSwitcher size="sm" />
                <IconButton
                  icon={<InfoIcon />}
                  onClick={onStatsModalOpen}
                  colorScheme="blue"
                  variant="solid"
                  size="sm"
                  aria-label="View statistics"
                  display={{ base: 'flex', md: 'none' }}
                  bg="rgba(255,255,255,0.15)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.25)" }}
                  backdropFilter="blur(10px)"
                />
                <Button
                  leftIcon={<InfoIcon />}
                  onClick={onStatsModalOpen}
                  size="sm"
                  display={{ base: 'none', md: 'flex' }}
                  bg="rgba(255,255,255,0.15)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.25)" }}
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255,255,255,0.2)"                >
                  {t('statistics')}
                </Button>
              </HStack>
            </Flex>

            {/* Decorative Elements and Heritage Info */}
            <Box w="full" position="relative">
              {/* Decorative Line */}
              <Box
                h="2px"
                bg="linear-gradient(90deg, transparent 0%, #c8a882 20%, #d4af37 50%, #c8a882 80%, transparent 100%)"
                mb={4}
                borderRadius="full"
              />

              {/* Heritage Info and Stats Row */}
              <Flex
                direction="row"
                justifyContent="center"
                gap={{ base: 5, md: 10 }}
              >                <HStack spacing={1} color="rgba(255,255,255,0.9)">
                  <Box fontSize="md">💚</Box>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold">
                    {livingMembers} {t('living')}
                  </Text>
                </HStack>
                <HStack spacing={1} color="rgba(255,255,255,0.8)">
                  <Box fontSize="md">🕊️</Box>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold">
                    {deceasedMembers} {t('remembered')}
                  </Text>
                </HStack>
                <HStack spacing={1} color="rgba(255,255,255,0.9)">
                  <Box fontSize="md">🏛️</Box>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold">
                    5 {t('generations')}
                  </Text>
                </HStack>
              </Flex>
            </Box>
          </VStack>
        </Container>
      </Box>
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
                          {searchResults.map((person) => (
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
                          {searchResults.length === 0 && searchQuery && (
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
                  <FamilyTree onPersonClick={handlePersonClick} familyData={familyData} />
                  {/* Mobile "See more" button */}
                  {isMobile && selectedPerson && (
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
                      >                        <VStack spacing={0}>
                          <Text fontSize="sm">{t('seeDetailsOn')} {selectedPerson.data.firstName} {selectedPerson.data.lastName}</Text>
                        </VStack>
                      </Button>
                    </Box>
                  )}
                </VStack>

                {/* Desktop Person Info */}
                {!isMobile && (
                  selectedPerson ? (
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
                        person={selectedPerson}
                        familyData={familyData}
                        setPerson={setSelectedPerson}
                        compact={isTablet}
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
                    >                      <VStack spacing={3} textAlign="center">
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
        <DrawerContent borderTopRadius="xl" maxH="90vh" bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)">
          <DrawerHeader pb={2} borderBottom="1px solid #e0e0e0">
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
              <Box fontSize="sm">🇮🇹</Box>
            </Flex>
          </DrawerHeader>
          <DrawerBody pb={6} overflowY="auto">
            {selectedPerson && (
              <PersonInfo
                person={selectedPerson}
                familyData={familyData}
                setPerson={setSelectedPerson}
                compact={true}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>      {/* Stats Modal */}
      <FamilyStatsModal
        isOpen={isStatsModalOpen}
        onClose={onStatsModalClose}
        familyData={familyData}
      />      {/* Face Recognition Modal */}
      <FaceRecognition
        isOpen={isFaceRecognitionOpen}
        onClose={onFaceRecognitionClose}
        familyData={familyData}
        onPersonSelect={handleFaceRecognitionPersonSelect}
      />
    </Box>
  )
}
