type Bits = number[]

export function hexToBits(hex: string, length: number): Bits {
  const clean = hex.trim().toLowerCase().replace(/[^0-9a-f]/g, '')
  if (clean.length !== length / 4) {
    throw new Error(`Enter exactly ${length / 4} hex digits (${length} bits).`)
  }
  const bits: Bits = []
  for (const character of clean) {
    const value = parseInt(character, 16)
    for (let bit = 3; bit >= 0; bit--) bits.push((value >> bit) & 1)
  }
  return bits
}

export function bitsToHex(bits: Bits): string {
  let hex = ''
  for (let index = 0; index < bits.length; index += 4) {
    let value = 0
    for (let offset = 0; offset < 4; offset++) value = (value << 1) | bits[index + offset]
    hex += value.toString(16).toUpperCase()
  }
  return hex
}

export function bitsToString(bits: Bits): string {
  return bits.join('')
}

/** Apply a 1-indexed DES permutation table. */
export function permute(input: Bits, table: number[]): Bits {
  return table.map((position) => input[position - 1])
}

export function xorBits(a: Bits, b: Bits): Bits {
  return a.map((bit, index) => bit ^ b[index])
}

function rotateLeft(bits: Bits, count: number): Bits {
  return bits.slice(count).concat(bits.slice(0, count))
}

const IP = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7,
]

const FP = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31,
  38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
  36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
  34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25,
]

const E = [
  32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11,
  12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21,
  22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1,
]

const P = [
  16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10,
  2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25,
]

const PC1 = [
  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18,
  10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
  14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
]

const PC2 = [
  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4,
  26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40,
  51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32,
]

const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1]

const SBOXES: number[][][] = [
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
  ],
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
  ],
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
  ],
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
  ],
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
  ],
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
  ],
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
  ],
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
  ],
]

function intToBits(value: number, length: number): Bits {
  return Array.from({ length }, (_, index) => (value >> (length - 1 - index)) & 1)
}

export interface DesSubkeyStep {
  round: number
  shift: number
  c: string
  d: string
  subkey: string
}

export interface DesKeySchedule {
  key: string
  pc1: string
  c0: string
  d0: string
  subkeys: DesSubkeyStep[]
}

export function desKeySchedule(keyHex: string): DesKeySchedule {
  const key = hexToBits(keyHex, 64)
  const selected = permute(key, PC1)
  let c = selected.slice(0, 28)
  let d = selected.slice(28)
  const subkeys: DesSubkeyStep[] = []
  SHIFTS.forEach((shift, index) => {
    c = rotateLeft(c, shift)
    d = rotateLeft(d, shift)
    subkeys.push({
      round: index + 1,
      shift,
      c: bitsToString(c),
      d: bitsToString(d),
      subkey: bitsToString(permute(c.concat(d), PC2)),
    })
  })
  return {
    key: bitsToString(key),
    pc1: bitsToString(selected),
    c0: bitsToString(selected.slice(0, 28)),
    d0: bitsToString(selected.slice(28)),
    subkeys,
  }
}

export interface DesSBoxStep {
  box: number
  input: string
  row: number
  column: number
  value: number
  output: string
}

export interface DesRoundDetail {
  round: number
  subkey: string
  leftIn: string
  rightIn: string
  expanded: string
  xored: string
  sboxes: DesSBoxStep[]
  sboxOutput: string
  pboxed: string
  leftOut: string
  rightOut: string
}

function desRound(left: Bits, right: Bits, subkey: Bits, round: number): { detail: DesRoundDetail; left: Bits; right: Bits } {
  const expanded = permute(right, E)
  const xored = xorBits(expanded, subkey)
  const sboxes: DesSBoxStep[] = []
  const sboxOutput: Bits = []
  for (let box = 0; box < 8; box++) {
    const group = xored.slice(box * 6, box * 6 + 6)
    const row = (group[0] << 1) | group[5]
    const column = (group[1] << 3) | (group[2] << 2) | (group[3] << 1) | group[4]
    const value = SBOXES[box][row][column]
    sboxes.push({
      box: box + 1,
      input: bitsToString(group),
      row,
      column,
      value,
      output: bitsToString(intToBits(value, 4)),
    })
    sboxOutput.push(...intToBits(value, 4))
  }
  const pboxed = permute(sboxOutput, P)
  const leftOut = right
  const rightOut = xorBits(left, pboxed)
  return {
    detail: {
      round,
      subkey: bitsToString(subkey),
      leftIn: bitsToString(left),
      rightIn: bitsToString(right),
      expanded: bitsToString(expanded),
      xored: bitsToString(xored),
      sboxes,
      sboxOutput: bitsToString(sboxOutput),
      pboxed: bitsToString(pboxed),
      leftOut: bitsToString(leftOut),
      rightOut: bitsToString(rightOut),
    },
    left: leftOut,
    right: rightOut,
  }
}

export interface DesRoundResult {
  round: number
  subkey: string
  detail: DesRoundDetail
}

/**
 * Run the block up to `round` and return that round's full working. In decrypt
 * mode the subkeys are consumed in reverse order.
 */
export function desRoundDetail(blockHex: string, keyHex: string, round: number, mode: 'encrypt' | 'decrypt' = 'encrypt'): DesRoundResult {
  if (!Number.isInteger(round) || round < 1 || round > 16) throw new Error('Choose a round between 1 and 16.')
  const schedule = desKeySchedule(keyHex)
  const order = mode === 'decrypt' ? [...schedule.subkeys].reverse() : schedule.subkeys
  const block = permute(hexToBits(blockHex, 64), IP)
  let left = block.slice(0, 32)
  let right = block.slice(32)
  let detail = desRound(left, right, bitsOf(order[0].subkey), 1).detail
  for (let index = 1; index < round; index++) {
    const result = desRound(left, right, bitsOf(order[index].subkey), index + 1)
    left = result.left
    right = result.right
    detail = result.detail
  }
  return { round, subkey: detail.subkey, detail }
}

function bitsOf(value: string): Bits {
  return Array.from(value, (character) => Number(character))
}

export interface DesCipherDetail {
  input: string
  ip: string
  rounds: DesRoundDetail[]
  preoutput: string
  output: string
  outputHex: string
}

function desCipher(blockHex: string, keyHex: string, decrypt: boolean): DesCipherDetail {
  const schedule = desKeySchedule(keyHex)
  const block = hexToBits(blockHex, 64)
  const ip = permute(block, IP)
  let left = ip.slice(0, 32)
  let right = ip.slice(32)
  const order = decrypt ? [...schedule.subkeys].reverse() : schedule.subkeys
  const rounds: DesRoundDetail[] = []
  order.forEach((subkeyStep, index) => {
    const result = desRound(left, right, bitsOf(subkeyStep.subkey), index + 1)
    left = result.left
    right = result.right
    rounds.push(result.detail)
  })
  const preoutput = right.concat(left)
  const output = permute(preoutput, FP)
  return {
    input: bitsToString(block),
    ip: bitsToString(ip),
    rounds,
    preoutput: bitsToString(preoutput),
    output: bitsToString(output),
    outputHex: bitsToHex(output),
  }
}

export function desEncrypt(blockHex: string, keyHex: string): DesCipherDetail {
  return desCipher(blockHex, keyHex, false)
}

export function desDecrypt(blockHex: string, keyHex: string): DesCipherDetail {
  return desCipher(blockHex, keyHex, true)
}

export interface DesTables {
  ip: number[]
  fp: number[]
  expansion: number[]
  permutation: number[]
  pc1: number[]
  pc2: number[]
  shifts: number[]
  sboxes: number[][][]
}

/** The fixed DES permutation and substitution tables, for display. */
export function desTables(): DesTables {
  return {
    ip: [...IP],
    fp: [...FP],
    expansion: [...E],
    permutation: [...P],
    pc1: [...PC1],
    pc2: [...PC2],
    shifts: [...SHIFTS],
    sboxes: SBOXES.map((box) => box.map((row) => [...row])),
  }
}
