/**
 * @file page.tsx
 * @description Dedicated Full-Page Batch Variant Creation Console.
 * Allows merchants and vendors to configure multiple SKU variants with separate attribute facilities (2+ attributes per variant).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Layers,
  Plus,
  Trash2,
  Copy,
  Wand2,
  AlertCircle,
  Tag,
  Check,
  Loader2,
  Sparkles,
  Save,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/common"
import { useProductQuery } from "@/hooks/use-product-query"
import { useBatchCreateVariantsMutation } from "@/hooks/use-variant-query"
import { useCreateAttributeMutation, useAttributesQuery } from "@/hooks/use-attribute-query"
import { usePermissions } from "@/hooks/use-permissions"
import { RowAttributePicker } from "@/components/variants/row-attribute-picker"
import type { BatchCreateVariantItem, VariantStatus } from "@/types/variant"

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
}

export default function BatchCreateVariantsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = (params?.id as string) || ""

  const { isSuperAdmin } = usePermissions()
  const { data: product, isLoading: isProductLoading } = useProductQuery(productId)
  const batchMutation = useBatchCreateVariantsMutation(productId)

  const baseSku = (product?.slug || product?.name || "SKU")
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
    },
  ])

  const [error, setError] = React.useState<string | null>(null)

  // Top quick attribute creation
  const [isTopAttrOpen, setIsTopAttrOpen] = React.useState(false)
  const [topAttrName, setTopAttrName] = React.useState("")
  const [topAttrVal, setTopAttrVal] = React.useState("")
  const [topAttrError, setTopAttrError] = React.useState<string | null>(null)
  const createAttrMutation = useCreateAttributeMutation()
  const { refetch: refetchAttributes } = useAttributesQuery({ limit: 100 })

  // Helper to format SKU suffix based on attribute values
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

  // Handle per-row attribute selection change
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

  // Add a new empty row
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
      },
    ])
  }

  // Bulk add N rows
  const handleAddMultipleRows = (count: number) => {
    const defaultPrice = rows.length > 0 && rows[0].price ? rows[0].price : "99.99"
    const defaultStock = rows.length > 0 && rows[0].initialStock ? rows[0].initialStock : "10"

    const newRows: FormVariantRow[] = []
    for (let i = 0; i < count; i++) {
      const nextIndex = rows.length + i + 1
      const padded = nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`
      newRows.push({
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
      })
    }
    setRows((prev) => [...prev, ...newRows])
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
      },
    ])
  }

  // Remove a row
  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  // Update specific cell in row
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

  // Sync Row 1 Price across all rows
  const handleApplyPriceToAll = () => {
    if (rows.length === 0) return
    const firstPrice = rows[0].price
    if (!firstPrice || parseFloat(firstPrice) <= 0) return
    setRows((prev) => prev.map((r) => ({ ...r, price: firstPrice })))
  }

  // Sync Row 1 Stock across all rows
  const handleApplyStockToAll = () => {
    if (rows.length === 0) return
    const firstStock = rows[0].initialStock
    if (!firstStock) return
    setRows((prev) => prev.map((r) => ({ ...r, initialStock: firstStock })))
  }

  // Save new master attribute from toolbar
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

  // Submit batch variants to backend
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
        setError(`Row #${i + 1}: Duplicate SKU '${cleanSku}' in batch. Each SKU must be unique.`)
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
      })
    }

    batchMutation.mutate(
      { variants },
      {
        onSuccess: () => {
          router.push(`/products/${productId}/variants`)
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
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col gap-2">
        <Link
          href={`/products/${productId}/variants`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Product Variants</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="size-6 text-indigo-600 dark:text-indigo-400" />
              <span>Batch Create Product Variants</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Configure and create multiple SKU variants for{" "}
              <strong className="text-foreground">
                {product?.name || "Product"}
              </strong>
              . Select 2 or more attributes for each variant.
            </p>
          </div>

          {/* Top Global Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyPriceToAll}
              className="h-8.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              title="Copy Row #1 price to all rows"
            >
              <Wand2 className="size-3.5 text-indigo-600" />
              <span>Sync Price</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyStockToAll}
              className="h-8.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              title="Copy Row #1 stock to all rows"
            >
              <span>Sync Stock</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTopAttrOpen(!isTopAttrOpen)}
              className="h-8.5 gap-1.5 text-xs text-foreground hover:bg-muted font-medium"
            >
              <Tag className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{isSuperAdmin ? "+ Global Attribute" : "+ Propose Attribute"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="h-8.5 gap-1 text-xs border-indigo-200 text-indigo-600 dark:border-indigo-900/60 dark:text-indigo-400 hover:bg-indigo-500/10 font-semibold"
            >
              <Plus className="size-3.5" />
              <span>Add Variant Row</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Top Collapsible: Create Master Attribute */}
      {isTopAttrOpen && (
        <div className="p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/50 dark:border-indigo-900/60 dark:bg-indigo-950/40 space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tag className="size-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-foreground">
                {isSuperAdmin ? "Create Global Master Attribute" : "Propose New Attribute"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTopAttrOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Input
              value={topAttrName}
              onChange={(e) => setTopAttrName(e.target.value)}
              placeholder="Attribute Name (e.g. Material, Storage)"
              className="h-8 text-xs bg-background"
            />
            <Input
              value={topAttrVal}
              onChange={(e) => setTopAttrVal(e.target.value)}
              placeholder="Initial Value (e.g. Cotton, 256GB)"
              className="h-8 text-xs bg-background"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleCreateTopAttrSubmit}
              disabled={createAttrMutation.isPending || !topAttrName.trim()}
              className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5"
            >
              {createAttrMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              <span>Save Master Attribute</span>
            </Button>
          </div>
          {topAttrError && <p className="text-[11px] text-rose-500">{topAttrError}</p>}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Variants Table Card */}
        <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">
                Configured Variant Items
              </span>
              <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
                {rows.length} {rows.length === 1 ? "variant" : "variants"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Click &quot;+ Select Attributes&quot; in any row to attach 2 or more attributes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-xs">
              <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="p-3 text-left w-12 text-center">#</th>
                  <th className="p-3 text-left min-w-[170px]">SKU Code *</th>
                  <th className="p-3 text-left min-w-[280px]">Attributes (2+ per variant)</th>
                  <th className="p-3 text-left w-28">Price (₹) *</th>
                  <th className="p-3 text-left w-28">MRP / Compare (₹)</th>
                  <th className="p-3 text-left w-24">Cost (₹)</th>
                  <th className="p-3 text-left w-24">Stock</th>
                  <th className="p-3 text-left w-20">Low Stock</th>
                  <th className="p-3 text-left min-w-[130px]">Barcode (UPC)</th>
                  <th className="p-3 text-left w-28">Status</th>
                  <th className="p-3 text-right w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    {/* Index */}
                    <td className="p-3 text-center text-muted-foreground font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* SKU */}
                    <td className="p-3">
                      <Input
                        value={r.sku}
                        onChange={(e) => handleUpdateRow(r.id, "sku", e.target.value.toUpperCase())}
                        placeholder="e.g. NK-AIR-01"
                        className="h-8 text-xs font-mono uppercase"
                        required
                      />
                    </td>

                    {/* Dedicated Per-Variant Attribute Selector */}
                    <td className="p-3">
                      <RowAttributePicker
                        selectedIds={r.attributeValueIds}
                        onChange={(ids, labels) => handleRowAttributesChange(r.id, ids, labels)}
                        rowLabel={`Row #${idx + 1}`}
                      />
                    </td>

                    {/* Price */}
                    <td className="p-3">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={r.price}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            handleUpdateRow(r.id, "price", val)
                          }
                        }}
                        placeholder="149.99"
                        className="h-8 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                      />
                    </td>

                    {/* Compare Price */}
                    <td className="p-3">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={r.compareAtPrice}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            handleUpdateRow(r.id, "compareAtPrice", val)
                          }
                        }}
                        placeholder="199.99"
                        className="h-8 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>

                    {/* Cost Price */}
                    <td className="p-3">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={r.costPrice}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            handleUpdateRow(r.id, "costPrice", val)
                          }
                        }}
                        placeholder="80.00"
                        className="h-8 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>

                    {/* Initial Stock */}
                    <td className="p-3">
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={r.initialStock}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === "" || /^\d+$/.test(val)) {
                            handleUpdateRow(r.id, "initialStock", val)
                          }
                        }}
                        placeholder="10"
                        className="h-8 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>

                    {/* Low Stock Reorder */}
                    <td className="p-3">
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={r.reorderLevel}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === "" || /^\d+$/.test(val)) {
                            handleUpdateRow(r.id, "reorderLevel", val)
                          }
                        }}
                        placeholder="5"
                        className="h-8 text-xs font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>

                    {/* Barcode */}
                    <td className="p-3">
                      <Input
                        value={r.barcode}
                        onChange={(e) => handleUpdateRow(r.id, "barcode", e.target.value)}
                        placeholder="012345678901"
                        className="h-8 text-xs font-mono"
                      />
                    </td>

                    {/* Status */}
                    <td className="p-3">
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

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateRow(r.id)}
                          title="Duplicate row"
                          className="size-7.5 text-muted-foreground hover:text-foreground"
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
                          className="size-7.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 disabled:opacity-30 cursor-pointer"
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

          {/* Table Bottom Action Bar */}
          <div className="p-3 bg-muted/20 border-t border-border/60 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="h-8 text-xs gap-1.5 border-dashed border-border/80 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                <Plus className="size-3.5" />
                <span>Add Another Row</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleAddMultipleRows(5)}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <span>+ Add 5 Rows</span>
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Total <strong className="text-foreground">{rows.length}</strong> variant(s) ready to create
            </div>
          </div>
        </div>

        {/* Bottom Submission Bar */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/products/${productId}/variants`)}
            disabled={batchMutation.isPending}
            className="text-xs h-9 px-4"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={batchMutation.isPending}
            className="text-xs h-9 px-5 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
          >
            {batchMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Creating {rows.length} Variants...</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>Create & Publish {rows.length} Variants</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
