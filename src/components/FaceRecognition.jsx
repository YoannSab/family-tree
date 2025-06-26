import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    HStack,
    Text,
    useBreakpointValue
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { FiCamera } from 'react-icons/fi'
import { useFaceRecognition } from '../hooks/useFaceRecognition'
import LoadingComponent from './FaceRecognition/LoadingComponent'
import CameraComponent from './FaceRecognition/CameraComponent'
import CapturedImageComponent from './FaceRecognition/CapturedImageComponent'
import RecognitionResultsComponent from './FaceRecognition/RecognitionResultsComponent'

const FaceRecognition = ({ isOpen, onClose, familyData, onPersonSelect }) => {
    const { t } = useTranslation()

    // Utilisation du hook personnalisé
    const {
        // State
        isLoading,
        isModelLoaded,
        isCameraActive,
        capturedImage,
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
        captureImage,
        switchCamera,
        restart
    } = useFaceRecognition(familyData, isOpen)

    const italianGreen = '#2d5a27'
    const italianGold = '#c8a882'
    
    // Responsive values
    const isMobile = useBreakpointValue({ base: true, md: false })
    const modalSize = useBreakpointValue({ base: 'xl', md: 'xl' })
    const cardSpacing = useBreakpointValue({ base: 2, md: 4 })
    const fontSize = useBreakpointValue({ base: 'sm', md: 'md' })
    const avatarSize = useBreakpointValue({ base: 'sm', md: 'md' })

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
                        <LoadingComponent
                            isLoading={isLoading}
                            isModelLoaded={isModelLoaded}
                            loadingProgress={loadingProgress}
                            italianGreen={italianGreen}
                        />

                        {/* Caméra et capture */}
                        {isModelLoaded && !capturedImage && labeledDescriptors.length !== 0 && (
                            <CameraComponent
                                videoRef={videoRef}
                                isCameraActive={isCameraActive}
                                currentFacingMode={currentFacingMode}
                                onCapture={captureImage}
                                onSwitchCamera={switchCamera}
                                isMobile={isMobile}
                                cardSpacing={cardSpacing}
                            />
                        )}

                        {/* Image capturée et traitement */}
                        {capturedImage && (
                            <CapturedImageComponent
                                canvasRef={canvasRef}
                                isProcessing={isProcessing}
                                onRestart={restart}
                                italianGold={italianGold}
                                isMobile={isMobile}
                                cardSpacing={cardSpacing}
                                fontSize={fontSize}
                            />
                        )}

                        {/* Résultats de reconnaissance */}
                        <RecognitionResultsComponent
                            recognitionResults={recognitionResults}
                            noFacesFound={noFacesFound}
                            onPersonSelect={onPersonSelect}
                            italianGreen={italianGreen}
                            isMobile={isMobile}
                            fontSize={fontSize}
                            avatarSize={avatarSize}
                        />

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

export default FaceRecognition;