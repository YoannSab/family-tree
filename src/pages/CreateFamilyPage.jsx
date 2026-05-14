import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Heading,
  Container,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  Code,
  HStack,
  SimpleGrid,
  Tooltip,
  useClipboard,
  Switch,
  FormHelperText as _FHT,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import CryptoJS from 'crypto-js';
import { createFamily } from '../services/familyService.js';
import { THEME } from '../config/config.js';

const PRESETS = [
  {
    id: 'italian',  label: '🇮🇹 Italien',
    theme: { primary: '#2d5a27', primaryDark: '#1e3a1a', primaryDarker: '#0f2e0d', accent: '#e7c59a', accentDark: '#d4af37', flagLeft: '#00a531', flagRight: '#ce2b37' },
  },
  {
    id: 'french',   label: '🇫🇷 Français',
    theme: { primary: '#2a5fa8', primaryDark: '#1d4480', primaryDarker: '#102d5a', accent: '#a8c8f0', accentDark: '#6699cc', flagLeft: '#002395', flagRight: '#ED2939' },
  },
  {
    id: 'ocean',    label: '🌊 Océan',
    theme: { primary: '#0d6e9a', primaryDark: '#094f6e', primaryDarker: '#063345', accent: '#7ecbe0', accentDark: '#3dafc6', flagLeft: '#0d6e9a', flagRight: '#7ecbe0' },
  },
  {
    id: 'rose',     label: '🌸 Rose',
    theme: { primary: '#8b2252', primaryDark: '#65183c', primaryDarker: '#3e0e24', accent: '#f4b8d3', accentDark: '#e07aaa', flagLeft: '#8b2252', flagRight: '#f4b8d3' },
  },
  {
    id: 'slate',    label: '🌙 Ardoise',
    theme: { primary: '#2d3a4a', primaryDark: '#1e2836', primaryDarker: '#101820', accent: '#8ca8c8', accentDark: '#5a80a8', flagLeft: '#2d3a4a', flagRight: '#8ca8c8' },
  },
  {
    id: 'autumn',   label: '🍂 Automne',
    theme: { primary: '#7a3010', primaryDark: '#5a220a', primaryDarker: '#3a1404', accent: '#f0a050', accentDark: '#c86820', flagLeft: '#7a3010', flagRight: '#f0a050' },
  },
];

export default function CreateFamilyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [familyName,   setFamilyName]   = useState('');
  const [password,     setPassword]     = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [createdUrl,   setCreatedUrl]   = useState('');
  const [isPublic,     setIsPublic]     = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('italian');

  const { hasCopied, onCopy } = useClipboard(createdUrl);

  const currentPreset = PRESETS.find(p => p.id === selectedPreset) || PRESETS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const passwordHash = password ? CryptoJS.SHA256(password).toString() : null;
      const familyId = await createFamily({ name: familyName.trim(), passwordHash, theme: currentPreset.theme, isPublic });
      const url = `${window.location.origin}/f/${familyId}`;
      if (isPublic) {
        navigate(`/f/${familyId}`);
      } else {
        setCreatedUrl(url);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || t('error', 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  // if (createdUrl) — page de confirmation pour les familles privées (lien à copier)
  if (createdUrl) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={2}
        bg={`linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-dark) 50%, var(--theme-primary-darker) 100%)`}
      >
        <Container maxW="md" px={{ base: 4, md: 0 }}>
          <VStack spacing={6} align="stretch">
            <VStack spacing={2} textAlign="center">
              <Box fontSize="4xl">🔒</Box>
              <Heading size="lg" color="gray.200">
                {t('familyCreated', 'Family tree created!')}
              </Heading>
              <Text color="gray.400" fontSize="sm">
                {t('familyCreatedPrivateDesc', 'Save this link — it\'s the only way to access your family tree.')}
              </Text>
            </VStack>

            <Box bg="gray.50" borderRadius="lg" p={4} border="1px" borderColor="gray.200">
              <Text fontSize="xs" color="gray.500" mb={2} textTransform="uppercase" fontWeight="semibold">
                {t('yourFamilyLink', 'Your family link')}
              </Text>
              <HStack>
                <Code flex="1" p={2} borderRadius="md" fontSize="sm" bg="gray.100" wordBreak="break-all">
                  {createdUrl}
                </Code>
                <IconButton
                  icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                  onClick={onCopy}
                  colorScheme={hasCopied ? 'green' : 'gray'}
                  aria-label="Copy link"
                  size="sm"
                  flexShrink={0}
                />
              </HStack>
            </Box>

            <Button
              size="lg"
              bg={'var(--theme-primary)'}
              color="white"
              _hover={{ bg: 'var(--theme-primary-dark)' }}
              onClick={() => navigate(createdUrl.replace(window.location.origin, ''))}
            >
              {t('openMyTree', 'Open my family tree')}
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={`linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-dark) 50%, var(--theme-primary-darker) 100%)`}
    >
      <Container maxW="md" px={{ base: 4, md: 0 }}>
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Box fontSize="5xl">🌳</Box>
            <Heading size="xl" color="white" fontFamily="serif" textShadow="2px 2px 4px rgba(0,0,0,0.3)">
              {t('createNewFamily', 'Create a new family tree')}
            </Heading>
          </VStack>

          <Box bg="white" borderRadius="2xl" p={8} shadow="2xl">
            <form onSubmit={handleSubmit}>
              <VStack spacing={5} align="stretch">
                {error && (
                  <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <FormControl isRequired>
                  <FormLabel>{t('familyName', 'Family name')}</FormLabel>
                  <Input
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder={t('familyNamePlaceholder', 'e.g. The Smith Family')}
                    size="lg"
                    _focus={{ borderColor: currentPreset.theme.primary, boxShadow: `0 0 0 1px ${currentPreset.theme.primary}` }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>{t('themeColor', 'Theme color')}</FormLabel>
                  <SimpleGrid columns={3} spacing={2}>
                    {PRESETS.map(preset => (
                      <Tooltip key={preset.id} label={preset.label} placement="top">
                        <Box
                          as="button"
                          type="button"
                          borderRadius="lg"
                          h="44px"
                          cursor="pointer"
                          border="3px solid"
                          borderColor={selectedPreset === preset.id ? 'gray.800' : 'transparent'}
                          boxShadow={selectedPreset === preset.id ? '0 0 0 2px white inset' : 'none'}
                          onClick={() => setSelectedPreset(preset.id)}
                          overflow="hidden"
                          display="flex"
                          title={preset.label}
                        >
                          <Box flex="1" bg={preset.theme.flagLeft} />
                          <Box flex="2" bg={preset.theme.primary} display="flex" alignItems="center" justifyContent="center">
                            <Text fontSize="xs" color="white" fontWeight="bold" noOfLines={1} px={1}>
                              {preset.label}
                            </Text>
                          </Box>
                          <Box flex="1" bg={preset.theme.flagRight} />
                        </Box>
                      </Tooltip>
                    ))}
                  </SimpleGrid>
                </FormControl>

                <FormControl>
                  <FormLabel>{t('password', 'Password')} ({t('optional', 'optional')})</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder', 'Leave blank for no password')}
                      _focus={{ borderColor: 'var(--theme-primary)', boxShadow: `0 0 0 1px var(--theme-primary)` }}
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={showPw ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPw(p => !p)}
                        aria-label="Toggle password visibility"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormHelperText>
                    {t('passwordHelperText', 'Protects your tree with a password in addition to the secret link.')}
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <HStack justify="space-between" align="center">
                    <Box>
                      <FormLabel mb={0}>{t('visibleOnHomepage', 'Visible sur la page d\'accueil')}</FormLabel>
                      <FormHelperText mt={0}>
                        {isPublic
                          ? t('visibleOnHomepageOn', 'Votre famille apparaîtra dans la liste d\'accueil.')
                          : t('visibleOnHomepageOff', 'Accès uniquement via le lien secret.')}
                      </FormHelperText>
                    </Box>
                    <Switch
                      isChecked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      colorScheme="green"
                      size="lg"
                    />
                  </HStack>
                </FormControl>

                <Button
                  type="submit"
                  size="lg"
                  bg={currentPreset.theme.primary}
                  color="white"
                  _hover={{ bg: currentPreset.theme.primaryDark }}
                  isLoading={loading}
                  isDisabled={!familyName.trim()}
                >
                  {t('createFamily', 'Create family tree')}
                </Button>

                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                  {t('back', 'Back')}
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
