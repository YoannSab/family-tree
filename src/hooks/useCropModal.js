import { useState, useRef, useCallback } from 'react';

/**
 * Hook that manages the lifecycle of an image crop modal.
 * openCrop(file) returns a Promise<File|null>:
 *   - resolves with the cropped File when the user confirms
 *   - resolves with null when the user cancels
 */
export const useCropModal = () => {
  const [pendingFile, setPendingFile] = useState(null);
  const [cropIsOpen, setCropIsOpen] = useState(false);
  const resolveRef = useRef(null);

  const openCrop = useCallback((file) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setPendingFile(file);
      setCropIsOpen(true);
    });
  }, []);

  const onCropConfirm = useCallback((croppedFile) => {
    setCropIsOpen(false);
    setPendingFile(null);
    resolveRef.current?.(croppedFile);
    resolveRef.current = null;
  }, []);

  const onCropCancel = useCallback(() => {
    setCropIsOpen(false);
    setPendingFile(null);
    resolveRef.current?.(null);
    resolveRef.current = null;
  }, []);

  return { pendingFile, cropIsOpen, openCrop, onCropConfirm, onCropCancel };
};
