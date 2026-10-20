import { createFileRoute } from '@tanstack/react-router'
import { AsymmetricPage } from '../../components/AsymmetricPages'

export const Route = createFileRoute('/asymmetric/rsa')({
  component: () => <AsymmetricPage key="rsa" algorithm="rsa" />,
})
