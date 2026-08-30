import { createFileRoute } from '@tanstack/react-router'
import { MultiplicativeCipherPage } from '../../components/CipherPages'

export const Route = createFileRoute('/ciphers/multiplicative')({
  component: MultiplicativeCipherPage,
})
