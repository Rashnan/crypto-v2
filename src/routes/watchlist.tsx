import { createFileRoute } from '@tanstack/react-router'
import { AppPage } from '../components/AppPage'

export const Route = createFileRoute('/watchlist')({
  component: () => (
    <AppPage
      title="Watchlist"
      description="Keep the assets you follow in one place."
    />
  ),
})
