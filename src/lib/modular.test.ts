import { describe, expect, it } from 'vitest'
import { additiveInverse, allAdditiveInverses, mod } from './modular'

describe('mod', () => {
  it('normalizes positive values into [0, m)', () => {
    expect(mod(7, 5)).toBe(2)
    expect(mod(5, 5)).toBe(0)
    expect(mod(0, 5)).toBe(0)
  })

  it('maps negative values to canonical representatives', () => {
    expect(mod(-1, 5)).toBe(4)
    expect(mod(-7, 5)).toBe(3)
    expect(mod(-5, 5)).toBe(0)
  })
})

describe('additiveInverse', () => {
  it('inverts every element of ℤ/mℤ', () => {
    for (const m of [5, 8, 12]) {
      for (let x = 0; x < m; x++) {
        const inv = additiveInverse(x, m)
        expect(inv).toBeGreaterThanOrEqual(0)
        expect(inv).toBeLessThan(m)
        expect((x + inv) % m).toBe(0)
      }
    }
  })

  it('returns 0 for 0 and self-inverses at m/2 when m is even', () => {
    expect(additiveInverse(0, 8)).toBe(0)
    expect(additiveInverse(4, 8)).toBe(4)
  })

  it('computes specific inverses', () => {
    expect(additiveInverse(3, 7)).toBe(4)
    expect(additiveInverse(6, 7)).toBe(1)
    expect(additiveInverse(2, 10)).toBe(8)
  })
})

describe('allAdditiveInverses', () => {
  it('enumerates every element with its unique inverse', () => {
    const pairs = allAdditiveInverses(5)
    expect(pairs).toHaveLength(5)
    expect(pairs.map((p) => p.x)).toEqual([0, 1, 2, 3, 4])
    for (const p of pairs) {
      expect((p.x + p.inverse) % 5).toBe(0)
    }
  })

  it('throws for invalid moduli', () => {
    expect(() => allAdditiveInverses(1)).toThrow()
    expect(() => allAdditiveInverses(0)).toThrow()
    expect(() => allAdditiveInverses(2.5)).toThrow()
  })
})
