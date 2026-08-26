import { createContext, useContext } from 'react'

export const accentThemes = ['teal', 'blue', 'violet', 'amber'] as const

export type AccentTheme = (typeof accentThemes)[number]

interface AccentThemeContextValue {
  accent: AccentTheme
  saveAccent: (accent: AccentTheme) => void
}

export const AccentThemeContext = createContext<AccentThemeContextValue | null>(null)

export function useAccentTheme() {
  const context = useContext(AccentThemeContext)

  if (!context) {
    throw new Error('useAccentTheme must be used inside AccentThemeProvider')
  }

  return context
}

export function isAccentTheme(value: string | null): value is AccentTheme {
  return accentThemes.some((accent) => accent === value)
}
