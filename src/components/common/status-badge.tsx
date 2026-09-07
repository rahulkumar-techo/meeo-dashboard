/**
 * @file status-badge.tsx
 * @description Centralized polymorphic Status Badge with status-to-color mapping, icons, and pulse dots.
 * Follows Single Responsibility (SRP) and Open/Closed (OCP) principles.
 */

"use client"

import * as React from "react"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  Ban,
  Radio,
  Truck,
  Package,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type BadgeTone =
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "brand"
  | "secondary"
  | "neutral"

export interface StatusConfig {
  label: string
  tone: BadgeTone
  icon?: React.ComponentType<{ className?: string }>
  pulse?: boolean
}

// Universal status configurations
const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Positive / Succeeded
  active: { label: "Active", tone: "success", icon: CheckCircle2, pulse: true },
  paid: { label: "Paid", tone: "success", icon: CheckCircle2 },
  succeeded: { label: "Succeeded", tone: "success", icon: CheckCircle2 },
  delivered: { label: "Delivered", tone: "success", icon: Package },
  completed: { label: "Completed", tone: "success", icon: CheckCircle2 },
  in_stock: { label: "In Stock", tone: "success", icon: CheckCircle2 },
  healthy: { label: "Healthy", tone: "success", icon: CheckCircle2 },
  published: { label: "Published", tone: "success", icon: CheckCircle2 },

  // In Progress / Info / Brand
  processing: { label: "Processing", tone: "info", icon: RotateCcw, pulse: true },
  running: { label: "Running", tone: "info", icon: Play, pulse: true },
  shipped: { label: "Shipped", tone: "brand", icon: Truck },
  queued: { label: "Queued", tone: "info", icon: Clock },
  scheduled: { label: "Scheduled", tone: "info", icon: Clock },
  pending: { label: "Pending", tone: "warning", icon: Clock, pulse: true },

  // Warnings / Retries / Low
  low_stock: { label: "Low Stock", tone: "warning", icon: AlertTriangle },
  retrying: { label: "Retrying", tone: "warning", icon: RotateCcw, pulse: true },
  degraded: { label: "Degraded", tone: "warning", icon: AlertTriangle },
  paused: { label: "Paused", tone: "warning", icon: Pause },
  partially_refunded: { label: "Partial Refund", tone: "warning", icon: RotateCcw },

  // Destructive / Errors
  failed: { label: "Failed", tone: "destructive", icon: XCircle },
  dead: { label: "Dead Letter", tone: "destructive", icon: Ban },
  cancelled: { label: "Cancelled", tone: "destructive", icon: Ban },
  refunded: { label: "Refunded", tone: "destructive", icon: RotateCcw },
  out_of_stock: { label: "Out of Stock", tone: "destructive", icon: AlertTriangle },
  expired: { label: "Expired", tone: "secondary", icon: Clock },

  // Neutral / Secondary
  draft: { label: "Draft", tone: "secondary", icon: Clock },
  inactive: { label: "Inactive", tone: "secondary", icon: Pause },
  archived: { label: "Archived", tone: "secondary", icon: Ban },
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  success:
    "border-emerald-200/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  warning:
    "border-amber-200/80 bg-amber-50/80 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  destructive:
    "border-rose-200/80 bg-rose-50/80 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300",
  info:
    "border-cyan-200/80 bg-cyan-50/80 text-cyan-700 dark:border-cyan-900/50 dark:bg-cyan-950/40 dark:text-cyan-300",
  brand:
    "border-indigo-200/80 bg-indigo-50/80 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300",
  secondary:
    "border-border bg-muted/60 text-muted-foreground dark:border-border dark:bg-muted/40",
  neutral:
    "border-border bg-background text-foreground",
}

const DOT_CLASSES: Record<BadgeTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-rose-500",
  info: "bg-cyan-500",
  brand: "bg-indigo-500",
  secondary: "bg-slate-400",
  neutral: "bg-foreground",
}

export interface StatusBadgeProps {
  /** The status key (e.g. 'active', 'failed', 'shipped') or custom string */
  status: string
  /** Override label */
  label?: string
  /** Override tone */
  tone?: BadgeTone
  /** Whether to show status icon */
  showIcon?: boolean
  /** Whether to show a pulse dot */
  showDot?: boolean
  /** Custom sizing */
  size?: "sm" | "md"
  /** Custom class */
  className?: string
}

export function StatusBadge({
  status,
  label,
  tone,
  showIcon = true,
  showDot = false,
  size = "sm",
  className,
}: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase().replace(/[\s-]+/g, "_")
  const config = STATUS_CONFIGS[normalizedKey]

  const displayTone = tone || config?.tone || "secondary"
  const displayLabel = label || config?.label || status
  const Icon = config?.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium transition-colors",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        TONE_CLASSES[displayTone],
        className
      )}
    >
      {showDot && (
        <span className="relative flex size-1.5">
          {config?.pulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                DOT_CLASSES[displayTone]
              )}
            />
          )}
          <span
            className={cn("relative inline-flex size-1.5 rounded-full", DOT_CLASSES[displayTone])}
          />
        </span>
      )}

      {showIcon && Icon && <Icon className="size-3" />}

      <span>{displayLabel}</span>
    </Badge>
  )
}
