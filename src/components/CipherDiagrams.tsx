import { Box } from '@chakra-ui/react'

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

export function DesRoundDiagram({ mode = 'encrypt' }: { mode?: 'encrypt' | 'decrypt' }) {
  const marker = 'des-round-arrow'
  const subkey = mode === 'encrypt' ? 'Kᵢ' : 'K₁₇₋ᵢ'
  const caption =
    mode === 'encrypt'
      ? 'Encryption consumes K₁ … K₁₆ in order; the F output is XORed with L and the halves swap.'
      : 'Decryption reuses this exact round but consumes the subkeys in reverse (K₁₆ … K₁).'
  return (
    <DiagramFrame label={`DES ${mode} round diagram`} viewBox="0 0 620 480">
      <defs><Marker id={marker} /></defs>
      <text x="16" y="16" fontSize="13" fontWeight="600" fill="var(--text)">One DES Feistel round ({mode})</text>
      <Node x={30} y={28} w={150} h={46} label="L" sub="32 bits" />
      <Node x={430} y={28} w={150} h={46} label="R" sub="32 bits" />
      <Node x={430} y={108} w={150} h={44} label="E expansion" sub="32 → 48" />
      <Node x={430} y={180} w={150} h={44} label={`⊕ subkey ${subkey}`} sub="48 bits" />
      <Node x={430} y={252} w={150} h={44} label="S1 … S8" sub="48 → 32" />
      <Node x={430} y={324} w={150} h={44} label="P permutation" sub="32 → 32" />
      <Node x={30} y={396} w={150} h={44} label="⊕ combine" sub="L ⊕ F(R, K)" />
      <Node x={430} y={396} w={150} h={44} label="R′" sub="new right half" />
      <Arrow d="M505,74 V108" markerId={marker} />
      <Arrow d="M505,152 V180" markerId={marker} />
      <Arrow d="M505,224 V252" markerId={marker} />
      <Arrow d="M505,296 V324" markerId={marker} />
      <Arrow d="M505,368 V382 H110 V396" markerId={marker} />
      <Arrow d="M105,74 V366 H64 V396" markerId={marker} />
      <Arrow d="M180,418 H430" markerId={marker} />
      <text x="430" y="22" fontSize="11" fill="var(--text)">L′ = R</text>
      <text x="16" y="466" fontSize="11" fill="var(--text)">{caption}</text>
    </DiagramFrame>
  )
}

export function DesKeyScheduleDiagram() {
  const marker = 'des-key-arrow'
  const subkeys = Array.from({ length: 16 }, (_, index) => index)
  return (
    <DiagramFrame label="DES key schedule diagram" viewBox="0 0 640 330">
      <defs><Marker id={marker} /></defs>
      <text x="16" y="16" fontSize="13" fontWeight="600" fill="var(--text)">DES key schedule</text>
      <Node x={20} y={32} w={130} h={46} label="64-bit key" sub="8 parity bits" />
      <Node x={210} y={32} w={130} h={46} label="PC-1" sub="64 → 56" />
      <Node x={392} y={32} w={100} h={46} label="C₀" sub="28" />
      <Node x={512} y={32} w={100} h={46} label="D₀" sub="28" />
      <Arrow d="M150,55 H210" markerId={marker} />
      <Arrow d="M340,55 H392" markerId={marker} />
      <Arrow d="M392,55 H442 V78" markerId={marker} />
      <rect x="342" y="120" width="270" height="86" rx="10" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="358" y="142" fontSize="12" fontWeight="600" fill="var(--text-h)">Each round (1 … 16)</text>
      <text x="358" y="162" fontSize="11" fill="var(--text)">rotate C and D left by 1 or 2</text>
      <text x="358" y="180" fontSize="11" fill="var(--text)">PC-2 selects 48 bits → subkey Kᵢ</text>
      <text x="358" y="198" fontSize="11" fill="var(--text)">then rotate again for the next round</text>
      <Arrow d="M392,55 V120" markerId={marker} dashed />
      <Arrow d="M612,78 V103 H612 V120" markerId={marker} dashed />
      {subkeys.map((index) => (
        <g key={index}>
          <rect x={20 + index * 38} y={254} width={34} height={36} rx="7" fill="var(--accent-bg)" stroke="var(--accent)" strokeWidth="1.2" />
          <text x={20 + index * 38 + 17} y={277} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-h)">{`K${index + 1}`}</text>
        </g>
      ))}
      <Arrow d="M477,206 V254" markerId={marker} />
      <text x="16" y="318" fontSize="11" fill="var(--text)">The rotated halves are recombined before each PC-2 selection, producing sixteen 48-bit subkeys.</text>
    </DiagramFrame>
  )
}

function MiniGrid({ x, y, variant }: { x: number; y: number; variant: 'sub' | 'shift' | 'mix' | 'key' | 'plain' }) {
  const size = 15
  const gap = 2
  const cells = Array.from({ length: 16 }, (_, index) => index)
  return (
    <g>
      {cells.map((index) => {
        const row = Math.floor(index / 4)
        const column = index % 4
        const cx = x + column * (size + gap)
        const cy = y + row * (size + gap)
        const highlight =
          variant === 'mix' ? column === 0 : variant === 'key'
        return (
          <g key={index}>
            <rect x={cx} y={cy} width={size} height={size} rx="3" fill={highlight ? 'var(--accent)' : 'var(--accent-bg)'} stroke="var(--accent)" strokeWidth="1" />
            {variant === 'sub' && <text x={cx + size / 2} y={cy + size / 2 + 3.5} textAnchor="middle" fontSize="8" fill="var(--text-h)">S</text>}
            {variant === 'key' && <text x={cx + size / 2} y={cy + size / 2 + 3.5} textAnchor="middle" fontSize="8" fill="white">K</text>}
            {variant === 'shift' && row > 0 && <text x={cx + size / 2} y={cy + size / 2 + 3.5} textAnchor="middle" fontSize="8" fill="var(--text-h)">{row}</text>}
          </g>
        )
      })}
    </g>
  )
}

function AesCard({ x, title, description, variant }: { x: number; title: string; description: string; variant: 'sub' | 'shift' | 'mix' | 'key' }) {
  return (
    <g>
      <rect x={x} y={40} width={165} height={210} rx="12" fill="var(--bg)" stroke="var(--border)" strokeWidth="1.4" />
      <text x={x + 82.5} y={66} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--text-h)">{title}</text>
      <MiniGrid x={x + 47} y={90} variant={variant} />
      <foreignObject x={x + 10} y={180} width={145} height={62}>
        <div style={{ fontSize: '11px', color: 'var(--text)', fontFamily: 'monospace', lineHeight: 1.4 }}>{description}</div>
      </foreignObject>
    </g>
  )
}

type AesCardVariant = 'sub' | 'shift' | 'mix' | 'key'

const aesEncryptCards: Array<{ title: string; description: string; variant: AesCardVariant }> = [
  { title: 'SubBytes', description: 'every byte b → S[b]', variant: 'sub' },
  { title: 'ShiftRows', description: 'row r shifts left by r', variant: 'shift' },
  { title: 'MixColumns', description: 'each column × fixed matrix', variant: 'mix' },
  { title: 'AddRoundKey', description: 'state ⊕ round key', variant: 'key' },
]

const aesDecryptCards: Array<{ title: string; description: string; variant: AesCardVariant }> = [
  { title: 'InvShiftRows', description: 'row r shifts right by r', variant: 'shift' },
  { title: 'InvSubBytes', description: 'every byte b → S⁻¹[b]', variant: 'sub' },
  { title: 'AddRoundKey', description: 'state ⊕ round key (reversed)', variant: 'key' },
  { title: 'InvMixColumns', description: 'each column × inverse matrix', variant: 'mix' },
]

export function AesRoundDiagram({ mode = 'encrypt' }: { mode?: 'encrypt' | 'decrypt' }) {
  const marker = 'aes-round-arrow'
  const cards = mode === 'encrypt' ? aesEncryptCards : aesDecryptCards
  const caption =
    mode === 'encrypt'
      ? 'Round 10 omits MixColumns.'
      : 'The final decryption stage omits InvMixColumns; AddRoundKey uses the round keys in reverse.'
  return (
    <DiagramFrame label={`AES ${mode} round diagram`} viewBox="0 0 760 280" maxWidth="780px">
      <defs><Marker id={marker} /></defs>
      <text x="16" y="18" fontSize="13" fontWeight="600" fill="var(--text)">The 4 × 4 state passes through four operations each {mode} round</text>
      {cards.map((card, index) => (
        <AesCard key={card.title} x={20 + index * 185} title={card.title} description={card.description} variant={card.variant} />
      ))}
      <Arrow d="M185,145 H205" markerId={marker} />
      <Arrow d="M370,145 H390" markerId={marker} />
      <Arrow d="M555,145 H575" markerId={marker} />
      <text x="16" y="272" fontSize="11" fill="var(--text)">{caption}</text>
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
      <text x="16" y="16" fontSize="13" fontWeight="600" fill="var(--text)">AES-128 key expansion</text>
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
      <Arrow d="M410,76 V120" markerId={marker} dashed />
      <Arrow d="M410,232 V262" markerId={marker} />
      {roundKeys.map((index) => (
        <g key={index}>
          <rect x={20 + index * 61} y={282} width={55} height={38} rx="8" fill="var(--accent-bg)" stroke="var(--accent)" strokeWidth="1.2" />
          <text x={20 + index * 61 + 27.5} y={306} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-h)">{`K${index}`}</text>
        </g>
      ))}
      <text x="16" y="352" fontSize="11" fill="var(--text)">The 44 words group into eleven 128-bit round keys (four words each).</text>
    </DiagramFrame>
  )
}
