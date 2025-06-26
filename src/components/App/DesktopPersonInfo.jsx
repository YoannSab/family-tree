import React, { memo } from 'react';
import {
  Box,
  VStack,
  Text,
} from '@chakra-ui/react';
import PersonInfo from '../PersonInfo';

const DesktopPersonInfo = memo(({
  selectedPerson,
  familyData,
  setSelectedPerson,
  isTablet,
  handlePersonUpdate,
  isPersonEditingMode,
  setIsPersonEditingMode,
  handlePersonClick,
  t
}) => {
  if (!selectedPerson) {
    return (
      <Box
        w={{ lg: '420px' }}
        p={8}
        h="65vh"
        bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
        borderRadius="xl"
        boxShadow="0 8px 32px rgba(0,0,0,0.08)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="2px dashed #d0d0d0"
      >
        <VStack spacing={3} textAlign="center">
          <Box fontSize="4xl" opacity={0.6}>👤</Box>
          <Text fontSize="md" color="gray.600" fontWeight="medium">
            {t('selectMember')}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {t('viewDetails')}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      w={{ lg: '420px' }}
      p={6}
      bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
      borderWidth={1}
      borderColor="gray.300"
      borderRadius="xl"
      boxShadow="0 8px 32px rgba(0,0,0,0.08)"
      maxHeight="65vh"
      overflowY="auto"
    >
      <PersonInfo
        person={selectedPerson}
        familyData={familyData}
        setPerson={setSelectedPerson}
        compact={isTablet}
        onPersonUpdate={handlePersonUpdate}
        isEditing={isPersonEditingMode}
        setIsEditing={setIsPersonEditingMode}
        handlePersonClick={handlePersonClick}
      />
    </Box>
  );
});

DesktopPersonInfo.displayName = 'DesktopPersonInfo';

export default DesktopPersonInfo;
