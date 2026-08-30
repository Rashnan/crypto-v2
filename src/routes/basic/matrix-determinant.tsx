import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MatrixDeterminantSearchPage } from '../../components/MatrixDeterminantPage'

export const Route = createFileRoute('/basic/matrix-determinant')({
  validateSearch: z.object({
    m: z.coerce.number().int().min(2).optional(),
    size: z.coerce.number().int().min(2).max(4).optional(),
    entries: z.string().optional(),
  }),
  component: MatrixDeterminantSearchPage,
})
