import React from 'react';
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
  Spacer,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Header = ({
  onStatsModalOpen,
  totalMembers,
  livingMembers,
  deceasedMembers,
  FAMILY_CONFIG,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      bg="linear-gradient(135deg, #2d5a27 0%, #1e3a1a 50%,rgb(16, 62, 12) 100%)"
      position="sticky"
      top={0}
      zIndex={10}
      borderBottom="3px solid #c8a882"
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
            <HStack spacing={2}>
              <LanguageSwitcher size="sm" />
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
                border="1px solid rgba(255,255,255,0.2)"
              >
                {t('statistics')}
              </Button>
            </HStack>
          </Flex>

          <Box w="full" position="relative">
            <Box
              h="2px"
              bg="linear-gradient(90deg, transparent 0%, #c8a882 20%, #d4af37 50%, #c8a882 80%, transparent 100%)"
              mb={4}
              borderRadius="full"
            />
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
              <HStack spacing={1} color="rgba(255,255,255,0.9)">
                <Box fontSize="md">🏛️</Box>
                <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold">
                  5 {t('generations')}
                </Text>
              </HStack>
            </Flex>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Header;
