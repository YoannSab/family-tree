import React, { useMemo } from 'react'
import { Box } from '@chakra-ui/react'

const TreeVisualization = ({ familyData, onPersonClick, showConnections = true, connectionOpacity = 80 }) => {
  // Calculate positions for each person
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

    // Calculate positions
    const generationKeys = Object.keys(generations).map(Number).sort((a, b) => a - b)
    const cardWidth = 280
    const cardHeight = 320
    const horizontalSpacing = 100
    const verticalSpacing = 200
    
    generationKeys.forEach((gen, genIndex) => {
      const people = generations[gen]
      const totalWidth = people.length * cardWidth + (people.length - 1) * horizontalSpacing
      const startX = -totalWidth / 2

      people.forEach((person, personIndex) => {
        const x = startX + personIndex * (cardWidth + horizontalSpacing) + cardWidth / 2
        const y = genIndex * (cardHeight + verticalSpacing) + 100
        
        positions.set(person.id, { x, y, person })
      })
    })

    return positions
  }, [familyData])

  // Generate connection paths
  const connections = useMemo(() => {
    const paths = []
    const spouseConnections = new Set()

    familyData.forEach(person => {
      const personPos = layout.get(person.id)
      if (!personPos) return

      // Parent-Child relationships
      if (person.children && person.children.length > 0) {
        person.children.forEach(childId => {
          const childPos = layout.get(childId)
          if (childPos) {
            // Find if person has spouse for this child
            const spouse = person.spouse && person.spouse.length > 0 
              ? familyData.find(p => p.id === person.spouse[0] && p.children?.includes(childId))
              : null
            
            let startX = personPos.x
            let startY = personPos.y + 160
            
            if (spouse) {
              const spousePos = layout.get(spouse.id)
              if (spousePos) {
                // Connection point between parents
                startX = (personPos.x + spousePos.x) / 2
                startY = Math.max(personPos.y, spousePos.y) + 160
              }
            }

            // Create parent-child connection
            paths.push({
              type: 'parent-child',
              id: `${person.id}-${childId}`,
              path: `
                M ${startX} ${startY}
                L ${startX} ${startY + 60}
                L ${childPos.x} ${startY + 60}
                L ${childPos.x} ${childPos.y - 10}
              `,
              markerEnd: 'url(#arrowChild)'
            })
          }
        })
      }

      // Spouse relationships
      if (person.spouse && person.spouse.length > 0) {
        person.spouse.forEach(spouseId => {
          const spouseKey = [person.id, spouseId].sort().join('-')
          if (!spouseConnections.has(spouseKey)) {
            spouseConnections.add(spouseKey)
            const spousePos = layout.get(spouseId)
            if (spousePos) {
              // Heart-shaped curve for spouses
              const midX = (personPos.x + spousePos.x) / 2
              const midY = (personPos.y + spousePos.y) / 2 - 30
              
              paths.push({
                type: 'spouse',
                id: spouseKey,
                path: `
                  M ${personPos.x} ${personPos.y + 80}
                  Q ${midX} ${midY} ${spousePos.x} ${spousePos.y + 80}
                `,
                markerEnd: 'url(#heart)'
              })
            }
          }
        })
      }
    })

    return paths
  }, [familyData, layout])
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible',
        opacity: showConnections ? connectionOpacity / 100 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
      viewBox="-2000 -200 4000 3000"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="parentChildGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3182CE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2B6CB0" stopOpacity="0.6" />
        </linearGradient>
        
        <linearGradient id="spouseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E53E3E" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#C53030" stopOpacity="0.6" />
        </linearGradient>

        {/* Arrow markers */}
        <marker
          id="arrowChild"
          markerWidth="12"
          markerHeight="8"
          refX="10"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0,0 0,8 12,4"
            fill="#3182CE"
            opacity="0.8"
          />
        </marker>

        {/* Heart marker for spouses */}
        <marker
          id="heart"
          markerWidth="16"
          markerHeight="16"
          refX="8"
          refY="8"
          orient="auto"
        >
          <path
            d="M8,15 C8,15 2,9 2,6 C2,4 4,2 6,2 C7,2 8,3 8,4 C8,3 9,2 10,2 C12,2 14,4 14,6 C14,9 8,15 8,15 Z"
            fill="#E53E3E"
            opacity="0.7"
          />
        </marker>

        {/* Drop shadow filter */}
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offset"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Glow effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Render all connections */}
      {connections.map(conn => (
        <g key={conn.id}>
          {conn.type === 'parent-child' && (
            <>
              {/* Shadow path */}
              <path
                d={conn.path}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="6"
                fill="none"
                transform="translate(2,2)"
              />
              {/* Main path */}
              <path
                d={conn.path}
                stroke="url(#parentChildGradient)"
                strokeWidth="3"
                fill="none"
                markerEnd={conn.markerEnd}
                filter="url(#glow)"
                className="parent-child-line"
              />
            </>
          )}
          
          {conn.type === 'spouse' && (
            <>
              {/* Shadow path */}
              <path
                d={conn.path}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="5"
                fill="none"
                transform="translate(2,2)"
              />
              {/* Main path */}
              <path
                d={conn.path}
                stroke="url(#spouseGradient)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                markerEnd={conn.markerEnd}
                filter="url(#glow)"
                className="spouse-line"
              />
            </>
          )}
        </g>
      ))}

      {/* Render position guides for debugging (optional) */}
      {Array.from(layout.values()).map(pos => (
        <circle
          key={pos.person.id}
          cx={pos.x}
          cy={pos.y + 80}
          r="3"
          fill="#CBD5E0"
          opacity="0.3"
        />
      ))}
    </svg>
  )
}

export default TreeVisualization
