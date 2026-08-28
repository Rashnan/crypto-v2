import { createFileRoute } from '@tanstack/react-router'
import { MultiplicativeInversePage } from '../../components/MultiplicativeInversePage'

export const Route = createFileRoute('/modular/multiplicative-inverse')({
  component: MultiplicativeInversePage,
})
