import { gcd, mod, multiplicativeInverse } from './modular'

export interface LinearCongruenceResult {
  /** Coefficient of x. */
  a: number
  /** Right-hand side. */
  b: number
  /** Modulus. */
  m: number
  /** d = gcd(a, m). */
  d: number
  /** Whether a·x ≡ b (mod m) has integer solutions. */
  solvable: boolean
  /** The reduced equation solved: (a/d)·x ≡ (b/d) (mod m/d). */
  aRed: number
  /** b reduced to [0, m). */
  bRed: number
  /** m / d — the period of the solution class. */
  period: number
  /** The base solution x₀ in [0, period). */
  x0: number
  /** The inverse of (a/d) modulo (m/d), when solvable. */
  aRedInverse?: number
  /** All d distinct solutions modulo m, when solvable. */
  solutions?: number[]
}

/**
 * Solve the single-variable linear congruence a·x ≡ b (mod m).
 *
 * Let d = gcd(a, m). The congruence has solutions iff d divides b. If so there
 * are exactly d solutions modulo m, obtained by dividing through by d and
 * inverting the now-coprime coefficient:
 *
 *     a·x ≡ b (mod m)  ⇔  (a/d)·x ≡ (b/d) (mod m/d)
 *
 * Let r = (a/d)⁻¹ mod (m/d). Then every solution is
 *
 *     x ≡ x₀ (mod m/d),   x₀ = (b/d)·r mod (m/d)
 *
 * which expands to the d residues x₀ + k·(m/d) for k = 0..d−1.
 */
export function solveLinearCongruence(a: number, b: number, m: number): LinearCongruenceResult {
  if (!Number.isInteger(m) || m < 2) {
    throw new Error(`linear congruence expects a modulus m >= 2, got ${m}`)
  }
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error('a and b must be integers')
  }

  const A = mod(a, m)
  const B = mod(b, m)
  const d = gcd(A, m)

  const base: LinearCongruenceResult = {
    a, b, m, d,
    solvable: false,
    aRed: A / d,
    bRed: B,
    period: m / d,
    x0: 0,
  }

  if (B % d !== 0) return base

  const period = m / d
  const aRed = A / d
  const bRed = B / d

  // Degenerate: m divides a, so the reduced equation is 0·x ≡ bRed (mod period).
  // This needs bRed ≡ 0 (mod period); then every residue is a solution. The
  // reduced modulus is 1, so there is no (a/d)⁻¹ to invert — handle it directly.
  if (aRed === 0) {
    if (bRed % period !== 0) return base
    const solutions = Array.from({ length: m }, (_, k) => k)
    return {
      ...base,
      solvable: true,
      aRed,
      bRed,
      period,
      x0: 0,
      solutions,
    }
  }

  const inv = multiplicativeInverse(aRed, period)
  if (!inv.exists) return base

  const x0 = mod(bRed * inv.inverse, period)
  const solutions: number[] = []
  for (let k = 0; k < d; k++) {
    solutions.push(mod(x0 + k * period, m))
  }

  return {
    ...base,
    solvable: true,
    aRed,
    bRed,
    period,
    x0,
    aRedInverse: inv.inverse,
    solutions,
  }
}
