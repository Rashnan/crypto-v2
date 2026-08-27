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
import { extendedGcd } from '../lib/gcd'

const inputLimit = 10 ** 7

function parsePositiveInt(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (n < 1 || n > inputLimit) return null
  return n
}

function blockInvalidKeys(e: React.KeyboardEvent) {
  if (['-', 'e', 'E', '+', '.', ' '].includes(e.key)) {
    e.preventDefault()
  }
}

interface DiophantineResult {
  a: number
  b: number
  c: number
  g: number
  solvable: boolean
  x0: number
  y0: number
  stepX: number
  stepY: number
}

function solve(a: number, b: number, c: number): DiophantineResult {
  const { gcd: g, s, t } = extendedGcd(a, b)
  if (c % g !== 0) {
    return { a, b, c, g, solvable: false, x0: 0, y0: 0, stepX: 0, stepY: 0 }
  }
  const scale = c / g
  return {
    a, b, c, g,
    solvable: true,
    x0: s * scale,
    y0: t * scale,
    stepX: b / g,
    stepY: a / g,
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

export function DiophantinePage() {
  const [aRaw, setARaw] = useState('240')
  const [bRaw, setBRaw] = useState('46')
  const [cRaw, setCRaw] = useState('10')

  const a = parsePositiveInt(aRaw)
  const b = parsePositiveInt(bRaw)
  const c = parsePositiveInt(cRaw)
  const aInvalid = aRaw.trim() !== '' && a === null
  const bInvalid = bRaw.trim() !== '' && b === null
  const cInvalid = cRaw.trim() !== '' && c === null
  const hasError = aInvalid || bInvalid || cInvalid
  const result = a !== null && b !== null && c !== null ? solve(a, b, c) : null

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">
        Linear Diophantine
      </Heading>
      <Text mt="8px" color="var(--text)">
        Solve ax + by = c for integer x, y. Solutions exist iff gcd(a, b) divides c.
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
          ? <>{result.a}x + {result.b}y = {result.c}</>
          : <>{aRaw.trim() || 'a'}x + {bRaw.trim() || 'b'}y = {cRaw.trim() || 'c'}</>
        }
      </Text>

      <Flex gap="16px" flexWrap="wrap" align="flex-end">
        <Field.Root invalid={aInvalid} maxW="160px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="6px">
            a
            <Box w="8px" h="8px" borderRadius="full" bg={a !== null ? 'var(--accent)' : 'var(--text)'} opacity={a !== null ? 1 : 0.2} />
          </Field.Label>
          <Input
            type="number"
            min="1"
            max={inputLimit}
            step="1"
            mt="8px"
            value={aRaw}
            onChange={(e) => setARaw(e.target.value)}
            onKeyDown={blockInvalidKeys}
            placeholder="e.g. 240"
          />
        </Field.Root>
        <Field.Root invalid={bInvalid} maxW="160px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="6px">
            b
            <Box w="8px" h="8px" borderRadius="full" bg={b !== null ? 'var(--accent)' : 'var(--text)'} opacity={b !== null ? 1 : 0.2} />
          </Field.Label>
          <Input
            type="number"
            min="1"
            max={inputLimit}
            step="1"
            mt="8px"
            value={bRaw}
            onChange={(e) => setBRaw(e.target.value)}
            onKeyDown={blockInvalidKeys}
            placeholder="e.g. 46"
          />
        </Field.Root>
        <Field.Root invalid={cInvalid} maxW="160px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="6px">
            c
            <Box w="8px" h="8px" borderRadius="full" bg={c !== null ? 'var(--accent)' : 'var(--text)'} opacity={c !== null ? 1 : 0.2} />
          </Field.Label>
          <Input
            type="number"
            min="0"
            max={inputLimit}
            step="1"
            mt="8px"
            value={cRaw}
            onChange={(e) => setCRaw(e.target.value)}
            onKeyDown={blockInvalidKeys}
            placeholder="e.g. 10"
          />
        </Field.Root>
      </Flex>
      {hasError && (
        <Field.Root invalid maxW="160px">
          <Field.ErrorText mt="8px" fontSize="sm">
            Must be a positive integer (1 – 10,000,000).
          </Field.ErrorText>
        </Field.Root>
      )}

      {result && (
        <Box mt="32px">
          <Heading as="h2" fontSize="lg" m="0">
            Result
          </Heading>

          <SimpleGrid columns={{ base: 1, sm: 3 }} gap="12px" mt="16px">
            <ResultStat label="gcd(a, b)" value={String(result.g)} />
            <ResultStat label="c mod gcd" value={String(result.c % result.g)} />
            <ResultStat label={result.solvable ? 'Solvable' : 'No solution'} value={result.solvable ? 'Yes' : 'No'} />
          </SimpleGrid>

          {!result.solvable && (
            <Box
              mt="12px"
              p="16px 20px"
              fontFamily="mono"
              borderWidth="1px"
              borderColor="red.300"
              borderRadius="12px"
              bg="red.50"
            >
              <Text fontSize="sm" color="var(--text)">
                gcd({result.a}, {result.b}) = {result.g} does not divide {result.c}
              </Text>
              <Text mt="4px" fontSize="sm" color="var(--text)">
                No integer solutions exist for {result.a}x + {result.b}y = {result.c}.
              </Text>
            </Box>
          )}

          {result.solvable && (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap="12px" mt="12px">
                <ResultStat label="x₀ (particular)" value={String(result.x0)} mono />
                <ResultStat label="y₀ (particular)" value={String(result.y0)} mono />
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
                  General solution:
                </Text>
                <Text mt="8px" fontSize="lg" fontWeight="bold" color="var(--text-h)">
                  x = <Text as="span" color="var(--accent)">{result.x0}</Text> + <Text as="span" color="var(--accent)">{result.stepX}</Text>k
                </Text>
                <Text mt="4px" fontSize="lg" fontWeight="bold" color="var(--text-h)">
                  y = <Text as="span" color="var(--accent)">{result.y0}</Text> − <Text as="span" color="var(--accent)">{result.stepY}</Text>k
                </Text>
                <Text mt="8px" fontSize="sm" color="var(--text)">
                  for any integer k
                </Text>
              </Box>

              <Heading as="h2" fontSize="lg" mt="36px" mb="12px">
                Verification table
              </Heading>

              <Box overflowX="auto" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
                <Table.Root size="sm" variant="line">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>k</Table.ColumnHeader>
                      <Table.ColumnHeader>x</Table.ColumnHeader>
                      <Table.ColumnHeader>y</Table.ColumnHeader>
                      <Table.ColumnHeader borderLeftWidth="1px" borderLeftColor="var(--border)">a×x</Table.ColumnHeader>
                      <Table.ColumnHeader>b×y</Table.ColumnHeader>
                      <Table.ColumnHeader borderLeftWidth="1px" borderLeftColor="var(--border)">a×x + b×y</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {[-2, -1, 0, 1, 2].map((k) => {
                      const x = result.x0 + result.stepX * k
                      const y = result.y0 - result.stepY * k
                      const ax = result.a * x
                      const by = result.b * y
                      return (
                        <Table.Row key={k} fontWeight={k === 0 ? 'semibold' : 'normal'} bg={k === 0 ? 'var(--accent-bg)' : 'transparent'}>
                          <Table.Cell>{k}</Table.Cell>
                          <Table.Cell>{x}</Table.Cell>
                          <Table.Cell>{y}</Table.Cell>
                          <Table.Cell borderLeftWidth="1px" borderLeftColor="var(--border)">{ax.toLocaleString()}</Table.Cell>
                          <Table.Cell>{by.toLocaleString()}</Table.Cell>
                          <Table.Cell borderLeftWidth="1px" borderLeftColor="var(--border)">{(ax + by).toLocaleString()}</Table.Cell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table.Root>
              </Box>
              <Text mt="8px" color="var(--text)" fontSize="sm">
                Row k = 0 is the particular solution. Each row satisfies a×x + b×y = c.
              </Text>
            </>
          )}
        </Box>
      )}
    </Box>
  )
}
