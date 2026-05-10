import React, { memo } from 'react';
import {
  VStack,
  Box,
  Heading,
} from '@chakra-ui/react';
import RelatedPersonsList from '../RelatedPersonsList';
import { THEME } from '../../config/config';

const FamilyConnections = memo(({
  relatedPeople,
  isMobile,
  italianGold,
  italianGreen,
  handlePersonClick,
  handleImageClick,
  familyId,
  t
}) => {
  return (
    <VStack spacing={isMobile ? 4 : 6} align="stretch">
      <Heading
        size={isMobile ? "sm" : "md"}
        color={italianGreen}
        fontFamily="serif"
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Box
          w={1}
          h={5}
          bg={`linear-gradient(to bottom, ${italianGold}, var(--theme-accent-dark))`}
          borderRadius="full"
        />
        {t('familyConnections')}
      </Heading>
      
      {relatedPeople.parents.length !== 0 && (
        <RelatedPersonsList
          title={t('parents')}
          people={relatedPeople.parents}
          familyId={familyId}
          handlePersonClick={handlePersonClick}
          handleImageClick={handleImageClick}
          isMobile={isMobile}
        />
      )}
      
      {relatedPeople.spouses.length !== 0 && (
        <RelatedPersonsList
          title={t('spouse')}
          people={relatedPeople.spouses}
          familyId={familyId}
          handlePersonClick={handlePersonClick}
          handleImageClick={handleImageClick}
          isMobile={isMobile}
        />
      )}
      
      {relatedPeople.children.length !== 0 && (
        <RelatedPersonsList
          title={t('children')}
          people={relatedPeople.children}
          familyId={familyId}
          handlePersonClick={handlePersonClick}
          handleImageClick={handleImageClick}
          isMobile={isMobile}
        />
      )}
      
      {relatedPeople.siblings.length !== 0 && (
        <RelatedPersonsList
          title={t('siblings')}
          people={relatedPeople.siblings}
          familyId={familyId}
          handlePersonClick={handlePersonClick}
          handleImageClick={handleImageClick}
          isMobile={isMobile}
        />
      )}
    </VStack>
  );
});

FamilyConnections.displayName = 'FamilyConnections';

export default FamilyConnections;
