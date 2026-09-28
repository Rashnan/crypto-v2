import { createFileRoute } from '@tanstack/react-router'
import { AesKeyPage } from '../../components/AesPages'

export const Route = createFileRoute('/modern/aes-key')({
  component: AesKeyPage,
})
