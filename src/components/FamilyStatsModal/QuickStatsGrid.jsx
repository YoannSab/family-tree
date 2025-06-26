import React, { memo } from 'react';
import {
  SimpleGrid,
  Box,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';

const QuickStatsGrid = memo(({
  totalMembers,
  livingMembers,
  marriedMembers,
  parentsCount,
  maleCount,
  femaleCount,
  avgChildrenPerParent,
  avgAgeAtFirstChild,
  validParents,
  avgLifespan,
  maxLifespan,
  italianGold,
  italianGreen,
  cardGridColumns,
  fontSize,
  t
}) => {
  const quickStats = [
    {
      label: t('totalMembers'),
      number: totalMembers,
      helper: t('registeredPersons'),
      icon: '👥'
    },
    {
      label: t('living'),
      number: livingMembers,
      helper: `${((livingMembers / totalMembers) * 100).toFixed(1)}% ${t('ofTotal')}`,
      icon: '❤️'
    },
    {
      label: t('married'),
      number: marriedMembers,
      helper: `${((marriedMembers / totalMembers) * 100).toFixed(1)}% ${t('ofTotal')}`,
      icon: '💒'
    },
    {
      label: t('parents'),
      number: parentsCount,
      helper: `${((parentsCount / totalMembers) * 100).toFixed(1)}% ${t('ofTotal')}`,
      icon: '👪'
    },
    {
      label: t('men'),
      number: maleCount,
      helper: `${((maleCount / totalMembers) * 100).toFixed(1)}% ${t('ofTotal')}`,
      icon: '👨'
    },
    {
      label: t('women'),
      number: femaleCount,
      helper: `${((femaleCount / totalMembers) * 100).toFixed(1)}% ${t('ofTotal')}`,
      icon: '👩'
    },
    {
      label: t('avgChildren'),
      number: avgChildrenPerParent,
      helper: `${t('perParent')} (${validParents} ${t('parents')})`,
      icon: '🍼'
    },
    {
      label: t('avgAgeFirstChild'),
      number: `${avgAgeAtFirstChild} ${t('years')}`,
      helper: t('averageAge'),
      icon: '🎂'
    },
    {
      label: t('avgLifespan'),
      number: `${avgLifespan} ${t('years')}`,
      helper: t('forDeceased'),
      icon: '⏳'
    },
    {
      label: t('longestLife'),
      number: `${maxLifespan} ${t('years')}`,
      helper: t('recordHolder'),
      icon: '🌟'
    }
  ];

  return (
    <SimpleGrid columns={cardGridColumns} spacing={{ base: 3, md: 4 }}>
      {quickStats.map((stat, index) => (
        <Box
          key={index}
          p={4}
          bg="linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
          borderRadius="lg"
          border={`2px solid ${italianGold}`}
          boxShadow="0 2px 12px rgba(200, 168, 130, 0.2)"
          transition="all 0.2s"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(200, 168, 130, 0.3)'
          }}
        >
          <Stat textAlign="center">
            <Box fontSize={{ base: 'lg', md: 'xl' }} mb={2}>
              {stat.icon}
            </Box>
            <StatLabel
              fontSize={fontSize}
              color="gray.600"
              fontWeight="medium"
              mb={1}
            >
              {stat.label}
            </StatLabel>
            <StatNumber
              fontSize={{ base: 'xl', md: '2xl' }}
              color={italianGreen}
              fontWeight="bold"
              fontFamily="serif"
            >
              {stat.number}
            </StatNumber>
            <StatHelpText
              fontSize="xs"
              color="gray.500"
              mt={1}
              fontStyle="italic"
            >
              {stat.helper}
            </StatHelpText>
          </Stat>
        </Box>
      ))}
    </SimpleGrid>
  );
});

QuickStatsGrid.displayName = 'QuickStatsGrid';

export default QuickStatsGrid;
