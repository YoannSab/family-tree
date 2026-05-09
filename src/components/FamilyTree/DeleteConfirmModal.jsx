import { useRef } from 'react';
import {
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  Button, Text, Box,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const DeleteConfirmModal = ({ isOpen, onClose, person, onConfirm, isLoading }) => {
  const { t } = useTranslation();
  const cancelRef = useRef();

  if (!person) return null;

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered motionPreset="none">
      <AlertDialogOverlay bg="rgba(0,0,0,0.5)" />
      <AlertDialogContent borderRadius="xl" border="2px solid" borderColor="red.200" maxW="400px">
        {/* Red accent top */}
        <Box
          position="absolute"
          top={0} left={0} right={0}
          h="3px"
          bg="linear-gradient(90deg, #e53e3e, #fc8181)"
          borderTopRadius="xl"
        />

        <AlertDialogHeader pt={6} pb={2} fontSize="lg" fontWeight="bold" color="red.600">
          🗑️ {t('confirmDeleteTitle')}
        </AlertDialogHeader>

        <AlertDialogBody>
          <Text color="gray.700" mb={2}>
            {t('confirmDeleteBody', {
              name: `${person.data.firstName} ${person.data.lastName}`,
            })}
          </Text>
          <Text fontSize="sm" color="gray.500" fontStyle="italic">
            {t('confirmDeleteWarning')}
          </Text>
        </AlertDialogBody>

        <AlertDialogFooter gap={2}>
          <Button ref={cancelRef} onClick={onClose} isDisabled={isLoading} variant="ghost">
            {t('cancel')}
          </Button>
          <Button
            colorScheme="red"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText={t('deleting')}
            borderRadius="lg"
          >
            {t('delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmModal;
