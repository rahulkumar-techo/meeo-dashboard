/**
 * @file bulk-action-dialog.tsx
 * @description Dialog for executing bulk operations across Redis queues.
 * Supports RETRY_ALL_FAILED, PURGE_DEAD_LETTER, PAUSE_QUEUES, and RESUME_QUEUES.
 */

"use client"

import * as React from "react"
import {
  RotateCcw,
  Trash2,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Zap,
} from "lucide-react"
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
import type { BulkJobActionType } from "@/types/job"

export interface BulkActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExecute: (action: BulkJobActionType) => void
  isSubmitting?: boolean
  initialAction?: BulkJobActionType
}

export function BulkActionDialog({
  open,
  onOpenChange,
  onExecute,
  isSubmitting,
  initialAction = "RETRY_ALL_FAILED",
}: BulkActionDialogProps) {
  const [selectedAction, setSelectedAction] =
    React.useState<BulkJobActionType>(initialAction)

  React.useEffect(() => {
    if (open) {
      setSelectedAction(initialAction)
    }
  }, [open, initialAction])

  const isDestructive = selectedAction === "PURGE_DEAD_LETTER"

  const actions: Array<{
    type: BulkJobActionType
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }> = [
    {
      type: "RETRY_ALL_FAILED",
      title: "Retry All Failed Jobs",
      description:
        "Reset attempt counters to 0 and re-enqueue all failed outbox jobs immediately.",
      icon: RotateCcw,
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      type: "PURGE_DEAD_LETTER",
      title: "Purge Dead Letter Queue",
      description:
        "Permanently remove poison pill / exhausted jobs from dead-letter-events.",
      icon: Trash2,
      color: "text-rose-600 dark:text-rose-400",
    },
    {
      type: "PAUSE_QUEUES",
      title: "Pause All Queues",
      description:
        "Halt consumer worker processing across all queues during maintenance or incident triage.",
      icon: PauseCircle,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      type: "RESUME_QUEUES",
      title: "Resume All Queues",
      description: "Resume active job dispatching across worker nodes.",
      icon: PlayCircle,
      color: "text-emerald-600 dark:text-emerald-400",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                isDestructive
                  ? "bg-rose-500/10 text-rose-600"
                  : "bg-indigo-500/10 text-indigo-600"
              )}
            >
              {isDestructive ? (
                <Trash2 className="size-4" />
              ) : (
                <Zap className="size-4" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Execute Bulk Queue Action
              </DialogTitle>
              <DialogDescription className="text-xs">
                Perform administrative batch lifecycle operations on BullMQ Redis queues.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2.5 py-2 text-xs">
          {actions.map((act) => {
            const isSelected = selectedAction === act.type
            const Icon = act.icon

            return (
              <div
                key={act.type}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedAction(act.type)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedAction(act.type)
                  }
                }}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors text-left",
                  isSelected
                    ? act.type === "PURGE_DEAD_LETTER"
                      ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20"
                      : "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 size-4 rounded-full border flex items-center justify-center shrink-0",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40"
                  )}
                >
                  {isSelected && (
                    <div className="size-1.5 rounded-full bg-background" />
                  )}
                </div>

                <div className="space-y-0.5 flex-1">
                  <p
                    className={cn(
                      "font-semibold flex items-center gap-1.5",
                      act.color
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{act.title}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    {act.description}
                  </p>
                </div>
              </div>
            )
          })}

          {isDestructive && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-[11px] text-rose-700 dark:text-rose-300">
              <AlertTriangle className="size-4 shrink-0 text-rose-600" />
              <span>
                Warning: Purging the Dead Letter Queue is irreversible. Discarded jobs cannot be recovered.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant={isDestructive ? "destructive" : "default"}
            disabled={isSubmitting}
            onClick={() => onExecute(selectedAction)}
            className="gap-1.5 font-medium"
          >
            {isSubmitting ? "Executing..." : "Execute Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
