import { createFileRoute } from '@tanstack/react-router'
import { AesEncryptPage } from '../../components/AesPages'

export const Route = createFileRoute('/modern/aes-encrypt')({
  component: AesEncryptPage,
})
