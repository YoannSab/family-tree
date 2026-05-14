import React, { memo } from 'react';
import {
  Box,
  Heading,
  Grid,
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { THEME } from '../config/config';
import StorageAvatar from './StorageAvatar';
import { useImageUrl } from '../hooks/useImageUrl';
import { formatDate, isFullDate } from '../utils/dateUtils';

// Sub-component so each card can use the useImageUrl hook
const PersonCard = memo(({ relatedPerson, familyId, italianGold, italianGreen, handlePersonClick, handleImageClick, t, language }) => {
  const { url: avatarUrl } = useImageUrl(familyId, relatedPerson.data.image);
  return (
    <Card
      size="sm"
      bg={THEME.bgCard}
      border={`1px solid ${italianGold}`}
      borderRadius="lg"
      onClick={() => handlePersonClick(relatedPerson)}
      style={{ cursor: 'pointer' }}
      _hover={{
        boxShadow: `0 8px 25px rgba(200, 168, 130, 0.2)`,
        transform: 'translateY(-2px)',
        borderColor: 'var(--theme-accent-dark)'
      }}
      _active={{ transform: 'translateY(0px)' }}
      transition="all 0.3s ease"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="3px"
        bg={`linear-gradient(90deg, var(--theme-flag-left) 33%, #fff 33% 66%, var(--theme-flag-right) 66%)`}
      />
      <CardBody p={3} pt={4}>
        <HStack spacing={3}>
          <StorageAvatar
            familyId={familyId}
            filename={relatedPerson.data.image}
            name={`${relatedPerson.data.firstName} ${relatedPerson.data.lastName}`}
            size="lg"
            cursor={avatarUrl ? 'pointer' : 'default'}
            onClick={avatarUrl ? (e) => {
              e.stopPropagation();
              handleImageClick(avatarUrl, `${relatedPerson.data.firstName} ${relatedPerson.data.lastName}`);
            } : undefined}
            _hover={avatarUrl ? { transform: 'scale(1.05)', transition: 'transform 0.2s ease' } : undefined}
          />
          <VStack align="start" spacing={1} flex={1}>
            <HStack spacing={2} align="center">
              <Text fontSize="sm" fontWeight="bold" color={italianGreen} fontFamily="serif">
                {relatedPerson.data.firstName} {relatedPerson.data.lastName} {relatedPerson.data.death ? '✞' : ''}
              </Text>
            </HStack>
            {(() => {
              const isFemale = relatedPerson.data.gender === 'F';
              const birthday = relatedPerson.data.birthday;
              const death = relatedPerson.data.death;
              if (death) {
                const birthStr = birthday ? formatDate(birthday, language) : t('dateUnknown');
                return (
                  <Text fontSize="xs" color="gray.600">
                    {birthStr} - {formatDate(death, language)}
                  </Text>
                );
              }
              if (!birthday) {
                return (
                  <Text fontSize="xs" color="gray.600">
                    {t('dateUnknown')}
                  </Text>
                );
              }
              const bornKey = isFullDate(birthday)
                ? (isFemale ? 'bornOnF' : 'bornOn')
                : (isFemale ? 'bornInF' : 'bornIn');
              return (
                <Text fontSize="xs" color="gray.600">
                  {t(bornKey)} {formatDate(birthday, language)}
                </Text>
              );
            })()}
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
});
PersonCard.displayName = 'PersonCard';

const RelatedPersonsList = memo(({ title, people, familyId, handlePersonClick, handleImageClick, isMobile }) => {
  const { t, i18n } = useTranslation();
  const cardBg = THEME.bgCard;
  const italianGold = 'var(--theme-accent)';
  const italianGreen = 'var(--theme-primary)';

  if (!people || people.length === 0) {
    return (
      <Box>
        <Heading
          size={isMobile ? "xs" : "sm"}
          mb={3}
          color={italianGreen}
          fontFamily="serif"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Box
            w={1}
            h={4}
              bg={`linear-gradient(to bottom, ${italianGold}, var(--theme-accent-dark))`}
            borderRadius="full"
          />
          {title} (0)
        </Heading>
        <Text fontSize="sm" color="gray.500" fontStyle="italic">
          {t('unknown')}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading
        size={isMobile ? "xs" : "sm"}
        mb={3}
        color={italianGreen}
        fontFamily="serif"
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Box
          w={1}
          h={4}
          bg={`linear-gradient(to bottom, ${italianGold}, var(--theme-accent-dark))`}
          borderRadius="full"
        />
        {title} ({people.length})
      </Heading>
      <Grid
        templateColumns={isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))"}
        gap={3}
      >
        {people.map(relatedPerson => (
          <PersonCard
            key={relatedPerson.id}
            relatedPerson={relatedPerson}
            familyId={familyId}
            italianGold={italianGold}
            italianGreen={italianGreen}
            handlePersonClick={handlePersonClick}
            handleImageClick={handleImageClick}
            t={t}
            language={i18n.language}
          />
        ))}
      </Grid>
    </Box>
  );
});

RelatedPersonsList.displayName = 'RelatedPersonsList';

export default RelatedPersonsList;
