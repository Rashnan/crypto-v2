import { useState } from 'react'
import { Box, Button, Field, Flex, Heading, IconButton, Input, SimpleGrid, Stat, Table, Text } from '@chakra-ui/react'
import { Plus, Trash } from 'lucide-react'
import { solveCrtSystem, type Congruence } from '../lib/crt'
import { mod } from '../lib/modular'
import { attemptCalculation } from '../lib/calculation'

const modulusLimit = 100000

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

function blockInvalidKeys(e: React.KeyboardEvent, allowMinus = true) {
  const el = e.target as HTMLInputElement
  if (allowMinus && e.key === '-' && el.selectionStart === 0 && !el.value.includes('-')) return
  if (['e', 'E', '+', '.', ' '].includes(e.key)) e.preventDefault()
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <Stat.Root p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" bg="var(--bg)">
      <Stat.Label color="var(--text)" fontSize="sm" fontWeight="medium">{label}</Stat.Label>
      <Stat.ValueText fontSize="2xl" fontWeight="bold" color="var(--accent)" fontFamily="mono">{value}</Stat.ValueText>
    </Stat.Root>
  )
}

interface Row {
  a: string
  m: string
}

export function SimultaneousPage({ title = 'Simultaneous (mod)' }: { title?: string }) {
  const [rows, setRows] = useState<Row[]>([
    { a: '2', m: '3' },
    { a: '3', m: '5' },
  ])

  const setRow = (i: number, key: 'a' | 'm', v: string) => {
    const next = rows.slice()
    next[i] = { ...next[i], [key]: v }
    setRows(next)
  }
  const addRow = () => setRows([...rows, { a: '0', m: '2' }])
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i))

  const parsed: (Congruence | null)[] = rows.map((r) => {
    const a = parseInteger(r.a)
    const m = parseModulus(r.m)
    return a !== null && m !== null ? { a, m } : null
  })
  const valid = rows.length > 0 && parsed.every((c) => c !== null)
  const { result, error: calculationError } = valid
    ? attemptCalculation(() => solveCrtSystem(parsed as Congruence[]))
    : { result: null, error: '' }

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">
        {title}
      </Heading>
      <Text mt="8px" color="var(--text)">
        Solve a system of linear congruences x ≡ aᵢ (mod mᵢ) with the Chinese
        Remainder Theorem. A unique solution exists mod m₁·m₂·… when the moduli
        are pairwise coprime.
      </Text>

      <Flex direction="column" gap="16px" align="flex-start" mt="24px">
        {rows.map((row, i) => {
          const aInvalid = parseInteger(row.a) === null
          const mInvalid = parseModulus(row.m) === null
          return (
            <Flex key={i} gap="8px" align="flex-end" w="full" maxW="320px">
              <Field.Root invalid={aInvalid} maxW="120px" flex="1" minW="0">
                <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium">a{i + 1}</Field.Label>
                <Input type="number" step="1" mt="6px" value={row.a} onChange={(e) => setRow(i, 'a', e.target.value)} onKeyDown={(e) => blockInvalidKeys(e, true)} placeholder="residue" />
              </Field.Root>
              <Field.Root invalid={mInvalid} maxW="120px" flex="1" minW="0">
                <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium">m{i + 1}</Field.Label>
                <Input type="number" step="1" mt="6px" value={row.m} onChange={(e) => setRow(i, 'm', e.target.value)} onKeyDown={(e) => blockInvalidKeys(e, false)} placeholder="modulus" />
              </Field.Root>
              <IconButton
                variant="ghost"
                aria-label="Remove congruence"
                flex="0 0 auto"
                color="var(--text)"
                opacity={rows.length > 1 ? 1 : 0.3}
                disabled={rows.length <= 1}
                onClick={() => removeRow(i)}
              >
                <Trash size={16} />
              </IconButton>
            </Flex>
          )
        })}
        <Button variant="ghost" size="sm" color="var(--accent)" aria-label="Add congruence" onClick={addRow}>
          <Plus size={16} /> Add
        </Button>
      </Flex>

      {rows.some((r) => parseInteger(r.a) === null || parseModulus(r.m) === null) && (
        <Field.Root invalid maxW="300px">
          <Field.ErrorText mt="8px" fontSize="sm">
            a must be an integer; m must be an integer ≥ 2 (up to 100,000).
          </Field.ErrorText>
        </Field.Root>
      )}
      {calculationError && <Box mt="12px" p="16px 20px" fontFamily="mono" borderWidth="1px" borderColor="red.300" borderRadius="12px" bg="red.50"><Text fontSize="sm" color="#ef4444">{calculationError}</Text></Box>}

      {result && (
        <Box mt="32px">
          <Heading as="h2" fontSize="lg" m="0">
            System
          </Heading>
          <Box mt="8px" fontFamily="mono" fontSize="lg" color="var(--text-h)">
            {result.congruences.map((c, i) => (
              <Box key={i}>
                x ≡ <Text as="span" color="var(--accent)">{c.a}</Text> (mod {c.m})
              </Box>
            ))}
          </Box>

          <Heading as="h2" fontSize="lg" mt="28px" mb="12px">Solving table</Heading>
          {result.table ? (
            <>
              <Text mb="12px" fontSize="sm" color="var(--text)">
                M is the product of the moduli, Mᵢ = M / mᵢ, and yᵢ is the inverse of Mᵢ modulo mᵢ.
              </Text>
              <Box overflowX="auto" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
                <Table.Root size="sm" variant="line" striped>
                  <Table.Header>
                    <Table.Row>
                      {['i', 'aᵢ', 'mᵢ', 'Mᵢ = M / mᵢ', 'yᵢ = Mᵢ⁻¹ mod mᵢ', 'aᵢMᵢyᵢ'].map((label) => <Table.ColumnHeader key={label} whiteSpace="nowrap">{label}</Table.ColumnHeader>)}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {result.table.rows.map((row, i) => (
                      <Table.Row key={i} fontFamily="mono">
                        <Table.Cell>{i + 1}</Table.Cell>
                        <Table.Cell>{row.a}</Table.Cell>
                        <Table.Cell>{row.m}</Table.Cell>
                        <Table.Cell>{row.partialModulus}</Table.Cell>
                        <Table.Cell>{row.inverse}</Table.Cell>
                        <Table.Cell>{row.term}</Table.Cell>
                      </Table.Row>
                    ))}
                    <Table.Row fontFamily="mono" fontWeight="semibold">
                      <Table.Cell colSpan={5}>Σ aᵢMᵢyᵢ</Table.Cell>
                      <Table.Cell color="var(--accent)">{result.table.sum}</Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Box>
            </>
          ) : (
            <>
              <Text mb="12px" fontSize="sm" color="var(--text)">The moduli are not pairwise coprime. Combine the congruences using their GCD and LCM.</Text>
              <Box overflowX="auto" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
                <Table.Root size="sm" variant="line" striped>
                  <Table.Header>
                    <Table.Row>
                      {['Current x₀', 'Current M', 'aᵢ', 'mᵢ', 'gcd(M, mᵢ)', 'Combined solution'].map((label) => <Table.ColumnHeader key={label} whiteSpace="nowrap">{label}</Table.ColumnHeader>)}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {result.steps.map((step, i) => (
                      <Table.Row key={i} fontFamily="mono">
                        <Table.Cell>{step.x0}</Table.Cell>
                        <Table.Cell>{step.M}</Table.Cell>
                        <Table.Cell>{step.a}</Table.Cell>
                        <Table.Cell>{step.m}</Table.Cell>
                        <Table.Cell>{step.d}</Table.Cell>
                        <Table.Cell whiteSpace="nowrap">{step.consistent ? `x ≡ ${step.x} (mod ${step.Mnext})` : 'No solution'}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </>
          )}

          <Heading as="h2" fontSize="lg" mt="28px" mb="12px">Calculation</Heading>
          <Flex direction="column" gap="12px">
            {(result.table ? [{ equations: result.table.equations }] : result.steps).map((step, i) => (
              <Box key={i} p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
                {!result.table && <Text mb="8px" fontWeight="semibold">Combine congruence {i + 2}</Text>}
                {step.equations.map((equation, j) => <Text key={j} mt={j ? '8px' : '0'} fontFamily="mono" fontSize="sm" color="var(--text-h)" overflowWrap="anywhere">{equation}</Text>)}
              </Box>
            ))}
          </Flex>

          <Heading as="h2" fontSize="lg" m="0" mt="28px">
            Result
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="12px" mt="12px">
            <ResultStat label="solvable" value={result.solvable ? 'Yes' : 'No'} />
            <ResultStat label="combined modulus M" value={String(result.M)} />
          </SimpleGrid>

          {!result.solvable && result.steps.length > 0 && (
            <Box mt="12px" p="16px 20px" fontFamily="mono" borderWidth="1px" borderColor="red.300" borderRadius="12px" bg="red.50">
              <Text fontSize="sm" color="var(--text)">
                Folded in x ≡ {result.congruences[result.failIndex!].a} (mod {result.congruences[result.failIndex!].m}): {result.reason}
              </Text>
              <Text mt="4px" fontSize="sm" color="var(--text)">
                No integer x satisfies all congruences.
              </Text>
            </Box>
          )}

          {result.solvable && (
            <>
              <Box mt="12px" p="16px 20px" fontFamily="mono" boxShadow="0 4px 14px rgb(0 0 0 / 8%)" borderRadius="12px" bg="var(--accent-bg)">
                <Text fontSize="lg" fontWeight="bold" color="var(--text-h)">
                  x ≡ <Text as="span" color="var(--accent)">{result.x0}</Text> (mod {result.M})
                </Text>
                {result.M > 1 && (
                  <Text mt="4px" fontSize="sm" color="var(--text)">
                    i.e. x = {result.x0}, {result.x0 + result.M}, {result.x0 + 2 * result.M}, …
                  </Text>
                )}
              </Box>


              <Heading as="h2" fontSize="lg" mt="28px" mb="12px">
                Verification table
              </Heading>
              <Box overflowX="auto" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
                <Table.Root size="sm" variant="line" striped>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>x₀</Table.ColumnHeader>
                      {result.congruences.map((c, i) => (
                        <Table.ColumnHeader key={i} borderLeftWidth="1px" borderLeftColor="var(--border)">x mod {c.m}</Table.ColumnHeader>
                      ))}
                      {result.congruences.map((c, i) => (
                        <Table.ColumnHeader key={`a${i}`} borderLeftWidth="1px" borderLeftColor="var(--border)">needs {c.a}</Table.ColumnHeader>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell fontWeight="semibold" color="var(--accent)">{result.x0}</Table.Cell>
                      {result.congruences.map((c, i) => (
                        <Table.Cell key={i} borderLeftWidth="1px" borderLeftColor="var(--border)">{mod(result.x0, c.m)}</Table.Cell>
                      ))}
                      {result.congruences.map((c, i) => {
                        const ok = mod(result.x0, c.m) === c.a
                        return (
                          <Table.Cell key={`a${i}`} borderLeftWidth="1px" borderLeftColor="var(--border)" color={ok ? 'var(--accent)' : '#ef4444'} fontWeight={ok ? 'semibold' : 'normal'}>
                            {c.a} {ok ? '✓' : '✗'}
                          </Table.Cell>
                        )
                      })}
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Box>
              <Text mt="8px" color="var(--text)" fontSize="sm">
                x₀ satisfies every congruence.
              </Text>
            </>
          )}
        </Box>
      )}
    </Box>
  )
}
