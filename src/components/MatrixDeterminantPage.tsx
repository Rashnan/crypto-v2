import { useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { Box, Field, Flex, Heading, Input, SimpleGrid, Table, Text } from '@chakra-ui/react'
import { MathMatrix } from './MathMatrix'
import { determinantModDetail, type Matrix } from '../lib/matmod'

export interface MatrixDeterminantSearch {
  m?: number
  size?: number
  entries?: string
}

function defaultEntries(size: number): string[] {
  if (size === 2) return ['3', '3', '2', '5']
  if (size === 3) return ['6', '24', '1', '13', '16', '10', '20', '17', '15']
  return Array.from({ length: size * size }, (_, index) => String(index % (size + 1) === 0 ? 1 : 0))
}

function parseModulus(raw: string): number | null {
  return /^\d+$/.test(raw.trim()) && Number(raw) >= 2 && Number(raw) <= 100000 ? Number(raw) : null
}

function buildMatrix(size: number, entries: string[]): Matrix | null {
  if (entries.length !== size * size || entries.some((entry) => !/^-?\d+$/.test(entry.trim()))) return null
  return Array.from({ length: size }, (_, row) => entries.slice(row * size, (row + 1) * size).map(Number))
}

export function MatrixDeterminantPage({ search = {} }: { search?: MatrixDeterminantSearch }) {
  const initialSize = search.size ?? 2
  const queryEntries = search.entries?.split(',') ?? []
  const validQuery = queryEntries.length === initialSize * initialSize && queryEntries.every((entry) => /^-?\d+$/.test(entry))
  const [mRaw, setMRaw] = useState(String(search.m ?? 26))
  const [size, setSize] = useState(initialSize)
  const [entries, setEntries] = useState(validQuery ? queryEntries : defaultEntries(initialSize))
  const m = parseModulus(mRaw)
  const matrix = buildMatrix(size, entries)
  const detail = matrix && m !== null ? determinantModDetail(matrix, m) : null

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">Matrix determinant (mod)</Heading>
      <Text mt="8px" color="var(--text)">Compute det(A) modulo m with a cofactor expansion along the first row.</Text>
      <Flex mt="24px" gap="16px" flexWrap="wrap" align="end">
        <Field.Root invalid={m === null} maxW="140px"><Field.Label>m</Field.Label><Input mt="8px" type="number" min="2" value={mRaw} onChange={(event) => setMRaw(event.target.value)} /></Field.Root>
        <Field.Root maxW="180px"><Field.Label>Matrix dimension</Field.Label><Input mt="8px" type="number" min="2" max="4" value={size} onChange={(event) => { const next = Math.min(4, Math.max(2, Number(event.target.value) || 2)); setSize(next); setEntries(defaultEntries(next)) }} /></Field.Root>
      </Flex>
      <Box mt="28px"><Heading as="h2" fontSize="lg" m="0">Matrix A</Heading><SimpleGrid mt="12px" columns={size} gap="8px" maxW="440px">{entries.map((entry, index) => <Input key={index} type="number" value={entry} onChange={(event) => setEntries((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} />)}</SimpleGrid></Box>
      {detail && matrix && (
        <Box mt="32px">
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="12px"><Box p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px"><Text fontSize="sm" color="var(--text)">A</Text><Box mt="8px"><MathMatrix data={matrix} /></Box></Box><Box p="16px 20px" borderRadius="12px" bg="var(--accent-bg)" boxShadow="0 4px 14px rgb(0 0 0 / 8%)"><Text fontSize="sm" color="var(--text)">det(A) mod {m}</Text><Text mt="4px" fontSize="3xl" fontWeight="bold" color="var(--accent)">{detail.det}</Text></Box></SimpleGrid>
          <Heading as="h2" mt="32px" fontSize="lg">Cofactor expansion</Heading>
          <Text mt="8px" color="var(--text)">det(A) = Σ a(0,j) · C(0,j), where C(0,j) = (−1)^j · det(M(0,j)).</Text>
          <Box mt="16px" maxH="440px" overflow="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px"><Table.Root size="sm" variant="line" striped><Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)"><Table.Row><Table.ColumnHeader>j</Table.ColumnHeader><Table.ColumnHeader>a(0,j)</Table.ColumnHeader><Table.ColumnHeader>Minor M(0,j)</Table.ColumnHeader><Table.ColumnHeader>det(M) mod {m}</Table.ColumnHeader><Table.ColumnHeader>Cofactor</Table.ColumnHeader><Table.ColumnHeader>Term</Table.ColumnHeader></Table.Row></Table.Header><Table.Body>{detail.terms.map((term, index) => <Table.Row key={term.j} borderBottomWidth={index === detail.terms.length - 1 ? '2px' : undefined} borderColor={index === detail.terms.length - 1 ? 'var(--accent)' : undefined}><Table.Cell>{term.j}</Table.Cell><Table.Cell>{term.a0j}</Table.Cell><Table.Cell><MathMatrix data={term.minor} compact /></Table.Cell><Table.Cell>{term.minorDet}</Table.Cell><Table.Cell>{term.cofactor}</Table.Cell><Table.Cell color="var(--accent)" fontWeight="bold">{term.product}</Table.Cell></Table.Row>)}</Table.Body></Table.Root></Box>
          <Text mt="16px" fontFamily="mono" fontWeight="bold" color="var(--accent)">det(A) ≡ {detail.terms.map((term) => term.product).join(' + ')} ≡ {detail.det} (mod {m})</Text>
        </Box>
      )}
    </Box>
  )
}

export function MatrixDeterminantSearchPage() {
  const search = useSearch({ from: '/basic/matrix-determinant' })
  return <MatrixDeterminantPage key={JSON.stringify(search)} search={search} />
}
