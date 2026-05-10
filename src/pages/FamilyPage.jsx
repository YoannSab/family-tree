import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Spinner, Center, Text, VStack, Button } from '@chakra-ui/react';
import App from '../App.jsx';
import { fetchFamilyMeta } from '../services/familyService.js';
import { THEME } from '../config/config.js';

export default function FamilyPage() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta]       = useState(null);
  const [status, setStatus]   = useState('loading'); // 'loading' | 'ok' | 'not-found' | 'error'

  useEffect(() => {
    if (!familyId) return;
    setStatus('loading');
    fetchFamilyMeta(familyId)
      .then((data) => {
        if (!data) {
          setStatus('not-found');
        } else {
          setMeta(data);
          setStatus('ok');
        }
      })
      .catch(() => setStatus('error'));
  }, [familyId]);

  if (status === 'loading') {
    return (
      <Center minH="100vh" bg={THEME.bgPage}>
        <Spinner size="xl" color={'var(--theme-primary)'} thickness="4px" />
      </Center>
    );
  }

  if (status === 'not-found') {
    return (
      <Center minH="100vh" bg={THEME.bgPage}>
        <VStack spacing={4}>
          <Text fontSize="5xl">🔍</Text>
          <Text fontSize="xl" fontWeight="semibold" color="gray.700">
            Family tree not found
          </Text>
          <Text color="gray.500">
            The link may be incorrect or the family tree no longer exists.
          </Text>
          <Button onClick={() => navigate('/')} bg={'var(--theme-primary)'} color="white" _hover={{ bg: 'var(--theme-primary-dark)' }}>
            Go back
          </Button>
        </VStack>
      </Center>
    );
  }

  if (status === 'error') {
    return (
      <Center minH="100vh" bg={THEME.bgPage}>
        <VStack spacing={4}>
          <Text fontSize="5xl">⚠️</Text>
          <Text fontSize="xl" fontWeight="semibold" color="gray.700">
            Something went wrong
          </Text>
          <Button onClick={() => setStatus('loading')} variant="outline">
            Retry
          </Button>
        </VStack>
      </Center>
    );
  }

  const familyConfig = {
    familyName:   meta.name   || 'Family Tree',
    subtitle:     meta.subtitle || '',
    countryIcon:  meta.countryIcon || '🌳',
  };

  return (
    <App
      familyId={familyId}
      familyConfig={familyConfig}
      passwordHash={meta.passwordHash || ''}
      theme={meta.theme || null}
    />
  );
}
