import { describe, expect, it } from 'vitest'
import {
  additiveInverse,
  allAdditiveInverses,
  allMultiplicativeInverses,
  isCoprime,
  mod,
  multiplicativeInverse,
} from './modular'

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

describe('multiplicativeInverse', () => {
  it('inverts elements coprime to the modulus', () => {
    for (const m of [5, 7, 9, 12]) {
      for (let x = 1; x < m; x++) {
        if (!isCoprime(x, m)) continue
        const r = multiplicativeInverse(x, m)
        expect(r.exists).toBe(true)
        if (r.exists) {
          expect((x * r.inverse) % m).toBe(1)
          expect(r.inverse).toBeGreaterThanOrEqual(0)
          expect(r.inverse).toBeLessThan(m)
        }
      }
    }
  })

  it('reports no inverse when x is not coprime to m', () => {
    expect(multiplicativeInverse(4, 8).exists).toBe(false)
    expect(multiplicativeInverse(6, 9).exists).toBe(false)
    expect(multiplicativeInverse(0, 5).exists).toBe(false)
  })

  it('normalizes x into the ring before inverting', () => {
    // -1 mod 7 is 6, whose inverse is 6.
    const r = multiplicativeInverse(-1, 7)
    expect(r.exists).toBe(true)
    if (r.exists) expect(r.inverse).toBe(6)
    // 10 mod 7 is 3, whose inverse is 5.
    const r2 = multiplicativeInverse(10, 7)
    expect(r2.exists).toBe(true)
    if (r2.exists) expect(r2.inverse).toBe(5)
  })

  it('flags an invalid modulus', () => {
    expect(multiplicativeInverse(3, 1).exists).toBe(false)
  })
})

describe('allMultiplicativeInverses', () => {
  it('enumerates exactly the units of ℤ/mℤ', () => {
    // Units of ℤ/12ℤ: 1, 5, 7, 11.
    const pairs = allMultiplicativeInverses(12)
    expect(pairs.map((p) => p.x)).toEqual([1, 5, 7, 11])
    for (const p of pairs) {
      expect((p.x * p.inverse) % 12).toBe(1)
    }
  })

  it('enumerates all units for a prime modulus', () => {
    // For a prime m every nonzero element is a unit.
    const pairs = allMultiplicativeInverses(7)
    expect(pairs.map((p) => p.x)).toEqual([1, 2, 3, 4, 5, 6])
    for (const p of pairs) {
      expect((p.x * p.inverse) % 7).toBe(1)
    }
  })

  it('throws for invalid moduli', () => {
    expect(() => allMultiplicativeInverses(1)).toThrow()
    expect(() => allMultiplicativeInverses(0)).toThrow()
  })

  it('self-inverse elements satisfy x² ≡ 1', () => {
    for (const p of allMultiplicativeInverses(8)) {
      const ok = (p.x * p.inverse) % 8 === 1
      expect(ok).toBe(true)
    }
  })
})
