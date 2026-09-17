/**
 * @file currency-selector.tsx
 * @description Currency badge displaying the active platform currency (INR - ₹).
 */

"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface CurrencySelectorProps {
  className?: string
  variant?: "header" | "compact" | "select"
  showFlag?: boolean
  showName?: boolean
}

export function CurrencySelector({
  className,
  showFlag = true,
  showName = false,
}: CurrencySelectorProps) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md border border-border/70 bg-muted/40 px-2.5 text-xs font-medium text-foreground",
        className
      )}
    >
      {showFlag && <span className="text-xs">🇮🇳</span>}
      <span className="font-mono font-bold text-foreground">₹ INR</span>
      {showName && (
        <span className="hidden md:inline text-muted-foreground text-[11px]">
          Indian Rupee
        </span>
      )}
    </div>
  )
}
