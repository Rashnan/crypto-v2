import { createFileRoute } from '@tanstack/react-router'
import { AutokeyCipherPage } from '../../components/ClassicalCipherPages'
export const Route = createFileRoute('/ciphers/autokey')({ component: AutokeyCipherPage })
