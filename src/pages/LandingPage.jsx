import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  Container,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { THEME } from '../config/config.js';
import { fetchAllFamilies } from '../services/familyService.js';

const maskName = (name = '') =>
  name
    .split(' ')
    .map((word) => {
      if (word.length <= 1) return word;
      const visible = Math.ceil(word.length / 2);
      return word.slice(0, visible) + '•'.repeat(word.length - visible);
    })
    .join(' ');

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [families, setFamilies] = useState([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);

  useEffect(() => {
    fetchAllFamilies()
      .then(setFamilies)
      .catch(() => setFamilies([]))
      .finally(() => setLoadingFamilies(false));
  }, []);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={`linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-dark) 50%, var(--theme-primary-darker) 100%)`}
      px={{ base: 4, md: 0 }}
    >
      <Container maxW="md">
        <VStack spacing={8} align="stretch">
          <VStack spacing={3} textAlign="center">
            <Box fontSize="6xl">🌳</Box>
            <Heading size="xl" color="white" fontFamily="serif" textShadow="2px 2px 4px rgba(0,0,0,0.3)">
              {t('appTitle', 'Family Tree')}
            </Heading>
            <Text color="whiteAlpha.800" fontSize="lg">
              {t('landingSubtitle', 'Access or create a family tree')}
            </Text>
          </VStack>

          <Box bg="white" borderRadius="2xl" p={8} shadow="2xl">
            <VStack spacing={6} align="stretch">
              {/* Available families */}
              {loadingFamilies ? (
                <HStack justify="center" py={2}>
                  <Spinner size="sm" color="var(--theme-primary)" />
                  <Text fontSize="sm" color="gray.500">{t('loadingFamilies', 'Loading families…')}</Text>
                </HStack>
              ) : families.length > 0 && (
                <VStack spacing={2} align="stretch">
                  <Text fontWeight="semibold" color="gray.700" fontSize="sm">
                    {t('availableFamilies', 'Available families')}
                  </Text>
                  <Box
                    maxH="144px"
                    overflowY="auto"
                    pr={1}
                    sx={{
                      '&::-webkit-scrollbar': { width: '4px' },
                      '&::-webkit-scrollbar-thumb': { background: 'var(--theme-primary)', borderRadius: '4px' },
                      '&::-webkit-scrollbar-track': { background: 'transparent' },
                    }}
                  >
                    <VStack spacing={2} align="stretch">
                      {families.map((fam) => (
                        <Button
                          key={fam.id}
                          variant="outline"
                          borderColor="gray.200"
                          justifyContent="flex-start"
                          fontFamily="serif"
                          color="gray.700"
                          _hover={{ bg: 'var(--theme-primary)', color: 'white', borderColor: 'var(--theme-primary)' }}
                          onClick={() => navigate(`/f/${fam.id}`)}
                        >
                          🌳 {maskName(fam.name || fam.id)}
                        </Button>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              )}

              <HStack>
                <Divider />
                <Text color="gray.400" fontSize="sm" whiteSpace="nowrap" px={2}>
                  {t('or', 'or')}
                </Text>
                <Divider />
              </HStack>

              {/* Create new family */}
              <Button
                size="xl"
                variant="outline"
                borderColor={'var(--theme-primary)'}
                color={'var(--theme-primary)' }
                _hover={{ bg: 'var(--theme-primary)' + '22' }}
                onClick={() => navigate('/new')}
              >
                {t('createNewFamily', 'Create a new family tree')}
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
