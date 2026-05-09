import { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton,
  VStack, HStack, Box, Text,
  FormControl, FormLabel, FormErrorMessage,
  Input, Select, Button,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { THEME } from '../../config/config';

// Relations where gender is determined automatically
const FIXED_GENDER = { father: 'M', mother: 'F' };

const RELATION_META = {
  father: { emoji: '👨', key: 'addFather' },
  mother: { emoji: '👩', key: 'addMother' },
  spouse: { emoji: '💑', key: 'addSpouse' },
  child:  { emoji: '👶', key: 'addChild' },
};

const AddMemberModal = ({ isOpen, onClose, relationType, relatedPerson, spouses = [], onSubmit, isLoading }) => {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    image: '',
    gender: FIXED_GENDER[relationType] || 'M',
    selectedSpouseId: '',
  });
  const [errors, setErrors] = useState({});

  // Pre-select the first spouse when the list becomes available
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      selectedSpouseId: (relationType === 'child' && spouses.length > 0) ? spouses[0].id : '',
    }));
  }, [spouses, relationType]);

  const meta = RELATION_META[relationType] || {};
  const genderIsFixed = !!FIXED_GENDER[relationType];

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = t('required');
    if (!form.lastName.trim())  errs.lastName  = t('required');
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      firstName:        form.firstName.trim(),
      lastName:         form.lastName.trim(),
      birthday:         form.birthday ? parseInt(form.birthday, 10) : null,
      image:            form.image.trim() || 'default',
      gender:           genderIsFixed ? FIXED_GENDER[relationType] : form.gender,
      selectedSpouseId: form.selectedSpouseId || null,
    });
  };

  const handleClose = () => {
    setForm({ firstName: '', lastName: '', birthday: '', image: '', gender: FIXED_GENDER[relationType] || 'M', selectedSpouseId: '' });
    setErrors({});
    onClose();
  };

  if (!relatedPerson) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered motionPreset="none">
      <ModalOverlay bg={`rgba(${THEME.primaryRgb}, 0.5)`} />
      <ModalContent
        borderRadius="xl"
        border={`2px solid ${THEME.accent}`}
        maxW="420px"
        overflow="hidden"
      >
        {/* Italian flag top accent */}
        <Box
          position="absolute"
          top={0} left={0} right={0}
          h="3px"
          bg={`linear-gradient(90deg, ${THEME.flagLeft} 33%, #fff 33% 66%, ${THEME.flagRight} 66%)`}
        />

        <ModalHeader pt={6} pb={2}>
          <HStack spacing={2}>
            <Text fontSize="2xl">{meta.emoji}</Text>
            <VStack align="start" spacing={0}>
              <Text fontSize="md" fontWeight="bold" color={THEME.primary} fontFamily="serif">
                {t(meta.key)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {t('of')} {relatedPerson.data.firstName} {relatedPerson.data.lastName}
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton top={5} isDisabled={isLoading} color={THEME.primaryDark} />

        <ModalBody pb={2}>
          <VStack spacing={4}>
            {/* First name / Last name */}
            <HStack w="full" spacing={3} align="start">
              <FormControl isInvalid={!!errors.firstName} isRequired>
                <FormLabel fontSize="sm" mb={1}>{t('firstName')}</FormLabel>
                <Input
                  value={form.firstName}
                  onChange={set('firstName')}
                  placeholder="Marie"
                  border={`1.5px solid ${THEME.accent}`}
                  _focus={{ borderColor: THEME.accentDark, boxShadow: `0 0 0 1px ${THEME.accentDark}` }}
                  isDisabled={isLoading}
                />
                <FormErrorMessage>{errors.firstName}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.lastName} isRequired>
                <FormLabel fontSize="sm" mb={1}>{t('lastName')}</FormLabel>
                <Input
                  value={form.lastName}
                  onChange={set('lastName')}
                  placeholder="Dupont"
                  border={`1.5px solid ${THEME.accent}`}
                  _focus={{ borderColor: THEME.accentDark, boxShadow: `0 0 0 1px ${THEME.accentDark}` }}
                  isDisabled={isLoading}
                />
                <FormErrorMessage>{errors.lastName}</FormErrorMessage>
              </FormControl>
            </HStack>

            {/* Birth year + optional gender selector */}
            <HStack w="full" spacing={3} align="start">
              <FormControl>
                <FormLabel fontSize="sm" mb={1}>{t('birthYear')}</FormLabel>
                <Input
                  type="number"
                  value={form.birthday}
                  onChange={set('birthday')}
                  placeholder="1950"
                  border={`1.5px solid ${THEME.accent}`}
                  _focus={{ borderColor: THEME.accentDark, boxShadow: `0 0 0 1px ${THEME.accentDark}` }}
                  isDisabled={isLoading}
                />
              </FormControl>

              {/* Gender only needed when not auto-determined */}
              {!genderIsFixed && (
                <FormControl>
                  <FormLabel fontSize="sm" mb={1}>{t('genderLabel')}</FormLabel>
                  <Select
                    value={form.gender}
                    onChange={set('gender')}
                    border={`1.5px solid ${THEME.accent}`}
                    _focus={{ borderColor: THEME.accentDark, boxShadow: `0 0 0 1px ${THEME.accentDark}` }}
                    isDisabled={isLoading}
                  >
                    <option value="M">{t('male')}</option>
                    <option value="F">{t('female')}</option>
                  </Select>
                </FormControl>
              )}
            </HStack>

            {/* Image filename (optional) */}
            <FormControl>
              <FormLabel fontSize="sm" mb={1}>{t('imageFilename')}</FormLabel>
              <Input
                value={form.image}
                onChange={set('image')}
                placeholder="jean_dupont"
                border={`1.5px solid ${THEME.accent}`}
                _focus={{ borderColor: THEME.accentDark, boxShadow: `0 0 0 1px ${THEME.accentDark}` }}
                isDisabled={isLoading}
              />
            </FormControl>

            {/* Other parent selector — only for child relation when spouses exist */}
            {relationType === 'child' && spouses.length > 0 && (
              <FormControl>
                <FormLabel fontSize="sm" mb={1}>{t('otherParent')}</FormLabel>
                <Select
                  value={form.selectedSpouseId}
                  onChange={set('selectedSpouseId')}
                  border={`1.5px solid ${THEME.accent}`}
                  _focus={{ borderColor: THEME.accentDark, boxShadow: `0 0 0 1px ${THEME.accentDark}` }}
                  isDisabled={isLoading}
                >
                  <option value="">{t('otherParentUnknown')}</option>
                  {spouses.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.data.firstName} {s.data.lastName}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter gap={2} pt={4}>
          <Button variant="ghost" onClick={handleClose} isDisabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText={t('saving')}
            bg={`linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`}
            color="white"
            _hover={{ bg: `linear-gradient(135deg, ${THEME.primaryDark} 0%, ${THEME.primaryDarker} 100%)` }}
            _active={{ transform: 'scale(0.97)' }}
            borderRadius="lg"
            boxShadow={`0 4px 12px rgba(${THEME.primaryRgb}, 0.3)`}
          >
            {t('add')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddMemberModal;
