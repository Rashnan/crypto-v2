import { createFileRoute } from '@tanstack/react-router'
import { AffineCipherPage } from '../../components/CipherPages'

export const Route = createFileRoute('/ciphers/affine')({
  component: AffineCipherPage,
})
