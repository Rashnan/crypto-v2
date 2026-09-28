import { Box } from '@chakra-ui/react'

type Mode = 'encrypt' | 'decrypt'

function Marker({ id }: { id: string }) {
  return (
    <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
    </marker>
  )
}

function Node({ x, y, w, h, label, sub }: { x: number; y: number; w: number; h: number; label: string; sub?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" fill="var(--accent-bg)" stroke="var(--accent)" strokeWidth="1.4" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 3 : h / 2 + 5)} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--text-h)">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" fontSize="11" fill="var(--text)">{sub}</text>}
    </g>
  )
}

function Arrow({ d, markerId, dashed }: { d: string; markerId: string; dashed?: boolean }) {
  return <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.6" markerEnd={`url(#${markerId})`} strokeDasharray={dashed ? '5 4' : undefined} />
}

function DiagramFrame({ label, children, viewBox, maxWidth = '680px' }: { label: string; children: React.ReactNode; viewBox: string; maxWidth?: string }) {
  return (
    <Box mt="20px" p="16px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" bg="var(--bg)" overflowX="auto">
      <svg role="img" aria-label={label} viewBox={viewBox} style={{ width: '100%', height: 'auto', maxWidth }}>
        {children}
      </svg>
    </Box>
  )
}

/* ---------------------------------- DES ---------------------------------- */

export function DesRoundDiagram({ mode = 'encrypt' }: { mode?: Mode }) {
  const marker = 'des-round-arrow'
  const subkey = mode === 'encrypt' ? 'Kᵢ' : 'K₁₇₋ᵢ'
  const caption =
    mode === 'encrypt'
      ? 'Rounds use the subkeys K₁ … K₁₆ in order.'
      : 'Decryption uses the subkeys in reverse (K₁₆ … K₁).'
  return (
    <DiagramFrame label={`DES ${mode} round diagram`} viewBox="0 0 620 470">
      <defs><Marker id={marker} /></defs>
      <text x="16" y="15" fontSize="13" fontWeight="600" fill="var(--text)">One DES Feistel round ({mode})</text>

      <Node x={30} y={28} w={150} h={46} label="L" sub="32 bits" />
      <Node x={430} y={28} w={150} h={46} label="R" sub="32 bits" />
      <Node x={430} y={108} w={150} h={44} label="E expansion" sub="32 → 48" />
      <Node x={430} y={180} w={150} h={44} label={`⊕ subkey ${subkey}`} sub="48 bits" />
      <Node x={430} y={252} w={150} h={44} label="S1 … S8" sub="48 → 32" />
      <Node x={430} y={324} w={150} h={44} label="P permutation" sub="32 → 32" />
      <Node x={30} y={400} w={150} h={46} label="⊕ combine" sub="L ⊕ F(R, K)" />
      <Node x={430} y={400} w={150} h={46} label="R′" sub="new right half" />

      <Arrow d="M505,74 V108" markerId={marker} />
      <Arrow d="M505,152 V180" markerId={marker} />
      <Arrow d="M505,224 V252" markerId={marker} />
      <Arrow d="M505,296 V324" markerId={marker} />
      <Arrow d="M505,368 V384 H150 V400" markerId={marker} />
      <Arrow d="M105,74 V400" markerId={marker} />
      <Arrow d="M180,423 H430" markerId={marker} />

      <text x="430" y="20" fontSize="11" fill="var(--text)">L′ = R</text>
      <text x="16" y="462" fontSize="11" fill="var(--text)">{caption}</text>
    </DiagramFrame>
  )
}

export function DesKeyScheduleDiagram() {
  const marker = 'des-key-arrow'
  const subkeys = Array.from({ length: 16 }, (_, index) => index)
  return (
    <DiagramFrame label="DES key schedule diagram" viewBox="0 0 640 330">
      <defs><Marker id={marker} /></defs>
      <text x="16" y="15" fontSize="13" fontWeight="600" fill="var(--text)">DES key schedule</text>

      <Node x={20} y={32} w={130} h={46} label="64-bit key" sub="8 parity bits" />
      <Node x={210} y={32} w={130} h={46} label="PC-1" sub="64 → 56" />
      <Node x={400} y={32} w={100} h={46} label="C₀" sub="28" />
      <Node x={512} y={32} w={100} h={46} label="D₀" sub="28" />

      <Arrow d="M150,55 H210" markerId={marker} />
      <Arrow d="M340,55 H400" markerId={marker} />

      <rect x="382" y="120" width="238" height="86" rx="10" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="398" y="142" fontSize="12" fontWeight="600" fill="var(--text-h)">Each round (1 … 16)</text>
      <text x="398" y="162" fontSize="11" fill="var(--text)">rotate C and D left by 1 or 2</text>
      <text x="398" y="180" fontSize="11" fill="var(--text)">PC-2 selects 48 bits → subkey Kᵢ</text>
      <text x="398" y="198" fontSize="11" fill="var(--text)">then rotate again for the next round</text>
      <Arrow d="M450,78 V120" markerId={marker} dashed />
      <Arrow d="M562,78 V120" markerId={marker} dashed />

      <Arrow d="M501,206 V252" markerId={marker} />
      {subkeys.map((index) => (
        <g key={index}>
          <rect x={18 + index * 38} y={254} width={34} height={36} rx="7" fill="var(--accent-bg)" stroke="var(--accent)" strokeWidth="1.2" />
          <text x={18 + index * 38 + 17} y={277} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-h)">{`K${index + 1}`}</text>
        </g>
      ))}
      <text x="16" y="318" fontSize="11" fill="var(--text)">PC-2 yields sixteen 48-bit subkeys.</text>
    </DiagramFrame>
  )
}

/* ---------------------------------- AES ---------------------------------- */

type AesCardVariant = 'sub' | 'shift' | 'mix' | 'key'

const aesEncryptCards: Array<{ title: string; line1: string; line2: string; variant: AesCardVariant }> = [
  { title: 'SubBytes', line1: 'every byte', line2: 'b → S[b]', variant: 'sub' },
  { title: 'ShiftRows', line1: 'row r shifts', line2: 'left by r', variant: 'shift' },
  { title: 'MixColumns', line1: 'each column', line2: '× fixed matrix', variant: 'mix' },
  { title: 'AddRoundKey', line1: 'state ⊕', line2: 'round key', variant: 'key' },
]

const aesDecryptCards: Array<{ title: string; line1: string; line2: string; variant: AesCardVariant }> = [
  { title: 'InvShiftRows', line1: 'row r shifts', line2: 'right by r', variant: 'shift' },
  { title: 'InvSubBytes', line1: 'every byte', line2: 'b → S⁻¹[b]', variant: 'sub' },
  { title: 'AddRoundKey', line1: 'state ⊕ round key', line2: '(reversed)', variant: 'key' },
  { title: 'InvMixColumns', line1: 'each column', line2: '× inverse matrix', variant: 'mix' },
]

function MiniGrid({ x, y, variant }: { x: number; y: number; variant: AesCardVariant }) {
  const size = 14
  const gap = 2
  return (
    <g>
      {Array.from({ length: 16 }, (_, index) => {
        const row = Math.floor(index / 4)
        const column = index % 4
        const cx = x + column * (size + gap)
        const cy = y + row * (size + gap)
        const highlighted = variant === 'mix' ? column === 0 : variant === 'key'
        return (
          <g key={index}>
            <rect x={cx} y={cy} width={size} height={size} rx="3" fill={highlighted ? 'var(--accent)' : 'var(--accent-bg)'} stroke="var(--accent)" strokeWidth="0.9" />
            {variant === 'sub' && <text x={cx + size / 2} y={cy + size / 2 + 3} textAnchor="middle" fontSize="8" fill="var(--text-h)">S</text>}
            {variant === 'key' && <text x={cx + size / 2} y={cy + size / 2 + 3} textAnchor="middle" fontSize="7.5" fill="white">K</text>}
          </g>
        )
      })}
    </g>
  )
}

function AesCard({ x, title, line1, line2, variant }: { x: number; title: string; line1: string; line2: string; variant: AesCardVariant }) {
  const y = 30
  const w = 160
  const h = 160
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="12" fill="var(--bg)" stroke="var(--border)" strokeWidth="1.4" />
      <text x={x + w / 2} y={y + 24} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--text-h)">{title}</text>
      <MiniGrid x={x + 49} y={y + 46} variant={variant} />
      <text x={x + w / 2} y={y + 128} textAnchor="middle" fontSize="10.5" fill="var(--text)">{line1}</text>
      <text x={x + w / 2} y={y + 143} textAnchor="middle" fontSize="10.5" fill="var(--text)">{line2}</text>
    </g>
  )
}

export function AesRoundDiagram({ mode = 'encrypt' }: { mode?: Mode }) {
  const marker = 'aes-round-arrow'
  const cards = mode === 'encrypt' ? aesEncryptCards : aesDecryptCards
  const caption =
    mode === 'encrypt'
      ? 'Round 10 omits MixColumns.'
      : 'The final decryption stage omits InvMixColumns.'
  return (
    <DiagramFrame label={`AES ${mode} round diagram`} viewBox="0 0 736 212" maxWidth="780px">
      <defs><Marker id={marker} /></defs>
      <text x="16" y="16" fontSize="13" fontWeight="600" fill="var(--text)">The 4 × 4 state passes through four operations each {mode} round</text>
      {cards.map((card, index) => (
        <AesCard key={card.title} x={16 + index * 180} title={card.title} line1={card.line1} line2={card.line2} variant={card.variant} />
      ))}
      <Arrow d="M176,110 H196" markerId={marker} />
      <Arrow d="M356,110 H376" markerId={marker} />
      <Arrow d="M536,110 H556" markerId={marker} />
      <text x="16" y="205" fontSize="11" fill="var(--text)">{caption}</text>
    </DiagramFrame>
  )
}

export function AesKeyExpansionDiagram() {
  const marker = 'aes-key-arrow'
  const words = [0, 1, 2, 3]
  const roundKeys = Array.from({ length: 11 }, (_, index) => index)
  return (
    <DiagramFrame label="AES key expansion diagram" viewBox="0 0 700 370">
      <defs><Marker id={marker} /></defs>
      <text x="16" y="15" fontSize="13" fontWeight="600" fill="var(--text)">AES-128 key expansion</text>

      <Node x={20} y={30} w={130} h={46} label="16-byte key" sub="4 words" />
      {words.map((word) => (
        <Node key={word} x={190 + word * 110} y={30} w={96} h={46} label={`w${word}`} sub="4 bytes" />
      ))}
      <Arrow d="M150,53 H190" markerId={marker} />

      <rect x="190" y="120" width="470" height="112" rx="12" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="208" y="144" fontSize="12" fontWeight="600" fill="var(--text-h)">For every word i ≥ 4</text>
      <text x="208" y="166" fontSize="11" fill="var(--text)">temp = w[i−1]</text>
      <text x="208" y="186" fontSize="11" fill="var(--text)">every 4th word: temp = SubWord(RotWord(temp)) ⊕ Rcon</text>
      <text x="208" y="206" fontSize="11" fill="var(--text)">w[i] = w[i−4] ⊕ temp</text>
      <Arrow d="M238,76 V120" markerId={marker} dashed />

      <Arrow d="M425,232 V262" markerId={marker} />
      {roundKeys.map((index) => (
        <g key={index}>
          <rect x={20 + index * 61} y={282} width={55} height={38} rx="8" fill="var(--accent-bg)" stroke="var(--accent)" strokeWidth="1.2" />
          <text x={20 + index * 61 + 27.5} y={306} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-h)">{`K${index}`}</text>
        </g>
      ))}
      <text x="16" y="352" fontSize="11" fill="var(--text)">The 44 words form eleven 128-bit round keys.</text>
    </DiagramFrame>
  )
}
