import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Box, Button, Field, Flex, Heading, Input, SimpleGrid, Table, Text } from '@chakra-ui/react'
import {
  aesDecryptDetail,
  aesEncryptDetail,
  aesKeyExpansion,
  aesRoundDetail,
  aesTables,
  type AesCipherDetail,
  type AesRoundDetail,
} from '../lib/aes'
import type { CipherMode } from '../lib/ciphers'
import { AesKeyExpansionDiagram, AesRoundDiagram } from './CipherDiagrams'
import { ConstantBlock, ErrorNote, HexGrid, NumberGrid, NumberMatrix, ResultBox, SectionHeading, StateMatrix } from './BlockCipherUi'

const sampleBlock = '00112233445566778899AABBCCDDEEFF'
const sampleKey = '000102030405060708090A0B0C0D0E0F'
const tables = aesTables()

function HexField({ label, value, onChange, maxW = '320px', invalid }: { label: string; value: string; onChange: (value: string) => void; maxW?: string; invalid?: boolean }) {
  return (
    <Field.Root maxW={maxW} invalid={invalid}>
      <Field.Label>{label}</Field.Label>
      <Input mt="8px" fontFamily="mono" value={value} onChange={(event) => onChange(event.target.value)} />
    </Field.Root>
  )
}

function ModeToggle({ mode, onChange }: { mode: CipherMode; onChange: (mode: CipherMode) => void }) {
  return (
    <Flex gap="8px">
      {(['encrypt', 'decrypt'] as const).map((value) => (
        <Button key={value} size="sm" variant={mode === value ? 'solid' : 'outline'} bg={mode === value ? 'var(--accent)' : undefined} color={mode === value ? 'white' : 'var(--text)'} onClick={() => onChange(value)}>
          {value === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </Button>
      ))}
    </Flex>
  )
}

export function AesOperations({ round }: { round: AesRoundDetail }) {
  return (
    <Flex direction="column" gap="16px">
      {round.operations.map((operation, index) => (
        <Box key={`${operation.name}-${index}`} p="16px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" bg="var(--bg)">
          <Text fontWeight="semibold" color="var(--text-h)">{operation.name}</Text>
          <Flex mt="12px" gap="16px" align="center" flexWrap="wrap">
            <StateMatrix label="before" hex={operation.before} />
            <Text color="var(--accent)" fontSize="2xl">→</Text>
            <StateMatrix label="after" hex={operation.after} />
          </Flex>
        </Box>
      ))}
    </Flex>
  )
}

export function AesRoundPage({ initialBlock = sampleBlock, initialKey = sampleKey, initialRound = '1', initialMode = 'encrypt' }: { initialBlock?: string; initialKey?: string; initialRound?: string; initialMode?: CipherMode }) {
  const [block, setBlock] = useState(initialBlock)
  const [key, setKey] = useState(initialKey)
  const [roundRaw, setRoundRaw] = useState(initialRound)
  const [mode, setMode] = useState<CipherMode>(initialMode)

  let detail: AesRoundDetail | null = null
  let error = ''
  try {
    detail = aesRoundDetail(block, key, Number(roundRaw), mode)
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Invalid input.'
  }

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">AES — One Round</Heading>
      <Text mt="8px" color="var(--text)">
        Each AES round applies SubBytes, ShiftRows, MixColumns and AddRoundKey. Round 10 omits MixColumns, and round 0
        is the initial AddRoundKey. Decryption applies the inverses in reverse order.
      </Text>

      <Box mt="24px">
        <Text fontSize="sm" color="var(--text)" mb="10px">Diagram</Text>
        <ModeToggle mode={mode} onChange={setMode} />
      </Box>

      <AesRoundDiagram mode={mode} />

      <Flex mt="24px" gap="16px" flexWrap="wrap" align="end">
        <HexField label="Block (32 hex)" value={block} onChange={setBlock} invalid={Boolean(error)} />
        <HexField label="Key (32 hex)" value={key} onChange={setKey} invalid={Boolean(error)} />
        <Field.Root maxW="120px" invalid={Boolean(error)}>
          <Field.Label>Round</Field.Label>
          <Input mt="8px" type="number" min="0" max="10" value={roundRaw} onChange={(event) => setRoundRaw(event.target.value)} />
        </Field.Root>
      </Flex>

      {error && <ErrorNote message={error} />}

      {detail && (
        <>
          <Box mt="24px" p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" bg="var(--bg)">
            <StateMatrix label={`State entering ${detail.label}`} hex={detail.startState} />
          </Box>
          <SectionHeading>Operations</SectionHeading>
          <AesOperations round={detail} />
        </>
      )}

      <SectionHeading>Constant tables</SectionHeading>
      <Box display="grid" gap="12px">
        <ConstantBlock label="S-box" hint="SubBytes lookup (16 × 16, row = high nibble)">
          <HexGrid values={tables.sbox} />
        </ConstantBlock>
        <ConstantBlock label="Inverse S-box" hint="InvSubBytes lookup">
          <HexGrid values={tables.invSbox} />
        </ConstantBlock>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="12px">
          <ConstantBlock label="MixColumns matrix" hint="multiply each column in GF(2⁸)">
            <NumberMatrix matrix={tables.mixMatrix} />
          </ConstantBlock>
          <ConstantBlock label="InvMixColumns matrix" hint="inverse diffusion">
            <NumberMatrix matrix={tables.invMixMatrix} />
          </ConstantBlock>
        </SimpleGrid>
      </Box>
    </Box>
  )
}

export function AesRoundSearchPage() {
  const { block, key, round, mode } = useSearch({ from: '/modern/aes-round' })
  return <AesRoundPage key={`${block}-${key}-${round}-${mode}`} initialBlock={block} initialKey={key} initialRound={round?.toString()} initialMode={mode} />
}

export function AesKeyPage() {
  const [key, setKey] = useState(sampleKey)
  let expansion: ReturnType<typeof aesKeyExpansion> | null = null
  let error = ''
  try {
    expansion = aesKeyExpansion(key)
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Invalid key.'
  }

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">AES — Key Expansion</Heading>
      <Text mt="8px" color="var(--text)">
        AES-128 expands the 16-byte key into 44 words (11 round keys). Every fourth word runs RotWord, SubWord and an
        Rcon XOR before being combined with the word four positions back.
      </Text>

      <AesKeyExpansionDiagram />

      <Flex mt="24px" gap="16px" flexWrap="wrap" align="end">
        <HexField label="Key (32 hex)" value={key} onChange={setKey} invalid={Boolean(error)} />
      </Flex>

      {error && <ErrorNote message={error} />}

      {expansion && (
        <>
          <SectionHeading>Round keys</SectionHeading>
          <Box overflowX="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
            <Table.Root size="sm" variant="line" striped>
              <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
                <Table.Row>
                  <Table.ColumnHeader>Round</Table.ColumnHeader>
                  <Table.ColumnHeader>Words</Table.ColumnHeader>
                  <Table.ColumnHeader>Round key (hex)</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {expansion.roundKeys.map((value, round) => (
                  <Table.Row key={round}>
                    <Table.Cell fontWeight="semibold">{round}</Table.Cell>
                    <Table.Cell fontFamily="mono">{`w${4 * round}–w${4 * round + 3}`}</Table.Cell>
                    <Table.Cell fontFamily="mono" color="var(--accent)" fontWeight="semibold" whiteSpace="nowrap">{value}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          <SectionHeading>RotWord steps</SectionHeading>
          <Box overflowX="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
            <Table.Root size="sm" variant="line" striped>
              <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
                <Table.Row>
                  <Table.ColumnHeader>Word</Table.ColumnHeader>
                  <Table.ColumnHeader>w[i−1]</Table.ColumnHeader>
                  <Table.ColumnHeader>RotWord</Table.ColumnHeader>
                  <Table.ColumnHeader>SubWord</Table.ColumnHeader>
                  <Table.ColumnHeader>Rcon</Table.ColumnHeader>
                  <Table.ColumnHeader>temp</Table.ColumnHeader>
                  <Table.ColumnHeader>w[i]</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {expansion.steps.map((step) => (
                  <Table.Row key={step.word}>
                    <Table.Cell fontWeight="semibold">{step.word}</Table.Cell>
                    <Table.Cell fontFamily="mono">{step.previous}</Table.Cell>
                    <Table.Cell fontFamily="mono">{step.rotated}</Table.Cell>
                    <Table.Cell fontFamily="mono">{step.substituted}</Table.Cell>
                    <Table.Cell fontFamily="mono">{step.rcon}</Table.Cell>
                    <Table.Cell fontFamily="mono">{step.temp}</Table.Cell>
                    <Table.Cell fontFamily="mono" color="var(--accent)" fontWeight="semibold">{step.result}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          <SectionHeading>Constant tables</SectionHeading>
          <Box display="grid" gap="12px">
            <ConstantBlock label="Rcon" hint="added to every 4th word (rounds 1 … 10)">
              <NumberGrid values={tables.rcon} perRow={10} />
            </ConstantBlock>
            <ConstantBlock label="S-box (SubWord)" hint="applied byte-wise during key expansion">
              <HexGrid values={tables.sbox} />
            </ConstantBlock>
          </Box>
        </>
      )}
    </Box>
  )
}

function AesCipherPage({ title, description, run, direction }: { title: string; description: string; run: (block: string, key: string) => AesCipherDetail; direction: CipherMode }) {
  const [block, setBlock] = useState(sampleBlock)
  const [key, setKey] = useState(sampleKey)
  const navigate = useNavigate()

  let detail: AesCipherDetail | null = null
  let error = ''
  try {
    detail = run(block, key)
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Invalid input.'
  }

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">{title}</Heading>
      <Text mt="8px" color="var(--text)">{description}</Text>

      <Flex mt="24px" gap="16px" flexWrap="wrap" align="end">
        <HexField label="Block (32 hex)" value={block} onChange={setBlock} invalid={Boolean(error)} />
        <HexField label="Key (32 hex)" value={key} onChange={setKey} invalid={Boolean(error)} />
      </Flex>

      {error && <ErrorNote message={error} />}

      {detail && (
        <>
          <ResultBox label="Output (hex)" value={detail.output} />

          <SectionHeading>Round summary</SectionHeading>
          <Box overflowX="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
            <Table.Root size="sm" variant="line" striped>
              <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
                <Table.Row>
                  <Table.ColumnHeader>Stage</Table.ColumnHeader>
                  <Table.ColumnHeader>State (hex)</Table.ColumnHeader>
                  <Table.ColumnHeader>Operations</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {detail.rounds.map((round) => (
                  <Table.Row
                    key={`${round.label}-${round.round}`}
                    cursor="pointer"
                    _hover={{ bg: 'var(--accent-bg)' }}
                    onClick={() => navigate({ to: '/modern/aes-round', search: { block, key, round: round.round, mode: direction } })}
                  >
                    <Table.Cell fontWeight="semibold" color="var(--accent)">{round.label}</Table.Cell>
                    <Table.Cell fontFamily="mono" fontSize="xs" whiteSpace="nowrap">{round.endState}</Table.Cell>
                    <Table.Cell fontSize="xs">{round.operations.map((operation) => operation.name).join(' → ')}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
          <Text mt="8px" fontSize="sm" color="var(--text)">Click a stage to open its full working on the One Round page.</Text>
        </>
      )}
    </Box>
  )
}

export function AesEncryptPage() {
  return <AesCipherPage title="AES — Encryption" description="Initial AddRoundKey, nine full rounds, and a final round without MixColumns." run={aesEncryptDetail} direction="encrypt" />
}

export function AesDecryptPage() {
  return <AesCipherPage title="AES — Decryption" description="The inverse cipher: AddRoundKey, then InvShiftRows, InvSubBytes, AddRoundKey and InvMixColumns, ending with the initial key." run={aesDecryptDetail} direction="decrypt" />
}
