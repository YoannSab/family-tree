import React, { memo, useState, useMemo } from 'react';
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
  Flex,
  Badge,
  Button,
  ButtonGroup,
  Divider,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import StorageAvatar from './StorageAvatar';
import { useUpcomingEvents } from '../hooks/useUpcomingEvents';
import { formatDate, formatDateShort } from '../utils/dateUtils';

// ── helpers ────────────────────────────────────────────────────────────────────

const GOLD   = 'var(--theme-accent)';
const GREEN  = 'var(--theme-primary)';

/** Ordinal suffix for ages: 1er / 1st / 1° etc. */
function ordinal(n, lang) {
  if (lang === 'fr') return n === 1 ? `${n}er` : `${n}ème`;
  if (lang === 'it') return n === 1 ? `${n}°` : `${n}°`;
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

// ── Section header ─────────────────────────────────────────────────────────────

const SectionHeader = ({ icon, label, count }) => (
  <HStack spacing={2} mt={4} mb={2}>
    <Text fontSize="lg">{icon}</Text>
    <Text fontWeight="bold" fontSize="sm" color={GREEN} textTransform="uppercase" letterSpacing="0.05em">
      {label}
    </Text>
    <Badge colorScheme="green" borderRadius="full" fontSize="xs">{count}</Badge>
    <Box flex="1" h="1px" bg={`linear-gradient(90deg, ${GOLD}55, transparent)`} />
  </HStack>
);

// ── Single event card ──────────────────────────────────────────────────────────

const EventCard = memo(({ event, isToday, lang, familyId, t, onPersonClick, onClose }) => {
  const isBirthday = event.type === 'birthday';

  // Countdown label
  let countdownLabel;
  let countdownColor;
  if (event.daysUntil === 0) {
    countdownLabel = t('today');
    countdownColor = isBirthday ? 'green' : 'purple';
  } else if (event.daysUntil === 1) {
    countdownLabel = t('tomorrow');
    countdownColor = isBirthday ? 'teal' : 'pink';
  } else {
    countdownLabel = t('inDays', { count: event.daysUntil });
    countdownColor = 'gray';
  }

  // Subtitle
  let subtitle;
  if (isBirthday) {
    if (event.isDeceased) {
      subtitle = t('wouldTurnAge', { age: event.age });
    } else {
      subtitle = t('turnsAge', { age: ordinal(event.age, lang) });
    }
  } else {
    // Death anniversary
    const gender = event.person.data.gender === 'F' ? 'female' : 'male';
    subtitle = t('passedAwayYearsAgo', { count: event.yearsAgo, context: gender });
  }

  const handleClick = () => {
    if (onPersonClick) onPersonClick(event.person);
    onClose();
  };

  return (
    <Box
      borderRadius="lg"
      border="1px solid"
      borderColor={isToday ? (isBirthday ? 'green.200' : 'purple.200') : 'gray.100'}
      bg={isToday ? (isBirthday ? 'green.50' : 'purple.50') : 'white'}
      px={{ base: 2, md: 4 }}
      py={2}
      cursor={onPersonClick ? 'pointer' : 'default'}
      _hover={{ boxShadow: onPersonClick ? 'md' : 'none', transform: onPersonClick ? 'translateY(-1px)' : 'none' }}
      transition="all 0.15s ease"
      onClick={handleClick}
      role={onPersonClick ? 'button' : undefined}
    >
      <HStack spacing={3} align="center">
        {/* Avatar */}
        <Box position="relative" flexShrink={0}>
          <StorageAvatar
            familyId={familyId}
            filename={event.person.data.image}
            name={event.name}
            size="md"
            outline={isToday ? `3px solid ${isBirthday ? '#48BB78' : '#805AD5'}` : undefined}
          />
          {/* Event type badge */}
          <Box
            position="absolute"
            bottom="-2px"
            right="-4px"
            fontSize="sm"
            lineHeight="1"
          >
            {isBirthday ? '🎂' : '🕯️'}
          </Box>
        </Box>

        {/* Text */}
        <VStack align="start" spacing={0} flex="1" minW={0}>
          <Text fontWeight="semibold" fontSize="sm" noOfLines={1} color="gray.800">
            {event.name}
          </Text>
          <Text fontSize="xs" color={isToday ? (isBirthday ? 'green.700' : 'purple.700') : 'gray.500'} noOfLines={1}>
            {subtitle}
          </Text>
          <HStack justifyContent="space-between" w="full">
          <Text fontSize="xs" color="gray.400" noOfLines={1}>
            {formatDate(event.originalDate, lang)}
          </Text>
           {/* Countdown badge */}
        <Badge
          colorScheme={countdownColor}
          borderRadius="full"
          px={2}
          py={1}
          fontSize={{ base: '2xs', md: 'xs' }}
          flexShrink={0}
          textAlign="center"
          whiteSpace="nowrap"
        >
          {countdownLabel}
        </Badge>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
});
EventCard.displayName = 'EventCard';

// ── Main modal ─────────────────────────────────────────────────────────────────

const UpcomingEventsModal = memo(({ isOpen, onClose, familyData, familyId, onPersonClick }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'fr';
  const modalSize = useBreakpointValue({ base: '6xl', md: 'xl' });

  const [filter, setFilter] = useState('all'); // 'all' | 'birthday' | 'death'

  const { events } = useUpcomingEvents(familyData, 365);

  // Apply type filter
  const filtered = useMemo(
    () => (filter === 'all' ? events : events.filter(e => e.type === filter)),
    [events, filter]
  );

  // Group into sections
  const groups = useMemo(() => {
    const today    = filtered.filter(e => e.daysUntil === 0);
    const week     = filtered.filter(e => e.daysUntil >= 1 && e.daysUntil <= 7);
    const month    = filtered.filter(e => e.daysUntil >= 8  && e.daysUntil <= 31);
    const later    = filtered.filter(e => e.daysUntil > 31);
    return { today, week, month, later };
  }, [filtered]);

  const totalBirthdays  = events.filter(e => e.type === 'birthday').length;
  const totalDeaths     = events.filter(e => e.type === 'death').length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} scrollBehavior="inside" motionPreset="none">
      <ModalOverlay bg="rgba(45, 90, 61, 0.35)" />
      <ModalContent
        maxW='640px'
        bg="linear-gradient(135deg, #fafafa 0%, #f5f3ef 100%)"
        border={`3px solid ${GOLD}`}
        borderRadius={modalSize === 'full' ? 'none' : 'xl'}
        overflow="hidden"
        position="relative"
        mx={modalSize === 'full' ? 0 : 4}
        my={modalSize === 'full' ? 0 : 4}
      >
        {/* Flag stripe */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="4px"
          bg="linear-gradient(90deg, var(--theme-flag-left) 33%, #fff 33% 66%, var(--theme-flag-right) 66%)"
          zIndex={2}
        />

        {/* ── Header ── */}
        <ModalHeader pt={6} px={{ base: 4, md: 6 }}>
          <HStack spacing={3} mb={2}>
            <Box fontSize={{ base: 'xl', md: '2xl' }}>📅</Box>
            <VStack align="start" spacing={0}>
              <Heading size={{ base: 'md', md: 'lg' }} color={GREEN} fontFamily="serif" textShadow="1px 1px 2px rgba(0,0,0,0.08)">
                {t('upcomingEvents')}
              </Heading>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" fontStyle="italic">
                {t('upcomingEventsSubtitle')}
              </Text>
            </VStack>
          </HStack>

          {/* Decorative line */}
          <Box
            h="2px"
            bg={`linear-gradient(90deg, transparent 0%, ${GOLD} 20%, #8B4513 50%, ${GOLD} 80%, transparent 100%)`}
            borderRadius="full"
            mt={3}
          />

          {/* Filter buttons */}
          {/* <ButtonGroup size="sm" isAttached variant="outline" spacing={0}>
            <Button
              onClick={() => setFilter('all')}
              bg={filter === 'all' ? GREEN : 'white'}
              color={filter === 'all' ? 'white' : 'gray.700'}
              borderColor={GOLD}
              _hover={{ bg: filter === 'all' ? GREEN : 'gray.50' }}
              borderRadius="md"
              fontWeight="semibold"
            >
              {t('filterAll')} ({events.length})
            </Button>
            <Button
              onClick={() => setFilter('birthday')}
              bg={filter === 'birthday' ? 'green.600' : 'white'}
              color={filter === 'birthday' ? 'white' : 'gray.700'}
              borderColor={GOLD}
              _hover={{ bg: filter === 'birthday' ? 'green.700' : 'gray.50' }}
              borderRadius="md"
              fontWeight="semibold"
            >
              🎂 {t('filterBirthdays')} ({totalBirthdays})
            </Button>
            <Button
              onClick={() => setFilter('death')}
              bg={filter === 'death' ? 'purple.600' : 'white'}
              color={filter === 'death' ? 'white' : 'gray.700'}
              borderColor={GOLD}
              _hover={{ bg: filter === 'death' ? 'purple.700' : 'gray.50' }}
              borderRadius="md"
              fontWeight="semibold"
            >
              🕯️ {t('filterMemorials')} ({totalDeaths})
            </Button>
          </ButtonGroup> */}
        </ModalHeader>

        <ModalCloseButton color={GREEN} top={5} right={5} />

        {/* ── Body ── */}
        <ModalBody px={{ base: 2, md: 6 }} pb={6}>
          {filtered.length === 0 ? (
            <VStack spacing={4} py={12} textAlign="center">
              <Text fontSize="4xl">🗓️</Text>
              <Text fontWeight="semibold" color="gray.600">{t('noUpcomingEvents')}</Text>
              <Text fontSize="sm" color="gray.400" maxW="280px">
                {t('noEventsDescription')}
              </Text>
            </VStack>
          ) : (
            <VStack spacing={2} align="stretch">

              {/* TODAY */}
              {groups.today.length > 0 && (
                <>
                  <SectionHeader icon="✨" label={t('todaySection')} count={groups.today.length} />
                  {groups.today.map((ev, i) => (
                    <EventCard
                      key={`${ev.type}-${ev.person.id}-today`}
                      event={ev}
                      isToday
                      lang={lang}
                      familyId={familyId}
                      t={t}
                      onPersonClick={onPersonClick}
                      onClose={onClose}
                    />
                  ))}
                </>
              )}

              {/* THIS WEEK */}
              {groups.week.length > 0 && (
                <>
                  <SectionHeader icon="📆" label={t('thisWeekSection')} count={groups.week.length} />
                  {groups.week.map((ev) => (
                    <EventCard
                      key={`${ev.type}-${ev.person.id}-week`}
                      event={ev}
                      isToday={false}
                      lang={lang}
                      familyId={familyId}
                      t={t}
                      onPersonClick={onPersonClick}
                      onClose={onClose}
                    />
                  ))}
                </>
              )}

              {/* THIS MONTH */}
              {groups.month.length > 0 && (
                <>
                  <SectionHeader icon="📋" label={t('thisMonthSection')} count={groups.month.length} />
                  {groups.month.map((ev) => (
                    <EventCard
                      key={`${ev.type}-${ev.person.id}-month`}
                      event={ev}
                      isToday={false}
                      lang={lang}
                      familyId={familyId}
                      t={t}
                      onPersonClick={onPersonClick}
                      onClose={onClose}
                    />
                  ))}
                </>
              )}

              {/* LATER */}
              {groups.later.length > 0 && (
                <>
                  <SectionHeader icon="🗓️" label={t('laterThisYearSection')} count={groups.later.length} />
                  {groups.later.map((ev) => (
                    <EventCard
                      key={`${ev.type}-${ev.person.id}-later`}
                      event={ev}
                      isToday={false}
                      lang={lang}
                      familyId={familyId}
                      t={t}
                      onPersonClick={onPersonClick}
                      onClose={onClose}
                    />
                  ))}
                </>
              )}

            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

UpcomingEventsModal.displayName = 'UpcomingEventsModal';
export default UpcomingEventsModal;
