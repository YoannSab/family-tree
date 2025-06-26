import React, { memo } from 'react';
import {
  VStack,
  Box,
  Heading,
  Card,
  CardBody,
  Progress,
  Badge,
  Flex,
  Text,
  HStack,
} from '@chakra-ui/react';

const BirthDecadesSection = memo(({
  birthDecades,
  totalMembers,
  italianGold,
  italianGreen,
  cardBg,
  fontSize,
  t
}) => {
  return (
    <Box>
      <Heading
        size={{ base: 'sm', md: 'md' }}
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
        {t('birthDecades')}
      </Heading>
      <Card
        bg={cardBg}
        border={`1px solid ${italianGold}`}
        borderRadius="lg"
      >
        <CardBody>
          <VStack spacing={4} align="stretch">
            {Object.entries(birthDecades)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([decade, count]) => {
                const percentage = ((count / totalMembers) * 100).toFixed(1);
                const decadeStart = parseInt(decade);
                const decadeEnd = decadeStart + 9;

                return (
                  <Box key={decade}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <VStack align="start" spacing={0}>
                        <Text fontSize={fontSize} fontWeight="bold" color={italianGreen}>
                          {decadeStart}s
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {decadeStart} - {decadeEnd}
                        </Text>
                      </VStack>
                      <HStack spacing={2}>
                        <Badge
                          bg="linear-gradient(135deg, #fff3e0, #fce4ec)"
                          color={italianGreen}
                          border={`1px solid ${italianGold}`}
                          fontSize="xs"
                        >
                          {count} {count === 1 ? t('birth') : t('births')}
                        </Badge>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">
                          {percentage}%
                        </Text>
                      </HStack>
                    </Flex>
                    <Progress
                      value={(count / totalMembers) * 100}
                      colorScheme="orange"
                      size="md"
                      borderRadius="md"
                      bg="gray.100"
                      sx={{
                        '& > div': {
                          background: `linear-gradient(90deg, #ff8a65, #ffab91)`
                        }
                      }}
                    />
                  </Box>
                );
              })}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
});

BirthDecadesSection.displayName = 'BirthDecadesSection';

export default BirthDecadesSection;
