import { mod, multiplicativeInverse } from './modular'

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
