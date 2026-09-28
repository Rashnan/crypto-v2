import { describe, expect, it } from 'vitest'
import {
  applyPBox,
  inversePBoxMapping,
  lfsrSteps,
  sBoxInputBits,
  sBoxInverse,
  sBoxLookup,
  sBoxOutputBits,
} from './block'

describe('applyPBox', () => {
  it('permutes bits with a straight P-box', () => {
    const result = applyPBox('1101', [2, 4, 1, 3], 'straight')
    expect(result.output).toBe('1110')
    expect(result.steps[0]).toEqual({ outputPosition: 1, sourcePosition: 2, inputBit: '1', outputBit: '1' })
  })

  it('repeats inputs with an expansion P-box', () => {
    expect(applyPBox('1011', [4, 1, 2, 3, 2, 3, 4, 1], 'expansion').output).toBe('11010111')
  })

  it('drops inputs with a compression P-box', () => {
    expect(applyPBox('11010010', [2, 3, 5, 6, 7, 8], 'compression').output).toBe('100010')
  })

  it('rejects an invalid straight mapping', () => {
    expect(() => applyPBox('1101', [1, 1, 3, 4], 'straight')).toThrow('straight P-box')
  })

  it('rejects a bit string with other characters', () => {
    expect(() => applyPBox('10a1', [1, 2, 3, 4], 'straight')).toThrow('0s and 1s')
  })
})

describe('inversePBoxMapping', () => {
  it('recovers the original bits when applied to the output', () => {
    const mapping = [2, 4, 6, 8, 1, 3, 5, 7]
    const encrypted = applyPBox('11010010', mapping, 'straight')
    const inverse = inversePBoxMapping(mapping)
    expect(inverse).toEqual([5, 1, 6, 2, 7, 3, 8, 4])
    expect(applyPBox(encrypted.output, inverse, 'straight').output).toBe('11010010')
  })

  it('rejects non-bijective mappings', () => {
    expect(() => inversePBoxMapping([1, 1, 2])).toThrow('permutation')
  })
})

describe('sBoxLookup', () => {
  const present = [0xe, 0x4, 0xd, 0x1, 0x2, 0xf, 0xb, 0x8, 0x3, 0xa, 0x6, 0xc, 0x5, 0x9, 0x0, 0x7]

  it('maps an input through the table', () => {
    expect(sBoxInputBits(present)).toBe(4)
    expect(sBoxOutputBits(present)).toBe(4)
    expect(sBoxLookup('1011', present)).toEqual({
      inputValue: 11,
      inputBinary: '1011',
      outputValue: 12,
      outputBinary: '1100',
    })
  })

  it('builds the inverse table for a bijective S-box', () => {
    const inverse = sBoxInverse(present)
    expect(inverse).not.toBeNull()
    expect(inverse?.[12]).toBe(11)
    expect(sBoxInverse([0, 0, 1, 1])).toBeNull()
  })
})

describe('lfsrSteps', () => {
  it('shifts and feeds back the XOR of the tapped bits', () => {
    const steps = lfsrSteps('1001', [4, 1], 3)
    expect(steps[0]).toMatchObject({ state: '1001', tappedBits: ['1', '1'], feedback: 0, output: 1, nextState: '0100' })
    expect(steps[1]).toMatchObject({ state: '0100', tappedBits: ['0', '0'], feedback: 0, output: 0, nextState: '0010' })
    expect(steps.map((step) => step.output).join('')).toBe('100')
  })

  it('rejects an out-of-range tap', () => {
    expect(() => lfsrSteps('1001', [5], 1)).toThrow('between 1 and 4')
  })
})
