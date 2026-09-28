import { createFileRoute } from '@tanstack/react-router'
import { DesKeyPage } from '../../components/DesPages'

export const Route = createFileRoute('/modern/des-key')({
  component: DesKeyPage,
})
