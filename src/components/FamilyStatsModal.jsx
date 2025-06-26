import React, { memo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Heading,
} from '@chakra-ui/react';
import DemographicsSection from './FamilyStatsModal/DemographicsSection';
import QuickStatsGrid from './FamilyStatsModal/QuickStatsGrid';
import BirthDecadesSection from './FamilyStatsModal/BirthDecadesSection';
import { useFamilyStatsModal } from '../hooks/useFamilyStatsModal';

const FamilyStatsModal = memo(({ isOpen, onClose, familyData }) => {
  const {
    t,
    stats,
    cardBg,
    italianGold,
    italianGreen,
    modalSize,
    cardGridColumns,
    fontSize,
    headerSize,
  } = useFamilyStatsModal(familyData);

  if (!stats) return null;

  const {
    totalMembers,
    livingMembers,
    ageRanges,
    birthDecades,
    marriedMembers,
    parentsCount,
    avgChildrenPerParent,
    avgAgeAtFirstChild,
    validParents,
    avgLifespan,
    maxLifespan,
    maleCount,
    femaleCount,
  } = stats;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} scrollBehavior="inside">
      <ModalOverlay bg="rgba(45, 90, 39, 0.4)" backdropFilter="blur(10px)" />
      <ModalContent
        maxW={modalSize === 'full' ? 'full' : '1200px'}
        bg="linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
        border={`3px solid ${italianGold}`}
        borderRadius={modalSize === 'full' ? 'none' : 'xl'}
        overflow="hidden"
        position="relative"
        mx={modalSize === 'full' ? 0 : 4}
        my={modalSize === 'full' ? 0 : 4}
      >
        {/* Italian flag accent */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="4px"
          bg="linear-gradient(90deg, #009246 33%, #fff 33% 66%, #ce2b37 66%)"
          zIndex={2}
        />

        <ModalHeader pt={6} px={{ base: 4, md: 6 }}>
          <HStack spacing={3} mb={2}>
            <Box fontSize={{ base: 'xl', md: '2xl' }}>📊</Box>
            <VStack align="start" spacing={0}>              <Heading
                size={headerSize}
                color={italianGreen}
                fontFamily="serif"
                textShadow="1px 1px 2px rgba(0,0,0,0.1)"              >
                {t('familyStatistics')}
              </Heading>
              <Text fontSize={fontSize} color="gray.600" fontStyle="italic">
                {t('overview')}
              </Text>
            </VStack>
          </HStack>
          {/* Decorative line */}
          <Box
            h="2px"
            bg={`linear-gradient(90deg, transparent 0%, ${italianGold} 20%, #d4af37 50%, ${italianGold} 80%, transparent 100%)`}
            borderRadius="full"
            mt={3}
          />
        </ModalHeader>
        <ModalCloseButton
          color={italianGreen}
          _hover={{ bg: "rgba(200, 168, 130, 0.2)" }}
          mt={2}
          fontSize={{ base: 'lg', md: 'xl' }}
        />
        <ModalBody pb={6} px={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 6, md: 8 }} align="stretch">
            {/* Quick Statistics Grid */}
            <QuickStatsGrid
              totalMembers={totalMembers}
              livingMembers={livingMembers}
              marriedMembers={marriedMembers}
              parentsCount={parentsCount}
              maleCount={maleCount}
              femaleCount={femaleCount}
              avgChildrenPerParent={avgChildrenPerParent}
              avgAgeAtFirstChild={avgAgeAtFirstChild}
              validParents={validParents}
              avgLifespan={avgLifespan}
              maxLifespan={maxLifespan}
              italianGold={italianGold}
              italianGreen={italianGreen}
              cardGridColumns={cardGridColumns}
              fontSize={fontSize}
              t={t}
            />

            {/* Demographics Section */}
            <DemographicsSection
              ageRanges={ageRanges}
              totalMembers={totalMembers}
              italianGold={italianGold}
              italianGreen={italianGreen}
              cardBg={cardBg}
              fontSize={fontSize}
              t={t}
            />

            {/* Birth Decades Section */}
            <BirthDecadesSection
              birthDecades={birthDecades}
              totalMembers={totalMembers}
              italianGold={italianGold}
              italianGreen={italianGreen}
              cardBg={cardBg}
              fontSize={fontSize}
              t={t}
            />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

FamilyStatsModal.displayName = 'FamilyStatsModal';

export default FamilyStatsModal;
