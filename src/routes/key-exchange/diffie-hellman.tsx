import { createFileRoute } from '@tanstack/react-router'
import { DiffieHellmanPage } from '../../components/DiffieHellmanPage'

export const Route = createFileRoute('/key-exchange/diffie-hellman')({
  component: DiffieHellmanPage,
})
