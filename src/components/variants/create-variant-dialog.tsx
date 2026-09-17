/**
 * @file create-variant-dialog.tsx
 * @description Modal dialog for creating a single SKU variant with master attributes, manual pricing input, and inventory tracking.
 */

"use client"

import * as React from "react"
import { Plus, Loader2, Sparkles, AlertCircle, Wand2, Tag } from "lucide-react"
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
import { useCreateVariantMutation } from "@/hooks/use-variant-query"
import {
  InlineAttributeManager,
  type SelectedAttributeDetail,
} from "./inline-attribute-manager"
import type { CreateVariantPayload, VariantStatus } from "@/types/variant"

export interface CreateVariantDialogProps {
  productId: string
  productName?: string
  productSlug?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateVariantDialog({
  productId,
  productName,
  productSlug,
  open,
  onOpenChange,
  onSuccess,
}: CreateVariantDialogProps) {
  const [sku, setSku] = React.useState("")
  const [isSkuManuallyEdited, setIsSkuManuallyEdited] = React.useState(false)
  const [price, setPrice] = React.useState("")
  const [compareAtPrice, setCompareAtPrice] = React.useState("")
  const [costPrice, setCostPrice] = React.useState("")
  const [barcode, setBarcode] = React.useState("")
  const [status, setStatus] = React.useState<VariantStatus>("ACTIVE")
  const [initialStock, setInitialStock] = React.useState("0")
  const [reorderLevel, setReorderLevel] = React.useState("")
  const [selectedAttributeValueIds, setSelectedAttributeValueIds] = React.useState<string[]>([])
  const [selectedDetails, setSelectedDetails] = React.useState<SelectedAttributeDetail[]>([])
  const [error, setError] = React.useState<string | null>(null)

  const createMutation = useCreateVariantMutation(productId)

  const baseSkuPrefix = React.useMemo(() => {
    return (productSlug || productName || "SKU")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 8)
  }, [productSlug, productName])

  // Helper to construct SKU from selected attributes
  const generateSkuFromAttributes = React.useCallback(
    (details: SelectedAttributeDetail[]) => {
      if (details.length === 0) {
        return `${baseSkuPrefix || "SKU"}-01`
      }
      const suffix = details
        .map((d) =>
          d.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .substring(0, 4)
        )
        .filter(Boolean)
        .join("-")
      return `${baseSkuPrefix || "SKU"}-${suffix || "01"}`
    },
    [baseSkuPrefix]
  )

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      const initial = `${baseSkuPrefix || "SKU"}-01`
      setSku(initial)
      setIsSkuManuallyEdited(false)
      setPrice("")
      setCompareAtPrice("")
      setCostPrice("")
      setBarcode("")
      setStatus("ACTIVE")
      setInitialStock("0")
      setReorderLevel("")
      setSelectedAttributeValueIds([])
      setSelectedDetails([])
      setError(null)
    }
  }, [open, baseSkuPrefix])

  // When attributes change, if user hasn't explicitly typed a custom SKU, auto-update the SKU
  const handleAttributeDetailsChange = React.useCallback(
    (details: SelectedAttributeDetail[]) => {
      setSelectedDetails(details)
      if (!isSkuManuallyEdited && details.length > 0) {
        setSku(generateSkuFromAttributes(details))
      }
    },
    [isSkuManuallyEdited, generateSkuFromAttributes]
  )

  const handleManualAutoGenerateSku = () => {
    const generated = generateSkuFromAttributes(selectedDetails)
    setSku(generated)
    setIsSkuManuallyEdited(false)
  }

  // Calculated profit margin preview
  const numPrice = parseFloat(price) || 0
  const numCost = parseFloat(costPrice) || 0
  const profitMargin =
    numPrice > 0 && numCost > 0 ? Math.round(((numPrice - numCost) / numPrice) * 100) : null

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
    const parsedStock = initialStock ? parseInt(initialStock, 10) : 0
    const parsedReorder = reorderLevel ? parseInt(reorderLevel, 10) : null

    const payload: CreateVariantPayload = {
      sku: cleanSku,
      price: parsedPrice,
      compareAtPrice: parsedCompare && parsedCompare > 0 ? parsedCompare : null,
      costPrice: parsedCost && parsedCost > 0 ? parsedCost : null,
      barcode: barcode.trim() || null,
      status,
      attributeValueIds: selectedAttributeValueIds,
      initialStock: !isNaN(parsedStock) && parsedStock >= 0 ? parsedStock : 0,
      reorderLevel: parsedReorder !== null && !isNaN(parsedReorder) && parsedReorder >= 0 ? parsedReorder : null,
    }

    createMutation.mutate(payload, {
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
          "Failed to create product variant."
        setError(msg)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="p-5 pb-3 border-b border-border/70 bg-muted/10">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Plus className="size-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">Add Product Variant</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Select attributes to auto-set the SKU variant item, set pricing manually, and configure stock.
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

            {/* Inline Variant Attributes & Options Manager (Step 1) */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20">
              <InlineAttributeManager
                mode="single"
                selectedSingleValueIds={selectedAttributeValueIds}
                onSingleSelectionChange={setSelectedAttributeValueIds}
                onSingleSelectionDetailsChange={handleAttributeDetailsChange}
              />
            </div>

            {/* Selected Attributes Preview & SKU Linkage */}
            {selectedDetails.length > 0 && (
              <div className="p-2.5 rounded-lg border border-indigo-200/80 bg-indigo-50/40 dark:border-indigo-900/50 dark:bg-indigo-950/20 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1">
                    <Tag className="size-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Configuring Variant for:</span>
                  </span>
                  {selectedDetails.map((d) => (
                    <Badge
                      key={d.id}
                      variant="secondary"
                      className="text-[10px] font-medium px-2 py-0.5 bg-background border border-indigo-300 dark:border-indigo-800 text-foreground"
                    >
                      <span className="text-muted-foreground mr-1">{d.attributeName}:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">{d.value}</strong>
                    </Badge>
                  ))}
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleManualAutoGenerateSku}
                  className="h-6 px-2 text-[11px] text-indigo-600 dark:text-indigo-400 gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                  title="Sync SKU with selected attributes"
                >
                  <Wand2 className="size-3" />
                  <span>Sync SKU</span>
                </Button>
              </div>
            )}

            {/* SKU & Barcode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">
                    SKU Code <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleManualAutoGenerateSku}
                    className="text-[10.5px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="size-2.5" />
                    <span>Auto-generate</span>
                  </button>
                </div>
                <Input
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value.toUpperCase())
                    setIsSkuManuallyEdited(true)
                  }}
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

            {/* Manual Pricing Details (No slider/steppers) */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                  Pricing (Manual Input)
                </span>
                {profitMargin !== null && (
                  <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    Est. Margin: {profitMargin}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
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
                    className="h-8 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground text-[11px]">
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
                    className="h-8 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground text-[11px]">
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
                    className="h-8 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Inventory & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Initial Stock Count</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={initialStock}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || /^\d*$/.test(val)) {
                      setInitialStock(val)
                    }
                  }}
                  placeholder="0"
                  className="h-8.5 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Low Stock Alert Level</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={reorderLevel}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || /^\d*$/.test(val)) {
                      setReorderLevel(val)
                    }
                  }}
                  placeholder="e.g. 5"
                  className="h-8.5 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

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
          </div>

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row p-4 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
              className="text-xs h-8.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="text-xs h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Create Variant</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

