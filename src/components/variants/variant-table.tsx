/**
 * @file variant-table.tsx
 * @description Data table for displaying and managing product variants, stock levels, and pricing.
 */

"use client"

import * as React from "react"
import {
  Edit2,
  Trash2,
  Barcode,
  Layers,
  Copy,
  Check,
  Plus,
  Grid,
  AlertTriangle,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState, DataTablePagination } from "@/components/common"
import { formatCurrency as globalFormatCurrency } from "@/lib/formatters"
import type { ProductVariant } from "@/types/variant"

export interface VariantTableProps {
  items: ProductVariant[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  hasActiveFilters?: boolean
  onCreateClick: () => void
  onBatchClick: () => void
  onEditVariant: (variant: ProductVariant) => void
  onDeleteVariant: (variant: ProductVariant) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function VariantTable({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  hasActiveFilters,
  onCreateClick,
  onBatchClick,
  onEditVariant,
  onDeleteVariant,
  onPageChange,
  onPageSizeChange,
}: VariantTableProps) {
  const [copiedSku, setCopiedSku] = React.useState<string | null>(null)

  const handleCopySku = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(sku)
    setCopiedSku(sku)
    setTimeout(() => setCopiedSku(null), 2000)
  }

  const formatCurrency = (val?: number | string | null) => {
    if (val === null || val === undefined || val === "") return "-"
    const num = typeof val === "number" ? val : parseFloat(String(val))
    if (isNaN(num)) return "-"
    return globalFormatCurrency(num)
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader className="bg-muted/40 text-xs">
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4 font-semibold text-foreground">SKU / Barcode</TableHead>
            <TableHead className="font-semibold text-foreground">Attributes & Options</TableHead>
            <TableHead className="font-semibold text-foreground">Pricing & Margin</TableHead>
            <TableHead className="font-semibold text-foreground">Inventory Stock</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="text-right pr-4 font-semibold text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="text-xs">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx} className="animate-pulse">
                <TableCell className="pl-4 py-4"><div className="h-4 w-28 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-14 bg-muted rounded" /></TableCell>
                <TableCell className="pr-4 text-right"><div className="h-4 w-12 bg-muted rounded ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center">
                <EmptyState
                  title={hasActiveFilters ? "No variants match search" : "No Product Variants Created"}
                  description={
                    hasActiveFilters
                      ? "Try searching for a different SKU, barcode, or status filter."
                      : "Add individual SKU variants or use the Batch Matrix Generator to populate product options."
                  }
                >
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={onCreateClick}
                      className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Variant</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onBatchClick}
                      className="gap-1.5 text-xs border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                    >
                      <Grid className="size-3.5" />
                      <span>Matrix Generator</span>
                    </Button>
                  </div>
                </EmptyState>
              </TableCell>
            </TableRow>
          ) : (
            items.map((variant) => {
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
              const isLowStock = reorder !== null && stock <= reorder

              const numPrice =
                typeof variant.price === "number" ? variant.price : parseFloat(String(variant.price || 0))
              const numCompare =
                variant.compareAtPrice !== null && variant.compareAtPrice !== undefined && variant.compareAtPrice !== ""
                  ? typeof variant.compareAtPrice === "number"
                    ? variant.compareAtPrice
                    : parseFloat(String(variant.compareAtPrice))
                  : null
              const numCost =
                variant.costPrice !== null && variant.costPrice !== undefined && variant.costPrice !== ""
                  ? typeof variant.costPrice === "number"
                    ? variant.costPrice
                    : parseFloat(String(variant.costPrice))
                  : null

              // Calculate profit margin if costPrice exists
              const margin =
                numCost !== null && !isNaN(numCost) && numPrice > 0
                  ? Math.round(((numPrice - numCost) / numPrice) * 100)
                  : null

              return (
                <TableRow
                  key={variant.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* SKU & Barcode */}
                  <TableCell className="pl-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-foreground text-xs">
                          {variant.sku}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopySku(variant.sku, e)}
                          className="size-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          title="Copy SKU"
                        >
                          {copiedSku === variant.sku ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>

                      {variant.barcode && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                          <Barcode className="size-3 shrink-0" />
                          <span>{variant.barcode}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Attributes & Options */}
                  <TableCell>
                    {variant.attributeValues && variant.attributeValues.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {variant.attributeValues.map((av: any, idx) => {
                          const attrName = av.attributeValue?.attribute?.name || av.attribute?.name
                          const valStr = av.attributeValue?.value || av.value || ""
                          return (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-[10px] font-medium px-2 py-0.5 bg-muted/60"
                            >
                              {attrName ? `${attrName}: ` : ""}
                              {valStr}
                            </Badge>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">
                        Standard Variant
                      </span>
                    )}
                  </TableCell>

                  {/* Pricing & Margin */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-foreground">
                          {formatCurrency(variant.price)}
                        </span>
                        {numCompare !== null && numCompare > numPrice && (
                          <span className="text-[11px] text-muted-foreground line-through">
                            {formatCurrency(numCompare)}
                          </span>
                        )}
                      </div>
                      {variant.costPrice && (
                        <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                          <span>Cost: {formatCurrency(variant.costPrice)}</span>
                          {margin !== null && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              ({margin}% margin)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Inventory Stock */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold ${
                            stock <= 0
                              ? "text-rose-600 dark:text-rose-400"
                              : isLowStock
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                          }`}
                        >
                          {stock} in stock
                        </span>
                        {isLowStock && stock > 0 && (
                          <span title="Low Stock Warning">
                            <AlertTriangle className="size-3 text-amber-500 fill-amber-500/20" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        {available} available • {reserved} reserved
                      </span>
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge
                      variant={
                        variant.status === "ACTIVE"
                          ? "default"
                          : variant.status === "DRAFT"
                          ? "outline"
                          : "secondary"
                      }
                      className="text-[10px] uppercase font-mono px-2 py-0"
                    >
                      {variant.status}
                    </Badge>
                  </TableCell>

                  {/* Action Buttons */}
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditVariant(variant)}
                        className="size-7 p-0 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-md"
                        title="Edit Variant"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteVariant(variant)}
                        className="size-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-md"
                        title="Delete Variant"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <DataTablePagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
