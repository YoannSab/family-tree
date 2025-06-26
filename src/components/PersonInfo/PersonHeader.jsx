import React, { memo } from 'react';
import {
  VStack,
  HStack,
  Avatar,
  Heading,
  Flex,
  Input,
  IconButton,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';

const PersonHeader = memo(({
  person,
  isEditing,
  editForm,
  isMobile,
  italianGold,
  italianGreen,
  isLoading,
  DATA_SOURCE,
  handleImageClick,
  handleEditStart,
  handleEditSave,
  handleEditCancel,
  handleInputChange,
  t
}) => {
  return (
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
                placeholder={t('firstName')} 
              />
              <Input
                value={editForm.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                size="md"
                mr={2}
                placeholder={t('lastName')} 
              />
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
            DATA_SOURCE === 'firebase' && (
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
      </VStack>
    </Flex>
  );
});

PersonHeader.displayName = 'PersonHeader';

export default PersonHeader;
