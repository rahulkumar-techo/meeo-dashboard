/**
 * @file inventory-table.tsx
 * @description Master data table for catalog inventory stock levels with action triggers, live stock allocation bars, and health indicators.
 */

"use client"

import * as React from "react"
import {
  PackagePlus,
  PackageMinus,
  SlidersHorizontal,
  BookmarkPlus,
  Copy,
  Check,
  AlertTriangle,
  History,
  Barcode,
  Layers,
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
import { StatusBadge, EmptyState, DataTablePagination } from "@/components/common"
import type { InventoryRecord } from "@/types/inventory"

export interface InventoryTableProps {
  items: InventoryRecord[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  hasActiveFilters?: boolean
  onAddStock: (item: InventoryRecord) => void
  onRemoveStock: (item: InventoryRecord) => void
  onAdjustStock: (item: InventoryRecord) => void
  onReserveStock: (item: InventoryRecord) => void
  onViewTransactions: (variantId: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onResetFilters?: () => void
}

export function InventoryTable({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  hasActiveFilters,
  onAddStock,
  onRemoveStock,
  onAdjustStock,
  onReserveStock,
  onViewTransactions,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
}: InventoryTableProps) {
  const [copiedSku, setCopiedSku] = React.useState<string | null>(null)

  const handleCopySku = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(sku)
    setCopiedSku(sku)
    setTimeout(() => setCopiedSku(null), 2000)
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 font-semibold text-foreground">PRODUCT / VARIANT SKU</TableHead>
              <TableHead className="font-semibold text-foreground">BARCODE</TableHead>
              <TableHead className="font-semibold text-center text-foreground">AVAILABLE</TableHead>
              <TableHead className="font-semibold text-center text-foreground">RESERVED</TableHead>
              <TableHead className="font-semibold text-center text-foreground">TOTAL STOCK</TableHead>
              <TableHead className="font-semibold text-foreground">REORDER LEVEL</TableHead>
              <TableHead className="font-semibold text-foreground">STOCK HEALTH</TableHead>
              <TableHead className="text-right pr-4 font-semibold text-foreground">QUICK ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-xs">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell className="pl-4 py-4">
                    <div className="space-y-1.5">
                      <div className="h-4 w-40 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted/60 rounded" />
                    </div>
                  </TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-12 mx-auto bg-muted rounded" /></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-12 mx-auto bg-muted rounded" /></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-12 mx-auto bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-20 bg-muted rounded" /></TableCell>
                  <TableCell className="text-right pr-4"><div className="h-7 w-32 ml-auto bg-muted rounded" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <EmptyState
                    title="No Inventory Records Found"
                    description={
                      hasActiveFilters
                        ? "No inventory matches your active search or filters."
                        : "No inventory stock records exist yet in the catalog."
                    }
                    actionLabel={hasActiveFilters ? "Reset Filters" : undefined}
                    onAction={onResetFilters}
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const productName = item.variant?.product?.name || "Product Variant"
                const sku = item.variant?.sku || item.variantId
                const barcode = item.variant?.barcode
                const available = item.availableQuantity ?? 0
                const reserved = item.reservedQuantity ?? 0
                const total = item.totalStock ?? available + reserved
                const reorder = item.reorderLevel ?? 10
                const isOutOfStock = available === 0
                const isLowStock = item.isLowStock ?? available <= reorder

                // Compute allocation percentage
                const availablePercent = total > 0 ? (available / total) * 100 : 0
                const reservedPercent = total > 0 ? (reserved / total) * 100 : 0

                return (
                  <TableRow key={item.id || item.variantId} className="hover:bg-muted/40 transition-colors">
                    {/* Product & SKU */}
                    <TableCell className="pl-4 py-3">
                      <div>
                        <p className="font-semibold text-foreground line-clamp-1">{productName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-mono text-muted-foreground">{sku}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopySku(sku, e)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                            title="Copy SKU"
                          >
                            {copiedSku === sku ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </TableCell>

                    {/* Barcode */}
                    <TableCell className="font-mono text-muted-foreground">
                      {barcode ? (
                        <span className="flex items-center gap-1">
                          <Barcode className="size-3.5 text-muted-foreground/70" />
                          <span>{barcode}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 italic">—</span>
                      )}
                    </TableCell>

                    {/* Available Quantity */}
                    <TableCell className="text-center font-mono font-bold text-sm">
                      <span
                        className={
                          available === 0
                            ? "text-rose-600"
                            : isLowStock
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
                      >
                        {available.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Reserved Quantity */}
                    <TableCell className="text-center font-mono text-xs">
                      {reserved > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                          {reserved.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">0</span>
                      )}
                    </TableCell>

                    {/* Total Stock & Visual Ratio Bar */}
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-foreground">
                          {total.toLocaleString()}
                        </span>
                        {total > 0 && (
                          <div className="h-1.5 w-16 mx-auto bg-muted rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${availablePercent}%` }}
                              className="bg-emerald-500 h-full"
                              title={`Available: ${available}`}
                            />
                            <div
                              style={{ width: `${reservedPercent}%` }}
                              className="bg-cyan-500 h-full"
                              title={`Reserved: ${reserved}`}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Reorder Level */}
                    <TableCell className="font-mono text-muted-foreground">
                      <span>{reorder} units</span>
                    </TableCell>

                    {/* Stock Health */}
                    <TableCell>
                      {isOutOfStock ? (
                        <Badge variant="destructive" className="text-[10px] font-semibold uppercase">
                          Out of Stock
                        </Badge>
                      ) : isLowStock ? (
                        <Badge variant="outline" className="text-[10px] font-semibold text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40 gap-1">
                          <AlertTriangle className="size-3" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>

                    {/* Quick Action Buttons */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onAddStock(item)}
                          className="hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50"
                          title="Add Stock (Restock)"
                        >
                          <PackagePlus className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onRemoveStock(item)}
                          disabled={available === 0}
                          className="hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50"
                          title="Remove Stock (Damage/Shrinkage)"
                        >
                          <PackageMinus className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onAdjustStock(item)}
                          className="hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/50"
                          title="Reconcile Count / Set Reorder Level"
                        >
                          <SlidersHorizontal className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onReserveStock(item)}
                          disabled={available === 0}
                          className="hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-cyan-950/50"
                          title="Reserve Hold for Checkout"
                        >
                          <BookmarkPlus className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onViewTransactions(item.variantId)}
                          className="hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="View Transaction Audit Ledger"
                        >
                          <History className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        currentPage={page}
        totalPages={totalPages || 1}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
