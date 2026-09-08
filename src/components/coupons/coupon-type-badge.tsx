/**
 * @file coupon-type-badge.tsx
 * @description Visual badge representation for Coupon Discount Types (PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING).
 */

"use client"

import * as React from "react"
import { Percent, DollarSign, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CouponType } from "@/types/coupon"

interface CouponTypeBadgeProps {
  type: CouponType | string
  className?: string
}

export function CouponTypeBadge({ type, className }: CouponTypeBadgeProps) {
  const normalized = (type || "").toUpperCase() as CouponType

  const config: Record<
    CouponType,
    {
      label: string
      bg: string
      text: string
      border: string
      icon: React.ComponentType<{ className?: string }>
    }
  > = {
    PERCENTAGE: {
      label: "Percentage",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      text: "text-indigo-700 dark:text-indigo-300",
      border: "border-indigo-500/30",
      icon: Percent,
    },
    FIXED_AMOUNT: {
      label: "Fixed Discount",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/30",
      icon: DollarSign,
    },
    FREE_SHIPPING: {
      label: "Free Shipping",
      bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
      text: "text-cyan-700 dark:text-cyan-300",
      border: "border-cyan-500/30",
      icon: Truck,
    },
  }

  const current = config[normalized] || {
    label: normalized || "Discount",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    icon: DollarSign,
  }

  const IconComponent = current.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border",
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      <IconComponent className="h-3 w-3" />
      {current.label}
    </span>
  )
}
