import { extendedGcd } from './gcd'

export interface DiophantineResult {
  a: number
  b: number
  c: number
  /** gcd(|a|, |b|). */
  d: number
  /** Bezout coefficient of |a|: d = |a|*s + |b|*t. */
  s: number
  /** Bezout coefficient of |b|: d = |a|*s + |b|*t. */
  t: number
  /** Whether integer solutions a*x + b*y = c exist. */
  solvable: boolean
  /** A particular solution: x0 = (c/d) * s, sign-adjusted for a. */
  x0: number
  /** A particular solution: y0 = (c/d) * t, sign-adjusted for b. */
  y0: number
  /** Step size of x in the general solution: x = x0 + xStep*k. */
  xStep: number
  /** Step size of y in the general solution: y = y0 + yStep*k. */
  yStep: number
}

/**
 * Solve the linear Diophantine equation a*x + b*y = c over the integers.
 *
 * The equation has solutions iff d = gcd(|a|, |b|) divides c. In that case
 * the extended Euclidean algorithm yields a particular solution, and every
 * integer solution is a translate along a line:
 *
 *     x = x0 + (b/d)*k
 *     y = y0 - (a/d)*k        for any integer k
 *
 * The Bezout coefficients returned by subset of the |a| / |b| equation are
 * adapted to the signed a, b by flipping x0 / y0 when a or b is negative.
 * a and b must be non-zero, and all inputs within the safe-integer range
 * (abs <= 10^7 keeps the intermediate products safe).
 */
export function solveDiophantine(a: number, b: number, c: number): DiophantineResult {
  const absA = Math.abs(a)
  const absB = Math.abs(b)
  const { gcd: d, s, t } = extendedGcd(absA, absB)

  if (c % d !== 0) {
    return { a, b, c, d, s, t, solvable: false, x0: 0, y0: 0, xStep: 0, yStep: 0 }
  }

  const scale = c / d
  const rawX0 = s * scale
  const rawY0 = t * scale
  const x0 = a < 0 ? -rawX0 : rawX0
  const y0 = b < 0 ? -rawY0 : rawY0
  const xStep = b / d
  const yStep = -(a / d)

  return { a, b, c, d, s, t, solvable: true, x0, y0, xStep, yStep }
}
