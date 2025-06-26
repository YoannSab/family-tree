import { 
    VStack, 
    Text, 
    Card, 
    CardBody, 
    Flex, 
    Avatar, 
    HStack, 
    Box, 
    Collapse 
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { memo } from 'react'

const RecognitionResultsComponent = memo(({ 
    recognitionResults, 
    noFacesFound, 
    onPersonSelect, 
    italianGreen, 
    isMobile, 
    fontSize, 
    avatarSize 
}) => {
    const { t } = useTranslation()

    return (
        <Collapse in={recognitionResults.length > 0 || noFacesFound} style={{ width: '100%' }}>
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
                            recognitionResults.map((result, index) => (
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
    )
});

export default RecognitionResultsComponent
