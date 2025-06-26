import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast, useBreakpointValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import * as faceapi from 'face-api.js';

export const useFaceRecognition = (isOpen, onClose, familyData, onPersonSelect) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedImageCanvas, setCapturedImageCanvas] = useState(null);
  const [recognitionResults, setRecognitionResults] = useState([]);
  const [noFacesFound, setNoFacesFound] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [labeledDescriptors, setLabeledDescriptors] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentFacingMode, setCurrentFacingMode] = useState('environment');
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const streamRef = useRef(null);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const loadModels = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadingProgress(0);
      const MODEL_URL = '/models';
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      setLoadingProgress(25);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      setLoadingProgress(50);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setLoadingProgress(75);
      await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
      setLoadingProgress(100);
      setIsModelLoaded(true);
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
      toast({ title: t('errorLoadingModels'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  const saveDescriptors = useCallback(async (descriptors, personMap) => {
    try {
      const descriptorsData = Array.from(descriptors).map(desc => ({
        label: desc.label,
        descriptors: Array.from(desc.descriptors[0]),
        personData: personMap.get(desc.label),
      }));
      const imageNames = Array.from(familyData.values()).map(person => person.data.image).sort();
      localStorage.setItem('faceDescriptors', JSON.stringify(descriptorsData));
      localStorage.setItem('faceDescriptorsImageNames', JSON.stringify(imageNames));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }, [familyData]);

  const loadDescriptors = useCallback(async () => {
    try {
      const currentImageNames = Array.from(familyData.values()).map(person => person.data.image).sort();
      const savedImageNames = JSON.parse(localStorage.getItem('faceDescriptorsImageNames') || '[]');
      const imagesChanged = JSON.stringify(currentImageNames) !== JSON.stringify(savedImageNames);

      if (imagesChanged) {
        localStorage.removeItem('faceDescriptors');
        localStorage.removeItem('faceDescriptorsImageNames');
        return false;
      }

      const stored = localStorage.getItem('faceDescriptors');
      if (stored) {
        const descriptorsData = JSON.parse(stored);
        const descriptors = [];
        const personMap = new Map();
        descriptorsData.forEach(item => {
          const descriptor = new Float32Array(item.descriptors);
          const labeledDescriptor = new faceapi.LabeledFaceDescriptors(item.label, [descriptor]);
          descriptors.push(labeledDescriptor);
          personMap.set(item.label, item.personData);
        });
        setLabeledDescriptors(descriptors);
        window.faceRecognitionPersonMap = personMap;
        setIsLoading(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du chargement des descripteurs:', error);
      return false;
    }
  }, [familyData]);

  const createLabeledDescriptors = useCallback(async () => {
    if (!familyData || !isModelLoaded) return;
    setIsLoading(true);
    setLoadingProgress(0);
    const loaded = await loadDescriptors();
    if (loaded) return;

    try {
      const descriptors = [];
      const personMap = new Map();
      const familyLength = familyData.length;
      for (const person of familyData) {
        if (person.data.image && person.data.image !== 'default') {
          try {
            const img = await faceapi.fetchImage(`/images/${person.data.image}.JPG`);
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (detection) {
              const label = `${person.data.firstName} ${person.data.lastName}`;
              const labeledDescriptor = new faceapi.LabeledFaceDescriptors(label, [detection.descriptor]);
              descriptors.push(labeledDescriptor);
              personMap.set(label, person);
            }
            setLoadingProgress(prev => Math.min(100, Math.round((descriptors.length / familyLength) * 100)));
          } catch (error) {
            console.warn(`Impossible de traiter l'image pour ${person.data.firstName}:`, error);
          }
        }
      }
      setLabeledDescriptors(descriptors);
      window.faceRecognitionPersonMap = personMap;
      await saveDescriptors(descriptors, personMap);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la création des descripteurs:', error);
      toast({ title: t('errorCreatingDescriptors'), status: 'error', duration: 3000, isClosable: true });
    }
  }, [familyData, isModelLoaded, loadDescriptors, saveDescriptors, t, toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: isMobile ? 480 : 640 },
          height: { ideal: isMobile ? 360 : 480 },
          facingMode: currentFacingMode,
        },
      };
      if (currentFacingMode === 'environment') {
        const availableDevices = await navigator.mediaDevices.enumerateDevices();
        const backCameras = availableDevices.filter(device => device.kind === 'videoinput' && device.label.toLowerCase().includes('back'));
        if (backCameras.length > 0) {
          constraints.video.deviceId = { exact: backCameras[backCameras.length - 1].deviceId };
        } else {
          constraints.video.zoom = { exact: 1.0 };
        }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraActive(true);
      setIsSwitchingCamera(false);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      setIsCameraActive(false);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode, width: { exact: 640 }, height: { exact: 480 } } });
        streamRef.current = stream;
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (fallbackError) {
        console.error('Impossible d\'accéder à la caméra:', fallbackError);
        toast({ title: t('errorAccessingCamera'), status: 'error', duration: 3000, isClosable: true });
      }
    }
  }, [currentFacingMode, isMobile, t, toast]);

  const switchCamera = useCallback(async () => {
    setIsSwitchingCamera(true);
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    setCurrentFacingMode(newFacingMode);
    if (isCameraActive) {
      stopCamera();
      setTimeout(async () => {
        await startCamera();
      }, 100);
    } else {
      setIsSwitchingCamera(false);
    }
  }, [currentFacingMode, isCameraActive, stopCamera, startCamera]);

  const drawRecognitionResults = useCallback((ctx, results) => {
    results.forEach(result => {
      const { detection, match, confidence } = result;
      const box = detection.detection.box;
      const color = confidence > 50 ? '#48bb78' : confidence > 40 ? '#ed8936' : '#f56565';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      const label = match.label !== 'unknown' ? `${match.label}` : `Unknown`;
      ctx.fillStyle = color;
      ctx.fillRect(box.x, box.y - 25, ctx.measureText(label).width + 10, 25);
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText(label, box.x + 5, box.y - 8);
    });
  }, []);

  const recognizeFaces = useCallback(async (imageCanvas) => {
    if (!labeledDescriptors.length || !imageCanvas) return;
    try {
      setIsProcessing(true);
      const detections = await faceapi.detectAllFaces(imageCanvas).withFaceLandmarks().withFaceDescriptors().withAgeAndGender();
      if (detections.length === 0) {
        setNoFacesFound(true);
        setRecognitionResults([]);
        if (canvasRef.current) {
          const displayCanvas = canvasRef.current;
          displayCanvas.width = imageCanvas.width;
          displayCanvas.height = imageCanvas.height;
          const ctx = displayCanvas.getContext('2d');
          ctx.drawImage(imageCanvas, 0, 0);
        }
        setIsProcessing(false);
        return;
      }
      setNoFacesFound(false);
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      const results = detections.map((detection, index) => {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        const matchedPerson = window.faceRecognitionPersonMap?.get(bestMatch.label) || null;
        return {
          id: index,
          detection,
          match: bestMatch,
          confidence: (1 - bestMatch.distance) * 100,
          person: matchedPerson,
          age: Math.round(detection.age),
          gender: detection.gender,
          genderProbability: detection.genderProbability,
        };
      });
      results.sort((a, b) => b.confidence - a.confidence);
      setRecognitionResults(results);
      if (canvasRef.current) {
        const displayCanvas = canvasRef.current;
        displayCanvas.width = imageCanvas.width;
        displayCanvas.height = imageCanvas.height;
        const ctx = displayCanvas.getContext('2d');
        ctx.drawImage(imageCanvas, 0, 0);
        drawRecognitionResults(ctx, results);
      }
    } catch (error) {
      console.error('Erreur lors de la reconnaissance:', error);
      toast({ title: t('errorRecognizingFaces'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsProcessing(false);
    }
  }, [labeledDescriptors, drawRecognitionResults, t, toast]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !captureCanvasRef.current) return;
    const canvas = captureCanvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      setCapturedImage(url);
      setCapturedImageCanvas(canvas);
      stopCamera();
      recognizeFaces(canvas);
    }, 'image/jpeg', 0.8);
  }, [stopCamera, recognizeFaces]);

  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || !captureCanvasRef.current || !capturedImageCanvas) return;
    const displayCanvas = canvasRef.current;
    displayCanvas.width = capturedImageCanvas.width;
    displayCanvas.height = capturedImageCanvas.height;
    const ctx = displayCanvas.getContext('2d');
    ctx.drawImage(capturedImageCanvas, 0, 0);
    if (recognitionResults.length > 0) {
      drawRecognitionResults(ctx, recognitionResults);
    }
  }, [recognitionResults, capturedImageCanvas, drawRecognitionResults]);

  const cleanup = useCallback(() => {
    stopCamera();
  }, [stopCamera]);

  const restart = useCallback(() => {
    setIsSwitchingCamera(true);
    stopCamera();
    setCapturedImage(null);
    setCapturedImageCanvas(null);
    setRecognitionResults([]);
    setNoFacesFound(false);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    startCamera();
  }, [capturedImage, stopCamera, startCamera]);

  useEffect(() => {
    if (isOpen && !isModelLoaded) {
      loadModels();
    }
  }, [isOpen, isModelLoaded, loadModels]);

  useEffect(() => {
    if (isModelLoaded) {
      createLabeledDescriptors();
    }
  }, [isModelLoaded, createLabeledDescriptors]);

  useEffect(() => {
    if (isOpen && (recognitionResults.length > 0 || noFacesFound)) {
      setTimeout(() => {
        redrawCanvas();
      }, 100);
    }
  }, [isOpen, redrawCanvas, noFacesFound, recognitionResults.length]);

  useEffect(() => {
    if (isModelLoaded && labeledDescriptors.length > 0 && !capturedImage && !isCameraActive && !isSwitchingCamera) {
      startCamera();
    }
  }, [isModelLoaded, labeledDescriptors.length, capturedImage, isCameraActive, isSwitchingCamera, startCamera]);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen, cleanup]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    t,
    isLoading,
    isModelLoaded,
    isCameraActive,
    capturedImage,
    recognitionResults,
    noFacesFound,
    isProcessing,
    loadingProgress,
    videoRef,
    canvasRef,
    captureCanvasRef,
    isMobile,
    currentFacingMode,
    isSwitchingCamera,
    loadModels,
    startCamera,
    switchCamera,
    captureImage,
    restart,
    onPersonSelect,
  };
};
