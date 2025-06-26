import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Avatar,
  Box,
  Heading,
  Grid,
  GridItem,
  Flex,
  Icon,
  useColorModeValue,
  Input,
  Select,
  IconButton,
} from '@chakra-ui/react';
import { CalendarIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import ImageModal from './ImageModal';
import RelatedPersonsList from './RelatedPersonsList';
import { usePersonInfo } from '../hooks/usePersonInfo';

const PersonInfo = ({ person, familyData, setPerson, compact = false, onPersonUpdate, isEditing, setIsEditing, handlePersonClick }) => {
  const isMobile = compact;

  const {
    t,
    isOpen,
    onClose,
    selectedImage,
    editForm,
    isLoading,
    italianGold,
    italianGreen,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    handleInputChange,
    handleImageClick,
    isLiving,
    age,
    relatedPeople,
    DATA_SOURCE,
  } = usePersonInfo(person, familyData, setPerson, onPersonUpdate, isEditing, setIsEditing);


  if (!person) return null;

  return (
    <Box
      bg="linear-gradient(135deg, #fafafa 0%,rgb(252, 252, 236) 100%)"
      borderRadius="xl"
      p={isMobile ? 4 : 6}
      border={`2px solid ${italianGold}`}
      position="relative"
      overflow="hidden"
    >
      {/* Italian flag accent */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="4px"
        bg="linear-gradient(90deg, #009246 33%, #fff 33% 66%, #ce2b37 66%)"
        zIndex={1}
      />

      <VStack spacing={isMobile ? 4 : 6} align="stretch" position="relative" zIndex={2}>
        {/* Header with person details */}
        <Box>
          <Flex direction={{ base: 'column', sm: 'row' }} align={{ base: 'center', sm: 'center' }} gap={4}>
            <Avatar
              size={"xl"}
              src={`/images/${person.data.image}.JPG`}
              name={person.data.firstName}
              ring={3}
              ringColor={italianGold}
              bg="linear-gradient(135deg, #2d5a27, #1e3a1a)"
              cursor="pointer"
              onClick={() => handleImageClick(
                `/images/${person.data.image}.JPG`,
                `${person.data.firstName} ${person.data.lastName}`
              )}
              _hover={{
                transform: 'scale(1.05)',
                transition: 'transform 0.2s ease'
              }}
            />

            <VStack align={{ base: 'center', sm: 'start' }} spacing={2}>
              <HStack spacing={3} align="center">
                {isEditing ? (
                  <Flex flexDirection={{ base: 'row', md: 'column' }} gap={1} align="start" flex="1">
                    <Input
                      value={editForm.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      size="md"
                      mr={2}
                      placeholder={t('firstName')} />
                    <Input
                      value={editForm.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      size="md"
                      mr={2}
                      placeholder={t('lastName')} />
                  </Flex>
                ) : (
                  <Heading
                    size={isMobile ? "md" : "lg"}
                    textAlign={{ base: 'center', sm: 'left' }}
                    color={italianGreen}
                    fontFamily="serif"
                    textShadow="1px 1px 2px rgba(0,0,0,0.1)"
                  >
                    {person.data.firstName} {person.data.lastName}
                  </Heading>
                )}

                {/* Boutons d'édition */}
                {isEditing ? (
                  <HStack spacing={1}>
                    <IconButton
                      icon={<CheckIcon />}
                      size="sm"
                      colorScheme="green"
                      onClick={handleEditSave}
                      isLoading={isLoading}
                      aria-label="Sauvegarder"
                    />
                    <IconButton
                      icon={<CloseIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={handleEditCancel}
                      aria-label="Annuler"
                    />
                  </HStack>
                ) : (
                  DATA_SOURCE === 'firebase' &&
                  (
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={handleEditStart}
                      aria-label="Modifier"
                    />
                  )
                )}
              </HStack>

              {person.data.reliable === false && (
                <Text fontSize="xs" color="orange.600" fontStyle="italic">
                  ⚠️ {t('informationToVerify')}
                </Text>
              )}
            </VStack>
          </Flex>
        </Box>

        <VStack spacing={isMobile ? 4 : 6} align="stretch">
          <Box>
            <Heading
              size={isMobile ? "sm" : "md"}
              mb={4}
              color={italianGreen}
              fontFamily="serif"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Box
                w={1}
                h={5}
                bg={`linear-gradient(to bottom, ${italianGold}, #d4af37)`}
                borderRadius="full"
              />
              {t('personalInfo')}
            </Heading>

            <Grid
              templateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"}
              gap={4}
              p={3}
              bg={useColorModeValue('white', 'gray.800')}
              borderRadius="md"
              boxShadow="sm"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <GridItem>
                <Flex align="center" gap={3}>
                  <Icon as={CalendarIcon} color={italianGreen} boxSize={5} />
                  <VStack align="start" spacing={0} flex="1">
                    <Text fontSize="xs" color="gray.500">{t('birthdate')}</Text>
                    {isEditing ? (
                      <Input
                        value={editForm.birthday}
                        onChange={(e) => handleInputChange('birthday', e.target.value)}
                        size="sm"
                        type="number"
                        placeholder="1990"
                      />
                    ) : (
                      <Text fontSize={isMobile ? "sm" : "md"} fontWeight="medium">{person.data.birthday}</Text>
                    )}
                  </VStack>
                </Flex>
              </GridItem>

              {(isEditing || person.data.death) && (
                <GridItem>
                  <Flex align="center" gap={3}>
                    <Text fontSize="xl">🕊️</Text>
                    <VStack align="start" spacing={0} flex="1">
                      <Text fontSize="xs" color="gray.500">{t('deathdate')}</Text>
                      {isEditing ? (
                        <Input
                          value={editForm.death}
                          onChange={(e) => handleInputChange('death', e.target.value)}
                          size="sm"
                          type="number"
                          placeholder="2025"
                        />
                      ) : (

                        <Text fontSize={isMobile ? "sm" : "md"} fontWeight="medium">
                          {person.data.death || t('living')}
                        </Text>
                      )}
                    </VStack>
                  </Flex>
                </GridItem>
              )}

              <GridItem>
                <Flex align="center" gap={3}>
                  <Box p={1} borderRadius="full" bg={`rgba(${isLiving ? '45, 90, 39, 0.1' : '200, 168, 130, 0.1'})`}>
                    <Text fontSize="sm">{isLiving ? '👤' : '⌛'}</Text>
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.500">{t('age')}</Text>
                    <Text fontSize={isMobile ? "sm" : "md"} fontWeight="medium">{age} {t('yearsOld')}</Text>
                  </VStack>
                </Flex>
              </GridItem>

              {(isEditing || person.data.occupation) && (
                <GridItem>
                  <Flex align="center" gap={3}>
                    <Box p={1} borderRadius="full" bg="rgba(200, 168, 130, 0.1)">
                      <Text fontSize="sm">💼</Text>
                    </Box>
                    <VStack align="start" spacing={0} flex="1">
                      <Text fontSize="xs" color="gray.500">{t('occupation')}</Text>
                      {isEditing ? (
                        <Input
                          value={editForm.occupation}
                          onChange={(e) => handleInputChange('occupation', e.target.value)}
                          size="sm"
                          placeholder={t('occupation')}
                        />
                      ) : (
                        <Text fontSize={isMobile ? "sm" : "md"} fontWeight="medium">
                          {person.data.occupation || t('notSpecified')}
                        </Text>
                      )}
                    </VStack>
                  </Flex>
                </GridItem>
              )}

              {isEditing && (
                <GridItem>
                  <Flex align="center" gap={3}>
                    <Box p={1} borderRadius="full" bg="rgba(200, 168, 130, 0.1)">
                      <Text fontSize="sm">✓</Text>
                    </Box>
                    <VStack align="start" spacing={0} flex="1">
                      <Text fontSize="xs" color="gray.500">{t('reliable')}</Text>
                      <Select
                        value={editForm.reliable}
                        onChange={(e) => handleInputChange('reliable', e.target.value === 'true')}
                        size="sm"
                      >
                        <option value="true">{t('reliableInformation')}</option>
                        <option value="false">{t('unreliableInformation')}</option>
                      </Select>
                    </VStack>
                  </Flex>
                </GridItem>
              )}
            </Grid>
          </Box>
          <Box
            h="1px"
            bg={`linear-gradient(90deg, transparent 0%, ${italianGold} 20%, #d4af37 50%, ${italianGold} 80%, transparent 100%)`}
            borderRadius="full"
          />

          {/* Family Relationships */}
          <VStack spacing={isMobile ? 4 : 6} align="stretch">
            <Heading
              size={isMobile ? "sm" : "md"}
              color={italianGreen}
              fontFamily="serif"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Box
                w={1}
                h={5}
                bg={`linear-gradient(to bottom, ${italianGold}, #d4af37)`}
                borderRadius="full"
              />
              {t('familyConnections')}
            </Heading>
            <RelatedPersonsList
              title={t('parents')}
              people={relatedPeople.parents}
              handlePersonClick={handlePersonClick}
              handleImageClick={handleImageClick}
              isMobile={isMobile}
            />
            <RelatedPersonsList
              title={t('spouse')}
              people={relatedPeople.spouses}
              handlePersonClick={handlePersonClick}
              handleImageClick={handleImageClick}
              isMobile={isMobile}
            />
            <RelatedPersonsList
              title={t('children')}
              people={relatedPeople.children}
              handlePersonClick={handlePersonClick}
              handleImageClick={handleImageClick}
              isMobile={isMobile}
            />
            <RelatedPersonsList
              title={t('siblings')}
              people={relatedPeople.siblings}
              handlePersonClick={handlePersonClick}
              handleImageClick={handleImageClick}
              isMobile={isMobile}
            />
          </VStack>

          {/* Decorative separator */}
          <Box
            h="1px"
            bg={`linear-gradient(90deg, transparent 0%, ${italianGold} 20%, #d4af37 50%, ${italianGold} 80%, transparent 100%)`}
            borderRadius="full"
          />
        </VStack>
      </VStack>

      {/* Image Modal */}
      <ImageModal
        isOpen={isOpen}
        onClose={onClose}
        imageSrc={selectedImage.src}
        personName={selectedImage.name}
      />
    </Box>
  );
};

export default PersonInfo;
