import React, { memo } from 'react';
import {
  VStack,
  Box,
  Heading,
  Flex,
  Text,
  Input,
  Select,
  Tooltip,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { THEME } from '../../config/config';
import { formatDate, isFullDate } from '../../utils/dateUtils';

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
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'fr';

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
          bg={`linear-gradient(to bottom, ${italianGold}, var(--theme-accent-dark))`}
          borderRadius="full"
        />
        {t('personalInfo')}
      </Heading>

      <VStack
        spacing={0}
        p={3}
        bg={'white'}
        borderRadius="md"
        boxShadow="sm"
        border="1px solid"
        borderColor={'gray.200'}
        align="stretch"
        divider={<Box h="1px" bg="gray.100" />}
      >
        {/* Birthday */}
        <Flex align="center" gap={3} py={2}>
          <Text fontSize="xl" w={7} textAlign="center">📅</Text>
          <Text fontSize="xs" color="gray.400" w="110px" flexShrink={0}>{t('birthdate')}</Text>
          {isEditing ? (
            <Input
              value={editForm.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              size="sm"
              type="text"
              placeholder="1990 ou 15-03-1950"
              flex="1"
            />
          ) : (
            <Tooltip
              label={isFullDate(person.data.birthday) ? person.data.birthday : undefined}
              isDisabled={!isFullDate(person.data.birthday)}
              placement="top"
              hasArrow
            >
              <Text fontSize="sm" fontWeight="medium" color="gray.800">
                {formatDate(person.data.birthday, lang) || '—'}
              </Text>
            </Tooltip>
          )}
        </Flex>

        {/* Death */}
        {(isEditing || person.data.death) && (
          <Flex align="center" gap={3} py={2}>
            <Text fontSize="xl" w={7} textAlign="center">🕊️</Text>
            <Text fontSize="xs" color="gray.400" w="110px" flexShrink={0}>{t('deathdate')}</Text>
            {isEditing ? (
              <Input
                value={editForm.death}
                onChange={(e) => handleInputChange('death', e.target.value)}
                size="sm"
                type="text"
                placeholder="2025 ou 15-03-2005"
                flex="1"
              />
            ) : (
              <Tooltip
                label={isFullDate(person.data.death) ? person.data.death : undefined}
                isDisabled={!isFullDate(person.data.death)}
                placement="top"
                hasArrow
              >
                <Text fontSize="sm" fontWeight="medium" color="gray.800">
                  {person.data.death ? formatDate(person.data.death, lang) : t('living')}
                </Text>
              </Tooltip>
            )}
          </Flex>
        )}

        {/* Age */}
        {age != null && (
          <Flex align="center" gap={3} py={2}>
            <Text fontSize="xl" w={7} textAlign="center">🕯️</Text>
            <Text fontSize="xs" color="gray.400" w="110px" flexShrink={0}>{t('age')}</Text>
            <Text fontSize="sm" fontWeight="medium" color="gray.800">{age} {t('yearsOld')}</Text>
          </Flex>
        )}

        {/* Occupation */}
        {(isEditing || person.data.occupation) && (
          <Flex align="center" gap={3} py={2}>
            <Text fontSize="xl" w={7} textAlign="center">💼</Text>
            <Text fontSize="xs" color="gray.400" w="110px" flexShrink={0}>{t('occupation')}</Text>
            {isEditing ? (
              <Input
                value={editForm.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                size="sm"
                placeholder={t('occupation')}
                flex="1"
              />
            ) : (
              <Text fontSize="sm" fontWeight="medium" color="gray.800">
                {person.data.occupation || t('notSpecified')}
              </Text>
            )}
          </Flex>
        )}

        {/* Reliability (edit only) */}
        {isEditing && (
          <Flex align="center" gap={3} py={2}>
            <Text fontSize="xl" w={7} textAlign="center">✓</Text>
            <Text fontSize="xs" color="gray.400" w="110px" flexShrink={0}>{t('reliable')}</Text>
            <Select
              value={editForm.reliable}
              onChange={(e) => handleInputChange('reliable', e.target.value === 'true')}
              size="sm"
              flex="1"
            >
              <option value="true">{t('reliableInformation')}</option>
              <option value="false">{t('unreliableInformation')}</option>
            </Select>
          </Flex>
        )}
      </VStack>
    </Box>
  );
});

PersonDetails.displayName = 'PersonDetails';

export default PersonDetails;
