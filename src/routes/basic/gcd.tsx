import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { GcdPage } from '../../components/GcdPage'

const gcdSearchSchema = z.object({
  a: z.string().optional(),
  b: z.string().optional(),
})

export const Route = createFileRoute('/basic/gcd')({
  validateSearch: gcdSearchSchema,
  component: GcdPage,
})
