import { useCurrencyStore, SUPPORTED_CURRENCIES } from "@/store/currency.store"

/**
 * Format a number as a currency string (e.g. ₹1,234.56 or ₹1.2M compact)
 * Defaults to INR (Rupees).
 */
export function formatCurrency(
  amount: number | string,
  options?: {
    currency?: string
    compact?: boolean
    decimals?: number
  }
): string {
  const num = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount

  // Resolve active currency (Option currency > Store currency > "INR")
  let activeCurrencyCode = options?.currency
  if (!activeCurrencyCode && typeof window !== "undefined") {
    try {
      activeCurrencyCode = useCurrencyStore.getState().currency
    } catch {
      activeCurrencyCode = "INR"
    }
  }
  if (!activeCurrencyCode) {
    activeCurrencyCode = "INR"
  }

  const currencyConfig =
    SUPPORTED_CURRENCIES.find(
      (c) => c.code.toUpperCase() === activeCurrencyCode?.toUpperCase()
    ) || {
      code: activeCurrencyCode.toUpperCase(),
      symbol: activeCurrencyCode.toUpperCase() === "INR" ? "₹" : "$",
      locale: activeCurrencyCode.toUpperCase() === "INR" ? "en-IN" : "en-US",
    }

  const symbol = currencyConfig.symbol || "₹"
  if (isNaN(num)) return `${symbol}0.00`

  const { compact = false, decimals = 2 } = options || {}
  const locale =
    currencyConfig.locale ||
    (activeCurrencyCode.toUpperCase() === "INR" ? "en-IN" : "en-US")

  try {
    if (compact) {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyConfig.code,
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(num)
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyConfig.code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  } catch {
    return `${symbol}${num.toFixed(decimals)}`
  }
}

/**
 * Format standard numbers with locale-aware commas or compact notation (e.g. 12,450 or 12.4k)
 */
export function formatNumber(
  value: number | string,
  options?: {
    compact?: boolean
    decimals?: number
  }
): string {
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "0"

  const { compact = false, decimals = 0 } = options || {}

  if (compact) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num)
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format a percentage value (e.g. +14.2% or -3.5%)
 */
export function formatPercentage(
  value: number | string,
  options?: {
    includeSign?: boolean
    decimals?: number
  }
): string {
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "0%"

  const { includeSign = true, decimals = 1 } = options || {}
  const formatted = Math.abs(num).toFixed(decimals)

  if (!includeSign) {
    return `${formatted}%`
  }

  if (num > 0) {
    return `+${formatted}%`
  } else if (num < 0) {
    return `-${formatted}%`
  }
  return `0%`
}

/**
 * Format standard ISO dates or date strings into readable administrative format
 */
export function formatDate(
  dateInput: string | number | Date,
  formatStyle: "short" | "medium" | "long" | "time" | "datetime" = "medium"
): string {
  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return String(dateInput)

    switch (formatStyle) {
      case "short":
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(date)
      case "medium":
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(date)
      case "long":
        return new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(date)
      case "time":
        return new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(date)
      case "datetime":
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date)
      default:
        return date.toLocaleDateString()
    }
  } catch {
    return String(dateInput)
  }
}

/**
 * Format durations in milliseconds or seconds to human-readable strings (e.g. 142ms, 4.2s, 5m 12s)
 */
export function formatDuration(msOrSeconds: number, unit: "ms" | "s" = "ms"): string {
  const ms = unit === "s" ? msOrSeconds * 1000 : msOrSeconds

  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  }
  const totalSeconds = ms / 1000
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`
  }
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = Math.round(totalSeconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}
