import { useState, useRef } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton,
  VStack, HStack, Box,
  FormControl, FormLabel, FormErrorMessage,
  Input, Select, Button,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { THEME, DATA_SOURCE } from '../../config/config';
import ImageCropModal from '../ImageCropModal';
import { useCropModal } from '../../hooks/useCropModal';

const EMPTY_FORM = { firstName: '', lastName: '', birthday: '', death: '', gender: 'M', imageFile: null, imagePreview: null };

const CreateFirstMemberModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const { pendingFile, cropIsOpen, openCrop, onCropConfirm, onCropCancel } = useCropModal();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = t('required');
    if (!form.lastName.trim())  errs.lastName  = t('required');
    return errs;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const croppedFile = await openCrop(file);
    if (!croppedFile) return;
    if (form.imagePreview) URL.revokeObjectURL(form.imagePreview);
    setForm(prev => ({ ...prev, imageFile: croppedFile, imagePreview: URL.createObjectURL(croppedFile) }));
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      firstName: form.firstName.trim(),
      lastName:  form.lastName.trim(),
      birthday:  form.birthday ? parseInt(form.birthday, 10) : null,
      death:     form.death    ? parseInt(form.death,    10) : null,
      gender:    form.gender,
      imageFile: form.imageFile || null,
      image:     'default',
    });
  };

  const handleClose = () => {
    if (form.imagePreview) URL.revokeObjectURL(form.imagePreview);
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={handleClose} isCentered motionPreset="none">
      <ModalOverlay />
      <ModalContent borderRadius="xl" mx={4}>
        <ModalHeader
          borderBottom="1px"
          borderColor="gray.100"
          bg={'var(--theme-primary)'}
          color="white"
          borderTopRadius="xl"
          fontSize="lg"
        >
          🌱 {t('createFirstMember', 'Add the first person')}
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody py={5}>
          <VStack spacing={4}>
            <HStack w="full" spacing={3}>
              <FormControl isRequired isInvalid={!!errors.firstName}>
                <FormLabel fontSize="sm">{t('firstName', 'First name')}</FormLabel>
                <Input value={form.firstName} onChange={set('firstName')} placeholder={t('firstName', 'First name')} />
                <FormErrorMessage>{errors.firstName}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.lastName}>
                <FormLabel fontSize="sm">{t('lastName', 'Last name')}</FormLabel>
                <Input value={form.lastName} onChange={set('lastName')} placeholder={t('lastName', 'Last name')} />
                <FormErrorMessage>{errors.lastName}</FormErrorMessage>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel fontSize="sm">{t('gender', 'Gender')}</FormLabel>
              <Select value={form.gender} onChange={set('gender')}>
                <option value="M">{t('male', 'Male')}</option>
                <option value="F">{t('female', 'Female')}</option>
              </Select>
            </FormControl>

            <HStack w="full" spacing={3}>
              <FormControl>
                <FormLabel fontSize="sm">{t('birthYear', 'Birth year')}</FormLabel>
                <Input type="number" value={form.birthday} onChange={set('birthday')} placeholder="1950" min="1000" max="2100" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">{t('deathYear', 'Death year')}</FormLabel>
                <Input type="number" value={form.death} onChange={set('death')} placeholder={t('ifDeceased', 'If deceased')} min="1000" max="2100" />
              </FormControl>
            </HStack>

            {/* Photo optionnelle */}
            {DATA_SOURCE === 'firebase' && (
              <FormControl>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                <HStack spacing={3} align="center">
                  {form.imagePreview ? (
                    <Box
                      as="img"
                      src={form.imagePreview}
                      w="60px" h="60px"
                      objectFit="cover"
                      borderRadius="full"
                      border={`2px solid var(--theme-accent)`}
                      cursor="pointer"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ flexShrink: 0 }}
                    />
                  ) : (
                    <Box
                      w="60px" h="60px"
                      borderRadius="full"
                      border={`2px dashed var(--theme-accent)`}
                      display="flex" alignItems="center" justifyContent="center"
                      fontSize="24px" color="gray.400"
                      cursor="pointer"
                      onClick={() => fileInputRef.current?.click()}
                      flexShrink={0}
                    >
                      ?
                    </Box>
                  )}
                  <HStack spacing={2}>
                    <Button size="sm" variant="outline" borderColor="var(--theme-accent)" color="var(--theme-primary)"
                      onClick={() => fileInputRef.current?.click()} isDisabled={isLoading}>
                      {form.imageFile ? t('changePhoto') : `${t('photo')} (${t('optional')})`}
                    </Button>
                    {form.imageFile && (
                      <Button size="sm" variant="ghost" colorScheme="red" isDisabled={isLoading}
                        onClick={() => { if (form.imagePreview) URL.revokeObjectURL(form.imagePreview); setForm(p => ({ ...p, imageFile: null, imagePreview: null })); }}>
                        ✕
                      </Button>
                    )}
                  </HStack>
                </HStack>
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor="gray.100" gap={3}>
          <Button variant="ghost" onClick={handleClose} isDisabled={isLoading}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            bg={'var(--theme-primary)'}
            color="white"
            _hover={{ bg: 'var(--theme-primary-dark)' }}
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {t('createFirstMemberBtn', 'Create')}
          </Button>
        </ModalFooter>
      </ModalContent>
      </Modal>
      <ImageCropModal
        file={pendingFile}
        isOpen={cropIsOpen}
        onConfirm={onCropConfirm}
        onCancel={onCropCancel}
      />
    </>
  );
};

export default CreateFirstMemberModal;
