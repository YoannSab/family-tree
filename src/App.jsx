import './App.css'
import FamilyTree from './components/FamilyTree.jsx'
import { Flex } from '@chakra-ui/react'

export default function App() {
  return (
    <>
    <h1>Family Chart</h1>
    <p>Resize the window to see the responsive design in action.</p>
    <p>Click and drag to navigate the family tree.</p>
    <p>Use pinch-to-zoom on mobile devices.</p>
    <p>Double-click to zoom in on a node.</p>
    <p>Right-click to reset the view.</p>
    <p>Use the scroll wheel to zoom in and out.</p>
    <p>Click on a node to see more details.</p>
    <Flex flexDirection={{ base: 'column', lg: 'row' }} justifyContent="center" alignItems="center" gap={4} p={4}>
      <FamilyTree />
      <div>
        <p>Family Tree Visualization</p>
        <p>Developed with React and Family Chart Library</p>
        <p>Responsive design for both desktop and mobile devices</p>
        <p>Interactive features for an engaging user experience</p>
      </div>

    </Flex>
    </>
  );
}


