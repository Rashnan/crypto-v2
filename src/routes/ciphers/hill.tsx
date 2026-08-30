import { createFileRoute } from '@tanstack/react-router'
import { HillCipherPage } from '../../components/ClassicalCipherPages'
export const Route = createFileRoute('/ciphers/hill')({ component: HillCipherPage })
