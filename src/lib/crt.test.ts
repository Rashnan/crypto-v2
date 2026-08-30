import { describe, expect, it } from 'vitest'
import { solveCrtSystem } from './crt'
import { mod } from './modular'

describe('solveCrtSystem', () => {
  it('solves the classic two-congruence case', () => {
    // x ≡ 2 (mod 3), x ≡ 3 (mod 5) => x ≡ 8 (mod 15)
    const r = solveCrtSystem([{ a: 2, m: 3 }, { a: 3, m: 5 }])
    expect(r.solvable).toBe(true)
    expect(r.M).toBe(15)
    expect(r.x0).toBe(8)
    expect(mod(r.x0, 3)).toBe(2)
    expect(mod(r.x0, 5)).toBe(3)
  })

  it('solves three pairwise-coprime congruences', () => {
    // x ≡ 1 (mod 2), x ≡ 2 (mod 3), x ≡ 3 (mod 5) => x ≡ 23 (mod 30)
    const r = solveCrtSystem([{ a: 1, m: 2 }, { a: 2, m: 3 }, { a: 3, m: 5 }])
    expect(r.solvable).toBe(true)
    expect(r.M).toBe(30)
    expect(r.x0).toBe(23)
    for (const [a, m] of [[1, 2], [2, 3], [3, 5]]) {
      expect(mod(r.x0, m)).toBe(a)
    }
  })

  it('handles the non-coprime but consistent case via lcm', () => {
    // x ≡ 1 (mod 4), x ≡ 3 (mod 6) => x ≡ 9 (mod 12)
    const r = solveCrtSystem([{ a: 1, m: 4 }, { a: 3, m: 6 }])
    expect(r.solvable).toBe(true)
    expect(r.M).toBe(12)
    expect(r.x0).toBe(9)
    expect(mod(r.x0, 4)).toBe(1)
    expect(mod(r.x0, 6)).toBe(3)
  })

  it('reports an inconsistent system', () => {
    // x ≡ 2 (mod 4), x ≡ 3 (mod 6): gcd(4,6)=2 does not divide (3-2)=1
    const r = solveCrtSystem([{ a: 2, m: 4 }, { a: 3, m: 6 }])
    expect(r.solvable).toBe(false)
    expect(r.failIndex).toBe(1)
  })

  it('handles a single congruence', () => {
    const r = solveCrtSystem([{ a: 5, m: 7 }])
    expect(r.solvable).toBe(true)
    expect(r.M).toBe(7)
    expect(r.x0).toBe(5)
    expect(r.steps).toHaveLength(0)
  })

  it('normalizes residues and records combination steps', () => {
    const r = solveCrtSystem([{ a: -1, m: 3 }, { a: 4, m: 5 }])
    // -1 mod 3 = 2, 4 mod 5 = 4 => x ≡ 2 (mod 3), x ≡ 4 (mod 5) => x ≡ 14 (mod 15)
    expect(r.solvable).toBe(true)
    expect(r.x0).toBe(14)
    expect(r.steps).toHaveLength(1)
    expect(r.steps[0].consistent).toBe(true)
    expect(r.steps[0].d).toBe(1)
  })

  it('rejects combined moduli outside the safe integer range', () => {
    expect(() => solveCrtSystem([{ a: 0, m: 100_000 }, { a: 0, m: 99_991 }, { a: 0, m: 99_989 }, { a: 0, m: 99_971 }])).toThrow('Number.MAX_SAFE_INTEGER')
  })
})
