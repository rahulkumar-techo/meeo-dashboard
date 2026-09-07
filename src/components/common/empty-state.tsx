/**
 * @file empty-state.tsx
 * @description Standardized empty state indicator with icons, explanatory copy, and action buttons.
 * Follows Single Responsibility Principle (SRP) for empty view presentation.
 */

"use client"

import * as React from "react"
import { Search, FolderOpen, Plus, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon | React.ComponentType<{ className?: string }>
  /** Headline text */
  title: string
  /** Explanatory message */
  description: string
  /** Primary action label */
  actionLabel?: string
  /** Primary action handler */
  onAction?: () => void
  /** Optional secondary action */
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  /** Custom children for extra content */
  children?: React.ReactNode
  /** Container custom classes */
  className?: string
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-card/40 p-8 text-center sm:p-12",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground ring-8 ring-muted/20">
        <Icon className="size-6" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-foreground sm:text-base">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-xs text-muted-foreground sm:text-sm">
        {description}
      </p>

      {(actionLabel || secondaryAction || children) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button size="sm" onClick={onAction} className="h-8.5 text-xs font-medium">
              <Plus className="mr-1.5 size-3.5" />
              {actionLabel}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
              className="h-8.5 text-xs font-medium"
            >
              {secondaryAction.label}
            </Button>
          )}

          {children}
        </div>
      )}
    </div>
  )
}
