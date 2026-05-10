import { useState, useEffect } from 'react';
import { getImageUrl, getImageUrlCached, hasCachedUrl, subscribeToCacheUpdate } from '../services/storageService';

export const useImageUrl = (familyId, filename) => {
  const [url, setUrl] = useState(() => getImageUrlCached(familyId, filename));
  const [isLoading, setIsLoading] = useState(false);

  // Resolve URL from cache or fetch async
  useEffect(() => {
    if (!filename || filename === 'default') {
      setUrl(null);
      return;
    }
    if (hasCachedUrl(familyId, filename)) {
      setUrl(getImageUrlCached(familyId, filename));
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    getImageUrl(familyId, filename).then((resolved) => {
      if (!cancelled) {
        setUrl(resolved);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [familyId, filename]);

  // Re-read from cache when uploadImage (or getImageUrl) updates the blob URL
  // for this exact key — handles the case where filename doesn’t change on re-upload.
  useEffect(() => {
    if (!filename || filename === 'default' || !familyId) return;
    const key = `${familyId}::${filename.includes('.') ? filename : `${filename}.JPG`}`;
    return subscribeToCacheUpdate((updatedKey) => {
      if (updatedKey === key) {
        setUrl(getImageUrlCached(familyId, filename));
      }
    });
  }, [familyId, filename]);

  return { url, isLoading };
};
