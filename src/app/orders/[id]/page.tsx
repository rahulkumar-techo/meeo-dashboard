/**
 * @file page.tsx
 * @description Dedicated Order Details Page featuring line items, customer intelligence link, shipment tracking, financial ledger, and fulfillment lifecycle actions.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  CreditCard,
  User,
  ExternalLink,
  CheckCircle2,
  Clock,
  Printer,
  ShieldAlert,
  Loader2,
  Calendar,
  Copy,
  Check,
  Send,
  Boxes,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/common"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { ShipOrderDialog } from "@/components/orders/ship-order-dialog"
import { DeliverOrderDialog } from "@/components/orders/deliver-order-dialog"
import { CancelOrderDialog } from "@/components/orders/cancel-order-dialog"
import { UpdateStatusDialog } from "@/components/orders/update-status-dialog"
import { OrderLifecycleBar } from "@/components/orders/order-lifecycle-bar"
import {
  useOrderByIdQuery,
  useConfirmOrderMutation,
  useProcessOrderMutation,
} from "@/hooks/use-order-query"
import { formatCurrency, formatDate } from "@/lib/formatters"
import type { AdminOrder, OrderStatus } from "@/types/order"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = String(params?.id || "")

  const [copiedId, setCopiedId] = React.useState(false)

  // Dialog state
  const [shipDialogOpen, setShipDialogOpen] = React.useState(false)
  const [deliverDialogOpen, setDeliverDialogOpen] = React.useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false)
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = React.useState(false)

  // Fetch order data
  const { data: order, isLoading, refetch } = useOrderByIdQuery(orderId)

  // Mutations
  const confirmMutation = useConfirmOrderMutation()
  const processMutation = useProcessOrderMutation()

  const copyOrderNumber = () => {
    if (!order?.orderNumber) return
    navigator.clipboard.writeText(order.orderNumber)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleConfirmOrder = async () => {
    if (!order) return
    try {
      await confirmMutation.mutateAsync(order.id)
      refetch()
    } catch (err) {
      console.error("Failed to confirm order", err)
    }
  }

  const handleProcessOrder = async () => {
    if (!order) return
    try {
      await processMutation.mutateAsync(order.id)
      refetch()
    } catch (err) {
      console.error("Failed to process order", err)
    }
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">
          Loading Order Specifications...
        </p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto space-y-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to Orders
        </Link>
        <EmptyState
          title="Order Not Found"
          description={`No recorded order matches ID: ${orderId}`}
          actionLabel="View All Orders"
          onAction={() => router.push("/orders")}
        />
      </div>
    )
  }

  const customerName =
    order.customer?.firstName || order.customer?.lastName
      ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
      : order.user?.firstName || order.user?.lastName
      ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim()
      : order.address?.recipientName || "Registered Customer"

  const customerEmail = order.customer?.email || order.user?.email || "No email linked"

  const subtotal = Number(order.financials?.subtotal ?? order.subtotal ?? 0)
  const discountTotal = Number(order.financials?.discountTotal ?? order.discountTotal ?? 0)
  const shippingTotal = Number(order.financials?.shippingTotal ?? order.shippingTotal ?? 0)
  const taxTotal = Number(order.financials?.taxTotal ?? order.taxTotal ?? 0)
  const grandTotal = Number(order.financials?.grandTotal ?? order.grandTotal ?? 0)

  // Visual Lifecycle Progress
  const isTerminalCancelled = order.status === "CANCELLED" || order.status === "EXPIRED" || order.status === "REFUNDED"

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6 max-w-[1500px] mx-auto">
      {/* 1. Header & Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1.5">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Orders
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Order #{order.orderNumber}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyOrderNumber}
              className="size-7 text-muted-foreground hover:text-foreground"
              title="Copy Order Number"
            >
              {copiedId ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </Button>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              <span>{formatDate(order.createdAt, "datetime")}</span>
            </span>
            <span>•</span>
            <span>ID: {order.id.slice(0, 13)}...</span>
          </div>
        </div>

        {/* Operational Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {order.status === "PENDING" && (
            <Button
              size="sm"
              onClick={handleConfirmOrder}
              disabled={confirmMutation.isPending}
              className="h-8 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              {confirmMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              <span>Confirm Order</span>
            </Button>
          )}

          {order.status === "CONFIRMED" && (
            <Button
              size="sm"
              onClick={handleProcessOrder}
              disabled={processMutation.isPending}
              className="h-8 gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              {processMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Boxes className="size-3.5" />}
              <span>Process Packing</span>
            </Button>
          )}

          {order.status === "PROCESSING" && (
            <Button
              size="sm"
              onClick={() => setShipDialogOpen(true)}
              className="h-8 gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Truck className="size-3.5" />
              <span>Dispatch Shipment</span>
            </Button>
          )}

          {order.status === "SHIPPED" && (
            <Button
              size="sm"
              onClick={() => setDeliverDialogOpen(true)}
              className="h-8 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Mark Delivered</span>
            </Button>
          )}

          {!isTerminalCancelled && order.status !== "DELIVERED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCancelDialogOpen(true)}
              className="h-8 gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
            >
              <ShieldAlert className="size-3.5" />
              <span>Cancel</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setUpdateStatusDialogOpen(true)}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <span>Change Status</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Print Order Invoice"
          >
            <Printer className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. Order Lifecycle Timeline Bar */}
      <OrderLifecycleBar order={order} />

      {/* 3. Main 2-Column Body Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Line Items, Financials, Logistics, Audit (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table Card */}
          <Card className="border-border/70 bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-primary" />
                  <span>Purchased Line Items ({order.items?.length || 0})</span>
                </div>
              </CardTitle>
              <CardDescription className="text-xs">
                Physical inventory items committed to this shipment
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {(!order.items || order.items.length === 0) ? (
                <EmptyState
                  title="No Line Items"
                  description="No items are associated with this order record."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40 text-xs">
                      <TableRow>
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold">SKU</TableHead>
                        <TableHead className="font-semibold text-right">Price</TableHead>
                        <TableHead className="font-semibold text-center">Qty</TableHead>
                        <TableHead className="font-semibold text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {order.items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="font-semibold text-foreground">{item.productName}</p>
                              {item.variantSnapshot?.attributes && item.variantSnapshot.attributes.length > 0 && (
                                <p className="text-[11px] text-muted-foreground">
                                  {item.variantSnapshot.attributes.map((a) => `${a.attribute}: ${a.value}`).join(" · ")}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {item.sku || "N/A"}
                          </TableCell>
                          <TableCell className="font-mono text-right text-foreground">
                            {formatCurrency(Number(item.unitPrice))}
                          </TableCell>
                          <TableCell className="font-mono text-center font-bold text-foreground">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-right text-foreground">
                            {formatCurrency(Number(item.totalPrice ?? item.total ?? Number(item.unitPrice) * item.quantity))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Breakdown Card */}
          <Card className="border-border/70 bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <span>Financial Ledger & Taxes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-medium text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Shipping Logistics Fee</span>
                <span className="font-mono font-medium text-foreground">
                  {shippingTotal > 0 ? formatCurrency(shippingTotal) : "Free Shipping"}
                </span>
              </div>
              {discountTotal > 0 && (
                <div className="flex items-center justify-between py-1.5 border-b border-border/50 text-emerald-600 dark:text-emerald-400">
                  <span>Promotional Discount</span>
                  <span className="font-mono font-semibold">-{formatCurrency(discountTotal)}</span>
                </div>
              )}
              {taxTotal > 0 && (
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Estimated Taxes & GST</span>
                  <span className="font-mono font-medium text-foreground">{formatCurrency(taxTotal)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 text-sm font-bold">
                <span className="text-foreground">Grand Total</span>
                <span className="font-mono text-base text-primary font-bold">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Logistics & Shipment Card */}
          {order.shipment && (
            <Card className="border-border/70 bg-card shadow-2xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="size-4 text-blue-500" />
                    <span>Logistics Dispatch & Waybill</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {order.shipment.carrier}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Tracking Number</span>
                    <p className="font-mono font-bold text-foreground text-sm mt-0.5">
                      {order.shipment.trackingNumber}
                    </p>
                  </div>
                  {order.shipment.trackingUrl && (
                    <div className="flex items-end">
                      <a
                        href={order.shipment.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                      >
                        <span>Track on Carrier Portal</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audit History Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card className="border-border/70 bg-card shadow-2xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span>State Machine Audit History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border/50 text-xs">
                  {order.statusHistory.map((hist, idx) => (
                    <div key={hist.id || idx} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={hist.newStatus} />
                        {hist.reason && (
                          <span className="text-muted-foreground text-[11px]">— {hist.reason}</span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formatDate(hist.createdAt, "datetime")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Customer Card & Shipping Destination (1 Col) */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <Card className="border-border/70 bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span>Customer Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <Avatar className="size-11 border border-border">
                  <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                    {customerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="truncate">
                  <p className="font-semibold text-foreground text-sm truncate">{customerName}</p>
                  <p className="text-muted-foreground truncate font-mono text-[11px]">{customerEmail}</p>
                </div>
              </div>

              {order.userId && (
                <Link
                  href={`/customers/${order.userId}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card hover:bg-muted/50 p-2 text-xs font-semibold text-foreground transition-colors shadow-2xs"
                >
                  <span>Open Full Customer 360° Profile</span>
                  <ExternalLink className="size-3" />
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address Card */}
          <Card className="border-border/70 bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                <span>Shipping Destination</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {order.shippingAddress || order.address ? (
                (() => {
                  const addr = order.shippingAddress || order.address!
                  return (
                    <div className="space-y-1 leading-relaxed text-muted-foreground">
                      <p className="font-semibold text-foreground">{addr.recipientName}</p>
                      <p>{addr.addressLine1}</p>
                      {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                      <p>
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="font-medium text-foreground">{addr.country}</p>
                      {addr.phone && (
                        <p className="pt-1 font-mono text-[11px]">Phone: {addr.phone}</p>
                      )}
                    </div>
                  )
                })()
              ) : (
                <p className="text-muted-foreground">No delivery address attached.</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Snapshot */}
          <Card className="border-border/70 bg-card shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <span>Payment Confirmation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-mono font-semibold text-foreground uppercase">
                  {order.currency || "INR"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">Settlement Status</span>
                <Badge
                  variant={order.status === "PENDING" || order.status === "PAYMENT_PENDING" ? "outline" : "default"}
                  className="text-[10px] font-mono font-semibold uppercase"
                >
                  {order.status === "PENDING" || order.status === "PAYMENT_PENDING" ? "Unsettled" : "Captured"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialogs */}
      <ShipOrderDialog
        order={order}
        open={shipDialogOpen}
        onOpenChange={setShipDialogOpen}
        onSuccess={() => refetch()}
      />

      <DeliverOrderDialog
        order={order}
        open={deliverDialogOpen}
        onOpenChange={setDeliverDialogOpen}
        onSuccess={() => refetch()}
      />

      <CancelOrderDialog
        order={order}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onSuccess={() => refetch()}
      />

      <UpdateStatusDialog
        order={order}
        open={updateStatusDialogOpen}
        onOpenChange={setUpdateStatusDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
