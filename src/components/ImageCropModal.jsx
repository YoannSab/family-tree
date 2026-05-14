import { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import UTIF from 'utif';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Button, HStack, VStack, Box, Text, Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  Spinner, Center,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// ── Helpers ───────────────────────────────────────────────────────────────────

const MAX_CROP_DIM = 1800;

const isTiff = (file) =>
  file.type === 'image/tiff' || /\.tiff?$/i.test(file.name);

/** Decode a TIFF file with utif (pure JS, no browser codec needed). */
const tiffToCanvas = async (file) => {
  const buffer = await file.arrayBuffer();
  const ifds = UTIF.decode(buffer);
  if (!ifds.length) throw new Error('empty TIFF');
  UTIF.decodeImage(buffer, ifds[0]);
  const rgba = UTIF.toRGBA8(ifds[0]);
  const { width, height } = ifds[0];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const imageData = canvas.getContext('2d').createImageData(width, height);
  imageData.data.set(rgba);
  canvas.getContext('2d').putImageData(imageData, 0, 0);
  return canvas;
};

/** Decode a standard image file (JPEG, PNG, WebP…) into a canvas via createImageBitmap. */
const standardToCanvas = async (file) => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  bitmap.close?.();
  return canvas;
};

/**
 * Convert any image file to a downscaled JPEG blob URL ready for the Cropper.
 * TIFF files are decoded with utif; everything else goes through createImageBitmap.
 */
const prepareForCrop = async (file) => {
  const srcCanvas = isTiff(file)
    ? await tiffToCanvas(file)
    : await standardToCanvas(file);

  const { width: w, height: h } = srcCanvas;
  if (!w || !h) throw new Error('empty_image');

  // Downscale if the image exceeds MAX_CROP_DIM on any side
  const scale = Math.min(1, MAX_CROP_DIM / Math.max(w, h));
  let outCanvas = srcCanvas;
  if (scale < 1) {
    outCanvas = document.createElement('canvas');
    outCanvas.width  = Math.round(w * scale);
    outCanvas.height = Math.round(h * scale);
    outCanvas.getContext('2d').drawImage(srcCanvas, 0, 0, outCanvas.width, outCanvas.height);
  }

  return new Promise((resolve, reject) => {
    outCanvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('toBlob failed')); return; }
        const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
        const converted = new File([blob], name, { type: 'image/jpeg' });
        resolve({ url: URL.createObjectURL(converted), file: converted });
      },
      'image/jpeg',
      0.93,
    );
  });
};

const getCroppedImg = async (imageSrc, pixelCrop, originalName) => {
  // imageSrc is always a JPEG blob URL at this point (output of prepareForCrop)
  const bitmap = await createImageBitmap(await fetch(imageSrc).then(r => r.blob()));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width  = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    bitmap,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  );
  bitmap.close?.();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
        const name = originalName.replace(/\.[^.]+$/, '') + '.jpg';
        resolve(new File([blob], name, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  });
};

// ── Component ─────────────────────────────────────────────────────────────────

const ImageCropModal = ({ file, isOpen, onConfirm, onCancel, aspectRatio = 1 }) => {
  const { t } = useTranslation();
  const [prepared, setPrepared] = useState(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState(false);
  const preparedUrlRef = useRef(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Prepare (convert + possibly resize) the image whenever the file changes.
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setIsPreparing(true);
    setPrepareError(false);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);

    prepareForCrop(file).then(({ url, file: f }) => {
      if (cancelled) { URL.revokeObjectURL(url); return; }
      if (preparedUrlRef.current) URL.revokeObjectURL(preparedUrlRef.current);
      preparedUrlRef.current = url;
      setPrepared({ url, file: f });
      setIsPreparing(false);
    }).catch((err) => {
      console.error('Image preparation failed:', err);
      if (!cancelled) {
        setIsPreparing(false);
        setPrepareError(true);
      }
    });

    return () => { cancelled = true; };
  }, [file]);

  const onCropComplete = useCallback((_, cap) => {
    setCroppedAreaPixels(cap);
  }, []);

  const handleConfirm = async () => {
    const url = preparedUrlRef.current;
    if (!url || !croppedAreaPixels || !file) return;
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(url, croppedAreaPixels, file.name);
      URL.revokeObjectURL(url);
      preparedUrlRef.current = null;
      setPrepared(null);
      onConfirm(croppedFile);
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipCrop = () => {
    if (preparedUrlRef.current) {
      URL.revokeObjectURL(preparedUrlRef.current);
      preparedUrlRef.current = null;
      setPrepared(null);
    }
    // Send the JPEG-converted version if available, otherwise the raw original file
    onConfirm(prepared?.file ?? file);
  };

  const handleCancel = () => {
    if (preparedUrlRef.current) {
      URL.revokeObjectURL(preparedUrlRef.current);
      preparedUrlRef.current = null;
      setPrepared(null);
    }
    onCancel();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} isCentered size="lg" motionPreset="none">
      <ModalOverlay bg="rgba(0,0,0,0.75)" />
      <ModalContent
        mx={4}
        borderRadius="xl"
        border="2px solid var(--theme-accent)"
        overflow="hidden"
      >
        {/* Thin flag accent */}
        <Box
          position="absolute"
          top={0} left={0} right={0} h="3px"
          bg="linear-gradient(90deg, var(--theme-flag-left) 33%, #fff 33% 66%, var(--theme-flag-right) 66%)"
        />

        <ModalHeader pt={6} pb={2} fontSize="md" fontWeight="bold" color="var(--theme-primary)">
          ✂️ {t('cropPhoto')}
        </ModalHeader>
        <ModalCloseButton top={5} isDisabled={isProcessing} color="var(--theme-primary-dark)" />

        <ModalBody pb={4}>
          <VStack spacing={4}>
            {/* Crop area */}
            <Box
              position="relative"
              w="full"
              h={{ base: '300px', md: '380px' }}
              borderRadius="lg"
              overflow="hidden"
              bg="gray.900"
            >
              {isPreparing && (
                <Center h="full" flexDirection="column" gap={3}>
                  <Spinner size="lg" color="var(--theme-accent)" thickness="3px" />
                  <Text fontSize="xs" color="gray.400">{t('processing')}</Text>
                </Center>
              )}
              {prepareError && (
                <Center h="full" flexDirection="column" gap={2} px={6}>
                  <Text fontSize="2xl">⚠️</Text>
                  <Text fontSize="sm" color="red.300" textAlign="center">
                    {t('cropUnsupportedFormat')}
                  </Text>
                </Center>
              )}
              {!isPreparing && !prepareError && prepared?.url && (
                <Cropper
                  image={prepared.url}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{ containerStyle: { borderRadius: '8px' } }}
                />
              )}
            </Box>

            {/* Zoom slider — hidden while preparing */}
            {!isPreparing && (
              <HStack w="full" spacing={3} align="center">
                <Text fontSize="xs" color="gray.500" flexShrink={0} minW="40px">
                  {t('zoom')}
                </Text>
                <Slider
                  min={1}
                  max={5}
                  step={0.05}
                  value={zoom}
                  onChange={setZoom}
                  focusThumbOnChange={false}
                  aria-label="zoom"
                >
                  <SliderTrack bg="gray.200">
                    <SliderFilledTrack bg="var(--theme-primary)" />
                  </SliderTrack>
                  <SliderThumb boxSize={4} bg="var(--theme-primary)" />
                </Slider>
                <Text fontSize="xs" color="gray.400" flexShrink={0} minW="28px" textAlign="right">
                  {zoom.toFixed(1)}×
                </Text>
              </HStack>
            )}

            <Text fontSize="xs" color="gray.400" textAlign="center">
              {t('cropHint')}
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter pt={2} pb={4} px={{ base: 3, md: 6 }} gap={{ base: 2, md: 3 }}>
            <Button
              variant="outline"
              borderColor="var(--theme-primary)"
              color="var(--theme-primary)"
              onClick={handleCancel}
              isDisabled={isProcessing}
              size={{ base: 'xs', md: 'md' }}
              flexShrink={0}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="ghost"
              color="gray.800"
              bg="gray.200"
              _hover={{ bg: 'gray.300' }}
              _disabled={{ opacity: 0.35, cursor: 'not-allowed' }}
              onClick={handleSkipCrop}
              isDisabled={isProcessing || !file}
              size={{ base: 'xs', md: 'md' }}
              flexShrink={1}
              minW={0}
            >
              {t('cropSkip')}
            </Button>
            {!prepareError && (
              <Button
                bg="var(--theme-primary)"
                color="white"
                _hover={{ bg: 'var(--theme-primary-dark)', opacity: 1 }}
                _disabled={{ bg: 'gray.300', color: 'gray.500', cursor: 'not-allowed' }}
                onClick={handleConfirm}
                isLoading={isProcessing}
                loadingText={t('processing')}
                isDisabled={isPreparing || !croppedAreaPixels}
                size={{ base: 'xs', md: 'md' }}
                flexShrink={0}
              >
                {t('cropConfirm')}
              </Button>
            )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ImageCropModal;
