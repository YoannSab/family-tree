import React, { memo } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Collapse,
  List,
  ListItem,
  Spacer,
  Divider,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FiCamera } from 'react-icons/fi';

const TreeSectionHeader = memo(({
  t,
  isMobile,
  searchQuery,
  showSearchResults,
  searchResults,
  handleSearchChange,
  handleSearchSelect,
  onFaceRecognitionOpen
}) => {
  return (
    <Box>
      <Flex flexDirection={{ base: 'column', md: 'row' }} alignItems="center" justifyContent="center" mb={4} gap={5}>
        <HStack spacing={3}>
          <Box
            w={12}
            h={12}
            bg="linear-gradient(135deg, #2d5a27 0%, #1e3a1a 100%)"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 4px 12px rgba(45, 90, 39, 0.3)"
          >
            <Text fontSize="2xl">🌳</Text>
          </Box>
          <VStack align="start" spacing={1}>
            <Heading
              size={{ base: 'md', md: 'lg' }}
              color="gray.800"
              fontFamily="serif"
            >
              {t('interactiveTree')}
            </Heading>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              color="gray.600"
              fontStyle="italic"
            >
              {isMobile
                ? t('treeDescriptionMobile')
                : t('treeDescription')
              }
            </Text>
          </VStack>
        </HStack>

        {/* Search Bar */}
        <Box position="relative" maxW="400px" w="full">
          <InputGroup size={isMobile ? "md" : "lg"}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder={t('searchPlaceholder')}
              fontSize={isMobile ? "sm" : "md"}
              value={searchQuery}
              onChange={handleSearchChange}
              bg="white"
              border="2px solid #c8a882"
              borderRadius="xl"
              _focus={{
                borderColor: "#d4af37",
                boxShadow: "0 0 0 1px #d4af37"
              }}
              _hover={{
                borderColor: "#d4af37"
              }}
            />

            <InputRightElement>
              <IconButton
                icon={<FiCamera />}
                onClick={onFaceRecognitionOpen}
                variant="ghost"
                size={"lg"}
                aria-label="Face recognition"
                color="gray.600"
                _hover={{ bg: "transparent", transform: "scale(1.2)" }}
              />
            </InputRightElement>
          </InputGroup>

          {/* Search Results */}
          <Collapse in={showSearchResults}>
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              mt={2}
              bg="white"
              border="2px solid #c8a882"
              borderRadius="xl"
              boxShadow="0 8px 25px rgba(0,0,0,0.15)"
              zIndex={10}
              maxH="300px"
              overflowY="auto"
            >
              <List spacing={0}>
                {searchResults.map((person) => (
                  <ListItem
                    key={person.id}
                    p={3}
                    cursor="pointer"
                    _hover={{
                      bg: "rgba(200, 168, 130, 0.1)"
                    }}
                    onClick={() => handleSearchSelect(person)}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                  >
                    <HStack spacing={3}>
                      <Box>
                        <Text fontWeight="bold" color="#2d5a27" fontSize="sm">
                          {person.data.firstName} {person.data.lastName}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {person.data.birthday}
                          {person.data.death ? ` - ${person.data.death}` : ''}
                          {person.data.occupation && ` • ${person.data.occupation}`}
                        </Text>
                      </Box>
                      <Spacer />
                    </HStack>
                    <Divider mt={2} />
                  </ListItem>
                ))}
                {searchResults.length === 0 && searchQuery && (
                  <ListItem p={3}>
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                      {t('noResults')} "{searchQuery}"
                    </Text>
                  </ListItem>
                )}
              </List>
            </Box>
          </Collapse>
        </Box>
      </Flex>

      {/* Decorative separator */}
      <Box
        w="full"
        h="2px"
        bg="linear-gradient(90deg, transparent 0%, #c8a882 20%, #d4af37 50%, #c8a882 80%, transparent 100%)"
        borderRadius="full"
        mb={4}
      />
    </Box>
  );
});

TreeSectionHeader.displayName = 'TreeSectionHeader';

export default TreeSectionHeader;
