/**
 * @file customer-risk-badge.tsx
 * @description Risk score indicator badge displaying score point rating (0-100) and risk level (LOW, MEDIUM, HIGH).
 */

"use client"

import * as React from "react"
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { RiskLevel } from "@/types/customer"

export interface CustomerRiskBadgeProps {
  score?: number
  level?: RiskLevel | string
  actionNeeded?: boolean
  className?: string
}

export function CustomerRiskBadge({
  score = 0,
  level = "LOW",
  actionNeeded = false,
  className,
}: CustomerRiskBadgeProps) {
  const normalizedLevel = (level || (score >= 70 ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW")).toUpperCase()

  if (normalizedLevel === "HIGH" || actionNeeded) {
    return (
      <Badge
        variant="outline"
        className={`bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 gap-1 font-mono text-[10.5px] font-bold ${className}`}
        title="High Fraud / Cancellation Risk. Manual action recommended."
      >
        <ShieldAlert className="size-3 text-rose-600" />
        <span>{score}/100 (HIGH)</span>
      </Badge>
    )
  }

  if (normalizedLevel === "MEDIUM") {
    return (
      <Badge
        variant="outline"
        className={`bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 gap-1 font-mono text-[10.5px] font-semibold ${className}`}
        title="Medium Risk. Monitor checkout payment velocities."
      >
        <AlertTriangle className="size-3 text-amber-600" />
        <span>{score}/100 (MED)</span>
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={`bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 gap-1 font-mono text-[10.5px] font-medium ${className}`}
      title="Low Risk account in good standing."
    >
      <ShieldCheck className="size-3 text-emerald-600" />
      <span>{score}/100 (LOW)</span>
    </Badge>
  )
}
