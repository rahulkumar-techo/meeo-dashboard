/**
 * @file edit-variant-dialog.tsx
 * @description Spacious Modal dialog for updating variant price, compareAtPrice, cost, barcode, attributes, and status.
 */

"use client"

import * as React from "react"
import { Edit2, Loader2, Sparkles, AlertCircle, Package } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { useUpdateVariantMutation } from "@/hooks/use-variant-query"
import { InlineAttributeManager } from "./inline-attribute-manager"
import type { ProductVariant, UpdateVariantPayload, VariantStatus } from "@/types/variant"

export interface EditVariantDialogProps {
  variant: ProductVariant | null
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditVariantDialog({
  variant,
  productId,
  open,
  onOpenChange,
  onSuccess,
}: EditVariantDialogProps) {
  const [sku, setSku] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [compareAtPrice, setCompareAtPrice] = React.useState("")
  const [costPrice, setCostPrice] = React.useState("")
  const [barcode, setBarcode] = React.useState("")
  const [status, setStatus] = React.useState<VariantStatus>("ACTIVE")
  const [selectedAttributeValueIds, setSelectedAttributeValueIds] = React.useState<string[]>([])
  const [error, setError] = React.useState<string | null>(null)

  const updateMutation = useUpdateVariantMutation(productId)

  // Sync state whenever the variant prop or open dialog changes
  React.useEffect(() => {
    if (variant && open) {
      setSku(variant.sku || "")
      setPrice(variant.price !== undefined && variant.price !== null ? String(variant.price) : "")
      setCompareAtPrice(
        variant.compareAtPrice !== undefined && variant.compareAtPrice !== null && Number(variant.compareAtPrice) > 0
          ? String(variant.compareAtPrice)
          : ""
      )
      setCostPrice(
        variant.costPrice !== undefined && variant.costPrice !== null && Number(variant.costPrice) > 0
          ? String(variant.costPrice)
          : ""
      )
      setBarcode(variant.barcode || "")
      setStatus((variant.status as VariantStatus) || "ACTIVE")

      const existingIds = (variant.attributeValues ?? []).map((av: any) =>
        av.attributeValue?.id || av.id
      ).filter(Boolean)
      setSelectedAttributeValueIds(existingIds)

      setError(null)
    }
  }, [variant, open])

  if (!variant) return null

  const numPrice = parseFloat(price) || 0
  const numCost = parseFloat(costPrice) || 0
  const profitMargin =
    numPrice > 0 && numCost > 0 ? Math.round(((numPrice - numCost) / numPrice) * 100) : null

  // Live stock counts with proper fallback for available + reserved
  const reserved = Number(variant.inventory?.reservedQuantity ?? 0)
  const available = Number(variant.inventory?.availableQuantity ?? 0)
  const stock =
    variant.inventory?.quantity !== undefined && variant.inventory.quantity !== null
      ? Number(variant.inventory.quantity)
      : available + reserved
  const reorder =
    variant.inventory?.reorderLevel !== undefined && variant.inventory?.reorderLevel !== null
      ? Number(variant.inventory.reorderLevel)
      : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanSku = sku.trim().toUpperCase()
    if (!cleanSku) {
      setError("SKU code is required.")
      return
    }

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Selling price must be a valid number greater than 0.")
      return
    }

    const parsedCompare = compareAtPrice ? parseFloat(compareAtPrice) : null
    if (parsedCompare !== null && !isNaN(parsedCompare) && parsedCompare > 0 && parsedCompare < parsedPrice) {
      setError("Compare-at price (MRP) must be greater than or equal to selling price.")
      return
    }

    const parsedCost = costPrice ? parseFloat(costPrice) : null

    const payload: UpdateVariantPayload = {
      sku: cleanSku,
      price: parsedPrice,
      compareAtPrice: parsedCompare && parsedCompare > 0 ? parsedCompare : null,
      costPrice: parsedCost && parsedCost > 0 ? parsedCost : null,
      barcode: barcode.trim() || null,
      status,
      attributeValueIds: selectedAttributeValueIds,
    }

    updateMutation.mutate(
      { id: variant.id, payload },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (err: any) => {
          const validationMsg = err.response?.data?.errors?.[0]?.message
          const msg =
            validationMsg ||
            err.response?.data?.message ||
            err.message ||
            "Failed to update product variant."
          setError(msg)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="p-5 pb-3 border-b border-border/70 bg-muted/10">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Edit2 className="size-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">
                    Edit Variant: <span className="font-mono text-indigo-600 dark:text-indigo-400">{variant.sku}</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Update variant manual pricing, attributes, barcode, and status.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Inventory Status Overview Banner */}
            <div className="flex flex-wrap items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20 gap-2">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" />
                <div>
                  <span className="font-semibold text-foreground text-xs block">
                    Current Inventory: <strong className="font-mono">{stock} units</strong>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {available} available • {reserved} reserved {reorder !== null && `• Reorder at ${reorder}`}
                  </span>
                </div>
              </div>
              <Badge
                variant={status === "ACTIVE" ? "default" : status === "DRAFT" ? "outline" : "secondary"}
                className="text-[10px] font-mono uppercase"
              >
                {status}
              </Badge>
            </div>

            {/* SKU & Barcode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  SKU Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="e.g. NK-AIR-BLK-10"
                  className="h-8.5 text-xs font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Barcode / UPC / EAN</label>
                <Input
                  value={barcode}
                  maxLength={64}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g. 012345678901"
                  className="h-8.5 text-xs font-mono"
                />
              </div>
            </div>

            {/* Inline Variant Attributes & Values Manager */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20">
              <InlineAttributeManager
                mode="single"
                selectedSingleValueIds={selectedAttributeValueIds}
                onSingleSelectionChange={setSelectedAttributeValueIds}
              />
            </div>

            {/* Manual Pricing Details (No sliders/steppers) */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Pricing (Manual Input)
                </span>
                {profitMargin !== null && (
                  <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    Est. Margin: {profitMargin}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground text-xs">
                    Selling Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setPrice(val)
                      }
                    }}
                    placeholder="149.99"
                    className="h-8.5 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-muted-foreground text-xs">
                    Compare At MRP (₹)
                  </label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={compareAtPrice}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setCompareAtPrice(val)
                      }
                    }}
                    placeholder="179.99"
                    className="h-8.5 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-muted-foreground text-xs">
                    Cost Per Item (₹)
                  </label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={costPrice}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setCostPrice(val)
                      }
                    }}
                    placeholder="65.00"
                    className="h-8.5 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Publishing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VariantStatus)}
                className="w-full h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DRAFT">DRAFT</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row p-4 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="text-xs h-8.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="text-xs h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
