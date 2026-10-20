import { describe, expect, it } from 'vitest'
import { diffieHellmanDetail } from './diffie-hellman'

describe('Diffie–Hellman key exchange', () => {
  it('matches the textbook example and keeps ownership explicit', () => {
    const result = diffieHellmanDetail({ p: 23, g: 5, a: 6, b: 15 })
    expect(result.alice).toEqual({ privateKey: 6, publicKey: 8, sharedSecret: 2 })
    expect(result.bob).toEqual({ privateKey: 15, publicKey: 19, sharedSecret: 2 })
    expect(result.sharedSecret).toBe(2)
    expect(result.participants.map((person) => person.owner)).toEqual(['Alice', 'Bob'])
    expect(result.participants[0].entries.find((entry) => entry.label.includes('private key'))?.value).toBe('a = 6')
    expect(result.participants[1].entries.find((entry) => entry.label.includes('private key'))?.value).toBe('b = 15')
    expect(result.participants[0].entries.find((entry) => entry.label.includes('shared secret'))?.value).toBe('K_A = B^a mod p = 2')
    expect(result.participants[1].entries.find((entry) => entry.label.includes('shared secret'))?.value).toBe('K_B = A^b mod p = 2')
    expect(result.steps.filter((step) => step.phase === 'shared-secret').map((step) => step.actor)).toEqual(['Alice', 'Bob'])
    expect(result.steps[5].equations).toEqual(['Alice → Bob: A = 8', 'Bob → Alice: B = 19'])
    expect(result.steps[6].equations).toEqual(['K_A = B^a mod p = 19^6 mod 23 = 2'])
    expect(result.steps[7].equations).toEqual(['K_B = A^b mod p = 8^15 mod 23 = 2'])
  })

  it('agrees for every pair of private exponents in a small field', () => {
    for (let a = 1; a <= 21; a++) {
      for (let b = 1; b <= 21; b++) {
        const result = diffieHellmanDetail({ p: 23, g: 5, a, b })
        expect(result.alice.sharedSecret).toBe(result.bob.sharedSecret)
        expect(result.sharedSecret).toBe(Number(5n ** BigInt(a * b) % 23n))
      }
    }
  })

  it('handles larger teaching parameters exactly', () => {
    const result = diffieHellmanDetail({ p: 104729, g: 12, a: 54321, b: 67890 })
    expect(result.alice.sharedSecret).toBe(result.bob.sharedSecret)
    expect(result.sharedSecret).toBeGreaterThan(0)
  })

  it('rejects composite primes, non-generators, and invalid private exponents', () => {
    for (const override of [{ p: 21 }, { p: 3 }, { p: 1_000_003 }, { g: 4 }, { g: 1 }, { a: 0 }, { a: 22 }, { b: -1 }, { b: 1.5 }, { b: NaN }]) {
      expect(() => diffieHellmanDetail({ p: 23, g: 5, a: 6, b: 15, ...override })).toThrow()
    }
  })
})
