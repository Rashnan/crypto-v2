import { describe, expect, it } from 'vitest'
import katex from 'katex'
import { solveCrtSystem } from './crt'
import { mod } from './modular'

describe('solveCrtSystem', () => {
  it('solves the classic two-congruence case', () => {
    // x ≡ 2 (mod 3), x ≡ 3 (mod 5) => x ≡ 8 (mod 15)
    const r = solveCrtSystem([{ a: 2, m: 3 }, { a: 3, m: 5 }])
    expect(r.solvable).toBe(true)
    expect(r.M).toBe(15)
    expect(r.x0).toBe(8)
    expect(r.table?.rows).toEqual([
      { a: 2, m: 3, partialModulus: 5, inverse: 2, term: '20' },
      { a: 3, m: 5, partialModulus: 3, inverse: 2, term: '18' },
    ])
    expect(r.table?.sum).toBe('38')
    expect(r.table?.equations).toContain('x ≡ 20 + 18 ≡ 38 ≡ 8 (mod 15)')
    expect(mod(r.x0, 3)).toBe(2)
    expect(mod(r.x0, 5)).toBe(3)
  })

  it('solves three pairwise-coprime congruences', () => {
    // x ≡ 1 (mod 2), x ≡ 2 (mod 3), x ≡ 3 (mod 5) => x ≡ 23 (mod 30)
    const r = solveCrtSystem([{ a: 1, m: 2 }, { a: 2, m: 3 }, { a: 3, m: 5 }])
    expect(r.solvable).toBe(true)
    expect(r.M).toBe(30)
    expect(r.x0).toBe(23)
    for (const [a, m] of [[1, 2], [2, 3], [3, 5]]) {
      expect(mod(r.x0, m)).toBe(a)
    }
  })

  it('handles the non-coprime but consistent case via lcm', () => {
    // x ≡ 1 (mod 4), x ≡ 3 (mod 6) => x ≡ 9 (mod 12)
    const r = solveCrtSystem([{ a: 1, m: 4 }, { a: 3, m: 6 }])
    expect(r.solvable).toBe(true)
    expect(r.M).toBe(12)
    expect(r.x0).toBe(9)
    expect(r.table).toBeUndefined()
    expect(r.steps[0].equations).toContain('2 divides 2; divide by 2: 2k ≡ 1 (mod 3)')
    expect(r.steps[0].equations).toContain('k ≡ 1 × 2 ≡ 2 (mod 3)')
    expect(mod(r.x0, 4)).toBe(1)
    expect(mod(r.x0, 6)).toBe(3)
  })

  it('reports an inconsistent system', () => {
    // x ≡ 2 (mod 4), x ≡ 3 (mod 6): gcd(4,6)=2 does not divide (3-2)=1
    const r = solveCrtSystem([{ a: 2, m: 4 }, { a: 3, m: 6 }])
    expect(r.solvable).toBe(false)
    expect(r.failIndex).toBe(1)
    expect(r.table).toBeUndefined()
    expect(r.steps[0].equations.at(-1)).toBe('2 does not divide 1, so no common solution exists.')
  })

  it('handles a single congruence', () => {
    const r = solveCrtSystem([{ a: 5, m: 7 }])
    expect(r.solvable).toBe(true)
    expect(r.M).toBe(7)
    expect(r.x0).toBe(5)
    expect(r.steps).toHaveLength(0)
  })

  it('normalizes residues and records combination steps', () => {
    const r = solveCrtSystem([{ a: -1, m: 3 }, { a: 4, m: 5 }])
    // -1 mod 3 = 2, 4 mod 5 = 4 => x ≡ 2 (mod 3), x ≡ 4 (mod 5) => x ≡ 14 (mod 15)
    expect(r.solvable).toBe(true)
    expect(r.x0).toBe(14)
    expect(r.steps).toHaveLength(1)
    expect(r.steps[0].consistent).toBe(true)
    expect(r.steps[0].d).toBe(1)
  })

  it('rejects combined moduli outside the safe integer range', () => {
    expect(() => solveCrtSystem([{ a: 0, m: 100_000 }, { a: 0, m: 99_991 }, { a: 0, m: 99_989 }, { a: 0, m: 99_971 }])).toThrow('Number.MAX_SAFE_INTEGER')
  })

  it('preserves exact arithmetic when intermediate products exceed number precision', () => {
    const congruences = [{ a: 2, m: 3 }, { a: 999_999_999_998, m: 1_000_000_000_001 }]
    const result = solveCrtSystem(congruences)
    expect(result.solvable).toBe(true)
    for (const { a, m } of congruences) expect(BigInt(result.x0) % BigInt(m)).toBe(BigInt(a))
    const table = result.table!
    expect(BigInt(table.sum)).toBe(table.rows.reduce((sum, row) => sum + BigInt(row.term), 0n))
    expect(BigInt(table.sum) % BigInt(result.M)).toBe(BigInt(result.x0))
    expect(BigInt(table.rows[1].term)).toBeGreaterThan(BigInt(Number.MAX_SAFE_INTEGER))
  })

  it('handles repeated moduli and moduli dividing the combined modulus', () => {
    const result = solveCrtSystem([{ a: 9, m: 12 }, { a: 1, m: 4 }, { a: 9, m: 12 }])
    expect(result.solvable).toBe(true)
    expect(result.x0).toBe(9)
    expect(result.M).toBe(12)
  })

  it('normalizes safe-integer residues without rounding', () => {
    const value = Number.MAX_SAFE_INTEGER
    const result = solveCrtSystem([{ a: value, m: value - 1 }])
    expect(result.x0).toBe(1)
  })

  it('rejects invalid residues and moduli', () => {
    for (const congruence of [{ a: 0.5, m: 3 }, { a: 1, m: 1 }, { a: NaN, m: 5 }]) {
      expect(() => solveCrtSystem([congruence])).toThrow('safe-integer')
    }
  })

  it('renders indexed CRT terms as LaTeX subscripts', () => {
    const result = solveCrtSystem([{ a: 5, m: 7 }, { a: 2, m: 11 }])
    const formula = String.raw`a_{2}M_{2}y_{2} = 2 \times 7 \times 8 = 112`
    expect(result.table?.latexEquations).toContain(formula)
    const markup = katex.renderToString(formula, { throwOnError: true, strict: 'error' })
    expect(markup).toContain('<msub>')
    expect(markup).toContain('<mn>112</mn>')
  })

  it('produces renderable LaTeX for coprime, non-coprime, repeated and inconsistent systems', () => {
    for (const input of [
      [{ a: 2, m: 3 }, { a: 3, m: 5 }],
      [{ a: 1, m: 4 }, { a: 3, m: 6 }],
      [{ a: 9, m: 12 }, { a: 1, m: 4 }],
      [{ a: 2, m: 4 }, { a: 3, m: 6 }],
      [{ a: -1, m: 3 }, { a: 4, m: 5 }],
    ]) {
      const result = solveCrtSystem(input)
      const formulas = [...(result.table?.latexEquations ?? []), ...result.steps.flatMap((step) => step.latexEquations)]
      for (const latex of formulas) {
        expect(() => katex.renderToString(latex, { throwOnError: true, strict: 'error' })).not.toThrow()
      }
    }
  })

})
