import { createFileRoute } from '@tanstack/react-router'
import { AppPage } from '../components/AppPage'

export const Route = createFileRoute('/markets')({
  component: () => (
    <AppPage
      title="Markets"
      description="Track prices, market caps, and daily movement."
    />
  ),
})
