import { describe, expect, it } from 'vitest'
import {
  adjugateMod,
  determinantMod,
  determinantModDetail,
  matrixInverseDetail,
  matrixInverseMod,
  minor,
} from './matmod'
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

describe('determinantModDetail', () => {
  it('handles the 2x2 direct formula', () => {
    const d = determinantModDetail([[1, 2], [3, 4]], 100)
    expect(d.is2x2).toBe(true)
    expect(d.det).toBe(98)
    expect(d.terms).toHaveLength(2)
    expect(d.terms[0].cofactor).toBe(mod(4, 100))
    expect(d.terms[1].cofactor).toBe(mod(-3, 100))
  })

  it('expands a 3x3 matrix along row 0 to the same determinant as determinantMod', () => {
    const a = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ]
    const m = 7
    const d = determinantModDetail(a, m)
    expect(d.is2x2).toBe(false)
    expect(d.terms).toHaveLength(3)
    expect(d.det).toBe(determinantMod(a, m))
    expect(d.det).toBe(mod(-3, 7))
    // each cofactor is sign * minorDet, and each product = a[0][j] * cofactor
    for (const t of d.terms) {
      expect(t.cofactor).toBe(mod(t.sign * t.minorDet, m))
      expect(t.product).toBe(mod(t.a0j * t.cofactor, m))
      expect(t.minor).toHaveLength(2)
    }
    // sum of the products reduces to the determinant
    const sum = d.terms.reduce((acc, t) => acc + t.product, 0)
    expect(mod(sum, m)).toBe(d.det)
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

describe('matrixInverseDetail', () => {
  it('returns the cofactor matrix, adjugate and the same inverse', () => {
    const a = [
      [3, 4],
      [2, 3],
    ]
    const m = 5
    const d = matrixInverseDetail(a, m)
    expect(d.invertible).toBe(true)
    // Cofactor matrix: C[i][j] = (-1)^(i+j) * det(minor)
    // C[0][0] = +det([3]) = 3 ; C[0][1] = -det([2]) = -2 = 3
    // C[1][0] = -det([4]) = -4 = 1 ; C[1][1] = +det([3]) = 3
    expect(d.cofactorMatrix).toEqual([
      [3, 3],
      [1, 3],
    ])
    // adjugate = transpose of cofactor matrix
    expect(d.adjugate).toEqual([
      [3, 1],
      [3, 3],
    ])
    expect(d.cofactors).toHaveLength(4)
    // (det A)^-1 = 1, so inverse == adjugate mod 5
    expect(d.inverse).toEqual(d.adjugate)
  })

  it('reports not invertible without building steps', () => {
    const d = matrixInverseDetail([[2, 1], [2, 2]], 4)
    expect(d.invertible).toBe(false)
    expect(d.cofactors).toEqual([])
    expect(d.cofactorMatrix).toEqual([])
    expect(d.adjugate).toEqual([])
  })

  it('produces the correct cofactor steps for a 3x3 matrix', () => {
    const a = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ]
    const m = 7
    const d = matrixInverseDetail(a, m)
    expect(d.invertible).toBe(true)
    for (const step of d.cofactors) {
      expect(step.minorMatrix).toHaveLength(2)
      // cofactor = sign * det(minor) mod m, as produced by determinantMod
      expect(step.cofactor).toBe(mod(step.sign * step.minorDet, m))
      // cofactor matrix should hold the same value
      expect(d.cofactorMatrix[step.i][step.j]).toBe(step.cofactor)
    }
  })
})
