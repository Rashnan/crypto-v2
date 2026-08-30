import { useState, type ReactNode } from 'react'
import { Box, Button, Field, Flex, Heading, Input, Table, Text, Textarea } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import {
  additiveCipherResult,
  affineCipherResult,
  multiplicativeCipherResult,
  type CipherMode,
  type CipherStep,
} from '../lib/ciphers'
import { gcd, mod, multiplicativeInverse } from '../lib/modular'

interface CipherShellProps {
  title: string
  description: string
  formula: string
  children: ReactNode
  input: string
  output: string
  steps: CipherStep[]
  mode: CipherMode
  error?: string
  inverseNote?: ReactNode
  gcdCheck?: ReactNode
  onInputChange: (value: string) => void
  onModeChange: (mode: CipherMode) => void
}

function CipherShell({
  title,
  description,
  formula,
  children,
  input,
  output,
  steps,
  mode,
  error,
  inverseNote,
  gcdCheck,
  onInputChange,
  onModeChange,
}: CipherShellProps) {
  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">
        {title}
      </Heading>
      <Text mt="8px" color="var(--text)">{description}</Text>
      <Text mt="8px" fontFamily="mono" color="var(--accent)">{formula}</Text>

      <Flex mt="24px" gap="8px">
        {(['encrypt', 'decrypt'] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={mode === value ? 'solid' : 'outline'}
            bg={mode === value ? 'var(--accent)' : undefined}
            color={mode === value ? 'white' : 'var(--text)'}
            onClick={() => onModeChange(value)}
          >
            {value === 'encrypt' ? 'Encrypt' : 'Decrypt'}
          </Button>
        ))}
      </Flex>

      <Flex mt="20px" gap="16px" flexWrap="wrap" align="end">{children}</Flex>

      <Flex mt="24px" gap="16px" direction={{ base: 'column', md: 'row' }}>
        <Field.Root flex="1">
          <Field.Label>Input</Field.Label>
          <Textarea
            mt="8px"
            minH="180px"
            p="16px"
            resize="none"
            fontFamily="mono"
            fontSize="md"
            lineHeight="1.7"
            bg="var(--bg)"
            borderWidth="1px"
            borderColor="var(--border)"
            borderRadius="12px"
            _focus={{ borderColor: 'var(--accent)' }}
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
          />
        </Field.Root>
        <Field.Root flex="1">
          <Field.Label color={error ? '#ef4444' : 'var(--accent)'}>Output</Field.Label>
          <Textarea
            mt="8px"
            minH="180px"
            p="16px"
            resize="none"
            fontFamily="mono"
            fontSize="md"
            lineHeight="1.7"
            bg={error ? 'rgb(239 68 68 / 8%)' : 'var(--accent-bg)'}
            border="none"
            borderRadius="16px"
            fontWeight="semibold"
            _focus={{ outline: 'none' }}
            value={error ?? output}
            readOnly
            color={error ? '#ef4444' : 'var(--accent)'}
          />
        </Field.Root>
      </Flex>
      <Text mt="10px" fontSize="sm" color="var(--text)">
        Letters use A = 0 through Z = 25. Case, spaces, and punctuation stay unchanged.
      </Text>
      {inverseNote && <Box mt="12px">{inverseNote}</Box>}
      {gcdCheck && (
        <Box mt="12px">{gcdCheck}</Box>
      )}

      {!error && steps.length > 0 && (
        <Box mt="32px">
          <Heading as="h2" m="0" fontSize="lg">Letter calculations</Heading>
          <Box
            mt="16px"
            maxH="440px"
            overflowX="auto"
            overflowY="auto"
            borderWidth="1px"
            borderTopWidth="2px"
            borderBottomWidth="3px"
            borderColor="var(--border)"
            borderRadius="12px"
          >
            <Table.Root size="sm" variant="line" striped>
              <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
                <Table.Row>
                  <Table.ColumnHeader>#</Table.ColumnHeader>
                  <Table.ColumnHeader>Input</Table.ColumnHeader>
                  <Table.ColumnHeader>Value</Table.ColumnHeader>
                  <Table.ColumnHeader>Calculation</Table.ColumnHeader>
                  <Table.ColumnHeader>Result</Table.ColumnHeader>
                  <Table.ColumnHeader>Output</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {steps.map((step, index) => (
                  <Table.Row
                    key={step.position}
                    borderBottomWidth={index === steps.length - 1 ? '2px' : undefined}
                    borderColor={index === steps.length - 1 ? 'var(--accent)' : undefined}
                  >
                    <Table.Cell color="var(--text)">{step.position}</Table.Cell>
                    <Table.Cell fontWeight="semibold">{step.inputLetter}</Table.Cell>
                    <Table.Cell>{step.inputValue}</Table.Cell>
                    <Table.Cell fontFamily="mono" whiteSpace="nowrap">{step.calculation}</Table.Cell>
                    <Table.Cell color="var(--accent)" fontWeight="semibold">{step.outputValue}</Table.Cell>
                    <Table.Cell color="var(--accent)" fontWeight="bold">{step.outputLetter}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      )}
    </Box>
  )
}

function AdditiveInverseNote({ keyValue }: { keyValue: number }) {
  const inverse = mod(-keyValue, 26)
  return (
    <Box p="16px 20px" fontFamily="mono" boxShadow="0 4px 14px rgb(0 0 0 / 8%)" borderRadius="12px" bg="var(--accent-bg)">
      <Text fontSize="sm" color="var(--text)">Additive inverse: −{keyValue} mod 26 = {inverse}</Text>
      <Text mt="4px" fontSize="sm" color="var(--text)">Decryption shifts each letter by {inverse}.</Text>
    </Box>
  )
}

function MultiplicativeInverseNote({ keyValue, label = 'Multiplicative inverse' }: { keyValue: number; label?: string }) {
  const inverseResult = multiplicativeInverse(keyValue, 26)
  if (!inverseResult.exists) return null
  const inverse = inverseResult.inverse

  return (
    <Box p="16px 20px" fontFamily="mono" boxShadow="0 4px 14px rgb(0 0 0 / 8%)" borderRadius="12px" bg="var(--accent-bg)" position="relative">
      <Link
        to="/basic/gcd"
        search={{ a: keyValue, b: 26 }}
        aria-label={`View gcd(${keyValue}, 26) calculation`}
        title="View the GCD calculation"
        style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--accent)' }}
      >
        <ExternalLink size={15} />
      </Link>
      <Text fontSize="sm" color="var(--text)">gcd({keyValue}, 26) = 1</Text>
      <Text mt="4px" fontSize="sm" color="var(--text)">
        {label}: {keyValue}⁻¹ = {inverse}, since {keyValue} × {inverse} ≡ 1 (mod 26).
      </Text>
    </Box>
  )
}

function KeyField({ label, value, onChange, invalid }: { label: string; value: string; onChange: (value: string) => void; invalid?: boolean }) {
  return (
    <Field.Root maxW="180px" invalid={invalid}>
      <Field.Label>{label}</Field.Label>
      <Input
        type="number"
        min="0"
        mt="8px"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (['-', '+', 'e', 'E', '.'].includes(event.key)) event.preventDefault()
        }}
      />
    </Field.Root>
  )
}

function integer(raw: string): number | null {
  return /^\d+$/.test(raw.trim()) ? Number(raw) : null
}

function CoprimeCheck({ keyValue }: { keyValue: number }) {
  const normalizedKey = Math.abs(keyValue)
  const divisor = gcd(keyValue, 26)
  if (normalizedKey === 0) {
    return (
      <Box p="16px 20px" fontFamily="mono" borderWidth="1px" borderColor="red.300" borderRadius="12px" bg="red.50">
        <Text fontSize="sm" color="var(--text)">gcd(0, 26) = {divisor}, not 1.</Text>
        <Text mt="4px" fontSize="sm" color="var(--text)">This key has no inverse modulo 26.</Text>
      </Box>
    )
  }

  return (
    <Box p="16px 20px" fontFamily="mono" borderWidth="1px" borderColor="red.300" borderRadius="12px" bg="red.50" position="relative">
      <Link
        to="/basic/gcd"
        search={{ a: normalizedKey, b: 26 }}
        aria-label={`View gcd(${normalizedKey}, 26) calculation`}
        title="View the GCD calculation"
        style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--accent)' }}
      >
        <ExternalLink size={15} />
      </Link>
      <Text fontSize="sm" color="var(--text)">gcd({normalizedKey}, 26) = {divisor}, not 1.</Text>
      <Text mt="4px" fontSize="sm" color="var(--text)">
        This key has no inverse modulo 26.
      </Text>
    </Box>
  )
}

export function AdditiveCipherPage() {
  const [input, setInput] = useState('Attack at dawn!')
  const [keyRaw, setKeyRaw] = useState('7')
  const [mode, setMode] = useState<CipherMode>('encrypt')
  const key = integer(keyRaw)
  const result = key === null ? { output: '', steps: [] } : additiveCipherResult(input, key, mode)

  return (
    <CipherShell
      title="Additive Cipher"
      description="Shift each letter by a fixed key modulo 26. This is also called the Caesar cipher."
      formula={mode === 'encrypt' ? 'E(x) = (x + k) mod 26' : 'D(y) = (y − k) mod 26'}
      input={input}
      output={result.output}
      steps={result.steps}
      mode={mode}
      error={key === null ? 'Enter an integer key.' : undefined}
      inverseNote={mode === 'decrypt' && key !== null ? <AdditiveInverseNote keyValue={key} /> : undefined}
      onInputChange={setInput}
      onModeChange={setMode}
    >
      <KeyField label="Key (k)" value={keyRaw} onChange={setKeyRaw} invalid={key === null} />
    </CipherShell>
  )
}

export function MultiplicativeCipherPage() {
  const [input, setInput] = useState('Hello, World!')
  const [keyRaw, setKeyRaw] = useState('5')
  const [mode, setMode] = useState<CipherMode>('encrypt')
  const key = integer(keyRaw)
  const valid = key !== null && gcd(key, 26) === 1
  const error = key === null ? 'Enter an integer key.' : !valid ? 'The key must be coprime with 26.' : undefined
  const result = valid ? multiplicativeCipherResult(input, key, mode) : { output: '', steps: [] }

  return (
    <CipherShell
      title="Multiplicative Cipher"
      description="Multiply each letter by a key that has an inverse modulo 26."
      formula={mode === 'encrypt' ? 'E(x) = kx mod 26' : 'D(y) = k⁻¹y mod 26'}
      input={input}
      output={result.output}
      steps={result.steps}
      mode={mode}
      error={error}
      inverseNote={mode === 'decrypt' && valid && key !== null ? <MultiplicativeInverseNote keyValue={key} /> : undefined}
      gcdCheck={key !== null && !valid ? <CoprimeCheck keyValue={key} /> : undefined}
      onInputChange={setInput}
      onModeChange={setMode}
    >
      <KeyField label="Key (k)" value={keyRaw} onChange={setKeyRaw} invalid={!valid} />
    </CipherShell>
  )
}

export function AffineCipherPage() {
  const [input, setInput] = useState('Affine Cipher')
  const [aRaw, setARaw] = useState('5')
  const [bRaw, setBRaw] = useState('8')
  const [mode, setMode] = useState<CipherMode>('encrypt')
  const a = integer(aRaw)
  const b = integer(bRaw)
  const aValid = a !== null && gcd(a, 26) === 1
  const error = a === null || b === null
    ? 'Enter integer keys.'
    : !aValid
      ? 'The multiplicative key must be coprime with 26.'
      : undefined
  const result = !error && a !== null && b !== null
    ? affineCipherResult(input, a, b, mode)
    : { output: '', steps: [] }

  return (
    <CipherShell
      title="Affine Cipher"
      description="Multiply each letter by a, then shift it by b. The key a must have an inverse modulo 26."
      formula={mode === 'encrypt' ? 'E(x) = (ax + b) mod 26' : 'D(y) = a⁻¹(y − b) mod 26'}
      input={input}
      output={result.output}
      steps={result.steps}
      mode={mode}
      error={error}
      inverseNote={mode === 'decrypt' && !error && a !== null ? <MultiplicativeInverseNote keyValue={a} label="Inverse of a" /> : undefined}
      gcdCheck={a !== null && !aValid ? <CoprimeCheck keyValue={a} /> : undefined}
      onInputChange={setInput}
      onModeChange={setMode}
    >
      <KeyField label="Multiplicative key (a)" value={aRaw} onChange={setARaw} invalid={!aValid} />
      <KeyField label="Additive key (b)" value={bRaw} onChange={setBRaw} invalid={b === null} />
    </CipherShell>
  )
}
