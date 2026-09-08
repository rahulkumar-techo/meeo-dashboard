/**
 * @file remove-stock-dialog.tsx
 * @description Modal dialog for recording damaged stock write-offs, shrinkage, or warehouse disposal.
 * Validates available non-reserved quantity and logs STOCK_REMOVED ledger record.
 */

"use client"

import * as React from "react"
import { PackageMinus, Loader2, AlertTriangle, AlertCircle } from "lucide-react"
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
import { useRemoveStockMutation } from "@/hooks/use-inventory-query"
import type { InventoryRecord } from "@/types/inventory"

export interface RemoveStockDialogProps {
  item: InventoryRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RemoveStockDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: RemoveStockDialogProps) {
  const [quantity, setQuantity] = React.useState<number | "">("")
  const [referenceType, setReferenceType] = React.useState("DAMAGE_REPORT")
  const [referenceId, setReferenceId] = React.useState("")
  const [note, setNote] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const removeStockMutation = useRemoveStockMutation()

  React.useEffect(() => {
    if (open) {
      setQuantity("")
      setReferenceType("DAMAGE_REPORT")
      setReferenceId("")
      setNote("")
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
        `Cannot remove ${qtyNumber} units. Only ${availableQuantity} units are currently available.`
      )
      return
    }

    try {
      setError(null)
      await removeStockMutation.mutateAsync({
        variantId: item.variantId,
        quantity: qtyNumber,
        referenceType: referenceType.trim() || undefined,
        referenceId: referenceId.trim() || undefined,
        note: note.trim() || undefined,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to remove stock units. Please try again."
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
            <div className="flex items-center gap-2 text-rose-600">
              <PackageMinus className="size-5" />
              <DialogTitle>Remove Stock / Write-Off</DialogTitle>
            </div>
            <DialogDescription>
              Write off damaged, expired, or lost inventory units. Logs an immutable{" "}
              <span className="font-mono font-semibold text-foreground">STOCK_REMOVED</span> transaction.
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
                <span>
                  Available to remove:{" "}
                  <b className={availableQuantity > 0 ? "text-emerald-600 font-bold" : "text-destructive font-bold"}>
                    {availableQuantity}
                  </b>
                </span>
              </div>
            </div>

            {/* Quantity to remove */}
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center justify-between mb-1.5">
                <span>Units to Write Off / Remove <span className="text-destructive">*</span></span>
                <span className="text-[11px] text-muted-foreground font-normal">Max: {availableQuantity}</span>
              </label>
              <Input
                type="number"
                min={1}
                max={availableQuantity || 1}
                placeholder="e.g. 2"
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

            {/* Reference Type & ID */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Reason Code
                </label>
                <select
                  value={referenceType}
                  onChange={(e) => setReferenceType(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
                >
                  <option value="DAMAGE_REPORT">Warehouse Damage</option>
                  <option value="SHRINKAGE">Shrinkage / Theft</option>
                  <option value="EXPIRED">Expired Batch</option>
                  <option value="INTERNAL_USE">Sample / Internal QA</option>
                  <option value="OTHER">Other Adjustment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Incident / Incident Report #
                </label>
                <Input
                  placeholder="e.g. DMG-2026-012"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Reason Details */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Detailed Note
              </label>
              <Input
                placeholder="e.g. Water damage in warehouse bay 3"
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
              disabled={removeStockMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              className="gap-1.5"
              disabled={removeStockMutation.isPending || !quantity || availableQuantity === 0}
            >
              {removeStockMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <PackageMinus className="size-3.5" />
                  <span>Write Off Stock</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
