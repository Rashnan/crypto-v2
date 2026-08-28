import { describe, expect, it } from 'vitest'
import { extendedGcd } from './gcd'

describe('extendedGcd', () => {
  it('computes the gcd of two coprime numbers', () => {
    const { gcd, s, t } = extendedGcd(240, 46)
    expect(gcd).toBe(2)
    expect(240 * s + 46 * t).toBe(2)
  })

  it('finds the gcd when one divides the other', () => {
    const { gcd } = extendedGcd(12, 4)
    expect(gcd).toBe(4)
  })

  it('finds the gcd of two coprime numbers as 1', () => {
    const { gcd } = extendedGcd(21, 10)
    expect(gcd).toBe(1)
  })

  it('returns valid Bezout coefficients for various inputs', () => {
    const cases: Array<[number, number]> = [
      [240, 46],
      [21, 10],
      [867, 512],
      [1234, 5678],
      [1, 1],
      [100, 3],
    ]
    for (const [a, b] of cases) {
      const { gcd, s, t } = extendedGcd(a, b)
      expect(a * s + b * t).toBe(gcd)
      expect(gcd).toBeGreaterThan(0)
    }
  })

  it('builds a monotonic remainder table ending at the gcd', () => {
    const { rows, gcd } = extendedGcd(240, 46)
    const remainders = rows.map((r) => r.r)
    for (let i = 0; i < remainders.length - 1; i++) {
      expect(remainders[i]).toBeGreaterThanOrEqual(remainders[i + 1])
    }
    expect(rows[rows.length - 1].r).toBe(0)
    expect(rows[rows.length - 1].r2).toBe(gcd)
  })

  it('throws on non-positive or non-integer inputs', () => {
    expect(() => extendedGcd(0, 5)).toThrow()
    expect(() => extendedGcd(5, 0)).toThrow()
    expect(() => extendedGcd(-5, 5)).toThrow()
    expect(() => extendedGcd(5.5, 5)).toThrow()
    expect(() => extendedGcd(5, 5.5)).toThrow()
  })

  it('handles equal inputs', () => {
    const { gcd, s, t } = extendedGcd(7, 7)
    expect(gcd).toBe(7)
    expect(7 * s + 7 * t).toBe(7)
  })
})
