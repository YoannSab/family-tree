import React, { memo } from 'react';
import {
  VStack,
  Box,
  Heading,
  Grid,
  GridItem,
  Flex,
  Icon,
  Text,
  Input,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { CalendarIcon } from '@chakra-ui/icons';

const PersonDetails = memo(({
  person,
  isEditing,
  editForm,
  isMobile,
  italianGold,
  italianGreen,
  isLiving,
  age,
  handleInputChange,
  t
}) => {
  return (
    <Box>
      <Heading
        size={isMobile ? "sm" : "md"}
        mb={4}
        color={italianGreen}
        fontFamily="serif"
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Box
          w={1}
          h={5}
          bg={`linear-gradient(to bottom, ${italianGold}, #d4af37)`}
          borderRadius="full"
        />
        {t('personalInfo')}
      </Heading>

      <Grid
        templateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"}
        gap={4}
        p={3}
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="md"
        boxShadow="sm"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <GridItem>
          <Flex align="center" gap={3}>
            <Icon as={CalendarIcon} color={italianGreen} boxSize={5} />
            <VStack align="start" spacing={0} flex="1">
              <Text fontSize="xs" color="gray.500">{t('birthdate')}</Text>
              {isEditing ? (
                <Input
                  value={editForm.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                  size="sm"
                  type="number"
                  placeholder="1990"
                />
              ) : (
                <Text fontSize={isMobile ? "sm" : "md"} fontWeight="medium">{person.data.birthday}</Text>
              )}
            </VStack>
          </Flex>
        </GridItem>

        {(isEditing || person.data.death) && (
          <GridItem>
            <Flex align="center" gap={3}>
              <Text fontSize="xl">🕊️</Text>
              <VStack align="start" spacing={0} flex="1">
                <Text fontSize="xs" color="gray.500">{t('deathdate')}</Text>
                {isEditing ? (
                  <Input
                    value={editForm.death}
                    onChange={(e) => handleInputChange('death', e.target.value)}
                    size="sm"
                    type="number"
                    placeholder="2025"
                  />
                ) : (
                  <Text fontSize={isMobile ? "sm" : "md"} fontWeight="medium">
                    {person.data.death || t('living')}
                  </Text>
                )}
              </VStack>
            </Flex>
          </GridItem>
        )}

        <GridItem>
          <Flex align="center" gap={3}>
            <Box p={1} borderRadius="full" bg={`rgba(${isLiving ? '45, 90, 39, 0.1' : '200, 168, 130, 0.1'})`}>
              <Text fontSize="sm">{isLiving ? '👤' : '⌛'}</Text>
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.500">{t('age')}</Text>
              <Text fontSize={isMobile ? "sm" : "md"} fontWeight="medium">{age} {t('yearsOld')}</Text>
            </VStack>
          </Flex>
        </GridItem>

        {(isEditing || person.data.occupation) && (
          <GridItem>
            <Flex align="center" gap={3}>
              <Box p={1} borderRadius="full" bg="rgba(200, 168, 130, 0.1)">
                <Text fontSize="sm">💼</Text>
              </Box>
              <VStack align="start" spacing={0} flex="1">
                <Text fontSize="xs" color="gray.500">{t('occupation')}</Text>
                {isEditing ? (
                  <Input
                    value={editForm.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    size="sm"
                    placeholder={t('occupation')}
                  />
                ) : (
                  <Text fontSize={isMobile ? "sm" : "md"} fontWeight="medium">
                    {person.data.occupation || t('notSpecified')}
                  </Text>
                )}
              </VStack>
            </Flex>
          </GridItem>
        )}

        {isEditing && (
          <GridItem>
            <Flex align="center" gap={3}>
              <Box p={1} borderRadius="full" bg="rgba(200, 168, 130, 0.1)">
                <Text fontSize="sm">✓</Text>
              </Box>
              <VStack align="start" spacing={0} flex="1">
                <Text fontSize="xs" color="gray.500">{t('reliable')}</Text>
                <Select
                  value={editForm.reliable}
                  onChange={(e) => handleInputChange('reliable', e.target.value === 'true')}
                  size="sm"
                >
                  <option value="true">{t('reliableInformation')}</option>
                  <option value="false">{t('unreliableInformation')}</option>
                </Select>
              </VStack>
            </Flex>
          </GridItem>
        )}
      </Grid>
    </Box>
  );
});

PersonDetails.displayName = 'PersonDetails';

export default PersonDetails;
