/**
 * @file page-header.tsx
 * @description Standardized top header bar for dashboard pages.
 * Follows Open/Closed Principle (OCP) via composable slots for actions and badges.
 */

"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface PageHeaderAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
  className?: string
  href?: string
}

export interface PageHeaderProps {
  /** Page primary heading */
  title: string
  /** Optional badge text or ReactNode adjacent to title */
  badge?: string | React.ReactNode
  /** Badge color styling variant */
  badgeVariant?: "brand" | "default" | "secondary" | "outline" | "success" | "warning"
  /** Subtitle description explaining page context */
  description?: string | React.ReactNode
  /** Right-hand side custom action elements or controls */
  children?: React.ReactNode
  /** Optional cache / last-synced timestamp text */
  cacheStatus?: string
  /** Container custom classes */
  className?: string
}

export function PageHeader({
  title,
  badge,
  badgeVariant = "brand",
  description,
  children,
  cacheStatus,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-3 border-b border-border/40 pb-4 lg:flex-row lg:items-center",
        className
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>

          {badge && typeof badge === "string" ? (
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-[10px] font-semibold uppercase tracking-wider",
                badgeVariant === "brand" &&
                  "border-indigo-200/80 bg-indigo-50/70 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300",
                badgeVariant === "success" &&
                  "border-emerald-200/80 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
                badgeVariant === "warning" &&
                  "border-amber-200/80 bg-amber-50/70 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
              )}
            >
              {badge}
            </Badge>
          ) : (
            badge
          )}
        </div>

        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {children}

        {cacheStatus && (
          <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{cacheStatus}</span>
          </div>
        )}
      </div>
    </div>
  )
}
