import { createRootRoute } from '@tanstack/react-router'
import { RootLayout } from '../components/RootLayout'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <main>Page not found</main>,
})
