export function bytesToHex(bytes: number[]): string {
  return bytes.map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()
}

export function hexToBytes(hex: string): number[] {
  const clean = hex.trim().toLowerCase().replace(/[^0-9a-f]/g, '')
  if (clean.length % 2 !== 0) throw new Error('Hex input needs an even number of digits.')
  const bytes: number[] = []
  for (let index = 0; index < clean.length; index += 2) bytes.push(parseInt(clean.slice(index, index + 2), 16))
  return bytes
}

function requireBytes(hex: string, expected: number, label: string): number[] {
  const bytes = hexToBytes(hex)
  if (bytes.length !== expected) throw new Error(`${label} must be ${expected} bytes (${expected * 2} hex digits).`)
  return bytes
}

function xtime(value: number): number {
  const shifted = (value << 1) & 0xff
  return value & 0x80 ? shifted ^ 0x1b : shifted
}

/** Multiply two bytes in GF(2^8) with the AES polynomial x^8 + x^4 + x^3 + x + 1. */
export function gfMultiply(a: number, b: number): number {
  let result = 0
  let x = a
  let y = b
  for (let index = 0; index < 8; index++) {
    if (y & 1) result ^= x
    const high = x & 0x80
    x = (x << 1) & 0xff
    if (high) x ^= 0x1b
    y >>= 1
  }
  return result
}

function gfInverse(a: number): number {
  if (a === 0) return 0
  for (let value = 1; value < 256; value++) if (gfMultiply(a, value) === 1) return value
  return 0
}

function rotateLeft8(value: number, shift: number): number {
  return ((value << shift) | (value >> (8 - shift))) & 0xff
}

function buildSBox(): number[] {
  const table = new Array<number>(256)
  for (let value = 0; value < 256; value++) {
    const inverse = gfInverse(value)
    table[value] =
      (inverse ^ rotateLeft8(inverse, 1) ^ rotateLeft8(inverse, 2) ^ rotateLeft8(inverse, 3) ^ rotateLeft8(inverse, 4) ^ 0x63) & 0xff
  }
  return table
}

const SBOX = buildSBox()
const INV_SBOX = (() => {
  const inverse = new Array<number>(256)
  SBOX.forEach((value, index) => {
    inverse[value] = index
  })
  return inverse
})()

const RCON = (() => {
  const values = [0x01]
  for (let index = 1; index < 10; index++) values.push(xtime(values[index - 1]))
  return values
})()

function subBytes(state: number[]): number[] {
  return state.map((value) => SBOX[value])
}

function invSubBytes(state: number[]): number[] {
  return state.map((value) => INV_SBOX[value])
}

/** ShiftRows operates on column-major state: byte index = 4·column + row. */
function shiftRows(state: number[]): number[] {
  const result = new Array<number>(16)
  for (let column = 0; column < 4; column++) {
    for (let row = 0; row < 4; row++) {
      result[4 * column + row] = state[4 * ((column + row) % 4) + row]
    }
  }
  return result
}

function invShiftRows(state: number[]): number[] {
  const result = new Array<number>(16)
  for (let column = 0; column < 4; column++) {
    for (let row = 0; row < 4; row++) {
      result[4 * column + row] = state[4 * ((column - row + 4) % 4) + row]
    }
  }
  return result
}

export function mixColumns(state: number[]): number[] {
  const result = new Array<number>(16)
  for (let column = 0; column < 4; column++) {
    const a0 = state[4 * column]
    const a1 = state[4 * column + 1]
    const a2 = state[4 * column + 2]
    const a3 = state[4 * column + 3]
    result[4 * column] = gfMultiply(2, a0) ^ gfMultiply(3, a1) ^ a2 ^ a3
    result[4 * column + 1] = a0 ^ gfMultiply(2, a1) ^ gfMultiply(3, a2) ^ a3
    result[4 * column + 2] = a0 ^ a1 ^ gfMultiply(2, a2) ^ gfMultiply(3, a3)
    result[4 * column + 3] = gfMultiply(3, a0) ^ a1 ^ a2 ^ gfMultiply(2, a3)
  }
  return result
}

export function invMixColumns(state: number[]): number[] {
  const result = new Array<number>(16)
  for (let column = 0; column < 4; column++) {
    const a0 = state[4 * column]
    const a1 = state[4 * column + 1]
    const a2 = state[4 * column + 2]
    const a3 = state[4 * column + 3]
    result[4 * column] = gfMultiply(14, a0) ^ gfMultiply(11, a1) ^ gfMultiply(13, a2) ^ gfMultiply(9, a3)
    result[4 * column + 1] = gfMultiply(9, a0) ^ gfMultiply(14, a1) ^ gfMultiply(11, a2) ^ gfMultiply(13, a3)
    result[4 * column + 2] = gfMultiply(13, a0) ^ gfMultiply(9, a1) ^ gfMultiply(14, a2) ^ gfMultiply(11, a3)
    result[4 * column + 3] = gfMultiply(11, a0) ^ gfMultiply(13, a1) ^ gfMultiply(9, a2) ^ gfMultiply(14, a3)
  }
  return result
}

export function aesSBox(): number[] {
  return [...SBOX]
}

export function aesInvSBox(): number[] {
  return [...INV_SBOX]
}

export interface AesKeyWordStep {
  word: number
  previous: string
  rotated: string
  substituted: string
  rcon: string
  temp: string
  result: string
}

export interface AesKeyExpansion {
  key: string
  words: string[]
  roundKeys: string[]
  steps: AesKeyWordStep[]
}

function wordHex(word: number[]): string {
  return bytesToHex(word)
}

function roundKeyBytes(words: number[][], round: number): number[] {
  return [...words[4 * round], ...words[4 * round + 1], ...words[4 * round + 2], ...words[4 * round + 3]]
}

function wordList(expansion: AesKeyExpansion): number[][] {
  return expansion.words.map((word) => hexToBytes(word))
}

export function aesKeyExpansion(keyHex: string): AesKeyExpansion {
  const key = requireBytes(keyHex, 16, 'Key')
  const words: number[][] = []
  const steps: AesKeyWordStep[] = []
  for (let index = 0; index < 4; index++) words.push(key.slice(index * 4, index * 4 + 4))
  for (let index = 4; index < 44; index++) {
    const previous = words[index - 1]
    let temp = [...previous]
    let rotated = '—'
    let substituted = '—'
    let rcon = '—'
    if (index % 4 === 0) {
      const rot = [previous[1], previous[2], previous[3], previous[0]]
      const sub = rot.map((value) => SBOX[value])
      const rconWord = [RCON[index / 4 - 1], 0, 0, 0]
      temp = sub.map((value, offset) => value ^ rconWord[offset])
      rotated = wordHex(rot)
      substituted = wordHex(sub)
      rcon = wordHex(rconWord)
      steps.push({
        word: index,
        previous: wordHex(previous),
        rotated,
        substituted,
        rcon,
        temp: wordHex(temp),
        result: '',
      })
    }
    const result = words[index - 4].map((value, offset) => value ^ temp[offset])
    words.push(result)
    if (index % 4 === 0) steps[steps.length - 1].result = wordHex(result)
  }
  return {
    key: bytesToHex(key),
    words: words.map(wordHex),
    roundKeys: Array.from({ length: 11 }, (_, round) => bytesToHex(roundKeyBytes(words, round))),
    steps,
  }
}

export interface AesOperation {
  name: string
  before: string
  after: string
}

export interface AesRoundDetail {
  round: number
  label: string
  startState: string
  operations: AesOperation[]
  endState: string
}

export interface AesCipherDetail {
  input: string
  rounds: AesRoundDetail[]
  output: string
}

export function aesEncryptDetail(blockHex: string, keyHex: string): AesCipherDetail {
  const block = requireBytes(blockHex, 16, 'Block')
  const words = wordList(aesKeyExpansion(keyHex))
  const rounds: AesRoundDetail[] = []
  const initial = block.map((value, index) => value ^ roundKeyBytes(words, 0)[index])
  rounds.push({
    round: 0,
    label: 'Initial AddRoundKey',
    startState: bytesToHex(block),
    operations: [{ name: 'AddRoundKey', before: bytesToHex(block), after: bytesToHex(initial) }],
    endState: bytesToHex(initial),
  })
  let state = initial
  for (let round = 1; round <= 10; round++) {
    const start = bytesToHex(state)
    const subbed = subBytes(state)
    const shifted = shiftRows(subbed)
    const operations: AesOperation[] = [
      { name: 'SubBytes', before: start, after: bytesToHex(subbed) },
      { name: 'ShiftRows', before: bytesToHex(subbed), after: bytesToHex(shifted) },
    ]
    let mixed = shifted
    if (round !== 10) {
      mixed = mixColumns(shifted)
      operations.push({ name: 'MixColumns', before: bytesToHex(shifted), after: bytesToHex(mixed) })
    }
    const keyed = mixed.map((value, index) => value ^ roundKeyBytes(words, round)[index])
    operations.push({ name: 'AddRoundKey', before: bytesToHex(mixed), after: bytesToHex(keyed) })
    rounds.push({ round, label: `Round ${round}`, startState: start, operations, endState: bytesToHex(keyed) })
    state = keyed
  }
  return { input: bytesToHex(block), rounds, output: bytesToHex(state) }
}

export function aesDecryptDetail(blockHex: string, keyHex: string): AesCipherDetail {
  const block = requireBytes(blockHex, 16, 'Block')
  const words = wordList(aesKeyExpansion(keyHex))
  const rounds: AesRoundDetail[] = []
  const initial = block.map((value, index) => value ^ roundKeyBytes(words, 10)[index])
  rounds.push({
    round: 10,
    label: 'Initial AddRoundKey',
    startState: bytesToHex(block),
    operations: [{ name: 'AddRoundKey', before: bytesToHex(block), after: bytesToHex(initial) }],
    endState: bytesToHex(initial),
  })
  let state = initial
  for (let round = 9; round >= 1; round--) {
    const start = bytesToHex(state)
    const shifted = invShiftRows(state)
    const subbed = invSubBytes(shifted)
    const keyed = subbed.map((value, index) => value ^ roundKeyBytes(words, round)[index])
    const mixed = invMixColumns(keyed)
    rounds.push({
      round,
      label: `Round ${round}`,
      startState: start,
      operations: [
        { name: 'InvShiftRows', before: start, after: bytesToHex(shifted) },
        { name: 'InvSubBytes', before: bytesToHex(shifted), after: bytesToHex(subbed) },
        { name: 'AddRoundKey', before: bytesToHex(subbed), after: bytesToHex(keyed) },
        { name: 'InvMixColumns', before: bytesToHex(keyed), after: bytesToHex(mixed) },
      ],
      endState: bytesToHex(mixed),
    })
    state = mixed
  }
  const shifted = invShiftRows(state)
  const subbed = invSubBytes(shifted)
  const keyed = subbed.map((value, index) => value ^ roundKeyBytes(words, 0)[index])
  rounds.push({
    round: 0,
    label: 'Final AddRoundKey',
    startState: bytesToHex(state),
    operations: [
      { name: 'InvShiftRows', before: bytesToHex(state), after: bytesToHex(shifted) },
      { name: 'InvSubBytes', before: bytesToHex(shifted), after: bytesToHex(subbed) },
      { name: 'AddRoundKey', before: bytesToHex(subbed), after: bytesToHex(keyed) },
    ],
    endState: bytesToHex(keyed),
  })
  return { input: bytesToHex(block), rounds, output: bytesToHex(keyed) }
}

export function aesEncrypt(blockHex: string, keyHex: string): string {
  return aesEncryptDetail(blockHex, keyHex).output
}

export function aesDecrypt(blockHex: string, keyHex: string): string {
  return aesDecryptDetail(blockHex, keyHex).output
}

/** Return one encryption round (0 = initial AddRoundKey, 1..10 = rounds). */
export function aesRoundDetail(blockHex: string, keyHex: string, round: number): AesRoundDetail {
  if (!Number.isInteger(round) || round < 0 || round > 10) throw new Error('Choose a round between 0 and 10.')
  const selected = aesEncryptDetail(blockHex, keyHex).rounds.find((entry) => entry.round === round)
  if (!selected) throw new Error('Choose a round between 0 and 10.')
  return selected
}
