import { Box, Card, CardBody, VStack, HStack, Text, IconButton, Spinner } from '@chakra-ui/react'
import { RepeatIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { memo } from 'react'

const CapturedImageComponent = memo(({ 
    canvasRef, 
    isProcessing, 
    onRestart, 
    italianGold, 
    isMobile, 
    cardSpacing, 
    fontSize 
}) => {
    const { t } = useTranslation()

    return (
        <Card w="full">
            <CardBody>
                <VStack spacing={cardSpacing}>
                    <HStack w="full" justify="space-between" align="center">
                        <Text fontWeight="bold" fontSize={fontSize}>{t('capturedImage')}</Text>
                        <IconButton
                            icon={<RepeatIcon />}
                            size={isMobile ? "xs" : "sm"}
                            onClick={onRestart}
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
    )
})

export default CapturedImageComponent
