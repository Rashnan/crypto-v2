import { createFileRoute } from '@tanstack/react-router'
import { MatrixInversePage } from '../../components/MatrixInversePage'

export const Route = createFileRoute('/modular/matrix-inverse')({
  component: MatrixInversePage,
})
