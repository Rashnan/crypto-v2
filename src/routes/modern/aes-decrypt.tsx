import { createFileRoute } from '@tanstack/react-router'
import { AesDecryptPage } from '../../components/AesPages'

export const Route = createFileRoute('/modern/aes-decrypt')({
  component: AesDecryptPage,
})
