import { createFileRoute } from '@tanstack/react-router'
import { LfsrPage } from '../../components/BlockCipherPages'

export const Route = createFileRoute('/modern/lfsr')({
  component: LfsrPage,
})
