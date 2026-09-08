/**
 * @file coupon-status-badge.tsx
 * @description Status indicator badge for Coupon states (ACTIVE, INACTIVE, EXPIRED).
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { CouponStatus } from "@/types/coupon"

interface CouponStatusBadgeProps {
  status: CouponStatus | string
  className?: string
  showDot?: boolean
}

export function CouponStatusBadge({
  status,
  className,
  showDot = true,
}: CouponStatusBadgeProps) {
  const normalized = (status || "").toUpperCase() as CouponStatus

  const config: Record<
    CouponStatus,
    {
      label: string
      bg: string
      text: string
      border: string
      dotBg: string
      pulse?: boolean
    }
  > = {
    ACTIVE: {
      label: "Active",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/30",
      dotBg: "bg-emerald-500",
      pulse: true,
    },
    INACTIVE: {
      label: "Paused",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/30",
      dotBg: "bg-amber-500",
    },
    EXPIRED: {
      label: "Expired",
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-500/30",
      dotBg: "bg-rose-500",
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
