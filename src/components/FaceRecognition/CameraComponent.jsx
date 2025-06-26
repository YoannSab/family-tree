import { Box, Button, Card, CardBody, VStack, HStack, Spinner } from '@chakra-ui/react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FiCamera, FiRotateCcw } from 'react-icons/fi'

const CameraComponent = memo(({ 
    videoRef, 
    isCameraActive, 
    currentFacingMode, 
    onCapture, 
    onSwitchCamera, 
    isMobile, 
    cardSpacing 
}) => {
    const { t } = useTranslation()

    return (
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
                                    onClick={onCapture}
                                    size={isMobile ? "sm" : "md"}
                                >
                                    {t('capture')}
                                </Button>
                                {isMobile && (
                                    <Button
                                        leftIcon={<FiRotateCcw />}
                                        variant="outline"
                                        onClick={onSwitchCamera}
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
    )
})

export default CameraComponent
