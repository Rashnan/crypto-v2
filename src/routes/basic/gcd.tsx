import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { GcdPage } from '../../components/GcdPage'

export const Route = createFileRoute('/basic/gcd')({
  validateSearch: z.object({
    a: z.coerce.number().int().optional(),
    b: z.coerce.number().int().optional(),
  }),
  component: GcdPage,
})
