/**
 * @file order-table.tsx
 * @description Master data table for viewing and managing orders, with customer previews, fulfillment state triggers, and pagination.
 */

"use client"

import * as React from "react"
import {
  Eye,
  CheckCircle2,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  SlidersHorizontal,
  Copy,
  Check,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EmptyState, DataTablePagination } from "@/components/common"
import { formatCurrency as globalFormatCurrency } from "@/lib/formatters"
import { OrderStatusBadge } from "./order-status-badge"
import type { AdminOrder } from "@/types/order"

export interface OrderTableProps {
  items: AdminOrder[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  hasActiveFilters?: boolean
  onInspect: (order: AdminOrder) => void
  onConfirm: (order: AdminOrder) => void
  onProcess: (order: AdminOrder) => void
  onShip: (order: AdminOrder) => void
  onDeliver: (order: AdminOrder) => void
  onUpdateStatus: (order: AdminOrder) => void
  onCancel: (order: AdminOrder) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onResetFilters?: () => void
}

export function OrderTable({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  hasActiveFilters,
  onInspect,
  onConfirm,
  onProcess,
  onShip,
  onDeliver,
  onUpdateStatus,
  onCancel,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
}: OrderTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatCurrency = (val: number | string, curr: string = "INR") => {
    return globalFormatCurrency(val, { currency: curr || "INR" })
  }

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 font-semibold text-foreground">ORDER NUMBER</TableHead>
              <TableHead className="font-semibold text-foreground">CUSTOMER</TableHead>
              <TableHead className="font-semibold text-center text-foreground">ITEMS</TableHead>
              <TableHead className="font-semibold text-right text-foreground">TOTAL</TableHead>
              <TableHead className="font-semibold text-foreground">FULFILLMENT STATUS</TableHead>
              <TableHead className="font-semibold text-foreground">PLACED AT</TableHead>
              <TableHead className="text-right pr-4 font-semibold text-foreground">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-xs">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell className="pl-4 py-3.5"><div className="h-4 w-32 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-40 bg-muted rounded" /></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-8 mx-auto bg-muted rounded" /></TableCell>
                  <TableCell className="text-right"><div className="h-5 w-16 ml-auto bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-24 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                  <TableCell className="text-right pr-4"><div className="h-7 w-32 ml-auto bg-muted rounded" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState
                    title="No Orders Found"
                    description={
                      hasActiveFilters
                        ? "No orders match your search or filter criteria."
                        : "No platform orders have been placed yet."
                    }
                    actionLabel={hasActiveFilters ? "Reset Filters" : undefined}
                    onAction={onResetFilters}
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((order) => {
                const customerObj = order.customer || order.user
                const shippingAddr = order.shippingAddress || order.address
                const customerName =
                  customerObj?.firstName || customerObj?.lastName
                    ? `${customerObj.firstName || ""} ${customerObj.lastName || ""}`.trim()
                    : shippingAddr?.recipientName || "Guest Customer"
                const customerEmail = customerObj?.email || "No email on record"
                const initials = customerName
                  .split(" ")
                  .map((n) => n[0])
                  .filter(Boolean)
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "U"

                const itemCount = order.itemCount ?? order.items?.length ?? 1
                const status = order.status

                return (
                  <TableRow
                    key={order.id}
                    onClick={() => onInspect(order)}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    {/* Order Number */}
                    <TableCell className="pl-4 py-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-primary font-mono">
                          {order.orderNumber}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(order.orderNumber, e)}
                          className="text-muted-foreground hover:text-foreground p-0.5"
                          title="Copy Order Number"
                        >
                          {copiedId === order.orderNumber ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        UUID: {order.id.slice(0, 8)}...
                      </p>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6 border border-border">
                          <AvatarFallback className="text-[9px] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="max-w-[200px]">
                          <p className="font-semibold text-foreground truncate">
                            {customerName}
                          </p>
                          <p className="text-[10.5px] text-muted-foreground truncate">
                            {customerEmail}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Items Count */}
                    <TableCell className="text-center font-mono text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    </TableCell>

                    {/* Grand Total */}
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      {formatCurrency(order.grandTotal, order.currency)}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <OrderStatusBadge status={status} />
                    </TableCell>

                    {/* Timestamp */}
                    <TableCell className="text-muted-foreground whitespace-nowrap text-[11px]">
                      {formatTimestamp(order.createdAt)}
                    </TableCell>

                    {/* Quick Fulfillment Actions */}
                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Step progression buttons based on status */}
                        {(status === "PENDING" || status === "PAYMENT_PENDING") && (
                          <Button
                            size="sm"
                            onClick={() => onConfirm(order)}
                            className="h-7 px-2 text-[11px] gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            title="Confirm order & commit inventory"
                          >
                            <CheckCircle2 className="size-3" />
                            <span>Confirm</span>
                          </Button>
                        )}

                        {status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            onClick={() => onProcess(order)}
                            className="h-7 px-2 text-[11px] gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                            title="Begin warehouse picking & packing"
                          >
                            <Package className="size-3" />
                            <span>Process</span>
                          </Button>
                        )}

                        {status === "PROCESSING" && (
                          <Button
                            size="sm"
                            onClick={() => onShip(order)}
                            className="h-7 px-2 text-[11px] gap-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
                            title="Attach tracking & dispatch"
                          >
                            <Truck className="size-3" />
                            <span>Ship</span>
                          </Button>
                        )}

                        {status === "SHIPPED" && (
                          <Button
                            size="sm"
                            onClick={() => onDeliver(order)}
                            className="h-7 px-2 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                            title="Mark delivered"
                          >
                            <CheckCheck className="size-3" />
                            <span>Deliver</span>
                          </Button>
                        )}

                        {/* Transition and Cancel Options */}
                        {status !== "CANCELLED" && status !== "DELIVERED" && status !== "REFUNDED" && status !== "EXPIRED" && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onCancel(order)}
                            className="hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50"
                            title="Cancel Order & release stock"
                          >
                            <XCircle className="size-3.5 text-rose-600" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onUpdateStatus(order)}
                          className="hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Manual Status Transition"
                        >
                          <SlidersHorizontal className="size-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onInspect(order)}
                          className="hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Inspect full details"
                        >
                          <Eye className="size-3.5" />
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
