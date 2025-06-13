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
} from '@chakra-ui/react'

const FamilyStatsModal = ({ isOpen, onClose, familyData }) => {
  const cardBg = useColorModeValue('linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 'gray.700')
  const italianGold = '#c8a882'
  const italianGreen = '#2d5a27'
  
  if (!familyData) return null

  // Calculate comprehensive statistics
  const totalMembers = familyData.length
  const livingMembers = familyData.filter(person => !person.data.death).length
  const deceasedMembers = totalMembers - livingMembers
  const livingPercentage = Math.round((livingMembers / totalMembers) * 100)

  // Generation stats
  const generations = {}
  familyData.forEach(person => {
    if (!generations[person.data.generation]) {
      generations[person.data.generation] = { total: 0, living: 0, deceased: 0 }
    }
    generations[person.data.generation].total++
    if (person.data.death) {
      generations[person.data.generation].deceased++
    } else {
      generations[person.data.generation].living++
    }
  })

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

  // Age distribution
  const ageRanges = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '80+': 0
  }

  familyData.forEach(person => {
    const age = person.data.death ? person.data.death - person.data.birthday : new Date().getFullYear() - person.data.birthday
    if (age <= 20) ageRanges['0-20']++
    else if (age <= 40) ageRanges['21-40']++
    else if (age <= 60) ageRanges['41-60']++
    else if (age <= 80) ageRanges['61-80']++
    else ageRanges['80+']++
  })

  // Birth decades
  const birthDecades = {}
  familyData.forEach(person => {
    const decade = Math.floor(person.data.birthday / 10) * 10
    birthDecades[decade] = (birthDecades[decade] || 0) + 1
  })

  // Marriage and children stats
  const marriedMembers = familyData.filter(person => person.rels.spouses && person.rels.spouses.length > 0).length
  const parentsCount = familyData.filter(person => person.rels.children && person.rels.children.length > 0).length
  const totalChildren = familyData.reduce((sum, person) => sum + (person.rels.children ? person.rels.children.length : 0), 0)
  const avgChildrenPerParent = parentsCount > 0 ? Math.round((totalChildren / parentsCount) * 10) / 10 : 0

  const formatFamilyName = (name) => {
    return name.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay bg="rgba(45, 90, 39, 0.4)" backdropFilter="blur(10px)" />
      <ModalContent 
        maxW="1200px"
        bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
        border={`3px solid ${italianGold}`}
        borderRadius="xl"
        overflow="hidden"
        position="relative"
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
        
        <ModalHeader pt={6}>
          <HStack spacing={3} mb={2}>
            <Box fontSize="2xl">📊</Box>
            <VStack align="start" spacing={0}>
              <Heading 
                size="lg" 
                color={italianGreen}
                fontFamily="serif"
                textShadow="1px 1px 2px rgba(0,0,0,0.1)"
              >
                Colanero Family Statistics
              </Heading>
              <Text fontSize="md" color="gray.600" fontStyle="italic">
                Heritage analysis from the Abruzzo mountains
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
        />        <ModalBody pb={6}>
          <VStack spacing={8} align="stretch">
            {/* Overview Stats */}
            <Box>
              <Heading 
                size="md" 
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
                Family Overview
              </Heading>
              <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                <Card 
                  bg={cardBg}
                  border={`1px solid ${italianGold}`}
                  borderRadius="lg"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(200, 168, 130, 0.2)' }}
                  transition="all 0.3s ease"
                >
                  <CardBody textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color={italianGreen}>
                      {totalMembers}
                    </Text>
                    <Text color="gray.600" fontWeight="medium">Total Members</Text>
                  </CardBody>
                </Card>
                <Card 
                  bg="linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)"
                  border="1px solid #81c784"
                  borderRadius="lg"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)' }}
                  transition="all 0.3s ease"
                >
                  <CardBody textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="green.600">
                      {livingMembers}
                    </Text>
                    <Text color="gray.600" fontWeight="medium">Living Members</Text>
                    <Text fontSize="sm" color="green.600" fontWeight="bold">
                      {livingPercentage}% of family
                    </Text>
                  </CardBody>
                </Card>
                <Card 
                  bg="linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)"
                  border="1px solid #bdbdbd"
                  borderRadius="lg"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(158, 158, 158, 0.2)' }}
                  transition="all 0.3s ease"
                >
                  <CardBody textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="gray.600">
                      {deceasedMembers}
                    </Text>
                    <Text color="gray.600" fontWeight="medium">Remembered Members</Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="bold">
                      {100 - livingPercentage}% of family
                    </Text>
                  </CardBody>
                </Card>
                <Card 
                  bg="linear-gradient(135deg, #e3f2fd 0%, #e1bee7 100%)"
                  border="1px solid #7986cb"
                  borderRadius="lg"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(63, 81, 181, 0.2)' }}
                  transition="all 0.3s ease"
                >
                  <CardBody textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="indigo.600">
                      {Object.keys(generations).length}
                    </Text>
                    <Text color="gray.600" fontWeight="medium">Generations</Text>
                  </CardBody>
                </Card>
              </Grid>
            </Box>

            {/* Decorative separator */}
            <Box
              h="1px"
              bg={`linear-gradient(90deg, transparent 0%, ${italianGold} 20%, #d4af37 50%, ${italianGold} 80%, transparent 100%)`}
              borderRadius="full"
            />

            {/* Generation Breakdown */}
            <Box>
              <Heading 
                size="md" 
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
                Generation Analysis
              </Heading>
              <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                {Object.entries(generations).map(([gen, stats]) => (
                  <Card 
                    key={gen} 
                    bg={cardBg}
                    border={`1px solid ${italianGold}`}
                    borderRadius="lg"
                    _hover={{ transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(200, 168, 130, 0.15)' }}
                    transition="all 0.3s ease"
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Heading size="sm" color={italianGreen} fontFamily="serif">
                            {gen === '0' ? 'Family Founder' : `Generation ${gen}`}
                          </Heading>
                          <Badge 
                            bg="linear-gradient(135deg, #e3f2fd, #f3e5f5)"
                            color={italianGreen}
                            border={`1px solid ${italianGold}`}
                          >
                            {stats.total} members
                          </Badge>
                        </HStack>
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" fontWeight="medium">Living vs Remembered</Text>
                            <Text fontSize="sm" color="gray.600" fontWeight="bold">
                              {Math.round((stats.living / stats.total) * 100)}% living
                            </Text>
                          </HStack>
                          <Progress
                            value={(stats.living / stats.total) * 100}
                            colorScheme="green"
                            size="sm"
                            borderRadius="md"
                          />
                        </Box>
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="green.600">Living: {stats.living}</Text>
                          <Text color="gray.500">Deceased: {stats.deceased}</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </Box>

            <Divider />

            {/* Family Branches
            <Box>
              <Heading size="md" mb={4} color="blue.600">
                Family Branches
              </Heading>
              <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
                {Object.entries(families)
                  .sort(([,a], [,b]) => b.total - a.total)
                  .map(([familyName, stats]) => (
                  <Card key={familyName} bg={cardBg}>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <VStack align="start" spacing={1}>
                          <Heading size="sm" color="blue.700">
                            {formatFamilyName(familyName)}
                          </Heading>
                          <Badge colorScheme="blue" size="sm">
                            {stats.total} members
                          </Badge>
                        </VStack>
                        
                        <Grid templateColumns="repeat(2, 1fr)" gap={2} fontSize="sm">
                          <Box>
                            <Text fontWeight="bold" color="green.600">
                              {stats.living}
                            </Text>
                            <Text color="gray.600">Living</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" color="gray.500">
                              {stats.deceased}
                            </Text>
                            <Text color="gray.600">Deceased</Text>
                          </Box>
                        </Grid>

                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            Average Age: <Text as="span" fontWeight="bold">{stats.avgAge}</Text>
                          </Text>
                          <Progress
                            value={Math.min((stats.avgAge / 80) * 100, 100)}
                            colorScheme="orange"
                            size="sm"
                            borderRadius="md"
                          />
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </Box>

            <Divider /> */}

            {/* Demographics */}
            <Box>
              <Heading size="md" mb={4} color="blue.600">
                Demographics
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                {/* Age Distribution */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="sm" mb={4}>Age Distribution</Heading>
                    <VStack spacing={3} align="stretch">
                      {Object.entries(ageRanges).map(([range, count]) => (
                        <Box key={range}>
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="sm">{range} years</Text>
                            <Badge>{count}</Badge>
                          </HStack>
                          <Progress
                            value={(count / totalMembers) * 100}
                            colorScheme="purple"
                            size="sm"
                            borderRadius="md"
                          />
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Family Stats */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="sm" mb={4}>Family Structure</Heading>
                    <VStack spacing={4} align="stretch">
                      <Stat>
                        <StatLabel>Married Members</StatLabel>
                        <StatNumber>{marriedMembers}</StatNumber>
                        <StatHelpText>
                          {Math.round((marriedMembers / totalMembers) * 100)}% of family
                        </StatHelpText>
                      </Stat>
                      
                      <Stat>
                        <StatLabel>Parents</StatLabel>
                        <StatNumber>{parentsCount}</StatNumber>
                        <StatHelpText>
                          Members with children
                        </StatHelpText>
                      </Stat>
                      
                      <Stat>
                        <StatLabel>Average Children</StatLabel>
                        <StatNumber>{avgChildrenPerParent}</StatNumber>
                        <StatHelpText>
                          Per parent in family
                        </StatHelpText>
                      </Stat>
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </Box>

            {/* birthday Timeline */}
            <Box>
              <Heading size="md" mb={4} color="blue.600">
                birthday Timeline by Decade
              </Heading>
              <Card bg={cardBg}>
                <CardBody>
                  <Grid templateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={4}>
                    {Object.entries(birthDecades)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([decade, count]) => (
                      <Box key={decade} textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {count}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {decade}s
                        </Text>
                        <Progress
                          value={(count / totalMembers) * 100}
                          colorScheme="blue"
                          size="sm"
                          borderRadius="md"
                          mt={2}
                        />
                      </Box>
                    ))}
                  </Grid>
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
