import {
  VStack,
  HStack,
  Text,
  Avatar,
  Box,
  Heading,
  Grid,
  GridItem,
  Card,
  CardBody,
  Flex,
  Icon,
  useColorModeValue,
  useDisclosure,
  Input,
  Select,
  useToast,
  IconButton
} from '@chakra-ui/react'
import { CalendarIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import ImageModal from './ImageModal'
import { updateFamilyMemberByInternalId } from '../services/familyService'
import { DATA_SOURCE } from '../config/config'

const PersonInfo = ({ person, familyData, setPerson, compact = false, onPersonUpdate, isEditing, setIsEditing, handlePersonClick }) => {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedImage, setSelectedImage] = useState({ src: '', name: '' })
  const [editForm, setEditForm] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const cardBg = useColorModeValue('linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 'gray.700')
  const italianGold = '#c8a882'
  const italianGreen = '#2d5a27'
  const isMobile = compact

  if (!person) return null

  // Fonctions pour gérer l'édition
  const handleEditStart = () => {
    setEditForm({
      firstName: person.data.firstName || '',
      lastName: person.data.lastName || '',
      birthday: person.data.birthday || '',
      death: person.data.death || '',
      occupation: person.data.occupation || '',
      reliable: person.data.reliable !== false
    })
    setIsEditing(true)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditForm({})
  }

  const handleEditSave = async () => {
    setIsLoading(true)
    try {
      const updatedData = {
        data: {
          ...person.data,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          birthday: editForm.birthday ? parseInt(editForm.birthday) : person.data.birthday,
          death: editForm.death ? parseInt(editForm.death) : (editForm.death === '' ? null : person.data.death),
          occupation: editForm.occupation,
          reliable: editForm.reliable
        }
      }

      // Utiliser l'ID interne de la personne pour la mise à jour
      await updateFamilyMemberByInternalId(person.id, updatedData)

      // Mettre à jour la personne localement
      const updatedPerson = { ...person, ...updatedData }
      setPerson(updatedPerson)

      // Informer le parent de la mise à jour si la fonction est fournie
      if (onPersonUpdate) {
        onPersonUpdate(updatedPerson)
      }

      setIsEditing(false)
      setEditForm({})

      toast({
        title: t('updateSuccess'),
        description: t('personInformationUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast({
        title: t('updateError'),
        description: t('errorUpdatingPerson'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageClick = (imageSrc, personName) => {
    setSelectedImage({ src: imageSrc, name: personName })
    onOpen()
  }

  const isLiving = !person.data.death
  const age = person.data.death
    ? person.data.death - person.data.birthday
    : new Date().getFullYear() - person.data.birthday

  // Find related people
  const spouses = person.rels.spouses ? familyData.filter(p => person.rels.spouses.includes(p.id)) : []
  const children = person.rels.children ? familyData.filter(p => person.rels.children.includes(p.id)) : []
  const parents = familyData.filter(p => p.rels.children && p.rels.children.includes(person.id))
  const siblings = familyData.filter(p =>
    p.id !== person.id &&
    parents.some(parent => parent.rels.children && parent.rels.children.includes(p.id))
  )

  const RelatedPersonsList = ({ title, people }) => (
    <Box>
      <Heading
        size={isMobile ? "xs" : "sm"}
        mb={3}
        color={italianGreen}
        fontFamily="serif"
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Box
          w={1}
          h={4}
          bg={`linear-gradient(to bottom, ${italianGold}, #d4af37)`}
          borderRadius="full"
        />
        {title} ({people.length})
      </Heading>
      {people.length > 0 ? (
        <Grid
          templateColumns={isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))"}
          gap={3}
        >
          {people.map(relatedPerson => (
            <Card
              key={relatedPerson.id}
              size="sm"
              bg={cardBg}
              border={`1px solid ${italianGold}`}
              borderRadius="lg"
              onClick={() => {
                handlePersonClick(relatedPerson)
              }}
              style={{ cursor: 'pointer' }}
              _hover={{
                boxShadow: `0 8px 25px rgba(200, 168, 130, 0.2)`,
                transform: 'translateY(-2px)',
                borderColor: '#d4af37'
              }}
              _active={{ transform: 'translateY(0px)' }}
              transition="all 0.3s ease"
              position="relative"
              overflow="hidden"
            >
              {/* Italian flag accent */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="3px"
                bg="linear-gradient(90deg, #009246 33%, #fff 33% 66%, #ce2b37 66%)"
              />
              <CardBody p={3} pt={4}>
                <HStack spacing={3}>
                  <Avatar
                    size="lg"
                    src={`/images/${relatedPerson.data.image}.JPG`}
                    name={relatedPerson.data.firstName}
                    ring={2}
                    ringColor={italianGold}
                    cursor="pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleImageClick(
                        `/images/${relatedPerson.data.image}.JPG`,
                        `${relatedPerson.data.firstName} ${relatedPerson.data.lastName}`
                      )
                    }}
                    _hover={{
                      transform: 'scale(1.05)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={2} align="center">
                      <Text fontSize="sm" fontWeight="bold" color={italianGreen} fontFamily="serif">
                        {relatedPerson.data.firstName} {relatedPerson.data.lastName} {relatedPerson.data.death ? "✞" : ""}
                      </Text>
                    </HStack>
                    {relatedPerson.data.death ? (
                      <Text fontSize="xs" color="gray.600">
                        {relatedPerson.data.birthday} - {relatedPerson.data.death}
                      </Text>
                    ) : (
                      <Text fontSize="xs" color="gray.600">
                        {t('birthdate')} {relatedPerson.data.birthday}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      ) : (
        <Text fontSize="sm" color="gray.500" fontStyle="italic">
          {t('unknown')}
        </Text>
      )}
    </Box>
  )

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
            {parents.length > 0 && (
              <RelatedPersonsList
                title={t('parents')}
                people={parents}
                colorScheme="purple"
              />
            )}

            {spouses.length > 0 && (
              <RelatedPersonsList
                title={t('spouse')}
                people={spouses}
                colorScheme="pink"
              />
            )}

            {children.length > 0 && (
              <RelatedPersonsList
                title={t('children')}
                people={children}
                colorScheme="green"
              />
            )}

            {siblings.length > 0 && (
              <RelatedPersonsList
                title={t('siblings')}
                people={siblings}
                colorScheme="orange"
              />
            )}
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
  )
}

export default PersonInfo
