import React, { memo } from 'react';
import {
  Box,
  Heading,
  Grid,
  Card,
  CardBody,
  HStack,
  Avatar,
  VStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const RelatedPersonsList = memo(({ title, people, handlePersonClick, handleImageClick, isMobile }) => {
  const { t } = useTranslation();
  const cardBg = useColorModeValue('linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 'gray.700');
  const italianGold = '#c8a882';
  const italianGreen = '#2d5a27';

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
            bg={`linear-gradient(to bottom, ${italianGold}, #d4af37)`}
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
          bg={`linear-gradient(to bottom, ${italianGold}, #d4af37)`}
          borderRadius="full"
        />
        {title} ({people.length})
      </Heading>
      <Grid
        templateColumns={isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))"}
        gap={3}
      >
        {people.map(relatedPerson => (
          <Card
            key={relatedPerson.id}
            size="sm"
            bg={cardBg}
            border={`1px solid ${italianGold}`}
            borderRadius="lg"
            onClick={() => handlePersonClick(relatedPerson)}
            style={{ cursor: 'pointer' }}
            _hover={{
              boxShadow: `0 8px 25px rgba(200, 168, 130, 0.2)`,
              transform: 'translateY(-2px)',
              borderColor: '#d4af37'
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
              bg="linear-gradient(90deg, #009246 33%, #fff 33% 66%, #ce2b37 66%)"
            />
            <CardBody p={3} pt={4}>
              <HStack spacing={3}>
                <Avatar
                  size="lg"
                  src={`/images/${relatedPerson.data.image}.JPG`}
                  name={relatedPerson.data.firstName}
                  ring={2}
                  ringColor={italianGold}
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(
                      `/images/${relatedPerson.data.image}.JPG`,
                      `${relatedPerson.data.firstName} ${relatedPerson.data.lastName}`
                    );
                  }}
                  _hover={{
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s ease'
                  }}
                />
                <VStack align="start" spacing={1} flex={1}>
                  <HStack spacing={2} align="center">
                    <Text fontSize="sm" fontWeight="bold" color={italianGreen} fontFamily="serif">
                      {relatedPerson.data.firstName} {relatedPerson.data.lastName} {relatedPerson.data.death ? "✞" : ""}
                    </Text>
                  </HStack>
                  {relatedPerson.data.death ? (
                    <Text fontSize="xs" color="gray.600">
                      {relatedPerson.data.birthday} - {relatedPerson.data.death}
                    </Text>
                  ) : (
                    <Text fontSize="xs" color="gray.600">
                      {t('birthdate')} {relatedPerson.data.birthday}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Box>
  );
});

RelatedPersonsList.displayName = 'RelatedPersonsList';

export default RelatedPersonsList;
