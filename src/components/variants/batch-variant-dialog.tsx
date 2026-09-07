/**
 * @file batch-variant-dialog.tsx
 * @description Spacious Matrix & Multi-Row batch variant creation dialog with Master Attributes Generator.
 * Connects to POST /api/v1/products/:productId/variants/batch with complete field contracts.
 */

"use client"

import * as React from "react"
import { Grid, Loader2, Plus, Trash2, Sparkles, AlertCircle, Wand2, Tag, Check } from "lucide-react"
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
import { useBatchCreateVariantsMutation } from "@/hooks/use-variant-query"
import { useAttributesQuery } from "@/hooks/use-attribute-query"
import type { BatchCreateVariantItem, VariantStatus } from "@/types/variant"

export interface BatchVariantDialogProps {
  productId: string
  productName?: string
  productSlug?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormVariantRow {
  id: string
  sku: string
  price: number | ""
  compareAtPrice: number | ""
  costPrice: number | ""
  initialStock: number | ""
  reorderLevel: number | ""
  barcode: string
  status: VariantStatus
  attributeValueIds: string[]
  attributeLabels?: string[]
}

export function BatchVariantDialog({
  productId,
  productName,
  productSlug,
  open,
  onOpenChange,
  onSuccess,
}: BatchVariantDialogProps) {
  const baseSku = (productSlug || productName || "SKU")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .substring(0, 10)

  const [rows, setRows] = React.useState<FormVariantRow[]>([
    {
      id: "row-1",
      sku: `${baseSku}-01`,
      price: 99.99,
      compareAtPrice: "",
      costPrice: "",
      initialStock: 10,
      reorderLevel: 5,
      barcode: "",
      status: "ACTIVE",
      attributeValueIds: [],
    },
    {
      id: "row-2",
      sku: `${baseSku}-02`,
      price: 99.99,
      compareAtPrice: "",
      costPrice: "",
      initialStock: 10,
      reorderLevel: 5,
      barcode: "",
      status: "ACTIVE",
      attributeValueIds: [],
    },
  ])
  const [selectedAttrValues, setSelectedAttrValues] = React.useState<Record<string, { id: string; value: string }[]>>({})
  const [error, setError] = React.useState<string | null>(null)

  const batchMutation = useBatchCreateVariantsMutation(productId)
  const { data: attributesData } = useAttributesQuery({ limit: 100 })
  const masterAttributes = attributesData?.items ?? []

  React.useEffect(() => {
    if (open) {
      setError(null)
      setSelectedAttrValues({})
    }
  }, [open])

  // Toggle selection of an attribute value in the generator
  const handleToggleAttrVal = (attrId: string, val: { id: string; value: string }) => {
    setSelectedAttrValues((prev) => {
      const currentList = prev[attrId] || []
      const exists = currentList.some((item) => item.id === val.id)
      const updated = exists
        ? currentList.filter((item) => item.id !== val.id)
        : [...currentList, val]

      if (updated.length === 0) {
        const nextState = { ...prev }
        delete nextState[attrId]
        return nextState
      }
      return { ...prev, [attrId]: updated }
    })
  }

  // Generate Cartesian combinations matrix
  const handleGenerateMatrix = () => {
    const attrKeys = Object.keys(selectedAttrValues).filter(
      (k) => selectedAttrValues[k]?.length > 0
    )

    if (attrKeys.length === 0) {
      setError("Please select at least one attribute value to generate a matrix.")
      return
    }

    setError(null)
    const lists = attrKeys.map((k) => selectedAttrValues[k])

    // Cartesian product helper
    const cartesian = (arrays: { id: string; value: string }[][]): { id: string; value: string }[][] => {
      return arrays.reduce<{ id: string; value: string }[][]>(
        (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
        [[]]
      )
    }

    const combinations = cartesian(lists)
    const defaultPrice = rows.length > 0 && typeof rows[0].price === "number" ? rows[0].price : 99.99
    const defaultStock = rows.length > 0 && typeof rows[0].initialStock === "number" ? rows[0].initialStock : 10

    const newRows: FormVariantRow[] = combinations.map((combo, idx) => {
      const skuSuffix = combo
        .map((c) =>
          c.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .substring(0, 4)
        )
        .join("-")

      return {
        id: `gen-row-${Date.now()}-${idx}`,
        sku: `${baseSku}-${skuSuffix || idx + 1}`,
        price: defaultPrice,
        compareAtPrice: "",
        costPrice: "",
        initialStock: defaultStock,
        reorderLevel: 5,
        barcode: "",
        status: "ACTIVE",
        attributeValueIds: combo.map((c) => c.id),
        attributeLabels: combo.map((c) => c.value),
      }
    })

    setRows(newRows)
  }

  const handleAddRow = () => {
    const nextIndex = rows.length + 1
    const padded = nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`
    const defaultPrice = rows.length > 0 && typeof rows[0].price === "number" ? rows[0].price : 99.99
    const defaultStock = rows.length > 0 && typeof rows[0].initialStock === "number" ? rows[0].initialStock : 10

    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${nextIndex}`,
        sku: `${baseSku}-${padded}`,
        price: defaultPrice,
        compareAtPrice: "",
        costPrice: "",
        initialStock: defaultStock,
        reorderLevel: 5,
        barcode: "",
        status: "ACTIVE",
        attributeValueIds: [],
      },
    ])
  }

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const handleUpdateRow = (id: string, field: keyof FormVariantRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const handleApplyPriceToAll = () => {
    if (rows.length === 0) return
    const firstPrice = rows[0].price
    if (typeof firstPrice !== "number" || firstPrice <= 0) return
    setRows((prev) => prev.map((r) => ({ ...r, price: firstPrice })))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rows.length === 0) {
      setError("Please add at least one variant row.")
      return
    }

    const variants: BatchCreateVariantItem[] = []
    const skuSet = new Set<string>()

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const cleanSku = r.sku.trim().toUpperCase()

      if (!cleanSku) {
        setError(`Row #${i + 1}: SKU code is required.`)
        return
      }

      if (skuSet.has(cleanSku)) {
        setError(`Row #${i + 1}: Duplicate SKU '${cleanSku}' in batch. Each SKU must be globally unique.`)
        return
      }
      skuSet.add(cleanSku)

      if (typeof r.price !== "number" || r.price <= 0) {
        setError(`Row #${i + 1} (${cleanSku}): Price must be greater than 0.`)
        return
      }

      if (
        typeof r.compareAtPrice === "number" &&
        r.compareAtPrice > 0 &&
        r.compareAtPrice < r.price
      ) {
        setError(`Row #${i + 1} (${cleanSku}): Compare-at price (MRP) must be greater than or equal to selling price.`)
        return
      }

      variants.push({
        sku: cleanSku,
        price: Number(r.price),
        status: r.status || "ACTIVE",
        attributeValueIds: r.attributeValueIds || [],
        initialStock: typeof r.initialStock === "number" && r.initialStock >= 0 ? Number(r.initialStock) : 0,
        reorderLevel: typeof r.reorderLevel === "number" && r.reorderLevel >= 0 ? Number(r.reorderLevel) : null,
        barcode: r.barcode.trim() || null,
        compareAtPrice: typeof r.compareAtPrice === "number" && r.compareAtPrice > 0 ? Number(r.compareAtPrice) : null,
        costPrice: typeof r.costPrice === "number" && r.costPrice > 0 ? Number(r.costPrice) : null,
      })
    }

    batchMutation.mutate(
      { variants },
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
            "Failed to batch create product variants."
          setError(msg)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1120px] w-[96vw] max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-border/70 bg-muted/10">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Grid className="size-4" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold">
                      Batch Create Variants Matrix
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      Generate combinations from Master Attributes or manually configure multiple SKU variants.
                    </DialogDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyPriceToAll}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    title="Copy Row #1 price to all rows"
                  >
                    <Wand2 className="size-3 text-indigo-600" />
                    <span>Sync Row 1 Price</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    className="h-8 gap-1 text-xs border-indigo-200 text-indigo-600 dark:border-indigo-900/60 dark:text-indigo-400 hover:bg-indigo-500/10 font-semibold"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Row</span>
                  </Button>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Master Attributes Generator Section */}
            {masterAttributes.length > 0 && (
              <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/30 dark:border-indigo-900/50 dark:bg-indigo-950/20 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-foreground">
                        Step 1: Select Master Attributes for Matrix Generation
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Select options below (e.g. Colors & Sizes) to auto-generate all SKU combinations.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGenerateMatrix}
                    className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 font-semibold shadow-xs"
                  >
                    <Sparkles className="size-3.5" />
                    <span>Generate Combinations Matrix</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {masterAttributes.map((attr) => {
                    const values = attr.values ?? []
                    if (values.length === 0) return null

                    const selectedForThis = selectedAttrValues[attr.id] || []

                    return (
                      <div
                        key={attr.id}
                        className="rounded-lg border border-border/70 bg-card p-2.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground">{attr.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {selectedForThis.length}/{values.length} selected
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {values.map((v) => {
                            const isSelected = selectedForThis.some((item) => item.id === v.id)
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => handleToggleAttrVal(attr.id, { id: v.id, value: v.value })}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-all flex items-center gap-1 ${
                                  isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                                    : "bg-background text-foreground border-border/70 hover:border-indigo-500/50"
                                }`}
                              >
                                {isSelected && <Check className="size-2.5" />}
                                <span>{v.value}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Table of Rows */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">
                  Step 2: Review & Adjust Matrix Rows ({rows.length})
                </span>
              </div>

              <div className="rounded-xl border border-border/70 overflow-x-auto shadow-2xs">
                <table className="w-full min-w-[980px] text-xs">
                  <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground border-b border-border/60">
                    <tr>
                      <th className="p-3 text-left min-w-[170px]">SKU Code *</th>
                      <th className="p-3 text-left min-w-[130px]">Attributes</th>
                      <th className="p-3 text-left w-28">Price ($) *</th>
                      <th className="p-3 text-left w-28">MRP / Compare ($)</th>
                      <th className="p-3 text-left w-24">Cost ($)</th>
                      <th className="p-3 text-left w-24">Initial Stock</th>
                      <th className="p-3 text-left w-24">Low Stock</th>
                      <th className="p-3 text-left min-w-[140px]">Barcode (UPC)</th>
                      <th className="p-3 text-left w-28">Status</th>
                      <th className="p-3 text-right w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                        {/* SKU */}
                        <td className="p-2.5">
                          <Input
                            value={r.sku}
                            onChange={(e) => handleUpdateRow(r.id, "sku", e.target.value.toUpperCase())}
                            placeholder="e.g. NK-AIR-01"
                            className="h-8 text-xs font-mono uppercase"
                            required
                          />
                        </td>

                        {/* Attribute Badges */}
                        <td className="p-2.5">
                          {r.attributeLabels && r.attributeLabels.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {r.attributeLabels.map((lbl, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-[10px] font-medium px-1.5 py-0.5 bg-muted/80"
                                >
                                  {lbl}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">Standard</span>
                          )}
                        </td>

                        {/* Selling Price */}
                        <td className="p-2.5">
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={r.price}
                            onChange={(e) =>
                              handleUpdateRow(r.id, "price", e.target.value === "" ? "" : Number(e.target.value))
                            }
                            placeholder="149.99"
                            className="h-8 text-xs font-mono"
                            required
                          />
                        </td>

                        {/* Compare At Price */}
                        <td className="p-2.5">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={r.compareAtPrice}
                            onChange={(e) =>
                              handleUpdateRow(
                                r.id,
                                "compareAtPrice",
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                            placeholder="179.99"
                            className="h-8 text-xs font-mono"
                          />
                        </td>

                        {/* Cost Price */}
                        <td className="p-2.5">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={r.costPrice}
                            onChange={(e) =>
                              handleUpdateRow(
                                r.id,
                                "costPrice",
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                            placeholder="65.00"
                            className="h-8 text-xs font-mono"
                          />
                        </td>

                        {/* Initial Stock */}
                        <td className="p-2.5">
                          <Input
                            type="number"
                            min="0"
                            value={r.initialStock}
                            onChange={(e) =>
                              handleUpdateRow(
                                r.id,
                                "initialStock",
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                            placeholder="0"
                            className="h-8 text-xs font-mono"
                          />
                        </td>

                        {/* Reorder Level */}
                        <td className="p-2.5">
                          <Input
                            type="number"
                            min="0"
                            value={r.reorderLevel}
                            onChange={(e) =>
                              handleUpdateRow(
                                r.id,
                                "reorderLevel",
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                            placeholder="5"
                            className="h-8 text-xs font-mono"
                          />
                        </td>

                        {/* Barcode */}
                        <td className="p-2.5">
                          <Input
                            value={r.barcode}
                            maxLength={64}
                            onChange={(e) => handleUpdateRow(r.id, "barcode", e.target.value)}
                            placeholder="012345678901"
                            className="h-8 text-xs font-mono"
                          />
                        </td>

                        {/* Status */}
                        <td className="p-2.5">
                          <select
                            value={r.status}
                            onChange={(e) =>
                              handleUpdateRow(r.id, "status", e.target.value as VariantStatus)
                            }
                            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </td>

                        {/* Delete */}
                        <td className="p-2.5 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={rows.length <= 1}
                            onClick={() => handleRemoveRow(r.id)}
                            className="size-7 p-0 text-muted-foreground hover:text-rose-600 rounded-md"
                            title="Remove row"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 border-t border-border/70 bg-muted/10 gap-2 flex-col-reverse sm:flex-row justify-between items-center">
            <span className="text-xs font-medium text-muted-foreground">
              Total <strong className="text-foreground">{rows.length}</strong> variant(s) configured
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={batchMutation.isPending}
                className="text-xs h-8.5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={batchMutation.isPending}
                className="text-xs h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
              >
                {batchMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Creating {rows.length} Variants...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    <span>Create {rows.length} Variants</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
