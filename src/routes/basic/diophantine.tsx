import { createFileRoute } from '@tanstack/react-router'
import { DiophantinePage } from '../../components/DiophantinePage'

export const Route = createFileRoute('/basic/diophantine')({
  component: DiophantinePage,
})
