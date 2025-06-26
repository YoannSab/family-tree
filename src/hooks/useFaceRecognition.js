import { useState, useRef, useEffect, useCallback } from 'react'
import * as faceapi from 'face-api.js'

export const useFaceRecognition = (familyData, isOpen) => {
    const [isLoading, setIsLoading] = useState(false)
    const [isModelLoaded, setIsModelLoaded] = useState(false)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [capturedImage, setCapturedImage] = useState(null)
    const [capturedImageCanvas, setCapturedImageCanvas] = useState(null)
    const [recognitionResults, setRecognitionResults] = useState([])
    const [noFacesFound, setNoFacesFound] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [labeledDescriptors, setLabeledDescriptors] = useState([])
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [currentFacingMode, setCurrentFacingMode] = useState('environment')
    const [isSwitchingCamera, setIsSwitchingCamera] = useState(false)

    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const captureCanvasRef = useRef(null)
    const streamRef = useRef(null)

    // Charger les modèles face-api.js
    const loadModels = useCallback(async () => {
        try {
            setIsLoading(true)
            setLoadingProgress(0)

            const MODEL_URL = '/models'

            // Charger les modèles un par un avec le progrès
            await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
            setLoadingProgress(25)

            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
            setLoadingProgress(50)

            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            setLoadingProgress(75)

            await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
            setLoadingProgress(100)
            setIsModelLoaded(true)
        } catch (error) {
            console.error('Erreur lors du chargement des modèles:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Sauvegarder les descripteurs
    const saveDescriptors = async (descriptors, personMap) => {
        try {
            const descriptorsData = Array.from(descriptors).map(desc => ({
                label: desc.label,
                descriptors: Array.from(desc.descriptors[0]), // Convertir Float32Array en Array
                personData: personMap.get(desc.label)
            }))

            // Sauvegarder les noms des images pour détecter les changements
            const imageNames = Array.from(familyData.values()).map(person => person.data.image).sort()

            // Sauvegarder dans localStorage
            localStorage.setItem('faceDescriptors', JSON.stringify(descriptorsData))
            localStorage.setItem('faceDescriptorsImageNames', JSON.stringify(imageNames))
            console.log(`${descriptorsData.length} descripteurs sauvegardés dans le cache local`)

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error)
        }
    }

    // Charger les descripteurs
    const loadDescriptors = async () => {
        try {
            // Vérifier si les images ont changé
            const currentImageNames = Array.from(familyData.values()).map(person => person.data.image).sort()
            const savedImageNames = JSON.parse(localStorage.getItem('faceDescriptorsImageNames') || '[]')

            const imagesChanged = JSON.stringify(currentImageNames) !== JSON.stringify(savedImageNames)

            if (imagesChanged) {
                console.log('Les images ont changé, recréation des descripteurs nécessaire')
                localStorage.removeItem('faceDescriptors')
                localStorage.removeItem('faceDescriptorsImageNames')
                return false
            }

            // Charger depuis localStorage
            const stored = localStorage.getItem('faceDescriptors')
            if (stored) {
                const descriptorsData = JSON.parse(stored)
                const descriptors = []
                const personMap = new Map()

                descriptorsData.forEach(item => {
                    const descriptor = new Float32Array(item.descriptors)
                    const labeledDescriptor = new faceapi.LabeledFaceDescriptors(
                        item.label,
                        [descriptor]
                    )
                    descriptors.push(labeledDescriptor)
                    personMap.set(item.label, item.personData)
                })

                setLabeledDescriptors(descriptors)
                window.faceRecognitionPersonMap = personMap
                console.log(`${descriptors.length} descripteurs chargés depuis le cache local`)

                setIsLoading(false)
                return true
            }

            return false
        } catch (error) {
            console.error('Erreur lors du chargement des descripteurs:', error)
            return false
        }
    }

    // Créer les descripteurs étiquetés à partir des données familiales
    const createLabeledDescriptors = useCallback(async () => {
        if (!familyData || !isModelLoaded) return
        setIsLoading(true)
        setLoadingProgress(0)
        // D'abord essayer de charger depuis le cache
        const loaded = await loadDescriptors()
        if (loaded) return

        try {
            const descriptors = []
            const personMap = new Map()
            const familyLength = familyData.length
            for (const person of familyData) {
                if (person.data.image && person.data.image !== 'default') {
                    try {
                        const img = await faceapi.fetchImage(`/images/${person.data.image}.JPG`)
                        const detection = await faceapi
                            .detectSingleFace(img)
                            .withFaceLandmarks()
                            .withFaceDescriptor()

                        if (detection) {
                            const label = `${person.data.firstName} ${person.data.lastName}`
                            const labeledDescriptor = new faceapi.LabeledFaceDescriptors(
                                label,
                                [detection.descriptor]
                            )
                            descriptors.push(labeledDescriptor)
                            personMap.set(label, person)
                        }
                        setLoadingProgress((prev) => {
                            const progress = Math.min(100, Math.round((descriptors.length / familyLength) * 100))
                            return progress > prev ? progress : prev
                        })
                    } catch (error) {
                        console.warn(`Impossible de traiter l'image pour ${person.data.firstName}:`, error)
                    }
                }
            }

            setLabeledDescriptors(descriptors)
            window.faceRecognitionPersonMap = personMap

            // Sauvegarder les descripteurs créés
            await saveDescriptors(descriptors, personMap)
            setIsLoading(false)
            console.log(`${descriptors.length} descripteurs créés et sauvegardés`)
        } catch (error) {
            console.error('Erreur lors de la création des descripteurs:', error)
        }
    }, [familyData, isModelLoaded])

    // Démarrer la caméra
    const startCamera = async (facingMode = currentFacingMode) => {
        try {
            const constraints = {
                video: {
                    width: { ideal: window.innerWidth < 768 ? 480 : 640 },
                    height: { ideal: window.innerWidth < 768 ? 360 : 480 },
                    facingMode: facingMode
                }
            }

            // Pour la caméra arrière, ajouter des contraintes pour éviter l'ultra-wide
            if (facingMode === 'environment') {
                const availableDevices = await navigator.mediaDevices.enumerateDevices()
                const backCameras = availableDevices.filter(device => device.kind === 'videoinput' && device.label.toLowerCase().includes('back'))
                if (backCameras.length > 0) {
                    constraints.video.deviceId = { exact: backCameras[backCameras.length - 1].deviceId }
                }
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            streamRef.current = stream
            setIsCameraActive(true)
            setIsSwitchingCamera(false)

        } catch (error) {
            console.error('Erreur d\'accès à la caméra:', error)
        }
    }

    // Basculer entre caméra avant/arrière
    const switchCamera = async () => {
        setIsSwitchingCamera(true)
        const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'
        setCurrentFacingMode(newFacingMode)

        if (isCameraActive) {
            stopCamera()
            // Petit délai pour s'assurer que l'ancienne caméra est bien fermée
            setTimeout(async () => {
                try {
                    const constraints = {
                        video: {
                            width: { ideal: window.innerWidth < 768 ? 480 : 640 },
                            height: { ideal: window.innerWidth < 768 ? 360 : 480 },
                            facingMode: newFacingMode
                        }
                    }

                    // Pour la caméra arrière, ajouter des contraintes pour éviter l'ultra-wide
                    if (newFacingMode === 'environment') {
                        const availableDevices = await navigator.mediaDevices.enumerateDevices()
                        const backCameras = availableDevices.filter(device => device.kind === 'videoinput' && device.label.toLowerCase().includes('back'))
                        if (backCameras.length > 0) {
                            constraints.video.deviceId = { exact: backCameras[backCameras.length - 1].deviceId }
                        } else {
                            constraints.video.zoom = { exact: 1.0 } // Zoom à 1x pour éviter l'ultra-wide
                        }
                    }

                    const stream = await navigator.mediaDevices.getUserMedia(constraints)
                    streamRef.current = stream
                    setIsCameraActive(true)
                } catch (error) {
                    console.error('Erreur lors du changement de caméra:', error)
                } finally {
                    setIsSwitchingCamera(false)
                }
            }, 100)
        } else {
            setIsSwitchingCamera(false)
        }
    }

    // Arrêter la caméra
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        setIsCameraActive(false)
    }

    // Capturer une image
    const captureImage = () => {
        if (!videoRef.current || !captureCanvasRef.current) return

        const canvas = captureCanvasRef.current
        const video = videoRef.current
        const ctx = canvas.getContext('2d')

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        // Convertir en blob
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob)
            setCapturedImage(url)
            setCapturedImageCanvas(canvas)
            stopCamera()
            recognizeFaces(canvas)
        }, 'image/jpeg', 0.8)
    }

    // Fonction commune pour dessiner les résultats de reconnaissance sur le canvas
    const drawRecognitionResults = useCallback((ctx, results) => {
        results.forEach((result) => {
            const { detection, match, confidence } = result
            const box = detection.detection.box

            // Couleur basée sur la confiance
            const color = confidence > 50 ? '#48bb78' : confidence > 40 ? '#ed8936' : '#f56565'

            // Dessiner la boîte
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.strokeRect(box.x, box.y, box.width, box.height)

            // Dessiner le label
            const label = match.label !== 'unknown'
                ? `${match.label}`
                : `Unknown`

            ctx.fillStyle = color
            ctx.fillRect(box.x, box.y - 25, ctx.measureText(label).width + 10, 25)
            ctx.fillStyle = 'white'
            ctx.font = '14px Arial'
            ctx.fillText(label, box.x + 5, box.y - 8)
        })
    }, [])

    // Reconnaissance faciale
    const recognizeFaces = async (imageCanvas) => {
        if (!labeledDescriptors.length || !imageCanvas) return

        try {
            setIsProcessing(true)
            // Détecter tous les visages dans l'image
            const detections = await faceapi
                .detectAllFaces(imageCanvas)
                .withFaceLandmarks()
                .withFaceDescriptors()

            if (detections.length === 0) {
                setNoFacesFound(true)
                setRecognitionResults([])

                // Dessiner quand même l'image sur le canvas
                if (canvasRef.current) {
                    const displayCanvas = canvasRef.current
                    displayCanvas.width = imageCanvas.width
                    displayCanvas.height = imageCanvas.height

                    const ctx = displayCanvas.getContext('2d')
                    ctx.drawImage(imageCanvas, 0, 0)
                }

                setIsProcessing(false)
                return
            }

            setNoFacesFound(false)

            // Créer le matcher avec les descripteurs
            const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6)

            const results = detections.map((detection, index) => {
                const bestMatch = faceMatcher.findBestMatch(detection.descriptor)

                // Récupérer les données de la personne depuis la map
                const matchedPerson = window.faceRecognitionPersonMap?.get(bestMatch.label) || null

                return {
                    id: index,
                    detection,
                    match: bestMatch,
                    confidence: (1 - bestMatch.distance) * 100,
                    person: matchedPerson,
                    age: Math.round(detection.age),
                    gender: detection.gender,
                    genderProbability: detection.genderProbability
                }
            })

            // Trier par confiance décroissante
            results.sort((a, b) => b.confidence - a.confidence)
            setRecognitionResults(results)

            // Dessiner les résultats sur le canvas
            if (canvasRef.current) {
                const displayCanvas = canvasRef.current
                displayCanvas.width = imageCanvas.width
                displayCanvas.height = imageCanvas.height

                const ctx = displayCanvas.getContext('2d')
                ctx.drawImage(imageCanvas, 0, 0)

                // Utiliser la fonction commune pour dessiner les résultats
                drawRecognitionResults(ctx, results)
            }

        } catch (error) {
            console.error('Erreur lors de la reconnaissance:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    // Fonction pour redessiner le canvas avec les résultats existants
    const redrawCanvas = useCallback(() => {
        if (!canvasRef.current || !captureCanvasRef.current || !capturedImageCanvas) return

        const displayCanvas = canvasRef.current

        // Copier les dimensions du canvas de capture
        displayCanvas.width = capturedImageCanvas.width
        displayCanvas.height = capturedImageCanvas.height

        const ctx = displayCanvas.getContext('2d')
        // Redessiner l'image capturée
        ctx.drawImage(capturedImageCanvas, 0, 0)

        // Utiliser la fonction commune pour dessiner les résultats (seulement s'il y en a)
        if (recognitionResults.length > 0) {
            drawRecognitionResults(ctx, recognitionResults)
        }
    }, [recognitionResults, capturedImageCanvas, drawRecognitionResults])

    // Nettoyer les ressources
    const cleanup = () => {
        stopCamera()
    }

    // Recommencer le processus
    const restart = () => {
        setIsSwitchingCamera(true)
        stopCamera()
        setCapturedImage(null)
        setCapturedImageCanvas(null)
        setRecognitionResults([])
        setNoFacesFound(false)
        if (capturedImage) {
            URL.revokeObjectURL(capturedImage)
        }
        startCamera()
    }

    // Effects
    useEffect(() => {
        if (isOpen && !isModelLoaded) {
            loadModels()
        }
    }, [isOpen, isModelLoaded, loadModels, capturedImage, recognitionResults.length])

    useEffect(() => {
        if (isModelLoaded) {
            createLabeledDescriptors()
        }
    }, [isModelLoaded, createLabeledDescriptors])

    // Effect pour assigner le stream au video element quand il devient disponible
    useEffect(() => {
        if (isCameraActive && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current
        }
    }, [isCameraActive])

    // Effect pour redessiner le canvas quand la modal s'ouvre avec des résultats existants ou quand aucun visage n'est trouvé
    useEffect(() => {
        if (isOpen && (recognitionResults.length > 0 || noFacesFound)) {
            // Attendre un petit délai pour s'assurer que le DOM est rendu
            setTimeout(() => {
                redrawCanvas()
            }, 100)
        }
    }, [isOpen, redrawCanvas, noFacesFound])

    // Démarrer automatiquement la caméra quand les conditions sont remplies
    useEffect(() => {
        if (isModelLoaded && labeledDescriptors.length > 0 && !capturedImage && !isCameraActive && !isSwitchingCamera) {
            startCamera()
        }
    }, [isModelLoaded, labeledDescriptors.length, capturedImage, isCameraActive, isSwitchingCamera])

    // Nettoyer à la fermeture
    useEffect(() => {
        if (!isOpen) {
            cleanup()
        }
    }, [isOpen])

    // Nettoyer au démontage
    useEffect(() => {
        return () => cleanup()
    }, [])

    return {
        // State
        isLoading,
        isModelLoaded,
        isCameraActive,
        capturedImage,
        capturedImageCanvas,
        recognitionResults,
        noFacesFound,
        isProcessing,
        labeledDescriptors,
        loadingProgress,
        currentFacingMode,
        isSwitchingCamera,
        
        // Refs
        videoRef,
        canvasRef,
        captureCanvasRef,
        
        // Actions
        startCamera,
        stopCamera,
        switchCamera,
        captureImage,
        recognizeFaces,
        restart,
        cleanup,
        redrawCanvas
    }
}
