import { useState } from 'react'
import { Box, Button, Field, Flex, Grid, Input, SimpleGrid, Text } from '@chakra-ui/react'
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react'
import { AppPage } from './AppPage'
import { CalculationSteps } from './CalculationSteps'
import { ParticipantKeys } from './ParticipantKeys'
import { ErrorNote, SectionHeading } from './BlockCipherUi'
import { diffieHellmanDetail, type DiffieHellmanResult } from '../lib/diffie-hellman'
import { attemptCalculation } from '../lib/calculation'
import type { CalculationStep } from '../lib/asymmetric'

const example = { p: '23', g: '5', a: '6', b: '15' }
type InputName = keyof typeof example

function parseInteger(raw: string): number {
  return /^\d+$/.test(raw.trim()) && Number.isSafeInteger(Number(raw)) ? Number(raw) : NaN
}

function KeyExchangeDiagram({ result }: { result: DiffieHellmanResult }) {
  return (
    <Box role="figure" aria-label="Diffie–Hellman key exchange diagram between Alice and Bob" p={{ base: '16px', md: '20px' }} borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
      <Box p="12px 16px" bg="var(--accent-bg)" borderRadius="8px" textAlign="center">
        <Text fontWeight="semibold" color="var(--accent)">Agreed public parameters</Text>
        <Text mt="4px" fontFamily="mono">p = {result.p}, g = {result.g}</Text>
      </Box>
      <Grid mt="20px" templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) minmax(160px, 0.7fr) minmax(0, 1fr)' }} gap="16px" alignItems="stretch">
        <Box p="16px" borderWidth="1px" borderColor="var(--border)" borderRadius="10px">
          <Text fontWeight="semibold" color="var(--accent)">Alice</Text>
          <Text mt="8px" fontSize="sm">Keeps private: a = {result.alice.privateKey}</Text>
          <Text mt="8px" fontSize="sm">Publishes: A = {result.alice.publicKey}</Text>
          <Text mt="8px" fontSize="sm">Receives Bob’s B = {result.bob.publicKey}</Text>
          <Text mt="8px" fontFamily="mono" fontSize="sm" overflowWrap="anywhere">K_A = B^a mod p = {result.alice.sharedSecret}</Text>
        </Box>
        <Flex direction="column" gap="16px" justify="center" p="12px" textAlign="center" bg="var(--accent-bg)" borderRadius="10px">
          <Text fontSize="sm" fontWeight="semibold" color="var(--accent)">Public exchange</Text>
          <Box>
            <Text fontSize="sm">Alice sends A = {result.alice.publicKey} to Bob</Text>
            <Flex justify="center" mt="4px" color="var(--accent)" aria-hidden="true"><ArrowRight size={28} /></Flex>
          </Box>
          <Box>
            <Text fontSize="sm">Bob sends B = {result.bob.publicKey} to Alice</Text>
            <Flex justify="center" mt="4px" color="var(--accent)" aria-hidden="true"><ArrowLeft size={28} /></Flex>
          </Box>
          <Text fontSize="xs" color="var(--text)">a, b, and K are never sent.</Text>
        </Flex>
        <Box p="16px" borderWidth="1px" borderColor="var(--border)" borderRadius="10px">
          <Text fontWeight="semibold" color="var(--accent)">Bob</Text>
          <Text mt="8px" fontSize="sm">Keeps private: b = {result.bob.privateKey}</Text>
          <Text mt="8px" fontSize="sm">Publishes: B = {result.bob.publicKey}</Text>
          <Text mt="8px" fontSize="sm">Receives Alice’s A = {result.alice.publicKey}</Text>
          <Text mt="8px" fontFamily="mono" fontSize="sm" overflowWrap="anywhere">K_B = A^b mod p = {result.bob.sharedSecret}</Text>
        </Box>
      </Grid>
      <Flex mt="16px" gap="8px" align="center" justify="center" color="var(--accent)">
        <LockKeyhole size={18} aria-hidden="true" />
        <Text fontWeight="semibold">Both compute K = {result.sharedSecret} locally</Text>
      </Flex>
    </Box>
  )
}

function DiffieHellmanWorkings({ steps }: { steps: CalculationStep[] }) {
  const numbered = steps.map((step, index) => ({ ...step, number: index + 1 }))
  const phases = [
    { id: 'parameters', title: 'Agree on public parameters' },
    { id: 'keys', title: 'Generate each person’s keys' },
    { id: 'exchange', title: 'Exchange public keys' },
    { id: 'shared-secret', title: 'Compute the shared secret on each side' },
    { id: 'verification', title: 'Verify that both sides agree' },
  ]
  return (
    <Flex direction="column" gap="28px">
      {phases.map((phase) => (
        <Box as="section" aria-label={phase.title} key={phase.id}>
          <Text as="h3" mb="14px" fontSize="md" fontWeight="semibold">{phase.title}</Text>
          {phase.id === 'keys' || phase.id === 'shared-secret' ? (
            <SimpleGrid columns={{ base: 1, xl: 2 }} gap="16px" alignItems="start">
              {(['Alice', 'Bob'] as const).map((owner) => (
                <Box as="section" key={owner} aria-label={`${owner}'s ${phase.id} working`} minW="0" p={{ base: '10px', md: '14px' }} borderWidth="1px" borderColor="var(--border)" borderTopWidth="3px" borderTopColor="var(--accent)" borderRadius="12px">
                  <Text as="h4" mb="12px" color="var(--accent)" fontWeight="semibold">{owner}'s working</Text>
                  <CalculationSteps steps={numbered.filter((step) => step.phase === phase.id && step.actor === owner)} />
                </Box>
              ))}
            </SimpleGrid>
          ) : <CalculationSteps steps={numbered.filter((step) => step.phase === phase.id)} />}
        </Box>
      ))}
    </Flex>
  )
}

export function DiffieHellmanPage() {
  const [inputs, setInputs] = useState(example)
  const { result, error } = attemptCalculation(() => diffieHellmanDetail({
    p: parseInteger(inputs.p), g: parseInteger(inputs.g), a: parseInteger(inputs.a), b: parseInteger(inputs.b),
  }))
  const groups: { title: string; hint: string; fields: { name: InputName; label: string }[] }[] = [
    { title: 'Public parameters', hint: 'Alice and Bob agree on these values. p must be prime and g a primitive root modulo p.', fields: [{ name: 'p', label: 'Prime p' }, { name: 'g', label: 'Generator g' }] },
    { title: 'Alice’s private input', hint: 'Alice chooses a and keeps it secret. Bob does not receive this value.', fields: [{ name: 'a', label: 'Alice’s private exponent a' }] },
    { title: 'Bob’s private input', hint: 'Bob chooses b and keeps it secret. Alice does not receive this value.', fields: [{ name: 'b', label: 'Bob’s private exponent b' }] },
  ]
  return (
    <AppPage title="Diffie–Hellman key exchange" description="Alice and Bob exchange public values, then each uses their own private exponent to compute the same shared secret.">
      <Text mt="12px" fontSize="sm" color="var(--text)">Diffie–Hellman establishes a shared secret for later encryption. A key derivation function turns that secret into an encryption key. This calculator uses teaching parameters, with primes up to 1,000,000.</Text>
      <Button mt="20px" size="sm" variant="ghost" color="var(--accent)" onClick={() => setInputs({ ...example })}>Load example</Button>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px" mt="20px">
      {groups.map((group, index) => (
        <Box key={group.title} gridColumn={index === 0 ? '1 / -1' : undefined} p="16px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
          <Text fontWeight="semibold">{group.title}</Text>
          <Text mt="4px" fontSize="sm" color="var(--text)">{group.hint}</Text>
          <Flex mt="12px" gap="16px" flexWrap="wrap">
            {group.fields.map(({ name, label }) => (
              <Field.Root key={name} maxW="240px" invalid={!Number.isSafeInteger(parseInteger(inputs[name]))}>
                <Field.Label>{label}</Field.Label>
                <Input mt="6px" inputMode="numeric" fontFamily="mono" value={inputs[name]} onChange={(event) => setInputs({ ...inputs, [name]: event.target.value })} />
              </Field.Root>
            ))}
          </Flex>
        </Box>
      ))}
      </SimpleGrid>
      {error && <ErrorNote message={error} />}
      {result && (
        <>
          <SectionHeading>Each person’s keys and shared secret</SectionHeading>
          <ParticipantKeys participants={result.participants} />
          <Box mt="16px" p="16px 20px" bg="var(--accent-bg)" borderRadius="12px" aria-live="polite">
            <Text fontSize="sm" color="var(--text)">Shared secret, computed independently by both people</Text>
            <Text mt="4px" fontFamily="mono" fontSize="xl" fontWeight="bold" color="var(--accent)">K_A = K_B = {result.sharedSecret}</Text>
          </Box>
          <SectionHeading>How the key exchange works</SectionHeading>
          <KeyExchangeDiagram result={result} />
          <SectionHeading>Step-by-step working</SectionHeading>
          <DiffieHellmanWorkings steps={result.steps} />
        </>
      )}
    </AppPage>
  )
}
