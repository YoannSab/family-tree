import React from 'react'

const FamilyConnections = ({ familyData, generations, viewBox = "0 0 3000 2000" }) => {
  const getPersonPosition = (personId, generation) => {
    const genPeople = generations[generation] || []
    const personIndex = genPeople.findIndex(p => p.id === personId)
    
    // Calculate position based on generation and index within generation
    const baseX = 100 + (personIndex * 300) // Increased spacing
    const baseY = 150 + (generation * 450) // Increased vertical spacing
    
    return {
      x: baseX,
      y: baseY,
    }
  }

  const renderFamilyConnections = () => {
    const connections = []
    
    // Create parent-children connections
    familyData.forEach(person => {
      if (!person.children || person.children.length === 0) return
      
      const parentPos = getPersonPosition(person.id, person.generation)
      
      // Find spouse position if exists
      let spousePos = null
      if (person.spouse && person.spouse.length > 0) {
        const spouse = familyData.find(p => p.id === person.spouse[0])
        if (spouse) {
          spousePos = getPersonPosition(spouse.id, spouse.generation)
        }
      }
      
      // Calculate connection hub position (between parents or from single parent)
      let hubX = parentPos.x
      let hubY = parentPos.y + 150 // Below parent card
      
      if (spousePos) {
        hubX = (parentPos.x + spousePos.x) / 2
        hubY = Math.max(parentPos.y, spousePos.y) + 150
        
        // Line between spouses
        connections.push(
          <line
            key={`spouse-${person.id}-${person.spouse[0]}`}
            x1={parentPos.x}
            y1={parentPos.y + 75}
            x2={spousePos.x}
            y2={spousePos.y + 75}
            stroke="#E53E3E"
            strokeWidth="3"
            strokeDasharray="5,5"
            opacity="0.8"
          />
        )
      }
      
      // Vertical line from parent(s) to hub
      connections.push(
        <line
          key={`parent-hub-${person.id}`}
          x1={hubX}
          y1={parentPos.y + 150}
          x2={hubX}
          y2={hubY}
          stroke="#3182CE"
          strokeWidth="3"
          opacity="0.9"
        />
      )
      
      // Children connections
      person.children.forEach((childId, index) => {
        const child = familyData.find(p => p.id === childId)
        if (!child) return
        
        const childPos = getPersonPosition(childId, child.generation)
        
        // Horizontal line from hub to child column
        connections.push(
          <line
            key={`hub-child-h-${person.id}-${childId}`}
            x1={hubX}
            y1={hubY}
            x2={childPos.x}
            y2={hubY}
            stroke="#3182CE"
            strokeWidth="2"
            opacity="0.8"
          />
        )
        
        // Vertical line down to child
        connections.push(
          <line
            key={`hub-child-v-${person.id}-${childId}`}
            x1={childPos.x}
            y1={hubY}
            x2={childPos.x}
            y2={childPos.y - 10}
            stroke="#3182CE"
            strokeWidth="2"
            opacity="0.8"
          />
        )
        
        // Connection point at hub
        if (index === 0 || index === person.children.length - 1) {
          connections.push(
            <circle
              key={`hub-point-${person.id}-${childId}`}
              cx={hubX}
              cy={hubY}
              r="4"
              fill="#3182CE"
              opacity="0.9"
            />
          )
        }
      })
    })
    
    return connections
  }

  return (
    <svg 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#3182CE"
            opacity="0.7"
          />
        </marker>
        
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {renderFamilyConnections()}
    </svg>
  )
}

export default FamilyConnections
