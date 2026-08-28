import { describe, expect, it } from 'vitest'
import { adjugateMod, determinantMod, matrixInverseMod, minor } from './matmod'
import { mod } from './modular'

function matmulMod(a: number[][], b: number[][], m: number): number[][] {
  return a.map((row) =>
    b[0].map((_, j) => mod(row.reduce((acc, v, k) => acc + v * b[k][j], 0), m)),
  )
}

describe('minor', () => {
  it('removes one row and one column', () => {
    const a = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
    expect(minor(a, 0, 0)).toEqual([
      [5, 6],
      [8, 9],
    ])
    expect(minor(a, 1, 2)).toEqual([
      [1, 2],
      [7, 8],
    ])
  })
})

describe('determinantMod', () => {
  it('computes 2x2 determinants', () => {
    expect(determinantMod([[1, 2], [3, 4]], 100)).toBe(98)
    expect(determinantMod([[2, 0], [0, 2]], 7)).toBe(4)
  })

  it('computes 3x3 determinants', () => {
    // det of [[1,2,3],[4,5,6],[7,8,10]] = -3
    expect(determinantMod([[1, 2, 3], [4, 5, 6], [7, 8, 10]], 100)).toBe(97)
    expect(determinantMod([[1, 2, 3], [4, 5, 6], [7, 8, 10]], 7)).toBe(mod(-3, 7))
  })

  it('reduces the result modulo m', () => {
    expect(determinantMod([[4, 1], [2, 2]], 5)).toBe(1)
  })
})

describe('adjugateMod', () => {
  it('satisfies A * adj(A) = det(A) * I', () => {
    const a = [
      [1, 2],
      [3, 4],
    ]
    const m = 7
    const det = determinantMod(a, m)
    const adj = adjugateMod(a, m)
    // A * adj(A) should equal det * I.
    const prod = matmulMod(a, adj, m)
    expect(prod[0][0]).toBe(mod(det, m))
    expect(prod[1][1]).toBe(mod(det, m))
    expect(prod[0][1]).toBe(0)
    expect(prod[1][0]).toBe(0)
  })
})

describe('matrixInverseMod', () => {
  it('inverts a 2x2 matrix where the determinant is invertible', () => {
    const a = [
      [3, 4],
      [2, 3],
    ]
    const m = 5
    const r = matrixInverseMod(a, m)
    expect(r.invertible).toBe(true)
    expect(r.det).toBe(1)
    if (r.inverse) {
      const id = matmulMod(a, r.inverse, m)
      expect(id).toEqual([
        [1, 0],
        [0, 1],
      ])
    }
  })

  it('inverts a 3x3 matrix mod m', () => {
    const a = [
      [2, 1, 1],
      [3, 4, 5],
      [1, 6, 7],
    ]
    const m = 7
    const r = matrixInverseMod(a, m)
    expect(r.invertible).toBe(true)
    if (r.inverse) {
      const id = matmulMod(a, r.inverse, m)
      expect(id).toEqual([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ])
    }
  })

  it('reports not invertible when determinant shares a factor with m', () => {
    // det = 2 (from diag [[2,0],[0,1]]), gcd(2, 4) = 2.
    const a = [
      [2, 1],
      [2, 2],
    ]
    const m = 4
    const r = matrixInverseMod(a, m)
    expect(r.invertible).toBe(false)
  })

  it('handles the 1x1 case', () => {
    const r = matrixInverseMod([[3]], 7)
    expect(r.invertible).toBe(true)
    if (r.inverse) {
      expect((3 * r.inverse[0][0]) % 7).toBe(1)
    }
  })

  it('reduces inverse coefficients into [0, m)', () => {
    const a = [
      [3, 4],
      [2, 3],
    ]
    const r = matrixInverseMod(a, 5)
    expect(r.invertible).toBe(true)
    if (r.inverse) {
      for (const row of r.inverse) {
        for (const v of row) {
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThan(5)
        }
      }
    }
  })
})
