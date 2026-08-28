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
