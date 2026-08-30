import { useState } from 'react'
import { Box, Field, Flex, Heading, Input, SimpleGrid, Stat, Table, Text } from '@chakra-ui/react'
import { solveLinearCongruence } from '../lib/linear-congruence'
import { mod } from '../lib/modular'

const modulusLimit = 10_000

function parseInteger(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^-?\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (!Number.isSafeInteger(n) || Math.abs(n) > 10 ** 7) return null
  return n
}

function parseModulus(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (n < 2 || n > modulusLimit) return null
  return n
}

function blockInvalidKeys(e: React.KeyboardEvent) {
  const el = e.target as HTMLInputElement
  if (e.key === '-' && el.selectionStart === 0 && !el.value.includes('-')) return
  if (['e', 'E', '+', '.', ' '].includes(e.key)) e.preventDefault()
}

function ResultStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Stat.Root p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" bg="var(--bg)">
      <Stat.Label color="var(--text)" fontSize="sm" fontWeight="medium">{label}</Stat.Label>
      <Stat.ValueText fontSize="2xl" fontWeight="bold" color="var(--accent)" fontFamily="mono">{value}</Stat.ValueText>
      {sub && <Text mt="4px" fontFamily="mono" fontSize="xs" color="var(--text)">{sub}</Text>}
    </Stat.Root>
  )
}

export function SingleVariablePage() {
  const [aRaw, setARaw] = useState('3')
  const [bRaw, setBRaw] = useState('1')
  const [mRaw, setMRaw] = useState('7')

  const a = parseInteger(aRaw)
  const b = parseInteger(bRaw)
  const m = parseModulus(mRaw)
  const aInvalid = a === null
  const bInvalid = b === null
  const mInvalid = m === null
  const hasError = aInvalid || bInvalid || mInvalid
  const result = a !== null && b !== null && m !== null ? solveLinearCongruence(a, b, m) : null

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">
        Single Variable (mod)
      </Heading>
      <Text mt="8px" color="var(--text)">
        Solve a·x ≡ b (mod m). Solutions exist iff d = gcd(a, m) divides b, in which
        case there are exactly d solutions modulo m.
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
          ? <>{result.a}x ≡ {result.b} (mod {result.m})</>
          : <>ax ≡ b (mod m)</>}
      </Text>

      <Flex gap="16px" flexWrap="wrap" align="flex-end">
        <Field.Root invalid={aInvalid} maxW="160px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="6px">
            a
            <Box w="8px" h="8px" borderRadius="full" bg={a !== null ? 'var(--accent)' : 'var(--text)'} opacity={a !== null ? 1 : 0.2} />
          </Field.Label>
          <Input type="number" step="1" mt="8px" value={aRaw} onChange={(e) => setARaw(e.target.value)} onKeyDown={blockInvalidKeys} placeholder="e.g. 3" />
        </Field.Root>
        <Field.Root invalid={bInvalid} maxW="160px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="6px">
            b
            <Box w="8px" h="8px" borderRadius="full" bg={b !== null ? 'var(--accent)' : 'var(--text)'} opacity={b !== null ? 1 : 0.2} />
          </Field.Label>
          <Input type="number" step="1" mt="8px" value={bRaw} onChange={(e) => setBRaw(e.target.value)} onKeyDown={blockInvalidKeys} placeholder="e.g. 1" />
        </Field.Root>
        <Field.Root invalid={mInvalid} maxW="160px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="6px">
            m
            <Box w="8px" h="8px" borderRadius="full" bg={m !== null ? 'var(--accent)' : 'var(--text)'} opacity={m !== null ? 1 : 0.2} />
          </Field.Label>
          <Input type="number" step="1" mt="8px" value={mRaw} onChange={(e) => setMRaw(e.target.value)} onKeyDown={blockInvalidKeys} placeholder="e.g. 7" />
        </Field.Root>
      </Flex>
      {hasError && (
        <Field.Root invalid maxW="160px">
          <Field.ErrorText mt="8px" fontSize="sm">
            a, b must be integers up to ±10,000,000; m must be an integer ≥ 2 (up to 10,000).
          </Field.ErrorText>
        </Field.Root>
      )}

      {result && (
        <Box mt="32px">
          <Heading as="h2" fontSize="lg" m="0">Result</Heading>

          <SimpleGrid columns={{ base: 1, sm: 3 }} gap="12px" mt="16px">
            <ResultStat label="d = gcd(a, m)" value={String(result.d)} />
            <ResultStat label="solutions" value={String(result.d)} />
            <ResultStat label="period (m/d)" value={String(result.period)} />
          </SimpleGrid>

          {!result.solvable && (
            <Box mt="12px" p="16px 20px" fontFamily="mono" borderWidth="1px" borderColor="red.300" borderRadius="12px" bg="red.50">
              <Text fontSize="sm" color="var(--text)">
                d = gcd({result.a}, {result.m}) = {result.d} does not divide b = {result.b}
              </Text>
              <Text mt="4px" fontSize="sm" color="var(--text)">
                No solutions exist for {result.a}x ≡ {result.b} (mod {result.m}).
              </Text>
            </Box>
          )}

          {result.solvable && (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap="12px" mt="12px">
                <ResultStat
                  label={`(a/d)⁻¹ mod ${result.period}`}
                  value={String(result.aRedInverse)}
                  sub={`invert ${result.aRed} mod ${result.period}`}
                />
                <ResultStat
                  label={`x₀ = (b/d)·r mod ${result.period}`}
                  value={String(result.x0)}
                  sub={`(${result.bRed} × ${result.aRedInverse}) mod ${result.period}`}
                />
              </SimpleGrid>

              <Box mt="12px" p="16px 20px" fontFamily="mono" boxShadow="0 4px 14px rgb(0 0 0 / 8%)" borderRadius="12px" bg="var(--accent-bg)">
                {result.period === 1 ? (
                  <Text fontSize="lg" fontWeight="bold" color="var(--text-h)">
                    Every residue is a solution: x ≡ 0, 1, …, {result.m - 1} (mod {result.m})
                  </Text>
                ) : (
                  <>
                    <Text fontSize="lg" fontWeight="bold" color="var(--text-h)">
                      x ≡ <Text as="span" color="var(--accent)">{result.x0}</Text> (mod {result.period})
                    </Text>
                    <Text mt="4px" fontSize="sm" color="var(--text)">
                      {result.d > 1
                        ? <>i.e. the {result.d} residues: {(result.solutions ?? []).join(', ')}</>
                        : <>x = {result.solutions?.[0]}</>}
                    </Text>
                  </>
                )}
              </Box>

              <Heading as="h2" fontSize="lg" mt="36px" mb="12px">
                Verification table
              </Heading>
              <Box overflowX="auto" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
                <Table.Root size="sm" variant="line" striped>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>x</Table.ColumnHeader>
                      <Table.ColumnHeader borderLeftWidth="1px" borderLeftColor="var(--border)">a×x</Table.ColumnHeader>
                      <Table.ColumnHeader>a×x mod m</Table.ColumnHeader>
                      <Table.ColumnHeader borderLeftWidth="1px" borderLeftColor="var(--border)">equals b?</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {(result.solutions ?? []).map((x) => {
                      const ax = result.a * x
                      const axm = mod(ax, result.m)
                      const ok = axm === mod(result.b, result.m)
                      return (
                        <Table.Row key={x}>
                          <Table.Cell fontWeight="semibold" color={ok ? 'var(--accent)' : 'var(--text)'}>{x}</Table.Cell>
                          <Table.Cell borderLeftWidth="1px" borderLeftColor="var(--border)">{ax}</Table.Cell>
                          <Table.Cell>{axm}</Table.Cell>
                          <Table.Cell borderLeftWidth="1px" borderLeftColor="var(--border)" color={ok ? 'var(--accent)' : '#ef4444'}>
                            {axm} ≡ {mod(result.b, result.m)}
                          </Table.Cell>
                        </Table.Row>
                      )
                    })}
                    {result.solutions && result.solutions.length === 0 && (
                      <Table.Row>
                        <Table.Cell colSpan={4}>No solutions</Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Root>
              </Box>
              <Text mt="8px" color="var(--text)" fontSize="sm">
                Each row verifies that a×x ≡ b (mod {result.m}).
              </Text>
            </>
          )}
        </Box>
      )}
    </Box>
  )
}
