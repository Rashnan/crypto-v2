import { describe, expect, it } from 'vitest'
import { solveLinearCongruence } from './linear-congruence'
import { mod } from './modular'

describe('solveLinearCongruence', () => {
  it('solves 2x ≡ 4 (mod 7): unique solution x ≡ 2', () => {
    const r = solveLinearCongruence(2, 4, 7)
    expect(r.solvable).toBe(true)
    expect(r.d).toBe(1)
    expect(r.solutions).toEqual([2])
    // verify 2*2 ≡ 4 (mod 7)
    expect(mod(2 * 2, 7)).toBe(4)
  })

  it('solves 3x ≡ 1 (mod 7): x ≡ 5', () => {
    const r = solveLinearCongruence(3, 1, 7)
    expect(r.solvable).toBe(true)
    expect(r.solutions).toEqual([5])
    expect(mod(3 * 5, 7)).toBe(1)
  })

  it('reports no solution when d does not divide b', () => {
    // 2x ≡ 3 (mod 4): gcd(2,4)=2 does not divide 3
    const r = solveLinearCongruence(2, 3, 4)
    expect(r.solvable).toBe(false)
    expect(r.d).toBe(2)
  })

  it('finds all d solutions when d > 1: 4x ≡ 2 (mod 6)', () => {
    // gcd(4,6)=2 divides 2; solutions x ≡ 2,5 (mod 6)
    const r = solveLinearCongruence(4, 2, 6)
    expect(r.solvable).toBe(true)
    expect(r.d).toBe(2)
    expect(r.period).toBe(3)
    expect(new Set(r.solutions)).toEqual(new Set([2, 5]))
    for (const x of r.solutions!) {
      expect(mod(4 * x, 6)).toBe(2)
    }
  })

  it('finds all d solutions: 6x ≡ 4 (mod 10): x ≡ 4, 9', () => {
    // gcd(6,10)=2 divides 4; d=2, period=5.
    // (6/2)=3, (4/2)=2: 3x ≡ 2 (mod 5) => x ≡ 4 (mod 5) since 3*4=12≡2
    // solutions: 4 and 4+5=9, reduced: 4, 4
    const r = solveLinearCongruence(6, 4, 10)
    expect(r.solvable).toBe(true)
    expect(r.d).toBe(2)
    expect(r.period).toBe(5)
    expect(new Set(r.solutions)).toEqual(new Set([4, 9]))
    for (const x of r.solutions!) {
      expect(mod(6 * x, 10)).toBe(4)
    }
  })

  it('handles the trivial 0x ≡ 0 (mod m): every residue is a solution', () => {
    const r = solveLinearCongruence(0, 0, 5)
    expect(r.solvable).toBe(true)
    expect(r.d).toBe(5)
    expect(r.solutions).toHaveLength(5)
    expect(r.solutions).toEqual([0, 1, 2, 3, 4])
  })

  it('reports 0x ≡ 1 (mod m) as unsolvable', () => {
    const r = solveLinearCongruence(0, 1, 5)
    expect(r.solvable).toBe(false)
  })

  it('reduces negative inputs via positive mod', () => {
    // -1x ≡ 2 (mod 5) => 4x ≡ 2 (mod 5) => x ≡ 3 since 4*3=12≡2
    const r = solveLinearCongruence(-1, 2, 5)
    expect(r.solvable).toBe(true)
    expect(r.solutions).toEqual([3])
  })

  it('throws for an invalid modulus', () => {
    expect(() => solveLinearCongruence(2, 2, 1)).toThrow()
  })
})
