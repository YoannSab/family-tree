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

const DemographicsSection = memo(({
  ageRanges,
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
        {t('demographics')}
      </Heading>
      <Card
        bg={cardBg}
        border={`1px solid ${italianGold}`}
        borderRadius="lg"
      >
        <CardBody>
          <VStack spacing={4} align="stretch">
            {Object.entries(ageRanges).map(([rangeKey, count]) => {
              const percentage = ((count / totalMembers) * 100).toFixed(1);
              const ageGroup = t(`ageRanges.${rangeKey}`);
              const ages = t(`ageRangeLabels.${rangeKey}`);

              return (
                <Box key={rangeKey}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <VStack align="start" spacing={0}>
                      <Text fontSize={fontSize} fontWeight="bold" color={italianGreen}>
                        {ageGroup}
                      </Text>
                      <Text fontSize="xs" color="gray.500">{ages}</Text>
                    </VStack>
                    <HStack spacing={2}>
                      <Badge
                        bg="linear-gradient(135deg, #e3f2fd, #f3e5f5)"
                        color={italianGreen}
                        border={`1px solid ${italianGold}`}
                        fontSize="xs"
                      >
                        {count} {count === 1 ? t('person') : t('people')}
                      </Badge>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        {percentage}%
                      </Text>
                    </HStack>
                  </Flex>
                  <Progress
                    value={(count / totalMembers) * 100}
                    colorScheme="blue"
                    size="md"
                    borderRadius="md"
                    bg="gray.100"
                    sx={{
                      '& > div': {
                        background: `linear-gradient(90deg, ${italianGold}, #d4af37)`
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

DemographicsSection.displayName = 'DemographicsSection';

export default DemographicsSection;
