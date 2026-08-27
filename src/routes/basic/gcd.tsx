import { createFileRoute } from '@tanstack/react-router'
import { GcdPage } from '../../components/GcdPage'

export const Route = createFileRoute('/basic/gcd')({
  component: GcdPage,
})
