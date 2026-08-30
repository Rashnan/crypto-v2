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
import {
  allMultiplicativeInverses,
  gcd,
  mod,
  multiplicativeInverse,
  type MultiplicativeInverse,
} from '../lib/modular'

const tableLimit = 2000

function parseModulus(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (n < 2) return null
  return n
}

function parseElement(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (n < 0) return null
  return n
}

export function MultiplicativeInversePage() {
  const [mRaw, setMRaw] = useState('7')
  const [xRaw, setXRaw] = useState('3')

  const m = parseModulus(mRaw)
  const mValid = m !== null
  const mInvalid = !mValid

  const xParsed = parseElement(xRaw)
  const xValid = m !== null && xParsed !== null
  const xInvalid = !xValid

  const pairs: MultiplicativeInverse[] | null = m !== null ? allMultiplicativeInverses(m) : null

  let singleResult: { ok: boolean; text: string; statusLine: string; note?: string } | null = null
  if (m !== null && xParsed !== null) {
    const normalized = mod(xParsed, m)
    const g = gcd(normalized, m)
    const r = multiplicativeInverse(xParsed, m)
    if (r.exists) {
      singleResult = {
        ok: true,
        text: String(r.inverse),
        statusLine: `gcd(${xParsed}, ${m}) = ${g}`,
        note: 'coprime, so an inverse exists',
      }
    } else {
      singleResult = {
        ok: false,
        text: 'No inverse',
        statusLine: `gcd(${xParsed}, ${m}) = ${g} ≠ 1`,
      }
    }
  }

  const showTable = m !== null && m <= tableLimit

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">
        Multiplicative Inverse (mod)
      </Heading>
      <Text mt="8px" color="var(--text)">
        The multiplicative inverse of x mod m is an element y with (x·y) mod m = 1.
        It exists only when gcd(x, m) = 1.
      </Text>

      <Text
        mt="24px"
        mb="24px"
        fontSize={{ base: 'xl', md: '2xl' }}
        fontWeight="bold"
        color="var(--accent)"
        fontFamily="mono"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {mValid && xParsed !== null
          ? <>{xParsed}<sup>−1</sup> (mod {m})</>
          : <>x<sup>−1</sup> (mod m)</>}
      </Text>

      <Flex gap="16px" flexWrap="wrap" align="flex-end">
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
            step="1"
            mt="8px"
            value={mRaw}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMRaw(e.target.value)}
            placeholder="e.g. 7"
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

      {singleResult && (
        <Box mt="24px">
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="12px">
            <Stat.Root p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" bg="var(--bg)">
              <Stat.Label color="var(--text)" fontSize="sm" fontWeight="medium">
                {`inverse of ${xRaw} mod ${m}`}
              </Stat.Label>
              <Text mt="8px" fontFamily="mono" fontSize="md" color="var(--text)">
                {singleResult.statusLine}
              </Text>
              {singleResult.note && (
                <Text mt="4px" fontSize="md" color={singleResult.ok ? 'var(--accent)' : undefined}>
                  {singleResult.note}
                </Text>
              )}
              <Text mt="4px" fontFamily="mono" fontSize="2xl" fontWeight="bold" color={singleResult.ok ? 'var(--accent)' : '#ef4444'}>
                {singleResult.text}
              </Text>
            </Stat.Root>
          </SimpleGrid>
        </Box>
      )}

      {pairs && showTable && (
        <Box mt="32px">
          <Heading as="h2" fontSize="lg" m="0">
            Units of ℤ<sub>{m}</sub> and their inverses
          </Heading>
          <Box overflow="auto" maxH="440px" mt="16px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
            <Table.Root size="sm" variant="line" striped>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>x</Table.ColumnHeader>
                  <Table.ColumnHeader>inverse (x⁻¹ mod m)</Table.ColumnHeader>
                  <Table.ColumnHeader>proof (x · inverse)</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {pairs.map((p) => (
                  <Table.Row key={p.x}>
                    <Table.Cell>{p.x}</Table.Cell>
                    <Table.Cell color="var(--accent)" fontWeight="semibold">{p.inverse}</Table.Cell>
                    <Table.Cell>{p.x} × {p.inverse} = {p.x * p.inverse} ≡ 1 (mod {m})</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      )}

      {m !== null && !showTable && (
        <Text mt="8px" color="var(--text)" fontSize="sm">
          Table hidden for m &gt; {tableLimit.toLocaleString()}.
        </Text>
      )}
    </Box>
  )
}
