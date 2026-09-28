/**
 * @file edit-variant-dialog.tsx
 * @description Modal dialog for updating variant price, cost, barcode, attributes, status, and direct device upload of variant photos.
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
import { VariantImageManager } from "./variant-image-manager"
import type { ProductVariant, UpdateVariantPayload, VariantStatus } from "@/types/variant"

export interface EditVariantDialogProps {
  variant: ProductVariant | null
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (updatedVariant?: ProductVariant) => void
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

  // Accurately populate numeric pricing from variant data
  React.useEffect(() => {
    if (variant && open) {
      setSku(variant.sku || "")

      const rawPrice = variant.price !== undefined && variant.price !== null ? Number(variant.price) : 0
      setPrice(!isNaN(rawPrice) && rawPrice > 0 ? String(rawPrice) : "")

      const rawCompare =
        variant.compareAtPrice !== undefined && variant.compareAtPrice !== null
          ? Number(variant.compareAtPrice)
          : null
      setCompareAtPrice(rawCompare !== null && !isNaN(rawCompare) && rawCompare > 0 ? String(rawCompare) : "")

      const rawCost =
        variant.costPrice !== undefined && variant.costPrice !== null
          ? Number(variant.costPrice)
          : null
      setCostPrice(rawCost !== null && !isNaN(rawCost) && rawCost > 0 ? String(rawCost) : "")

      setBarcode(variant.barcode || "")
      setStatus((variant.status as VariantStatus) || "ACTIVE")
      const existingIds = (variant.attributeValues ?? [])
        .map((av: any) => av.attributeValue?.id || av.id)
        .filter(Boolean)
      setSelectedAttributeValueIds(existingIds)
      setError(null)
    }
  }, [variant, open])

  if (!variant) return null

  // Sanitized handler for price decimal inputs, capping at 2 decimal places
  const handleDecimalChange = (setter: (val: string) => void, inputValue: string) => {
    if (inputValue === "") {
      setter("")
      return
    }
    let sanitized = inputValue.replace(/,/g, ".").replace(/[^0-9.]/g, "")
    const parts = sanitized.split(".")
    if (parts.length > 2) {
      sanitized = `${parts[0]}.${parts.slice(1).join("")}`
    }
    if (parts[1] && parts[1].length > 2) {
      sanitized = `${parts[0]}.${parts[1].slice(0, 2)}`
    }
    setter(sanitized)
  }

  const numPrice = parseFloat(price) || 0
  const numCost = parseFloat(costPrice) || 0
  const profitMargin =
    numPrice > 0 && numCost > 0 ? Math.round(((numPrice - numCost) / numPrice) * 100) : null
  const reserved = Number(variant.inventory?.reservedQuantity ?? 0)
  const available = Number(variant.inventory?.availableQuantity ?? 0)
  const stock =
    variant.inventory?.quantity !== undefined && variant.inventory.quantity !== null
      ? Number(variant.inventory.quantity)
      : available + reserved

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
    if (
      parsedCompare !== null &&
      !isNaN(parsedCompare) &&
      parsedCompare > 0 &&
      parsedCompare < parsedPrice
    ) {
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
        onSuccess: (res) => {
          onOpenChange(false)
          onSuccess?.(res?.data)
        },
        onError: (err: any) => {
          const validationMsg = err.response?.data?.errors?.[0]?.message
          const msg =
            validationMsg ||
            err.response?.data?.message ||
            err.message ||
            "Failed to update variant."
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
                    Update variant pricing, barcode, attributes, and ImageKit gallery.
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

            <div className="flex flex-wrap items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20 gap-2">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" />
                <div>
                  <span className="font-semibold text-foreground text-xs block">
                    Current Inventory: <strong className="font-mono">{stock} units</strong>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {available} available • {reserved} reserved
                  </span>
                </div>
              </div>
              <Badge variant={status === "ACTIVE" ? "default" : status === "DRAFT" ? "outline" : "secondary"} className="text-[10px] font-mono uppercase">
                {status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">SKU Code <span className="text-rose-500">*</span></label>
                <Input value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} className="h-8.5 text-xs font-mono uppercase" required />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Barcode / UPC / EAN</label>
                <Input value={barcode} maxLength={64} onChange={(e) => setBarcode(e.target.value)} className="h-8.5 text-xs font-mono" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20">
              <InlineAttributeManager mode="single" selectedSingleValueIds={selectedAttributeValueIds} onSingleSelectionChange={setSelectedAttributeValueIds} />
            </div>

            {/* Variant Specific Images Manager with Drag and Drop */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20">
              <VariantImageManager
                productId={productId}
                variantId={variant.id}
                images={variant.images || []}
                sku={variant.sku}
              />
            </div>

            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">Pricing</span>
                {profitMargin !== null && (
                  <span
                    className={`text-xs font-mono font-semibold ${
                      profitMargin < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    Est. Margin: {profitMargin}%
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground text-xs">Selling Price (₹) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-medium pointer-events-none select-none">₹</span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={price}
                      onChange={(e) => handleDecimalChange(setPrice, e.target.value)}
                      className="h-8.5 pl-6 text-xs font-mono"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-muted-foreground text-xs">Compare At MRP (₹)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-medium pointer-events-none select-none">₹</span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={compareAtPrice}
                      onChange={(e) => handleDecimalChange(setCompareAtPrice, e.target.value)}
                      className="h-8.5 pl-6 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-muted-foreground text-xs">Cost Per Item (₹)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-medium pointer-events-none select-none">₹</span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={costPrice}
                      onChange={(e) => handleDecimalChange(setCostPrice, e.target.value)}
                      className="h-8.5 pl-6 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Publishing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VariantStatus)}
                className="w-full h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DRAFT">DRAFT</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row p-4 border-t border-border/70">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending} className="text-xs h-8.5">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={updateMutation.isPending} className="text-xs h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              {updateMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
