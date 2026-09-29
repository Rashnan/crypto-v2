import { type ReactNode } from 'react'
import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import { groupEvery } from '../lib/format'

export function ResultBox({ label, value }: { label: string; value: string }) {
  return (
    <Box mt="24px" p="16px 20px" borderRadius="12px" bg="var(--accent-bg)" boxShadow="0 4px 14px rgb(0 0 0 / 8%)">
      <Text fontSize="sm" color="var(--text)">{label}</Text>
      <Text mt="4px" fontFamily="mono" fontSize="xl" fontWeight="bold" color="var(--accent)" wordBreak="break-all">{groupEvery(value)}</Text>
    </Box>
  )
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <Box mt="16px" p="16px 20px" borderWidth="1px" borderColor="red.300" borderRadius="12px" bg="red.50">
      <Text fontSize="sm" color="var(--text)">{message}</Text>
    </Box>
  )
}

export function BitsView({ label, bits }: { label: string; bits: string }) {
  const chunks = bits.match(/.{1,4}/g) ?? []
  return (
    <Box>
      <Text fontSize="sm" color="var(--text)">{label}</Text>
      <Flex mt="4px" gap="8px" flexWrap="wrap" fontFamily="mono" fontSize="sm">
        {chunks.map((chunk, index) => <Text key={index} color="var(--text-h)">{chunk}</Text>)}
      </Flex>
    </Box>
  )
}

/** Render a 16-byte AES state as a 4×4 grid (column-major, as stored on the wire). */
export function StateMatrix({ label, hex }: { label?: string; hex: string }) {
  const bytes = hex.match(/../g) ?? []
  return (
    <Box>
      {label && <Text fontSize="sm" color="var(--text)" mb="4px">{label}</Text>}
      <SimpleGrid columns={4} gap="2px" w="188px" fontFamily="mono">
        {Array.from({ length: 16 }, (_, index) => {
          const row = Math.floor(index / 4)
          const column = index % 4
          return (
            <Box key={index} px="6px" py="4px" textAlign="center" fontSize="sm" bg="var(--bg)" borderWidth="1px" borderColor="var(--border)" borderRadius="4px">
              {bytes[4 * column + row]}
            </Box>
          )
        })}
      </SimpleGrid>
    </Box>
  )
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return <Box as="h2" mt="32px" mb="16px" fontSize="lg" fontWeight="semibold" color="var(--text-h)" textAlign="left">{children}</Box>
}

export function ConstantBlock({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <Box p="12px 14px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" bg="var(--bg)">
      <Text fontSize="sm" fontWeight="semibold" color="var(--text-h)">{label}</Text>
      {hint && <Text mt="2px" fontSize="xs" color="var(--text)">{hint}</Text>}
      <Box mt="8px">{children}</Box>
    </Box>
  )
}

export function NumberGrid({ values, perRow = 16 }: { values: number[]; perRow?: number }) {
  return (
    <SimpleGrid columns={perRow} gap="2px" fontFamily="mono" fontSize="11px">
      {values.map((value, index) => (
        <Box key={index} textAlign="center" py="1px" borderWidth="1px" borderColor="var(--border)" borderRadius="3px" bg="var(--bg)" color="var(--text-h)">{value}</Box>
      ))}
    </SimpleGrid>
  )
}

export function HexGrid({ values }: { values: number[] }) {
  return (
    <SimpleGrid columns={16} gap="1px" fontFamily="mono" fontSize="10px">
      {values.map((value, index) => (
        <Box key={index} textAlign="center" py="1px" borderWidth="1px" borderColor="var(--border)" borderRadius="2px" bg="var(--bg)" color="var(--text-h)">{value.toString(16).toUpperCase().padStart(2, '0')}</Box>
      ))}
    </SimpleGrid>
  )
}

export function NumberMatrix({ matrix }: { matrix: number[][] }) {
  return (
    <SimpleGrid columns={matrix[0]?.length ?? 1} gap="2px" fontFamily="mono" fontSize="12px" maxW="200px">
      {matrix.flatMap((row, rowIndex) => row.map((value, columnIndex) => (
        <Box key={`${rowIndex}-${columnIndex}`} textAlign="center" py="3px" borderWidth="1px" borderColor="var(--border)" borderRadius="4px" bg="var(--bg)" color="var(--text-h)">{value}</Box>
      )))}
    </SimpleGrid>
  )
}
