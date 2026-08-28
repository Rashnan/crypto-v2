/**
 * Normalize an integer into the range [0, m).
 *
 * Uses positive modulo so that negative inputs map into the canonical ring
 * representatives (e.g. mod(-3, 5) = 2), matching how modular arithmetic is
 * taught over ℤ/mℤ.
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

/**
 * Greatest common divisor of two non-negative integers (Euclid's algorithm).
 */
export function gcd(a: number, b: number): number {
  let x = a
  let y = b
  while (y !== 0) {
    const t = x % y
    x = y
    y = t
  }
  return Math.abs(x)
}

export interface AdditiveInversePair {
  /** Element of ℤ/mℤ (0-based representative). */
  x: number
  /** Its additive inverse: the unique y with (x + y) mod m = 0. */
  inverse: number
}

/**
 * Compute the additive inverse of a single element x modulo m.
 *
 * The additive inverse of x is the unique y ∈ [0, m) satisfying
 * (x + y) ≡ 0 (mod m), given by y = (−x) mod m. Every element of ℤ/mℤ has
 * one — this is a group under addition, so no element is excluded.
 */
export function additiveInverse(x: number, m: number): number {
  return mod(-x, m)
}

/**
 * Enumerate the additive-inverse pairs of every element of ℤ/mℤ.
 *
 * Returns an array of { x, inverse } for x = 0..m−1. Together the pairs
 * describe the full set of additive inverses in the ring.
 */
export function allAdditiveInverses(m: number): AdditiveInversePair[] {
  if (!Number.isInteger(m) || m < 2) {
    throw new Error(`additive inverse expects a modulus m >= 2, got ${m}`)
  }
  const pairs: AdditiveInversePair[] = []
  for (let x = 0; x < m; x++) {
    pairs.push({ x, inverse: additiveInverse(x, m) })
  }
  return pairs
}

/** Whether a and m are coprime, i.e. a has a multiplicative inverse mod m. */
export function isCoprime(a: number, m: number): boolean {
  return gcd(mod(a, m), m) === 1
}

export interface MultiplicativeInverse {
  /** Element of ℤ/mℤ (0-based representative). */
  x: number
  /** Its multiplicative inverse, the unique y with (x·y) mod m = 1. */
  inverse: number
}

/**
 * Result of looking up the multiplicative inverse of a single element.
 */
export type MultiplicativeInverseResult =
  | { exists: true; inverse: number }
  | { exists: false; reason: 'not coprime' | 'invalid' }

/**
 * Compute the multiplicative inverse of x modulo m, if it exists.
 *
 * A multiplicative inverse is an element y ∈ [0, m) with (x·y) ≡ 1 (mod m).
 * It exists exactly when gcd(x, m) = 1 (x and m coprime). When they share a
 * common factor greater than 1 no such y exists, because any product x·y
 * stays divisible by that factor and so cannot be ≡ 1.
 */
export function multiplicativeInverse(
  x: number,
  m: number,
): MultiplicativeInverseResult {
  if (!Number.isInteger(m) || m < 2) {
    return { exists: false, reason: 'invalid' }
  }
  const a = mod(x, m)
  if (!isCoprime(a, m)) {
    return { exists: false, reason: 'not coprime' }
  }
  // x·y ≡ 1 (mod m) with gcd(x, m) = 1; brute-force over [0, m) is exact
  // for the small moduli this tool is meant for. m is capped by the caller.
  for (let y = 0; y < m; y++) {
    if ((a * y) % m === 1) {
      return { exists: true, inverse: mod(y, m) }
    }
  }
  return { exists: false, reason: 'not coprime' }
}

/**
 * Enumerate every unit of ℤ/mℤ together with its multiplicative inverse.
 *
 * An element has a multiplicative inverse iff it is coprime to m. Returns the
 * pairs for all such x in [0, m), each with the unique y satisfying
 * (x·y) ≡ 1 (mod m).
 */
export function allMultiplicativeInverses(m: number): MultiplicativeInverse[] {
  if (!Number.isInteger(m) || m < 2) {
    throw new Error(`multiplicative inverse expects a modulus m >= 2, got ${m}`)
  }
  const pairs: MultiplicativeInverse[] = []
  for (let x = 0; x < m; x++) {
    if (!isCoprime(x, m)) continue
    const r = multiplicativeInverse(x, m)
    if (r.exists) {
      pairs.push({ x, inverse: r.inverse })
    }
  }
  return pairs
}
