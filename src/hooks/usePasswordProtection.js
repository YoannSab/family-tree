import { useState, useEffect, useCallback } from 'react';
import { useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import CryptoJS from 'crypto-js';

const TARGET_HASH = '10bad1fc4630e07864527ea519a0e323d8a1e176a2c8564eaa6211c02e6cfc80';

export const usePasswordProtection = (onUnlock) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const italianGold = '#c8a882';
  const italianGreen = '#2d5a27';

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const hashedPassword = CryptoJS.SHA256(password).toString();

    if (hashedPassword === TARGET_HASH) {
      localStorage.setItem('familyTreePassword', password);
      onUnlock();
    } else {
      setError(t('passwordError'));
      setPassword('');
    }
    setIsLoading(false);
  }, [password, onUnlock, t]);

  useEffect(() => {
    const storedPassword = localStorage.getItem('familyTreePassword');
    if (storedPassword) {
      const hashedStoredPassword = CryptoJS.SHA256(storedPassword).toString();
      if (hashedStoredPassword === TARGET_HASH) {
        onUnlock();
      }
    }
  }, [onUnlock]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return {
    t,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    error,
    isLoading,
    handleSubmit,
    bgColor,
    cardBg,
    italianGold,
    italianGreen,
  };
};
