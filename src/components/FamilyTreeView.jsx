import { useState, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Button,
  ButtonGroup,
  Flex,
  useColorModeValue,
  Heading,
  Text,
  Badge,
  Switch,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
// import { ZoomInIcon, ZoomOutIcon, RepeatIcon, ViewIcon, SettingsIcon } from '@chakra-ui/icons'
import PersonCard from './PersonCard'
import FamilyBranch from './FamilyBranch'
import EnhancedTreeView from './EnhancedTreeView'

const FamilyTreeView = ({ familyData, onPersonClick, onFamilyClick }) => {
  const [viewMode, setViewMode] = useState('tree') // 'tree', 'family'
  const [selectedGeneration, setSelectedGeneration] = useState(null)
  const [showConnections, setShowConnections] = useState(true)
  const [connectionOpacity, setConnectionOpacity] = useState(80)
  
  const bg = useColorModeValue('gray.50', 'gray.800')
  
  // Process data
  const generations = useMemo(() => {
    const gens = {}
    familyData.forEach(person => {
      if (!gens[person.generation]) {
        gens[person.generation] = []
      }
      gens[person.generation].push(person)
    })
    return gens
  }, [familyData])

  const families = useMemo(() => {
    const fams = {}
    familyData.forEach(person => {
      if (!fams[person.family]) {
        fams[person.family] = []
      }
      fams[person.family].push(person)
    })
    return fams  }, [familyData])
  
  const generationNumbers = Object.keys(generations).map(Number).sort((a, b) => a - b)
  
  const renderTreeView = () => {
    return (
      <EnhancedTreeView 
        familyData={familyData}
        onPersonClick={onPersonClick}
        showConnections={showConnections}
        connectionOpacity={connectionOpacity}
      />
    )
  }

  const renderFamilyView = () => (
    <VStack spacing={6} p={{ base: 4, md: 8 }}>
      <Heading size={{ base: "md", md: "lg" }} textAlign="center" color="blue.600" mb={4}>
        Family Branches
      </Heading>
      <Flex 
        direction={{ base: "column", md: "row" }} 
        wrap="wrap"
        gap={6} 
        w="100%"
        justify="center"
        align="start"
      >
        {Object.entries(families).map(([familyName, familyMembers]) => (
          <Box 
            key={familyName}
            flex={{ base: "1", md: "0 1 calc(50% - 12px)" }}
            minW={{ base: "100%", md: "400px" }}
            maxW={{ base: "100%", md: "600px" }}
          >
            <FamilyBranch
              familyName={familyName}
              members={familyMembers}
              onPersonClick={onPersonClick}
              onFamilyClick={onFamilyClick}
              showStats={true}
            />
          </Box>
        ))}
      </Flex>
    </VStack>
  )

  return (
    <Box h="95vh" position="relative" bg={bg} borderRadius="xl" overflow="hidden">      {/* Enhanced Control Panel */}
      <Box 
        position="absolute" 
        top={4} 
        left={4} 
        zIndex={20} 
        bg="white" 
        p={{ base: 3, md: 4 }} 
        borderRadius="lg" 
        shadow="xl"
        border="1px solid"
        borderColor="gray.200"
        minW={{ base: "240px", md: "280px" }}
        maxW={{ base: "calc(100vw - 32px)", md: "400px" }}
      >
        <VStack spacing={4} align="stretch">
          {/* View Mode Toggle */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.700">
              View Mode
            </Text>
            <ButtonGroup size="sm" isAttached variant="outline" w="100%">
              <Button
                onClick={() => setViewMode('tree')}
                colorScheme={viewMode === 'tree' ? 'blue' : 'gray'}                leftIcon={undefined}
                flex={1}
              >
                🌳 Tree View
              </Button>
              <Button
                onClick={() => setViewMode('family')}
                colorScheme={viewMode === 'family' ? 'blue' : 'gray'}
                flex={1}
              >
                Family View
              </Button>
            </ButtonGroup>
          </Box>

          {/* Tree Settings (only show in tree view) */}
          {viewMode === 'tree' && (
            <>
              <Box>
                <FormControl display="flex" alignItems="center" mb={2}>
                  <FormLabel htmlFor="show-connections" mb="0" fontSize="sm">
                    Show Connections
                  </FormLabel>
                  <Switch 
                    id="show-connections"
                    isChecked={showConnections}
                    onChange={(e) => setShowConnections(e.target.checked)}
                    colorScheme="blue"
                    size="sm"
                  />
                </FormControl>
              </Box>

              <Box>
                <Text fontSize="sm" mb={2} color="gray.700">
                  Connection Opacity: {connectionOpacity}%
                </Text>
                <Slider
                  value={connectionOpacity}
                  onChange={setConnectionOpacity}
                  min={20}
                  max={100}
                  colorScheme="blue"
                  size="sm"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </Box>            </>
          )}
        </VStack>
      </Box>

      {/* Enhanced Zoom Controls */}      <TransformWrapper
        initialScale={0.4}
        minScale={0.1}
        maxScale={3}
        centerOnInit={true}
        wheel={{ 
          wheelDisabled: false,
          step: 0.1
        }}
        panning={{ 
          disabled: false,
          velocityDisabled: true,
          lockAxisX: false,
          lockAxisY: false
        }}
        doubleClick={{ 
          disabled: false,
          mode: "reset"
        }}
        pinch={{ 
          disabled: false,
          step: 5
        }}
        limitToBounds={false}
        centerZoomedOut={false}
        alignmentAnimation={{ 
          disabled: true,
          sizeX: 0,
          sizeY: 0,
          velocityAlignmentTime: 0
        }}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView, zoomToElement }) => (
          <>            <Box 
              position="absolute" 
              top={4} 
              right={4} 
              zIndex={20}
              bg="white" 
              p={{ base: 2, md: 3 }} 
              borderRadius="lg" 
              shadow="xl"
              border="1px solid"
              borderColor="gray.200"
            >              <VStack spacing={2}>
                <Button 
                  size={{ base: "xs", md: "sm" }} 
                  onClick={() => zoomIn(0.3)}
                  colorScheme="blue"
                  variant="outline"
                  w="full"
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  🔍+ Zoom In
                </Button>
                <Button 
                  size={{ base: "xs", md: "sm" }} 
                  onClick={() => zoomOut(0.3)}
                  colorScheme="blue"
                  variant="outline"
                  w="full"
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  🔍- Zoom Out
                </Button>
                <Button 
                  size={{ base: "xs", md: "sm" }} 
                  onClick={() => {
                    resetTransform()
                    setTimeout(() => centerView(0.4), 100)
                  }}
                  colorScheme="gray"
                  variant="outline"
                  w="full"
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  🔄 Reset
                </Button>
                <Button 
                  size={{ base: "xs", md: "sm" }} 
                  onClick={() => centerView(0.6)}
                  colorScheme="green"
                  variant="outline"
                  w="full"
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  🎯 Center
                </Button>
              </VStack>
            </Box>
            
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                cursor: 'grab',
                background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)'
              }}
              contentStyle={{
                width: 'fit-content',
                height: 'fit-content',
                minWidth: '100%',
                minHeight: '100%'
              }}
              wrapperProps={{
                onMouseDown: (e) => {
                  if (e.target === e.currentTarget) {
                    e.currentTarget.style.cursor = 'grabbing'
                  }
                },
                onMouseUp: (e) => {
                  e.currentTarget.style.cursor = 'grab'
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.cursor = 'grab'
                }
              }}
            >
              <Box 
                w="fit-content" 
                h="fit-content"
                position="relative"
                style={{ 
                  cursor: 'inherit',
                  userSelect: 'none'
                }}
              >
                {viewMode === 'tree' ? renderTreeView() : renderFamilyView()}
              </Box>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </Box>
  )
}

export default FamilyTreeView
