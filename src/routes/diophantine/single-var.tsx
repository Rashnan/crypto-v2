import { createFileRoute } from '@tanstack/react-router'
import { SingleVariablePage } from '../../components/SingleVariablePage'

export const Route = createFileRoute('/diophantine/single-var')({
  component: SingleVariablePage,
})
