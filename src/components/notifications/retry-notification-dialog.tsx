/**
 * @file retry-notification-dialog.tsx
 * @description Modal dialog for inspecting delivery error details and re-attempting failed notification deliveries.
 */

"use client"

import * as React from "react"
import { RotateCcw, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRetryNotificationMutation } from "@/hooks/use-notification-query"
import { NotificationChannelBadge } from "./notification-channel-badge"
import { NotificationStatusBadge } from "./notification-status-badge"
import type { NotificationLogItem } from "@/types/notification"

interface RetryNotificationDialogProps {
  item: NotificationLogItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RetryNotificationDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: RetryNotificationDialogProps) {
  const retryMutation = useRetryNotificationMutation()
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) setErrorMsg(null)
  }, [open])

  if (!item) return null

  const handleRetry = async () => {
    setErrorMsg(null)
    try {
      await retryMutation.mutateAsync(item.id)
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to retry notification delivery."
      setErrorMsg(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base">
                Retry Notification Delivery
              </DialogTitle>
              <DialogDescription className="text-xs">
                Re-dispatch failed message across gateway driver.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMsg && (
          <div className="my-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3 py-3 text-xs">
          <div className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Notification ID:</span>
              <span className="font-mono font-medium text-foreground">
                {item.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Channel:</span>
              <NotificationChannelBadge channel={item.channel} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Delivery Status:</span>
              <NotificationStatusBadge status={item.status} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Prior Attempts:</span>
              <span className="font-mono font-semibold text-foreground">
                {item.attempts} attempts
              </span>
            </div>
          </div>

          {/* Last Error Message */}
          {item.lastError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 space-y-1">
              <div className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="size-3.5" />
                <span>Last Gateway Error</span>
              </div>
              <div className="font-mono text-[11px] text-rose-900 dark:text-rose-200">
                {item.lastError}
              </div>
            </div>
          )}

          <div className="rounded-md border border-indigo-500/20 bg-indigo-500/5 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
            This will trigger <code className="text-[11px]">POST /api/v1/notifications/{item.id}/retry</code>, re-verifying recipient preference opt-ins before gateway dispatch.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleRetry}
            disabled={retryMutation.isPending}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            {retryMutation.isPending ? (
              <>Retrying Delivery...</>
            ) : (
              <>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Retry Delivery Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
