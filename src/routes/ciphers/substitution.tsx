import { createFileRoute } from '@tanstack/react-router'
import { SubstitutionCipherPage } from '../../components/ClassicalCipherPages'
export const Route = createFileRoute('/ciphers/substitution')({ component: SubstitutionCipherPage })
