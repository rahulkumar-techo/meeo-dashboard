/**
 * @file add-stock-dialog.tsx
 * @description Modal dialog for receiving physical inventory restock shipments.
 * Logs an immutable STOCK_ADDED audit record with optional purchase order reference.
 */

"use client"

import * as React from "react"
import { PlusCircle, Loader2, PackagePlus, AlertCircle, FileText } from "lucide-react"
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
import { useAddStockMutation } from "@/hooks/use-inventory-query"
import type { InventoryRecord } from "@/types/inventory"

export interface AddStockDialogProps {
  item: InventoryRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddStockDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: AddStockDialogProps) {
  const [quantity, setQuantity] = React.useState<number | "">("")
  const [referenceType, setReferenceType] = React.useState("PURCHASE_ORDER")
  const [referenceId, setReferenceId] = React.useState("")
  const [note, setNote] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const addStockMutation = useAddStockMutation()

  // Reset form state on open
  React.useEffect(() => {
    if (open) {
      setQuantity("")
      setReferenceType("PURCHASE_ORDER")
      setReferenceId("")
      setNote("")
      setError(null)
    }
  }, [open, item])

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

    try {
      setError(null)
      await addStockMutation.mutateAsync({
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
        "Failed to add inventory units. Please try again."
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
            <div className="flex items-center gap-2 text-emerald-600">
              <PackagePlus className="size-5" />
              <DialogTitle>Add Physical Stock</DialogTitle>
            </div>
            <DialogDescription>
              Increase available stock units on hand. This will record an immutable{" "}
              <span className="font-mono font-semibold text-foreground">STOCK_ADDED</span> audit log entry.
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
                <span>Current Available: <b className="text-foreground">{item?.availableQuantity ?? 0}</b></span>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1.5">
                Restock Units to Add <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value
                  setQuantity(val === "" ? "" : Math.max(1, parseInt(val, 10) || 0))
                }}
                required
                className="h-9 font-mono text-sm"
              />
            </div>

            {/* Reference Type & ID */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Reference Type
                </label>
                <select
                  value={referenceType}
                  onChange={(e) => setReferenceType(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
                >
                  <option value="PURCHASE_ORDER">Purchase Order</option>
                  <option value="SUPPLIER_BATCH">Supplier Batch</option>
                  <option value="RESTOCK_TRANSFER">Warehouse Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Reference ID / Batch #
                </label>
                <Input
                  placeholder="e.g. PO-2026-089"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Restock Note */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Audit Note / Reason
              </label>
              <Input
                placeholder="e.g. Received shipment from Supplier Hub A"
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
              disabled={addStockMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={addStockMutation.isPending || !quantity}
            >
              {addStockMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Adding Stock...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="size-3.5" />
                  <span>Confirm Restock</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
