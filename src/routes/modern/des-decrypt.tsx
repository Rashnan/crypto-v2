import { createFileRoute } from '@tanstack/react-router'
import { DesDecryptPage } from '../../components/DesPages'

export const Route = createFileRoute('/modern/des-decrypt')({
  component: DesDecryptPage,
})
