import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Heading,
  Container,
  Divider,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { THEME } from '../config/config.js';

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [familyId, setFamilyId] = useState('');

  const handleOpen = (e) => {
    e.preventDefault();
    const id = familyId.trim();
    if (!id) return;
    // Support pasting a full URL or just the raw ID
    const match = id.match(/\/f\/([^/?#]+)/);
    navigate(`/f/${match ? match[1] : id}`);
  };

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
              {/* Open existing family */}
              <VStack spacing={3} align="stretch">
                <Text fontWeight="semibold" color="gray.700">
                  {t('openFamily', 'Open a family tree')}
                </Text>
                <form onSubmit={handleOpen}>
                  <VStack spacing={3} align="stretch">
                    <Input
                      value={familyId}
                      onChange={(e) => setFamilyId(e.target.value)}
                      placeholder={t('familyIdPlaceholder', 'Paste family ID or link...')}
                      size="lg"
                      borderColor="gray.300"
                      _focus={{ borderColor: 'var(--theme-primary)', boxShadow: `0 0 0 1px var(--theme-primary)` }}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      bg={'var(--theme-primary)'}
                      color="white"
                      _hover={{ bg: 'var(--theme-primary-dark)' }}
                      isDisabled={!familyId.trim()}
                    >
                      {t('openFamilyBtn', 'Open')}
                    </Button>
                  </VStack>
                </form>
              </VStack>

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
