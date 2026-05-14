import { useState, useEffect, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import CryptoJS from 'crypto-js';
import { THEME } from '../config/config';

// Firebase imports are lazy to avoid issues when DATA_SOURCE !== 'firebase'
let firebaseAuthDeps = null;
const getFirebaseAuthDeps = async () => {
  if (!firebaseAuthDeps) {
    const [configModule, { getFunctions, httpsCallable }, { signInWithCustomToken, onAuthStateChanged }] =
      await Promise.all([
        import('../config/config.js'),
        import('firebase/functions'),
        import('firebase/auth'),
      ]);
    // Ensure Firebase app is initialized before reading auth
    await configModule.initFirebase();
    const { auth } = configModule;
    firebaseAuthDeps = { auth, getFunctions, httpsCallable, signInWithCustomToken, onAuthStateChanged };
  }
  return firebaseAuthDeps;
};

export const usePasswordProtection = (onUnlock, passwordHash = '', familyId = '') => {
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

  // On mount: check if the Firebase user is already signed in for this family.
  // For no-password families we still need a Firebase Auth token so Firestore
  // rules can verify the familyId claim — the Cloud Function grants it freely.
  useEffect(() => {
    if (!familyId) return;

    let unsubscribe;
    getFirebaseAuthDeps().then(({ auth, getFunctions, httpsCallable, signInWithCustomToken, onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const idToken = await user.getIdTokenResult();
          if (idToken.claims.familyId === familyId) {
            onUnlock();
            setIsAuthChecked(true);
            return;
          }
        }

        // No valid session — if no password, silently get a token from the CF
        if (!passwordHash) {
          try {
            const functions = getFunctions();
            const verifyPassword = httpsCallable(functions, 'verifyFamilyPassword');
            const result = await verifyPassword({ familyId, passwordHash: '' });
            await signInWithCustomToken(auth, result.data.token);
            onUnlock();
          } catch {
            // CF unreachable — unlock anyway (family has no password)
            onUnlock();
          }
        }

        setIsAuthChecked(true);
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [onUnlock, passwordHash, familyId]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const hashedPassword = CryptoJS.SHA256(password).toString();

      // Local mode: compare hash directly, no Cloud Function
      if (!familyId) {
        if (hashedPassword === passwordHash) {
          onUnlock();
        } else {
          setError(t('passwordError'));
          setPassword('');
        }
        return;
      }

      const { auth, getFunctions, httpsCallable, signInWithCustomToken } = await getFirebaseAuthDeps();
      const functions = getFunctions();
      const verifyPassword = httpsCallable(functions, 'verifyFamilyPassword');

      const result = await verifyPassword({ familyId, passwordHash: hashedPassword });
      await signInWithCustomToken(auth, result.data.token);

      onUnlock();
    } catch (err) {
      // Firebase callable errors have a `code` property
      if (err?.code === 'functions/permission-denied') {
        setError(t('passwordError'));
      } else {
        setError(t('passwordError'));
      }
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  }, [password, onUnlock, t, passwordHash, familyId]);

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
