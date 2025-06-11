import React, { useMemo } from 'react'
import { Box, VStack, HStack, Text, Heading, Flex } from '@chakra-ui/react'
import PersonCard from './PersonCard'
import TreeVisualization from './TreeVisualization'

const EnhancedTreeView = ({ familyData, onPersonClick, showConnections = true, connectionOpacity = 80 }) => {
  // Calculate positions for each person in the tree
  const layout = useMemo(() => {
    const positions = new Map()
    const generations = {}
    
    // Group by generation
    familyData.forEach(person => {
      if (!generations[person.generation]) {
        generations[person.generation] = []
      }
      generations[person.generation].push(person)
    })

    // Calculate positions for better tree layout
    const generationKeys = Object.keys(generations).map(Number).sort((a, b) => a - b)
    const cardWidth = 280
    const cardHeight = 320
    const horizontalSpacing = 100
    const verticalSpacing = 200
    
    generationKeys.forEach((gen, genIndex) => {
      const people = generations[gen]
      
      // For generation 0 (founders), center them
      if (gen === 0) {
        const totalWidth = people.length * cardWidth + (people.length - 1) * horizontalSpacing
        const startX = -totalWidth / 2
        
        people.forEach((person, personIndex) => {
          const x = startX + personIndex * (cardWidth + horizontalSpacing)
          const y = 100
          positions.set(person.id, { x, y, person })
        })
      } else {
        // For other generations, arrange based on parents
        const arrangedPeople = []
        const used = new Set()
        
        // First, arrange people who have parents
        people.forEach(person => {
          if (used.has(person.id)) return
          
          // Find parents
          const parents = familyData.filter(p => 
            p.children && p.children.includes(person.id)
          )
          
          if (parents.length > 0) {
            // Group siblings together
            const siblings = people.filter(p => 
              parents.some(parent => parent.children && parent.children.includes(p.id))
            )
            
            siblings.forEach(sibling => {
              if (!used.has(sibling.id)) {
                arrangedPeople.push(sibling)
                used.add(sibling.id)
              }
            })
          }
        })
        
        // Add remaining people
        people.forEach(person => {
          if (!used.has(person.id)) {
            arrangedPeople.push(person)
          }
        })
        
        // Position them
        const totalWidth = arrangedPeople.length * cardWidth + (arrangedPeople.length - 1) * horizontalSpacing
        const startX = -totalWidth / 2
        
        arrangedPeople.forEach((person, personIndex) => {
          const x = startX + personIndex * (cardWidth + horizontalSpacing)
          const y = genIndex * (cardHeight + verticalSpacing) + 100
          positions.set(person.id, { x, y, person })
        })
      }
    })

    return positions
  }, [familyData])

  return (
    <Box position="relative" minW="4000px" minH="3000px" p={8}>      {/* Tree connections */}
      <TreeVisualization 
        familyData={familyData} 
        onPersonClick={onPersonClick}
        showConnections={showConnections}
        connectionOpacity={connectionOpacity}
      />
      
      {/* Person cards positioned absolutely */}
      {Array.from(layout.values()).map(pos => (
        <Box
          key={pos.person.id}
          position="absolute"
          left={`${pos.x + 2000}px`} // Offset to center in viewport
          top={`${pos.y + 200}px`}   // Offset to center in viewport
          zIndex={2}
          transform="translate(-50%, -50%)"
        >
          <PersonCard
            person={pos.person}
            onClick={onPersonClick}
            isFounder={pos.person.generation === 0}
            size={pos.person.generation === 0 ? "lg" : "md"}
          />
        </Box>
      ))}
      
      {/* Legend */}
      <Box
        position="absolute"
        top={8}
        right={8}
        bg="white"
        p={4}
        borderRadius="lg"
        shadow="lg"
        border="1px solid"
        borderColor="gray.200"
        zIndex={10}
        minW="200px"
      >
        <Heading size="sm" mb={3} color="blue.600">
          Relationship Types
        </Heading>
        <VStack spacing={2} align="start">
          <HStack>
            <Box w={4} h={0.5} bg="blue.500" />
            <Text fontSize="xs">Parent → Child</Text>
          </HStack>
          <HStack>
            <Box w={4} h={0.5} bg="red.500" style={{ borderStyle: 'dashed' }} />
            <Text fontSize="xs">♥ Spouse</Text>
          </HStack>
          <HStack>
            <Box w={3} h={3} bg="yellow.400" borderRadius="full" />
            <Text fontSize="xs">Founder</Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}

export default EnhancedTreeView
