/**
 * @file currency-selector.tsx
 * @description Global interactive currency picker dropdown component with flag icons and currency symbols.
 * Defaults to INR (Indian Rupees - ₹).
 */

"use client"

import * as React from "react"
import { Check, Coins, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrencyStore, SUPPORTED_CURRENCIES, type CurrencyConfig } from "@/store/currency.store"
import { cn } from "@/lib/utils"

export interface CurrencySelectorProps {
  className?: string
  variant?: "header" | "compact" | "select"
  showFlag?: boolean
  showName?: boolean
  onCurrencyChange?: (currency: CurrencyConfig) => void
}

export function CurrencySelector({
  className,
  variant = "header",
  showFlag = true,
  showName = false,
  onCurrencyChange,
}: CurrencySelectorProps) {
  const { currency, setCurrency, getCurrencyConfig } = useCurrencyStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentConfig = mounted
    ? getCurrencyConfig()
    : (SUPPORTED_CURRENCIES.find((c) => c.code === "INR") || SUPPORTED_CURRENCIES[0])

  const handleSelect = (curr: CurrencyConfig) => {
    setCurrency(curr.code)
    onCurrencyChange?.(curr)
  }

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md border border-border/80 bg-background px-2 text-xs font-mono font-semibold text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-hidden",
            className
          )}
        >
          {showFlag && <span className="text-sm leading-none">{currentConfig.flag}</span>}
          <span>{currentConfig.symbol} {currentConfig.code}</span>
          <ChevronDown className="size-3 text-muted-foreground ml-0.5 opacity-60" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52 p-1">
          <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground px-2 py-1">
            Display Currency
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="-mx-1 my-1" />
          {SUPPORTED_CURRENCIES.map((curr) => {
            const isSelected = curr.code === currentConfig.code
            return (
              <DropdownMenuItem
                key={curr.code}
                onClick={() => handleSelect(curr)}
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 text-xs font-medium cursor-pointer rounded-md",
                  isSelected && "bg-accent font-bold text-accent-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{curr.flag}</span>
                  <span className="font-mono font-bold text-primary">{curr.symbol}</span>
                  <span className="font-semibold">{curr.code}</span>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    ({curr.name})
                  </span>
                </div>
                {isSelected && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md border border-border/70 bg-muted/40 px-2 text-xs font-medium text-foreground transition-all hover:bg-muted/80 hover:border-border focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
          className
        )}
        aria-label="Change currency"
      >
        <span className="text-xs">{currentConfig.flag}</span>
        <span className="font-mono font-bold text-foreground">
          {currentConfig.symbol} {currentConfig.code}
        </span>
        {showName && (
          <span className="hidden md:inline text-muted-foreground text-[11px]">
            {currentConfig.name}
          </span>
        )}
        <ChevronDown className="size-3 text-muted-foreground opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg">
        <DropdownMenuLabel className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-2 py-1">
          <span className="flex items-center gap-1.5">
            <Coins className="size-3 text-primary" />
            <span>Display Currency</span>
          </span>
          <span className="font-mono text-[10px] text-primary">Default: INR (₹)</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="-mx-1 my-1" />

        <div className="max-h-64 overflow-y-auto space-y-0.5">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const isSelected = curr.code === currentConfig.code
            return (
              <DropdownMenuItem
                key={curr.code}
                onClick={() => handleSelect(curr)}
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md transition-colors",
                  isSelected
                    ? "bg-primary/10 text-primary font-bold border border-primary/20"
                    : "hover:bg-muted/80"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{curr.flag}</span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold">{curr.symbol}</span>
                      <span>{curr.code}</span>
                      {curr.code === "INR" && (
                        <span className="text-[9.5px] rounded bg-emerald-500/10 text-emerald-600 px-1 py-0 font-sans font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-[10.5px] text-muted-foreground font-normal">
                      {curr.name}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
