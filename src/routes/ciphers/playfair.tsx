import { createFileRoute } from '@tanstack/react-router'
import { PlayfairCipherPage } from '../../components/ClassicalCipherPages'
export const Route = createFileRoute('/ciphers/playfair')({ component: PlayfairCipherPage })
