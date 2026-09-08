/**
 * @file deliver-order-dialog.tsx
 * @description Modal dialog to record delivery completion and recipient proof.
 */

"use client"

import * as React from "react"
import { CheckCheck, Loader2, AlertCircle } from "lucide-react"
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
import { useDeliverOrderMutation } from "@/hooks/use-order-query"
import type { AdminOrder } from "@/types/order"

export interface DeliverOrderDialogProps {
  order: AdminOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeliverOrderDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: DeliverOrderDialogProps) {
  const [receivedBy, setReceivedBy] = React.useState("")
  const [deliveryNotes, setDeliveryNotes] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const deliverMutation = useDeliverOrderMutation()

  React.useEffect(() => {
    if (open) {
      setReceivedBy(order?.address?.recipientName ? `${order.address.recipientName} (Signed)` : "")
      setDeliveryNotes("Delivered to front door / reception")
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
      await deliverMutation.mutateAsync({
        id: order.id,
        payload: {
          receivedBy: receivedBy.trim() || undefined,
          deliveryNotes: deliveryNotes.trim() || undefined,
        },
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to mark order as delivered."
      setError(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCheck className="size-5" />
              <DialogTitle>Mark Order as Delivered</DialogTitle>
            </div>
            <DialogDescription>
              Confirm receipt and record proof of delivery for order{" "}
              <span className="font-mono font-bold text-foreground">
                {order?.orderNumber}
              </span>
              .
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
                Received / Signed By
              </label>
              <Input
                placeholder="e.g. Jane Doe (Signed at door)"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Delivery Notes / Location
              </label>
              <Input
                placeholder="e.g. Left with reception desk / inside porch"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
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
              disabled={deliverMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              disabled={deliverMutation.isPending}
            >
              {deliverMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="size-3.5" />
                  <span>Confirm Delivery</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
