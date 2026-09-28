import { createFileRoute } from '@tanstack/react-router'
import { SBoxPage } from '../../components/BlockCipherPages'

export const Route = createFileRoute('/modern/s-boxes')({
  component: SBoxPage,
})
