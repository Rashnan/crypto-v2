import { createFileRoute } from '@tanstack/react-router'
import { AesRoundPage } from '../../components/AesPages'

export const Route = createFileRoute('/modern/aes-round')({
  component: AesRoundPage,
})
