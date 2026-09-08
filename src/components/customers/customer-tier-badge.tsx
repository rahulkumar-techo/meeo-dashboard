/**
 * @file customer-tier-badge.tsx
 * @description Visual badge component for Customer VIP Loyalty Tiers (Bronze, Silver, Gold, Platinum).
 */

"use client"

import * as React from "react"
import { Crown, Sparkles, Award, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { LoyaltyTier } from "@/types/customer"

export interface CustomerTierBadgeProps {
  tier?: LoyaltyTier | string
  className?: string
}

export function CustomerTierBadge({
  tier = "BRONZE",
  className,
}: CustomerTierBadgeProps) {
  const normalized = (tier || "BRONZE").toUpperCase() as LoyaltyTier

  switch (normalized) {
    case "PLATINUM":
      return (
        <Badge
          variant="outline"
          className={`bg-indigo-950 text-indigo-200 border-indigo-500/50 shadow-xs gap-1 font-bold text-[10px] tracking-wide uppercase ${className}`}
        >
          <Crown className="size-3 text-indigo-400 fill-indigo-400" />
          <span>PLATINUM VIP</span>
        </Badge>
      )
    case "GOLD":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/50 gap-1 font-bold text-[10px] tracking-wide uppercase ${className}`}
        >
          <Sparkles className="size-3 text-amber-500 fill-amber-500" />
          <span>GOLD VIP</span>
        </Badge>
      )
    case "SILVER":
      return (
        <Badge
          variant="outline"
          className={`bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/50 gap-1 font-semibold text-[10px] tracking-wide uppercase ${className}`}
        >
          <Award className="size-3 text-slate-400" />
          <span>SILVER</span>
        </Badge>
      )
    case "BRONZE":
    default:
      return (
        <Badge
          variant="outline"
          className={`bg-amber-900/10 text-amber-800 dark:text-amber-300 border-amber-700/30 gap-1 font-medium text-[10px] uppercase ${className}`}
        >
          <Shield className="size-3 text-amber-700 dark:text-amber-400" />
          <span>BRONZE</span>
        </Badge>
      )
  }
}
