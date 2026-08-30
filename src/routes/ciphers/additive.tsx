import { createFileRoute } from '@tanstack/react-router'
import { AdditiveCipherPage } from '../../components/CipherPages'

export const Route = createFileRoute('/ciphers/additive')({
  component: AdditiveCipherPage,
})
