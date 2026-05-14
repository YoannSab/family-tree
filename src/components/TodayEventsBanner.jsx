import React, { memo, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  Text,
  IconButton,
  Collapse,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { useUpcomingEvents } from '../hooks/useUpcomingEvents';

function ordinal(n, lang) {
  if (lang === 'fr') return n === 1 ? `${n}er` : `${n}\u00e8me`;
  if (lang === 'it') return n === 1 ? `${n}\u00b0` : `${n}\u00b0`;
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

const TodayEventsBanner = memo(({ familyData, familyId, onPersonClick, onOpenModal }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'fr';
  const [dismissed, setDismissed] = useState(false);

  const { todayEvents } = useUpcomingEvents(familyData, 0);

  if (dismissed || todayEvents.length === 0) return null;

  return (
    <Collapse in animateOpacity>
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.100"
        borderTop="3px solid var(--theme-primary)"
        boxShadow="0 2px 8px rgba(0,0,0,0.06)"
        px={{ base: 3, md: 6 }}
        py={2}
      >
        <Flex align="center" gap={{ base: 2, md: 4 }} wrap="nowrap">

          {/* "Today" label — desktop only */}
          <HStack spacing={2} flexShrink={0} display={{ base: 'none', md: 'flex' }}>
            <Text fontSize="10px" fontWeight="bold" color="var(--theme-primary)" textTransform="uppercase" letterSpacing="0.08em">
            {t('todaySection')}
            </Text>
            <Box w="1px" h="14px" bg="gray.200" />
          </HStack>

          {/* Events */}
          <Flex flex="1" gap={3} align="center" flexWrap="wrap" overflow="hidden">
            {todayEvents.map((ev) => {
              const isBirthday = ev.type === 'birthday';
              const gender = ev.person.data.gender === 'F' ? 'female' : 'male';
              const subtitle = isBirthday
                ? (ev.isDeceased
                    ? t('wouldTurnAge', { age: ev.age })
                    : t('turnsAge', { age: ordinal(ev.age, lang) }))
                : t('passedAwayYearsAgo', { count: ev.yearsAgo, context: gender });
              return (
                <HStack
                  key={`${ev.type}-${ev.person.id}`}
                  spacing={1.5}
                  cursor="pointer"
                  onClick={() => onPersonClick?.(ev.person)}
                  px={2}
                  py={1}
                  borderRadius="md"
                  transition="all 0.15s"
                  _hover={{ bg: 'rgba(var(--theme-primary-rgb), 0.06)' }}
                  minW={0}
                >
                  <Text fontSize="md" flexShrink={0}>{isBirthday ? '\uD83C\uDF82' : '\uD83D\uDD6F\uFE0F'}</Text>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.800" noOfLines={1}>{ev.name}</Text>
                  {subtitle && (
                    <Text fontSize="xs" color="gray.400" noOfLines={1} display={{ base: 'none', sm: 'block' }}>
                      &middot; {subtitle}
                    </Text>
                  )}
                </HStack>
              );
            })}
          </Flex>

          {/* Actions */}
          <HStack spacing={1} flexShrink={0}>
            <Text
              as="button"
              fontSize="xs"
              color="var(--theme-primary)"
              fontWeight="semibold"
              cursor="pointer"
              onClick={onOpenModal}
              _hover={{ textDecoration: 'underline' }}
              display={{ base: 'none', md: 'block' }}
              whiteSpace="nowrap"
            >
              {t('seeAllEvents')} &rarr;
            </Text>
            <IconButton
              icon={<CloseIcon />}
              size="xs"
              variant="ghost"
              color="gray.300"
              _hover={{ color: 'gray.500', bg: 'gray.50' }}
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
            />
          </HStack>
        </Flex>
      </Box>
    </Collapse>
  );
});

TodayEventsBanner.displayName = 'TodayEventsBanner';
export default TodayEventsBanner;