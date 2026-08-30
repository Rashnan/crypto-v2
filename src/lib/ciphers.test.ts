import { describe, expect, it } from 'vitest'
import {
  additiveCipher,
  additiveCipherResult,
  affineCipher,
  multiplicativeCipher,
} from './ciphers'

describe('additiveCipher', () => {
  it('encrypts and decrypts while preserving case and punctuation', () => {
    const encrypted = additiveCipher('Attack at dawn!', 7, 'encrypt')
    expect(encrypted).toBe('Haahjr ha khdu!')
    expect(additiveCipher(encrypted, 7, 'decrypt')).toBe('Attack at dawn!')
  })

  it('records one calculation for each letter', () => {
    const result = additiveCipherResult('A b!', 7, 'encrypt')
    expect(result.steps).toEqual([
      {
        position: 1,
        inputLetter: 'A',
        inputValue: 0,
        calculation: '(0 + 7) mod 26 = 7',
        outputValue: 7,
        outputLetter: 'H',
      },
      {
        position: 3,
        inputLetter: 'b',
        inputValue: 1,
        calculation: '(1 + 7) mod 26 = 8',
        outputValue: 8,
        outputLetter: 'i',
      },
    ])
  })
})

describe('multiplicativeCipher', () => {
  it('encrypts and decrypts with a unit modulo 26', () => {
    const encrypted = multiplicativeCipher('Hello, World!', 5, 'encrypt')
    expect(encrypted).toBe('Judds, Gshdp!')
    expect(multiplicativeCipher(encrypted, 5, 'decrypt')).toBe('Hello, World!')
  })

  it('rejects a key without an inverse modulo 26', () => {
    expect(() => multiplicativeCipher('test', 2, 'encrypt')).toThrow('coprime with 26')
  })
})

describe('affineCipher', () => {
  it('encrypts and decrypts with both keys', () => {
    const encrypted = affineCipher('Affine Cipher', 5, 8, 'encrypt')
    expect(encrypted).toBe('Ihhwvc Swfrcp')
    expect(affineCipher(encrypted, 5, 8, 'decrypt')).toBe('Affine Cipher')
  })
})
