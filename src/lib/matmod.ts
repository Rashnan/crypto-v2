import { gcd, mod } from './modular'

export type Matrix = number[][]

export interface MatrixInverseResult {
  /** Whether the matrix is invertible mod m. */
  invertible: boolean
  /** det(A), reduced to [0, m). */
  det: number
  /** Inverse of the determinant mod m, when invertible. */
  detInverse?: number
  /** The inverse matrix reduced mod m, when invertible. */
  inverse?: Matrix
}

/**
 * Compute the minor of matrix a — the (n-1) x (n-1) matrix obtained by
 * deleting row r and column c.
 */
export function minor(a: Matrix, r: number, c: number): Matrix {
  return a
    .filter((_, i) => i !== r)
    .map((row) => row.filter((_, j) => j !== c))
}

/**
 * Determinant of a square matrix, computed by Laplace (cofactor) expansion.
 * All intermediate arithmetic is reduced modulo m.
 */
export function determinantMod(a: Matrix, m: number): number {
  const n = a.length
  if (n === 0) throw new Error('empty matrix has no determinant')
  if (!a.every((row) => row.length === n)) {
    throw new Error('matrix must be square')
  }
  if (n === 1) return mod(a[0][0], m)
  if (n === 2) {
    return mod(a[0][0] * a[1][1] - a[0][1] * a[1][0], m)
  }
  let det = 0
  for (let c = 0; c < n; c++) {
    const cofactor = mod(a[0][c] * determinantMod(minor(a, 0, c), m), m)
    det = mod(det + (c % 2 === 0 ? cofactor : -cofactor), m)
  }
  return mod(det, m)
}

/**
 * Compute the adjugate (classical adjoint) of a square matrix mod m.
 *
 * adj(A)[j][i] = cofactor(A)[i][j], where cofactor(i,j) = (-1)^(i+j) * M(i,j).
 * The adjugate satisfies A · adj(A) = det(A) · I.
 */
export function adjugateMod(a: Matrix, m: number): Matrix {
  const n = a.length
  if (n === 1) return [[mod(1, m)]]
  const adj: Matrix = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const sign = (i + j) % 2 === 0 ? 1 : -1
      const cof = mod(sign * determinantMod(minor(a, i, j), m), m)
      adj[j][i] = cof
    }
  }
  return adj
}

/**
 * Compute the inverse of a square matrix mod m, when it exists.
 *
 * A matrix is invertible over ℤ/mℤ iff det(A) and m are coprime, i.e. iff
 * det(A) has a multiplicative inverse mod m. Then
 *
 *     A⁻¹ = adj(A) · (det A)⁻¹   (mod m)
 *
 * Returns { invertible: false } when gcd(det(A), m) ≠ 1. All coefficients of
 * the result are reduced to [0, m).
 */
export function matrixInverseMod(a: Matrix, m: number): MatrixInverseResult {
  const n = a.length
  if (n === 0 || !a.every((row) => row.length === n)) {
    throw new Error('matrix must be square and non-empty')
  }
  const det = determinantMod(a, m)
  const g = gcd(det, m)
  if (g !== 1) {
    return { invertible: false, det }
  }
  const detInverse = (() => {
    for (let y = 0; y < m; y++) {
      if ((det * y) % m === 1) return y
    }
    return 1
  })()
  const adj = adjugateMod(a, m)
  const inverse = adj.map((row) => row.map((x) => mod(x * detInverse, m)))
  return { invertible: true, det, detInverse, inverse }
}
