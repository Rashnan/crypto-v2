import {
  Braces,
  FunctionSquare,
  Grid3x3,
  LayoutGrid,
  Plus,
  Settings,
  Sigma,
  Variable,
  X,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  to: string
  icon: LucideIcon
}

export interface NavigationSection {
  label: string
  items: NavigationItem[]
}

export const overviewItem: NavigationItem = { label: 'Overview', to: '/', icon: LayoutGrid }

export const navigationSections: NavigationSection[] = [
  { label: 'Basic', items: [{ label: 'GCD', to: '/basic/gcd', icon: Variable }] },
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
