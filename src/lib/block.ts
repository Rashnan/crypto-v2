export type PBoxType = 'straight' | 'expansion' | 'compression'

export interface PBoxStep {
  outputPosition: number
  sourcePosition: number
  inputBit: string
  outputBit: string
}

export interface PBoxResult {
  output: string
  steps: PBoxStep[]
}

function isBitString(value: string): boolean {
  return value.length > 0 && /^[01]+$/.test(value)
}

function isPermutation(values: number[], size: number): boolean {
  if (values.length !== size) return false
  const seen = new Set<number>()
  for (const value of values) {
    if (!Number.isInteger(value) || value < 1 || value > size || seen.has(value)) return false
    seen.add(value)
  }
  return true
}

/**
 * Apply a permutation box to a bit string.
 *
 * `mapping[i]` is the 1-indexed input position routed to output position i + 1.
 * A straight P-box is a bijection over all inputs; an expansion P-box emits more
 * outputs than inputs (repeating some); a compression P-box emits fewer outputs
 * than inputs (dropping some).
 */
export function applyPBox(input: string, mapping: number[], type: PBoxType): PBoxResult {
  if (!isBitString(input)) throw new Error('Input must be a string of 0s and 1s.')
  if (mapping.length === 0) throw new Error('Enter at least one mapping entry.')
  if (mapping.some((value) => !Number.isInteger(value) || value < 1 || value > input.length)) {
    throw new Error(`Mapping entries must be input positions between 1 and ${input.length}.`)
  }
  if (type === 'straight' && !isPermutation(mapping, input.length)) {
    throw new Error('A straight P-box needs one output per input and uses every input exactly once.')
  }
  if (type === 'expansion' && mapping.length <= input.length) {
    throw new Error('An expansion P-box has more outputs than inputs.')
  }
  if (type === 'compression' && mapping.length >= input.length) {
    throw new Error('A compression P-box has fewer outputs than inputs.')
  }
  const steps = mapping.map((source, index) => ({
    outputPosition: index + 1,
    sourcePosition: source,
    inputBit: input[source - 1],
    outputBit: input[source - 1],
  }))
  return { output: steps.map((step) => step.outputBit).join(''), steps }
}

/**
 * Invert a straight P-box mapping: the inverse sends position `mapping[i]` back
 * to `i + 1`. Only defined when `mapping` is a permutation.
 */
export function inversePBoxMapping(mapping: number[]): number[] {
  if (!isPermutation(mapping, mapping.length)) {
    throw new Error('Only a straight P-box (a permutation) has an inverse.')
  }
  const inverse = new Array<number>(mapping.length)
  mapping.forEach((source, index) => {
    inverse[source - 1] = index + 1
  })
  return inverse
}

export interface SBoxLookup {
  inputValue: number
  inputBinary: string
  outputValue: number
  outputBinary: string
}

function isPowerOfTwo(value: number): boolean {
  return Number.isInteger(value) && value > 1 && (value & (value - 1)) === 0
}

/** Number of input bits an S-box table consumes: log2(table.length). */
export function sBoxInputBits(table: number[]): number {
  if (!isPowerOfTwo(table.length)) throw new Error('An S-box must have a power-of-two number of entries.')
  return Math.log2(table.length)
}

/** Number of output bits an S-box needs: enough to hold its largest entry. */
export function sBoxOutputBits(table: number[]): number {
  const max = table.reduce((highest, value) => Math.max(highest, value), 0)
  return Math.max(1, max.toString(2).length)
}

/** Look up an n-bit input in an S-box and return the m-bit output. */
export function sBoxLookup(input: string, table: number[]): SBoxLookup {
  const bits = sBoxInputBits(table)
  if (input.length !== bits || !/^[01]+$/.test(input)) {
    throw new Error(`Enter exactly ${bits} input bits.`)
  }
  const inputValue = parseInt(input, 2)
  const outputValue = table[inputValue]
  if (!Number.isInteger(outputValue) || outputValue < 0 || outputValue >= table.length) {
    throw new Error(`S-box entries must be integers between 0 and ${table.length - 1}.`)
  }
  return {
    inputValue,
    inputBinary: input,
    outputValue,
    outputBinary: outputValue.toString(2).padStart(bits, '0'),
  }
}

/**
 * Invert a bijective S-box: `inverse[table[x]] = x`. Returns null when the table
 * is not a permutation, so no inverse S-box exists.
 */
export function sBoxInverse(table: number[]): number[] | null {
  const size = table.length
  const inverse = new Array<number>(size).fill(-1)
  for (let value = 0; value < size; value++) {
    const mapped = table[value]
    if (!Number.isInteger(mapped) || mapped < 0 || mapped >= size || inverse[mapped] !== -1) return null
    inverse[mapped] = value
  }
  return inverse.some((value) => value === -1) ? null : inverse
}

export interface LfsrStep {
  step: number
  state: string
  tapPositions: number[]
  tappedBits: string[]
  feedback: number
  calculation: string
  output: number
  nextState: string
}

/**
 * Clock a Fibonacci linear-feedback shift register.
 *
 * Bits are indexed 1..n from left to right. Each clock the rightmost bit is
 * emitted, the tap bits are XORed to form the feedback, the register shifts
 * right, and the feedback enters at the left.
 */
export function lfsrSteps(initial: string, taps: number[], count: number): LfsrStep[] {
  if (!isBitString(initial)) throw new Error('The initial state must be a string of 0s and 1s.')
  const size = initial.length
  if (taps.length === 0) throw new Error('Enter at least one tap position.')
  const positions = [...new Set(taps)].sort((a, b) => a - b)
  if (positions.some((position) => !Number.isInteger(position) || position < 1 || position > size)) {
    throw new Error(`Tap positions must be between 1 and ${size}.`)
  }
  if (!Number.isInteger(count) || count < 1 || count > 64) {
    throw new Error('Steps must be an integer between 1 and 64.')
  }
  let state = initial
  const steps: LfsrStep[] = []
  for (let index = 0; index < count; index++) {
    const tappedBits = positions.map((position) => state[position - 1])
    const feedback = tappedBits.reduce((accumulator, bit) => accumulator ^ Number(bit), 0)
    const output = Number(state[size - 1])
    const nextState = String(feedback) + state.slice(0, size - 1)
    steps.push({
      step: index + 1,
      state,
      tapPositions: positions,
      tappedBits,
      feedback,
      calculation: `${tappedBits.join(' ⊕ ')} = ${feedback}`,
      output,
      nextState,
    })
    state = nextState
  }
  return steps
}
