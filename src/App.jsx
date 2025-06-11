import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useDisclosure,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from '@chakra-ui/react'
import { ViewIcon, InfoIcon } from '@chakra-ui/icons'
import FamilyTreeView from './components/FamilyTreeView'
import PersonModal from './components/PersonModal'
import FamilyStatsModal from './components/FamilyStatsModal'
import familyData from './data/familyTree.json'

function App() {
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [selectedFamily, setSelectedFamily] = useState(null)
  const { isOpen: isPersonModalOpen, onOpen: onPersonModalOpen, onClose: onPersonModalClose } = useDisclosure()
  const { isOpen: isStatsModalOpen, onOpen: onStatsModalOpen, onClose: onStatsModalClose } = useDisclosure()

  const handlePersonClick = (person) => {
    setSelectedPerson(person)
    onPersonModalOpen()
  }

  const totalPeople = familyData.familyTree.length
  const livingPeople = familyData.familyTree.filter(person => !person.death).length
  const families = [...new Set(familyData.familyTree.map(person => person.family))].length
  const generations = Math.max(...familyData.familyTree.map(person => person.generation)) + 1

  return (
    <Box minH="100vh" bg="family.background">
      <Container maxW="full" p={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center" py={8}>
            <Heading size="2xl" color="family.primary" mb={4}>
              Family Tree Explorer
            </Heading>
            <Text fontSize="lg" color="family.text" opacity={0.8}>
              Explore the beautiful legacy of the Rodriguez family tree
            </Text>
              <Button
                leftIcon={<InfoIcon />}
                colorScheme="blue"
                variant="outline"
                onClick={onStatsModalOpen}
              >
                Detailed Stats
              </Button>
          </Box>

          {/* Family Tree */}
          <Box bg="white" borderRadius="xl" shadow="lg" overflow="hidden">
            <FamilyTreeView 
              familyData={familyData.familyTree} 
              onPersonClick={handlePersonClick}
              onFamilyClick={setSelectedFamily}
            />
          </Box>
        </VStack>

        {/* Modals */}
        <PersonModal 
          isOpen={isPersonModalOpen}
          onClose={onPersonModalClose}
          person={selectedPerson}
          familyData={familyData.familyTree}
        />
        
        <FamilyStatsModal
          isOpen={isStatsModalOpen}
          onClose={onStatsModalClose}
          familyData={familyData.familyTree}
        />
      </Container>
    </Box>
  )
}

export default App
