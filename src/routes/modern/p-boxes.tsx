import { createFileRoute } from '@tanstack/react-router'
import { PBoxPage } from '../../components/BlockCipherPages'

export const Route = createFileRoute('/modern/p-boxes')({
  component: PBoxPage,
})
