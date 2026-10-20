import { solveCrtSystem } from './crt'
import { gcd, mod, multiplicativeInverse } from './modular'

export type AsymmetricMode = 'encrypt' | 'decrypt'

export interface CalculationStep {
  label: string
  equations: string[]
}

export interface AsymmetricResult {
  publicKey: string
  privateKey: string
  outputLabel: string
  output: number[]
  steps: CalculationStep[]
}

function integer(value: number, name: string, min: number, max: number) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer from ${min} to ${max}.`)
  }
}

function prime(value: number, name: string) {
  integer(value, name, 2, 1_000_000)
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0) throw new Error(`${name} must be prime.`)
  }
}

function primePair(p: number, q: number) {
  prime(p, 'p')
  prime(q, 'q')
  if (p === q) throw new Error('p and q must be distinct primes.')
}

function modeCheck(mode: AsymmetricMode) {
  if (mode !== 'encrypt' && mode !== 'decrypt') throw new Error('Choose encrypt or decrypt.')
}

function multiplyMod(a: number, b: number, modulus: number): number {
  return Number((BigInt(a) * BigInt(b)) % BigInt(modulus))
}

export function modularPower(base: number, exponent: number, modulus: number): number {
  return powerDetail(base, exponent, modulus).value
}

function powerDetail(base: number, exponent: number, modulus: number) {
  integer(base, 'Base', 0, Number.MAX_SAFE_INTEGER)
  integer(exponent, 'Exponent', 0, Number.MAX_SAFE_INTEGER)
  integer(modulus, 'Modulus', 2, Number.MAX_SAFE_INTEGER)
  let factor = BigInt(base) % BigInt(modulus)
  let remaining = BigInt(exponent)
  let result = 1n
  const m = BigInt(modulus)
  const equations: string[] = [`${base}^${exponent} mod ${modulus}; start with result = 1.`]
  while (remaining > 0n) {
    if (remaining % 2n === 1n) {
      const next = result * factor % m
      equations.push(`Exponent ${remaining} is odd: result = ${result} × ${factor} mod ${m} = ${next}`)
      result = next
    }
    remaining /= 2n
    if (remaining > 0n) {
      const next = factor * factor % m
      equations.push(`Square: ${factor}² mod ${m} = ${next}; remaining exponent = ${remaining}`)
      factor = next
    }
  }
  equations.push(`${base}^${exponent} mod ${modulus} = ${result}`)
  return { value: Number(result), equations }
}

function inverse(value: number, modulus: number): number {
  const result = multiplicativeInverse(value, modulus)
  if (!result.exists) throw new Error(`${value} has no inverse modulo ${modulus}.`)
  return result.inverse
}

export interface RsaInput {
  p: number
  q: number
  e: number
  value: number
  mode: AsymmetricMode
}

export function rsaDetail({ p, q, e, value, mode }: RsaInput): AsymmetricResult {
  modeCheck(mode)
  primePair(p, q)
  if (p === 2 || q === 2) throw new Error('RSA expects odd primes p and q.')
  const n = p * q
  const phi = (p - 1) * (q - 1)
  integer(e, 'Public exponent e', 2, phi - 1)
  if (gcd(e, phi) !== 1) throw new Error('e must be coprime to φ(n).')
  integer(value, mode === 'encrypt' ? 'Message m' : 'Ciphertext c', 0, n - 1)
  const d = inverse(e, phi)
  const exponent = mode === 'encrypt' ? e : d
  const power = powerDetail(value, exponent, n)
  return {
    publicKey: `(n, e) = (${n}, ${e})`,
    privateKey: `(n, d) = (${n}, ${d})`,
    outputLabel: mode === 'encrypt' ? 'Ciphertext c' : 'Plaintext m',
    output: [power.value],
    steps: [
      { label: 'Key generation', equations: [
        `n = p × q = ${p} × ${q} = ${n}`,
        `φ(n) = (p − 1)(q − 1) = ${phi}`,
        `gcd(e, φ(n)) = gcd(${e}, ${phi}) = 1`,
        `d = e⁻¹ mod φ(n) = ${d}; ${e} × ${d} ≡ 1 (mod ${phi})`,
      ] },
      { label: mode === 'encrypt' ? 'Encryption: c = m^e mod n' : 'Decryption: m = c^d mod n', equations: power.equations },
    ],
  }
}

export interface ElGamalInput {
  p: number
  g: number
  x: number
  k?: number
  value: number
  c1?: number
  mode: AsymmetricMode
}

function primeFactors(value: number): number[] {
  const factors: number[] = []
  let remaining = value
  for (let divisor = 2; divisor * divisor <= remaining; divisor++) {
    if (remaining % divisor !== 0) continue
    factors.push(divisor)
    while (remaining % divisor === 0) remaining /= divisor
  }
  if (remaining > 1) factors.push(remaining)
  return factors
}

export function elGamalDetail({ p, g, x, k, value, c1, mode }: ElGamalInput): AsymmetricResult {
  modeCheck(mode)
  prime(p, 'p')
  if (p < 5) throw new Error('ElGamal expects a prime p ≥ 5.')
  integer(g, 'Generator g', 2, p - 1)
  const generatorChecks = primeFactors(p - 1).map((factor) => ({ factor, value: modularPower(g, (p - 1) / factor, p) }))
  if (generatorChecks.some((check) => check.value === 1)) throw new Error('g must be a primitive root modulo p.')
  integer(x, 'Private key x', 1, p - 2)
  integer(value, mode === 'encrypt' ? 'Message m' : 'Ciphertext c₂', mode === 'encrypt' ? 1 : 0, p - 1)
  const publicPower = powerDetail(g, x, p)
  const y = publicPower.value
  const steps: CalculationStep[] = [
    { label: 'Generator check', equations: generatorChecks.map((check) => `${g}^((${p} − 1) / ${check.factor}) mod ${p} = ${check.value} ≠ 1`) },
    { label: 'Public key: y = g^x mod p', equations: publicPower.equations },
  ]
  let output: number[]
  if (mode === 'encrypt') {
    integer(k!, 'Ephemeral exponent k', 1, p - 2)
    const first = powerDetail(g, k!, p)
    const shared = powerDetail(y, k!, p)
    const c2 = multiplyMod(value, shared.value, p)
    output = [first.value, c2]
    steps.push(
      { label: 'First ciphertext component: c₁ = g^k mod p', equations: first.equations },
      { label: 'Shared secret: s = y^k mod p', equations: shared.equations },
      { label: 'Second ciphertext component', equations: [`c₂ = m × s mod p = ${value} × ${shared.value} mod ${p} = ${c2}`] },
    )
  } else {
    integer(c1!, 'Ciphertext c₁', 1, p - 1)
    const shared = powerDetail(c1!, x, p)
    const sharedInverse = inverse(shared.value, p)
    const message = multiplyMod(value, sharedInverse, p)
    output = [message]
    steps.push(
      { label: 'Shared secret: s = c₁^x mod p', equations: shared.equations },
      { label: 'Recover plaintext', equations: [
        `s⁻¹ mod p = ${shared.value}⁻¹ mod ${p} = ${sharedInverse}`,
        `m = c₂ × s⁻¹ mod p = ${value} × ${sharedInverse} mod ${p} = ${message}`,
      ] },
    )
  }
  return {
    publicKey: `(p, g, y) = (${p}, ${g}, ${y})`,
    privateKey: `x = ${x}`,
    outputLabel: mode === 'encrypt' ? 'Ciphertext (c₁, c₂)' : 'Plaintext m',
    output,
    steps,
  }
}

export interface RabinInput {
  p: number
  q: number
  value: number
  mode: AsymmetricMode
}

export function rabinDetail({ p, q, value, mode }: RabinInput): AsymmetricResult {
  modeCheck(mode)
  primePair(p, q)
  if (p % 4 !== 3 || q % 4 !== 3) throw new Error('Rabin requires p ≡ q ≡ 3 (mod 4) for this square-root method.')
  const n = p * q
  integer(value, mode === 'encrypt' ? 'Message m' : 'Ciphertext c', 0, n - 1)
  const steps: CalculationStep[] = [{ label: 'Key generation', equations: [
    `p = ${p} ≡ 3 (mod 4); q = ${q} ≡ 3 (mod 4)`,
    `n = p × q = ${p} × ${q} = ${n}`,
  ] }]
  let output: number[]
  if (mode === 'encrypt') {
    const cipher = multiplyMod(value, value, n)
    output = [cipher]
    steps.push({ label: 'Encryption', equations: [`c = m² mod n = ${value}² mod ${n} = ${cipher}`] })
  } else {
    const rp = powerDetail(value, (p + 1) / 4, p)
    const rq = powerDetail(value, (q + 1) / 4, q)
    if (multiplyMod(rp.value, rp.value, p) !== value % p || multiplyMod(rq.value, rq.value, q) !== value % q) {
      throw new Error('Ciphertext is not a quadratic residue modulo both primes; no plaintext roots exist.')
    }
    steps.push(
      { label: 'Square root modulo p: rₚ = c^((p+1)/4) mod p', equations: rp.equations },
      { label: 'Square root modulo q: rᵩ = c^((q+1)/4) mod q', equations: rq.equations },
    )
    const candidates: number[] = []
    const equations: string[] = []
    for (const a of [rp.value, mod(-rp.value, p)]) {
      for (const b of [rq.value, mod(-rq.value, q)]) {
        const crt = solveCrtSystem([{ a, m: p }, { a: b, m: q }])
        candidates.push(crt.x0)
        equations.push(`m ≡ ${a} (mod ${p}), m ≡ ${b} (mod ${q}) → m = ${crt.x0}`)
      }
    }
    output = [...new Set(candidates)].sort((a, b) => a - b)
    steps.push(
      { label: 'Combine signed roots with CRT', equations },
      { label: 'Verify candidate plaintexts', equations: output.map((root) => `${root}² mod ${n} = ${multiplyMod(root, root, n)}`) },
    )
  }
  return {
    publicKey: `n = ${n}`,
    privateKey: `(p, q) = (${p}, ${q})`,
    outputLabel: mode === 'encrypt' ? 'Ciphertext c' : 'Candidate plaintexts (distinct roots)',
    output,
    steps,
  }
}
