import { solveCrtSystem } from './crt'
import { gcd, mod, multiplicativeInverse } from './modular'
import { extendedGcd } from './gcd'
import { integer, prime, primeFactors, powerDetail, modularPower } from './public-key-math'

export { modularPower } from './public-key-math'

export type AsymmetricMode = 'encrypt' | 'decrypt'

export interface CalculationStep {
  label: string
  equations: string[]
  actor: 'Alice' | 'Bob' | 'Alice → Bob' | 'Alice ↔ Bob'
  phase?: 'parameters' | 'keys' | 'exchange' | 'shared-secret' | 'verification'
  explanation: string
  detail?: { label: string; equations: string[]; latexEquations?: string[] }
}

export interface MessageExchange {
  sender: string[]
  channel: string[]
  receiver: string[]
}

export interface ParticipantSummary {
  owner: 'Alice' | 'Bob'
  role: string
  entries: { label: string; value: string }[]
}

export interface AsymmetricResult {
  publicKey: string
  privateKey: string
  outputLabel: string
  output: number[]
  steps: CalculationStep[]
  exchange: MessageExchange
  participants: ParticipantSummary[]
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


function inverseDetail(value: number, modulus: number) {
  const inverse = multiplicativeInverse(value, modulus)
  if (!inverse.exists) throw new Error(`${value} has no inverse modulo ${modulus}.`)
  const euclid = extendedGcd(value, modulus)
  return {
    value: inverse.inverse,
    equations: [
      ...euclid.rows.map((row) => `${row.r1} = ${row.quotient} × ${row.r2} + ${row.r}`),
      `Bézout identity: ${value} × (${euclid.s}) + ${modulus} × (${euclid.t}) = 1`,
      `${value}⁻¹ mod ${modulus} = ${euclid.s} mod ${modulus} = ${inverse.inverse}`,
    ],
  }
}

function publishKeys(publicKey: string, privateKey: string): CalculationStep {
  return {
    label: 'Bob publishes his public key and keeps his private key', actor: 'Bob',
    explanation: 'Both keys belong to Bob, the recipient. Alice gets Bob’s public key to encrypt a message for him. Bob keeps the private key to decrypt it.',
    equations: [`Bob’s public key: ${publicKey}`, `Bob’s private key: ${privateKey}`],
  }
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
  const inverse = inverseDetail(e, phi)
  const d = inverse.value
  const encryption = mode === 'encrypt' ? powerDetail(value, e, n) : null
  const ciphertext = encryption?.value ?? value
  const decryption = powerDetail(ciphertext, d, n)
  const publicKey = `(n, e) = (${n}, ${e})`
  const privateKey = `(n, d) = (${n}, ${d})`
  const steps: CalculationStep[] = [
    {
      label: 'Bob chooses two secret primes', actor: 'Bob',
      explanation: 'Bob starts his key generation with distinct primes p and q. He keeps these factors secret.',
      equations: [`p = ${p}, q = ${q}`],
    },
    {
      label: 'Bob computes the modulus and totient', actor: 'Bob',
      explanation: 'The modulus n is public. The totient φ(n) is used to derive the private exponent.',
      equations: [`n = p × q = ${p} × ${q} = ${n}`, `φ(n) = (p − 1)(q − 1) = ${p - 1} × ${q - 1} = ${phi}`],
    },
    {
      label: 'Bob chooses the public exponent', actor: 'Bob',
      explanation: 'Choose 1 < e < φ(n) with gcd(e, φ(n)) = 1 so that e has a modular inverse.',
      equations: [`e = ${e}`, `gcd(${e}, ${phi}) = 1`],
    },
    {
      label: 'Bob derives the private exponent', actor: 'Bob',
      explanation: 'Find d using the extended Euclidean algorithm. The exponents satisfy ed ≡ 1 (mod φ(n)), which gives RSA decryption.',
      equations: [`ed ≡ 1 (mod φ(n))`, `d = e⁻¹ mod φ(n) = ${e}⁻¹ mod ${phi} = ${d}`],
      detail: { label: 'Extended Euclidean calculation for d', equations: inverse.equations },
    },
    publishKeys(publicKey, privateKey),
  ]
  if (encryption) steps.push({
    label: 'Alice encrypts with Bob’s public key', actor: 'Alice',
    explanation: 'Alice uses Bob’s n and e. She does not need Bob’s private exponent d.',
    equations: [`0 ≤ m < n; m = ${value}`, `c = m^e mod n = ${value}^${e} mod ${n} = ${ciphertext}`],
    detail: { label: 'Square-and-multiply encryption', equations: encryption.equations },
  })
  steps.push(
    { label: 'Alice sends the ciphertext to Bob', actor: 'Alice → Bob', explanation: 'The transmitted value is c. Bob’s private key stays with Bob.', equations: [`Alice → Bob: c = ${ciphertext}`] },
    {
      label: 'Bob decrypts with his private key', actor: 'Bob',
      explanation: 'Bob applies his private exponent d to the received ciphertext.',
      equations: [`m = c^d mod n = ${ciphertext}^${d} mod ${n} = ${decryption.value}`],
      detail: { label: 'Square-and-multiply decryption', equations: decryption.equations },
    },
  )
  if (encryption) steps.push({ label: 'Check the received message', actor: 'Bob', explanation: 'The recovered message matches Alice’s original message.', equations: [`Received m = ${decryption.value}; Alice’s original m = ${value}`] })
  return {
    publicKey, privateKey,
    participants: [
      { owner: 'Alice', role: 'Sender · encrypts for Bob', entries: [
        { label: 'Public key Alice uses · owned by Bob', value: publicKey },
        { label: 'Alice’s own public/private key pair', value: 'Not required for this one-way RSA encryption.' },
        { label: 'Alice’s message', value: mode === 'encrypt' ? `m = ${value}` : 'Not supplied; Bob recovers it from the ciphertext.' },
        { label: 'Ciphertext Alice sends', value: `c = ${ciphertext}` },
        { label: 'Shared key', value: 'No shared key is derived by this textbook RSA operation.' },
      ] },
      { owner: 'Bob', role: 'Recipient · owns the RSA key pair', entries: [
        { label: 'Bob’s public key · shared with Alice', value: publicKey },
        { label: 'Bob’s private key · kept by Bob', value: privateKey },
        { label: 'Bob’s secret prime factors', value: `p = ${p}, q = ${q}` },
        { label: 'Ciphertext Bob receives', value: `c = ${ciphertext}` },
        { label: 'Message Bob recovers', value: `m = ${decryption.value}` },
      ] },
    ],
    outputLabel: mode === 'encrypt' ? 'Ciphertext c sent by Alice' : 'Plaintext m recovered by Bob',
    output: [mode === 'encrypt' ? ciphertext : decryption.value], steps,
    exchange: {
      sender: ['Alice uses Bob’s public key (n, e).', 'c = m^e mod n', ...(encryption ? [`m = ${value}`] : ['Alice’s original m is not supplied.'])],
      channel: [`c = ${ciphertext}`, 'Only the ciphertext is sent.'],
      receiver: ['Bob uses his private key (n, d).', 'm = c^d mod n', `Recovered m = ${decryption.value}`],
    },
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
  const publicKey = `(p, g, y) = (${p}, ${g}, ${y})`
  const privateKey = `x = ${x}`
  const steps: CalculationStep[] = [
    {
      label: 'Bob chooses a prime field and generator', actor: 'Bob',
      explanation: 'p and g are public parameters. For each prime factor r of p − 1, check that g^((p−1)/r) is not 1 modulo p.',
      equations: [`p = ${p}, g = ${g}`, ...generatorChecks.map((check) => `${g}^((${p} − 1) / ${check.factor}) mod ${p} = ${check.value} ≠ 1`)],
    },
    {
      label: 'Bob chooses his private key and computes his public key', actor: 'Bob',
      explanation: 'Bob keeps x secret and computes y = g^x mod p for Alice to use.',
      equations: [`x = ${x}`, `y = g^x mod p = ${g}^${x} mod ${p} = ${y}`],
      detail: { label: 'Square-and-multiply for y', equations: publicPower.equations },
    },
    publishKeys(publicKey, privateKey),
  ]
  let aliceSharedSecret: number | undefined
  let firstComponent: number
  let secondComponent: number
  if (mode === 'encrypt') {
    integer(k!, 'Ephemeral exponent k', 1, p - 2)
    const first = powerDetail(g, k!, p)
    const shared = powerDetail(y, k!, p)
    aliceSharedSecret = shared.value
    firstComponent = first.value
    secondComponent = multiplyMod(value, shared.value, p)
    steps.push(
      {
        label: 'Alice chooses a fresh secret exponent', actor: 'Alice',
        explanation: 'k belongs to Alice for this message. It is not Bob’s private key x and is not transmitted.',
        equations: [`1 ≤ k ≤ p − 2; k = ${k}`, `Alice’s message m = ${value}`],
      },
      {
        label: 'Alice computes the first ciphertext component', actor: 'Alice',
        explanation: 'Alice uses the public generator g and her secret k.',
        equations: [`c₁ = g^k mod p = ${g}^${k} mod ${p} = ${firstComponent}`],
        detail: { label: 'Square-and-multiply for c₁', equations: first.equations },
      },
      {
        label: 'Alice computes the shared secret and masks the message', actor: 'Alice',
        explanation: 'Alice uses y from Bob’s public key to compute s. She multiplies m by s modulo p.',
        equations: [`s = y^k mod p = ${y}^${k} mod ${p} = ${shared.value}`, `c₂ = m × s mod p = ${value} × ${shared.value} mod ${p} = ${secondComponent}`],
        detail: { label: 'Square-and-multiply for Alice’s shared secret', equations: shared.equations },
      },
    )
  } else {
    integer(c1!, 'Ciphertext c₁', 1, p - 1)
    firstComponent = c1!
    secondComponent = value
  }
  const shared = powerDetail(firstComponent, x, p)
  const sharedInverse = inverseDetail(shared.value, p)
  const message = multiplyMod(secondComponent, sharedInverse.value, p)
  steps.push(
    {
      label: 'Alice sends both ciphertext components', actor: 'Alice → Bob',
      explanation: mode === 'encrypt' ? 'Alice sends (c₁, c₂). Her k and the shared secret s are not sent.' : 'These are the received components. Bob can decrypt without knowing Alice’s secret k.',
      equations: [`Alice → Bob: (c₁, c₂) = (${firstComponent}, ${secondComponent})`],
    },
    {
      label: 'Bob computes the same shared secret', actor: 'Bob',
      explanation: 'Bob uses his private x and received c₁. The secrets agree because c₁^x = (g^k)^x = (g^x)^k = y^k modulo p.',
      equations: [`s = c₁^x mod p = ${firstComponent}^${x} mod ${p} = ${shared.value}`],
      detail: { label: 'Square-and-multiply for Bob’s shared secret', equations: shared.equations },
    },
    {
      label: 'Bob removes the mask with a modular inverse', actor: 'Bob',
      explanation: 'Bob multiplies c₂ by s⁻¹ to recover Alice’s message.',
      equations: [`s⁻¹ mod p = ${shared.value}⁻¹ mod ${p} = ${sharedInverse.value}`, `m = c₂ × s⁻¹ mod p = ${secondComponent} × ${sharedInverse.value} mod ${p} = ${message}`],
      detail: { label: 'Extended Euclidean calculation for s⁻¹', equations: sharedInverse.equations },
    },
  )
  if (mode === 'encrypt') steps.push({ label: 'Check both shared secrets and the received message', actor: 'Bob', explanation: 'Alice and Bob independently computed the same shared secret. Bob’s recovered message matches Alice’s original message.', equations: [`Alice’s s_A = ${aliceSharedSecret}; Bob’s s_B = ${shared.value}`, `Received m = ${message}; Alice’s original m = ${value}`] })
  return {
    publicKey, privateKey,
    participants: [
      { owner: 'Alice', role: 'Sender · chooses the temporary exponent k', entries: [
        { label: 'Public key Alice uses · owned by Bob', value: publicKey },
        { label: 'Alice’s temporary private exponent', value: mode === 'encrypt' ? `k = ${k}` : 'k is not supplied and is not needed for Bob’s decryption.' },
        { label: 'Alice’s shared secret · computed with Bob’s y', value: mode === 'encrypt' ? `s_A = y^k mod p = ${aliceSharedSecret}` : 's_A = y^k mod p; Alice’s k is not supplied.' },
        { label: 'Ciphertext Alice sends', value: `(c₁, c₂) = (${firstComponent}, ${secondComponent})` },
      ] },
      { owner: 'Bob', role: 'Recipient · owns the ElGamal key pair', entries: [
        { label: 'Bob’s public key · shared with Alice', value: publicKey },
        { label: 'Bob’s private key · kept by Bob', value: privateKey },
        { label: 'Bob’s shared secret · computed with received c₁', value: `s_B = c₁^x mod p = ${shared.value}` },
        { label: 'Message Bob recovers', value: `m = ${message}` },
      ] },
    ],
    outputLabel: mode === 'encrypt' ? 'Ciphertext (c₁, c₂) sent by Alice' : 'Plaintext m recovered by Bob',
    output: mode === 'encrypt' ? [firstComponent, secondComponent] : [message], steps,
    exchange: {
      sender: ['Alice uses Bob’s public key (p, g, y).', mode === 'encrypt' ? `Alice’s fresh secret k = ${k}` : 'Alice’s secret k is not supplied or needed by Bob.', 'c₁ = g^k mod p; c₂ = m × y^k mod p'],
      channel: [`(c₁, c₂) = (${firstComponent}, ${secondComponent})`, 'k and s are not sent.'],
      receiver: ['Bob uses his private key x.', 's = c₁^x mod p; m = c₂ × s⁻¹ mod p', `Recovered m = ${message}`],
    },
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
  const publicKey = `n = ${n}`
  const privateKey = `(p, q) = (${p}, ${q})`
  const steps: CalculationStep[] = [
    {
      label: 'Bob chooses two secret primes', actor: 'Bob',
      explanation: 'Bob chooses distinct primes congruent to 3 modulo 4. This allows square roots to be computed with (p + 1)/4 and (q + 1)/4.',
      equations: [`p = ${p} ≡ 3 (mod 4)`, `q = ${q} ≡ 3 (mod 4)`],
    },
    { label: 'Bob computes his public modulus', actor: 'Bob', explanation: 'Bob keeps p and q as his private key and publishes their product n.', equations: [`n = p × q = ${p} × ${q} = ${n}`] },
    publishKeys(publicKey, privateKey),
  ]
  const ciphertext = mode === 'encrypt' ? multiplyMod(value, value, n) : value
  if (mode === 'encrypt') steps.push({
    label: 'Alice encrypts with Bob’s public key', actor: 'Alice',
    explanation: 'Alice needs only Bob’s n to square her message modulo n. She does not need the factors p and q.',
    equations: [`0 ≤ m < n; m = ${value}`, `c = m² mod n = ${value}² mod ${n} = ${ciphertext}`],
  })
  steps.push({ label: 'Alice sends the ciphertext to Bob', actor: 'Alice → Bob', explanation: 'The transmitted value is c. Bob keeps the factorization of n private.', equations: [`Alice → Bob: c = ${ciphertext}`] })
  const rp = powerDetail(ciphertext, (p + 1) / 4, p)
  const rq = powerDetail(ciphertext, (q + 1) / 4, q)
  if (multiplyMod(rp.value, rp.value, p) !== ciphertext % p || multiplyMod(rq.value, rq.value, q) !== ciphertext % q) {
    throw new Error('Ciphertext is not a quadratic residue modulo both primes; no plaintext roots exist.')
  }
  steps.push(
    {
      label: 'Bob finds the square roots modulo p', actor: 'Bob',
      explanation: 'Bob uses his secret prime p. The two signed roots may coincide when the root is zero.',
      equations: [`rₚ = c^((p+1)/4) mod p = ${ciphertext}^${(p + 1) / 4} mod ${p} = ${rp.value}`, `Roots modulo ${p}: ${rp.value}, ${mod(-rp.value, p)}`],
      detail: { label: 'Square-and-multiply for rₚ', equations: rp.equations },
    },
    {
      label: 'Bob finds the square roots modulo q', actor: 'Bob',
      explanation: 'Bob repeats the calculation with his other secret prime q.',
      equations: [`rᵩ = c^((q+1)/4) mod q = ${ciphertext}^${(q + 1) / 4} mod ${q} = ${rq.value}`, `Roots modulo ${q}: ${rq.value}, ${mod(-rq.value, q)}`],
      detail: { label: 'Square-and-multiply for rᵩ', equations: rq.equations },
    },
  )
  const candidates: number[] = []
  const crtSummary: string[] = []
  const crtWorking: string[] = []
  const crtLatexWorking: string[] = []
  for (const a of [...new Set([rp.value, mod(-rp.value, p)])]) {
    for (const b of [...new Set([rq.value, mod(-rq.value, q)])]) {
      const crt = solveCrtSystem([{ a, m: p }, { a: b, m: q }])
      candidates.push(crt.x0)
      crtSummary.push(`m ≡ ${a} (mod ${p}), m ≡ ${b} (mod ${q}) → m = ${crt.x0}`)
      crtWorking.push(`Roots ${a} and ${b}:`, ...crt.table!.equations)
      crtLatexWorking.push(String.raw`\text{Roots }${a}\text{ and }${b}:`, ...crt.table!.latexEquations)
    }
  }
  const roots = [...new Set(candidates)].sort((a, b) => a - b)
  steps.push({
    label: 'Bob combines the roots with CRT', actor: 'Bob',
    explanation: 'Combine each possible pair of roots to get the candidate messages.',
    equations: crtSummary,
    detail: { label: 'Show full CRT calculation', equations: crtWorking, latexEquations: crtLatexWorking },
  })
  steps.push({
    label: 'Bob verifies the candidate plaintexts', actor: 'Bob',
    explanation: 'Each candidate squares to the received ciphertext. Textbook Rabin alone does not tell Bob which candidate Alice sent; message encoding is needed to choose.',
    equations: roots.map((root) => `${root}² mod ${n} = ${multiplyMod(root, root, n)}`),
  })
  if (mode === 'encrypt') steps.push({
    label: 'Locate Alice’s original message among the candidates', actor: 'Bob',
    explanation: 'The calculator knows Alice’s input for this demonstration. Bob cannot select it from the ciphertext alone.',
    equations: [`Alice’s original m = ${value}; Bob’s candidates = {${roots.join(', ')}}`],
  })
  return {
    publicKey, privateKey,
    participants: [
      { owner: 'Alice', role: 'Sender · encrypts for Bob', entries: [
        { label: 'Public key Alice uses · owned by Bob', value: publicKey },
        { label: 'Alice’s own public/private key pair', value: 'Not required for this one-way Rabin encryption.' },
        { label: 'Alice’s message', value: mode === 'encrypt' ? `m = ${value}` : 'Unknown; Bob recovers candidate plaintexts.' },
        { label: 'Ciphertext Alice sends', value: `c = ${ciphertext}` },
        { label: 'Shared key', value: 'No shared key is derived by this textbook Rabin operation.' },
      ] },
      { owner: 'Bob', role: 'Recipient · owns the Rabin key pair', entries: [
        { label: 'Bob’s public key · shared with Alice', value: publicKey },
        { label: 'Bob’s private key · kept by Bob', value: privateKey },
        { label: 'Ciphertext Bob receives', value: `c = ${ciphertext}` },
        { label: 'Candidate plaintexts Bob recovers', value: `{${roots.join(', ')}}` },
        { label: 'How Bob identifies Alice’s original', value: 'Message encoding is needed to select the original candidate.' },
      ] },
    ],
    outputLabel: mode === 'encrypt' ? 'Ciphertext c sent by Alice' : 'Candidate plaintexts recovered by Bob',
    output: mode === 'encrypt' ? [ciphertext] : roots, steps,
    exchange: {
      sender: ['Alice uses Bob’s public key n.', 'c = m² mod n', ...(mode === 'encrypt' ? [`m = ${value}`] : ['Alice’s original m is unknown.'])],
      channel: [`c = ${ciphertext}`, 'Only the ciphertext is sent.'],
      receiver: ['Bob uses his private primes (p, q).', 'Square roots → CRT', `Candidates = {${roots.join(', ')}}`, 'Encoding is needed to select the original.'],
    },
  }
}
