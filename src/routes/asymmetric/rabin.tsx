import { createFileRoute } from '@tanstack/react-router'
import { AsymmetricPage } from '../../components/AsymmetricPages'

export const Route = createFileRoute('/asymmetric/rabin')({
  component: () => <AsymmetricPage key="rabin" algorithm="rabin" />,
})
