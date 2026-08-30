import { useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import {
  Box,
  createListCollection,
  Field,
  Flex,
  Heading,
  Input,
  Select,
  Table,
  Text,
} from '@chakra-ui/react'
import { gcd } from '../lib/modular'
import { determinantModDetail, matrixInverseDetail, type Matrix } from '../lib/matmod'

const sizeCollection = createListCollection({
  items: [
    { label: '2×2', value: '2' },
    { label: '3×3', value: '3' },
  ],
})

const modulusLimit = 100000

function parseModulus(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (n < 2 || n > modulusLimit) return null
  return n
}

function parseEntry(raw: string): number {
  if (!/^-?\d+$/.test(raw.trim())) return NaN
  return Number(raw.trim())
}

function buildMatrix(size: number, raw: string[]): { matrix: Matrix; ok: boolean } {
  const entries = raw.map(parseEntry)
  const ok = entries.length === size * size && entries.every((v) => !Number.isNaN(v))
  const flat = ok ? entries.slice(0, size * size) : Array(size * size).fill(0)
  const matrix: Matrix = []
  for (let i = 0; i < size; i++) {
    matrix.push(flat.slice(i * size, i * size + size))
  }
  return { matrix, ok }
}

function MathMatrix({ data, signs, hideValue }: { data: number[][]; signs?: string[][]; hideValue?: boolean }) {
  return (
    <math style={{ display: 'inline-block' }}>
      <mrow>
        <mo>(</mo>
        <mtable>
          {data.map((row, i) => (
            <mtr key={i}>
              {row.map((v, j) => (
                <mtd key={j} style={{ padding: '0.6em 0.7em', textAlign: 'center' }}>
                  {signs && (
                    <mrow>
                      <mo style={{ color: 'var(--text)', fontSize: '0.85em' }}>{signs[i][j]}</mo>
                      {!hideValue && <mn style={{ fontSize: '1.15em' }}>{v}</mn>}
                    </mrow>
                  )}
                  {!signs && <mn style={{ fontSize: '1.15em' }}>{v}</mn>}
                </mtd>
              ))}
            </mtr>
          ))}
        </mtable>
        <mo>)</mo>
      </mrow>
    </math>
  )
}

function signPattern(size: number): string[][] {
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => ((i + j) % 2 === 0 ? '+' : '−')),
  )
}

function MathOp({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ margin: '0 0.9em', fontSize: '1.4em', color: 'var(--text-h)' }}>
      {children}
    </span>
  )
}

function matmulMod(a: number[][], b: number[][], m: number): number[][] {
  return a.map((row) =>
    b[0].map((_, j) =>
      ((row.reduce((acc, v, k) => acc + v * b[k][j], 0) % m) + m) % m,
    ),
  )
}

export interface MatrixInverseSearch {
  m?: number
  size?: number
  entries?: string
}

export function MatrixInversePage({ search = {} }: { search?: MatrixInverseSearch }) {
  const initialSize = search.size ?? 2
  const initialEntries = search.entries?.split(',') ?? []
  const queryEntriesAreValid = initialEntries.length === initialSize * initialSize && initialEntries.every((entry) => /^-?\d+$/.test(entry))
  const [mRaw, setMRaw] = useState(String(search.m ?? 5))
  const [size, setSize] = useState(initialSize)
  const defaultMatrix = size === 2 ? ['3', '4', '2', '3'] : ['2', '1', '1', '3', '4', '5', '1', '6', '7']
  const [entries, setEntries] = useState<string[]>(queryEntriesAreValid ? initialEntries : defaultMatrix)

  const m = parseModulus(mRaw)
  const mValid = m !== null
  const mInvalid = !mValid

  const { matrix, ok } = buildMatrix(size, entries)
  const valueMode = m !== null && ok

  let detDetail: import('../lib/matmod').DeterminantDetail | null = null
  let result:
    | {
        invertible: true
        det: number
        detInverse: number
        inverse: Matrix
        cofactorMatrix: Matrix
        adjugate: Matrix
      }
    | { invertible: false; det: number; reason: string }
    | null = null
  if (valueMode) {
    detDetail = determinantModDetail(matrix, m!)
    const r = matrixInverseDetail(matrix, m!)
    if (r.invertible) {
      result = {
        invertible: true,
        det: r.det,
        detInverse: r.detInverse!,
        inverse: r.inverse!,
        cofactorMatrix: r.cofactorMatrix,
        adjugate: r.adjugate,
      }
    } else {
      result = {
        invertible: false,
        det: r.det,
        reason: `gcd(det(A), ${m}) = ${gcd(r.det, m!)} ≠ 1, so det has no inverse`,
      }
    }
  }

  const setEntry = (i: number, v: string) => {
    const next = entries.slice()
    next[i] = v
    setEntries(next)
  }

  const changeSize = (s: number) => {
    setSize(s)
    const defaults = s === 2 ? ['3', '4', '2', '3'] : ['2', '1', '1', '3', '4', '5', '1', '6', '7']
    setEntries(defaults)
  }

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">
        Matrix Inverse (mod)
      </Heading>
      <Text mt="8px" color="var(--text)">
        A matrix is invertible over ℤ<sub>{m ?? 'm'}</sub> iff det(A) and the modulus are coprime,
        in which case A⁻¹ = adj(A) · (det A)⁻¹ (mod m).
      </Text>

      <Flex gap="16px" flexWrap="wrap" align="flex-end" mt="24px">
        <Field.Root invalid={mInvalid} maxW="120px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium">m</Field.Label>
          <Input
            type="number"
            min="2"
            max={modulusLimit}
            step="1"
            mt="8px"
            value={mRaw}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMRaw(e.target.value)}
            placeholder="modulus"
          />
        </Field.Root>
        <Field.Root maxW="160px">
          <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium">Size</Field.Label>
          <Select.Root
            size="md"
            mt="8px"
            collection={sizeCollection}
            value={[String(size)]}
            onValueChange={(e) => changeSize(Number(e.value[0]))}
          >
            <Select.Trigger>
              <Select.ValueText>{size}×{size}</Select.ValueText>
            </Select.Trigger>
            <Select.Content>
              <Select.Item item="2">2×2</Select.Item>
              <Select.Item item="3">3×3</Select.Item>
            </Select.Content>
          </Select.Root>
        </Field.Root>
      </Flex>

      <Box mt="28px">
        <Heading as="h2" fontSize="lg" m="0" mb="12px">
          Matrix A
        </Heading>
        <Flex gap="28px" flexWrap="wrap" align="flex-start">
          <Box maxW={`${size === 2 ? 260 : 380}px`}>
            <Table.Root size="sm">
              <Table.Body>
                {Array.from({ length: size }).map((_, i) => (
                  <Table.Row key={i}>
                    {Array.from({ length: size }).map((_, j) => {
                      const idx = i * size + j
                      const entryInvalid = Number.isNaN(Number(entries[idx])) || (entries[idx] ?? '').trim() === ''
                      return (
                        <Table.Cell key={j} p="4px">
                          <Input
                            type="number"
                            step="1"
                            value={entries[idx] ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEntry(idx, e.target.value)}
                            textAlign="center"
                            fontFamily="mono"
                            aria-invalid={entryInvalid}
                            borderColor={entryInvalid ? '#ef4444' : undefined}
                            _focus={entryInvalid ? { borderColor: '#ef4444' } : undefined}
                          />
                        </Table.Cell>
                      )
                    })}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
          {valueMode && (
            <Box
              p="10px 14px"
              boxShadow="0 4px 14px rgb(0 0 0 / 8%)"
              borderRadius="12px"
              bg="var(--accent-bg)"
            >
              <Text fontSize="xs" color="var(--text)" fontWeight="medium" mb="6px">A =</Text>
              <MathMatrix data={matrix} />
            </Box>
          )}
        </Flex>
      </Box>

      {result && result.invertible && detDetail && (
        <Box mt="32px">
          <Heading as="h2" fontSize="lg" m="0">Result</Heading>
          <Flex gap="16px" flexWrap="wrap" mt="16px">
            <Box p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
              <Text fontSize="sm" color="var(--text)" fontWeight="medium">det(A) mod {m}</Text>
              <Text mt="4px" fontFamily="mono" fontSize="2xl" fontWeight="bold" color="var(--accent)">{result.det}</Text>
            </Box>
            <Box p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
              <Text fontSize="sm" color="var(--text)" fontWeight="medium">(det A)⁻¹ mod {m}</Text>
              <Text mt="4px" fontFamily="mono" fontSize="2xl" fontWeight="bold" color="var(--accent)">{result.detInverse}</Text>
            </Box>
          </Flex>
          <Text mt="16px" fontSize="sm" color="var(--text)">
            gcd(det A, {m}) = {gcd(result.det, m!)} — coprime, so the matrix is invertible.
          </Text>

          <Heading as="h2" fontSize="lg" m="0" mt="28px" mb="12px">
            Determinant (cofactor expansion, mod {m})
          </Heading>
          {detDetail.is2x2 ? (
            <Flex alignItems="center" gap="12px" flexWrap="wrap">
              <MathMatrix data={matrix} />
              <MathOp>=</MathOp>
              <Box fontFamily="mono" fontSize="lg" color="var(--text-h)">
                {detDetail.terms[0].a0j}·{detDetail.terms[0].minorDet} − {detDetail.terms[1].a0j}·{detDetail.terms[1].minorDet}
              </Box>
              <MathOp>=</MathOp>
              <Box fontFamily="mono" fontSize="lg" color="var(--accent)">
                {detDetail.det} (mod {m})
              </Box>
            </Flex>
          ) : (
            <Box>
              <Text mt="4px" fontSize="sm" color="var(--text)">
                Expand along row 0: det(A) = Σ a(0,j)·C(0,j), C(0,j) = (−1)^j · det(M(0,j)).
                Each term below is reduced mod {m}.
              </Text>
              <Box mt="12px" overflow="auto" maxH="440px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
                <Table.Root size="sm" variant="line" striped>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>j</Table.ColumnHeader>
                      <Table.ColumnHeader>sign</Table.ColumnHeader>
                      <Table.ColumnHeader>a(0,j)</Table.ColumnHeader>
                      <Table.ColumnHeader>minor M(0,j)</Table.ColumnHeader>
                      <Table.ColumnHeader>det(M) mod {m}</Table.ColumnHeader>
                      <Table.ColumnHeader>cofactor mod {m}</Table.ColumnHeader>
                      <Table.ColumnHeader>term mod {m}</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {detDetail.terms.map((t) => (
                      <Table.Row key={t.j}>
                        <Table.Cell fontWeight="semibold">{t.j}</Table.Cell>
                        <Table.Cell fontFamily="mono">{t.sign > 0 ? '+' : '−'}</Table.Cell>
                        <Table.Cell fontFamily="mono">{t.a0j}</Table.Cell>
                        <Table.Cell>
                          <MathMatrix data={t.minor} />
                        </Table.Cell>
                        <Table.Cell fontFamily="mono">{t.minorDet}</Table.Cell>
                        <Table.Cell fontFamily="mono" color="var(--text)">{t.cofactor}</Table.Cell>
                        <Table.Cell fontFamily="mono" color="var(--accent)" fontWeight="semibold">{t.product}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
              <Flex alignItems="center" gap="12px" flexWrap="wrap" mt="14px">
                <Box fontSize="sm" color="var(--text)">
                  det(A) ≡ Σ terms = {detDetail.terms.map((t) => t.product).join(' + ')} ≡
                </Box>
                <Box fontFamily="mono" fontSize="lg" color="var(--accent)" fontWeight="bold">{result.det} (mod {m})</Box>
              </Flex>
            </Box>
          )}

          <Heading as="h2" fontSize="lg" m="0" mt="28px" mb="12px">
            How A⁻¹ is computed
          </Heading>
          <Text mt="4px" fontSize="sm" color="var(--text)">
            A⁻¹ = adj(A) · (det A)⁻¹ mod {m}. Every cofactor is C(i,j) = (−1)^(i+j) · det(M(i,j)),
            using the determinant of the minor M(i,j) with the checkerboard sign pattern below.
          </Text>

          <Box mt="16px" p="12px 14px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
            <Text fontSize="xs" color="var(--text)" fontWeight="medium" mb="6px">step 1 · sign pattern (−1)^(i+j)</Text>
            <MathMatrix data={Array.from({ length: size }, () => Array(size).fill(0))} signs={signPattern(size)} hideValue />
          </Box>

          <Box mt="12px" p="12px 14px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
            <Text fontSize="xs" color="var(--text)" fontWeight="medium" mb="6px">step 2 · cofactor values C(i,j) = sign · det(M(i,j)) mod {m}</Text>
            <MathMatrix data={result.cofactorMatrix} signs={signPattern(size)} />
          </Box>

          <Box mt="12px" p="12px 14px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
            <Text fontSize="xs" color="var(--text)" fontWeight="medium" mb="6px">step 3 · adj(A) = transpose of cofactor matrix</Text>
            <MathMatrix data={result.adjugate} />
          </Box>

          <Box mt="12px" p="12px 14px" boxShadow="0 4px 14px rgb(0 0 0 / 8%)" borderRadius="12px" bg="var(--accent-bg)">
            <Text fontSize="xs" color="var(--text)" fontWeight="medium" mb="6px">step 4 · A⁻¹ = adj(A) · (det A)⁻¹ mod {m}</Text>
            <Flex alignItems="center" gap="12px" flexWrap="wrap">
              <MathMatrix data={result.adjugate} />
              <MathOp>·</MathOp>
              <Box fontFamily="mono" fontSize="lg" color="var(--accent)">{result.detInverse}</Box>
              <MathOp>=</MathOp>
              <MathMatrix data={result.inverse} />
            </Flex>
          </Box>

          <Heading as="h2" fontSize="lg" m="0" mt="28px" mb="12px">
            Proof: A · A⁻¹ ≡ I (mod {m})
          </Heading>
          <Flex alignItems="center" gap="16px" flexWrap="wrap">
            <MathMatrix data={matrix} />
            <MathOp>·</MathOp>
            <MathMatrix data={result.inverse} />
            <MathOp>=</MathOp>
            <MathMatrix data={matmulMod(matrix, result.inverse, m!)} />
          </Flex>
          <Text mt="12px" fontSize="sm" color="var(--text)">
            Since A · A⁻¹ is the identity matrix I mod {m}, the inverse is verified.
          </Text>
        </Box>
      )}

      {result && !result.invertible && detDetail && (
        <Box mt="32px">
          <Box p="16px 20px" borderWidth="1px" borderColor="red.300" borderRadius="12px" bg="red.50">
            <Text fontSize="sm" color="var(--text)" fontWeight="medium">det(A) mod {m}</Text>
            <Text mt="4px" fontFamily="mono" fontSize="2xl" fontWeight="bold" color="#ef4444">{result.det}</Text>
            <Text mt="8px" fontFamily="mono" color="#ef4444">{result.reason}</Text>
          </Box>

          <Heading as="h2" fontSize="lg" m="0" mt="28px" mb="12px">
            Determinant (cofactor expansion, mod {m})
          </Heading>
          {detDetail.is2x2 ? (
            <Flex alignItems="center" gap="12px" flexWrap="wrap">
              <MathMatrix data={matrix} />
              <MathOp>=</MathOp>
              <Box fontFamily="mono" fontSize="lg" color="var(--text-h)">
                {detDetail.terms[0].a0j}·{detDetail.terms[0].minorDet} − {detDetail.terms[1].a0j}·{detDetail.terms[1].minorDet}
              </Box>
              <MathOp>=</MathOp>
              <Box fontFamily="mono" fontSize="lg" color="#ef4444">
                {result.det} (mod {m})
              </Box>
            </Flex>
          ) : (
            <Box mt="12px" overflow="auto" maxH="440px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
              <Table.Root size="sm" variant="line" striped>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>j</Table.ColumnHeader>
                    <Table.ColumnHeader>sign</Table.ColumnHeader>
                    <Table.ColumnHeader>a(0,j)</Table.ColumnHeader>
                    <Table.ColumnHeader>det(M) mod {m}</Table.ColumnHeader>
                    <Table.ColumnHeader>term mod {m}</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {detDetail.terms.map((t) => (
                    <Table.Row key={t.j}>
                      <Table.Cell fontWeight="semibold">{t.j}</Table.Cell>
                      <Table.Cell fontFamily="mono">{t.sign > 0 ? '+' : '−'}</Table.Cell>
                      <Table.Cell fontFamily="mono">{t.a0j}</Table.Cell>
                      <Table.Cell fontFamily="mono">{t.minorDet}</Table.Cell>
                      <Table.Cell fontFamily="mono" color="var(--text)">{t.product}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export function MatrixInverseSearchPage() {
  const search = useSearch({ from: '/modular/matrix-inverse' })
  return <MatrixInversePage key={JSON.stringify(search)} search={search} />
}
