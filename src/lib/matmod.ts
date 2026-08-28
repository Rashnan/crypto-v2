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

export interface MinorStep {
  /** Row index of the entry (0-based). */
  i: number
  /** Column index of the entry (0-based). */
  j: number
  /** Sign factor (-1)^(i+j). */
  sign: 1 | -1
  /** The (n-1)x(n-1) minor after deleting row i and column j. */
  minorMatrix: Matrix
  /** det(minor) reduced mod m. */
  minorDet: number
  /** cofactor = sign * minorDet, reduced mod m. */
  cofactor: number
}

export interface MatrixInverseDetail extends MatrixInverseResult {
  /** Cofactor expansion steps for every entry. */
  cofactors: MinorStep[]
  /** Cofactor matrix C, where C[i][j] = (-1)^(i+j) · M(i,j) mod m. */
  cofactorMatrix: Matrix
  /** Adjugate = transpose of the cofactor matrix. */
  adjugate: Matrix
}

/**
 * Same as matrixInverseMod but also returns the intermediate cofactor /
 * adjugate steps used to reach the inverse, so the computation can be shown.
 */
export function matrixInverseDetail(a: Matrix, m: number): MatrixInverseDetail {
  const base = matrixInverseMod(a, m)
  if (!base.invertible) return { ...base, cofactors: [], cofactorMatrix: [], adjugate: [] }
  const n = a.length
  const cofactors: MinorStep[] = []
  const cofactorMatrix: Matrix = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const sign: 1 | -1 = (i + j) % 2 === 0 ? 1 : -1
      const minorMatrix = minor(a, i, j)
      const minorDet = determinantMod(minorMatrix, m)
      const cofactor = mod(sign * minorDet, m)
      cofactorMatrix[i][j] = cofactor
      cofactors.push({ i, j, sign, minorMatrix, minorDet, cofactor })
    }
  }
  const adjugate = adjugateMod(a, m)
  return { ...base, cofactors, cofactorMatrix, adjugate }
}

/** One term of the Laplace expansion of a determinant along a row. */
export interface DeterminantTerm {
  /** Column of the entry used for this term. */
  j: number
  /** Sign factor (−1)^(0+j), +1 for even columns, −1 for odd. */
  sign: 1 | -1
  /** The entry a[0][j] being expanded. */
  a0j: number
  /** The (n−1)x(n−1) minor after deleting row 0 and column j. */
  minor: Matrix
  /** det(minor) reduced mod m. */
  minorDet: number
  /** Cofactor = (−1)^j · det(minor) mod m. */
  cofactor: number
  /** Term contributed to the sum: a[0][j] · cofactor mod m. */
  product: number
}

export interface DeterminantDetail {
  /** The determinant reduced mod m. */
  det: number
  /** Each term of the expansion. */
  terms: DeterminantTerm[]
  /** True when this is the direct 2×2 formula rather than a 3×3 expansion. */
  is2x2: boolean
}

/**
 * Determinant with the Laplace (cofactor) expansion shown, expanded along row 0:
 *
 *     det(A) = Σ_j a[0][j] · C[0][j],
 *     C[0][j] = (−1)^j · det(minor(a, 0, j))
 *
 * For a 2×2 matrix this reduces to the direct cross-product formula. All
 * arithmetic is kept modulo m, matching determinantMod.
 */
export function determinantModDetail(a: Matrix, m: number): DeterminantDetail {
  const n = a.length
  if (n === 0) throw new Error('empty matrix has no determinant')
  if (!a.every((row) => row.length === n)) {
    throw new Error('matrix must be square')
  }
  if (n === 2) {
    return {
      det: determinantMod(a, m),
      terms: [
        {
          j: 0, sign: 1, a0j: a[0][0],
          minor: minor(a, 0, 0), minorDet: mod(a[1][1], m),
          cofactor: mod(a[1][1], m),
          product: mod(a[0][0] * a[1][1], m),
        },
        {
          j: 1, sign: -1, a0j: a[0][1],
          minor: minor(a, 0, 1), minorDet: mod(a[1][0], m),
          cofactor: mod(-a[1][0], m),
          product: mod(-a[0][1] * a[1][0], m),
        },
      ],
      is2x2: true,
    }
  }
  const terms: DeterminantTerm[] = []
  let det = 0
  for (let j = 0; j < n; j++) {
    const sign: 1 | -1 = j % 2 === 0 ? 1 : -1
    const minorMatrix = minor(a, 0, j)
    const minorDet = determinantMod(minorMatrix, m)
    const cofactor = mod(sign * minorDet, m)
    // cofactor already carries the (−1)^j sign, so the term contribution is
    // just a[0][j] · cofactor.
    const product = mod(a[0][j] * cofactor, m)
    det = mod(det + product, m)
    terms.push({ j, sign, a0j: a[0][j], minor: minorMatrix, minorDet, cofactor, product })
  }
  det = mod(det, m)
  return { det, terms, is2x2: false }
}
