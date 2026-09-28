import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { DesRoundSearchPage } from '../../components/DesPages'

export const Route = createFileRoute('/modern/des-round')({
  validateSearch: z.object({
    block: z.string().optional(),
    key: z.string().optional(),
    round: z.coerce.number().int().min(1).max(16).optional(),
    mode: z.enum(['encrypt', 'decrypt']).optional(),
  }),
  component: DesRoundSearchPage,
})
