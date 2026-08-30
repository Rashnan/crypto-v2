import { gcd, mod } from './modular'

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
  const norm = congruences.map(({ a, m }) => ({ a: mod(a, m), m }))

  let x0 = norm[0].a
  let M = norm[0].m
  const steps: CrtStep[] = []

  for (let i = 1; i < norm.length; i++) {
    const { a, m } = norm[i]
    const d = gcd(M, m)
    const diff = mod(a - x0, m)

    if (diff % d !== 0) {
      steps.push({
        index: i, x0, M, a, m, d,
        consistent: false, x: x0, Mnext: M * (m / d),
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
    const mInv = (() => {
      for (let y = 0; y < mRed; y++) {
        if ((MRed * y) % mRed === 1) return y
      }
      return 0
    })()
    const k = mod((diff / d) * mInv, mRed)
    const x = mod(x0 + M * k, M * mRed)
    const Mnext = M * mRed

    steps.push({
      index: i, x0, M, a, m, d,
      consistent: true, x, Mnext,
    })

    x0 = x
    M = Mnext
  }

  return { congruences: norm, solvable: true, x0, M, steps }
}
