import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/basic/gcd')({
  validateSearch: (search: Record<string, unknown>) => ({
    a: typeof search.a === 'string' ? search.a : undefined,
    b: typeof search.b === 'string' ? search.b : undefined,
  }),
  component: GcdPage,
})

import { GcdPage } from '../../components/GcdPage'
