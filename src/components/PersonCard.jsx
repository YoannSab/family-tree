import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  Avatar,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'

const PersonCard = ({ person, onClick, isFounder = false, size = 'md' }) => {
  const cardBg = useColorModeValue('white', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.600')
  const borderColor = person.death ? 'gray.300' : 'blue.200'
  
  const isLiving = !person.death
  const age = person.death 
    ? person.death - person.birth 
    : new Date().getFullYear() - person.birth
  const cardSizes = {
    sm: { 
      w: { base: '160px', md: '180px' }, 
      h: { base: '200px', md: '220px' } 
    },
    md: { 
      w: { base: '180px', md: '220px' }, 
      h: { base: '240px', md: '280px' } 
    },
    lg: { 
      w: { base: '200px', md: '260px' }, 
      h: { base: '280px', md: '320px' } 
    }
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }
  return (
    <Card
      {...cardSizes[size]}
      cursor="pointer"
      onClick={(e) => {
        e.stopPropagation()
        onClick(person)
      }}
      bg={cardBg}
      borderColor={borderColor}
      borderWidth={2}
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-4px) scale(1.02)',
        shadow: 'xl',
        borderColor: isFounder ? 'yellow.400' : 'blue.400',
      }}
      _active={{
        transform: 'translateY(-2px) scale(1.01)',
        shadow: 'lg',
      }}
      transition="all 0.2s ease-in-out"
      position="relative"
      overflow="hidden"
      userSelect="none"
      style={{ 
        pointerEvents: 'auto',
        zIndex: 3
      }}
    >
      {isFounder && (        <Box
          position="absolute"
          top={2}
          right={2}
          zIndex={2}
        >
          <Tooltip label="Family Founder">
            <Text fontSize="2xl" color="yellow.400">⭐</Text>
          </Tooltip>
        </Box>
      )}

      <CardBody p={4}>
        <VStack spacing={3} align="center" h="100%">
          {/* Profile Image */}          <Box position="relative">
            <Avatar
              size={{ base: "lg", md: "xl" }}
              src={person.image}
              name={person.name}
              bg="blue.500"
              color="white"
            />
            {!isLiving && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="blackAlpha.300"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="xs" color="white" fontWeight="bold">
                  ✝
                </Text>
              </Box>
            )}
          </Box>

          {/* Name */}
          <VStack spacing={1} textAlign="center" flex={1}>
            <Text 
              fontWeight="bold" 
              fontSize={size === 'sm' ? 'sm' : 'md'}
              color={person.death ? 'gray.600' : 'gray.800'}
              lineHeight="short"
            >
              {person.name}
            </Text>            {/* Birth Year */}
            <HStack spacing={1}>
              <Text fontSize="sm" color="gray.500">📅</Text>
              <Text fontSize="xs" color="gray.600">
                Born {person.birth}
              </Text>
            </HStack>

            {/* Age/Death */}
            {person.death ? (
              <Badge colorScheme="gray" size="sm">
                Died {person.death} (Age {age})
              </Badge>
            ) : (
              <Badge colorScheme="green" size="sm">
                Age {age}
              </Badge>
            )}

            {/* Family Info */}
            <VStack spacing={1} fontSize="xs" color="gray.500" textAlign="center">
              {person.spouse && person.spouse.length > 0 && (
                <Text>
                  {person.spouse.length === 1 ? 'Married' : `${person.spouse.length} Spouses`}
                </Text>
              )}
              {person.children && person.children.length > 0 && (
                <Text>
                  {person.children.length} {person.children.length === 1 ? 'Child' : 'Children'}
                </Text>
              )}
            </VStack>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default PersonCard
