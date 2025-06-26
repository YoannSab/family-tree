import React, { memo } from 'react';
import {
  Box,
  Text,
  HStack,
  Spacer,
  Flex,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import PersonInfo from '../PersonInfo';

const MobilePersonDrawer = memo(({
  isPersonDrawerOpen,
  onPersonDrawerClose,
  drawerRef,
  drawerHeaderRef,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  selectedPerson,
  familyData,
  setSelectedPerson,
  handlePersonUpdate,
  isPersonEditingMode,
  setIsPersonEditingMode,
  handlePersonClick,
  FAMILY_CONFIG,
  t
}) => {
  return (
    <Drawer isOpen={isPersonDrawerOpen} placement="bottom" onClose={onPersonDrawerClose} size="full">
      <DrawerOverlay />
      <DrawerContent
        borderTopRadius="xl"
        maxH="90vh"
        bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <DrawerHeader
          pb={2}
          borderBottom="1px solid #e0e0e0"
          ref={drawerHeaderRef}
          position="relative"
        >
          {/* Swipe indicator */}
          <Box
            w="60px"
            h="4px"
            bg="gray.300"
            borderRadius="full"
            mx="auto"
            mb={3}
            cursor="pointer"
            _hover={{ bg: "gray.400" }}
            transition="background-color 0.2s"
          />
          {/* Swipe zone indicator */}
          <Text
            fontSize="xs"
            color="gray.400"
            textAlign="center"
            mb={2}
            fontStyle="italic"
          >
          </Text>
          <Flex alignItems="center" gap={3}>
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={onPersonDrawerClose}
              variant="ghost"
              size="sm"
              aria-label="Close"
              color="gray.600"
              _hover={{ bg: "gray.200" }}
            />
            <HStack spacing={2}>
              <Box fontSize="lg">👤</Box>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                {t('memberDetails')}
              </Text>
            </HStack>
            <Spacer />
            <Box fontSize="sm">
              {FAMILY_CONFIG.countryIcon}
            </Box>
          </Flex>
        </DrawerHeader>
        <DrawerBody pb={6} overflowY="auto">
          {selectedPerson && (
            <PersonInfo
              person={selectedPerson}
              familyData={familyData}
              compact={true}
              setPerson={setSelectedPerson}
              onPersonUpdate={handlePersonUpdate}
              isEditing={isPersonEditingMode}
              setIsEditing={setIsPersonEditingMode}
              handlePersonClick={handlePersonClick}
            />
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

MobilePersonDrawer.displayName = 'MobilePersonDrawer';

export default MobilePersonDrawer;
