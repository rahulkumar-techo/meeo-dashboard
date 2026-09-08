/**
 * @file cancel-order-dialog.tsx
 * @description Modal dialog for cancelling an order and restoring held inventory back to available stock.
 */

"use client"

import * as React from "react"
import { XCircle, Loader2, AlertTriangle, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCancelOrderMutation } from "@/hooks/use-order-query"
import type { AdminOrder } from "@/types/order"

export interface CancelOrderDialogProps {
  order: AdminOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CancelOrderDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: CancelOrderDialogProps) {
  const [reason, setReason] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const cancelMutation = useCancelOrderMutation()

  React.useEffect(() => {
    if (open) {
      setReason("")
      setError(null)
    }
  }, [open, order])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order?.id) {
      setError("No order selected.")
      return
    }

    try {
      setError(null)
      await cancelMutation.mutateAsync({
        id: order.id,
        payload: {
          reason: reason.trim() || undefined,
        },
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to cancel order."
      setError(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600">
              <XCircle className="size-5" />
              <DialogTitle>Cancel Order & Release Inventory</DialogTitle>
            </div>
            <DialogDescription>
              Cancelling order{" "}
              <span className="font-mono font-bold text-foreground">
                {order?.orderNumber}
              </span>{" "}
              will permanently move it to <span className="font-semibold text-rose-600">CANCELLED</span> status and automatically restore all reserved inventory units back to warehouse stock.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>
                This action is terminal. Ensure customer is notified before proceeding with cancellation.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Cancellation Reason / Audit Note
              </label>
              <Input
                placeholder="e.g. Customer requested cancellation / Fraud check triggered"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={cancelMutation.isPending}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              className="gap-1.5 font-medium"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <XCircle className="size-3.5" />
                  <span>Confirm Cancellation</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
