import React, { memo } from 'react';
import {
  VStack,
  Text,
  Box,
} from '@chakra-ui/react';
import ImageModal from './ImageModal';
import PersonHeader from './PersonInfo/PersonHeader';
import PersonDetails from './PersonInfo/PersonDetails';
import FamilyConnections from './PersonInfo/FamilyConnections';
import { usePersonInfo } from '../hooks/usePersonInfo';

const PersonInfo = memo(({ person, familyData, setPerson, compact = false, onPersonUpdate, isEditing, setIsEditing, handlePersonClick }) => {
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
          <PersonHeader
            person={person}
            isEditing={isEditing}
            editForm={editForm}
            isMobile={isMobile}
            italianGold={italianGold}
            italianGreen={italianGreen}
            isLoading={isLoading}
            DATA_SOURCE={DATA_SOURCE}
            handleImageClick={handleImageClick}
            handleEditStart={handleEditStart}
            handleEditSave={handleEditSave}
            handleEditCancel={handleEditCancel}
            handleInputChange={handleInputChange}
            t={t}
          />

          {person.data.reliable === false && (
            <Text fontSize="xs" color="orange.600" fontStyle="italic">
              ⚠️ {t('informationToVerify')}
            </Text>
          )}
        </Box>

        <VStack spacing={isMobile ? 4 : 6} align="stretch">
          <PersonDetails
            person={person}
            isEditing={isEditing}
            editForm={editForm}
            isMobile={isMobile}
            italianGold={italianGold}
            italianGreen={italianGreen}
            isLiving={isLiving}
            age={age}
            handleInputChange={handleInputChange}
            t={t}
          />

          <Box
            h="1px"
            bg={`linear-gradient(90deg, transparent 0%, ${italianGold} 20%, #d4af37 50%, ${italianGold} 80%, transparent 100%)`}
            borderRadius="full"
          />

          {/* Family Relationships */}
          <FamilyConnections
            relatedPeople={relatedPeople}
            isMobile={isMobile}
            italianGold={italianGold}
            italianGreen={italianGreen}
            handlePersonClick={handlePersonClick}
            handleImageClick={handleImageClick}
            t={t}
          />

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
});

PersonInfo.displayName = 'PersonInfo';

export default PersonInfo;
