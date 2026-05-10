import { useState, useEffect, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import CryptoJS from 'crypto-js';
import { THEME } from '../config/config';

export const usePasswordProtection = (onUnlock, passwordHash = '') => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const bgColor = THEME.bgPage;
  const cardBg = THEME.bgSurface;
  const italianGold = 'var(--theme-accent)';
  const italianGreen = 'var(--theme-primary)';

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const hashedPassword = CryptoJS.SHA256(password).toString();

    if (hashedPassword === passwordHash) {
      localStorage.setItem(`familyTreePassword_${passwordHash}`, password);
      onUnlock();
    } else {
      setError(t('passwordError'));
      setPassword('');
    }
    setIsLoading(false);
  }, [password, onUnlock, t, passwordHash]);

  useEffect(() => {
    // No password required — auto-unlock
    if (!passwordHash) {
      onUnlock();
      setIsAuthChecked(true);
      return;
    }
    const storedPassword = localStorage.getItem(`familyTreePassword_${passwordHash}`);
    if (storedPassword) {
      const hashedStoredPassword = CryptoJS.SHA256(storedPassword).toString();
      if (hashedStoredPassword === passwordHash) {
        onUnlock();
      }
    }
    setIsAuthChecked(true);
  }, [onUnlock, passwordHash]);

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
    isAuthChecked,
  };
};
