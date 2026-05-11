import {
  Box,
  Flex,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Container,
  IconButton,
} from '@chakra-ui/react';
import { InfoIcon, CalendarIcon } from '@chakra-ui/icons';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents';

const Header = ({
  onStatsModalOpen,
  onUpcomingEventsOpen,
  livingMembers,
  deceasedMembers,
  FAMILY_CONFIG,
  isMobile,
  familyData,
}) => {
  const { t } = useTranslation();
  const { soonEvents } = useUpcomingEvents(familyData || [], 7);
  const hasUpcoming = soonEvents.length > 0;

  return (
    <Box
      bg={`linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-dark) 50%, var(--theme-primary-darker) 100%)`}
      position="sticky"
      top={0}
      zIndex={10}
      borderBottom={`3px solid var(--theme-accent)`}
      boxShadow="0 4px 20px rgba(0,0,0,0.15)"
    >
      <Container maxW="full" px={{ base: 4, md: 6 }}>
        <VStack spacing={0} py={{ base: 4, md: 6 }}>
          <Flex
            w="full"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
            px={{ base: 2, md: 4 }}
          >
            <HStack spacing={{ base: 3, md: 4 }}>
              <Box fontSize={{ base: '2xl', md: '3xl' }}>{FAMILY_CONFIG.countryIcon}</Box>
              <VStack align="start" spacing={0}>
                <Heading
                  size={{ base: 'lg', md: 'xl' }}
                  color="white"
                  fontWeight="bold"
                  fontFamily="serif"
                  textShadow="2px 2px 4px rgba(0,0,0,0.3)"
                >
                  {FAMILY_CONFIG.familyName}
                </Heading>
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  color="rgba(255,255,255,0.9)"
                  fontStyle="italic"
                  letterSpacing="0.5px"
                >
                  {FAMILY_CONFIG.subtitle}
                </Text>
              </VStack>
            </HStack>
            {!isMobile && (
              <Flex
                direction="row"
                justifyContent="center"
                gap={{ base: 5, md: 10 }}
              >
                <HStack spacing={1} color="rgba(255,255,255,0.9)">
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
                {/* <HStack spacing={1} color="rgba(255,255,255,0.9)">
                  <Box fontSize="md">🏛️</Box>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold">
                    5 {t('generations')}
                  </Text>
                </HStack> */}
              </Flex>
            )}
            <HStack spacing={2}>
              <LanguageSwitcher size="sm" />

              {/* Upcoming events — mobile icon */}
              <Box position="relative" display={{ base: 'flex', md: 'none' }}>
                <IconButton
                  icon={<CalendarIcon />}
                  onClick={onUpcomingEventsOpen}
                  size="sm"
                  aria-label="Upcoming events"
                  bg="rgba(255,255,255,0.15)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.25)" }}
                  backdropFilter="blur(10px)"
                />
                {hasUpcoming && (
                  <Box
                    position="absolute"
                    top="-2px"
                    right="-2px"
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg="yellow.300"
                    border="2px solid"
                    borderColor="var(--theme-primary)"
                    animation="pulse 2s infinite"
                  />
                )}
              </Box>

              {/* Upcoming events — desktop button */}
              <Box position="relative" display={{ base: 'none', md: 'flex' }}>
                <Button
                  leftIcon={<CalendarIcon />}
                  onClick={onUpcomingEventsOpen}
                  size="sm"
                  bg="rgba(255,255,255,0.15)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.25)" }}
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255,255,255,0.2)"
                >
                  {t('upcomingEvents')}
                </Button>
                {hasUpcoming && (
                  <Box
                    position="absolute"
                    top="-3px"
                    right="-3px"
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg="yellow.300"
                    border="2px solid"
                    borderColor="var(--theme-primary)"
                    animation="pulse 2s infinite"
                  />
                )}
              </Box>

              {/* Statistics — mobile icon */}
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

              {/* Statistics — desktop button */}
              <Button
                leftIcon={<InfoIcon />}
                onClick={onStatsModalOpen}
                size="sm"
                display={{ base: 'none', md: 'flex' }}
                bg="rgba(255,255,255,0.15)"
                color="white"
                _hover={{ bg: "rgba(255,255,255,0.25)" }}
                backdropFilter="blur(10px)"
                border="1px solid rgba(255,255,255,0.2)"
              >
                {t('statistics')}
              </Button>
            </HStack>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default Header;
