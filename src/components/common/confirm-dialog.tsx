/**
 * @file confirm-dialog.tsx
 * @description Standardized action confirmation dialog for critical tasks (Refunds, Deletes, Replays, Purges).
 * Follows Single Responsibility Principle (SRP).
 */

"use client"

import * as React from "react"
import { AlertTriangle, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ConfirmDialogProps {
  /** Open state */
  open: boolean
  /** Open change callback */
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title: string
  /** Explanatory message */
  description: string | React.ReactNode
  /** Confirm action button label */
  confirmLabel?: string
  /** Cancel action button label */
  cancelLabel?: string
  /** Severity variant */
  variant?: "destructive" | "default" | "warning"
  /** Confirm callback */
  onConfirm: () => void | Promise<void>
  /** Cancel callback */
  onCancel?: () => void
  /** Loading state during async operations */
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const isDestructive = variant === "destructive"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-full shrink-0",
                isDestructive
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              )}
            >
              {isDestructive ? (
                <AlertTriangle className="size-5" />
              ) : (
                <Info className="size-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (onCancel) onCancel()
              onOpenChange(false)
            }}
            disabled={loading}
            className="h-8.5 text-xs font-medium"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            size="sm"
            onClick={async () => {
              await onConfirm()
              onOpenChange(false)
            }}
            disabled={loading}
            className="h-8.5 text-xs font-medium"
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
