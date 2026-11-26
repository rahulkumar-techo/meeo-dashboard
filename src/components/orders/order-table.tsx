/**
 * @file order-table.tsx
 * @description Master data table for viewing and managing orders, with customer previews, fulfillment state triggers, and pagination.
 */

"use client"

import * as React from "react"
import Link from "next/link"
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
  ExternalLink,
  CreditCard,
  Mail,
  Loader2,
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
  actionLoadingId?: string | null
  recentlyUpdatedId?: string | null
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
  actionLoadingId,
  recentlyUpdatedId,
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
              <TableHead className="font-semibold text-foreground">TYPE / EVENT</TableHead>
              <TableHead className="font-semibold text-foreground">CUSTOMER</TableHead>
              <TableHead className="font-semibold text-right text-foreground">AMOUNT & PAYMENT</TableHead>
              <TableHead className="font-semibold text-foreground">STATUS & REASON</TableHead>
              <TableHead className="font-semibold text-foreground whitespace-nowrap">PLACED AT</TableHead>
              <TableHead className="text-right pr-4 font-semibold text-foreground">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-xs">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell className="pl-4 py-3.5"><div className="h-4 w-32 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-28 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-36 bg-muted rounded" /></TableCell>
                  <TableCell className="text-right"><div className="h-5 w-24 ml-auto bg-muted rounded" /></TableCell>
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
                    : order.data?.customerName || shippingAddr?.recipientName || "Guest Customer"
                const customerEmail =
                  customerObj?.email || order.data?.recipientEmail || "No email on record"
                const initials =
                  customerName
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "U"

                const status = order.status
                const orderType =
                  order.type || (order.data?.newStatus ? `ORDER_${order.data.newStatus}` : "ORDER")
                const paymentMethod = order.paymentMethod || order.data?.paymentMethod || null
                const paymentStatus = order.paymentStatus || order.data?.paymentStatus || null
                const reason = order.reason || order.data?.reason || null
                const channel = order.channel || null
                const orderTitle = order.title || (order.orderNumber ? `Order #${order.orderNumber}` : null)
                const isActionLoading = actionLoadingId === order.id
                const isRecentlyUpdated = recentlyUpdatedId === order.id

                return (
                  <TableRow
                    key={order.id}
                    onClick={() => onInspect(order)}
                    className={`cursor-pointer hover:bg-muted/40 transition-colors ${
                      isRecentlyUpdated ? "animate-publish-row" : ""
                    }`}
                  >
                    {/* Order Number & ID */}
                    <TableCell className="pl-4 py-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-bold text-primary font-mono hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {order.orderNumber}
                        </Link>
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
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        ID: {order.id.slice(0, 8)}...
                      </p>
                    </TableCell>

                    {/* Order Type / Event */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant="outline"
                            className={
                              orderType.includes("CONFIRM")
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-[10px]"
                                : orderType.includes("CANCEL")
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-mono text-[10px]"
                                : orderType.includes("SHIP") || orderType.includes("DISPATCH")
                                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-mono text-[10px]"
                                : orderType.includes("DELIVER")
                                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-mono text-[10px]"
                                : "border-border bg-muted/50 text-foreground font-mono text-[10px]"
                            }
                          >
                            {orderType}
                          </Badge>
                          {channel && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                              <Mail className="size-2.5" />
                              {channel}
                            </span>
                          )}
                        </div>
                        {orderTitle && (
                          <p
                            className="text-[10.5px] text-muted-foreground truncate max-w-[190px]"
                            title={orderTitle}
                          >
                            {orderTitle}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6 border border-border shrink-0">
                          <AvatarFallback className="text-[9px] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="max-w-[170px]">
                          <p className="font-semibold text-foreground truncate">
                            {customerName}
                          </p>
                          <p
                            className="text-[10.5px] text-muted-foreground truncate"
                            title={customerEmail}
                          >
                            {customerEmail}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Amount & Payment */}
                    <TableCell className="text-right">
                      <div className="font-mono font-bold text-foreground text-xs">
                        {formatCurrency(order.grandTotal, order.currency)}
                      </div>
                      {paymentMethod && (
                        <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <CreditCard className="size-2.5 shrink-0" />
                          <span className="truncate max-w-[130px]" title={paymentMethod}>
                            {paymentMethod}
                          </span>
                        </div>
                      )}
                      {paymentStatus && (
                        <div
                          className={`text-[9.5px] mt-0.5 ${
                            paymentStatus.toUpperCase().includes("PAID") ||
                            paymentStatus.toUpperCase().includes("SUCCESS")
                              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                              : paymentStatus.toUpperCase().includes("FAIL")
                              ? "text-rose-600 dark:text-rose-400 font-semibold"
                              : paymentStatus.toUpperCase().includes("REFUND")
                              ? "text-purple-600 dark:text-purple-400 font-medium"
                              : paymentStatus.toUpperCase().includes("CANCEL")
                              ? "text-zinc-500 dark:text-zinc-400 font-medium"
                              : "text-amber-600 dark:text-amber-400 font-medium"
                          }`}
                        >
                          {paymentStatus}
                        </div>
                      )}
                    </TableCell>

                    {/* Status & Reason */}
                    <TableCell>
                      <div className="space-y-1 max-w-[180px]">
                        <OrderStatusBadge status={status} />
                        {reason && (
                          <p className="text-[10px] text-muted-foreground truncate" title={reason}>
                            {reason}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Timestamp */}
                    <TableCell className="text-muted-foreground whitespace-nowrap text-[11px]">
                      <div>{formatTimestamp(order.createdAt)}</div>
                      {order.sentAt && order.sentAt !== order.createdAt && (
                        <div className="text-[10px] text-muted-foreground/75 mt-0.5">
                          Sent: {formatTimestamp(order.sentAt)}
                        </div>
                      )}
                    </TableCell>

                    {/* Quick Fulfillment Actions */}
                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Step progression buttons based on status */}
                        {(status === "PENDING" || status === "PAYMENT_PENDING") && (
                          <Button
                            size="sm"
                            disabled={isActionLoading}
                            onClick={() => onConfirm(order)}
                            className="h-7 px-2 text-[11px] gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            title="Confirm order & commit inventory"
                          >
                            {isActionLoading ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="size-3" />
                            )}
                            <span>Confirm</span>
                          </Button>
                        )}

                        {status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            disabled={isActionLoading}
                            onClick={() => onProcess(order)}
                            className="h-7 px-2 text-[11px] gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                            title="Begin warehouse picking & packing"
                          >
                            {isActionLoading ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Package className="size-3" />
                            )}
                            <span>Process</span>
                          </Button>
                        )}

                        {status === "PROCESSING" && (
                          <Button
                            size="sm"
                            disabled={isActionLoading}
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
                            disabled={isActionLoading}
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
                            disabled={isActionLoading}
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
                          title="Inspect quick details"
                        >
                          <Eye className="size-3.5" />
                        </Button>

                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex size-6 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Open dedicated Order Page"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
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
