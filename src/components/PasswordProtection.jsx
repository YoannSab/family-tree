import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    Button,
    Text,
    Heading,
    Alert,
    AlertIcon,
    Container,
    InputGroup,
    InputRightElement,
    IconButton,
    useColorModeValue,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, LockIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import CryptoJS from 'crypto-js';

const PasswordProtection = ({ onUnlock }) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const targetHash = '10bad1fc4630e07864527ea519a0e323d8a1e176a2c8564eaa6211c02e6cfc80';

    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const italianGold = '#c8a882';
    const italianGreen = '#2d5a27';


    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Hash the password using SHA-256
        const hashedPassword = CryptoJS.SHA256(password).toString();

        if (hashedPassword === targetHash) {
            // Simply store auth: true in localStorage
            localStorage.setItem('familyTreePassword', password);
            onUnlock();
        } else {
            setError(t('passwordError'));
            setPassword('');
        }

        setIsLoading(false);
    };

    useEffect(() => {
        const storedPassword = localStorage.getItem('familyTreePassword');
        if (storedPassword) {
            const hashedStoredPassword = CryptoJS.SHA256(storedPassword).toString();
            if (hashedStoredPassword === targetHash) {
                onUnlock();
            }
        }
    }, [onUnlock]);


    return (
        <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
            {/* Background with Italian colors */}
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="linear-gradient(135deg, #2d5a27 0%, #1e3a1a 50%, #0f2e0d 100%)"
                opacity={0.95}
            />

            <Container maxW="md" position="relative" zIndex={1}>
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <VStack spacing={4} textAlign="center">
                        <Box fontSize="6xl">🇮🇹</Box>
                        <VStack spacing={2}>
                            <Heading
                                size="xl"
                                color="white"
                                fontFamily="serif"
                                textShadow="2px 2px 4px rgba(0,0,0,0.3)"
                            >
                                Famiglia Colanero
                            </Heading>
                            <Text
                                fontSize="lg"
                                color="rgba(255,255,255,0.9)"
                                fontStyle="italic"
                                letterSpacing="0.5px"
                            >
                                {t('subtitle')}
                            </Text>
                        </VStack>

                        {/* Decorative line */}
                        <Box
                            w="200px"
                            h="2px"
                            bg={`linear-gradient(90deg, transparent 0%, ${italianGold} 20%, #d4af37 50%, ${italianGold} 80%, transparent 100%)`}
                            borderRadius="full"
                        />
                    </VStack>

                    {/* Login Card */}
                    <Box
                        bg={cardBg}
                        borderRadius="xl"
                        p={8}
                        boxShadow="0 20px 60px rgba(0,0,0,0.3)"
                        border={`3px solid ${italianGold}`}
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
                        />

                        <VStack spacing={6} pt={2}>
                            <VStack spacing={2} textAlign="center">
                                <Box
                                    p={4}
                                    bg={`linear-gradient(135deg, ${italianGreen}, #1e3a1a)`}
                                    borderRadius="full"
                                    color="white"
                                    fontSize="2xl"
                                >
                                    <LockIcon />
                                </Box>
                                <Heading size="md" color={italianGreen} fontFamily="serif">
                                    {t('accessProtected')}
                                </Heading>
                                <Text fontSize="sm" color="gray.600" textAlign="center">
                                    {t('enterPasswordAccess')}
                                </Text>
                            </VStack>

                            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                                <VStack spacing={4}>
                                    <InputGroup size="lg">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder={t('password')}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            bg="white"
                                            border="2px solid"
                                            borderColor={error ? 'red.300' : italianGold}
                                            borderRadius="lg"
                                            _focus={{
                                                borderColor: error ? 'red.400' : '#d4af37',
                                                boxShadow: `0 0 0 1px ${error ? '#f56565' : '#d4af37'}`
                                            }}
                                            _hover={{
                                                borderColor: error ? 'red.400' : '#d4af37'
                                            }}
                                            required
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                h="1.75rem"
                                                size="sm"
                                                onClick={() => setShowPassword(!showPassword)}
                                                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                                variant="ghost"
                                                color="gray.500"
                                                _hover={{ color: italianGreen }}
                                            />
                                        </InputRightElement>
                                    </InputGroup>

                                    {error && (
                                        <Alert status="error" borderRadius="lg" fontSize="sm">
                                            <AlertIcon />
                                            {error}
                                        </Alert>
                                    )}

                                    <Button
                                        type="submit"
                                        size="lg"
                                        w="full"
                                        bg={`linear-gradient(135deg, ${italianGreen} 0%, #1e3a1a 100%)`}
                                        color="white"
                                        _hover={{
                                            bg: "linear-gradient(135deg, #1e3a1a 0%, #0f2e0d 100%)",
                                            transform: "translateY(-1px)",
                                            boxShadow: "0 6px 20px rgba(45, 90, 39, 0.4)"
                                        }}
                                        _active={{ transform: "translateY(0)" }}
                                        boxShadow="0 4px 12px rgba(45, 90, 39, 0.3)"
                                        borderRadius="lg"
                                        fontWeight="bold"
                                        isLoading={isLoading}
                                        loadingText={t('verifying')}
                                        leftIcon={<LockIcon />}
                                    >
                                        {t('unlock')}
                                    </Button>
                                </VStack>
                            </form>
                        </VStack>
                    </Box>

                    {/* Footer */}
                    <Text
                        textAlign="center"
                        fontSize="sm"
                        color="rgba(255,255,255,0.7)"
                        fontStyle="italic"
                    >
                        {t('familyTreeProtected')}
                    </Text>
                </VStack>
            </Container>
        </Box>
    );
};

export default PasswordProtection;
