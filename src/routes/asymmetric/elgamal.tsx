import { createFileRoute } from '@tanstack/react-router'
import { AsymmetricPage } from '../../components/AsymmetricPages'

export const Route = createFileRoute('/asymmetric/elgamal')({
  component: () => <AsymmetricPage key="elgamal" algorithm="elgamal" />,
})
