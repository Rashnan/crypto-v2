import {
  Binary,
  Boxes,
  Braces,
  FunctionSquare,
  Grid3x3,
  KeyRound,
  Layers,
  LayoutGrid,
  Lock,
  Plus,
  RefreshCw,
  Replace,
  Settings,
  Shuffle,
  Sigma,
  Unlock,
  Variable,
  X,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  to: string
  icon: LucideIcon
  shortLabel?: string
}

export interface NavigationSection {
  label: string
  items: NavigationItem[]
}

export const overviewItem: NavigationItem = { label: 'Overview', to: '/', icon: LayoutGrid }

export const navigationSections: NavigationSection[] = [
  { label: 'Basic', items: [{ label: 'GCD', to: '/basic/gcd', icon: Variable }, { label: 'Matrix Determinant', to: '/basic/matrix-determinant', icon: Grid3x3 }] },
  {
    label: 'Inverses',
    items: [
      { label: 'Additive Inverse', to: '/modular/additive-inverse', icon: Plus },
      { label: 'Multiplicative Inverse', to: '/modular/multiplicative-inverse', icon: X },
      { label: 'Matrix Inverse', to: '/modular/matrix-inverse', icon: Grid3x3 },
    ],
  },
  {
    label: 'Equations',
    items: [
      { label: 'Linear Diophantine', to: '/diophantine/linear', icon: Sigma },
      { label: 'Single Variable (mod)', to: '/diophantine/single-var', icon: FunctionSquare },
      { label: 'Simultaneous (mod)', to: '/diophantine/simultaneous', icon: Braces },
    ],
  },
  {
    label: 'Ciphers',
    items: [
      { label: 'Additive Cipher', to: '/ciphers/additive', icon: Plus },
      { label: 'Multiplicative Cipher', to: '/ciphers/multiplicative', icon: X },
      { label: 'Affine Cipher', to: '/ciphers/affine', icon: Braces },
      { label: 'Substitution Cipher', to: '/ciphers/substitution', icon: Variable },
      { label: 'Vigenère Cipher', to: '/ciphers/vigenere', icon: Sigma },
      { label: 'Autokey Cipher', to: '/ciphers/autokey', icon: FunctionSquare },
      { label: 'Playfair Cipher', to: '/ciphers/playfair', icon: Grid3x3 },
      { label: 'Hill Cipher', to: '/ciphers/hill', icon: Braces },
    ],
  },
  {
    label: 'Brute Force',
    items: [
      { label: 'Additive Brute Force', shortLabel: 'Additive', to: '/brute-force/additive', icon: Plus },
      { label: 'Multiplicative Brute Force', shortLabel: 'Multiplicative', to: '/brute-force/multiplicative', icon: X },
      { label: 'Affine Brute Force', shortLabel: 'Affine', to: '/brute-force/affine', icon: Braces },
    ],
  },
  {
    label: 'Modern Block Ciphers',
    items: [
      { label: 'P-Boxes', to: '/modern/p-boxes', icon: Shuffle },
      { label: 'S-Boxes', to: '/modern/s-boxes', icon: Replace },
      { label: 'LFSR', to: '/modern/lfsr', icon: RefreshCw },
    ],
  },
  {
    label: 'DES',
    items: [
      { label: 'DES Round', to: '/modern/des-round', icon: Layers },
      { label: 'DES Key Generation', shortLabel: 'DES Key Gen', to: '/modern/des-key', icon: KeyRound },
      { label: 'DES Encryption', shortLabel: 'DES Encrypt', to: '/modern/des-encrypt', icon: Lock },
      { label: 'DES Decryption', shortLabel: 'DES Decrypt', to: '/modern/des-decrypt', icon: Unlock },
    ],
  },
  {
    label: 'AES',
    items: [
      { label: 'AES Round', to: '/modern/aes-round', icon: Boxes },
      { label: 'AES Key Expansion', shortLabel: 'AES Key Exp', to: '/modern/aes-key', icon: Binary },
      { label: 'AES Encryption', shortLabel: 'AES Encrypt', to: '/modern/aes-encrypt', icon: Lock },
      { label: 'AES Decryption', shortLabel: 'AES Decrypt', to: '/modern/aes-decrypt', icon: Unlock },
    ],
  },
]

export const preferenceItems: NavigationItem[] = [
  { label: 'Settings', to: '/settings', icon: Settings },
]

export const navigationItems = [
  overviewItem,
  ...navigationSections.flatMap((section) => section.items),
  ...preferenceItems,
]

export const pageTitleByPath = Object.fromEntries(
  navigationItems.map((item) => [item.to, item.label]),
)
