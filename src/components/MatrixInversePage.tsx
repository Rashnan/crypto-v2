import { useState } from 'react'
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
import { matrixInverseMod, type Matrix } from '../lib/matmod'

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

function MathMatrix({ data }: { data: number[][] }) {
  return (
    <math>
      <mrow>
        <mo>(</mo>
        <mtable>
          {data.map((row, i) => (
            <mtr key={i}>
              {row.map((v, j) => (
                <mtd key={j}>
                  <mn>{v}</mn>
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

function matmulMod(a: number[][], b: number[][], m: number): number[][] {
  return a.map((row) =>
    b[0].map((_, j) =>
      ((row.reduce((acc, v, k) => acc + v * b[k][j], 0) % m) + m) % m,
    ),
  )
}

export function MatrixInversePage() {
  const [mRaw, setMRaw] = useState('5')
  const [size, setSize] = useState(2)
  const defaultMatrix = size === 2 ? ['3', '4', '2', '3'] : ['2', '1', '1', '3', '4', '5', '1', '6', '7']
  const [entries, setEntries] = useState<string[]>(defaultMatrix)

  const m = parseModulus(mRaw)
  const mValid = m !== null
  const mInvalid = mRaw.trim() !== '' && !mValid

  const { matrix, ok } = buildMatrix(size, entries)
  const valueMode = m !== null && ok

  let result:
    | { invertible: true; det: number; detInverse: number; inverse: Matrix }
    | { invertible: false; det: number; reason: string }
    | null = null
  if (valueMode) {
    const r = matrixInverseMod(matrix, m!)
    if (r.invertible) {
      result = {
        invertible: true,
        det: r.det,
        detInverse: r.detInverse!,
        inverse: r.inverse!,
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
        A matrix is invertible over ℤ/{m ?? 'm'}ℤ iff det(A) and the modulus are coprime,
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
        <Box maxW={`${size === 2 ? 260 : 380}px`}>
          <Table.Root size="sm">
            <Table.Body>
              {Array.from({ length: size }).map((_, i) => (
                <Table.Row key={i}>
                  {Array.from({ length: size }).map((_, j) => {
                    const idx = i * size + j
                    return (
                      <Table.Cell key={j} p="4px">
                        <Input
                          type="number"
                          step="1"
                          value={entries[idx] ?? ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEntry(idx, e.target.value)}
                          textAlign="center"
                          fontFamily="mono"
                        />
                      </Table.Cell>
                    )
                  })}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      {result && result.invertible && (
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
            A⁻¹ mod {m}
          </Heading>
          <Box
            p="8px 12px"
            display="inline-block"
            borderWidth="1px"
            borderColor="var(--border)"
            borderRadius="12px"
          >
            <MathMatrix data={result.inverse} />
          </Box>

          <Heading as="h2" fontSize="lg" m="0" mt="28px" mb="12px">
            Proof: A · A⁻¹ ≡ I (mod {m})
          </Heading>
          <Flex alignItems="center" gap="16px" flexWrap="wrap">
            <MathMatrix data={matrix} />
            <Text fontFamily="mono" fontSize="xl" color="var(--text-h)">·</Text>
            <MathMatrix data={result.inverse} />
            <Text fontFamily="mono" fontSize="xl" color="var(--text-h)">=</Text>
            <MathMatrix data={matmulMod(matrix, result.inverse, m!)} />
          </Flex>
          <Text mt="12px" fontSize="sm" color="var(--text)">
            Since A · A⁻¹ is the identity matrix I mod {m}, the inverse is verified.
          </Text>
        </Box>
      )}

      {result && !result.invertible && (
        <Box mt="32px">
          <Box p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
            <Text fontSize="sm" color="var(--text)" fontWeight="medium">det(A) mod {m}</Text>
            <Text mt="4px" fontFamily="mono" fontSize="2xl" fontWeight="bold" color="#ef4444">{result.det}</Text>
            <Text mt="8px" fontFamily="mono" color="#ef4444">{result.reason}</Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}
