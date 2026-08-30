import { describe, expect, it } from 'vitest'
import {
  additiveCipher,
  additiveCipherResult,
  affineCipher,
  autokeyCipher,
  hillCipher,
  hillKeyDetails,
  multiplicativeCipher,
  playfairCipher,
  substitutionCipher,
  vigenereCipher,
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

describe('classical ciphers', () => {
  it('encrypts and decrypts a substitution alphabet', () => {
    const key = 'QWERTYUIOPASDFGHJKLZXCVBNM'
    expect(substitutionCipher('Attack!', key, 'encrypt')).toBe('Qzzqea!')
    expect(substitutionCipher('Qzzqea!', key, 'decrypt')).toBe('Attack!')
  })

  it('encrypts and decrypts Vigenère text', () => {
    expect(vigenereCipher('ATTACKATDAWN', 'LEMON', 'encrypt')).toBe('LXFOPVEFRNHR')
    expect(vigenereCipher('LXFOPVEFRNHR', 'LEMON', 'decrypt')).toBe('ATTACKATDAWN')
  })

  it('encrypts and decrypts autokey text', () => {
    const encrypted = autokeyCipher('ATTACKATDAWN', 'QUEENLY', 'encrypt')
    expect(encrypted).toBe('QNXEPVYTWTWP')
    expect(autokeyCipher(encrypted, 'QUEENLY', 'decrypt')).toBe('ATTACKATDAWN')
  })

  it('encrypts and decrypts Playfair pairs', () => {
    const encrypted = playfairCipher('HIDETHEGOLDINTHETREESTUMP', 'PLAYFAIR EXAMPLE', 'encrypt')
    expect(encrypted).toBe('BMODZBXDNABEKUDMUIXMMOUVIF')
    expect(playfairCipher(encrypted, 'PLAYFAIR EXAMPLE', 'decrypt')).toBe('HIDETHEGOLDINTHETREXESTUMP')
  })

  it('encrypts and decrypts Hill pairs', () => {
    expect(hillCipher('HELP', [3, 3, 2, 5], 'encrypt')).toBe('HIAT')
    expect(hillCipher('HIAT', [3, 3, 2, 5], 'decrypt')).toBe('HELP')
  })

  it('encrypts and decrypts Hill blocks with a 3 × 3 matrix', () => {
    const key = [6, 24, 1, 13, 16, 10, 20, 17, 15]
    const encrypted = hillCipher('ACT', key, 'encrypt')
    expect(encrypted).toBe('POH')
    expect(hillCipher(encrypted, key, 'decrypt')).toBe('ACT')
  })

  it('reports whether a Hill key is invertible', () => {
    expect(hillKeyDetails([3, 3, 2, 5])).toMatchObject({ dimension: 2, determinant: 9, gcd: 1, invertible: true })
    expect(hillKeyDetails([2, 4, 1, 2])).toMatchObject({ determinant: 0, gcd: 26, invertible: false })
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
