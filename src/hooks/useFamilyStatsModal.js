import { useMemo } from 'react';
import { useBreakpointValue, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export const useFamilyStatsModal = (familyData) => {
  const { t } = useTranslation();
  const cardBg = useColorModeValue('linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 'gray.700');
  const italianGold = '#c8a882';
  const italianGreen = '#2d5a27';

  const modalSize = useBreakpointValue({ base: 'full', md: '6xl' });
  const cardGridColumns = useBreakpointValue({ base: 1, md: 2 });
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const headerSize = useBreakpointValue({ base: 'md', md: 'lg' });

  const stats = useMemo(() => {
    if (!familyData || familyData.length === 0) return null;

    const totalMembers = familyData.length;
    const livingMembers = familyData.filter(person => !person.data.death).length;

    const families = {};
    familyData.forEach(person => {
      if (!families[person.data.family]) {
        families[person.data.family] = { total: 0, living: 0, deceased: 0, avgAge: 0 };
      }
      families[person.data.family].total++;
      if (person.data.death) {
        families[person.data.family].deceased++;
      } else {
        families[person.data.family].living++;
      }
    });

    Object.keys(families).forEach(familyName => {
      const familyMembers = familyData.filter(person => person.data.family === familyName);
      const totalAge = familyMembers.reduce((sum, person) => {
        const age = person.data.death ? person.data.death - person.data.birthday : new Date().getFullYear() - person.data.birthday;
        return sum + age;
      }, 0);
      families[familyName].avgAge = Math.round(totalAge / familyMembers.length);
    });

    const ageRanges = {};
    const ageRangeKeys = ['children', 'youngAdults', 'adults', 'seniors', 'elders'];
    ageRangeKeys.forEach(key => {
      ageRanges[key] = 0;
    });
    familyData.forEach(person => {
      const age = person.data.death ? person.data.death - person.data.birthday : new Date().getFullYear() - person.data.birthday;
      if (age <= 17) ageRanges['children']++;
      else if (age <= 35) ageRanges['youngAdults']++;
      else if (age <= 55) ageRanges['adults']++;
      else if (age <= 75) ageRanges['seniors']++;
      else ageRanges['elders']++;
    });

    const birthDecades = {};
    familyData.forEach(person => {
      const birthday = person.data.birthday;
      if (birthday && !isNaN(birthday) && birthday > 1800) {
        const decade = Math.floor(birthday / 10) * 10;
        birthDecades[decade] = (birthDecades[decade] || 0) + 1;
      }
    });

    const marriedMembers = familyData.filter(person => person.rels.spouses && person.rels.spouses.length > 0).length;
    const parentsCount = familyData.filter(person => person.rels.children && person.rels.children.length > 0).length;
    const totalChildren = familyData.reduce((sum, person) => sum + (person.rels.children ? person.rels.children.length : 0), 0);
    const avgChildrenPerParent = parentsCount > 0 ? Math.round((totalChildren / parentsCount) * 10) / 10 : 0;

    const parentsWithAgeData = familyData.filter(person =>
      person.rels.children &&
      person.rels.children.length > 0 &&
      person.data.birthday &&
      !isNaN(person.data.birthday)
    );
    let totalAgeAtFirstChild = 0;
    let validParents = 0;
    parentsWithAgeData.forEach(parent => {
      if (parent.rels.children && parent.rels.children.length > 0) {
        const children = parent.rels.children.map(childId =>
          familyData.find(person => person.id === childId)
        ).filter(child => child && child.data.birthday && !isNaN(child.data.birthday));
        if (children.length > 0) {
          const oldestChild = children.reduce((oldest, child) =>
            child.data.birthday < oldest.data.birthday ? child : oldest
          );
          const ageAtFirstChild = oldestChild.data.birthday - parent.data.birthday;
          if (ageAtFirstChild > 0 && ageAtFirstChild < 100) {
            totalAgeAtFirstChild += ageAtFirstChild;
            validParents++;
          }
        }
      }
    });
    const avgAgeAtFirstChild = validParents > 0 ? Math.round(totalAgeAtFirstChild / validParents) : 0;

    const deceasedMembersWithData = familyData.filter(person => person.data.death && !isNaN(person.data.death) && person.data.birthday && !isNaN(person.data.birthday));
    const longevityData = deceasedMembersWithData.map(person => person.data.death - person.data.birthday).filter(age => age > 0 && age < 120);
    const avgLifespan = longevityData.length > 0 ? Math.round(longevityData.reduce((sum, age) => sum + age, 0) / longevityData.length) : 0;
    const maxLifespan = longevityData.length > 0 ? Math.max(...longevityData) : 0;

    const maleCount = familyData.filter(person => person.data.gender === 'M').length;
    const femaleCount = familyData.filter(person => person.data.gender === 'F').length;

    return {
      totalMembers,
      livingMembers,
      families,
      ageRanges,
      birthDecades,
      marriedMembers,
      parentsCount,
      avgChildrenPerParent,
      avgAgeAtFirstChild,
      validParents,
      avgLifespan,
      maxLifespan,
      maleCount,
      femaleCount,
    };
  }, [familyData]);

  return {
    t,
    stats,
    cardBg,
    italianGold,
    italianGreen,
    modalSize,
    cardGridColumns,
    fontSize,
    headerSize,
  };
};
