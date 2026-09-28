import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AesRoundSearchPage } from '../../components/AesPages'

export const Route = createFileRoute('/modern/aes-round')({
  validateSearch: z.object({
    block: z.string().optional(),
    key: z.string().optional(),
    round: z.coerce.number().int().min(0).max(10).optional(),
    mode: z.enum(['encrypt', 'decrypt']).optional(),
  }),
  component: AesRoundSearchPage,
})
