import { memo } from 'react';
import { Box, Image } from '@chakra-ui/react';
import { useImageUrl } from '../hooks/useImageUrl';
import { THEME } from '../config/config';

// Map Chakra avatar size tokens to px (same scale as Chakra's default theme)
const CHAKRA_SIZES = { xs: '32px', sm: '40px', md: '48px', lg: '56px', xl: '64px', '2xl': '72px' };
const resolveSize = (s) => CHAKRA_SIZES[s] ?? s ?? '40px';

// Shared initials avatar — same style as D3 tree cards
const InitialsAvatar = ({ name, size = 'md', outline }) => {
  const px = resolveSize(size);
  const parts = (name || '').trim().split(/\s+/);
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : (parts[0]?.[0] || '?').toUpperCase();
  return (
    <Box
      w={px}
      h={px}
      borderRadius="full"
      bg="var(--theme-primary)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontWeight="bold"
      fontSize={`calc(${px} * 0.38)`}
      outline={outline}
      style={{ outlineOffset: '2px', flexShrink: 0 }}
    >
      {initials}
    </Box>
  );
};

const StorageAvatar = memo(({ familyId, filename, name, size = 'md', outline, ...rest }) => {
  const px = resolveSize(size);
  const { url } = useImageUrl(familyId, filename);
  if (!url) return <InitialsAvatar name={name} size={size} outline={outline} />;
  return (
    <Box
      as={Image}
      src={url}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
      w={px}
      h={px}
      borderRadius="full"
      objectFit="cover"
      outline={outline}
      style={{ outlineOffset: '2px', flexShrink: 0 }}
      {...rest}
    />
  );
});

StorageAvatar.displayName = 'StorageAvatar';
export { InitialsAvatar };
export default StorageAvatar;
