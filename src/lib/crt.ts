import { gcd } from './modular'

function exactMod(value: bigint, modulus: number): number {
  const m = BigInt(modulus)
  return Number((value % m + m) % m)
}

function inverseMod(value: number, modulus: number): bigint {
  let a = BigInt(value)
  let b = BigInt(modulus)
  let x = 1n
  let y = 0n
  while (b !== 0n) {
    const quotient = a / b
    const remainder = a % b
    const coefficient = x - quotient * y
    a = b
    b = remainder
    x = y
    y = coefficient
  }
  return x
}

export interface Congruence {
  /** Residue: x ≡ a (mod m). */
  a: number
  /** Modulus. */
  m: number
}

/** One intermediate step of combining two congruences via CRT. */
export interface CrtStep {
  /** The running solution before this step: x ≡ x0 (mod M). */
  index: number
  /** Current (running) particular solution before combining. */
  x0: number
  /** Current combined modulus. */
  M: number
  /** The congruence being folded in: x ≡ a (mod m). */
  a: number
  /** Modulus of the congruence being folded in. */
  m: number
  /** d = gcd(M, m). */
  d: number
  /** Whether the two congruences are consistent. */
  consistent: boolean
  /** After combining: new particular solution x' in [0, M'). */
  x: number
  /** After combining: new modulus M' = lcm(M, m). */
  Mnext: number
  equations: string[]
}

export interface CrtTableRow {
  a: number
  m: number
  partialModulus: number
  inverse: number
  term: string
}

export interface CrtTable {
  rows: CrtTableRow[]
  sum: string
  equations: string[]
}

export interface CrtResult {
  /** The input congruences. */
  congruences: Congruence[]
  /** Whether a common solution exists. */
  solvable: boolean
  /** A particular solution reduced to [0, M). */
  x0: number
  /** Final combined modulus (lcm of all moduli). */
  M: number
  /** When inconsistent, at which pair it failed. */
  failIndex?: number
  /** Troubleshooting text when inconsistent. */
  reason?: string
  /** The combination steps performed. */
  steps: CrtStep[]
  table?: CrtTable
}

/**
 * Solve a system of single-variable congruences x ≡ aᵢ (mod mᵢ) with the
 * (incremental) Chinese Remainder Theorem.
 *
 * Congruences are folded in one at a time. When combining the running solution
 * x ≡ x0 (mod M) with x ≡ a (mod m), let d = gcd(M, m). A solution exists iff
 * d | (a − x0), in which case
 *
 *     k ≡ ((a − x0)/d) · ((M/d)⁻¹ mod (m/d))  (mod m/d)
 *     x' = x0 + M·k,   M' = lcm(M, m)
 *
 * When the moduli are pairwise coprime this reduces to the classical CRT and
 * d = 1 at every step, so a unique solution exists modulo the product M.
 */
export function solveCrtSystem(congruences: Congruence[]): CrtResult {
  if (congruences.length === 0) {
    return { congruences, solvable: true, x0: 0, M: 1, steps: [] }
  }

  if (!congruences.every(({ a, m }) => Number.isSafeInteger(a) && Number.isSafeInteger(m) && m >= 2)) {
    throw new Error('CRT expects safe-integer residues and moduli of at least 2.')
  }
  const norm = congruences.map(({ a, m }) => ({ a: exactMod(BigInt(a), m), m }))

  let x0 = norm[0].a
  let M = norm[0].m
  const steps: CrtStep[] = []

  for (let i = 1; i < norm.length; i++) {
    const { a, m } = norm[i]
    const d = gcd(M, m)
    const diff = exactMod(BigInt(a) - BigInt(x0), m)
    const equations = [
      `x = ${x0} + ${M}k`,
      `${M}k ≡ ${a} − ${x0} ≡ ${diff} (mod ${m})`,
      `d = gcd(${M}, ${m}) = ${d}`,
    ]

    if (diff % d !== 0) {
      steps.push({
        index: i, x0, M, a, m, d,
        consistent: false, x: x0, Mnext: M * (m / d),
        equations: [...equations, `${d} does not divide ${diff}, so no common solution exists.`],
      })
      return {
        congruences: norm,
        solvable: false,
        x0,
        M,
        failIndex: i,
        reason: `gcd(${M}, ${m}) = ${d} does not divide (a − x0) = ${diff}`,
        steps,
      }
    }

    // Solve M·k ≡ (a − x0) (mod m/d), where (M/d) is invertible mod (m/d).
    const mRed = m / d
    const MRed = M / d
    if (M > Number.MAX_SAFE_INTEGER / mRed) {
      throw new RangeError('Combined modulus exceeds Number.MAX_SAFE_INTEGER. Use fewer or smaller moduli.')
    }
    const mInv = inverseMod(MRed, mRed)
    const k = exactMod(BigInt(diff / d) * mInv, mRed)
    const x = exactMod(BigInt(x0) + BigInt(M) * BigInt(k), M * mRed)
    const Mnext = M * mRed

    steps.push({
      index: i, x0, M, a, m, d,
      consistent: true, x, Mnext,
      equations: mRed === 1 ? [
        ...equations,
        `${d} divides ${diff}; the new congruence adds no restriction.`,
        `k = 0; x ≡ ${x} (mod ${Mnext})`,
      ] : [
        ...equations,
        `${d} divides ${diff}; divide by ${d}: ${MRed}k ≡ ${diff / d} (mod ${mRed})`,
        `${MRed}⁻¹ mod ${mRed} = ${exactMod(mInv, mRed)}`,
        `k ≡ ${diff / d} × ${exactMod(mInv, mRed)} ≡ ${k} (mod ${mRed})`,
        `M′ = lcm(${M}, ${m}) = ${M} × ${mRed} = ${Mnext}`,
        `x ≡ ${x0} + ${M} × ${k} ≡ ${x} (mod ${Mnext})`,
      ],
    })

    x0 = x
    M = Mnext
  }

  let table: CrtTable | undefined
  if (steps.every((step) => step.d === 1)) {
    const rows = norm.map(({ a, m }) => {
      const partialModulus = M / m
      const inverse = exactMod(inverseMod(partialModulus, m), m)
      const term = String(BigInt(a) * BigInt(partialModulus) * BigInt(inverse))
      return { a, m, partialModulus, inverse, term }
    })
    const sum = String(rows.reduce((total, row) => total + BigInt(row.term), 0n))
    table = {
      rows,
      sum,
      equations: [
        `M = ${norm.map(({ m }) => m).join(' × ')} = ${M}`,
        ...rows.flatMap((row, i) => [
          `M${i + 1} = M / m${i + 1} = ${M} / ${row.m} = ${row.partialModulus}`,
          `y${i + 1} = M${i + 1}⁻¹ mod m${i + 1} = ${row.partialModulus}⁻¹ mod ${row.m} = ${row.inverse}`,
          `${row.partialModulus} × ${row.inverse} ≡ 1 (mod ${row.m})`,
          `a${i + 1}M${i + 1}y${i + 1} = ${row.a} × ${row.partialModulus} × ${row.inverse} = ${row.term}`,
        ]),
        `x ≡ Σ aᵢMᵢyᵢ (mod M)`,
        `x ≡ ${rows.map((row) => row.term).join(' + ')} ≡ ${sum} ≡ ${x0} (mod ${M})`,
        `All solutions: x = ${x0} + ${M}t, t ∈ ℤ`,
      ],
    }
  }

  return { congruences: norm, solvable: true, x0, M, steps, table }
}
