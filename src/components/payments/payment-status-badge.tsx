/**
 * @file payment-status-badge.tsx
 * @description Visual status indicator badge for Payment states with distinct theme colors and pulsing dot for in-flight operations.
 */

"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PaymentStatus } from "@/types/payment"

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string
  className?: string
  showDot?: boolean
}

export function PaymentStatusBadge({
  status,
  className,
  showDot = true,
}: PaymentStatusBadgeProps) {
  const normalized = (status || "").toUpperCase() as PaymentStatus

  const config: Record<
    PaymentStatus,
    {
      label: string
      bg: string
      text: string
      border: string
      dotBg: string
      pulse?: boolean
    }
  > = {
    SUCCESS: {
      label: "Success",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/30",
      dotBg: "bg-emerald-500",
    },
    PROCESSING: {
      label: "Processing",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/30",
      dotBg: "bg-amber-500",
      pulse: true,
    },
    REQUIRES_ACTION: {
      label: "Requires 3DS",
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-500/30",
      dotBg: "bg-purple-500",
      pulse: true,
    },
    PENDING: {
      label: "Pending",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-500/30",
      dotBg: "bg-blue-500",
    },
    FAILED: {
      label: "Failed",
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-500/30",
      dotBg: "bg-rose-500",
    },
    CANCELLED: {
      label: "Cancelled",
      bg: "bg-zinc-500/10 dark:bg-zinc-500/20",
      text: "text-zinc-700 dark:text-zinc-300",
      border: "border-zinc-500/30",
      dotBg: "bg-zinc-500",
    },
    PARTIALLY_REFUNDED: {
      label: "Partially Refunded",
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-500/30",
      dotBg: "bg-orange-500",
    },
    REFUNDED: {
      label: "Refunded",
      bg: "bg-slate-500/10 dark:bg-slate-500/20",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-500/30",
      dotBg: "bg-slate-500",
    },
  }

  const current = config[normalized] || {
    label: normalized || "Unknown",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    dotBg: "bg-muted-foreground",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all",
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {current.pulse && (
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                current.dotBg
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              current.dotBg
            )}
          />
        </span>
      )}
      {current.label}
    </span>
  )
}
