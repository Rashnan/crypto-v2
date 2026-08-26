import { useLayoutEffect, useState, type ReactNode } from 'react'
import {
  AccentThemeContext,
  isAccentTheme,
  type AccentTheme,
} from './accent-theme'

const storageKey = 'crypto-accent-theme'

function getSavedAccent(): AccentTheme {
  const savedAccent = localStorage.getItem(storageKey)
  return isAccentTheme(savedAccent) ? savedAccent : 'teal'
}

export function AccentThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [accent, setAccent] = useState(getSavedAccent)

  useLayoutEffect(() => {
    document.documentElement.dataset.accent = accent
  }, [accent])

  function saveAccent(nextAccent: AccentTheme) {
    localStorage.setItem(storageKey, nextAccent)
    setAccent(nextAccent)
  }

  return (
    <AccentThemeContext.Provider value={{ accent, saveAccent }}>
      {children}
    </AccentThemeContext.Provider>
  )
}
