/**
 * @file role-badge.tsx
 * @description Accessible status badge for system RBAC roles.
 */

"use client"

import * as React from "react"
import { ShieldCheck, ShieldAlert, Key, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface RoleBadgeProps {
  role: string
  className?: string
  showIcon?: boolean
}

export function RoleBadge({
  role,
  className,
  showIcon = true,
}: RoleBadgeProps) {
  const normalized = (role || "").toUpperCase()
  const isSuperAdmin = normalized === "SUPER_ADMIN"

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-mono text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 transition-colors",
        isSuperAdmin
          ? "bg-purple-500/15 text-purple-700 border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-300"
          : normalized.includes("ADMIN") || normalized.includes("MANAGER")
          ? "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-300"
          : "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      {showIcon && (
        isSuperAdmin ? (
          <ShieldAlert className="size-3 text-purple-600 dark:text-purple-400" />
        ) : (
          <Key className="size-3 text-indigo-600 dark:text-indigo-400" />
        )
      )}
      <span>{role}</span>
    </Badge>
  )
}
