import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  colors: {
    brand: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
    family: {
      primary: '#2B6CB0',
      secondary: '#3182CE',
      accent: '#4299E1',
      background: '#F7FAFC',
      text: '#2D3748',
      deceased: '#E2E8F0',
    }
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          shadow: 'lg',
          _hover: {
            shadow: 'xl',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'family.background',
        color: 'family.text',
      },
    },
  },
})

export default theme
