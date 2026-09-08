/**
 * @file inventory-transactions-table.tsx
 * @description Paginated data table for the immutable transaction audit ledger.
 * Displays all stock movements with transaction type badges, reference links, notes, and filters.
 */

"use client"

import * as React from "react"
import {
  History,
  PlusCircle,
  MinusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  SlidersHorizontal,
  Search,
  Filter,
  Calendar,
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
import { Input } from "@/components/ui/input"
import { EmptyState, DataTablePagination } from "@/components/common"
import type {
  InventoryTransaction,
  InventoryTransactionType,
} from "@/types/inventory"

export interface InventoryTransactionsTableProps {
  items: InventoryTransaction[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  selectedType: string
  selectedReferenceType: string
  variantFilter: string
  onTypeChange: (type: string) => void
  onReferenceTypeChange: (refType: string) => void
  onVariantFilterChange: (variantId: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onResetFilters: () => void
}

export function InventoryTransactionsTable({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  selectedType,
  selectedReferenceType,
  variantFilter,
  onTypeChange,
  onReferenceTypeChange,
  onVariantFilterChange,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
}: InventoryTransactionsTableProps) {
  // Helper to render type badge
  const renderTypeBadge = (type: InventoryTransactionType) => {
    switch (type) {
      case "STOCK_ADDED":
        return (
          <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 gap-1 text-[10.5px]">
            <PlusCircle className="size-3" />
            <span>STOCK ADDED</span>
          </Badge>
        )
      case "STOCK_REMOVED":
        return (
          <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 gap-1 text-[10.5px]">
            <MinusCircle className="size-3" />
            <span>STOCK REMOVED</span>
          </Badge>
        )
      case "ORDER_RESERVED":
        return (
          <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-300 gap-1 text-[10.5px]">
            <Clock className="size-3" />
            <span>CHECKOUT RESERVED</span>
          </Badge>
        )
      case "ORDER_CONFIRMED":
        return (
          <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-300 gap-1 text-[10.5px]">
            <CheckCircle2 className="size-3" />
            <span>ORDER COMMITTED</span>
          </Badge>
        )
      case "ORDER_CANCELLED":
        return (
          <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 gap-1 text-[10.5px]">
            <XCircle className="size-3" />
            <span>RESERVATION RELEASED</span>
          </Badge>
        )
      case "RETURNED":
        return (
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-300 gap-1 text-[10.5px]">
            <RotateCcw className="size-3" />
            <span>RETURN RESTOCKED</span>
          </Badge>
        )
      case "MANUAL_ADJUSTMENT":
        return (
          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 gap-1 text-[10.5px]">
            <SlidersHorizontal className="size-3" />
            <span>MANUAL AUDIT</span>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[10.5px]">
            {type}
          </Badge>
        )
    }
  }

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  const hasActiveFilters = Boolean(
    selectedType || selectedReferenceType || variantFilter
  )

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-border bg-card p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Transaction Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
          >
            <option value="">All Movement Types</option>
            <option value="STOCK_ADDED">Stock Added (Restock)</option>
            <option value="STOCK_REMOVED">Stock Removed (Damage)</option>
            <option value="ORDER_RESERVED">Checkout Holds</option>
            <option value="ORDER_CONFIRMED">Order Confirmations</option>
            <option value="ORDER_CANCELLED">Reservation Releases</option>
            <option value="RETURNED">Customer Returns</option>
            <option value="MANUAL_ADJUSTMENT">Manual Adjustments</option>
          </select>

          {/* Reference Type Filter */}
          <select
            value={selectedReferenceType}
            onChange={(e) => onReferenceTypeChange(e.target.value)}
            className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
          >
            <option value="">All Reference Types</option>
            <option value="PURCHASE_ORDER">Purchase Orders</option>
            <option value="DAMAGE_REPORT">Damage Reports</option>
            <option value="RESERVATION">Checkout Reservations</option>
            <option value="ORDER">Orders</option>
          </select>

          {variantFilter && (
            <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-foreground font-mono">
              <span>Variant: {variantFilter.slice(0, 10)}...</span>
              <button
                type="button"
                onClick={() => onVariantFilterChange("")}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 text-xs">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 font-semibold text-foreground">TIMESTAMP</TableHead>
                <TableHead className="font-semibold text-foreground">MOVEMENT TYPE</TableHead>
                <TableHead className="font-semibold text-foreground">PRODUCT / SKU</TableHead>
                <TableHead className="font-semibold text-center text-foreground">QTY</TableHead>
                <TableHead className="font-semibold text-foreground">REFERENCE</TableHead>
                <TableHead className="pr-4 font-semibold text-foreground">AUDIT NOTE</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    <TableCell className="pl-4 py-3.5"><div className="h-4 w-28 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-5 w-24 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-36 bg-muted rounded" /></TableCell>
                    <TableCell className="text-center"><div className="h-5 w-10 mx-auto bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                    <TableCell className="pr-4"><div className="h-4 w-40 bg-muted rounded" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      title="No Audit Transactions Found"
                      description={
                        hasActiveFilters
                          ? "No ledger records matched your active filters."
                          : "No stock movement transactions have been logged yet."
                      }
                      actionLabel={hasActiveFilters ? "Reset Filters" : undefined}
                      onAction={onResetFilters}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((tx) => {
                  const productName = tx.variant?.product?.name || "Product Variant"
                  const sku = tx.variant?.sku || tx.variantId

                  return (
                    <TableRow key={tx.id} className="hover:bg-muted/40 transition-colors">
                      {/* Timestamp */}
                      <TableCell className="pl-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(tx.createdAt)}
                      </TableCell>

                      {/* Movement Type */}
                      <TableCell>{renderTypeBadge(tx.type)}</TableCell>

                      {/* Product & SKU */}
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{productName}</p>
                          <p className="text-[10.5px] font-mono text-muted-foreground">SKU: {sku}</p>
                        </div>
                      </TableCell>

                      {/* Quantity */}
                      <TableCell className="text-center font-mono font-bold">
                        <span
                          className={
                            tx.type === "STOCK_ADDED" || tx.type === "RETURNED"
                              ? "text-emerald-600"
                              : tx.type === "STOCK_REMOVED"
                              ? "text-rose-600"
                              : tx.type === "ORDER_RESERVED"
                              ? "text-cyan-600"
                              : "text-foreground"
                          }
                        >
                          {tx.quantity > 0 ? tx.quantity : Math.abs(tx.quantity)}
                        </span>
                      </TableCell>

                      {/* Reference */}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {tx.referenceId ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{tx.referenceId}</span>
                            {tx.referenceType && (
                              <span className="text-[10px] uppercase text-muted-foreground">
                                {tx.referenceType}
                              </span>
                            )}
                          </div>
                        ) : tx.referenceType ? (
                          <span className="text-[11px]">{tx.referenceType}</span>
                        ) : (
                          <span className="text-muted-foreground/50 italic">—</span>
                        )}
                      </TableCell>

                      {/* Audit Note */}
                      <TableCell className="pr-4 text-xs text-muted-foreground">
                        {tx.note || <span className="italic text-muted-foreground/50">No note provided</span>}
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
    </div>
  )
}
