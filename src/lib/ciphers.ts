import { gcd, mod, multiplicativeInverse } from './modular'
import { matrixInverseMod } from './matmod'

export type CipherMode = 'encrypt' | 'decrypt'

export interface CipherStep {
  position: number
  inputLetter: string
  inputValue: number
  calculation: string
  outputValue: number
  outputLetter: string
}

export interface CipherResult {
  output: string
  steps: CipherStep[]
}

export interface AdditiveKeyDetails {
  key: number
  inverse: number
}

export interface MultiplicativeKeyDetails {
  key: number
  gcd: number
  inverse: number | null
}

export function additiveKeyDetails(key: number): AdditiveKeyDetails {
  return { key, inverse: mod(-key, 26) }
}

export function multiplicativeKeyDetails(key: number): MultiplicativeKeyDetails {
  const inverse = multiplicativeInverse(key, 26)
  return { key, gcd: gcd(key, 26), inverse: inverse.exists ? inverse.inverse : null }
}

function transformLetters(
  text: string,
  transform: (value: number) => number,
  calculation: (value: number, result: number) => string,
): CipherResult {
  const steps: CipherStep[] = []
  const output = Array.from(text, (character, position) => {
    const code = character.charCodeAt(0)
    const base = code >= 65 && code <= 90 ? 65 : code >= 97 && code <= 122 ? 97 : null
    if (base === null) return character
    const inputValue = code - base
    const outputValue = mod(transform(inputValue), 26)
    const outputLetter = String.fromCharCode(base + outputValue)
    steps.push({
      position: position + 1,
      inputLetter: character,
      inputValue,
      calculation: calculation(inputValue, outputValue),
      outputValue,
      outputLetter,
    })
    return outputLetter
  }).join('')
  return { output, steps }
}

export function additiveCipherResult(text: string, key: number, mode: CipherMode): CipherResult {
  const shift = mode === 'encrypt' ? key : -key
  const operator = shift >= 0 ? '+' : '−'
  return transformLetters(
    text,
    (value) => value + shift,
    (value, result) => `(${value} ${operator} ${Math.abs(shift)}) mod 26 = ${result}`,
  )
}

export function additiveCipher(text: string, key: number, mode: CipherMode): string {
  return additiveCipherResult(text, key, mode).output
}

export function multiplicativeCipherResult(text: string, key: number, mode: CipherMode): CipherResult {
  const inverse = multiplicativeInverse(key, 26)
  if (!inverse.exists) throw new Error('The key must be coprime with 26.')
  const factor = mode === 'encrypt' ? mod(key, 26) : inverse.inverse
  return transformLetters(
    text,
    (value) => value * factor,
    (value, result) => `(${factor} × ${value}) mod 26 = ${result}`,
  )
}

export function multiplicativeCipher(text: string, key: number, mode: CipherMode): string {
  return multiplicativeCipherResult(text, key, mode).output
}

export function affineCipherResult(
  text: string,
  multiplicativeKey: number,
  additiveKey: number,
  mode: CipherMode,
): CipherResult {
  const inverse = multiplicativeInverse(multiplicativeKey, 26)
  if (!inverse.exists) throw new Error('The multiplicative key must be coprime with 26.')

  return mode === 'encrypt'
    ? transformLetters(
        text,
        (value) => multiplicativeKey * value + additiveKey,
        (value, result) => `(${multiplicativeKey} × ${value} + ${additiveKey}) mod 26 = ${result}`,
      )
    : transformLetters(
        text,
        (value) => inverse.inverse * (value - additiveKey),
        (value, result) => `(${inverse.inverse} × (${value} − ${additiveKey})) mod 26 = ${result}`,
      )
}

export function affineCipher(
  text: string,
  multiplicativeKey: number,
  additiveKey: number,
  mode: CipherMode,
): string {
  return affineCipherResult(text, multiplicativeKey, additiveKey, mode).output
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function letterValues(text: string): number[] {
  return Array.from(text.toUpperCase()).filter((character) => alphabet.includes(character)).map((character) => character.charCodeAt(0) - 65)
}

function keywordValues(key: string): number[] {
  const values = letterValues(key)
  if (values.length === 0) throw new Error('Enter a key containing at least one letter.')
  return values
}

function transformWithKey(text: string, key: number[], mode: CipherMode, autokey = false): string {
  let keyIndex = 0
  const plaintext: number[] = []
  return Array.from(text, (character) => {
    const code = character.charCodeAt(0)
    const base = code >= 65 && code <= 90 ? 65 : code >= 97 && code <= 122 ? 97 : null
    if (base === null) return character
    const value = code - base
    const shift = keyIndex < key.length ? key[keyIndex] : autokey ? plaintext[keyIndex - key.length] : key[keyIndex % key.length]
    const result = mod(mode === 'encrypt' ? value + shift : value - shift, 26)
    plaintext.push(mode === 'encrypt' ? value : result)
    keyIndex += 1
    return String.fromCharCode(base + result)
  }).join('')
}

export function substitutionCipher(text: string, key: string, mode: CipherMode): string {
  const normalized = key.toUpperCase().replace(/[^A-Z]/g, '')
  if (normalized.length !== 26 || new Set(normalized).size !== 26) {
    throw new Error('Use all 26 letters exactly once for the substitution alphabet.')
  }
  const source = mode === 'encrypt' ? alphabet : normalized
  const destination = mode === 'encrypt' ? normalized : alphabet
  return Array.from(text, (character) => {
    const index = source.indexOf(character.toUpperCase())
    if (index < 0) return character
    const output = destination[index]
    return character === character.toLowerCase() ? output.toLowerCase() : output
  }).join('')
}

export function vigenereCipher(text: string, key: string, mode: CipherMode): string {
  return transformWithKey(text, keywordValues(key), mode)
}

export function autokeyCipher(text: string, key: string, mode: CipherMode): string {
  return transformWithKey(text, keywordValues(key), mode, true)
}

function playfairSquare(key: string): string[] {
  const sequence = `${key.toUpperCase().replace(/J/g, 'I')}${alphabet.replace('J', '')}`.replace(/[^A-Z]/g, '')
  return Array.from(new Set(sequence))
}

function playfairPairs(text: string, decrypt: boolean): Array<[string, string]> {
  const letters = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '')
  if (decrypt) {
    if (letters.length % 2 !== 0) throw new Error('Playfair ciphertext must contain an even number of letters.')
    return Array.from({ length: letters.length / 2 }, (_, index) => [letters[index * 2], letters[index * 2 + 1]])
  }
  const pairs: Array<[string, string]> = []
  for (let index = 0; index < letters.length;) {
    const first = letters[index]
    const second = letters[index + 1]
    if (!second || first === second) {
      pairs.push([first, first === 'X' ? 'Q' : 'X'])
      index += 1
    } else {
      pairs.push([first, second])
      index += 2
    }
  }
  return pairs
}

export function playfairCipher(text: string, key: string, mode: CipherMode): string {
  const square = playfairSquare(key)
  const direction = mode === 'encrypt' ? 1 : -1
  return playfairPairs(text, mode === 'decrypt').map(([first, second]) => {
    const firstIndex = square.indexOf(first)
    const secondIndex = square.indexOf(second)
    const firstRow = Math.floor(firstIndex / 5)
    const firstColumn = firstIndex % 5
    const secondRow = Math.floor(secondIndex / 5)
    const secondColumn = secondIndex % 5
    if (firstRow === secondRow) return `${square[firstRow * 5 + mod(firstColumn + direction, 5)]}${square[secondRow * 5 + mod(secondColumn + direction, 5)]}`
    if (firstColumn === secondColumn) return `${square[mod(firstRow + direction, 5) * 5 + firstColumn]}${square[mod(secondRow + direction, 5) * 5 + secondColumn]}`
    return `${square[firstRow * 5 + secondColumn]}${square[secondRow * 5 + firstColumn]}`
  }).join('')
}

function matrixFromKey(key: number[]): number[][] {
  const dimension = Math.sqrt(key.length)
  if (!Number.isInteger(dimension) || dimension < 2) throw new Error('Use a square key matrix with at least two rows.')
  return Array.from({ length: dimension }, (_, row) => key.slice(row * dimension, (row + 1) * dimension).map((value) => mod(value, 26)))
}

function inverseMatrix(matrix: number[][]): number[][] {
  const result = matrixInverseMod(matrix, 26)
  if (!result.invertible || !result.inverse) throw new Error('The key matrix determinant must be coprime with 26.')
  return result.inverse
}

function multiplyMatrixVector(matrix: number[][], values: number[]): number[] {
  return matrix.map((row) => mod(row.reduce((sum, value, index) => sum + value * values[index], 0), 26))
}

export function hillCipher(text: string, key: number[], mode: CipherMode): string {
  const sourceMatrix = matrixFromKey(key)
  const matrix = mode === 'encrypt' ? sourceMatrix : inverseMatrix(sourceMatrix)
  const values = letterValues(text)
  while (values.length % matrix.length !== 0) values.push(23)
  return Array.from({ length: values.length / matrix.length }, (_, index) =>
    multiplyMatrixVector(matrix, values.slice(index * matrix.length, (index + 1) * matrix.length))
      .map((value) => String.fromCharCode(65 + value)).join(''),
  ).join('')
}

export interface ClassicalCipherStep {
  position: number
  input: string
  key: string
  calculation: string
  output: string
  inputValues?: number[]
  outputValues?: number[]
}

export interface ClassicalCipherResult {
  output: string
  steps: ClassicalCipherStep[]
  matrix?: Array<Array<number | string>>
}

export function substitutionCipherResult(text: string, key: string, mode: CipherMode): ClassicalCipherResult {
  const output = substitutionCipher(text, key, mode)
  const normalized = key.toUpperCase().replace(/[^A-Z]/g, '')
  const source = mode === 'encrypt' ? alphabet : normalized
  const destination = mode === 'encrypt' ? normalized : alphabet
  const steps = Array.from(text).flatMap((character, index) => {
    const value = character.toUpperCase()
    const mappedIndex = source.indexOf(value)
    return mappedIndex < 0 ? [] : [{ position: index + 1, input: character, key: value, calculation: `${value} → ${destination[mappedIndex]}`, output: output[index] }]
  })
  return { output, steps }
}

function keyedCipherResult(text: string, keyText: string, mode: CipherMode, autokey: boolean): ClassicalCipherResult {
  const initialKey = keywordValues(keyText)
  let keyIndex = 0
  const plaintext: number[] = []
  const steps: ClassicalCipherStep[] = []
  const output = Array.from(text, (character, position) => {
    const code = character.charCodeAt(0)
    const base = code >= 65 && code <= 90 ? 65 : code >= 97 && code <= 122 ? 97 : null
    if (base === null) return character
    const value = code - base
    const shift = keyIndex < initialKey.length ? initialKey[keyIndex] : autokey ? plaintext[keyIndex - initialKey.length] : initialKey[keyIndex % initialKey.length]
    const result = mod(mode === 'encrypt' ? value + shift : value - shift, 26)
    const keyLetter = String.fromCharCode(65 + shift)
    const outputLetter = String.fromCharCode(base + result)
    steps.push({ position: position + 1, input: character, key: keyLetter, calculation: `(${value} ${mode === 'encrypt' ? '+' : '−'} ${shift}) mod 26 = ${result}`, output: outputLetter })
    plaintext.push(mode === 'encrypt' ? value : result)
    keyIndex += 1
    return outputLetter
  }).join('')
  return { output, steps }
}

export function vigenereCipherResult(text: string, key: string, mode: CipherMode): ClassicalCipherResult {
  return keyedCipherResult(text, key, mode, false)
}

export function autokeyCipherResult(text: string, key: string, mode: CipherMode): ClassicalCipherResult {
  return keyedCipherResult(text, key, mode, true)
}

export function playfairCipherResult(text: string, key: string, mode: CipherMode): ClassicalCipherResult {
  const square = playfairSquare(key)
  const direction = mode === 'encrypt' ? 1 : -1
  const steps = playfairPairs(text, mode === 'decrypt').map(([first, second], index) => {
    const firstIndex = square.indexOf(first)
    const secondIndex = square.indexOf(second)
    const firstRow = Math.floor(firstIndex / 5)
    const firstColumn = firstIndex % 5
    const secondRow = Math.floor(secondIndex / 5)
    const secondColumn = secondIndex % 5
    let output: string
    let calculation: string
    if (firstRow === secondRow) {
      output = `${square[firstRow * 5 + mod(firstColumn + direction, 5)]}${square[secondRow * 5 + mod(secondColumn + direction, 5)]}`
      calculation = `same row, shift ${mode === 'encrypt' ? 'right' : 'left'}`
    } else if (firstColumn === secondColumn) {
      output = `${square[mod(firstRow + direction, 5) * 5 + firstColumn]}${square[mod(secondRow + direction, 5) * 5 + secondColumn]}`
      calculation = `same column, shift ${mode === 'encrypt' ? 'down' : 'up'}`
    } else {
      output = `${square[firstRow * 5 + secondColumn]}${square[secondRow * 5 + firstColumn]}`
      calculation = 'rectangle, swap columns'
    }
    return { position: index + 1, input: `${first}${second}`, key: '5 × 5 square', calculation, output }
  })
  return {
    output: steps.map((step) => step.output).join(''),
    steps,
    matrix: Array.from({ length: 5 }, (_, index) =>
      square.slice(index * 5, index * 5 + 5).map((letter) => (letter === 'I' ? 'I/J' : letter)),
    ),
  }
}

export function hillCipherResult(text: string, key: number[], mode: CipherMode): ClassicalCipherResult {
  const sourceMatrix = matrixFromKey(key)
  const matrix = mode === 'encrypt' ? sourceMatrix : inverseMatrix(sourceMatrix)
  const values = letterValues(text)
  while (values.length % matrix.length !== 0) values.push(23)
  const steps = Array.from({ length: values.length / matrix.length }, (_, index) => {
    const inputValues = values.slice(index * matrix.length, (index + 1) * matrix.length)
    const outputValues = multiplyMatrixVector(matrix, inputValues)
    return {
      position: index + 1,
      input: inputValues.map((value) => String.fromCharCode(65 + value)).join(''),
      key: `${matrix.length} × ${matrix.length} matrix`,
      calculation: `matrix product mod 26 = [${outputValues.join(', ')}]`,
      output: outputValues.map((value) => String.fromCharCode(65 + value)).join(''),
      inputValues,
      outputValues,
    }
  })
  return { output: steps.map((step) => step.output).join(''), steps, matrix }
}
