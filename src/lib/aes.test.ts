import { describe, expect, it } from 'vitest'
import { aesDecrypt, aesEncrypt, aesKeyExpansion, aesRoundDetail, aesSBox, bytesToHex, hexToBytes } from './aes'

const key = '000102030405060708090A0B0C0D0E0F'
const block = '00112233445566778899AABBCCDDEEFF'

describe('aesSBox', () => {
  it('matches known S-box entries', () => {
    const sbox = aesSBox()
    expect(sbox[0x00]).toBe(0x63)
    expect(sbox[0x01]).toBe(0x7c)
    expect(sbox[0x53]).toBe(0xed)
  })
})

describe('aesKeyExpansion', () => {
  it('produces the standard round keys', () => {
    const expansion = aesKeyExpansion(key)
    expect(expansion.roundKeys[0]).toBe('000102030405060708090A0B0C0D0E0F')
    expect(expansion.roundKeys[1]).toBe('D6AA74FDD2AF72FADAA678F1D6AB76FE')
    expect(expansion.roundKeys).toHaveLength(11)
  })
})

describe('aesEncrypt', () => {
  it('matches the FIPS-197 reference vector', () => {
    expect(aesEncrypt(block, key)).toBe('69C4E0D86A7B0430D8CDB78070B4C55A')
  })

  it('round-trips through decryption', () => {
    const encrypted = aesEncrypt(block, key)
    expect(aesDecrypt(encrypted, key)).toBe(block)
  })
})

describe('aesRoundDetail', () => {
  it('records the operations of a round', () => {
    const round = aesRoundDetail(block, key, 1)
    expect(round.operations.map((operation) => operation.name)).toEqual(['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'])
    expect(round.endState).toHaveLength(32)
  })
})

describe('byte helpers', () => {
  it('round-trips hex', () => {
    expect(hexToBytes('00FF10')).toEqual([0x00, 0xff, 0x10])
    expect(bytesToHex([0, 255, 16])).toBe('00FF10')
  })
})
