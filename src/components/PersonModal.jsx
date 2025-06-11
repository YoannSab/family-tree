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
  Avatar,
  Badge,
  Box,
  Divider,
  Heading,
  Grid,
  GridItem,
  Card,
  CardBody,
  Flex,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { CalendarIcon, EmailIcon, StarIcon, LinkIcon } from '@chakra-ui/icons'

const PersonModal = ({ isOpen, onClose, person, familyData }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700')
  
  if (!person) return null

  const isLiving = !person.death
  const age = person.death 
    ? person.death - person.birth 
    : new Date().getFullYear() - person.birth

  // Find related people
  const spouses = person.spouse ? familyData.filter(p => person.spouse.includes(p.id)) : []
  const children = person.children ? familyData.filter(p => person.children.includes(p.id)) : []
  const parents = familyData.filter(p => p.children && p.children.includes(person.id))
  const siblings = familyData.filter(p => 
    p.id !== person.id && 
    parents.some(parent => parent.children && parent.children.includes(p.id))
  )

  const formatFamilyName = (name) => {
    return name.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
  }

  const RelatedPersonsList = ({ title, people, colorScheme }) => (
    <Box>
      <Heading size="sm" mb={3} color={`${colorScheme}.600`}>
        {title} ({people.length})
      </Heading>
      {people.length > 0 ? (
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={3}>
          {people.map(relatedPerson => (
            <Card key={relatedPerson.id} size="sm" bg={cardBg}>
              <CardBody>
                <HStack spacing={3}>
                  <Avatar size="sm" src={relatedPerson.image} name={relatedPerson.name} />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="sm" fontWeight="bold">
                      {relatedPerson.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Born {relatedPerson.birth}
                    </Text>
                    <Badge 
                      size="xs" 
                      colorScheme={relatedPerson.death ? 'gray' : 'green'}
                    >
                      {relatedPerson.death ? `Died ${relatedPerson.death}` : 'Living'}
                    </Badge>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      ) : (
        <Text fontSize="sm" color="gray.500" fontStyle="italic">
          None recorded
        </Text>
      )}
    </Box>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="800px">
        <ModalHeader pb={2}>
          <HStack spacing={4}>
            <Avatar size="lg" src={person.image} name={person.name} />
            <VStack align="start" spacing={1}>
              <HStack spacing={2}>
                <Heading size="lg">{person.name}</Heading>
                {person.generation === 0 && (
                  <Icon as={StarIcon} color="yellow.400" boxSize={5} />
                )}
              </HStack>
              <HStack spacing={3}>
                <Badge colorScheme="blue">
                  {formatFamilyName(person.family)} Family
                </Badge>
                <Badge colorScheme="purple">
                  Generation {person.generation}
                </Badge>
                <Badge colorScheme={isLiving ? 'green' : 'gray'}>
                  {isLiving ? `Age ${age}` : `Died at ${age}`}
                </Badge>
              </HStack>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <Heading size="md" mb={4} color="blue.600">
                Basic Information
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <HStack spacing={2}>
                    <CalendarIcon color="gray.500" />
                    <Text fontWeight="bold">Birth:</Text>
                    <Text>{person.birth}</Text>
                  </HStack>
                </GridItem>
                {person.death && (
                  <GridItem>
                    <HStack spacing={2}>
                      <CalendarIcon color="gray.500" />
                      <Text fontWeight="bold">Death:</Text>
                      <Text>{person.death}</Text>
                    </HStack>
                  </GridItem>
                )}
                <GridItem>
                  <HStack spacing={2}>
                    <Text fontWeight="bold">Age:</Text>
                    <Text>{age} years old</Text>
                  </HStack>
                </GridItem>
                <GridItem>
                  <HStack spacing={2}>
                    <Text fontWeight="bold">Generation:</Text>
                    <Text>{person.generation}</Text>
                  </HStack>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Family Relationships */}
            <VStack spacing={6} align="stretch">
              <Heading size="md" color="blue.600">
                Family Relationships
              </Heading>

              {parents.length > 0 && (
                <RelatedPersonsList
                  title="Parents"
                  people={parents}
                  colorScheme="purple"
                />
              )}

              {spouses.length > 0 && (
                <RelatedPersonsList
                  title="Spouse(s)"
                  people={spouses}
                  colorScheme="pink"
                />
              )}

              {children.length > 0 && (
                <RelatedPersonsList
                  title="Children"
                  people={children}
                  colorScheme="green"
                />
              )}

              {siblings.length > 0 && (
                <RelatedPersonsList
                  title="Siblings"
                  people={siblings}
                  colorScheme="orange"
                />
              )}
            </VStack>

            <Divider />

            {/* Family Statistics */}
            <Box>
              <Heading size="md" mb={4} color="blue.600">
                Family Branch Summary
              </Heading>
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <Card textAlign="center" bg={cardBg}>
                  <CardBody>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                      {children.length}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Children
                    </Text>
                  </CardBody>
                </Card>
                <Card textAlign="center" bg={cardBg}>
                  <CardBody>
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      {children.filter(child => !child.death).length}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Living Children
                    </Text>
                  </CardBody>
                </Card>
                <Card textAlign="center" bg={cardBg}>
                  <CardBody>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                      {siblings.length}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Siblings
                    </Text>
                  </CardBody>
                </Card>
              </Grid>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default PersonModal
