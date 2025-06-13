import {
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Box,
  Heading,
  Grid,
  GridItem,
  Card,
  CardBody,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { CalendarIcon, StarIcon } from '@chakra-ui/icons'

const PersonInfo = ({ person, familyData, setPerson, compact = false, onPersonSelect }) => {
  const cardBg = useColorModeValue('linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 'gray.700')
  const italianGold = '#c8a882'
  const italianGreen = '#2d5a27'
  const isMobile = compact

  if (!person) return null

  const isLiving = !person.data.death
  const age = person.data.death
    ? person.data.death - person.data.birthday
    : new Date().getFullYear() - person.data.birthday

  // Find related people
  const spouses = person.rels.spouses ? familyData.filter(p => person.rels.spouses.includes(p.id)) : []
  const children = person.rels.children ? familyData.filter(p => person.rels.children.includes(p.id)) : []
  const parents = familyData.filter(p => p.rels.children && p.rels.children.includes(person.id))
  const siblings = familyData.filter(p =>
    p.id !== person.id &&
    parents.some(parent => parent.rels.children && parent.rels.children.includes(p.id))
  )
  const formatFamilyName = (name) => {
    if (!name) return ''
    return name.split('-').map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
  }

  const RelatedPersonsList = ({ title, people, colorScheme }) => (
    <Box>
      <Heading
        size={isMobile ? "xs" : "sm"}
        mb={3}
        color={italianGreen}
        fontFamily="serif"
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Box
          w={1}
          h={4}
          bg={`linear-gradient(to bottom, ${italianGold}, #d4af37)`}
          borderRadius="full"
        />
        {title} ({people.length})
      </Heading>
      {people.length > 0 ? (
        <Grid
          templateColumns={isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))"}
          gap={3}
        >
          {people.map(relatedPerson => (
            <Card
              key={relatedPerson.id}
              size="sm"
              bg={cardBg}
              border={`1px solid ${italianGold}`}
              borderRadius="lg"
              onClick={() => {
                setPerson(relatedPerson)
                if (onPersonSelect) onPersonSelect()
              }}
              style={{ cursor: 'pointer' }}
              _hover={{
                boxShadow: `0 8px 25px rgba(200, 168, 130, 0.2)`,
                transform: 'translateY(-2px)',
                borderColor: '#d4af37'
              }}
              _active={{ transform: 'translateY(0px)' }}
              transition="all 0.3s ease"
              position="relative"
              overflow="hidden"
            >
              {/* Italian flag accent */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="3px"
                bg="linear-gradient(90deg, #009246 33%, #fff 33% 66%, #ce2b37 66%)"
              />
              <CardBody p={3} pt={4}>
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    src={relatedPerson.data.image}
                    name={relatedPerson.data.firstName}
                    ring={2}
                    ringColor={italianGold}
                  />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="sm" fontWeight="bold" color={italianGreen} fontFamily="serif">
                      {relatedPerson.data.firstName} {relatedPerson.data.lastName}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Born {relatedPerson.data.birthday}
                    </Text>
                    <Badge
                      size="xs"
                      colorScheme={relatedPerson.data.death ? 'gray' : 'green'}
                      bg={relatedPerson.data.death ? 'gray.100' : 'green.50'}
                      color={relatedPerson.data.death ? 'gray.600' : 'green.700'}
                      border={`1px solid ${relatedPerson.data.death ? '#e2e8f0' : '#9ae6b4'}`}
                    >
                      {relatedPerson.data.death ? `Died ${relatedPerson.data.death}` : 'Living'}
                    </Badge>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}        </Grid>
      ) : (
        <Text fontSize="sm" color="gray.500" fontStyle="italic">
          None recorded
        </Text>
      )}
    </Box>
  )

  return (
    <Box
      bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
      borderRadius="xl"
      p={isMobile ? 4 : 6}
      border={`2px solid ${italianGold}`}
      position="relative"
      overflow="hidden"
    >
      {/* Italian flag accent */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="4px"
        bg="linear-gradient(90deg, #009246 33%, #fff 33% 66%, #ce2b37 66%)"
        zIndex={1}
      />

      <VStack spacing={isMobile ? 4 : 6} align="stretch" position="relative" zIndex={2}>
        {/* Header with person details */}
        <Box>
          <Flex direction={{ base: 'column', sm: 'row' }} align={{ base: 'center', sm: 'start' }} gap={4}>
            <Avatar
              size={isMobile ? "xl" : "lg"}
              src={person.data.image}
              name={person.data.firstName}
              ring={3}
              ringColor={italianGold}
              bg="linear-gradient(135deg, #2d5a27, #1e3a1a)"
            />
            <VStack align={{ base: 'center', sm: 'start' }} spacing={2} flex={1}>
              <VStack align={{ base: 'center', sm: 'start' }} spacing={1}>
                <HStack spacing={2} flexWrap="wrap" justify={{ base: 'center', sm: 'start' }}>
                  <Heading
                    size={isMobile ? "md" : "lg"}
                    textAlign={{ base: 'center', sm: 'left' }}
                    color={italianGreen}
                    fontFamily="serif"
                    textShadow="1px 1px 2px rgba(0,0,0,0.1)"
                  >
                    {person.data.firstName} {person.data.lastName}
                  </Heading>
                  {person.generation === 0 && (
                    <Icon as={StarIcon} color="#d4af37" boxSize={5} />
                  )}
                </HStack>
                <HStack spacing={2} flexWrap="wrap" justify={{ base: 'center', sm: 'start' }}>
                  {/* <Badge
                    bg="linear-gradient(135deg, #e3f2fd, #f3e5f5)"
                    color={italianGreen}
                    fontSize="xs"
                    border={`1px solid ${italianGold}`}
                  >
                    {formatFamilyName(person.data.family)} Family
                  </Badge> */}
                  <Badge
                    bg="linear-gradient(135deg, #f3e5f5, #e8f5e8)"
                    color="purple.700"
                    fontSize="xs"
                    border="1px solid #ce93d8"
                  >
                    Generation {person.data.generation}
                  </Badge>
                  <Badge
                    bg={isLiving ? 'linear-gradient(135deg, #e8f5e8, #c8e6c9)' : 'linear-gradient(135deg, #f5f5f5, #e0e0e0)'}
                    color={isLiving ? 'green.700' : 'gray.600'}
                    fontSize="xs"
                    border={`1px solid ${isLiving ? '#81c784' : '#bdbdbd'}`}
                  >
                    {isLiving ? `Age ${age}` : `Died at ${age}`}
                  </Badge>
                </HStack>
              </VStack>
            </VStack>
          </Flex>
        </Box>

        <VStack spacing={isMobile ? 4 : 6} align="stretch">
          {/* Basic Information */}
          <Box>
            <Heading
              size={isMobile ? "sm" : "md"}
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
              Basic Information
            </Heading>
            <Grid templateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"} gap={4}>
              <GridItem>
                <HStack spacing={2}>
                  <CalendarIcon color={italianGold} />
                  <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"} color={italianGreen}>Birth:</Text>
                  <Text fontSize={isMobile ? "sm" : "md"}>{person.data.birthday}</Text>
                </HStack>
              </GridItem>
              {person.data.death && (
                <GridItem>
                  <HStack spacing={2}>
                    <CalendarIcon color={italianGold} />
                    <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"} color={italianGreen}>Death:</Text>
                    <Text fontSize={isMobile ? "sm" : "md"}>{person.data.death}</Text>
                  </HStack>
                </GridItem>
              )}
              <GridItem>
                <HStack spacing={2}>
                  <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"} color={italianGreen}>Age:</Text>
                  <Text fontSize={isMobile ? "sm" : "md"}>{age} years old</Text>
                </HStack>
              </GridItem>
              <GridItem>
                <HStack spacing={2}>
                  <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"} color={italianGreen}>Generation:</Text>
                  <Text fontSize={isMobile ? "sm" : "md"}>{person.data.generation}</Text>
                </HStack>
              </GridItem>
            </Grid>
          </Box>

          {/* Decorative separator */}
          <Box
            h="1px"
            bg={`linear-gradient(90deg, transparent 0%, ${italianGold} 20%, #d4af37 50%, ${italianGold} 80%, transparent 100%)`}
            borderRadius="full"
          />

          {/* Family Relationships */}
          <VStack spacing={isMobile ? 4 : 6} align="stretch">
            <Heading
              size={isMobile ? "sm" : "md"}
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

          {/* Decorative separator */}
          <Box
            h="1px"
            bg={`linear-gradient(90deg, transparent 0%, ${italianGold} 20%, #d4af37 50%, ${italianGold} 80%, transparent 100%)`}
            borderRadius="full"
          />
        </VStack>
      </VStack>
    </Box>
  )
}

export default PersonInfo
