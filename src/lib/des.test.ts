import { describe, expect, it } from 'vitest'
import { bitsToHex, desDecrypt, desEncrypt, desKeySchedule, desRoundDetail, hexToBits, permute } from './des'

describe('desKeySchedule', () => {
  it('produces the standard subkeys for the reference key', () => {
    const schedule = desKeySchedule('133457799BBCDFF1')
    expect(schedule.c0).toBe('1111000011001100101010101111')
    expect(schedule.d0).toBe('0101010101100110011110001111')
    expect(schedule.subkeys[0].subkey).toBe('000110110000001011101111111111000111000001110010')
    expect(schedule.subkeys).toHaveLength(16)
  })
})

describe('desEncrypt', () => {
  it('matches the reference vector', () => {
    const result = desEncrypt('0123456789ABCDEF', '133457799BBCDFF1')
    expect(result.outputHex).toBe('85E813540F0AB405')
    expect(result.rounds).toHaveLength(16)
  })

  it('round-trips through decryption', () => {
    const encrypted = desEncrypt('0123456789ABCDEF', '133457799BBCDFF1')
    expect(desDecrypt(encrypted.outputHex, '133457799BBCDFF1').outputHex).toBe('0123456789ABCDEF')
  })
})

describe('desRoundDetail', () => {
  it('records one round of working', () => {
    const detail = desRoundDetail('0123456789ABCDEF', '133457799BBCDFF1', 1)
    expect(detail.round).toBe(1)
    expect(detail.detail.expanded).toHaveLength(48)
    expect(detail.detail.sboxes).toHaveLength(8)
    expect(detail.detail.sboxes[0]).toMatchObject({ box: 1, row: 0, column: 12, value: 5 })
  })
})

describe('helpers', () => {
  it('round-trips hex and bits', () => {
    const bits = hexToBits('A5', 8)
    expect(bits).toEqual([1, 0, 1, 0, 0, 1, 0, 1])
    expect(bitsToHex(bits)).toBe('A5')
  })

  it('permutes with 1-indexed tables', () => {
    expect(permute([1, 0, 1, 1], [2, 4, 1, 3])).toEqual([0, 1, 1, 1])
  })
})
