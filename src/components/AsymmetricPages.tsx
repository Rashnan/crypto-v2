import { useState } from 'react'
import { Box, Button, Field, Flex, Input, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { AppPage } from './AppPage'
import { AsymmetricDiagram } from './AsymmetricDiagram'
import { CalculationSteps } from './CalculationSteps'
import { ParticipantKeys } from './ParticipantKeys'
import { attemptCalculation } from '../lib/calculation'
import { ErrorNote, SectionHeading } from './BlockCipherUi'
import { elGamalDetail, rabinDetail, rsaDetail, type AsymmetricMode, type AsymmetricResult } from '../lib/asymmetric'

type Algorithm = 'rsa' | 'elgamal' | 'rabin'
type InputName = 'p' | 'q' | 'e' | 'g' | 'x' | 'k' | 'value' | 'c1'

const definitions = {
  rsa: {
    title: 'RSA',
    description: 'Generate an RSA key pair and follow modular exponentiation for encryption or decryption.',
    defaults: { p: '61', q: '53', e: '17', g: '', x: '', k: '', value: '65', c1: '' },
    cipher: '2790',
  },
  elgamal: {
    title: 'ElGamal',
    description: 'Generate an ElGamal key pair over a prime field and follow both ciphertext components.',
    defaults: { p: '23', q: '', e: '', g: '5', x: '6', k: '10', value: '15', c1: '9' },
    cipher: '22',
  },
  rabin: {
    title: 'Rabin',
    description: 'Encrypt by squaring modulo n and recover the possible plaintexts with the Chinese Remainder Theorem.',
    defaults: { p: '7', q: '11', e: '', g: '', x: '', k: '', value: '20', c1: '' },
    cipher: '15',
  },
}

function parseInteger(raw: string): number {
  return /^\d+$/.test(raw.trim()) && Number.isSafeInteger(Number(raw)) ? Number(raw) : NaN
}

function Calculation({ result, algorithm }: { result: AsymmetricResult; algorithm: string }) {
  return (
    <>
      <SectionHeading>Alice’s side and Bob’s side</SectionHeading>
      <ParticipantKeys participants={result.participants} />
      <Box mt="16px" p="16px 20px" borderRadius="12px" bg="var(--accent-bg)" aria-live="polite">
        <Text fontSize="sm" color="var(--text)">{result.outputLabel}</Text>
        <Text mt="4px" fontFamily="mono" fontSize="xl" fontWeight="bold" color="var(--accent)" overflowWrap="anywhere">
          {result.output.length > 1 ? `(${result.output.join(', ')})` : result.output[0]}
        </Text>
      </Box>
      <SectionHeading>How the message travels</SectionHeading>
      <AsymmetricDiagram algorithm={algorithm} publicKey={result.publicKey} exchange={result.exchange} />
      <SectionHeading>Step-by-step working</SectionHeading>
      <CalculationSteps steps={result.steps} separateActors />
    </>
  )
}

export function AsymmetricPage({ algorithm }: { algorithm: Algorithm }) {
  const definition = definitions[algorithm]
  const [inputs, setInputs] = useState(definition.defaults)
  const [mode, setMode] = useState<AsymmetricMode>('encrypt')
  const fields: { name: InputName; label: string }[] = algorithm === 'elgamal'
    ? [{ name: 'p', label: 'Bob’s prime p' }, { name: 'g', label: 'Public generator g' }, { name: 'x', label: 'Bob’s private key x' }, ...(mode === 'encrypt' ? [{ name: 'k' as const, label: 'Alice’s secret exponent k' }] : [{ name: 'c1' as const, label: 'Received ciphertext c₁' }])]
    : [{ name: 'p', label: 'Bob’s prime p' }, { name: 'q', label: 'Bob’s prime q' }, ...(algorithm === 'rsa' ? [{ name: 'e' as const, label: 'Bob’s public exponent e' }] : [])]
  fields.push({ name: 'value', label: mode === 'encrypt' ? 'Alice’s message m' : algorithm === 'elgamal' ? 'Received ciphertext c₂' : 'Received ciphertext c' })

  const { result, error } = attemptCalculation(() => {
    const common = { p: parseInteger(inputs.p), value: parseInteger(inputs.value), mode }
    if (algorithm === 'rsa') return rsaDetail({ ...common, q: parseInteger(inputs.q), e: parseInteger(inputs.e) })
    if (algorithm === 'rabin') return rabinDetail({ ...common, q: parseInteger(inputs.q) })
    return elGamalDetail({ ...common, g: parseInteger(inputs.g), x: parseInteger(inputs.x), k: parseInteger(inputs.k), c1: parseInteger(inputs.c1) })
  })

  function changeMode(next: AsymmetricMode) {
    if (next === mode) return
    setMode(next)
    const output = result?.output
    setInputs((current) => ({
      ...current,
      value: output && (next === 'decrypt' || output.length === 1) ? String(output[algorithm === 'elgamal' && next === 'decrypt' ? 1 : 0]) : '',
      c1: next === 'decrypt' && algorithm === 'elgamal' && output ? String(output[0]) : current.c1,
    }))
  }

  function loadExample() {
    setInputs({ ...definition.defaults, value: mode === 'encrypt' ? definition.defaults.value : definition.cipher })
  }

  return (
    <AppPage title={definition.title} description={definition.description}>
      <Text mt="12px" fontSize="sm" color="var(--text)">Textbook integer calculations for learning, without message encoding or padding. Prime inputs are limited to 1,000,000.</Text>
      {algorithm === 'elgamal' && <Text mt="8px" fontSize="sm" color="var(--text)">Use a fresh k for each encryption. Messages are nonzero elements of the prime field.</Text>}
      {algorithm === 'rabin' && <Text mt="8px" fontSize="sm" color="var(--text)">Use distinct primes p ≡ q ≡ 3 (mod 4). Decryption usually gives four candidates; additional message encoding is needed to identify the original. <Link to="/basic/crt" style={{ color: 'var(--accent)' }}>Explore CRT</Link>.</Text>}
      <Box mt="20px" p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
        <Text fontWeight="semibold" color="var(--text-h)">Alice sends a message to Bob</Text>
        <Text mt="6px" fontSize="sm" color="var(--text)">Bob creates and owns both keys. Alice encrypts with Bob’s public key, then Bob decrypts with his private key. Alice does not need her own key pair for this one-way exchange.</Text>
        <Text mt="6px" fontSize="sm" color="var(--text)">The calculator shows Bob’s secret inputs to explain key generation. Alice only needs his public key to send the message.</Text>
      </Box>
      <Flex mt="24px" gap="8px" flexWrap="wrap">
        {(['encrypt', 'decrypt'] as const).map((value) => (
          <Button key={value} size="sm" variant={mode === value ? 'solid' : 'outline'} bg={mode === value ? 'var(--accent)' : undefined} color={mode === value ? 'white' : 'var(--text)'} aria-pressed={mode === value} onClick={() => changeMode(value)}>
            {value === 'encrypt' ? 'Alice encrypts' : 'Bob decrypts'}
          </Button>
        ))}
        <Button size="sm" variant="ghost" color="var(--accent)" onClick={loadExample}>Load example</Button>
      </Flex>
      {[
        { title: 'Bob’s key setup', hint: 'Bob prepares these values. The derived public key is shared with Alice.', fields: fields.filter(({ name }) => !['value', 'k', 'c1'].includes(name)) },
        { title: mode === 'encrypt' ? 'Alice prepares her message' : 'Bob receives the ciphertext', hint: mode === 'encrypt' ? 'Alice uses Bob’s public key. The working below also shows how Bob receives and decrypts her message.' : 'Enter what Alice sent. Bob uses his private key to recover the message.', fields: fields.filter(({ name }) => ['value', 'k', 'c1'].includes(name)) },
      ].map((group) => (
        <Box key={group.title} mt="24px">
          <Text fontWeight="semibold" color="var(--text-h)">{group.title}</Text>
          <Text mt="4px" fontSize="sm" color="var(--text)">{group.hint}</Text>
          <Flex mt="12px" gap="16px" flexWrap="wrap" align="flex-end">
            {group.fields.map(({ name, label }) => (
              <Field.Root key={name} maxW="210px" invalid={!Number.isSafeInteger(parseInteger(inputs[name]))}>
                <Field.Label>{label}</Field.Label>
                <Input mt="6px" inputMode="numeric" fontFamily="mono" value={inputs[name]} onChange={(event) => setInputs({ ...inputs, [name]: event.target.value })} />
              </Field.Root>
            ))}
          </Flex>
        </Box>
      ))}
      {error && <ErrorNote message={error} />}
      {result && <Calculation result={result} algorithm={definition.title} />}
    </AppPage>
  )
}
