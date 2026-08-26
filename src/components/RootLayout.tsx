import { Box, Grid } from '@chakra-ui/react'
import { Navigate, Outlet, useLocation } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../auth/auth'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function RootLayout() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.matchMedia('(min-width: 721px)').matches,
  )

  if (location.pathname === '/login') {
    return <Outlet />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return (
    <Grid
      minH="100svh"
      bg="var(--bg)"
      templateColumns={{
        base: sidebarOpen ? '240px minmax(0, 1fr)' : '64px minmax(0, 1fr)',
        md: sidebarOpen ? '240px minmax(0, 1fr)' : '72px minmax(0, 1fr)',
      }}
      transition="grid-template-columns 180ms ease"
    >
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
      />

      <Box minW="0" gridColumn="2">
        <Navbar />
        <Box
          as="main"
          w="1126px"
          maxW="100%"
          minH="calc(100svh - 64px)"
          mx="auto"
          display="flex"
          flexDirection="column"
          borderInlineWidth={{ base: '0', lg: '1px' }}
          borderColor="var(--border)"
          textAlign="center"
        >
          <Outlet />
        </Box>
      </Box>
    </Grid>
  )
}
