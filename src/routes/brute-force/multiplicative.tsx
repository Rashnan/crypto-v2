import { createFileRoute } from '@tanstack/react-router'
import { MultiplicativeBruteForcePage } from '../../components/BruteForcePages'

export const Route = createFileRoute('/brute-force/multiplicative')({
  component: MultiplicativeBruteForcePage,
})
