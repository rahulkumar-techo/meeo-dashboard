/**
 * @file audit-action-badge.tsx
 * @description Color-coded status badge for Audit Log action taxonomies.
 */

"use client"

import * as React from "react"
import {
  ShieldAlert,
  UserCheck,
  RefreshCw,
  Sliders,
  DollarSign,
  Layers,
  Tag,
  Key,
  Flame,
  Activity,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface AuditActionBadgeProps {
  action: string
  className?: string
  showIcon?: boolean
}

export function AuditActionBadge({
  action,
  className,
  showIcon = true,
}: AuditActionBadgeProps) {
  const normalized = (action || "").toUpperCase()

  let colorClasses =
    "bg-zinc-500/10 text-zinc-700 border-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-300"
  let Icon = Activity

  if (normalized.includes("ROLE") || normalized.includes("PERMISSION")) {
    colorClasses =
      "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-300"
    Icon = Key
  } else if (
    normalized.includes("REFUND") ||
    normalized.includes("PAYMENT") ||
    normalized.includes("RECONCILE")
  ) {
    colorClasses =
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300"
    Icon = DollarSign
  } else if (
    normalized.includes("SUSPEND") ||
    normalized.includes("BLOCK") ||
    normalized.includes("DELETE") ||
    normalized.includes("CANCEL")
  ) {
    colorClasses =
      "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300"
    Icon = ShieldAlert
  } else if (
    normalized.includes("STOCK") ||
    normalized.includes("INVENTORY") ||
    normalized.includes("THRESHOLD")
  ) {
    colorClasses =
      "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300"
    Icon = Sliders
  } else if (normalized.includes("ORDER")) {
    colorClasses =
      "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-300"
    Icon = Layers
  } else if (normalized.includes("COUPON")) {
    colorClasses =
      "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-300"
    Icon = Tag
  } else if (normalized.includes("USER")) {
    colorClasses =
      "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300"
    Icon = UserCheck
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-mono text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5",
        colorClasses,
        className
      )}
    >
      {showIcon && <Icon className="size-3" />}
      <span>{action}</span>
    </Badge>
  )
}
