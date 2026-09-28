import { useState } from 'react'
import { Box, Button, Field, Flex, Heading, Input, SimpleGrid, Table, Text } from '@chakra-ui/react'
import {
  applyPBox,
  inversePBoxMapping,
  lfsrSteps,
  sBoxInputBits,
  sBoxInverse,
  sBoxLookup,
  type PBoxResult,
  type PBoxType,
  type SBoxLookup,
} from '../lib/block'

function parseNumberList(raw: string): number[] {
  return raw.split(/[,\s]+/).map((part) => part.trim()).filter(Boolean).map(Number)
}

function parseHexList(raw: string): number[] {
  return raw.split(/[,\s]+/).map((part) => part.trim()).filter(Boolean).map((part) => parseInt(part, 16))
}

function hex(value: number, width = 1): string {
  return value.toString(16).toUpperCase().padStart(width, '0')
}

function BitStrip({ bits, label, sources }: { bits: string; label: string; sources?: number[] }) {
  return (
    <Box>
      <Text fontSize="sm" color="var(--text)">{label}</Text>
      <Flex mt="6px" gap="4px" flexWrap="wrap">
        {Array.from(bits).map((bit, index) => (
          <Box key={index} minW="34px" px="8px" py="6px" borderRadius="8px" borderWidth="1px" borderColor="var(--border)" bg={bit === '1' ? 'var(--accent-bg)' : 'var(--bg)'} textAlign="center">
            <Text fontSize="10px" color="var(--text)" lineHeight="1">{sources ? sources[index] : index + 1}</Text>
            <Text fontFamily="mono" fontWeight="bold" lineHeight="1.4" color={bit === '1' ? 'var(--accent)' : 'var(--text-h)'}>{bit}</Text>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

function ErrorNote({ message }: { message: string }) {
  return (
    <Box mt="16px" p="16px 20px" borderWidth="1px" borderColor="red.300" borderRadius="12px" bg="red.50">
      <Text fontSize="sm" color="var(--text)">{message}</Text>
    </Box>
  )
}

const pBoxPresets: Record<PBoxType, { mapping: string; input: string; description: string }> = {
  straight: { mapping: '2,4,6,8,1,3,5,7', input: '11010010', description: 'A straight P-box rearranges every bit: the output count equals the input count, so it is a bijection and can be inverted.' },
  expansion: { mapping: '4,1,2,3,2,3,4,1', input: '1011', description: 'An expansion P-box produces more outputs than inputs, repeating some input bits. It is not one-to-one.' },
  compression: { mapping: '2,3,5,6,7,8', input: '11010010', description: 'A compression P-box produces fewer outputs than inputs, dropping some input bits. It is not one-to-one.' },
}

const pBoxLabels: Record<PBoxType, string> = { straight: 'Straight', expansion: 'Expansion', compression: 'Compression' }

export function PBoxPage() {
  const [type, setType] = useState<PBoxType>('straight')
  const [mappingRaw, setMappingRaw] = useState(pBoxPresets.straight.mapping)
  const [input, setInput] = useState(pBoxPresets.straight.input)

  function selectType(next: PBoxType) {
    setType(next)
    setMappingRaw(pBoxPresets[next].mapping)
    setInput(pBoxPresets[next].input)
  }

  const mapping = parseNumberList(mappingRaw)
  const bits = input.trim()
  let result: PBoxResult | null = null
  let error = ''
  try {
    result = applyPBox(bits, mapping, type)
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Invalid P-box.'
  }

  let inverse: number[] | null = null
  let inverseResult: PBoxResult | null = null
  if (result && type === 'straight') {
    try {
      inverse = inversePBoxMapping(mapping)
      inverseResult = applyPBox(result.output, inverse, 'straight')
    } catch {
      inverse = null
    }
  }

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">P-Boxes</Heading>
      <Text mt="8px" color="var(--text)">
        A permutation box routes input bits to output positions. Choose a straight, expansion, or compression
        P-box, then follow each output bit back to its source. Straight P-boxes are reversible, so their inverse
        is computed below.
      </Text>

      <Flex mt="24px" gap="8px" flexWrap="wrap">
        {(Object.keys(pBoxPresets) as PBoxType[]).map((value) => (
          <Button key={value} size="sm" variant={type === value ? 'solid' : 'outline'} bg={type === value ? 'var(--accent)' : undefined} color={type === value ? 'white' : 'var(--text)'} onClick={() => selectType(value)}>
            {pBoxLabels[value]}
          </Button>
        ))}
      </Flex>
      <Text mt="12px" fontSize="sm" color="var(--text)">{pBoxPresets[type].description}</Text>

      <Flex mt="20px" gap="16px" flexWrap="wrap" align="end">
        <Field.Root maxW="360px" invalid={Boolean(error)}>
          <Field.Label>Mapping (input position per output)</Field.Label>
          <Input mt="8px" fontFamily="mono" value={mappingRaw} onChange={(event) => setMappingRaw(event.target.value)} />
        </Field.Root>
        <Field.Root maxW="280px" invalid={Boolean(error)}>
          <Field.Label>Input bits</Field.Label>
          <Input mt="8px" fontFamily="mono" value={input} onChange={(event) => setInput(event.target.value)} />
        </Field.Root>
      </Flex>
      <Text mt="10px" fontSize="sm" color="var(--text)" fontFamily="mono">
        output[i] = input[mapping[i]]
      </Text>

      {error && <ErrorNote message={error} />}

      {result && (
        <>
          <Box mt="24px" p="16px 20px" borderRadius="12px" bg="var(--accent-bg)" boxShadow="0 4px 14px rgb(0 0 0 / 8%)">
            <Text fontSize="sm" color="var(--text)">Output bits</Text>
            <Text mt="4px" fontFamily="mono" fontSize="2xl" fontWeight="bold" color="var(--accent)">{result.output}</Text>
          </Box>

          <SimpleGrid mt="16px" columns={{ base: 1, md: 2 }} gap="16px">
            <BitStrip bits={bits} label="Input" />
            <BitStrip bits={result.output} label="Output (labeled with source position)" sources={result.steps.map((step) => step.sourcePosition)} />
          </SimpleGrid>

          <Heading as="h2" mt="32px" mb="16px" fontSize="lg">Permutation working</Heading>
          <Box overflowX="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
            <Table.Root size="sm" variant="line" striped>
              <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
                <Table.Row>
                  <Table.ColumnHeader>Output position</Table.ColumnHeader>
                  <Table.ColumnHeader>Source position</Table.ColumnHeader>
                  <Table.ColumnHeader>Input bit</Table.ColumnHeader>
                  <Table.ColumnHeader>Output bit</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {result.steps.map((step, index) => (
                  <Table.Row key={step.outputPosition} borderBottomWidth={index === result.steps.length - 1 ? '2px' : undefined} borderColor={index === result.steps.length - 1 ? 'var(--accent)' : undefined}>
                    <Table.Cell>{step.outputPosition}</Table.Cell>
                    <Table.Cell>{step.sourcePosition}</Table.Cell>
                    <Table.Cell fontFamily="mono">{step.inputBit}</Table.Cell>
                    <Table.Cell fontFamily="mono" color="var(--accent)" fontWeight="semibold">{step.outputBit}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          <Heading as="h2" mt="36px" mb="12px" fontSize="lg">Inverse P-box</Heading>
          {type === 'straight' && inverse && inverseResult ? (
            <>
              <Text fontSize="sm" color="var(--text)">The inverse mapping sends each output position back to its source position.</Text>
              <Box mt="12px" p="16px 20px" fontFamily="mono" borderRadius="12px" bg="var(--accent-bg)" boxShadow="0 4px 14px rgb(0 0 0 / 8%)">
                <Text fontSize="sm" color="var(--text)">inverse = {inverse.join(', ')}</Text>
                <Text mt="4px" fontSize="sm" color="var(--text)">inverse(input[mapping[i]]) = input[i]</Text>
              </Box>
              <Text mt="16px" fontSize="sm" color="var(--text)">
                Applying the inverse to the output recovers the original input:
                <Text as="span" fontFamily="mono" color="var(--accent)" fontWeight="bold"> {inverseResult.output}</Text>
              </Text>
              <Box mt="16px" overflowX="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
                <Table.Root size="sm" variant="line" striped>
                  <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
                    <Table.Row>
                      <Table.ColumnHeader>Output position</Table.ColumnHeader>
                      <Table.ColumnHeader>Source position</Table.ColumnHeader>
                      <Table.ColumnHeader>Input bit</Table.ColumnHeader>
                      <Table.ColumnHeader>Output bit</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {inverseResult.steps.map((step, index) => (
                      <Table.Row key={step.outputPosition} borderBottomWidth={index === inverseResult.steps.length - 1 ? '2px' : undefined} borderColor={index === inverseResult.steps.length - 1 ? 'var(--accent)' : undefined}>
                        <Table.Cell>{step.outputPosition}</Table.Cell>
                        <Table.Cell>{step.sourcePosition}</Table.Cell>
                        <Table.Cell fontFamily="mono">{step.inputBit}</Table.Cell>
                        <Table.Cell fontFamily="mono" color="var(--accent)" fontWeight="semibold">{step.outputBit}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </>
          ) : (
            <Box p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" bg="var(--accent-bg)">
              <Text fontSize="sm" color="var(--text)">
                An {type} P-box is not one-to-one ({type === 'expansion' ? 'inputs repeat' : 'inputs are dropped'}), so no inverse P-box exists.
              </Text>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export function SBoxPage() {
  const [tableRaw, setTableRaw] = useState('e,4,d,1,2,f,b,8,3,a,6,c,5,9,0,7')
  const [input, setInput] = useState('1011')

  const table = parseHexList(tableRaw)
  let lookup: SBoxLookup | null = null
  let inverse: number[] | null = null
  let error = ''
  try {
    lookup = sBoxLookup(input.trim(), table)
    inverse = sBoxInverse(table)
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Invalid S-box.'
  }

  const bits = (() => {
    try {
      return sBoxInputBits(table)
    } catch {
      return 0
    }
  })()

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">S-Boxes</Heading>
      <Text mt="8px" color="var(--text)">
        A substitution box maps an n-bit input to an m-bit output through a lookup table. When the table is a
        bijection it can be reversed, so the inverse S-box is computed too.
      </Text>

      <Flex mt="20px" gap="16px" flexWrap="wrap" align="end">
        <Field.Root flex="1" minW="320px" invalid={Boolean(error)}>
          <Field.Label>Table entries (hex, {bits > 0 ? 2 ** bits : '2ⁿ'} values)</Field.Label>
          <Input mt="8px" fontFamily="mono" value={tableRaw} onChange={(event) => setTableRaw(event.target.value)} />
        </Field.Root>
        <Field.Root maxW="200px" invalid={Boolean(error)}>
          <Field.Label>Input bits</Field.Label>
          <Input mt="8px" fontFamily="mono" value={input} onChange={(event) => setInput(event.target.value)} />
        </Field.Root>
      </Flex>

      {error && <ErrorNote message={error} />}

      {lookup && (
        <>
          <Heading as="h2" mt="32px" mb="16px" fontSize="lg">S-box table</Heading>
          <SimpleGrid columns={2 ** Math.ceil(bits / 2)} gap="8px" maxW="560px">
            {table.map((value, index) => {
              const active = index === lookup.inputValue
              return (
                <Box key={index} px="6px" py="8px" textAlign="center" borderWidth="1px" borderColor={active ? 'var(--accent)' : 'var(--border)'} borderRadius="10px" bg={active ? 'var(--accent-bg)' : 'var(--bg)'}>
                  <Text fontSize="10px" color="var(--text)" fontFamily="mono" lineHeight="1.2">{index.toString(2).padStart(bits, '0')}</Text>
                  <Text fontSize="sm" fontFamily="mono" fontWeight="bold" color={active ? 'var(--accent)' : 'var(--text-h)'}>{hex(value)}</Text>
                </Box>
              )
            })}
          </SimpleGrid>

          <Box mt="24px" p="16px 20px" fontFamily="mono" borderRadius="12px" bg="var(--accent-bg)" boxShadow="0 4px 14px rgb(0 0 0 / 8%)">
            <Text fontSize="sm" color="var(--text)">Lookup</Text>
            <Text mt="4px" color="var(--text-h)">{lookup.inputBinary}₂ = {lookup.inputValue} → S[{lookup.inputValue}] = {lookup.outputValue} = {hex(lookup.outputValue)}₁₆</Text>
            <Text mt="4px" color="var(--accent)" fontWeight="bold">output = {lookup.outputBinary}</Text>
          </Box>

          <Heading as="h2" mt="36px" mb="12px" fontSize="lg">Inverse S-box</Heading>
          {inverse ? (
            <>
              <Text fontSize="sm" color="var(--text)">The inverse table swaps inputs and outputs: S⁻¹[S[x]] = x.</Text>
              <SimpleGrid mt="16px" columns={2 ** Math.ceil(bits / 2)} gap="8px" maxW="560px">
                {inverse.map((value, index) => {
                  const active = index === lookup.outputValue
                  return (
                    <Box key={index} px="6px" py="8px" textAlign="center" borderWidth="1px" borderColor={active ? 'var(--accent)' : 'var(--border)'} borderRadius="10px" bg={active ? 'var(--accent-bg)' : 'var(--bg)'}>
                      <Text fontSize="10px" color="var(--text)" fontFamily="mono" lineHeight="1.2">{index.toString(2).padStart(bits, '0')}</Text>
                      <Text fontSize="sm" fontFamily="mono" fontWeight="bold" color={active ? 'var(--accent)' : 'var(--text-h)'}>{hex(value)}</Text>
                    </Box>
                  )
                })}
              </SimpleGrid>
              <Box mt="24px" p="16px 20px" fontFamily="mono" borderRadius="12px" bg="var(--accent-bg)" boxShadow="0 4px 14px rgb(0 0 0 / 8%)">
                <Text fontSize="sm" color="var(--text)">Inverse lookup</Text>
                <Text mt="4px" color="var(--text-h)">{lookup.outputBinary}₂ = {lookup.outputValue} → S⁻¹[{lookup.outputValue}] = {inverse[lookup.outputValue]} = {hex(inverse[lookup.outputValue])}₁₆</Text>
                <Text mt="4px" color="var(--accent)" fontWeight="bold">recovers {inverse[lookup.outputValue].toString(2).padStart(bits, '0')}</Text>
              </Box>
            </>
          ) : (
            <Box p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" bg="var(--accent-bg)">
              <Text fontSize="sm" color="var(--text)">This table is not a permutation, so no inverse S-box exists.</Text>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export function LfsrPage() {
  const [initial, setInitial] = useState('1001')
  const [tapsRaw, setTapsRaw] = useState('4,1')
  const [countRaw, setCountRaw] = useState('8')

  const taps = parseNumberList(tapsRaw)
  const count = Number(countRaw)
  let steps: ReturnType<typeof lfsrSteps> = []
  let error = ''
  try {
    steps = lfsrSteps(initial.trim(), taps, count)
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Invalid LFSR settings.'
  }

  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">LFSR — Linear Feedback Shift Register</Heading>
      <Text mt="8px" color="var(--text)">
        Each clock the register emits its rightmost bit, shifts right, and feeds back the XOR of the tapped bits
        into the leftmost position. Bit positions are numbered 1..n from the left.
      </Text>

      <Flex mt="20px" gap="16px" flexWrap="wrap" align="end">
        <Field.Root maxW="220px" invalid={Boolean(error)}>
          <Field.Label>Initial state</Field.Label>
          <Input mt="8px" fontFamily="mono" value={initial} onChange={(event) => setInitial(event.target.value)} />
        </Field.Root>
        <Field.Root maxW="220px" invalid={Boolean(error)}>
          <Field.Label>Tap positions</Field.Label>
          <Input mt="8px" fontFamily="mono" value={tapsRaw} onChange={(event) => setTapsRaw(event.target.value)} />
        </Field.Root>
        <Field.Root maxW="160px" invalid={Boolean(error)}>
          <Field.Label>Steps</Field.Label>
          <Input mt="8px" type="number" min="1" max="64" value={countRaw} onChange={(event) => setCountRaw(event.target.value)} />
        </Field.Root>
      </Flex>
      <Text mt="10px" fontSize="sm" color="var(--text)" fontFamily="mono">
        feedback = XOR of tapped bits; new bit enters at the left.
      </Text>

      {error && <ErrorNote message={error} />}

      {steps.length > 0 && (
        <>
          <Box mt="24px" p="16px 20px" borderRadius="12px" bg="var(--accent-bg)" boxShadow="0 4px 14px rgb(0 0 0 / 8%)">
            <Text fontSize="sm" color="var(--text)">Output sequence</Text>
            <Text mt="4px" fontFamily="mono" fontSize="2xl" fontWeight="bold" color="var(--accent)">{steps.map((step) => step.output).join('')}</Text>
          </Box>

          <Box mt="20px">
            <BitStrip bits={steps[0].state} label="Initial state" />
          </Box>

          <Heading as="h2" mt="32px" mb="16px" fontSize="lg">Clock-by-clock working</Heading>
          <Box overflowX="auto" borderWidth="1px" borderTopWidth="2px" borderBottomWidth="3px" borderColor="var(--border)" borderRadius="12px">
            <Table.Root size="sm" variant="line" striped>
              <Table.Header bg="var(--accent-bg)" borderBottomWidth="2px" borderColor="var(--accent)">
                <Table.Row>
                  <Table.ColumnHeader>Step</Table.ColumnHeader>
                  <Table.ColumnHeader>State</Table.ColumnHeader>
                  <Table.ColumnHeader>Tapped bits</Table.ColumnHeader>
                  <Table.ColumnHeader>Feedback</Table.ColumnHeader>
                  <Table.ColumnHeader>Output</Table.ColumnHeader>
                  <Table.ColumnHeader>Next state</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {steps.map((step, index) => (
                  <Table.Row key={step.step} borderBottomWidth={index === steps.length - 1 ? '2px' : undefined} borderColor={index === steps.length - 1 ? 'var(--accent)' : undefined}>
                    <Table.Cell>{step.step}</Table.Cell>
                    <Table.Cell fontFamily="mono" fontWeight="semibold">{step.state}</Table.Cell>
                    <Table.Cell fontFamily="mono" whiteSpace="nowrap">{step.tapPositions.map((position, tapIndex) => `${position}:${step.tappedBits[tapIndex]}`).join('  ')}</Table.Cell>
                    <Table.Cell fontFamily="mono" whiteSpace="nowrap">{step.calculation}</Table.Cell>
                    <Table.Cell fontFamily="mono" color="var(--accent)" fontWeight="bold">{step.output}</Table.Cell>
                    <Table.Cell fontFamily="mono" color="var(--accent)" fontWeight="semibold">{step.nextState}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </>
      )}
    </Box>
  )
}
