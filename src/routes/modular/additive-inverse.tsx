import { createFileRoute } from '@tanstack/react-router'
import { AdditiveInversePage } from '../../components/AdditiveInversePage'

export const Route = createFileRoute('/modular/additive-inverse')({
  component: AdditiveInversePage,
})
