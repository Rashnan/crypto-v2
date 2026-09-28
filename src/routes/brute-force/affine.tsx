import { createFileRoute } from '@tanstack/react-router'
import { AffineBruteForcePage } from '../../components/BruteForcePages'

export const Route = createFileRoute('/brute-force/affine')({
  component: AffineBruteForcePage,
})
