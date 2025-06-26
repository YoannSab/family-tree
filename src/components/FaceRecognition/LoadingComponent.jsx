import { VStack, Spinner, Text, Progress, Card, CardBody } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { memo } from 'react'

const LoadingComponent = memo(({ isLoading, isModelLoaded, loadingProgress, italianGreen }) => {
    const { t } = useTranslation()

    if (!isLoading) return null

    return (
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
    )
})

export default LoadingComponent
