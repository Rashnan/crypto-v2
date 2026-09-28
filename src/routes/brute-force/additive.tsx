import { createFileRoute } from '@tanstack/react-router'
import { AdditiveBruteForcePage } from '../../components/BruteForcePages'

export const Route = createFileRoute('/brute-force/additive')({
  component: AdditiveBruteForcePage,
})
