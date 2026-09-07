"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "meeo-dashboard-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (stored && ["light", "dark", "system"].includes(stored)) {
        return stored
      }
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light")

  const applyTheme = React.useCallback(
    (targetTheme: Theme) => {
      const root = document.documentElement
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches

      const isDark = targetTheme === "dark" || (targetTheme === "system" && systemDark)

      root.classList.remove("light", "dark")
      if (isDark) {
        root.classList.add("dark")
        setResolvedTheme("dark")
      } else {
        root.classList.add("light")
        setResolvedTheme("light")
      }
      root.style.colorScheme = isDark ? "dark" : "light"
    },
    []
  )

  React.useEffect(() => {
    applyTheme(theme)

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => {
        applyTheme("system")
      }
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, applyTheme])

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {
        // Ignore localStorage quota / private browsing errors
      }
      setThemeState(newTheme)
    },
    [storageKey]
  )

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextType {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
