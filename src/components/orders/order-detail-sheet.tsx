/**
 * @file order-detail-sheet.tsx
 * @description Comprehensive slide-over drawer for inspecting customer orders, line items, address snapshots, fulfillment state progression, and status audit logs.
 */

"use client"

import * as React from "react"
import {
  Package,
  MapPin,
  Truck,
  CreditCard,
  User,
  CheckCircle2,
  ExternalLink,
  CheckCheck,
  XCircle,
  Clock,
  History,
  AlertCircle,
  FileText,
} from "lucide-react"
import { DetailDrawer } from "@/components/common/detail-drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "./order-status-badge"
import { useOrderByIdQuery } from "@/hooks/use-order-query"
import type { AdminOrder } from "@/types/order"

export interface OrderDetailSheetProps {
  order: AdminOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: (order: AdminOrder) => void
  onProcess?: (order: AdminOrder) => void
  onShip?: (order: AdminOrder) => void
  onDeliver?: (order: AdminOrder) => void
  onUpdateStatus?: (order: AdminOrder) => void
  onCancel?: (order: AdminOrder) => void
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
  onConfirm,
  onProcess,
  onShip,
  onDeliver,
  onUpdateStatus,
  onCancel,
}: OrderDetailSheetProps) {
  // Query full order details by ID if available
  const { data: fullOrderData, isLoading } = useOrderByIdQuery(order?.id || "")
  const currentOrder = fullOrderData || order

  if (!currentOrder) return null

  const formatCurrency = (val?: number | string | null, curr: string = "USD") => {
    if (val === null || val === undefined) return "$0.00"
    const num = typeof val === "number" ? val : parseFloat(String(val)) || 0
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr || "USD",
    }).format(num)
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
      })
    } catch {
      return dateStr
    }
  }

  const status = currentOrder.status
  const customerName =
    currentOrder.user?.firstName || currentOrder.user?.lastName
      ? `${currentOrder.user.firstName || ""} ${currentOrder.user.lastName || ""}`.trim()
      : currentOrder.address?.recipientName || "Guest Customer"
  const customerEmail = currentOrder.user?.email || "No email on record"

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={
        <div className="flex items-center gap-3">
          <span className="font-mono text-base font-bold text-foreground">
            {currentOrder.orderNumber}
          </span>
          <OrderStatusBadge status={status} />
        </div>
      }
      description={
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span>Placed {formatTimestamp(currentOrder.createdAt)}</span>
          <span>•</span>
          <span>ID: {currentOrder.id}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          {/* Cancellation button if not already in terminal status */}
          {status !== "CANCELLED" && status !== "DELIVERED" && status !== "REFUNDED" && status !== "EXPIRED" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel?.(currentOrder)}
              className="text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs"
            >
              <XCircle className="mr-1.5 size-3.5" /> Cancel Order
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {/* Action Progression */}
            {(status === "PENDING" || status === "PAYMENT_PENDING") && (
              <Button
                size="sm"
                onClick={() => onConfirm?.(currentOrder)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
              >
                <CheckCircle2 className="size-3.5" /> Confirm Order
              </Button>
            )}

            {status === "CONFIRMED" && (
              <Button
                size="sm"
                onClick={() => onProcess?.(currentOrder)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
              >
                <Package className="size-3.5" /> Begin Processing
              </Button>
            )}

            {status === "PROCESSING" && (
              <Button
                size="sm"
                onClick={() => onShip?.(currentOrder)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs gap-1.5"
              >
                <Truck className="size-3.5" /> Dispatch & Ship
              </Button>
            )}

            {status === "SHIPPED" && (
              <Button
                size="sm"
                onClick={() => onDeliver?.(currentOrder)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
              >
                <CheckCheck className="size-3.5" /> Mark as Delivered
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus?.(currentOrder)}
              className="text-xs"
            >
              Manual Transition
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. Customer & Delivery Address Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Card */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <User className="size-4 text-primary" />
              <span>Customer Profile</span>
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-foreground">{customerName}</p>
              <p className="text-muted-foreground font-mono">{customerEmail}</p>
              {currentOrder.address?.phone && (
                <p className="text-muted-foreground">{currentOrder.address.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <MapPin className="size-4 text-primary" />
              <span>Shipping Destination</span>
            </div>
            {currentOrder.address ? (
              <div className="space-y-0.5 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  {currentOrder.address.recipientName}
                </p>
                <p>{currentOrder.address.addressLine1}</p>
                {currentOrder.address.addressLine2 && (
                  <p>{currentOrder.address.addressLine2}</p>
                )}
                <p>
                  {currentOrder.address.city}, {currentOrder.address.state}{" "}
                  {currentOrder.address.postalCode}
                </p>
                <p className="font-semibold text-foreground uppercase">
                  {currentOrder.address.country}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No shipping address attached
              </p>
            )}
          </div>
        </div>

        {/* 2. Shipment Logistics Card (if available) */}
        {currentOrder.shipment && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                <Truck className="size-4" />
                <span>Active Courier Shipment</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-cyan-400">
                {currentOrder.shipment.carrier}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Tracking Number:</span>
                <span className="font-mono font-bold text-foreground">
                  {currentOrder.shipment.trackingNumber}
                </span>
                {currentOrder.shipment.trackingUrl && (
                  <a
                    href={currentOrder.shipment.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] mt-0.5 ml-2"
                  >
                    <span>Track Parcel</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              {currentOrder.shipment.estimatedDeliveryAt && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Estimated Delivery:</span>
                  <span className="font-medium text-foreground">
                    {formatTimestamp(currentOrder.shipment.estimatedDeliveryAt)}
                  </span>
                </div>
              )}
            </div>
            {currentOrder.shipment.notes && (
              <p className="text-[11px] text-muted-foreground border-t border-cyan-500/20 pt-2">
                Note: {currentOrder.shipment.notes}
              </p>
            )}
          </div>
        )}

        {/* 3. Line Items Table */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Order Items ({currentOrder.items?.length || currentOrder.itemCount || 1})
            </h4>
          </div>

          <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
            {currentOrder.items && currentOrder.items.length > 0 ? (
              <div className="divide-y divide-border/60">
                {currentOrder.items.map((item) => (
                  <div
                    key={item.id || item.sku}
                    className="p-3.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">{item.productName}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                        <span>SKU: {item.sku}</span>
                        <span>•</span>
                        <span>Unit: {formatCurrency(item.unitPrice, currentOrder.currency)}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-foreground">
                        {formatCurrency(item.totalPrice, currentOrder.currency)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Line item snapshots are bundled in this order summary.
              </div>
            )}
          </div>
        </div>

        {/* 4. Financial Cost Summary Breakdown */}
        <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
            <CreditCard className="size-4 text-primary" />
            <span>Financial Breakdown</span>
          </div>

          <div className="space-y-1.5 text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-foreground">
                {formatCurrency(currentOrder.subtotal, currentOrder.currency)}
              </span>
            </div>
            {Number(currentOrder.discountTotal) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-mono">
                  -{formatCurrency(currentOrder.discountTotal, currentOrder.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Cost</span>
              <span className="font-mono text-foreground">
                {formatCurrency(currentOrder.shippingTotal, currentOrder.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span className="font-mono text-foreground">
                {formatCurrency(currentOrder.taxTotal, currentOrder.currency)}
              </span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between text-sm font-bold text-foreground pt-1">
              <span>Grand Total</span>
              <span className="font-mono text-base text-primary">
                {formatCurrency(currentOrder.grandTotal, currentOrder.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Status History Audit Trail */}
        {currentOrder.statusHistory && currentOrder.statusHistory.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <History className="size-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Status History Audit Trail
              </h4>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3">
              {currentOrder.statusHistory.map((h, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="rounded-full bg-primary/10 p-1 text-primary mt-0.5">
                    <Clock className="size-3" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {h.previousStatus ? `${h.previousStatus} → ` : ""}
                        {h.newStatus}
                      </span>
                      <span className="text-[10.5px] font-mono text-muted-foreground">
                        {formatTimestamp(h.createdAt)}
                      </span>
                    </div>
                    {h.reason && (
                      <p className="text-[11.5px] text-muted-foreground">{h.reason}</p>
                    )}
                    {h.changedBy && (
                      <p className="text-[10px] font-mono text-muted-foreground/70">
                        Actor: {h.changedBy}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DetailDrawer>
  )
}
