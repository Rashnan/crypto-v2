import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import './index.css'
import { router } from './router'
import { AccentThemeProvider } from './theme/AccentThemeProvider'
import { AuthProvider } from './auth/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <AccentThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AccentThemeProvider>
    </ChakraProvider>
  </StrictMode>,
)
