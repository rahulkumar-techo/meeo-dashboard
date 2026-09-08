/**
 * @file reserve-stock-dialog.tsx
 * @description Modal dialog to manually hold stock units for customer checkout with TTL expiration.
 * Shifts stock from available to reserved status and logs an ORDER_RESERVED transaction.
 */

"use client"

import * as React from "react"
import { Clock, Loader2, BookmarkPlus, AlertCircle } from "lucide-react"
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
import { useReserveStockMutation } from "@/hooks/use-inventory-query"
import type { InventoryRecord } from "@/types/inventory"

export interface ReserveStockDialogProps {
  item: InventoryRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReserveStockDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: ReserveStockDialogProps) {
  const [quantity, setQuantity] = React.useState<number | "">("")
  const [orderId, setOrderId] = React.useState("")
  const [expiresInMinutes, setExpiresInMinutes] = React.useState<number | "">(15)
  const [error, setError] = React.useState<string | null>(null)

  const reserveMutation = useReserveStockMutation()

  React.useEffect(() => {
    if (open) {
      setQuantity("")
      setOrderId(`ORD-${Date.now().toString().slice(-6)}`)
      setExpiresInMinutes(15)
      setError(null)
    }
  }, [open, item])

  const availableQuantity = item?.availableQuantity ?? 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item?.variantId) {
      setError("No variant selected.")
      return
    }

    const qtyNumber = Number(quantity)
    if (!qtyNumber || qtyNumber < 1) {
      setError("Please specify a valid quantity of at least 1 unit.")
      return
    }

    if (qtyNumber > availableQuantity) {
      setError(
        `Cannot hold ${qtyNumber} units. Only ${availableQuantity} units are currently available.`
      )
      return
    }

    try {
      setError(null)
      await reserveMutation.mutateAsync({
        variantId: item.variantId,
        quantity: qtyNumber,
        orderId: orderId.trim() || undefined,
        expiresInMinutes: expiresInMinutes === "" ? 15 : Number(expiresInMinutes),
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reserve stock. Please try again."
      setError(msg)
    }
  }

  const productName = item?.variant?.product?.name || "Product Variant"
  const sku = item?.variant?.sku || item?.variantId || "N/A"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-cyan-600">
              <BookmarkPlus className="size-5" />
              <DialogTitle>Reserve Stock for Checkout</DialogTitle>
            </div>
            <DialogDescription>
              Temporarily shift stock from <span className="font-semibold text-foreground">Available</span> to{" "}
              <span className="font-semibold text-foreground">Reserved</span> with automatic TTL expiration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Variant Banner */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs border border-border/60">
              <p className="font-medium text-foreground">{productName}</p>
              <div className="flex items-center gap-3 mt-1 text-muted-foreground font-mono">
                <span>SKU: {sku}</span>
                <span>•</span>
                <span>Available: <b className="text-emerald-600 font-bold">{availableQuantity}</b></span>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center justify-between mb-1.5">
                <span>Hold Quantity <span className="text-destructive">*</span></span>
                <span className="text-[11px] text-muted-foreground font-normal">Max available: {availableQuantity}</span>
              </label>
              <Input
                type="number"
                min={1}
                max={availableQuantity || 1}
                placeholder="e.g. 1"
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value
                  setQuantity(val === "" ? "" : Math.max(1, parseInt(val, 10) || 0))
                }}
                required
                disabled={availableQuantity === 0}
                className="h-9 font-mono text-sm"
              />
            </div>

            {/* Order Reference */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Checkout / Order Reference ID
              </label>
              <Input
                placeholder="e.g. ORD-98214"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>

            {/* TTL Minutes */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Hold Duration TTL (Minutes)
              </label>
              <Input
                type="number"
                min={1}
                max={120}
                placeholder="15"
                value={expiresInMinutes}
                onChange={(e) => {
                  const val = e.target.value
                  setExpiresInMinutes(val === "" ? "" : Math.max(1, parseInt(val, 10) || 15))
                }}
                className="h-9 font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Defaults to 15 mins. Sweeper auto-releases held units if payment is not confirmed.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={reserveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={reserveMutation.isPending || !quantity || availableQuantity === 0}
            >
              {reserveMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Reserving...</span>
                </>
              ) : (
                <>
                  <Clock className="size-3.5" />
                  <span>Create Hold</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
