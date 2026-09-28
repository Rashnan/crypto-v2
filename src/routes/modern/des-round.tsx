import { createFileRoute } from '@tanstack/react-router'
import { DesRoundPage } from '../../components/DesPages'

export const Route = createFileRoute('/modern/des-round')({
  component: DesRoundPage,
})
