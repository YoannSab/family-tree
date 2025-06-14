import React from 'react';
import { 
  Button, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  HStack, 
  Text, 
  Box,
  useColorModeValue
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ size = 'sm', variant = 'solid' }) => {
  const { i18n } = useTranslation();
  const menuBg = useColorModeValue('white', 'gray.700');
  const menuBorder = useColorModeValue('gray.200', 'gray.600');

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        size={size}
        variant={variant}
        bg="rgba(255,255,255,0.15)"
        color="white"
        _hover={{ bg: "rgba(255,255,255,0.25)" }}
        _active={{ bg: "rgba(255,255,255,0.3)" }}
        backdropFilter="blur(10px)"
        border="1px solid rgba(255,255,255,0.2)"
        borderRadius="lg"
        fontWeight="medium"
      >
        <HStack spacing={2}>
          <Text fontSize="md">{currentLanguage.flag}</Text>
          <Text fontSize="sm" display={{ base: 'none', md: 'block' }}>
            {currentLanguage.name}
          </Text>
        </HStack>
      </MenuButton>
      <MenuList
        bg={menuBg}
        borderColor={menuBorder}
        borderRadius="xl"
        py={2}
        minW="160px"
        boxShadow="0 8px 25px rgba(0,0,0,0.15)"
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            bg="transparent"
            py={3}
            px={4}
            borderRadius="lg"
            mx={1}
            fontWeight={i18n.language === language.code ? 'bold' : 'normal'}
            color={i18n.language === language.code ? '#2d5a27' : 'inherit'}
            _hover={{ bg: 'rgba(45,90,39,0.1)' }}
          >
            <HStack spacing={3} w="full">
              <Box fontSize="lg">{language.flag}</Box>
              <Text fontSize="sm">{language.name}</Text>
              {i18n.language === language.code && (
                <Box ml="auto">
                  <Box w={2} h={2} bg="#2d5a27" borderRadius="full" />
                </Box>
              )}
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default LanguageSwitcher;
