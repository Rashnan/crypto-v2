import { describe, expect, it } from 'vitest'
import katex from 'katex'
import { elGamalDetail, modularPower, rabinDetail, rsaDetail } from './asymmetric'

describe('modularPower', () => {
  it('handles zero exponents and products beyond number precision', () => {
    expect(modularPower(0, 0, 7)).toBe(1)
    expect(modularPower(999_999_999_998, 2, 999_999_999_999)).toBe(1)
    expect(modularPower(65, 17, 3233)).toBe(2790)
  })

  it('rejects invalid integers and moduli', () => {
    for (const args of [[2, -1, 5], [2, 3, 1], [NaN, 2, 7], [2, 1.5, 7]]) {
      expect(() => modularPower(args[0], args[1], args[2])).toThrow()
    }
  })
})

describe('RSA', () => {
  const key = { p: 61, q: 53, e: 17 }

  it('matches the textbook example and derives the private exponent', () => {
    const encrypted = rsaDetail({ ...key, value: 65, mode: 'encrypt' })
    expect(encrypted.output).toEqual([2790])
    expect(encrypted.privateKey).toContain('2753')
    expect(rsaDetail({ ...key, value: 2790, mode: 'decrypt' }).output).toEqual([65])
    expect(encrypted.steps.find((step) => step.actor === 'Alice')?.detail?.equations.at(-1)).toBe('65^17 mod 3233 = 2790')
    expect(encrypted.participants[0].owner).toBe('Alice')
    expect(encrypted.participants[1].owner).toBe('Bob')
    expect(encrypted.participants[0].entries.find((entry) => entry.label.includes('own public/private'))?.value).toContain('Not required')
    expect(encrypted.participants[1].entries.find((entry) => entry.label.includes('private key'))?.value).toBe('(n, d) = (3233, 2753)')
    expect(encrypted.exchange.channel).toContain('c = 2790')
    expect(encrypted.exchange.receiver).toContain('Recovered m = 65')
    expect(encrypted.steps.find((step) => step.label.includes('private exponent'))?.detail?.equations).toContain('17⁻¹ mod 3120 = -367 mod 3120 = 2753')
  })

  it('round trips zero and messages sharing a factor with n', () => {
    for (const value of [0, 1, 53, 61, 3232]) {
      const cipher = rsaDetail({ ...key, value, mode: 'encrypt' }).output[0]
      expect(rsaDetail({ ...key, value: cipher, mode: 'decrypt' }).output).toEqual([value])
    }
  })

  it('rejects invalid primes, exponents, and message ranges', () => {
    for (const override of [{ p: 9 }, { q: 61 }, { p: 2 }, { e: 12 }, { e: 3121 }, { value: 3233 }, { value: -1 }, { p: 1_000_003 }]) {
      expect(() => rsaDetail({ ...key, value: 65, mode: 'encrypt', ...override })).toThrow()
    }
  })
})

describe('ElGamal', () => {
  const key = { p: 23, g: 5, x: 6 }

  it('matches a known example in both directions', () => {
    const encrypted = elGamalDetail({ ...key, k: 10, value: 15, mode: 'encrypt' })
    expect(encrypted.publicKey).toContain('(23, 5, 8)')
    expect(encrypted.output).toEqual([9, 22])
    expect(encrypted.participants[0].entries.find((entry) => entry.label.includes('temporary private'))?.value).toBe('k = 10')
    expect(encrypted.participants[1].entries.find((entry) => entry.label.includes('private key'))?.value).toBe('x = 6')
    expect(encrypted.participants[0].entries.find((entry) => entry.label.includes('shared secret'))?.value).toBe('s_A = y^k mod p = 3')
    expect(encrypted.participants[1].entries.find((entry) => entry.label.includes('shared secret'))?.value).toBe('s_B = c₁^x mod p = 3')
    expect(encrypted.exchange.sender).toContain('Alice’s fresh secret k = 10')
    expect(encrypted.exchange.channel).toContain('(c₁, c₂) = (9, 22)')
    expect(encrypted.exchange.receiver).toContain('Recovered m = 15')
    expect(encrypted.steps.filter((step) => step.detail?.label.includes('shared secret')).map((step) => step.actor)).toEqual(['Alice', 'Bob'])
    expect(elGamalDetail({ ...key, c1: 9, value: 22, mode: 'decrypt' }).output).toEqual([15])
  })

  it('decrypts without inventing an ephemeral key for Alice', () => {
    const received = elGamalDetail({ ...key, c1: 9, value: 22, mode: 'decrypt' })
    expect(received.exchange.sender).toContain('Alice’s secret k is not supplied or needed by Bob.')
    expect(received.steps.some((step) => step.actor === 'Alice')).toBe(false)
    expect(received.exchange.receiver).toContain('Recovered m = 15')
  })

  it('round trips all nonzero messages using different ephemeral keys', () => {
    for (let value = 1; value < key.p; value++) {
      for (const k of [1, 7, 21]) {
        const [c1, c2] = elGamalDetail({ ...key, k, value, mode: 'encrypt' }).output
        expect(elGamalDetail({ ...key, c1, value: c2, mode: 'decrypt' }).output).toEqual([value])
      }
    }
  })

  it('rejects non-generators, bad keys, missing exponents, and bad ciphertext', () => {
    for (const override of [{ p: 21 }, { g: 4 }, { x: 0 }, { k: 0 }, { k: undefined }, { value: 0 }, { value: 23 }]) {
      expect(() => elGamalDetail({ ...key, k: 10, value: 15, mode: 'encrypt', ...override })).toThrow()
    }
    expect(() => elGamalDetail({ ...key, c1: 0, value: 22, mode: 'decrypt' })).toThrow()
    expect(() => elGamalDetail({ ...key, value: 22, mode: 'decrypt' })).toThrow()
  })
})

describe('Rabin', () => {
  const key = { p: 7, q: 11 }

  it('returns all four verified roots instead of selecting a plaintext', () => {
    expect(rabinDetail({ ...key, value: 20, mode: 'encrypt' }).output).toEqual([15])
    expect(rabinDetail({ ...key, value: 15, mode: 'decrypt' }).output).toEqual([13, 20, 57, 64])
    const journey = rabinDetail({ ...key, value: 20, mode: 'encrypt' })
    expect(journey.exchange.receiver).toContain('Candidates = {13, 20, 57, 64}')
    expect(journey.exchange.receiver).toContain('Encoding is needed to select the original.')
    expect(journey.steps.find((step) => step.label.includes('with CRT'))?.equations).toHaveLength(4)
    expect(journey.steps.find((step) => step.label.includes('with CRT'))?.detail?.equations).toContain('x ≡ Σ aᵢMᵢyᵢ (mod M)')
    const crtDetail = journey.steps.find((step) => step.label.includes('with CRT'))!.detail!
    expect(crtDetail.latexEquations).toHaveLength(crtDetail.equations.length)
    for (const latex of crtDetail.latexEquations!) {
      expect(() => katex.renderToString(latex, { throwOnError: true, strict: 'error' })).not.toThrow()
    }
  })

  it('handles roots divisible by a prime and zero without duplicates', () => {
    expect(rabinDetail({ ...key, value: 0, mode: 'decrypt' }).output).toEqual([0])
    expect(rabinDetail({ ...key, value: 49, mode: 'decrypt' }).output).toEqual([7, 70])
  })

  it('recovers every plaintext and verifies every returned root', () => {
    for (let value = 0; value < 77; value++) {
      const c = rabinDetail({ ...key, value, mode: 'encrypt' }).output[0]
      const roots = rabinDetail({ ...key, value: c, mode: 'decrypt' }).output
      expect(roots).toContain(value)
      for (const root of roots) expect(root * root % 77).toBe(c)
    }
  })

  it('rejects unsuitable primes, nonresidues, and out-of-range ciphertext', () => {
    expect(() => rabinDetail({ p: 5, q: 11, value: 2, mode: 'encrypt' })).toThrow('3 (mod 4)')
    expect(() => rabinDetail({ ...key, value: 3, mode: 'decrypt' })).toThrow('quadratic residue')
    expect(() => rabinDetail({ ...key, value: 77, mode: 'decrypt' })).toThrow()
  })

  it('uses exact CRT combinations for larger teaching primes', () => {
    const largeKey = { p: 999_983, q: 999_979 }
    const value = 123_456_789
    const c = rabinDetail({ ...largeKey, value, mode: 'encrypt' }).output[0]
    const roots = rabinDetail({ ...largeKey, value: c, mode: 'decrypt' }).output
    expect(roots).toHaveLength(4)
    expect(roots).toContain(value)
    for (const root of roots) expect(BigInt(root) ** 2n % BigInt(largeKey.p * largeKey.q)).toBe(BigInt(c))
  })
})
