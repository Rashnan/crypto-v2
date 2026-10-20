import { useState } from 'react'
import { Box, Button, Field, Flex, Input, SimpleGrid, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { AppPage } from './AppPage'
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

function Calculation({ result }: { result: AsymmetricResult }) {
  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="12px" mt="24px">
        {[['Public key', result.publicKey], ['Private key', result.privateKey]].map(([label, value]) => (
          <Box key={label} p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
            <Text fontSize="sm" color="var(--text)">{label}</Text>
            <Text mt="6px" fontFamily="mono" color="var(--text-h)" overflowWrap="anywhere">{value}</Text>
          </Box>
        ))}
      </SimpleGrid>
      <Box mt="16px" p="16px 20px" borderRadius="12px" bg="var(--accent-bg)" aria-live="polite">
        <Text fontSize="sm" color="var(--text)">{result.outputLabel}</Text>
        <Text mt="4px" fontFamily="mono" fontSize="xl" fontWeight="bold" color="var(--accent)" overflowWrap="anywhere">
          {result.output.length > 1 ? `(${result.output.join(', ')})` : result.output[0]}
        </Text>
      </Box>
      <SectionHeading>Working</SectionHeading>
      <Flex direction="column" gap="12px">
        {result.steps.map((step, index) => (
          <Box key={index} p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
            <Text fontWeight="semibold" color="var(--text-h)">{step.label}</Text>
            {step.equations.map((equation, i) => <Text key={i} mt="8px" fontFamily="mono" fontSize="sm" color="var(--text)" overflowWrap="anywhere">{equation}</Text>)}
          </Box>
        ))}
      </Flex>
    </>
  )
}

export function AsymmetricPage({ algorithm }: { algorithm: Algorithm }) {
  const definition = definitions[algorithm]
  const [inputs, setInputs] = useState(definition.defaults)
  const [mode, setMode] = useState<AsymmetricMode>('encrypt')
  const fields: { name: InputName; label: string }[] = algorithm === 'elgamal'
    ? [{ name: 'p', label: 'Prime p' }, { name: 'g', label: 'Generator g' }, { name: 'x', label: 'Private key x' }, ...(mode === 'encrypt' ? [{ name: 'k' as const, label: 'Ephemeral exponent k' }] : [{ name: 'c1' as const, label: 'Ciphertext c₁' }])]
    : [{ name: 'p', label: 'Prime p' }, { name: 'q', label: 'Prime q' }, ...(algorithm === 'rsa' ? [{ name: 'e' as const, label: 'Public exponent e' }] : [])]
  fields.push({ name: 'value', label: mode === 'encrypt' ? 'Message m' : algorithm === 'elgamal' ? 'Ciphertext c₂' : 'Ciphertext c' })

  let result: AsymmetricResult | null = null
  let error = ''
  try {
    const common = { p: parseInteger(inputs.p), value: parseInteger(inputs.value), mode }
    if (algorithm === 'rsa') result = rsaDetail({ ...common, q: parseInteger(inputs.q), e: parseInteger(inputs.e) })
    else if (algorithm === 'rabin') result = rabinDetail({ ...common, q: parseInteger(inputs.q) })
    else result = elGamalDetail({ ...common, g: parseInteger(inputs.g), x: parseInteger(inputs.x), k: parseInteger(inputs.k), c1: parseInteger(inputs.c1) })
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Unable to calculate.'
  }

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
      <Flex mt="24px" gap="8px" flexWrap="wrap">
        {(['encrypt', 'decrypt'] as const).map((value) => (
          <Button key={value} size="sm" variant={mode === value ? 'solid' : 'outline'} bg={mode === value ? 'var(--accent)' : undefined} color={mode === value ? 'white' : 'var(--text)'} aria-pressed={mode === value} onClick={() => changeMode(value)}>
            {value === 'encrypt' ? 'Encrypt' : 'Decrypt'}
          </Button>
        ))}
        <Button size="sm" variant="ghost" color="var(--accent)" onClick={loadExample}>Load example</Button>
      </Flex>
      <Flex mt="20px" gap="16px" flexWrap="wrap" align="flex-end">
        {fields.map(({ name, label }) => (
          <Field.Root key={name} maxW="210px" invalid={!Number.isSafeInteger(parseInteger(inputs[name]))}>
            <Field.Label>{label}</Field.Label>
            <Input mt="6px" inputMode="numeric" fontFamily="mono" value={inputs[name]} onChange={(event) => setInputs({ ...inputs, [name]: event.target.value })} />
          </Field.Root>
        ))}
      </Flex>
      {error && <ErrorNote message={error} />}
      {result && <Calculation result={result} />}
    </AppPage>
  )
}
