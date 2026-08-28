import { createFileRoute } from '@tanstack/react-router'
import { SimultaneousPage } from '../../components/SimultaneousPage'

export const Route = createFileRoute('/diophantine/simultaneous')({
  component: SimultaneousPage,
})
