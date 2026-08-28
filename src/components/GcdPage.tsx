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
import { extendedGcd, type GcdResult } from '../lib/gcd'

const inputLimit = 10 ** 7

function parsePositiveInt(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (n < 1 || n > inputLimit) return null
  return n
}

function computeResult(aRaw: string, bRaw: string): { result: GcdResult | null; error: string } {
  const a = parsePositiveInt(aRaw)
  const b = parsePositiveInt(bRaw)
  if (a === null && aRaw.trim() !== '') {
    return { result: null, error: 'Must be a positive integer (1 – 10,000,000).' }
  }
  if (b === null && bRaw.trim() !== '') {
    return { result: null, error: 'Must be a positive integer (1 – 10,000,000).' }
  }
  if (a === null || b === null) {
    return { result: null, error: '' }
  }
  try {
    return { result: extendedGcd(a, b), error: '' }
  } catch {
    return { result: null, error: 'Invalid input — must be a positive integer.' }
  }
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

function getInitialParams() {
  if (typeof window === 'undefined') return { a: '240', b: '46' }
  const params = new URLSearchParams(window.location.search)
  return {
    a: params.get('a') || '240',
    b: params.get('b') || '46',
  }
}

export function GcdPage() {
  const initial = getInitialParams()
  const [aRaw, setARaw] = useState(initial.a)
  const [bRaw, setBRaw] = useState(initial.b)

  const { result, error } = computeResult(aRaw, bRaw)

  const aValid = parsePositiveInt(aRaw) !== null
  const bValid = parsePositiveInt(bRaw) !== null
  const aInvalid = aRaw.trim() !== '' && !aValid
  const bInvalid = bRaw.trim() !== '' && !bValid

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">
        GCD &mdash; Extended Euclidean
      </Heading>
      <Text mt="8px" color="var(--text)">
        Compute the greatest common divisor of two positive integers with full
        Bezout coefficients. The table updates as you type.
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
        {result
          ? <>gcd({result.a}, {result.b}) = {result.gcd}</>
          : <>gcd({aRaw.trim() || 'a'}, {bRaw.trim() || 'b'})</>
        }
      </Text>

      <Flex gap="16px" flexWrap="wrap" align="flex-end">
        <Field.Root invalid={aInvalid} maxW="200px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="6px">
            a
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              bg={aValid ? 'var(--accent)' : 'var(--text)'}
              opacity={aValid ? 1 : 0.2}
            />
          </Field.Label>
          <Input
            type="number"
            min="1"
            max={inputLimit}
            step="1"
            mt="8px"
            value={aRaw}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setARaw(e.target.value)}
            placeholder="e.g. 240"
          />
        </Field.Root>
        <Field.Root invalid={bInvalid} maxW="200px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="6px">
            b
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              bg={bValid ? 'var(--accent)' : 'var(--text)'}
              opacity={bValid ? 1 : 0.2}
            />
          </Field.Label>
          <Input
            type="number"
            min="1"
            max={inputLimit}
            step="1"
            mt="8px"
            value={bRaw}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBRaw(e.target.value)}
            placeholder="e.g. 46"
          />
        </Field.Root>
      </Flex>
      {(aInvalid || bInvalid) && (
        <Field.Root invalid maxW="200px">
          <Field.ErrorText mt="8px" fontSize="sm">
            {error}
          </Field.ErrorText>
        </Field.Root>
      )}

      {result && (
        <Box mt="32px">
          <Heading as="h2" fontSize="lg" m="0">
            Result
          </Heading>

          <SimpleGrid columns={{ base: 1, sm: 3 }} gap="12px" mt="16px">
            <ResultStat label="r (gcd)" value={String(result.gcd)} />
            <ResultStat label="s" value={String(result.s)} mono />
            <ResultStat label="t" value={String(result.t)} mono />
          </SimpleGrid>

          <Box
            mt="12px"
            p="16px 20px"
            fontFamily="mono"
            borderWidth="1px"
            borderColor="var(--accent-border)"
            borderRadius="12px"
            bg="var(--accent-bg)"
          >
            <Text fontSize="sm" color="var(--text)">
              a × s + b × t = r
            </Text>
            <Text mt="8px" fontSize="lg" fontWeight="bold" color="var(--text-h)">
              {result.a} × (<Text as="span" color="var(--accent)">{result.s}</Text>)
              {' + '}
              {result.b} × (<Text as="span" color="var(--accent)">{result.t}</Text>)
              {' = '}{result.gcd}
            </Text>
          </Box>

          <Heading as="h2" fontSize="lg" mt="36px" mb="12px">
            Working table
          </Heading>

          <Box overflowX="auto" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
            <Table.Root size="sm" variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader rowSpan={2}>q</Table.ColumnHeader>
                  <Table.ColumnHeader colSpan={3} textAlign="center" borderLeftWidth="1px" borderLeftColor="var(--border)">r</Table.ColumnHeader>
                  <Table.ColumnHeader colSpan={3} textAlign="center" borderLeftWidth="1px" borderLeftColor="var(--border)">s</Table.ColumnHeader>
                  <Table.ColumnHeader colSpan={3} textAlign="center" borderLeftWidth="1px" borderLeftColor="var(--border)">t</Table.ColumnHeader>
                </Table.Row>
                <Table.Row>
                  <Table.ColumnHeader borderLeftWidth="1px" borderLeftColor="var(--border)">r&#8321;</Table.ColumnHeader>
                  <Table.ColumnHeader>r&#8322;</Table.ColumnHeader>
                  <Table.ColumnHeader>r</Table.ColumnHeader>
                  <Table.ColumnHeader borderLeftWidth="1px" borderLeftColor="var(--border)">s&#8321;</Table.ColumnHeader>
                  <Table.ColumnHeader>s&#8322;</Table.ColumnHeader>
                  <Table.ColumnHeader>s</Table.ColumnHeader>
                  <Table.ColumnHeader borderLeftWidth="1px" borderLeftColor="var(--border)">t&#8321;</Table.ColumnHeader>
                  <Table.ColumnHeader>t&#8322;</Table.ColumnHeader>
                  <Table.ColumnHeader>t</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {result.rows.map((row, i) => {
                  const isFinal = i === result.rows.length - 1
                  const highlight = (idx: number) => isFinal && (idx === 2 || idx === 5 || idx === 8)
                  return (
                    <Table.Row
                      key={i}
                      fontWeight={isFinal ? 'semibold' : 'normal'}
                      bg={isFinal ? 'var(--accent-bg)' : 'transparent'}
                    >
                      <Table.Cell>{row.quotient}</Table.Cell>
                      <Table.Cell borderLeftWidth="1px" borderLeftColor="var(--border)">{row.r1.toLocaleString()}</Table.Cell>
                      <Table.Cell>{row.r2.toLocaleString()}</Table.Cell>
                      <Table.Cell
                        fontWeight={highlight(3) ? 'bold' : undefined}
                        color={highlight(3) ? 'var(--accent)' : undefined}
                      >{row.r.toLocaleString()}</Table.Cell>
                      <Table.Cell borderLeftWidth="1px" borderLeftColor="var(--border)">{row.s1.toLocaleString()}</Table.Cell>
                      <Table.Cell>{row.s2.toLocaleString()}</Table.Cell>
                      <Table.Cell
                        fontWeight={highlight(6) ? 'bold' : undefined}
                        color={highlight(6) ? 'var(--accent)' : undefined}
                      >{row.s.toLocaleString()}</Table.Cell>
                      <Table.Cell borderLeftWidth="1px" borderLeftColor="var(--border)">{row.t1.toLocaleString()}</Table.Cell>
                      <Table.Cell>{row.t2.toLocaleString()}</Table.Cell>
                      <Table.Cell
                        fontWeight={highlight(9) ? 'bold' : undefined}
                        color={highlight(9) ? 'var(--accent)' : undefined}
                      >{row.t.toLocaleString()}</Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </Box>
          <Text mt="8px" color="var(--text)" fontSize="sm">
            Each row computes:
          </Text>
          <Text mt="4px" color="var(--text)" fontSize="sm" fontFamily="mono">
            r = r₁ − q × r₂
          </Text>
          <Text color="var(--text)" fontSize="sm" fontFamily="mono">
            s = s₁ − q × s₂
          </Text>
          <Text color="var(--text)" fontSize="sm" fontFamily="mono">
            t = t₁ − q × t₂
          </Text>
          <Text mt="8px" color="var(--text)" fontSize="sm">
            The loop stops at r = 0, where gcd = r₂ with coefficients (s₂, t₂).
          </Text>
        </Box>
      )}
    </Box>
  )
}
