import './App.css'
import FamilyTree from './components/FamilyTree.jsx'
import PersonInfo from './components/PersonInfo.jsx'
import FamilyStatsModal from './components/FamilyStatsModal.jsx'
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
  useBreakpointValue,
  Badge,
  Card,
  CardBody,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorModeValue,
  Spacer
} from '@chakra-ui/react'
import { InfoIcon, ChevronLeftIcon, ViewIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import { data } from './assets/data'

export default function App() {
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [familyData, setFamilyData] = useState([])
  const { isOpen: isStatsModalOpen, onOpen: onStatsModalOpen, onClose: onStatsModalClose } = useDisclosure()
  const { isOpen: isPersonDrawerOpen, onOpen: onPersonDrawerOpen, onClose: onPersonDrawerClose } = useDisclosure()

  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false })
  
  const headerBg = useColorModeValue('white', 'gray.800')
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    setFamilyData(data())
  }, [])

  const handlePersonClick = (person) => {
    setSelectedPerson(person)
    if (isMobile) {
      onPersonDrawerOpen()
    }
  }

  // Calculate quick stats
  const totalMembers = familyData.length
  const livingMembers = familyData.filter(p => !p.data.death || p.data.death === "").length
  const deceasedMembers = totalMembers - livingMembers
  return (
    <Box minH="100vh" bg={bgColor}>      {/* Header */}
      <Box 
        bg="linear-gradient(135deg, #2d5a27 0%, #1e3a1a 50%, #0f2e0d 100%)"
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
                    Famiglia Colanero
                  </Heading>
                  <Text 
                    fontSize={{ base: 'sm', md: 'md' }} 
                    color="rgba(255,255,255,0.9)"
                    fontStyle="italic"
                    letterSpacing="0.5px"
                  >
                    Dalle montagne degli Abruzzi
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={2}>
                {selectedPerson && isMobile && (
                  <IconButton
                    icon={<ViewIcon />}
                    onClick={onPersonDrawerOpen}
                    colorScheme="green"
                    variant="solid"
                    size="sm"
                    aria-label="View person details"
                    bg="rgba(255,255,255,0.15)"
                    color="white"
                    _hover={{ bg: "rgba(255,255,255,0.25)" }}
                    backdropFilter="blur(10px)"
                  />
                )}
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
                  Statistics
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
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
                align={{ base: 'center', md: 'flex-end' }}
                gap={{ base: 3, md: 4 }}
              >                {/* Left Side - Heritage Info with Family Stats Icons */}
                <VStack align={{ base: 'center', md: 'start' }} spacing={2}>
                  <HStack spacing={3} color="rgba(255,255,255,0.9)">
                    <Box fontSize="lg">🏔️</Box>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium">
                      Abruzzo Region, Italy
                    </Text>
                  </HStack>
                  <HStack spacing={3} color="rgba(255,255,255,0.8)">
                    <Box fontSize="md">📍</Box>
                    <Text fontSize={{ base: 'xs', md: 'sm' }}>
                      Family Traditions since 1800
                    </Text>
                  </HStack>
                </VStack>                
                {/* Right Side - Total Members */}
                <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
                  {/* Family Stats in Header */}
                  <VStack spacing={1}>
                    <HStack spacing={1} color="rgba(255,255,255,0.9)">
                      <Box fontSize="md">💚</Box>
                      <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold">
                        {livingMembers} Living
                      </Text>
                    </HStack>
                    <HStack spacing={1} color="rgba(255,255,255,0.8)">
                      <Box fontSize="md">🕊️</Box>
                      <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold">
                        {deceasedMembers} Remembered
                      </Text>
                    </HStack>
                    <HStack spacing={1} color="rgba(255,255,255,0.9)">
                      <Box fontSize="md">🏛️</Box>
                      <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold">
                        5 Generations
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Flex>
            </Box>
          </VStack>
        </Container>
      </Box>      {/* Main Content */}
      <Container maxW="full" px={0}>
        <Flex direction={{ base: 'column', lg: 'row' }} minH="calc(100vh - 200px)">
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
                <VStack align="start" spacing={3} mb={6}>
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
                    <VStack align="start" spacing={1}>                      <Heading 
                        size={{ base: 'md', md: 'lg' }} 
                        color="gray.800"
                        fontFamily="serif"
                      >
                        Interactive Family Tree
                      </Heading>
                      <Text 
                        fontSize={{ base: 'sm', md: 'md' }} 
                        color="gray.600"
                        fontStyle="italic"
                      >
                        {isMobile 
                          ? 'Touch a family member to discover their story' 
                          : 'Click on a family member to explore family connections'
                        }
                      </Text>
                    </VStack>
                  </HStack>
                  
                  {/* Decorative separator */}
                  <Box
                    w="full"
                    h="1px"
                    bg="linear-gradient(90deg, transparent 0%, #c8a882 20%, #d4af37 50%, #c8a882 80%, transparent 100%)"
                    borderRadius="full"
                  />
                </VStack>
              </Box>
              
              <Flex flexDirection={{ base: 'column', lg: 'row' }} gap={6} alignItems="stretch">
                <Box 
                  flex={1} 
                  overflow="auto" 
                  maxHeight="calc(100vh - 350px)" 
                  borderRadius="xl" 
                  boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                  border="2px solid #e0e0e0"
                  bg="white"
                >
                  <FamilyTree onPersonClick={handlePersonClick} familyData={familyData} />
                </Box>
                
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
                      bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
                      borderRadius="xl" 
                      boxShadow="0 8px 32px rgba(0,0,0,0.08)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="2px dashed #d0d0d0"
                    >
                      <VStack spacing={3} textAlign="center">
                        <Box fontSize="4xl" opacity={0.6}>👤</Box>                      <Text fontSize="md" color="gray.600" fontWeight="medium">
                        Select a member
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        to view family details
                      </Text>
                      </VStack>
                    </Box>
                  )
                )}
              </Flex>
            </VStack>
          </Box>
        </Flex>
      </Container>      {/* Mobile Person Details Drawer */}
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
              />              <HStack spacing={2}>
                <Box fontSize="lg">👤</Box>
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  Member Details
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
                onPersonSelect={() => {
                  // Keep drawer open when selecting related person
                }}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Stats Modal */}
      <FamilyStatsModal
        isOpen={isStatsModalOpen}
        onClose={onStatsModalClose}
        familyData={familyData}
      />
    </Box>
  )
}
