/**
 * @file notification-channel-badge.tsx
 * @description Visual badge for notification delivery channels (EMAIL, PUSH, IN_APP).
 */

"use client"

import * as React from "react"
import { Mail, Bell, Smartphone, AppWindow } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationChannel } from "@/types/notification"

interface NotificationChannelBadgeProps {
  channel: NotificationChannel | string
  className?: string
}

export function NotificationChannelBadge({
  channel,
  className,
}: NotificationChannelBadgeProps) {
  const normalized = (channel || "").toUpperCase() as NotificationChannel

  const config: Record<
    NotificationChannel,
    {
      label: string
      bg: string
      text: string
      border: string
      icon: React.ComponentType<{ className?: string }>
    }
  > = {
    EMAIL: {
      label: "Email",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-500/30",
      icon: Mail,
    },
    PUSH: {
      label: "Mobile Push",
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-500/30",
      icon: Smartphone,
    },
    IN_APP: {
      label: "In-App Feed",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/30",
      icon: Bell,
    },
  }

  const current = config[normalized] || {
    label: normalized || "Channel",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    icon: Mail,
  }

  const IconComp = current.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border",
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
