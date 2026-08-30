import { createFileRoute } from '@tanstack/react-router'
import { VigenereCipherPage } from '../../components/ClassicalCipherPages'
export const Route = createFileRoute('/ciphers/vigenere')({ component: VigenereCipherPage })
