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
  const cardBg = useColorModeValue('white', 'gray.700')
  
  if (!familyData) return null

  // Calculate comprehensive statistics
  const totalMembers = familyData.length
  const livingMembers = familyData.filter(person => !person.death).length
  const deceasedMembers = totalMembers - livingMembers
  const livingPercentage = Math.round((livingMembers / totalMembers) * 100)

  // Generation stats
  const generations = {}
  familyData.forEach(person => {
    if (!generations[person.generation]) {
      generations[person.generation] = { total: 0, living: 0, deceased: 0 }
    }
    generations[person.generation].total++
    if (person.death) {
      generations[person.generation].deceased++
    } else {
      generations[person.generation].living++
    }
  })

  // Family branch stats
  const families = {}
  familyData.forEach(person => {
    if (!families[person.family]) {
      families[person.family] = { total: 0, living: 0, deceased: 0, avgAge: 0 }
    }
    families[person.family].total++
    if (person.death) {
      families[person.family].deceased++
    } else {
      families[person.family].living++
    }
  })

  // Calculate average ages for families
  Object.keys(families).forEach(familyName => {
    const familyMembers = familyData.filter(person => person.family === familyName)
    const totalAge = familyMembers.reduce((sum, person) => {
      const age = person.death ? person.death - person.birth : new Date().getFullYear() - person.birth
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
    const age = person.death ? person.death - person.birth : new Date().getFullYear() - person.birth
    if (age <= 20) ageRanges['0-20']++
    else if (age <= 40) ageRanges['21-40']++
    else if (age <= 60) ageRanges['41-60']++
    else if (age <= 80) ageRanges['61-80']++
    else ageRanges['80+']++
  })

  // Birth decades
  const birthDecades = {}
  familyData.forEach(person => {
    const decade = Math.floor(person.birth / 10) * 10
    birthDecades[decade] = (birthDecades[decade] || 0) + 1
  })

  // Marriage and children stats
  const marriedMembers = familyData.filter(person => person.spouse && person.spouse.length > 0).length
  const parentsCount = familyData.filter(person => person.children && person.children.length > 0).length
  const totalChildren = familyData.reduce((sum, person) => sum + (person.children ? person.children.length : 0), 0)
  const avgChildrenPerParent = parentsCount > 0 ? Math.round((totalChildren / parentsCount) * 10) / 10 : 0

  const formatFamilyName = (name) => {
    return name.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="1200px">
        <ModalHeader>
          <Heading size="lg" color="blue.600">
            Family Tree Statistics
          </Heading>
          <Text fontSize="md" color="gray.600" mt={2}>
            Comprehensive analysis of the Rodriguez family tree
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={8} align="stretch">
            {/* Overview Stats */}
            <Box>
              <Heading size="md" mb={4} color="blue.600">
                Overview
              </Heading>
              <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                <Card bg={cardBg}>
                  <CardBody textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                      {totalMembers}
                    </Text>
                    <Text color="gray.600">Total Members</Text>
                  </CardBody>
                </Card>
                <Card bg={cardBg}>
                  <CardBody textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="green.500">
                      {livingMembers}
                    </Text>
                    <Text color="gray.600">Living Members</Text>
                    <Text fontSize="sm" color="green.600">
                      {livingPercentage}% of family
                    </Text>
                  </CardBody>
                </Card>
                <Card bg={cardBg}>
                  <CardBody textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="gray.500">
                      {deceasedMembers}
                    </Text>
                    <Text color="gray.600">Deceased Members</Text>
                    <Text fontSize="sm" color="gray.500">
                      {100 - livingPercentage}% of family
                    </Text>
                  </CardBody>
                </Card>
                <Card bg={cardBg}>
                  <CardBody textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                      {Object.keys(generations).length}
                    </Text>
                    <Text color="gray.600">Generations</Text>
                  </CardBody>
                </Card>
              </Grid>
            </Box>

            <Divider />

            {/* Generation Breakdown */}
            <Box>
              <Heading size="md" mb={4} color="blue.600">
                Generation Analysis
              </Heading>
              <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                {Object.entries(generations).map(([gen, stats]) => (
                  <Card key={gen} bg={cardBg}>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Heading size="sm">
                            {gen === '0' ? 'Founder' : `Generation ${gen}`}
                          </Heading>
                          <Badge colorScheme="blue">{stats.total} members</Badge>
                        </HStack>
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm">Living vs Deceased</Text>
                            <Text fontSize="sm" color="gray.600">
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

            {/* Family Branches */}
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

            <Divider />

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

            {/* Birth Timeline */}
            <Box>
              <Heading size="md" mb={4} color="blue.600">
                Birth Timeline by Decade
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
