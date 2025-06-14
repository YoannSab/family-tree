import { useState, useRef, useEffect, useCallback } from 'react'
import {
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    HStack,
    Text,
    Badge,
    Avatar,
    Spinner,
    Card,
    CardBody,
    Flex,
    IconButton,
    Collapse,
    Progress,
    useBreakpointValue
} from '@chakra-ui/react'
import { RepeatIcon, CheckIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import * as faceapi from 'face-api.js'
import { FiCamera, FiRotateCcw } from 'react-icons/fi'

const FaceRecognition = ({ isOpen, onClose, familyData, onPersonSelect }) => {
    const { t } = useTranslation()

    const [isLoading, setIsLoading] = useState(false)
    const [isModelLoaded, setIsModelLoaded] = useState(false)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [capturedImage, setCapturedImage] = useState(null)
    const [capturedImageCanvas, setCapturedImageCanvas] = useState(null)
    const [recognitionResults, setRecognitionResults] = useState([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [labeledDescriptors, setLabeledDescriptors] = useState([])
    const [loadingProgress, setLoadingProgress] = useState(0)

    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const captureCanvasRef = useRef(null)
    const streamRef = useRef(null)

    const italianGreen = '#2d5a27'
    const italianGold = '#c8a882'    // Responsive values
    const isMobile = useBreakpointValue({ base: true, md: false })
    const modalSize = useBreakpointValue({ base: 'xl', md: 'xl' })
    const cardSpacing = useBreakpointValue({ base: 2, md: 4 })
    const fontSize = useBreakpointValue({ base: 'sm', md: 'md' })
    const avatarSize = useBreakpointValue({ base: 'sm', md: 'md' })
    const [currentFacingMode, setCurrentFacingMode] = useState('environment') // 'user' pour front, 'environment' pour arrière
    const [isSwitchingCamera, setIsSwitchingCamera] = useState(false)

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
        }    }, [])

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
    const startCamera = async () => {
        try {
            const constraints = {
                video: {
                    width: { ideal: isMobile ? 480 : 640 },
                    height: { ideal: isMobile ? 360 : 480 },
                    facingMode: currentFacingMode
                }
            }

            // Pour la caméra arrière, ajouter des contraintes pour éviter l'ultra-wide
            if (currentFacingMode === 'environment') {
                constraints.video.zoom = { exact : 1.0 } // Zoom à 1x pour éviter l'ultra-wide
                // Certains navigateurs supportent ces propriétés pour éviter l'ultra-wide
                // constraints.video.focusDistance = { ideal: 0.5 }
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            streamRef.current = stream
            setIsCameraActive(true)
            setIsSwitchingCamera(false)

        } catch (error) {
            console.error('Erreur d\'accès à la caméra:', error)
            setIsCameraActive(false)
            
            // Essayer avec des contraintes plus basiques si échec
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: currentFacingMode,
                        // Essayer de forcer une résolution qui favorise la caméra principale
                        width: { exact: 640 },
                        height: { exact: 480 }
                    }
                })
                streamRef.current = stream
                setIsCameraActive(true)            
            } catch (fallbackError) {
                console.error('Impossible d\'accéder à la caméra:', fallbackError)
            }
        }
    }    // Basculer entre caméra avant/arrière
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
                            width: { ideal: isMobile ? 480 : 640 },
                            height: { ideal: isMobile ? 360 : 480 },
                            facingMode: newFacingMode
                        }
                    }

                    // Pour la caméra arrière, ajouter des contraintes pour éviter l'ultra-wide
                    if (newFacingMode === 'environment') {
                        constraints.video.zoom = { ideal: 1.0 }
                        constraints.video.focusDistance = { ideal: 0.5 }
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

    // Effect pour assigner le stream au video element quand il devient disponible
    useEffect(() => {
        if (isCameraActive && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current
        }
    }, [isCameraActive])

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
                .withAgeAndGender()

            if (detections.length === 0) {
                setIsProcessing(false)
                return
            }            // Créer le matcher avec les descripteurs
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
            setRecognitionResults(results)            // Dessiner les résultats sur le canvas
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
    }    // Fonction commune pour dessiner les résultats de reconnaissance sur le canvas
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
                ? `${match.label} (${confidence.toFixed(1)}%)`
                : `Inconnu (${confidence.toFixed(1)}%)`

            ctx.fillStyle = color
            ctx.fillRect(box.x, box.y - 25, ctx.measureText(label).width + 10, 25)
            ctx.fillStyle = 'white'
            ctx.font = '14px Arial'
            ctx.fillText(label, box.x + 5, box.y - 8)
        })
    }, [])

    // Fonction pour redessiner le canvas avec les résultats existants
    const redrawCanvas = useCallback(() => {
        if (!canvasRef.current || !captureCanvasRef.current || recognitionResults.length === 0 || !capturedImageCanvas) return

        const displayCanvas = canvasRef.current
        
        // Copier les dimensions du canvas de capture
        displayCanvas.width = capturedImageCanvas.width
        displayCanvas.height = capturedImageCanvas.height

        const ctx = displayCanvas.getContext('2d')
        // Redessiner l'image capturée
        ctx.drawImage(capturedImageCanvas, 0, 0)

        // Utiliser la fonction commune pour dessiner les résultats
        drawRecognitionResults(ctx, recognitionResults)
    }, [recognitionResults, capturedImageCanvas, drawRecognitionResults])

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
        if (capturedImage) {
            URL.revokeObjectURL(capturedImage)
        }
        startCamera()
    }    // Initialisation
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

    // Effect pour redessiner le canvas quand la modal s'ouvre avec des résultats existants
    useEffect(() => {
        if (isOpen && recognitionResults.length > 0) {
            // Attendre un petit délai pour s'assurer que le DOM est rendu
            setTimeout(() => {
                redrawCanvas()
            }, 100)
        }
    }, [isOpen, redrawCanvas])

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={modalSize} closeOnOverlayClick={true}>
            <ModalOverlay
                bg="blackAlpha.600"
                backdropFilter="blur(10px)"
                onClick={onClose}
            />
            <ModalContent 
                maxH={isMobile ? "95vh" : "90vh"} 
                overflowY="auto"
                m={isMobile ? 3 : 4}
                borderRadius="md"
            >
                <ModalHeader py={isMobile ? 3 : 6}>
                    <HStack spacing={3}>
                        <FiCamera color={italianGreen} />
                        <Text color={italianGreen} fontFamily="serif" fontSize={isMobile ? "lg" : "xl"}>
                            {t('faceRecognition')}
                        </Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton
                    color={italianGreen}
                    bg="white"
                    _hover={{ bg: "gray.100" }}
                    border="2px solid"
                    borderColor={italianGold}
                    borderRadius="full"
                    size={isMobile ? "md" : "lg"}
                />

                <ModalBody pb={isMobile ? 4 : 6}>
                    <VStack spacing={isMobile ? 3 : 6}>
                        {/* Chargement des modèles */}
                        {isLoading && (
                            <Card w="full">
                                <CardBody>
                                    <VStack spacing={4}>
                                        <Spinner size="lg" color={italianGreen} />
                                        {isModelLoaded ? (
                                            <Text>{t('loadingDescriptors')}</Text>
                                        ) : (
                                            <Text>{t('loadingModels')}</Text>
                                        )}
                                        <Progress value={loadingProgress} colorScheme="green" w="full" />
                                    </VStack>
                                </CardBody>
                            </Card>
                        )}

                        {/* Caméra et capture */}
                        {isModelLoaded && !capturedImage && labeledDescriptors.length !== 0 && (
                            <Card w="full">
                                <CardBody>                                      
                                    <VStack spacing={cardSpacing}>
                                        {!isCameraActive ? (
                                            isSwitchingCamera ? (
                                                <Spinner size="lg" color="green.500" />
                                            ) : (
                                                <Button
                                                    leftIcon={<FiCamera />}
                                                    colorScheme="green"
                                                    size={isMobile ? "md" : "lg"}
                                                    onClick={startCamera}
                                                    isDisabled={labeledDescriptors.length === 0}
                                                >
                                                    {t('startCamera')}
                                                </Button>
                                            )
                                        ) : (
                                            <>
                                                <Box position="relative" borderRadius="md" overflow="hidden">
                                                    <video
                                                        ref={videoRef}
                                                        autoPlay
                                                        playsInline
                                                        style={{
                                                            width: '100%',
                                                            maxWidth: isMobile ? '300px' : '400px',
                                                            height: 'auto',
                                                            borderRadius: '8px'
                                                        }}
                                                    />
                                                </Box>
                                                <HStack spacing={isMobile ? 2 : 4}>
                                                    <Button
                                                        leftIcon={<FiCamera />}
                                                        colorScheme="blue" 
                                                        onClick={captureImage}
                                                        size={isMobile ? "sm" : "md"}
                                                    >
                                                        {t('capture')}
                                                    </Button>
                                                    {isMobile && (
                                                        <Button
                                                            leftIcon={<FiRotateCcw />}
                                                            variant="outline"
                                                            onClick={switchCamera}
                                                            size="sm"
                                                        >
                                                            {currentFacingMode === 'user' ? t('switchToBack') : t('switchToFront')}
                                                        </Button>
                                                    )}
                                                </HStack>
                                            </>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>
                        )}

                        {/* Image capturée et traitement */}
                        {capturedImage && (
                            <Card w="full">
                                <CardBody>                                    
                                    <VStack spacing={cardSpacing}>
                                        <HStack w="full" justify="space-between" align="center">
                                            <Text fontWeight="bold" fontSize={fontSize}>{t('capturedImage')}</Text>
                                            <IconButton
                                                icon={<RepeatIcon />}
                                                size={isMobile ? "xs" : "sm"}
                                                onClick={restart}
                                                aria-label="Recommencer"
                                            />
                                        </HStack>

                                        {/* Canvas pour l'affichage avec détections */}
                                        <Box position="relative">
                                            <canvas
                                                ref={canvasRef}
                                                style={{
                                                    maxWidth: '100%',
                                                    height: 'auto',
                                                    borderRadius: '8px',
                                                    border: `2px solid ${italianGold}`
                                                }}
                                            />
                                            {isProcessing && (
                                                <Box
                                                    position="absolute"
                                                    top="50%"
                                                    left="50%"
                                                    transform="translate(-50%, -50%)"
                                                    bg="blackAlpha.700"
                                                    p={isMobile ? 2 : 4}
                                                    borderRadius="md"
                                                >
                                                    <VStack>
                                                        <Spinner color="white" size={isMobile ? "sm" : "md"} />
                                                        <Text color="white" fontSize={isMobile ? "xs" : "sm"}>
                                                            {t('processing')}
                                                        </Text>
                                                    </VStack>
                                                </Box>
                                            )}
                                        </Box>
                                    </VStack>
                                </CardBody>
                            </Card>
                        )}

                        {/* Résultats de reconnaissance */}
                        <Collapse in={recognitionResults.length > 0} style={{ width: '100%' }}>
                            <Card w="full">
                                <CardBody>
                                    <VStack spacing={4} align="stretch">
                                        {/* { !isSwitchingCamera && */}
                                        <Text fontWeight="bold" color={italianGreen}>
                                            {t('recognitionResults')}
                                        </Text>
                                        {/* } */}
                                        {recognitionResults.map((result, index) => (
                                            <Card
                                                key={result.id}
                                                size="sm"
                                                variant="outline"
                                                cursor={result.person ? "pointer" : "default"}
                                                onClick={() => result.person && onPersonSelect && onPersonSelect(result.person)}
                                                _hover={result.person ? {
                                                    shadow: "md",
                                                    borderColor: italianGreen,
                                                    transform: "translateY(-1px)",
                                                    transition: "all 0.2s"
                                                } : {}}
                                                transition="all 0.2s"
                                            >                                                
                                            <CardBody p={isMobile ? 3 : 4}>
                                                    <Flex align="center" gap={isMobile ? 2 : 4}>
                                                        {result.person ? (
                                                            <Avatar
                                                                src={`/images/${result.person.data.image}.JPG`}
                                                                name={`${result.person.data.firstName} ${result.person.data.lastName}`}
                                                                size={avatarSize}
                                                            />
                                                        ) : (
                                                            <Avatar size={avatarSize} />
                                                        )}

                                                        <VStack align="start" flex={1} spacing={isMobile ? 0.5 : 1}>
                                                            <HStack wrap="wrap" spacing={2}>
                                                                <Text fontWeight="bold" fontSize={fontSize}>
                                                                    {result.match.label !== 'unknown'
                                                                        ? result.match.label
                                                                        : t('unknownPerson')
                                                                    }
                                                                </Text>
                                                                <Badge
                                                                    colorScheme={
                                                                        result.confidence > 50 ? 'green' :
                                                                            result.confidence > 40 ? 'orange' : 'red'
                                                                    }
                                                                    fontSize={isMobile ? "2xs" : "xs"}
                                                                >
                                                                    {result.confidence.toFixed(1)}%
                                                                </Badge>
                                                            </HStack>
                                                            {result.person && (
                                                                <Text fontSize="xs" color="gray.500">
                                                                    {result.person.data.birthday}
                                                                    {result.person.data.death && ` - ${result.person.data.death}`}
                                                                    {result.person.data.occupation && ` • ${result.person.data.occupation}`}
                                                                </Text>
                                                            )}
                                                        </VStack>
                                                        {result.person && (
                                                            <Box color={italianGreen} fontSize="lg">
                                                                →
                                                            </Box>
                                                        )}
                                                    </Flex>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </VStack>
                                </CardBody>
                            </Card>
                        </Collapse>

                        {/* Canvas caché pour la capture */}
                        <canvas
                            ref={captureCanvasRef}
                            style={{ display: 'none' }}
                        />
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default FaceRecognition
