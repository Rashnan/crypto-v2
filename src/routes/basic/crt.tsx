import { createFileRoute } from '@tanstack/react-router'
import { SimultaneousPage } from '../../components/SimultaneousPage'

export const Route = createFileRoute('/basic/crt')({
  component: () => <SimultaneousPage title="Chinese Remainder Theorem (CRT)" />,
})
