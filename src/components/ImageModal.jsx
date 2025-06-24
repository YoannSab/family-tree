import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    Image,
    Box,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react'

const ImageModal = ({ isOpen, onClose, imageSrc, personName }) => {
    const overlayBg = useColorModeValue('rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)')

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay bg={overlayBg} backdropFilter="blur(10px)" />
            <ModalContent
                borderRadius="xl"
                bg={'rgba(255, 255, 255, 0)'}
            >
                <ModalCloseButton
                    size="lg"
                    bg="rgba(0, 0, 0, 0.6)"
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: 'rgba(0, 0, 0, 0.8)' }}
                />

                <ModalBody p={0}>
                    <VStack spacing={4} p={6}>
                        {personName && (
                            <Text
                                fontSize="xl"
                                fontWeight="bold"
                                color={'white'}
                                textAlign="center"
                                fontFamily="serif"
                            >
                                {personName}
                            </Text>
                        )}

                        <Box
                            position="relative"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            w="100%"
                            h="100%"
                        >
                            <Image
                                src={imageSrc}
                                alt={personName || 'Portrait de famille'}
                                maxW="100%"
                                maxH="70vh"
                                objectFit="contain"
                                borderRadius="lg"
                                boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                                fallbackSrc="/images/default.png"
                            />
                        </Box>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default ImageModal
