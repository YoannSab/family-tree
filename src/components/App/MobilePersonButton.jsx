import React, { memo } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';

const MobilePersonButton = memo(({
  selectedPerson,
  onPersonDrawerOpen,
  t
}) => {
  if (!selectedPerson) return null;

  return (
    <Box w="full" px={2}>
      <Button
        onClick={onPersonDrawerOpen}
        size="lg"
        w="full"
        bg="linear-gradient(135deg, #2d5a27 0%, #1e3a1a 100%)"
        color="white"
        _hover={{
          bg: "linear-gradient(135deg, #1e3a1a 0%, #0f2e0d 100%)",
          transform: "translateY(-1px)",
          boxShadow: "0 6px 20px rgba(45, 90, 39, 0.4)"
        }}
        _active={{ transform: "translateY(0)" }}
        boxShadow="0 4px 12px rgba(45, 90, 39, 0.3)"
        borderRadius="xl"
        leftIcon={<ViewIcon />}
        transition="all 0.2s"
        fontWeight="bold"
        border="1px solid rgba(255,255,255,0.1)"
      >
        <VStack spacing={0}>
          <Text fontSize="sm">{t('seeDetailsOn')} {selectedPerson.data.firstName} {selectedPerson.data.lastName}</Text>
        </VStack>
      </Button>
    </Box>
  );
});

MobilePersonButton.displayName = 'MobilePersonButton';

export default MobilePersonButton;
