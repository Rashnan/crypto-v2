export interface GcdTableRow {
  /** Quotient of this step: q = floor(r1 / r2). */
  quotient: number
  /** Dividend remainder (carried from the previous row's r2). */
  r1: number
  /** Divisor remainder (carried from the previous row's r). */
  r2: number
  /** New remainder: r = r1 - q * r2. */
  r: number
  /** Previous Bezout coefficient of a. */
  s1: number
  /** Current Bezout coefficient of a. */
  s2: number
  /** New Bezout coefficient of a: s = s1 - q * s2. */
  s: number
  /** Previous Bezout coefficient of b. */
  t1: number
  /** Current Bezout coefficient of b. */
  t2: number
  /** New Bezout coefficient of b: t = t1 - q * t2. */
  t: number
}

export interface GcdResult {
  a: number
  b: number
  gcd: number
  s: number
  t: number
  rows: GcdTableRow[]
}

/**
 * Extended Euclidean algorithm (q, r, s, t tabular variant).
 *
 * Each row performs one Euclidean division step and carries the Bezout
 * coefficients forward, maintaining the invariant for the generated values:
 *
 *     a * s + b * t = r
 *
 * Seeds are r1 = a, r2 = b with (s1, t1) = (1, 0) and (s2, t2) = (0, 1),
 * so a * s2 + b * t2 = r2 and a * s + b * t = r hold on every row. The
 * loop stops at the first row with r = 0; that row's r2 is gcd(a, b) and
 * its (s2, t2) are the Bezout coefficients.
 *
 * The same table solves linear Diophantine equations a*u + b*v = c:
 * solutions exist iff gcd(a, b) divides c, and are given by
 * u = s2 * (c / gcd), v = t2 * (c / gcd).
 *
 * Inputs must be positive integers small enough that a * |s| and b * |t|
 * stay within Number.MAX_SAFE_INTEGER (both inputs <= 10^7 is always safe).
 */
export function extendedGcd(a: number, b: number): GcdResult {
  if (!Number.isInteger(a) || a < 1 || !Number.isInteger(b) || b < 1) {
    throw new Error(`extendedGcd expects positive integers, got (${a}, ${b})`)
  }

  const rows: GcdTableRow[] = []
  let r1 = a
  let r2 = b
  let s1 = 1
  let s2 = 0
  let t1 = 0
  let t2 = 1

  while (r2 !== 0) {
    const quotient = Math.floor(r1 / r2)
    const r = r1 - quotient * r2
    const s = s1 - quotient * s2
    const t = t1 - quotient * t2

    rows.push({ quotient, r1, r2, r, s1, s2, s, t1, t2, t })

    r1 = r2
    r2 = r
    s1 = s2
    s2 = s
    t1 = t2
    t2 = t
  }

  return { a, b, gcd: r1, s: s1, t: t1, rows }
}
