import { createFileRoute } from '@tanstack/react-router'
import { DesEncryptPage } from '../../components/DesPages'

export const Route = createFileRoute('/modern/des-encrypt')({
  component: DesEncryptPage,
})
