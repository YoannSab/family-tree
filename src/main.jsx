import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './i18n/i18n.js'
import { THEME, DATA_SOURCE } from './config/config.js'
import App from './App.jsx'
import LandingPage from './pages/LandingPage.jsx'
import CreateFamilyPage from './pages/CreateFamilyPage.jsx'
import FamilyPage from './pages/FamilyPage.jsx'
import { FAMILY_CONFIG, TARGET_HASH } from './config/config.js'

// Inject ALL THEME values as CSS custom properties so CSS files stay in sync automatically.
// Edit colors only in config.js — CSS uses var(--theme-*) everywhere.
const cssVars = {
  '--theme-primary':         THEME.primary,
  '--theme-primary-dark':    THEME.primaryDark,
  '--theme-primary-darker':  THEME.primaryDarker,
  '--theme-primary-rgb':     THEME.primaryRgb,
  '--theme-accent':          THEME.accent,
  '--theme-accent-dark':     THEME.accentDark,
  '--theme-accent-rgb':      THEME.accentRgb,
  '--theme-bg-page':         THEME.bgPage,
  '--theme-bg-card':         THEME.bgCard,
  '--theme-bg-surface':      THEME.bgSurface,
  '--theme-text-muted':      THEME.textMuted,
  '--theme-text-subtle':     THEME.textSubtle,
  '--theme-flag-left':       THEME.flagLeft,
  '--theme-flag-right':      THEME.flagRight,
};
Object.entries(cssVars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));

const chakraTheme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

// Ignore any stored color mode and always return 'light'
const forceLightManager = {
  type: 'localStorage',
  get: () => 'light',
  set: () => {},
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme={chakraTheme} colorModeManager={forceLightManager}>
      {DATA_SOURCE === 'local' ? (
        // Local mode: single family from public/data/data.json, no router needed
        <App familyConfig={FAMILY_CONFIG} passwordHash={TARGET_HASH} />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/new" element={<CreateFamilyPage />} />
            <Route path="/f/:familyId" element={<FamilyPage />} />
          </Routes>
        </BrowserRouter>
      )}
    </ChakraProvider>
  </StrictMode>,
)
