/**
 * @file ship-order-dialog.tsx
 * @description Modal dialog for attaching logistics carrier and tracking AWB to transition order to SHIPPED.
 */

"use client"

import * as React from "react"
import { Truck, Loader2, AlertCircle, ExternalLink, Calendar } from "lucide-react"
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
import { useShipOrderMutation } from "@/hooks/use-order-query"
import type { AdminOrder } from "@/types/order"

export interface ShipOrderDialogProps {
  order: AdminOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const POPULAR_CARRIERS = [
  "FedEx",
  "UPS",
  "DHL Express",
  "USPS",
  "BlueDart",
  "Delhivery",
  "Shiprocket",
  "Other",
]

export function ShipOrderDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: ShipOrderDialogProps) {
  const [carrier, setCarrier] = React.useState("FedEx")
  const [trackingNumber, setTrackingNumber] = React.useState("")
  const [trackingUrl, setTrackingUrl] = React.useState("")
  const [estimatedDeliveryAt, setEstimatedDeliveryAt] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const shipMutation = useShipOrderMutation()

  React.useEffect(() => {
    if (open) {
      setCarrier("FedEx")
      setTrackingNumber("")
      setTrackingUrl("")
      setEstimatedDeliveryAt("")
      setNotes("")
      setError(null)
    }
  }, [open, order])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order?.id) {
      setError("No order selected.")
      return
    }

    if (!trackingNumber.trim()) {
      setError("Tracking number is required.")
      return
    }

    try {
      setError(null)
      await shipMutation.mutateAsync({
        id: order.id,
        payload: {
          carrier,
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim() || undefined,
          estimatedDeliveryAt: estimatedDeliveryAt
            ? new Date(estimatedDeliveryAt).toISOString()
            : undefined,
          notes: notes.trim() || undefined,
        },
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to ship order. Please try again."
      setError(msg)
    }
  }

  const recipientName = order?.address?.recipientName || order?.user?.email || "Customer"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-cyan-600">
              <Truck className="size-5" />
              <DialogTitle>Dispatch & Ship Order</DialogTitle>
            </div>
            <DialogDescription>
              Attach courier logistics details and tracking AWB to notify customer and update fulfillment status to{" "}
              <span className="font-semibold text-foreground">SHIPPED</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Order Summary Banner */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs border border-border/60">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-foreground">
                  {order?.orderNumber}
                </span>
                <span className="text-muted-foreground">{recipientName}</span>
              </div>
              {order?.address && (
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                  {order.address.addressLine1}, {order.address.city}, {order.address.state} {order.address.postalCode}
                </p>
              )}
            </div>

            {/* Carrier & Tracking Number */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Courier Carrier <span className="text-destructive">*</span>
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
                >
                  {POPULAR_CARRIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Tracking / AWB # <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. FDX-9988776655"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                  className="h-9 font-mono text-xs"
                />
              </div>
            </div>

            {/* Tracking URL */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Tracking URL (Optional)
              </label>
              <Input
                placeholder="https://www.fedex.com/fedextrack/?trknbr=..."
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Estimated Delivery Date */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Estimated Delivery Date
              </label>
              <Input
                type="date"
                value={estimatedDeliveryAt}
                onChange={(e) => setEstimatedDeliveryAt(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Dispatch Notes */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Dispatch Notes
              </label>
              <Input
                placeholder="e.g. Dispatched from East Distribution Center"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
              disabled={shipMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
              disabled={shipMutation.isPending || !trackingNumber}
            >
              {shipMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Truck className="size-3.5" />
                  <span>Mark as Shipped</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
