/**
 * @file notification-status-badge.tsx
 * @description Visual delivery status badge for notification items (SENT, FAILED, PENDING).
 */

"use client"

import * as React from "react"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationStatus } from "@/types/notification"

interface NotificationStatusBadgeProps {
  status: NotificationStatus | string
  className?: string
}

export function NotificationStatusBadge({
  status,
  className,
}: NotificationStatusBadgeProps) {
  const normalized = (status || "").toUpperCase() as NotificationStatus

  const config: Record<
    NotificationStatus,
    {
      label: string
      bg: string
      text: string
      border: string
      icon: React.ComponentType<{ className?: string }>
    }
  > = {
    SENT: {
      label: "Delivered",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/30",
      icon: CheckCircle2,
    },
    FAILED: {
      label: "Failed",
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-500/30",
      icon: AlertCircle,
    },
    PENDING: {
      label: "Queued",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/30",
      icon: Clock,
    },
  }

  const current = config[normalized] || {
    label: normalized || "Unknown",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    icon: Clock,
  }

  const IconComp = current.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      <IconComp className="h-3 w-3" />
      {current.label}
    </span>
  )
}
