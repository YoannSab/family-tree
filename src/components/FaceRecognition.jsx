import React, { useMemo } from 'react';
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
    Avatar,
    Spinner,
    Card,
    CardBody,
    Flex,
    IconButton,
    Collapse,
    Progress,
    useBreakpointValue,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { FiCamera, FiRotateCcw } from 'react-icons/fi';
import { useFaceRecognition } from '../hooks/useFaceRecognition';

const FaceRecognition = ({ isOpen, onClose, familyData, onPersonSelect: onPersonSelectProp }) => {
    const {
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
        switchCamera,
        captureImage,
        restart,
        onPersonSelect,
    } = useFaceRecognition(isOpen, onClose, familyData, onPersonSelectProp);

    const italianGreen = '#2d5a27';
    const italianGold = '#c8a882';
    const modalSize = useBreakpointValue({ base: 'xl', md: 'xl' });
    const cardSpacing = useBreakpointValue({ base: 2, md: 4 });
    const fontSize = useBreakpointValue({ base: 'sm', md: 'md' });
    const avatarSize = useBreakpointValue({ base: 'sm', md: 'md' });

    const memoizedRecognitionResults = useMemo(() => recognitionResults, [recognitionResults]);

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
                        )}                        {/* Caméra et capture */}
                        {isModelLoaded && !capturedImage && (
                            <Card w="full">
                                <CardBody>
                                    <VStack spacing={cardSpacing}>
                                        {!isCameraActive ? (
                                            <Spinner size="lg" color="green.500" />
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
                                                            borderRadius: '8px',
                                                            transform: currentFacingMode === 'user' ? 'scaleX(-1)' : 'none',
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
                        )}                        {/* Résultats de reconnaissance */}
                        <Collapse in={memoizedRecognitionResults.length > 0 || noFacesFound} style={{ width: '100%' }}>
                            <Card w="full">
                                <CardBody>
                                    <VStack spacing={4} align="stretch">
                                        <Text fontWeight="bold" color={italianGreen}>
                                            {t('recognitionResults')}
                                        </Text>
                                        {noFacesFound ? (
                                            <Card
                                                size="sm"
                                                variant="outline"
                                                borderColor="orange.200"
                                                bg="orange.50"
                                            >
                                                <CardBody p={isMobile ? 3 : 4}>
                                                    <Flex align="center" justify="center">
                                                        <Text
                                                            color="orange.600"
                                                            fontWeight="medium"
                                                            textAlign="center"
                                                        >
                                                            {t('noFacesFound')}
                                                        </Text>
                                                    </Flex>
                                                </CardBody>
                                            </Card>
                                        ) : (
                                            memoizedRecognitionResults.map((result) => (
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
                                            ))
                                        )}
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
    );
};

export default FaceRecognition;
