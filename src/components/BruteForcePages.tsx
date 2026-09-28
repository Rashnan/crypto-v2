import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Box, Button, Field, Flex, Heading, Table, Text, Textarea } from '@chakra-ui/react'
import {
  additiveCipher,
  additiveCipherResult,
  additiveKeyDetails,
  affineCipher,
  affineCipherResult,
  multiplicativeCipher,
  multiplicativeCipherResult,
  multiplicativeKeyDetails,
  type CipherMode,
  type CipherStep,
} from '../lib/ciphers'
import { isCoprime } from '../lib/modular'

const modulus = 26
const coprimeKeys = Array.from({ length: modulus }, (_, key) => key).filter((key) => isCoprime(key, modulus))
const additiveKeys = Array.from({ length: modulus }, (_, key) => key)

function KeyNote({ lines }: { lines: string[] }) {
  return (
    <Box p="16px 20px" fontFamily="mono" boxShadow="0 4px 14px rgb(0 0 0 / 8%)" borderRadius="12px" bg="var(--accent-bg)">
      {lines.map((line, index) => <Text key={line} mt={index === 0 ? undefined : '4px'} fontSize="sm" color="var(--text)">{line}</Text>)}
    </Box>
  )
}

interface DetailState {
  selectedId: string | null
  steps: CipherStep[] | null
  heading: string
  note: ReactNode
}

interface BruteForceShellProps {
  title: string
  description: string
  formula: string
  input: string
  mode: CipherMode
  tableHint: string
  table: ReactNode
  detail: DetailState
  onInputChange: (value: string) => void
  onModeChange: (mode: CipherMode) => void
}

function BruteForceShell({ title, description, formula, input, mode, tableHint, table, detail, onInputChange, onModeChange }: BruteForceShellProps) {
  const { selectedId, steps, heading, note } = detail
  const detailRef = useRef<HTMLDivElement>(null)
  const lastSelection = useRef<string | null>(null)

  useEffect(() => {
    if (lastSelection.current === selectedId) return
    lastSelection.current = selectedId
    if (selectedId !== null) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [selectedId])

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">{title}</Heading>
      <Text mt="8px" color="var(--text)">{description}</Text>
      <Text mt="8px" fontFamily="mono" color="var(--accent)">{formula}</Text>

      <Flex mt="24px" gap="8px">
        {(['encrypt', 'decrypt'] as const).map((value) => (
          <Button key={value} size="sm" variant={mode === value ? 'solid' : 'outline'} bg={mode === value ? 'var(--accent)' : undefined} color={mode === value ? 'white' : 'var(--text)'} onClick={() => onModeChange(value)}>
            {value === 'encrypt' ? 'Encrypt' : 'Decrypt'}
          </Button>
        ))}
      </Flex>

      <Field.Root mt="20px" maxW="720px">
        <Field.Label>{mode === 'decrypt' ? 'Ciphertext' : 'Plaintext'}</Field.Label>
        <Textarea mt="8px" minH="96px" p="16px" resize="none" fontFamily="mono" fontSize="md" lineHeight="1.7" bg="var(--bg)" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" _focus={{ borderColor: 'var(--accent)' }} value={input} onChange={(event) => onInputChange(event.target.value)} />
      </Field.Root>
      <Text mt="10px" fontSize="sm" color="var(--text)">
        Letters use A = 0 through Z = 25. Case, spaces, and punctuation stay unchanged. {tableHint}
      </Text>

      {table}

      <Box ref={detailRef} mt="32px" scrollMarginTop="24px">
        {selectedId !== null && steps ? (
          <>
            <Heading as="h2" m="0" fontSize="lg">Full calculation — {heading}</Heading>
            {note && <Box mt="12px">{note}</Box>}
            <Box mt="16px" maxH="440px" overflow="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
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
                    <Table.Row key={step.position} borderBottomWidth={index === steps.length - 1 ? '2px' : undefined} borderColor={index === steps.length - 1 ? 'var(--accent)' : undefined}>
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
          </>
        ) : (
          <Box p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" bg="var(--accent-bg)">
            <Text fontSize="sm" color="var(--text)">Select a key from the table above to show the full step-by-step calculation here.</Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

interface KeyListRow {
  id: string
  keys: number[]
  output: string
}

function KeyListTable({ keyHeaders, rows, selectedId, onSelect }: { keyHeaders: string[]; rows: KeyListRow[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <Box mt="24px" maxH="480px" overflow="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
      <Table.Root size="sm" variant="line" striped>
        <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
          <Table.Row>
            {keyHeaders.map((header) => <Table.ColumnHeader key={header}>{header}</Table.ColumnHeader>)}
            <Table.ColumnHeader>Result</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => {
            const active = row.id === selectedId
            return (
              <Table.Row key={row.id} cursor="pointer" bg={active ? 'var(--accent-bg)' : undefined} _hover={{ bg: 'var(--accent-bg)' }} onClick={() => onSelect(row.id)}>
                {row.keys.map((value, index) => <Table.Cell key={index} fontWeight="semibold" color={active ? 'var(--accent)' : undefined}>{value}</Table.Cell>)}
                <Table.Cell fontFamily="mono" whiteSpace="pre-wrap" fontWeight={active ? 'bold' : undefined} color={active ? 'var(--accent)' : undefined}>{row.output}</Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}

function AffineGridTable({ outputs, selectedId, onSelect }: { outputs: Map<string, string>; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <Box mt="24px" maxH="520px" maxW="full" overflow="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
      <Table.Root size="sm" variant="line">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader borderBottomWidth="1px" borderRightWidth="1px" borderColor="var(--border)" />
            <Table.ColumnHeader colSpan={coprimeKeys.length} borderBottomWidth="1px" borderColor="var(--border)" textAlign="left" fontWeight="semibold" color="var(--accent)">Multiplicative key (a) →</Table.ColumnHeader>
          </Table.Row>
          <Table.Row>
            <Table.ColumnHeader position="sticky" top="0" left="0" zIndex="3" bg="var(--accent-bg)" borderBottomWidth="2px" borderRightWidth="1px" borderColor="var(--accent)" whiteSpace="nowrap">Additive key (b) ↓</Table.ColumnHeader>
            {coprimeKeys.map((a) => (
              <Table.ColumnHeader key={a} position="sticky" top="0" zIndex="2" bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)" whiteSpace="nowrap" textAlign="center">a = {a}</Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {additiveKeys.map((b) => (
            <Table.Row key={b} _hover={{ bg: 'var(--accent-bg)' }}>
              <Table.Cell position="sticky" left="0" zIndex="1" bg="var(--bg)" fontWeight="semibold" whiteSpace="nowrap" borderRightWidth="1px" borderColor="var(--border)">b = {b}</Table.Cell>
              {coprimeKeys.map((a) => {
                const id = `${a}-${b}`
                const active = id === selectedId
                return (
                  <Table.Cell key={a} cursor="pointer" fontFamily="mono" whiteSpace="nowrap" bg={active ? 'var(--accent-bg)' : undefined} color={active ? 'var(--accent)' : undefined} fontWeight={active ? 'bold' : undefined} onClick={() => onSelect(id)}>{outputs.get(id)}</Table.Cell>
                )
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}

export function AdditiveBruteForcePage() {
  const [input, setInput] = useState('Haahjr ha khdu!')
  const [mode, setMode] = useState<CipherMode>('decrypt')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const rows = useMemo(() => Array.from({ length: modulus }, (_, key) => ({ id: String(key), keys: [key], output: additiveCipher(input, key, mode) })), [input, mode])
  const key = selectedId === null ? null : Number(selectedId)
  const steps = useMemo(() => (key === null ? null : additiveCipherResult(input, key, mode).steps), [input, key, mode])
  const details = key === null ? null : additiveKeyDetails(key)

  return (
    <BruteForceShell
      title="Additive Brute Force"
      description="Try all 26 Caesar shifts and read every possible plaintext. This is the full key space of the additive cipher."
      formula={mode === 'encrypt' ? 'E(x) = (x + k) mod 26' : 'D(y) = (y − k) mod 26'}
      input={input}
      mode={mode}
      tableHint="Click a row to see its full calculation below."
      table={<KeyListTable keyHeaders={['Key (k)']} rows={rows} selectedId={selectedId} onSelect={setSelectedId} />}
      detail={{ selectedId, steps, heading: `k = ${key ?? ''}`, note: details === null ? null : <KeyNote lines={mode === 'decrypt' ? [`Additive inverse: −${details.key} mod 26 = ${details.inverse}`, `Decryption shifts each letter by ${details.inverse}.`] : [`Each letter shifts forward by ${details.key}.`]} /> }}
      onInputChange={setInput}
      onModeChange={setMode}
    />
  )
}

export function MultiplicativeBruteForcePage() {
  const [input, setInput] = useState('Judds, Gshdp!')
  const [mode, setMode] = useState<CipherMode>('decrypt')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const rows = useMemo(() => coprimeKeys.map((key) => ({ id: String(key), keys: [key], output: multiplicativeCipher(input, key, mode) })), [input, mode])
  const key = selectedId === null ? null : Number(selectedId)
  const steps = useMemo(() => (key === null ? null : multiplicativeCipherResult(input, key, mode).steps), [input, key, mode])
  const details = key === null ? null : multiplicativeKeyDetails(key)

  return (
    <BruteForceShell
      title="Multiplicative Brute Force"
      description="Try every key coprime with 26. Only those keys are invertible, so the brute-force space has 12 candidates."
      formula={mode === 'encrypt' ? 'E(x) = kx mod 26' : 'D(y) = k⁻¹y mod 26'}
      input={input}
      mode={mode}
      tableHint="Click a row to see its full calculation below."
      table={<KeyListTable keyHeaders={['Key (k)']} rows={rows} selectedId={selectedId} onSelect={setSelectedId} />}
      detail={{ selectedId, steps, heading: `k = ${key ?? ''}`, note: details === null ? null : <KeyNote lines={mode === 'decrypt' ? [`gcd(${details.key}, 26) = ${details.gcd}, so ${details.key} is invertible.`, `Multiplicative inverse: ${details.key}⁻¹ = ${details.inverse ?? ''}.`] : [`gcd(${details.key}, 26) = ${details.gcd}, so ${details.key} is invertible.`]} /> }}
      onInputChange={setInput}
      onModeChange={setMode}
    />
  )
}

export function AffineBruteForcePage() {
  const [input, setInput] = useState('Ihhwvc Swfrcp')
  const [mode, setMode] = useState<CipherMode>('decrypt')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const outputs = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of coprimeKeys) for (const b of additiveKeys) map.set(`${a}-${b}`, affineCipher(input, a, b, mode))
    return map
  }, [input, mode])

  const selected = selectedId === null ? null : selectedId.split('-').map(Number)
  const a = selected === null ? null : selected[0]
  const b = selected === null ? null : selected[1]
  const steps = useMemo(() => (a === null || b === null ? null : affineCipherResult(input, a, b, mode).steps), [input, a, b, mode])
  const details = a === null ? null : multiplicativeKeyDetails(a)

  return (
    <BruteForceShell
      title="Affine Brute Force"
      description="Try every pair (a, b) where a is coprime with 26, for 12 × 26 = 312 candidates in total."
      formula={mode === 'encrypt' ? 'E(x) = (ax + b) mod 26' : 'D(y) = a⁻¹(y − b) mod 26'}
      input={input}
      mode={mode}
      tableHint="Rows are the additive key b, columns are the multiplicative key a. Click any cell for its full calculation below."
      table={<AffineGridTable outputs={outputs} selectedId={selectedId} onSelect={setSelectedId} />}
      detail={{ selectedId, steps, heading: a === null || b === null ? '' : `a = ${a}, b = ${b}`, note: details === null ? null : <KeyNote lines={[`gcd(${details.key}, 26) = ${details.gcd}, so a = ${details.key} is invertible.`, `Inverse of a: ${details.key}⁻¹ = ${details.inverse ?? ''}.`]} /> }}
      onInputChange={setInput}
      onModeChange={setMode}
    />
  )
}
