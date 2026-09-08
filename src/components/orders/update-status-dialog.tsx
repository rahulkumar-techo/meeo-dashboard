/**
 * @file update-status-dialog.tsx
 * @description Modal dialog for manual order lifecycle state transitions with audit reason logging.
 */

"use client"

import * as React from "react"
import { SlidersHorizontal, Loader2, AlertCircle } from "lucide-react"
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
import { useUpdateOrderStatusMutation } from "@/hooks/use-order-query"
import type { AdminOrder, OrderStatus } from "@/types/order"

export interface UpdateStatusDialogProps {
  order: AdminOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAYMENT_PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
]

export function UpdateStatusDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: UpdateStatusDialogProps) {
  const [status, setStatus] = React.useState<OrderStatus>("PROCESSING")
  const [reason, setReason] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const updateMutation = useUpdateOrderStatusMutation()

  React.useEffect(() => {
    if (open && order) {
      setStatus(order.status)
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
      await updateMutation.mutateAsync({
        id: order.id,
        payload: {
          status,
          reason: reason.trim() || undefined,
        },
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update status."
      setError(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-indigo-600">
              <SlidersHorizontal className="size-5" />
              <DialogTitle>Manual Status Transition</DialogTitle>
            </div>
            <DialogDescription>
              Directly transition order{" "}
              <span className="font-mono font-bold text-foreground">
                {order?.orderNumber}
              </span>{" "}
              within the state machine with an audit log reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Target Status State <span className="text-destructive">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden font-semibold"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Audit Reason / Notes
              </label>
              <Input
                placeholder="e.g. Stripe refund issued / Manual customer resolution"
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
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="size-3.5" />
                  <span>Apply Transition</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
