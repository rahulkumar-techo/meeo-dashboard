/**
 * @file currency.store.ts
 * @description Persistent Zustand store locked to Indian Rupee (INR - ₹).
 * Single currency standard: Indian Rupee (₹).
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
      currency: "INR",
      setCurrency: (_currency: string) => set({ currency: "INR" }),
      getCurrencyConfig: () => SUPPORTED_CURRENCIES[0],
    }),
    {
      name: "meeo-currency-preference",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
    }
  )
)
