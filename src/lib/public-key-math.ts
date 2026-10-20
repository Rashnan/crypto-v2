export function integer(value: number, name: string, min: number, max: number) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer from ${min} to ${max}.`)
  }
}

export function prime(value: number, name: string) {
  integer(value, name, 2, 1_000_000)
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0) throw new Error(`${name} must be prime.`)
  }
}


export function modularPower(base: number, exponent: number, modulus: number): number {
  return powerDetail(base, exponent, modulus).value
}

export function powerDetail(base: number, exponent: number, modulus: number) {
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


export function primeFactors(value: number): number[] {
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

