import { describe, expect, it } from 'vitest'
import { solveDiophantine } from './diophantine'

describe('solveDiophantine', () => {
  it('solves a positive-coefficient equation', () => {
    const r = solveDiophantine(240, 46, 10)
    expect(r.solvable).toBe(true)
    expect(r.d).toBe(2)
    expect(240 * r.x0 + 46 * r.y0).toBe(10)
    // Step sizes shrink the coefficients to the primitive form.
    expect(240 * r.xStep + 46 * r.yStep).toBe(0)
  })

  it('reports a solution when gcd divides c', () => {
    const r = solveDiophantine(21, 15, 33)
    expect(r.solvable).toBe(true)
    expect(r.d).toBe(3)
    expect(21 * r.x0 + 15 * r.y0).toBe(33)
  })

  it('reports no solution when gcd does not divide c', () => {
    const r = solveDiophantine(21, 15, 25)
    expect(r.solvable).toBe(false)
  })

  it('handles a negative b by flipping y0', () => {
    const r = solveDiophantine(21, -15, 33)
    expect(r.solvable).toBe(true)
    expect(21 * r.x0 + -15 * r.y0).toBe(33)
  })

  it('handles a negative a by flipping x0', () => {
    const r = solveDiophantine(-7, 5, 1)
    expect(r.solvable).toBe(true)
    expect(-7 * r.x0 + 5 * r.y0).toBe(1)
  })

  it('handles both coefficients negative', () => {
    const r = solveDiophantine(-15, -25, 5)
    expect(r.solvable).toBe(true)
    expect(-15 * r.x0 + -25 * r.y0).toBe(5)
  })

  it('preserves the general solution across every integer k', () => {
    const cases: Array<[number, number, number]> = [
      [240, 46, 10],
      [21, -15, 33],
      [-7, 5, 1],
      [-15, -25, 5],
      [1, 1, 2],
    ]
    for (const [a, b, c] of cases) {
      const r = solveDiophantine(a, b, c)
      expect(r.solvable).toBe(true)
      for (const k of [-100, -1, 0, 1, 100]) {
        const x = r.x0 + r.xStep * k
        const y = r.y0 + r.yStep * k
        expect(a * x + b * y).toBe(c)
      }
    }
  })

  it('marks every non-dividing c as unsolvable', () => {
    const cases: Array<[number, number, number]> = [
      [240, 46, 3],
      [21, 15, 10],
      [2, 4, 1],
      [7, 7, 5],
    ]
    for (const [a, b, c] of cases) {
      const r = solveDiophantine(a, b, c)
      expect(r.solvable).toBe(false)
    }
  })
})
