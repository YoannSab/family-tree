import { useEffect, useRef } from 'react';
import { Box, VStack, Text, Divider } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { THEME } from '../../config/config';

const MENU_WIDTH = 230;

// ─── Individual menu item ──────────────────────────────────────────────────────
const ContextMenuItem = ({ onClick, children, isDestructive = false }) => (
  <Box
    px={4}
    py={2}
    mx={1}
    borderRadius="md"
    fontSize="sm"
    fontWeight="medium"
    color={isDestructive ? 'red.500' : 'gray.800'}
    cursor="pointer"
    userSelect="none"
    _hover={{ bg: isDestructive ? 'red.50' : `rgba(${THEME.accentRgb}, 0.12)` }}
    _active={{ bg: isDestructive ? 'red.100' : `rgba(${THEME.accentRgb}, 0.22)` }}
    onClick={onClick}
  >
    {children}
  </Box>
);

// ─── Main component ────────────────────────────────────────────────────────────
const TreeContextMenu = ({
  person,
  position,
  onClose,
  onAddFather,
  onAddMother,
  onAddSpouse,
  onAddChild,
  onDelete,
}) => {
  const { t } = useTranslation();
  const menuRef = useRef(null);

  const hasFather = !!person.rels?.father;
  const hasMother = !!person.rels?.mother;

  // Clamp position so the menu never overflows the viewport
  const x = Math.min(position.x, window.innerWidth - MENU_WIDTH - 12);
  const y = Math.min(position.y, window.innerHeight - 260);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    const handlePointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    // Defer to avoid the triggering event closing the menu immediately
    const t1 = setTimeout(() => {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('pointerdown', handlePointerDown);
    }, 0);
    return () => {
      clearTimeout(t1);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [onClose]);

  const action = (fn) => () => { fn(); onClose(); };

  return (
    // Transparent full-screen overlay to capture outside clicks
    <Box
      position="fixed"
      inset={0}
      zIndex={2000}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Box
        ref={menuRef}
        position="fixed"
        top={`${y}px`}
        left={`${x}px`}
        w={`${MENU_WIDTH}px`}
        bg="white"
        borderRadius="xl"
        border={`1px solid ${THEME.accent}`}
        boxShadow="0 8px 30px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)"
        py={1}
        zIndex={2001}
        overflow="hidden"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Person name header */}
        <Box
          px={4}
          py={2}
          bg={`rgba(${THEME.primaryRgb}, 0.05)`}
          borderBottom={`1px solid rgba(${THEME.accentRgb}, 0.3)`}
        >
          <Text
            fontSize="xs"
            fontWeight="bold"
            color={THEME.primary}
            textTransform="uppercase"
            letterSpacing="0.6px"
            noOfLines={1}
          >
            {person.data.firstName} {person.data.lastName}
          </Text>
        </Box>

        <VStack spacing={0} align="stretch" py={1}>
          {!hasFather && (
            <ContextMenuItem onClick={action(onAddFather)}>
              👨 {t('addFather')}
            </ContextMenuItem>
          )}
          {!hasMother && (
            <ContextMenuItem onClick={action(onAddMother)}>
              👩 {t('addMother')}
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={action(onAddSpouse)}>
            💑 {t('addSpouse')}
          </ContextMenuItem>
          <ContextMenuItem onClick={action(onAddChild)}>
            👶 {t('addChild')}
          </ContextMenuItem>

          <Box px={3} my={1}>
            <Divider borderColor={`rgba(${THEME.accentRgb}, 0.4)`} />
          </Box>

          <ContextMenuItem isDestructive onClick={action(onDelete)}>
            🗑️ {t('deleteMember')}
          </ContextMenuItem>
        </VStack>
      </Box>
    </Box>
  );
};

export default TreeContextMenu;
