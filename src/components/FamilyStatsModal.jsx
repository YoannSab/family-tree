import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Stat,
  Divider,
  Heading,
  Grid,
  Card,
  CardBody,
  Progress,
  Badge,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  SimpleGrid,
  Flex,
  Wrap,
  WrapItem,
  useBreakpointValue,
} from '@chakra-ui/react'

const FamilyStatsModal = ({ isOpen, onClose, familyData }) => {
  const cardBg = useColorModeValue('linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 'gray.700')
  const italianGold = '#c8a882'
  const italianGreen = '#2d5a27'
  
  // Responsive breakpoints
  const modalSize = useBreakpointValue({ base: 'full', md: '6xl' })
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 })
  const cardGridColumns = useBreakpointValue({ base: 1, md: 2 })
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const headerSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const numberSize = useBreakpointValue({ base: '2xl', md: '3xl' })
  
  if (!familyData) return null

  // Calculate comprehensive statistics
  const totalMembers = familyData.length
  const livingMembers = familyData.filter(person => !person.data.death).length
  const deceasedMembers = totalMembers - livingMembers

  // Family branch stats
  const families = {}
  familyData.forEach(person => {
    if (!families[person.data.family]) {
      families[person.data.family] = { total: 0, living: 0, deceased: 0, avgAge: 0 }
    }
    families[person.data.family].total++
    if (person.data.death) {
      families[person.data.family].deceased++
    } else {
      families[person.data.family].living++
    }
  })

  // Calculate average ages for families
  Object.keys(families).forEach(familyName => {
    const familyMembers = familyData.filter(person => person.data.family === familyName)
    const totalAge = familyMembers.reduce((sum, person) => {
      const age = person.data.death ? person.data.death - person.data.birthday : new Date().getFullYear() - person.data.birthday
      return sum + age
    }, 0)
    families[familyName].avgAge = Math.round(totalAge / familyMembers.length)
  })

  // Enhanced age distribution with more granular ranges
  const ageRanges = {
    'Enfants (0-17)': 0,
    'Jeunes (18-35)': 0,
    'Adultes (36-55)': 0,
    'Seniors (56-75)': 0,
    'Aînés (76+)': 0
  }

  familyData.forEach(person => {
    const age = person.data.death ? person.data.death - person.data.birthday : new Date().getFullYear() - person.data.birthday
    if (age <= 17) ageRanges['Enfants (0-17)']++
    else if (age <= 35) ageRanges['Jeunes (18-35)']++
    else if (age <= 55) ageRanges['Adultes (36-55)']++
    else if (age <= 75) ageRanges['Seniors (56-75)']++
    else ageRanges['Aînés (76+)']++
  })
  // Birth decades (handling NaN values)
  const birthDecades = {}
  familyData.forEach(person => {
    const birthday = person.data.birthday
    if (birthday && !isNaN(birthday) && birthday > 1800) {
      const decade = Math.floor(birthday / 10) * 10
      birthDecades[decade] = (birthDecades[decade] || 0) + 1
    }
  })

  // Marriage and children stats
  const marriedMembers = familyData.filter(person => person.rels.spouses && person.rels.spouses.length > 0).length
  const parentsCount = familyData.filter(person => person.rels.children && person.rels.children.length > 0).length
  const totalChildren = familyData.reduce((sum, person) => sum + (person.rels.children ? person.rels.children.length : 0), 0)
  const avgChildrenPerParent = parentsCount > 0 ? Math.round((totalChildren / parentsCount) * 10) / 10 : 0

  // Advanced family statistics
  // Average age at first child
  const parentsWithAgeData = familyData.filter(person => 
    person.rels.children && 
    person.rels.children.length > 0 && 
    person.data.birthday && 
    !isNaN(person.data.birthday)
  )
  
  let totalAgeAtFirstChild = 0
  let validParents = 0
  parentsWithAgeData.forEach(parent => {
    if (parent.rels.children && parent.rels.children.length > 0) {
      // Find the oldest child (assuming first child)
      const children = parent.rels.children.map(childId => 
        familyData.find(person => person.id === childId)
      ).filter(child => child && child.data.birthday && !isNaN(child.data.birthday))
      
      if (children.length > 0) {
        const oldestChild = children.reduce((oldest, child) => 
          child.data.birthday < oldest.data.birthday ? child : oldest
        )
        const ageAtFirstChild = oldestChild.data.birthday - parent.data.birthday
        if (ageAtFirstChild > 0 && ageAtFirstChild < 100) {
          totalAgeAtFirstChild += ageAtFirstChild
          validParents++
        }
      }
    }
  })
  const avgAgeAtFirstChild = validParents > 0 ? Math.round(totalAgeAtFirstChild / validParents) : 0
  // Longevity statistics
  const deceasedMembersWithData = familyData.filter(person => person.data.death && !isNaN(person.data.death) && person.data.birthday && !isNaN(person.data.birthday))
  const longevityData = deceasedMembersWithData.map(person => person.data.death - person.data.birthday).filter(age => age > 0 && age < 120)
  const avgLifespan = longevityData.length > 0 ? Math.round(longevityData.reduce((sum, age) => sum + age, 0) / longevityData.length) : 0
  const maxLifespan = longevityData.length > 0 ? Math.max(...longevityData) : 0
  // Gender distribution
  const maleCount = familyData.filter(person => person.data.gender === 'M').length
  const femaleCount = familyData.filter(person => person.data.gender === 'F').length

  const formatFamilyName = (name) => {
    return name.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} scrollBehavior="inside">
      <ModalOverlay bg="rgba(45, 90, 39, 0.4)" backdropFilter="blur(10px)" />
      <ModalContent 
        maxW={modalSize === 'full' ? 'full' : '1200px'}
        bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
        border={`3px solid ${italianGold}`}
        borderRadius={modalSize === 'full' ? 'none' : 'xl'}
        overflow="hidden"
        position="relative"
        mx={modalSize === 'full' ? 0 : 4}
        my={modalSize === 'full' ? 0 : 4}
      >
        {/* Italian flag accent */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="4px"
          bg="linear-gradient(90deg, #009246 33%, #fff 33% 66%, #ce2b37 66%)"
          zIndex={2}
        />
        
        <ModalHeader pt={6} px={{ base: 4, md: 6 }}>
          <HStack spacing={3} mb={2}>
            <Box fontSize={{ base: 'xl', md: '2xl' }}>📊</Box>
            <VStack align="start" spacing={0}>
              <Heading 
                size={headerSize}
                color={italianGreen}
                fontFamily="serif"
                textShadow="1px 1px 2px rgba(0,0,0,0.1)"
              >
                Statistiques Famille Colanero
              </Heading>
              <Text fontSize={fontSize} color="gray.600" fontStyle="italic">
                Analyse de notre héritage des montagnes d'Abruzzo
              </Text>
            </VStack>
          </HStack>
          {/* Decorative line */}
          <Box
            h="2px"
            bg={`linear-gradient(90deg, transparent 0%, ${italianGold} 20%, #d4af37 50%, ${italianGold} 80%, transparent 100%)`}
            borderRadius="full"
            mt={3}
          />
        </ModalHeader>
        <ModalCloseButton 
          color={italianGreen}
          _hover={{ bg: "rgba(200, 168, 130, 0.2)" }}
          mt={2}
          fontSize={{ base: 'lg', md: 'xl' }}
        />
          <ModalBody pb={6} px={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 6, md: 8 }} align="stretch">
            
            {/* Demographics - Enhanced Age Distribution */}
            <Box>
              <Heading 
                size={{ base: 'sm', md: 'md' }}
                mb={4} 
                color={italianGreen}
                fontFamily="serif"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Box
                  w={1}
                  h={5}
                  bg={`linear-gradient(to bottom, ${italianGold}, #d4af37)`}
                  borderRadius="full"
                />
                Répartition par âge
              </Heading>
              <Card 
                bg={cardBg}
                border={`1px solid ${italianGold}`}
                borderRadius="lg"
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {Object.entries(ageRanges).map(([range, count]) => {
                      const percentage = ((count / totalMembers) * 100).toFixed(1)
                      const [ageGroup, ages] = range.split(' ')
                      
                      return (
                        <Box key={range}>
                          <Flex justify="space-between" align="center" mb={2}>
                            <VStack align="start" spacing={0}>
                              <Text fontSize={fontSize} fontWeight="bold" color={italianGreen}>
                                {ageGroup}
                              </Text>
                              <Text fontSize="xs" color="gray.500">{ages}</Text>
                            </VStack>
                            <HStack spacing={2}>
                              <Badge 
                                bg="linear-gradient(135deg, #e3f2fd, #f3e5f5)"
                                color={italianGreen}
                                border={`1px solid ${italianGold}`}
                                fontSize="xs"
                              >
                                {count} pers.
                              </Badge>
                              <Text fontSize="sm" fontWeight="bold" color="gray.600">
                                {percentage}%
                              </Text>
                            </HStack>
                          </Flex>
                          <Progress
                            value={(count / totalMembers) * 100}
                            colorScheme="blue"
                            size="md"
                            borderRadius="md"
                            bg="gray.100"
                            sx={{
                              '& > div': {
                                background: `linear-gradient(90deg, ${italianGold}, #d4af37)`
                              }
                            }}
                          />
                        </Box>
                      )
                    })}
                  </VStack>
                </CardBody>
              </Card>
            </Box>

            {/* Advanced Family Statistics */}
            <Box>
              <Heading 
                size={{ base: 'sm', md: 'md' }}
                mb={4} 
                color={italianGreen}
                fontFamily="serif"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Box
                  w={1}
                  h={5}
                  bg={`linear-gradient(to bottom, ${italianGold}, #d4af37)`}
                  borderRadius="full"
                />
                Statistiques familiales
              </Heading>
              <SimpleGrid columns={cardGridColumns} spacing={6}>
                <Card 
                  bg={cardBg}
                  border={`1px solid ${italianGold}`}
                  borderRadius="lg"
                >
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Stat textAlign="center">
                        <StatLabel fontSize={fontSize}>Âge moyen au 1er enfant</StatLabel>
                        <StatNumber fontSize={{ base: '2xl', md: '3xl' }} color={italianGreen}>
                          {avgAgeAtFirstChild > 0 ? `${avgAgeAtFirstChild} ans` : 'N/A'}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          {validParents > 0 ? `Basé sur ${validParents} parents` : 'Données insuffisantes'}
                        </StatHelpText>
                      </Stat>
                      
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={2} color={italianGreen}>
                          Structure familiale
                        </Text>
                        <VStack spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Total membres</Text>
                            <Badge colorScheme="blue">{totalMembers}</Badge>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Vivants</Text>
                            <Badge colorScheme="green">{livingMembers}</Badge>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Mariés</Text>
                            <Badge colorScheme="purple">{marriedMembers}</Badge>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Parents</Text>
                            <Badge colorScheme="orange">{parentsCount}</Badge>
                          </HStack>
                        </VStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                <Card 
                  bg={cardBg}
                  border={`1px solid ${italianGold}`}
                  borderRadius="lg"
                >
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Stat textAlign="center">
                        <StatLabel fontSize={fontSize}>Espérance de vie moyenne</StatLabel>
                        <StatNumber fontSize={{ base: '2xl', md: '3xl' }} color={italianGreen}>
                          {avgLifespan > 0 ? `${avgLifespan} ans` : 'N/A'}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          Record: {maxLifespan > 0 ? `${maxLifespan} ans` : 'N/A'}
                        </StatHelpText>
                      </Stat>
                      
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={2} color={italianGreen}>
                          Répartition par genre
                        </Text>
                        <VStack spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Hommes</Text>
                            <Badge colorScheme="blue">{maleCount}</Badge>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Femmes</Text>
                            <Badge colorScheme="pink">{femaleCount}</Badge>
                          </HStack>
                          <Progress
                            value={(maleCount / (maleCount + femaleCount)) * 100}
                            colorScheme="blue"
                            size="sm"
                            borderRadius="md"
                            mt={2}
                          />
                        </VStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Box>            {/* Birth Timeline */}
            <Box>
              <Heading 
                size={{ base: 'sm', md: 'md' }}
                mb={4} 
                color={italianGreen}
                fontFamily="serif"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Box
                  w={1}
                  h={5}
                  bg={`linear-gradient(to bottom, ${italianGold}, #d4af37)`}
                  borderRadius="full"
                />
                Chronologie des naissances par décennie
              </Heading>
              <Card 
                bg={cardBg}
                border={`1px solid ${italianGold}`}
                borderRadius="lg"
              >
                <CardBody>
                  {Object.keys(birthDecades).length > 0 ? (
                    <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
                      {Object.entries(birthDecades)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([decade, count]) => {
                          const percentage = ((count / totalMembers) * 100).toFixed(1)
                          return (
                            <VStack key={decade} spacing={2} align="center">
                              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="green.600">
                                {count}
                              </Text>
                              <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium" color={italianGreen}>
                                {decade}s
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {percentage}%
                              </Text>
                              <Progress
                                value={(count / totalMembers) * 100}
                                colorScheme="green"
                                size="md"
                                borderRadius="md"
                                w="full"
                                bg="gray.100"
                                sx={{
                                  '& > div': {
                                    background: 'linear-gradient(90deg, #38a169, #48bb78)'
                                  }
                                }}
                              />
                            </VStack>
                          )
                        })}
                    </SimpleGrid>
                  ) : (
                    <Text fontSize="sm" color="gray.500" fontStyle="italic" textAlign="center">
                      Données de naissance insuffisantes
                    </Text>
                  )}
                  
                  <Box mt={6} pt={4} borderTop="1px solid" borderColor="gray.200">
                    <Text fontSize="sm" fontWeight="bold" color={italianGreen} textAlign="center">
                      Moyenne d'enfants par parent: {avgChildrenPerParent}
                    </Text>
                  </Box>
                </CardBody>
              </Card>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default FamilyStatsModal
