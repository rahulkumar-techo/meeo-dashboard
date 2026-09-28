/**
 * @file batch-variant-dialog.tsx
 * @description Multi-Variant batch creation dialog where each variant has its own dedicated attribute selector (supporting 2+ attributes per variant).
 * Connects to POST /api/v1/products/:productId/variants/batch with complete field contracts.
 */

"use client"

import * as React from "react"
import {
  Layers,
  Loader2,
  Plus,
  Trash2,
  Copy,
  Wand2,
  AlertCircle,
  Tag,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
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
import { useCreateAttributeMutation, useAttributesQuery } from "@/hooks/use-attribute-query"
import { usePermissions } from "@/hooks/use-permissions"
import { RowAttributePicker } from "./row-attribute-picker"
import { RowImagePicker } from "./row-image-picker"
import type { CreateProductImageInput } from "@/types/product"
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
  isSkuCustomized?: boolean
  price: string
  compareAtPrice: string
  costPrice: string
  initialStock: string
  reorderLevel: string
  barcode: string
  status: VariantStatus
  attributeValueIds: string[]
  attributeLabels?: string[]
  images?: CreateProductImageInput[]
}

export function BatchVariantDialog({
  productId,
  productName,
  productSlug,
  open,
  onOpenChange,
  onSuccess,
}: BatchVariantDialogProps) {
  const { isSuperAdmin } = usePermissions()
  const baseSku = (productSlug || productName || "SKU")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 8)

  const [rows, setRows] = React.useState<FormVariantRow[]>([
    {
      id: "row-1",
      sku: `${baseSku || "SKU"}-01`,
      isSkuCustomized: false,
      price: "99.99",
      compareAtPrice: "",
      costPrice: "",
      initialStock: "10",
      reorderLevel: "5",
      barcode: "",
      status: "ACTIVE",
      attributeValueIds: [],
      attributeLabels: [],
      images: [],
    },
    {
      id: "row-2",
      sku: `${baseSku || "SKU"}-02`,
      isSkuCustomized: false,
      price: "99.99",
      compareAtPrice: "",
      costPrice: "",
      initialStock: "10",
      reorderLevel: "5",
      barcode: "",
      status: "ACTIVE",
      attributeValueIds: [],
      attributeLabels: [],
      images: [],
    },
  ])

  const [error, setError] = React.useState<string | null>(null)
  const batchMutation = useBatchCreateVariantsMutation(productId)

  // Quick attribute creator in toolbar
  const [isTopAttrOpen, setIsTopAttrOpen] = React.useState(false)
  const [topAttrName, setTopAttrName] = React.useState("")
  const [topAttrVal, setTopAttrVal] = React.useState("")
  const [topAttrError, setTopAttrError] = React.useState<string | null>(null)
  const createAttrMutation = useCreateAttributeMutation()
  const { refetch: refetchAttributes } = useAttributesQuery({ limit: 100 })

  React.useEffect(() => {
    if (open) {
      setError(null)
      setIsTopAttrOpen(false)
    }
  }, [open])

  // Helper to generate a SKU suffix from attribute labels
  const formatSkuFromLabels = (labels?: string[], index: number = 1) => {
    if (!labels || labels.length === 0) {
      const padded = index < 10 ? `0${index}` : `${index}`
      return `${baseSku || "SKU"}-${padded}`
    }
    const suffix = labels
      .map((l) =>
        l
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .substring(0, 4)
      )
      .filter(Boolean)
      .join("-")
    return `${baseSku || "SKU"}-${suffix || index}`
  }

  // Handle row attribute change
  const handleRowAttributesChange = (
    rowId: string,
    selectedIds: string[],
    selectedLabels: string[]
  ) => {
    setRows((prev) =>
      prev.map((r, idx) => {
        if (r.id !== rowId) return r
        const updatedSku = !r.isSkuCustomized
          ? formatSkuFromLabels(selectedLabels, idx + 1)
          : r.sku
        return {
          ...r,
          attributeValueIds: selectedIds,
          attributeLabels: selectedLabels,
          sku: updatedSku,
        }
      })
    )
  }

  // Add a new empty variant row
  const handleAddRow = () => {
    const nextIndex = rows.length + 1
    const padded = nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`
    const defaultPrice = rows.length > 0 && rows[0].price ? rows[0].price : "99.99"
    const defaultStock = rows.length > 0 && rows[0].initialStock ? rows[0].initialStock : "10"

    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${nextIndex}`,
        sku: `${baseSku || "SKU"}-${padded}`,
        isSkuCustomized: false,
        price: defaultPrice,
        compareAtPrice: "",
        costPrice: "",
        initialStock: defaultStock,
        reorderLevel: "5",
        barcode: "",
        status: "ACTIVE",
        attributeValueIds: [],
        attributeLabels: [],
        images: [],
      },
    ])
  }

  // Duplicate an existing row
  const handleDuplicateRow = (rowId: string) => {
    const target = rows.find((r) => r.id === rowId)
    if (!target) return
    const nextIndex = rows.length + 1
    const padded = nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`

    setRows((prev) => [
      ...prev,
      {
        ...target,
        id: `row-${Date.now()}-${nextIndex}`,
        sku: `${baseSku || "SKU"}-${padded}`,
        isSkuCustomized: false,
        images: target.images ? [...target.images] : [],
      },
    ])
  }

  // Remove a variant row
  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  // Update a specific cell
  const handleUpdateRow = (id: string, field: keyof FormVariantRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        if (field === "sku") {
          return { ...r, sku: value, isSkuCustomized: true }
        }
        return { ...r, [field]: value }
      })
    )
  }

  // Sanitized handler for price decimal inputs
  const handlePriceChange = (
    id: string,
    field: "price" | "compareAtPrice" | "costPrice",
    inputValue: string
  ) => {
    if (inputValue === "") {
      handleUpdateRow(id, field, "")
      return
    }
    let sanitized = inputValue.replace(/,/g, ".").replace(/[^0-9.]/g, "")
    const parts = sanitized.split(".")
    if (parts.length > 2) {
      sanitized = `${parts[0]}.${parts.slice(1).join("")}`
    }
    handleUpdateRow(id, field, sanitized)
  }

  // Sanitized handler for integer stock inputs
  const handleIntegerChange = (
    id: string,
    field: "initialStock" | "reorderLevel",
    inputValue: string
  ) => {
    if (inputValue === "") {
      handleUpdateRow(id, field, "")
      return
    }
    const sanitized = inputValue.replace(/[^0-9]/g, "")
    handleUpdateRow(id, field, sanitized)
  }

  // Sync Row 1 Price across all rows
  const handleApplyPriceToAll = () => {
    if (rows.length === 0) return
    const firstPrice = rows[0].price
    const firstCompare = rows[0].compareAtPrice
    const firstCost = rows[0].costPrice
    if (!firstPrice || parseFloat(firstPrice) <= 0) return
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        price: firstPrice,
        ...(firstCompare ? { compareAtPrice: firstCompare } : {}),
        ...(firstCost ? { costPrice: firstCost } : {}),
      }))
    )
  }

  // Sync Row 1 Stock across all rows
  const handleApplyStockToAll = () => {
    if (rows.length === 0) return
    const firstStock = rows[0].initialStock
    if (!firstStock) return
    setRows((prev) => prev.map((r) => ({ ...r, initialStock: firstStock })))
  }

  // Create new Master Attribute from top toolbar
  const handleCreateTopAttrSubmit = async () => {
    setTopAttrError(null)
    const rawName = topAttrName.trim()
    const rawVal = topAttrVal.trim()
    if (!rawName) {
      setTopAttrError("Attribute name is required.")
      return
    }

    try {
      await createAttrMutation.mutateAsync({
        name: rawName,
        values: rawVal ? [rawVal] : undefined,
        isGlobal: isSuperAdmin ? true : false,
        status: isSuperAdmin ? "APPROVED" : "PENDING_APPROVAL",
      })
      await refetchAttributes()
      setTopAttrName("")
      setTopAttrVal("")
      setIsTopAttrOpen(false)
    } catch (err: any) {
      setTopAttrError(err.response?.data?.message || err.message || "Failed to create attribute.")
    }
  }

  // Submit batch creation to API
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

      const parsedPrice = parseFloat(r.price)
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setError(`Row #${i + 1} (${cleanSku}): Price must be a valid number greater than 0.`)
        return
      }

      const parsedCompare = r.compareAtPrice ? parseFloat(r.compareAtPrice) : null
      if (
        parsedCompare !== null &&
        !isNaN(parsedCompare) &&
        parsedCompare > 0 &&
        parsedCompare < parsedPrice
      ) {
        setError(`Row #${i + 1} (${cleanSku}): Compare-at price (MRP) must be greater than or equal to selling price.`)
        return
      }

      const parsedCost = r.costPrice ? parseFloat(r.costPrice) : null
      const parsedStock = r.initialStock ? parseInt(r.initialStock, 10) : 0
      const parsedReorder = r.reorderLevel ? parseInt(r.reorderLevel, 10) : null

      variants.push({
        sku: cleanSku,
        price: parsedPrice,
        status: r.status || "ACTIVE",
        attributeValueIds: r.attributeValueIds || [],
        initialStock: !isNaN(parsedStock) && parsedStock >= 0 ? parsedStock : 0,
        reorderLevel: parsedReorder !== null && !isNaN(parsedReorder) && parsedReorder >= 0 ? parsedReorder : null,
        barcode: r.barcode.trim() || null,
        compareAtPrice: parsedCompare && parsedCompare > 0 ? parsedCompare : null,
        costPrice: parsedCost && parsedCost > 0 ? parsedCost : null,
        images: r.images && r.images.length > 0 ? r.images : [],
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
      <DialogContent className="sm:max-w-[1140px] w-[96vw] max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-border/70 bg-muted/10">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Layers className="size-4" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold">
                      Batch Create Multiple Variants
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      Configure multiple SKU variants directly. Select 2 or more attributes for each variant row.
                    </DialogDescription>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyPriceToAll}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    title="Copy Row #1 price to all rows"
                  >
                    <Wand2 className="size-3 text-indigo-600" />
                    <span>Sync Price</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyStockToAll}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    title="Copy Row #1 stock to all rows"
                  >
                    <span>Sync Stock</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTopAttrOpen(!isTopAttrOpen)}
                    className="h-8 gap-1 text-xs text-foreground hover:bg-muted font-medium"
                  >
                    <Tag className="size-3 text-indigo-600 dark:text-indigo-400" />
                    <span>{isSuperAdmin ? "+ Global Attribute" : "+ Propose Attribute"}</span>
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

            {/* Top Collapsible: Create Master Attribute */}
            {isTopAttrOpen && (
              <div className="mt-3 p-3 rounded-xl border border-indigo-200/80 bg-indigo-50/50 dark:border-indigo-900/60 dark:bg-indigo-950/40 space-y-2 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Tag className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-foreground">
                      {isSuperAdmin ? "Create Global Master Attribute" : "Propose New Attribute"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTopAttrOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    value={topAttrName}
                    onChange={(e) => setTopAttrName(e.target.value)}
                    placeholder="Attribute Name (e.g. Material, Storage)"
                    className="h-7.5 text-xs bg-background"
                  />
                  <Input
                    value={topAttrVal}
                    onChange={(e) => setTopAttrVal(e.target.value)}
                    placeholder="Initial Value (e.g. Cotton, 256GB)"
                    className="h-7.5 text-xs bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateTopAttrSubmit}
                    disabled={createAttrMutation.isPending || !topAttrName.trim()}
                    className="h-7.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    {createAttrMutation.isPending ? (
                      <Loader2 className="size-3 animate-spin mr-1" />
                    ) : (
                      <Plus className="size-3 mr-1" />
                    )}
                    <span>Save Master Attribute</span>
                  </Button>
                </div>
                {topAttrError && <p className="text-[11px] text-rose-500">{topAttrError}</p>}
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">
                Configured Variant Rows ({rows.length})
              </span>
              <span className="text-[11px] text-muted-foreground">
                Each row can have 2 or more attributes attached (Color, Size, Material, etc.)
              </span>
            </div>

            <div className="rounded-xl border border-border/70 overflow-x-auto shadow-2xs">
              <table className="w-full min-w-[1180px] text-xs">
                <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground border-b border-border/60">
                  <tr>
                    <th className="p-3 text-center w-10 min-w-[40px]">#</th>
                    <th className="p-3 text-left min-w-[160px] w-44 whitespace-nowrap">SKU Code *</th>
                    <th className="p-3 text-left min-w-[100px] w-28 whitespace-nowrap">Media</th>
                    <th className="p-3 text-left min-w-[240px] whitespace-nowrap">Attributes (2+ per variant)</th>
                    <th className="p-3 text-left min-w-[125px] w-32 whitespace-nowrap">Price (₹) *</th>
                    <th className="p-3 text-left min-w-[135px] w-36 whitespace-nowrap">MRP / Compare (₹)</th>
                    <th className="p-3 text-left min-w-[115px] w-30 whitespace-nowrap">Cost (₹)</th>
                    <th className="p-3 text-left min-w-[95px] w-24 whitespace-nowrap">Stock</th>
                    <th className="p-3 text-left min-w-[90px] w-22 whitespace-nowrap">Low Stock</th>
                    <th className="p-3 text-left min-w-[130px] w-36 whitespace-nowrap">Barcode (UPC)</th>
                    <th className="p-3 text-left min-w-[115px] w-28 whitespace-nowrap">Status</th>
                    <th className="p-3 text-right min-w-[80px] w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rows.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                      {/* Row Index */}
                      <td className="p-2.5 text-center text-muted-foreground font-mono text-[11px] w-10 min-w-[40px]">
                        {idx + 1}
                      </td>

                      {/* SKU */}
                      <td className="p-2.5 min-w-[160px] w-44">
                        <Input
                          value={r.sku}
                          onChange={(e) => handleUpdateRow(r.id, "sku", e.target.value.toUpperCase())}
                          placeholder="e.g. NK-AIR-01"
                          className="h-8 text-xs font-mono uppercase w-full"
                          required
                        />
                      </td>

                      {/* Variant Media & Image Picker with Drag & Drop */}
                      <td className="p-2.5 min-w-[100px] w-28">
                        <RowImagePicker
                          productId={productId}
                          sku={r.sku}
                          rowLabel={`Row #${idx + 1}`}
                          images={r.images || []}
                          onChange={(imgs) => handleUpdateRow(r.id, "images", imgs)}
                          className="h-8 w-full"
                        />
                      </td>

                      {/* Dedicated Per-Variant Attribute Selector */}
                      <td className="p-2.5 min-w-[240px]">
                        <RowAttributePicker
                          selectedIds={r.attributeValueIds}
                          onChange={(ids, labels) => handleRowAttributesChange(r.id, ids, labels)}
                          rowLabel={`Row #${idx + 1}`}
                        />
                      </td>

                      {/* Selling Price */}
                      <td className="p-2.5 min-w-[125px] w-32">
                        <div className="relative w-full">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-medium pointer-events-none select-none">
                            ₹
                          </span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={r.price}
                            onChange={(e) => handlePriceChange(r.id, "price", e.target.value)}
                            placeholder="149.99"
                            className="h-8 pl-6 pr-2 text-xs font-mono w-full min-w-0"
                            required
                          />
                        </div>
                      </td>

                      {/* Compare At Price */}
                      <td className="p-2.5 min-w-[135px] w-36">
                        <div className="relative w-full">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-medium pointer-events-none select-none">
                            ₹
                          </span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={r.compareAtPrice}
                            onChange={(e) => handlePriceChange(r.id, "compareAtPrice", e.target.value)}
                            placeholder="199.99"
                            className="h-8 pl-6 pr-2 text-xs font-mono w-full min-w-0"
                          />
                        </div>
                      </td>

                      {/* Cost Price */}
                      <td className="p-2.5 min-w-[115px] w-30">
                        <div className="relative w-full">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-medium pointer-events-none select-none">
                            ₹
                          </span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={r.costPrice}
                            onChange={(e) => handlePriceChange(r.id, "costPrice", e.target.value)}
                            placeholder="80.00"
                            className="h-8 pl-6 pr-2 text-xs font-mono w-full min-w-0"
                          />
                        </div>
                      </td>

                      {/* Initial Stock */}
                      <td className="p-2.5 min-w-[95px] w-24">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={r.initialStock}
                          onChange={(e) => handleIntegerChange(r.id, "initialStock", e.target.value)}
                          placeholder="10"
                          className="h-8 text-xs font-mono w-full min-w-0"
                        />
                      </td>

                      {/* Reorder Level */}
                      <td className="p-2.5 min-w-[90px] w-22">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={r.reorderLevel}
                          onChange={(e) => handleIntegerChange(r.id, "reorderLevel", e.target.value)}
                          placeholder="5"
                          className="h-8 text-xs font-mono w-full min-w-0"
                        />
                      </td>

                      {/* Barcode */}
                      <td className="p-2.5 min-w-[130px] w-36">
                        <Input
                          value={r.barcode}
                          onChange={(e) => handleUpdateRow(r.id, "barcode", e.target.value)}
                          placeholder="012345678901"
                          className="h-8 text-xs font-mono w-full min-w-0"
                        />
                      </td>

                      {/* Status */}
                      <td className="p-2.5 min-w-[115px] w-28">
                        <select
                          value={r.status}
                          onChange={(e) => handleUpdateRow(r.id, "status", e.target.value as VariantStatus)}
                          aria-label="Variant Status"
                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring font-medium"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="DRAFT">DRAFT</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </td>

                      {/* Actions (Duplicate & Delete) */}
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDuplicateRow(r.id)}
                            title="Duplicate row"
                            className="size-7 text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRow(r.id)}
                            disabled={rows.length <= 1}
                            title="Remove row"
                            className="size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 disabled:opacity-30"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Row footer button */}
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="h-8 text-xs gap-1.5 border-dashed border-border/80 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 w-full"
              >
                <Plus className="size-3.5" />
                <span>Add Another Variant Row</span>
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/70 bg-muted/10 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Total <strong className="text-foreground">{rows.length}</strong> variant(s) configured
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={batchMutation.isPending}
                className="text-xs h-8.5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
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
                    <Layers className="size-3.5" />
                    <span>Create {rows.length} Variants</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
