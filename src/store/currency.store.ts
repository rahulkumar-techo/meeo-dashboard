/**
 * @file currency.store.ts
 * @description Persistent Zustand store for managing active display currency across the console.
 * Defaults to INR (Indian Rupee - ₹).
 */

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  locale: string
  flag: string
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", flag: "🇮🇳" },
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", flag: "🇬🇧" },
  { code: "AED", symbol: "AED", name: "UAE Dirham", locale: "en-AE", flag: "🇦🇪" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", locale: "en-CA", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP", flag: "🇯🇵" },
]

interface CurrencyState {
  currency: string
  setCurrency: (currency: string) => void
  getCurrencyConfig: () => CurrencyConfig
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: "INR", // Default to Indian Rupee (Rupees)
      setCurrency: (currency: string) => set({ currency: currency.toUpperCase() }),
      getCurrencyConfig: () => {
        const current = get().currency
        return (
          SUPPORTED_CURRENCIES.find((c) => c.code === current) ||
          SUPPORTED_CURRENCIES[0]
        )
      },
    }),
    {
      name: "meeo-currency-preference",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
    }
  )
)
