import { useState } from 'react'
import {
  Box,
  Field,
  Flex,
  Heading,
  Input,
  SimpleGrid,
  Stat,
  Table,
  Text,
} from '@chakra-ui/react'
import { additiveInverse, allAdditiveInverses, type AdditiveInversePair } from '../lib/modular'

const modulusLimit = 10 ** 7

function parseModulus(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (n < 2 || n > modulusLimit) return null
  return n
}

function parseElement(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (n < 0) return null
  return n
}

function ResultStat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Stat.Root p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" bg="var(--bg)">
      <Stat.Label color="var(--text)" fontSize="sm" fontWeight="medium">{label}</Stat.Label>
      <Stat.ValueText fontSize="2xl" fontWeight="bold" color="var(--accent)" fontFamily={mono ? 'mono' : undefined}>
        {value}
      </Stat.ValueText>
    </Stat.Root>
  )
}

export function AdditiveInversePage() {
  const [mRaw, setMRaw] = useState('8')
  const [xRaw, setXRaw] = useState('3')

  const m = parseModulus(mRaw)
  const mValid = m !== null
  const mInvalid = mRaw.trim() !== '' && !mValid

  const xValid = m !== null && parseElement(xRaw) !== null
  const xInvalid = xRaw.trim() !== '' && !xValid

  const pairs: AdditiveInversePair[] | null = m !== null ? allAdditiveInverses(m) : null
  const mValidX = xValid && m !== null && parseElement(xRaw) !== null

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">
        Additive Inverse (mod)
      </Heading>
      <Text mt="8px" color="var(--text)">
        The additive inverse of x mod m is the unique y with (x + y) mod m = 0.
        Every element of ℤ/mℤ has one.
      </Text>

      <Flex gap="16px" flexWrap="wrap" align="flex-end" mt="24px">
        <Field.Root invalid={mInvalid} maxW="200px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="6px">
            m
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              bg={mValid ? 'var(--accent)' : 'var(--text)'}
              opacity={mValid ? 1 : 0.2}
            />
          </Field.Label>
          <Input
            type="number"
            min="2"
            max={modulusLimit}
            step="1"
            mt="8px"
            value={mRaw}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMRaw(e.target.value)}
            placeholder="e.g. 8"
          />
        </Field.Root>
        <Field.Root invalid={xInvalid} maxW="200px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="6px">
            x
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              bg={xValid ? 'var(--accent)' : 'var(--text)'}
              opacity={xValid ? 1 : 0.2}
            />
          </Field.Label>
          <Input
            type="number"
            min="0"
            step="1"
            mt="8px"
            value={xRaw}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXRaw(e.target.value)}
            placeholder="e.g. 3"
          />
        </Field.Root>
      </Flex>

      {mValidX && (
        <Box mt="24px">
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="12px">
            <ResultStat
              label={`inverse of ${xRaw} mod ${m}`}
              value={String(additiveInverse(parseElement(xRaw)!, m!))}
              mono
            />
          </SimpleGrid>
        </Box>
      )}

      {pairs && (
        <Box mt="32px">
          <Heading as="h2" fontSize="lg" m="0">
            All additive inverses in ℤ/{m}ℤ
          </Heading>
          <Box overflowX="auto" mt="16px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
            <Table.Root size="sm" variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>x</Table.ColumnHeader>
                  <Table.ColumnHeader>inverse (&minus;x mod m)</Table.ColumnHeader>
                  <Table.ColumnHeader>x + inverse</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {pairs.map((p) => (
                  <Table.Row key={p.x}>
                    <Table.Cell>{p.x}</Table.Cell>
                    <Table.Cell color="var(--accent)" fontWeight="semibold">{p.inverse}</Table.Cell>
                    <Table.Cell>{p.x + p.inverse} ≡ 0 (mod {m})</Table.Cell>
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
