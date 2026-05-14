import React, { memo, useRef } from 'react';
import ImageCropModal from '../ImageCropModal';
import { useCropModal } from '../../hooks/useCropModal';
import {
  VStack,
  HStack,
  Box,
  Heading,
  Flex,
  Input,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useImageUrl } from '../../hooks/useImageUrl';
import StorageAvatar, { InitialsAvatar } from '../StorageAvatar';

const PersonHeader = memo(({
  person,
  isEditing,
  editForm,
  isMobile,
  italianGold,
  italianGreen,
  isLoading,
  DATA_SOURCE,
  familyId,
  handleImageClick,
  handlePhotoUpload,
  handleEditStart,
  handleEditSave,
  handleEditCancel,
  handleInputChange,
  t
}) => {
  const fileInputRef = useRef(null);
  const { pendingFile, cropIsOpen, openCrop, onCropConfirm, onCropCancel } = useCropModal();
  const { url: avatarUrl } = useImageUrl(familyId, person.data.image);
  const fullName = `${person.data.firstName} ${person.data.lastName}`;
  const avatarOutline = `3px solid ${italianGold}`;

  const onAvatarClick = () => {
    if (isEditing && DATA_SOURCE === 'firebase') {
      fileInputRef.current?.click();
    } else if (avatarUrl) {
      handleImageClick(avatarUrl, `${person.data.firstName} ${person.data.lastName}`);
    }
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const croppedFile = await openCrop(file);
    if (!croppedFile) return;
    if (handlePhotoUpload) handlePhotoUpload(croppedFile);
  };

  return (
    <>
    <Flex direction={{ base: 'column', sm: 'row' }} align={{ base: 'center', sm: 'center' }} gap={4}>
      {/* Avatar — clickable for view, or for upload in edit mode */}
      <Box position="relative" flexShrink={0}>
        {DATA_SOURCE === 'firebase' && isEditing && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        )}
        <Box
          position="relative"
          display="inline-block"
          cursor={isEditing && DATA_SOURCE === 'firebase' ? 'pointer' : avatarUrl ? 'zoom-in' : 'default'}
          onClick={onAvatarClick}
        >
          {avatarUrl
            ? <StorageAvatar familyId={familyId} filename={person.data.image} name={fullName} size="80px" outline={avatarOutline} />
            : <InitialsAvatar name={fullName} size="80px" outline={avatarOutline} />}
          {/* Edit overlay shown only in edit mode (Firebase) */}
          {isEditing && DATA_SOURCE === 'firebase' && (
            <Box
              className="avatar-overlay"
              position="absolute"
              inset={0}
              borderRadius="full"
              bg="rgba(0,0,0,0.45)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              transition="opacity 0.2s"
              fontSize="22px"
            >
              {'🔄'}
            </Box>
          )}
        </Box>
      </Box>

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
      <ImageCropModal
        file={pendingFile}
        isOpen={cropIsOpen}
        onConfirm={onCropConfirm}
        onCancel={onCropCancel}
      />
    </>
  );
});

PersonHeader.displayName = 'PersonHeader';

export default PersonHeader;