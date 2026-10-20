import type { CalculationStep, ParticipantSummary } from './asymmetric'
import { integer, prime, primeFactors, modularPower, powerDetail } from './public-key-math'

export interface DiffieHellmanInput {
  p: number
  g: number
  a: number
  b: number
}

export interface DiffieHellmanParticipant {
  privateKey: number
  publicKey: number
  sharedSecret: number
}

export interface DiffieHellmanResult {
  p: number
  g: number
  alice: DiffieHellmanParticipant
  bob: DiffieHellmanParticipant
  sharedSecret: number
  steps: CalculationStep[]
  participants: ParticipantSummary[]
}

export function diffieHellmanDetail({ p, g, a, b }: DiffieHellmanInput): DiffieHellmanResult {
  prime(p, 'Prime p')
  if (p < 5) throw new Error('Choose a prime p ≥ 5.')
  integer(g, 'Generator g', 2, p - 1)
  const checks = primeFactors(p - 1).map((factor) => ({ factor, value: modularPower(g, (p - 1) / factor, p) }))
  if (checks.some((check) => check.value === 1)) throw new Error('g must be a primitive root modulo p.')
  integer(a, 'Alice’s private exponent a', 1, p - 2)
  integer(b, 'Bob’s private exponent b', 1, p - 2)
  const A = powerDetail(g, a, p)
  const B = powerDetail(g, b, p)
  const aliceSecret = powerDetail(B.value, a, p)
  const bobSecret = powerDetail(A.value, b, p)
  return {
    p, g,
    alice: { privateKey: a, publicKey: A.value, sharedSecret: aliceSecret.value },
    bob: { privateKey: b, publicKey: B.value, sharedSecret: bobSecret.value },
    sharedSecret: aliceSecret.value,
    participants: [
      { owner: 'Alice', role: 'Owns private a and public A', entries: [
        { label: 'Alice’s private key · never sent', value: `a = ${a}` },
        { label: 'Alice’s public key · sent to Bob', value: `A = g^a mod p = ${A.value}` },
        { label: 'Bob’s public key · received by Alice', value: `B = ${B.value}` },
        { label: 'Alice’s shared secret · computed locally', value: `K_A = B^a mod p = ${aliceSecret.value}` },
      ] },
      { owner: 'Bob', role: 'Owns private b and public B', entries: [
        { label: 'Bob’s private key · never sent', value: `b = ${b}` },
        { label: 'Bob’s public key · sent to Alice', value: `B = g^b mod p = ${B.value}` },
        { label: 'Alice’s public key · received by Bob', value: `A = ${A.value}` },
        { label: 'Bob’s shared secret · computed locally', value: `K_B = A^b mod p = ${bobSecret.value}` },
      ] },
    ],
    steps: [
      {
        actor: 'Alice ↔ Bob', label: 'Agree on public parameters', phase: 'parameters',
        explanation: 'Alice and Bob agree on the prime p and generator g. Both values can be public. Check that g generates the nonzero elements modulo p.',
        equations: [`p = ${p}, g = ${g}`, ...checks.map((check) => `${g}^((${p} − 1) / ${check.factor}) mod ${p} = ${check.value} ≠ 1`)],
      },
      {
        actor: 'Alice', label: 'Alice chooses her private exponent', phase: 'keys',
        explanation: 'Alice keeps a secret. She does not send a to Bob.', equations: [`1 ≤ a ≤ p − 2; a = ${a}`],
      },
      {
        actor: 'Alice', label: 'Alice computes her public value', phase: 'keys',
        explanation: 'Alice raises the public generator g to her private exponent a modulo p.',
        equations: [`A = g^a mod p = ${g}^${a} mod ${p} = ${A.value}`],
        detail: { label: 'Square-and-multiply for A', equations: A.equations },
      },
      {
        actor: 'Bob', label: 'Bob chooses his private exponent', phase: 'keys',
        explanation: 'Bob independently chooses b and keeps it secret. He does not send b to Alice.', equations: [`1 ≤ b ≤ p − 2; b = ${b}`],
      },
      {
        actor: 'Bob', label: 'Bob computes his public value', phase: 'keys',
        explanation: 'Bob raises the same public generator g to his own private exponent b modulo p.',
        equations: [`B = g^b mod p = ${g}^${b} mod ${p} = ${B.value}`],
        detail: { label: 'Square-and-multiply for B', equations: B.equations },
      },
      {
        actor: 'Alice ↔ Bob', label: 'Exchange public values', phase: 'exchange',
        explanation: 'Alice sends A to Bob. Bob sends B to Alice. Their private exponents remain with their owners.',
        equations: [`Alice → Bob: A = ${A.value}`, `Bob → Alice: B = ${B.value}`],
      },
      {
        actor: 'Alice', label: 'Alice computes the shared secret', phase: 'shared-secret',
        explanation: 'Alice combines Bob’s received public value B with her own private exponent a.',
        equations: [`K_A = B^a mod p = ${B.value}^${a} mod ${p} = ${aliceSecret.value}`],
        detail: { label: 'Square-and-multiply for Alice’s secret', equations: aliceSecret.equations },
      },
      {
        actor: 'Bob', label: 'Bob computes the shared secret', phase: 'shared-secret',
        explanation: 'Bob combines Alice’s received public value A with his own private exponent b.',
        equations: [`K_B = A^b mod p = ${A.value}^${b} mod ${p} = ${bobSecret.value}`],
        detail: { label: 'Square-and-multiply for Bob’s secret', equations: bobSecret.equations },
      },
      {
        actor: 'Alice ↔ Bob', label: 'Both arrive at the same secret', phase: 'verification',
        explanation: 'The order of multiplication in the exponent is the same on both sides. K is computed locally and is never transmitted.',
        equations: [`B^a ≡ (g^b)^a ≡ g^(ab) ≡ (g^a)^b ≡ A^b (mod p)`, `K_A = K_B = ${aliceSecret.value}`],
      },
    ],
  }
}
