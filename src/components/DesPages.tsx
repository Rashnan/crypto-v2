import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Box, Button, Field, Flex, Heading, Input, SimpleGrid, Table, Text } from '@chakra-ui/react'
import {
  desDecrypt,
  desEncrypt,
  desKeySchedule,
  desRoundDetail,
  type DesCipherDetail,
  type DesRoundDetail,
} from '../lib/des'
import type { CipherMode } from '../lib/ciphers'
import { DesKeyScheduleDiagram, DesRoundDiagram } from './CipherDiagrams'
import { BitsView, ErrorNote, ResultBox, SectionHeading } from './BlockCipherUi'

const sampleBlock = '0123456789ABCDEF'
const sampleKey = '133457799BBCDFF1'

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

function DesSBoxTable({ detail }: { detail: DesRoundDetail }) {
  return (
    <Box overflowX="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
      <Table.Root size="sm" variant="line" striped>
        <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
          <Table.Row>
            <Table.ColumnHeader>Box</Table.ColumnHeader>
            <Table.ColumnHeader>6-bit input</Table.ColumnHeader>
            <Table.ColumnHeader>Row</Table.ColumnHeader>
            <Table.ColumnHeader>Column</Table.ColumnHeader>
            <Table.ColumnHeader>Value</Table.ColumnHeader>
            <Table.ColumnHeader>4-bit output</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {detail.sboxes.map((step) => (
            <Table.Row key={step.box}>
              <Table.Cell>S{step.box}</Table.Cell>
              <Table.Cell fontFamily="mono">{step.input}</Table.Cell>
              <Table.Cell>{step.row}</Table.Cell>
              <Table.Cell>{step.column}</Table.Cell>
              <Table.Cell>{step.value}</Table.Cell>
              <Table.Cell fontFamily="mono" color="var(--accent)" fontWeight="semibold">{step.output}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}

export function DesRoundWorking({ detail }: { detail: DesRoundDetail }) {
  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
        <BitsView label="L (32)" bits={detail.leftIn} group={8} />
        <BitsView label="R (32)" bits={detail.rightIn} group={8} />
        <BitsView label="E(R) expansion (48)" bits={detail.expanded} group={6} />
        <BitsView label={`Subkey K${detail.round} (48)`} bits={detail.subkey} group={6} />
        <BitsView label="E(R) ⊕ K (48)" bits={detail.xored} group={6} />
        <BitsView label="S-box output (32)" bits={detail.sboxOutput} group={4} />
        <BitsView label="P permutation (32)" bits={detail.pboxed} group={4} />
        <BitsView label="L′, R′ (64)" bits={detail.leftOut + detail.rightOut} group={8} />
      </SimpleGrid>
      <SectionHeading>S-box substitution</SectionHeading>
      <DesSBoxTable detail={detail} />
    </>
  )
}

export function DesRoundPage({ initialBlock = sampleBlock, initialKey = sampleKey, initialRound = '1', initialMode = 'encrypt' }: { initialBlock?: string; initialKey?: string; initialRound?: string; initialMode?: CipherMode }) {
  const [block, setBlock] = useState(initialBlock)
  const [key, setKey] = useState(initialKey)
  const [roundRaw, setRoundRaw] = useState(initialRound)
  const [mode, setMode] = useState<CipherMode>(initialMode)

  let detail: DesRoundDetail | null = null
  let error = ''
  try {
    detail = desRoundDetail(block, key, Number(roundRaw), mode).detail
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Invalid input.'
  }

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">DES — One Round</Heading>
      <Text mt="8px" color="var(--text)">
        The Feistel function expands R to 48 bits, XORs the round subkey, sends each 6-bit group through its S-box,
        then applies the P permutation and XORs the result into L.
      </Text>

      <DesRoundDiagram />

      <Flex mt="24px" gap="16px" flexWrap="wrap" align="end">
        <HexField label="Block (16 hex)" value={block} onChange={setBlock} invalid={Boolean(error)} />
        <HexField label="Key (16 hex)" value={key} onChange={setKey} invalid={Boolean(error)} />
        <Field.Root maxW="120px" invalid={Boolean(error)}>
          <Field.Label>Round</Field.Label>
          <Input mt="8px" type="number" min="1" max="16" value={roundRaw} onChange={(event) => setRoundRaw(event.target.value)} />
        </Field.Root>
        <Box>
          <Text fontSize="sm" color="var(--text)" mb="10px">Direction</Text>
          <ModeToggle mode={mode} onChange={setMode} />
        </Box>
      </Flex>

      {error && <ErrorNote message={error} />}

      {detail && (
        <>
          <ResultBox label={`L′, R′ after round ${detail.round}`} value={detail.leftOut + detail.rightOut} />
          <Box mt="24px">
            <DesRoundWorking detail={detail} />
          </Box>
        </>
      )}
    </Box>
  )
}

export function DesRoundSearchPage() {
  const { block, key, round, mode } = useSearch({ from: '/modern/des-round' })
  return <DesRoundPage key={`${block}-${key}-${round}-${mode}`} initialBlock={block} initialKey={key} initialRound={round?.toString()} initialMode={mode} />
}

export function DesKeyPage() {
  const [key, setKey] = useState(sampleKey)
  let schedule: ReturnType<typeof desKeySchedule> | null = null
  let error = ''
  try {
    schedule = desKeySchedule(key)
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Invalid key.'
  }

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">DES — Key Generation</Heading>
      <Text mt="8px" color="var(--text)">
        PC-1 selects 56 of the 64 key bits and splits them into halves C and D. Each round rotates both halves and
        PC-2 selects a 48-bit subkey.
      </Text>

      <DesKeyScheduleDiagram />

      <Flex mt="24px" gap="16px" flexWrap="wrap" align="end">
        <HexField label="Key (16 hex)" value={key} onChange={setKey} invalid={Boolean(error)} />
      </Flex>

      {error && <ErrorNote message={error} />}

      {schedule && (
        <>
          <ResultBox label="PC-1 output (56 bits)" value={schedule.pc1} />
          <SimpleGrid mt="16px" columns={{ base: 1, md: 2 }} gap="16px">
            <BitsView label="C₀ (28)" bits={schedule.c0} group={7} />
            <BitsView label="D₀ (28)" bits={schedule.d0} group={7} />
          </SimpleGrid>

          <SectionHeading>Round subkeys</SectionHeading>
          <Box overflowX="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
            <Table.Root size="sm" variant="line" striped>
              <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
                <Table.Row>
                  <Table.ColumnHeader>Round</Table.ColumnHeader>
                  <Table.ColumnHeader>Shift</Table.ColumnHeader>
                  <Table.ColumnHeader>C</Table.ColumnHeader>
                  <Table.ColumnHeader>D</Table.ColumnHeader>
                  <Table.ColumnHeader>Subkey K (48)</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {schedule.subkeys.map((step) => (
                  <Table.Row key={step.round}>
                    <Table.Cell>{step.round}</Table.Cell>
                    <Table.Cell>{step.shift}</Table.Cell>
                    <Table.Cell fontFamily="mono" fontSize="xs" whiteSpace="nowrap">{step.c}</Table.Cell>
                    <Table.Cell fontFamily="mono" fontSize="xs" whiteSpace="nowrap">{step.d}</Table.Cell>
                    <Table.Cell fontFamily="mono" fontSize="xs" whiteSpace="nowrap" color="var(--accent)">{step.subkey}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </>
      )}
    </Box>
  )
}

function DesCipherPage({ title, description, run, direction }: { title: string; description: string; run: (block: string, key: string) => DesCipherDetail; direction: CipherMode }) {
  const [block, setBlock] = useState(sampleBlock)
  const [key, setKey] = useState(sampleKey)
  const navigate = useNavigate()

  let detail: DesCipherDetail | null = null
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
        <HexField label="Block (16 hex)" value={block} onChange={setBlock} invalid={Boolean(error)} />
        <HexField label="Key (16 hex)" value={key} onChange={setKey} invalid={Boolean(error)} />
      </Flex>

      {error && <ErrorNote message={error} />}

      {detail && (
        <>
          <ResultBox label="Output (hex)" value={detail.outputHex} />
          <SimpleGrid mt="16px" columns={{ base: 1, md: 2 }} gap="16px">
            <BitsView label="Input (64)" bits={detail.input} group={8} />
            <BitsView label="After IP (64)" bits={detail.ip} group={8} />
          </SimpleGrid>

          <SectionHeading>Round summary</SectionHeading>
          <Box overflowX="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
            <Table.Root size="sm" variant="line" striped>
              <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
                <Table.Row>
                  <Table.ColumnHeader>Round</Table.ColumnHeader>
                  <Table.ColumnHeader>L′</Table.ColumnHeader>
                  <Table.ColumnHeader>R′</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {detail.rounds.map((round) => (
                  <Table.Row
                    key={round.round}
                    cursor="pointer"
                    _hover={{ bg: 'var(--accent-bg)' }}
                    onClick={() => navigate({ to: '/modern/des-round', search: { block, key, round: round.round, mode: direction } })}
                  >
                    <Table.Cell fontWeight="semibold" color="var(--accent)">{round.round}</Table.Cell>
                    <Table.Cell fontFamily="mono" fontSize="xs" whiteSpace="nowrap">{round.leftOut}</Table.Cell>
                    <Table.Cell fontFamily="mono" fontSize="xs" whiteSpace="nowrap">{round.rightOut}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
          <Text mt="8px" fontSize="sm" color="var(--text)">Click a round to open its full working on the One Round page.</Text>
        </>
      )}
    </Box>
  )
}

export function DesEncryptPage() {
  return <DesCipherPage title="DES — Encryption" description="Sixteen Feistel rounds over the permuted block, with the key schedule applied in order." run={desEncrypt} direction="encrypt" />
}

export function DesDecryptPage() {
  return <DesCipherPage title="DES — Decryption" description="The same Feistel network with the subkeys applied in reverse order." run={desDecrypt} direction="decrypt" />
}
