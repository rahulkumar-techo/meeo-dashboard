/**
 * @file job-status-badge.tsx
 * @description Accessible status badge for background job lifecycle states.
 */

"use client"

import * as React from "react"
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Ban,
  PauseCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { JobStatus } from "@/types/job"

export interface JobStatusBadgeProps {
  status: JobStatus | string
  className?: string
  showIcon?: boolean
}

export function JobStatusBadge({
  status,
  className,
  showIcon = true,
}: JobStatusBadgeProps) {
  const normalized = (status || "").toUpperCase()

  let colorClasses =
    "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-400"
  let label = status
  let Icon = Clock

  switch (normalized) {
    case "ACTIVE":
    case "RUNNING":
    case "PROCESSING":
      colorClasses =
        "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-300"
      label = "ACTIVE"
      Icon = Activity
      break
    case "WAITING":
    case "PENDING":
      colorClasses =
        "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300"
      label = "WAITING"
      Icon = Clock
      break
    case "DELAYED":
      colorClasses =
        "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-300"
      label = "DELAYED"
      Icon = Clock
      break
    case "COMPLETED":
    case "SUCCESS":
    case "PUBLISHED":
      colorClasses =
        "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300"
      label = "COMPLETED"
      Icon = CheckCircle2
      break
    case "FAILED":
      colorClasses =
        "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300"
      label = "FAILED"
      Icon = AlertTriangle
      break
    case "DEAD_LETTER":
    case "DEAD-LETTER":
      colorClasses =
        "bg-red-950/20 text-red-600 border-red-500/30 dark:bg-red-950/40 dark:text-red-400"
      label = "DEAD LETTER"
      Icon = Flame
      break
    case "CANCELLED":
    case "DISCARDED":
      colorClasses =
        "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-400"
      label = "CANCELLED"
      Icon = Ban
      break
    case "PAUSED":
      colorClasses =
        "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:bg-orange-500/15 dark:text-orange-300"
      label = "PAUSED"
      Icon = PauseCircle
      break
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase transition-colors",
        colorClasses,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            "size-3",
            normalized === "ACTIVE" || normalized === "RUNNING"
              ? "animate-spin"
              : ""
          )}
        />
      )}
      <span>{label}</span>
    </Badge>
  )
}
