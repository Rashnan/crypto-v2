import { useState, type ReactNode } from 'react'
import { Box, Button, Field, Flex, Heading, Input, SimpleGrid, Table, Text, Textarea } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { MathMatrix } from './MathMatrix'
import {
  autokeyCipherResult,
  hillCipherResult,
  hillKeyDetails,
  playfairCipherResult,
  substitutionCipherResult,
  vigenereCipherResult,
  type ClassicalCipherResult,
  type CipherMode,
  type HillKeyDetails,
} from '../lib/ciphers'

interface CipherPageProps {
  title: string
  description: string
  input: string
  output: string
  mode: CipherMode
  error?: string
  steps: ClassicalCipherResult['steps']
  matrix?: ClassicalCipherResult['matrix']
  keyStatus?: ReactNode
  matrixLabel?: string
  matrixLink?: { size: number; entries: string[] }
  children: ReactNode
  onInputChange: (value: string) => void
  onModeChange: (mode: CipherMode) => void
}

function CipherPage({ title, description, input, output, mode, error, steps, matrix, keyStatus, matrixLabel = 'Key matrix', matrixLink, children, onInputChange, onModeChange }: CipherPageProps) {
  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">{title}</Heading>
      <Text mt="8px" color="var(--text)">{description}</Text>
      <Flex mt="24px" gap="8px">
        {(['encrypt', 'decrypt'] as const).map((value) => (
          <Button key={value} size="sm" variant={mode === value ? 'solid' : 'outline'} bg={mode === value ? 'var(--accent)' : undefined} color={mode === value ? 'white' : 'var(--text)'} onClick={() => onModeChange(value)}>
            {value === 'encrypt' ? 'Encrypt' : 'Decrypt'}
          </Button>
        ))}
      </Flex>
      <Flex mt="20px" gap="16px" flexWrap="wrap" align="end">{children}</Flex>
      {keyStatus && <Box mt="20px">{keyStatus}</Box>}
      {matrix && (
        <Box mt="20px" p="16px 20px" borderRadius="12px" bg="var(--accent-bg)" boxShadow="0 4px 14px rgb(0 0 0 / 8%)">
          <Flex align="center" justify="space-between" gap="12px" mb="8px">
            <Text fontSize="sm" fontWeight="medium" color="var(--text)">{matrixLabel}</Text>
            {matrixLink && <Link to="/modular/matrix-inverse" search={{ m: 26, size: matrixLink.size, entries: matrixLink.entries.join(',') }}><Flex align="center" gap="5px" color="var(--accent)" fontSize="sm">View inverse calculation <ExternalLink size={14} /></Flex></Link>}
          </Flex>
          <MathMatrix data={matrix} />
        </Box>
      )}
      <SimpleGrid mt="24px" columns={{ base: 1, md: 2 }} gap="16px">
        <Field.Root>
          <Field.Label>Input</Field.Label>
          <Textarea mt="8px" minH="180px" p="16px" resize="none" fontFamily="mono" fontSize="md" lineHeight="1.7" bg="var(--bg)" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" _focus={{ borderColor: 'var(--accent)' }} value={input} onChange={(event) => onInputChange(event.target.value)} />
        </Field.Root>
        <Field.Root>
          <Field.Label color={error ? '#ef4444' : 'var(--accent)'}>Output</Field.Label>
          <Textarea mt="8px" minH="180px" p="16px" resize="none" fontFamily="mono" fontSize="md" lineHeight="1.7" bg={error ? 'rgb(239 68 68 / 8%)' : 'var(--accent-bg)'} border="none" borderRadius="16px" fontWeight="semibold" value={error ?? output} readOnly color={error ? '#ef4444' : 'var(--accent)'} />
        </Field.Root>
      </SimpleGrid>
      {!error && steps.length > 0 && (
        <Box mt="32px">
          <Heading as="h2" m="0" fontSize="lg">Working</Heading>
          <Box mt="16px" maxH="440px" overflow="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
            <Table.Root size="sm" variant="line" striped>
              <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
                <Table.Row><Table.ColumnHeader>#</Table.ColumnHeader><Table.ColumnHeader>Input</Table.ColumnHeader><Table.ColumnHeader>Key</Table.ColumnHeader><Table.ColumnHeader>Calculation</Table.ColumnHeader><Table.ColumnHeader>Output</Table.ColumnHeader></Table.Row>
              </Table.Header>
              <Table.Body>{steps.map((step, index) => <Table.Row key={`${step.position}-${step.input}`} borderBottomWidth={index === steps.length - 1 ? '2px' : undefined} borderColor={index === steps.length - 1 ? 'var(--accent)' : undefined}><Table.Cell>{step.position}</Table.Cell><Table.Cell fontWeight="semibold">{step.input}</Table.Cell><Table.Cell fontFamily="mono" whiteSpace="nowrap">{step.key}</Table.Cell><Table.Cell fontFamily="mono" whiteSpace="nowrap">{step.inputValues && step.outputValues && matrix ? <Flex align="center" gap="6px"><MathMatrix data={matrix} compact /><Text>×</Text><MathMatrix data={step.inputValues.map((value) => [value])} compact /><Text>=</Text><MathMatrix data={step.outputValues.map((value) => [value])} compact /></Flex> : step.calculation}</Table.Cell><Table.Cell color="var(--accent)" fontWeight="bold">{step.output}</Table.Cell></Table.Row>)}</Table.Body>
            </Table.Root>
          </Box>
        </Box>
      )}
    </Box>
  )
}

function TextKeyField({ label, value, onChange, invalid }: { label: string; value: string; onChange: (value: string) => void; invalid?: boolean }) {
  return <Field.Root maxW="400px" invalid={invalid}><Field.Label>{label}</Field.Label><Input mt="8px" value={value} onChange={(event) => onChange(event.target.value)} /></Field.Root>
}

function LetterKeyCipher({ title, description, initialInput, initialKey, run }: { title: string; description: string; initialInput: string; initialKey: string; run: (text: string, key: string, mode: CipherMode) => ClassicalCipherResult }) {
  const [input, setInput] = useState(initialInput)
  const [key, setKey] = useState(initialKey)
  const [mode, setMode] = useState<CipherMode>('encrypt')
  let result: ClassicalCipherResult = { output: '', steps: [] }
  let error: string | undefined
  try { result = run(input, key, mode) } catch (caught) { error = caught instanceof Error ? caught.message : 'Invalid key.' }
  return <CipherPage title={title} description={description} input={input} output={result.output} steps={result.steps} matrix={result.matrix} mode={mode} error={error} onInputChange={setInput} onModeChange={setMode}><TextKeyField label="Key" value={key} onChange={setKey} invalid={Boolean(error)} /></CipherPage>
}

export function SubstitutionCipherPage() { return <LetterKeyCipher title="Substitution Cipher" description="Replace each letter with its matching letter in a 26-character substitution alphabet." initialInput="Attack at dawn!" initialKey="QWERTYUIOPASDFGHJKLZXCVBNM" run={substitutionCipherResult} /> }
export function VigenereCipherPage() { return <LetterKeyCipher title="Vigenère Cipher" description="Repeat a keyword to shift each letter by a changing amount." initialInput="ATTACKATDAWN" initialKey="LEMON" run={vigenereCipherResult} /> }
export function AutokeyCipherPage() { return <LetterKeyCipher title="Autokey Cipher" description="Start with a keyword, then extend it with the plaintext itself." initialInput="ATTACKATDAWN" initialKey="QUEENLY" run={autokeyCipherResult} /> }
export function PlayfairCipherPage() { return <LetterKeyCipher title="Playfair Cipher" description="Encrypt letter pairs with a keyed 5 × 5 square. I and J share a cell." initialInput="HIDETHEGOLD" initialKey="PLAYFAIR EXAMPLE" run={playfairCipherResult} /> }

function HillKeyStatus({ details, entries }: { details: HillKeyDetails; entries: string[] }) {
  const determinantSearch = { m: 26, size: details.dimension, entries: entries.join(',') }
  return (
    <SimpleGrid columns={{ base: 1, sm: 3 }} gap="12px">
      <Box p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" position="relative">
        <Link to="/basic/matrix-determinant" search={determinantSearch} aria-label="View determinant calculation" style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--accent)' }}><ExternalLink size={15} /></Link>
        <Text fontSize="sm" color="var(--text)">det(A) mod 26</Text>
        <Text mt="4px" fontSize="2xl" fontWeight="bold" color="var(--accent)">{details.determinant}</Text>
      </Box>
      <Box p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" position="relative">
        <Link to="/basic/gcd" search={{ a: details.determinant, b: 26 }} aria-label="View GCD calculation" style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--accent)' }}><ExternalLink size={15} /></Link>
        <Text fontSize="sm" color="var(--text)">gcd(det(A), 26)</Text>
        <Text mt="4px" fontSize="2xl" fontWeight="bold" color="var(--accent)">{details.gcd}</Text>
      </Box>
      <Box p="16px 20px" borderWidth="1px" borderColor={details.invertible ? 'var(--border)' : 'red.300'} borderRadius="12px" bg={details.invertible ? 'var(--bg)' : 'red.50'}>
        <Text fontSize="sm" color="var(--text)">Key matrix</Text>
        <Text mt="4px" fontSize="2xl" fontWeight="bold" color={details.invertible ? 'var(--accent)' : '#ef4444'}>{details.invertible ? 'Invertible' : 'Not invertible'}</Text>
      </Box>
    </SimpleGrid>
  )
}

export function HillCipherPage() {
  const [input, setInput] = useState('HELP')
  const [entries, setEntries] = useState(['3', '3', '2', '5'])
  const [dimension, setDimension] = useState(2)
  const [mode, setMode] = useState<CipherMode>('encrypt')
  const key = entries.map((entry) => /^\d+$/.test(entry) ? Number(entry) : null)
  const details = key.some((value) => value === null) ? null : hillKeyDetails(key as number[])
  let result: ClassicalCipherResult = { output: '', steps: [] }
  let error: string | undefined
  if (key.some((value) => value === null)) error = 'Enter non-negative integer matrix values.'
  else { try { result = hillCipherResult(input, key as number[], mode) } catch (caught) { error = caught instanceof Error ? caught.message : 'Invalid key matrix.' } }
  return (
    <CipherPage title="Hill Cipher" description={`Encrypt letter blocks with a ${dimension} × ${dimension} key matrix modulo 26.`} input={input} output={result.output} steps={result.steps} matrix={result.matrix} keyStatus={details && <HillKeyStatus details={details} entries={entries} />} matrixLabel={mode === 'decrypt' ? 'Inverse key matrix (mod 26)' : 'Key matrix'} matrixLink={mode === 'decrypt' ? { size: dimension, entries } : undefined} mode={mode} error={error} onInputChange={setInput} onModeChange={setMode}>
      <Field.Root invalid={Boolean(error)}><Field.Label>Matrix dimension</Field.Label><Input mt="8px" type="number" min="2" max="4" value={dimension} onChange={(event) => { const next = Math.min(4, Math.max(2, Number(event.target.value) || 2)); setDimension(next); setEntries(Array.from({ length: next * next }, (_, index) => String(index % (next + 1) === 0 ? 1 : 0))) }} /></Field.Root>
      <Field.Root invalid={Boolean(error)}><Field.Label>Key matrix</Field.Label><SimpleGrid mt="8px" columns={dimension} gap="8px" maxW="420px">{entries.map((value, index) => <Input key={index} type="number" min="0" value={value} onChange={(event) => setEntries((current) => current.map((entry, itemIndex) => itemIndex === index ? event.target.value : entry))} />)}</SimpleGrid></Field.Root>
    </CipherPage>
  )
}
