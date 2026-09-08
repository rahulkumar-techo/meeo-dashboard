/**
 * @file adjust-stock-dialog.tsx
 * @description Modal dialog for physical stock audit reconciliation and reorder alert threshold adjustment.
 * Logs a MANUAL_ADJUSTMENT transaction with positive/negative quantity delta.
 */

"use client"

import * as React from "react"
import { SlidersHorizontal, Loader2, RefreshCw, AlertCircle, ShieldAlert } from "lucide-react"
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
import { useAdjustInventoryMutation } from "@/hooks/use-inventory-query"
import type { InventoryRecord } from "@/types/inventory"

export interface AdjustStockDialogProps {
  item: InventoryRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AdjustStockDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: AdjustStockDialogProps) {
  const [availableQuantity, setAvailableQuantity] = React.useState<number | "">("")
  const [reorderLevel, setReorderLevel] = React.useState<number | "">("")
  const [note, setNote] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const adjustMutation = useAdjustInventoryMutation()

  React.useEffect(() => {
    if (open && item) {
      setAvailableQuantity(item.availableQuantity ?? 0)
      setReorderLevel(item.reorderLevel ?? 10)
      setNote("")
      setError(null)
    }
  }, [open, item])

  const originalQty = item?.availableQuantity ?? 0
  const qtyDiff =
    availableQuantity === "" ? 0 : Number(availableQuantity) - originalQty

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item?.variantId) {
      setError("No variant selected.")
      return
    }

    if (availableQuantity === "" || Number(availableQuantity) < 0) {
      setError("Available quantity cannot be negative.")
      return
    }

    try {
      setError(null)
      await adjustMutation.mutateAsync({
        variantId: item.variantId,
        availableQuantity: Number(availableQuantity),
        reorderLevel: reorderLevel === "" ? undefined : Number(reorderLevel),
        note: note.trim() || undefined,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to adjust inventory. Please check your inputs."
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
            <div className="flex items-center gap-2 text-indigo-600">
              <SlidersHorizontal className="size-5" />
              <DialogTitle>Reconcile Stock Count</DialogTitle>
            </div>
            <DialogDescription>
              Directly synchronize inventory numbers after a physical audit or update safety reorder alerts.
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
                <span>Current Available: <b className="text-foreground">{originalQty}</b></span>
                <span>•</span>
                <span>Reserved: <b className="text-foreground">{item?.reservedQuantity ?? 0}</b></span>
              </div>
            </div>

            {/* New Available Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Audited Available Quantity <span className="text-destructive">*</span>
                </label>
                {qtyDiff !== 0 && (
                  <span
                    className={`text-[11px] font-mono font-semibold ${
                      qtyDiff > 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    Delta: {qtyDiff > 0 ? `+${qtyDiff}` : qtyDiff}
                  </span>
                )}
              </div>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={availableQuantity}
                onChange={(e) => {
                  const val = e.target.value
                  setAvailableQuantity(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0))
                }}
                required
                className="h-9 font-mono text-sm"
              />
            </div>

            {/* Reorder Level Threshold */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Low Stock Alert Threshold (Reorder Level)
              </label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 10"
                value={reorderLevel}
                onChange={(e) => {
                  const val = e.target.value
                  setReorderLevel(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0))
                }}
                className="h-9 font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                System raises an alert when available quantity falls to or below this count.
              </p>
            </div>

            {/* Audit Reason Note */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Adjustment Audit Note / Reason
              </label>
              <Input
                placeholder="e.g. Q3 physical warehouse count reconciliation"
                value={note}
                onChange={(e) => setNote(e.target.value)}
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
              disabled={adjustMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={adjustMutation.isPending || availableQuantity === ""}
            >
              {adjustMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving Adjustment...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="size-3.5" />
                  <span>Save Adjustment</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
