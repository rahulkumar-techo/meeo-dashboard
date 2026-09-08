/**
 * @file outbox-status-badge.tsx
 * @description Status indicator badge for Outbox Events (PUBLISHED, PENDING, PROCESSING, FAILED).
 */

"use client"

import * as React from "react"
import { CheckCircle2, Clock, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OutboxEventStatus } from "@/types/outbox"

interface OutboxStatusBadgeProps {
  status: OutboxEventStatus | string
  className?: string
  showDot?: boolean
}

export function OutboxStatusBadge({
  status,
  className,
  showDot = true,
}: OutboxStatusBadgeProps) {
  const normalized = (status || "").toUpperCase() as OutboxEventStatus

  const config: Record<
    OutboxEventStatus,
    {
      label: string
      bg: string
      text: string
      border: string
      dotBg: string
      pulse?: boolean
    }
  > = {
    PUBLISHED: {
      label: "Published",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/30",
      dotBg: "bg-emerald-500",
    },
    PENDING: {
      label: "Pending",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/30",
      dotBg: "bg-amber-500",
    },
    PROCESSING: {
      label: "Processing",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      text: "text-indigo-700 dark:text-indigo-300",
      border: "border-indigo-500/30",
      dotBg: "bg-indigo-500",
      pulse: true,
    },
    FAILED: {
      label: "Failed / DLQ",
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
