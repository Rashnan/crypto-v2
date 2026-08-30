import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MatrixInverseSearchPage } from '../../components/MatrixInversePage'

export const Route = createFileRoute('/modular/matrix-inverse')({
  validateSearch: z.object({
    m: z.coerce.number().int().min(2).optional(),
    size: z.coerce.number().int().min(2).max(3).optional(),
    entries: z.string().optional(),
  }),
  component: MatrixInverseSearchPage,
})
