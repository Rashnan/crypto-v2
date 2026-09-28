import { useState } from 'react'
import { Box, Field, Flex, Heading, Input, Table, Text } from '@chakra-ui/react'
import {
  aesDecryptDetail,
  aesEncryptDetail,
  aesKeyExpansion,
  aesRoundDetail,
  type AesCipherDetail,
  type AesRoundDetail,
} from '../lib/aes'
import { ErrorNote, ResultBox, SectionHeading, StateMatrix } from './BlockCipherUi'

const sampleBlock = '00112233445566778899AABBCCDDEEFF'
const sampleKey = '000102030405060708090A0B0C0D0E0F'

function HexField({ label, value, onChange, maxW = '320px', invalid }: { label: string; value: string; onChange: (value: string) => void; maxW?: string; invalid?: boolean }) {
  return (
    <Field.Root maxW={maxW} invalid={invalid}>
      <Field.Label>{label}</Field.Label>
      <Input mt="8px" fontFamily="mono" value={value} onChange={(event) => onChange(event.target.value)} />
    </Field.Root>
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

export function AesRoundPage() {
  const [block, setBlock] = useState(sampleBlock)
  const [key, setKey] = useState(sampleKey)
  const [roundRaw, setRoundRaw] = useState('1')

  let detail: AesRoundDetail | null = null
  let error = ''
  try {
    detail = aesRoundDetail(block, key, Number(roundRaw))
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Invalid input.'
  }

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">AES — One Round</Heading>
      <Text mt="8px" color="var(--text)">
        Each AES round applies SubBytes, ShiftRows, MixColumns and AddRoundKey. Round 10 omits MixColumns, and round 0
        is the initial AddRoundKey.
      </Text>

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
    </Box>
  )
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
        </>
      )}
    </Box>
  )
}

function AesCipherPage({ title, description, run }: { title: string; description: string; run: (block: string, key: string) => AesCipherDetail }) {
  const [block, setBlock] = useState(sampleBlock)
  const [key, setKey] = useState(sampleKey)
  const [selected, setSelected] = useState<number | null>(null)

  let detail: AesCipherDetail | null = null
  let error = ''
  try {
    detail = run(block, key)
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Invalid input.'
  }

  const selectedRound = detail && selected !== null ? detail.rounds.find((round) => round.round === selected) : null

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
                {detail.rounds.map((round) => {
                  const active = round.round === selected
                  return (
                    <Table.Row key={`${round.label}-${round.round}`} cursor="pointer" bg={active ? 'var(--accent-bg)' : undefined} _hover={{ bg: 'var(--accent-bg)' }} onClick={() => setSelected(round.round)}>
                      <Table.Cell fontWeight="semibold" color={active ? 'var(--accent)' : undefined}>{round.label}</Table.Cell>
                      <Table.Cell fontFamily="mono" fontSize="xs" whiteSpace="nowrap">{round.endState}</Table.Cell>
                      <Table.Cell fontSize="xs">{round.operations.map((operation) => operation.name).join(' → ')}</Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </Box>
          <Text mt="8px" fontSize="sm" color="var(--text)">Click a stage to see its full working below.</Text>

          {selectedRound && (
            <Box mt="8px">
              <SectionHeading>{selectedRound.label} working</SectionHeading>
              <AesOperations round={selectedRound} />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export function AesEncryptPage() {
  return <AesCipherPage title="AES — Encryption" description="Initial AddRoundKey, nine full rounds, and a final round without MixColumns." run={aesEncryptDetail} />
}

export function AesDecryptPage() {
  return <AesCipherPage title="AES — Decryption" description="The inverse cipher: AddRoundKey, then InvShiftRows, InvSubBytes, AddRoundKey and InvMixColumns, ending with the initial key." run={aesDecryptDetail} />
}
