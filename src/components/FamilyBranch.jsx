import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Flex,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Collapse,
  Button,
  useDisclosure,
  Icon,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, ViewIcon } from '@chakra-ui/icons'
import PersonCard from './PersonCard'

const FamilyBranch = ({ familyName, members, onPersonClick, onFamilyClick, showStats = false }) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })
  
  const livingMembers = members.filter(member => !member.death).length
  const totalMembers = members.length
  const generations = [...new Set(members.map(member => member.generation))].sort((a, b) => a - b)
  const avgAge = Math.round(
    members.reduce((sum, member) => {
      const age = member.death ? member.death - member.birth : new Date().getFullYear() - member.birth
      return sum + age
    }, 0) / members.length
  )

  const formatFamilyName = (name) => {
    return name.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
  }

  const sortedMembers = [...members].sort((a, b) => {
    if (a.generation !== b.generation) return a.generation - b.generation
    return a.birth - b.birth
  })

  return (
    <Card shadow="lg" borderRadius="xl" overflow="hidden">
      <CardHeader 
        bg="blue.50" 
        cursor="pointer" 
        onClick={onToggle}
        _hover={{ bg: 'blue.100' }}
        transition="background 0.2s"
      >
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <HStack spacing={3}>
              <Heading size="md" color="blue.700">
                {formatFamilyName(familyName)} Family
              </Heading>
              <Badge colorScheme="blue" variant="subtle">
                {totalMembers} {totalMembers === 1 ? 'member' : 'members'}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {generations.length} {generations.length === 1 ? 'generation' : 'generations'} • 
              {livingMembers} living • Avg age {avgAge}
            </Text>
          </VStack>
          
          <HStack spacing={2}>
            {showStats && (
              <Button
                size="sm"
                leftIcon={<ViewIcon />}
                colorScheme="blue"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onFamilyClick(familyName)
                }}
              >
                Details
              </Button>
            )}
            <Icon
              as={isOpen ? ChevronUpIcon : ChevronDownIcon}
              boxSize={6}
              color="blue.600"
            />
          </HStack>
        </HStack>
      </CardHeader>

      <Collapse in={isOpen}>
        <CardBody p={6}>          {showStats && (
            <Box mb={6} p={4} bg="gray.50" borderRadius="lg">
              <StatGroup 
                templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                display="grid"
                gap={4}
              >
                <Stat textAlign="center">
                  <StatLabel fontSize={{ base: "xs", md: "sm" }}>Total Members</StatLabel>
                  <StatNumber color="blue.600" fontSize={{ base: "lg", md: "xl" }}>{totalMembers}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel fontSize={{ base: "xs", md: "sm" }}>Living</StatLabel>
                  <StatNumber color="green.500" fontSize={{ base: "lg", md: "xl" }}>{livingMembers}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel fontSize={{ base: "xs", md: "sm" }}>Generations</StatLabel>
                  <StatNumber color="purple.500" fontSize={{ base: "lg", md: "xl" }}>{generations.length}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel fontSize={{ base: "xs", md: "sm" }}>Avg Age</StatLabel>
                  <StatNumber color="orange.500" fontSize={{ base: "lg", md: "xl" }}>{avgAge}</StatNumber>
                </Stat>
              </StatGroup>
            </Box>
          )}

          {generations.map(generation => {
            const genMembers = sortedMembers.filter(member => member.generation === generation)
            
            return (
              <Box key={generation} mb={6}>
                <Text 
                  fontSize="sm" 
                  fontWeight="bold" 
                  color="gray.600" 
                  mb={3}
                  textAlign="center"
                >
                  {generation === 0 ? 'FOUNDER' : `GENERATION ${generation}`}
                </Text>                <Flex 
                  wrap="wrap" 
                  gap={4} 
                  justify="center"
                  align="start"
                  direction={{ base: "column", sm: "row" }}
                >
                  {genMembers.map(member => (
                    <PersonCard
                      key={member.id}
                      person={member}
                      onClick={onPersonClick}
                      size="sm"
                    />
                  ))}
                </Flex>
              </Box>
            )
          })}
        </CardBody>
      </Collapse>
    </Card>
  )
}

export default FamilyBranch
