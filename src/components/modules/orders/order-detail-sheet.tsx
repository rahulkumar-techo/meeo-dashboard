/**
 * @file order-detail-sheet.tsx
 * @description Modular slide-over sheet for deep inspection of customer orders.
 * Follows Single Responsibility Principle (SRP) and Open/Closed Principle (OCP).
 */

"use client"

import * as React from "react"
import {
  Package,
  MapPin,
  ShieldCheck,
  Truck,
  CreditCard,
  User,
  Printer,
  Ban,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"
import { DetailDrawer } from "@/components/common/detail-drawer"
import { StatusBadge } from "@/components/common/status-badge"
import { OrderTimeline } from "./order-timeline-step"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export interface OrderItem {
  name: string
  sku: string
  qty: number
  price: string
  image: string
}

export interface OrderDetails {
  id: string
  date: string
  time: string
  customer: {
    name: string
    email: string
    location: string
    avatar?: string
    tier?: string
    lifetimeValue?: string
    priorOrders?: number
    fraudRisk?: string
    shippingAddress: {
      line1: string
      line2?: string
      cityStateZip: string
      country: string
      uspsValidated?: boolean
    }
  }
  itemsCount: number
  items: OrderItem[]
  payment: {
    status: string
    badgeVariant?: string
    subtotal: string
    shipping: string
    tax: string
    discount: string
    total: string
  }
  fulfillment: {
    status: string
    badgeVariant?: string
  }
  progress?: {
    stepsCompleted: number
    totalSteps: number
    steps: {
      title: string
      time: string
      detail: string
      completed: boolean
    }[]
    nextStep?: {
      title: string
      estimate: string
    }
  }
}

export interface OrderDetailSheetProps {
  order: OrderDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrintPackingSlip?: (order: OrderDetails) => void
  onRefundOrder?: (order: OrderDetails) => void
  onCancelOrder?: (order: OrderDetails) => void
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
  onPrintPackingSlip,
  onRefundOrder,
  onCancelOrder,
}: OrderDetailSheetProps) {
  if (!order) return null

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span>Order {order.id}</span>
          <StatusBadge status={order.fulfillment.status} />
          <StatusBadge status={order.payment.status.includes("Paid") ? "paid" : order.payment.status.toLowerCase()} />
        </div>
      }
      description={`Placed on ${order.date} at ${order.time} EST`}
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {onCancelOrder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancelOrder(order)}
                className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              >
                <Ban className="mr-1.5 size-3.5" />
                Cancel Order
              </Button>
            )}
            {onRefundOrder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefundOrder(order)}
                className="h-8 text-xs"
              >
                <RotateCcw className="mr-1.5 size-3.5" />
                Issue Refund
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onPrintPackingSlip && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrintPackingSlip(order)}
                className="h-8 text-xs"
              >
                <Printer className="mr-1.5 size-3.5" />
                Print Slip
              </Button>
            )}
            <Button size="sm" className="h-8 text-xs">
              Fulfill Order
            </Button>
          </div>
        </div>
      }
    >
      {/* 1. Customer & Shipping Info */}
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-border/70 bg-card/60 p-4 sm:grid-cols-2 text-xs">
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-foreground mb-2">
            <User className="size-3.5 text-muted-foreground" />
            <span>Customer Details</span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border border-border">
              <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
              <AvatarFallback className="text-[11px] font-bold">
                {order.customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{order.customer.name}</p>
              <p className="text-muted-foreground">{order.customer.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {order.customer.tier && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 border-indigo-200 text-indigo-700 dark:border-indigo-900/50 dark:text-indigo-300">
                    {order.customer.tier}
                  </Badge>
                )}
                {order.customer.priorOrders !== undefined && (
                  <span className="text-[11px] text-muted-foreground">
                    {order.customer.priorOrders} orders
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 font-semibold text-foreground mb-2">
            <MapPin className="size-3.5 text-muted-foreground" />
            <span>Shipping Address</span>
          </div>
          <div className="space-y-0.5 text-muted-foreground">
            <p className="text-foreground font-medium">{order.customer.shippingAddress.line1}</p>
            {order.customer.shippingAddress.line2 && (
              <p>{order.customer.shippingAddress.line2}</p>
            )}
            <p>
              {order.customer.shippingAddress.cityStateZip},{" "}
              {order.customer.shippingAddress.country}
            </p>
            {order.customer.shippingAddress.uspsValidated && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                <ShieldCheck className="size-3" />
                <span>USPS Address Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Order Items */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Line Items ({order.items.length})
        </h4>
        <div className="divide-y divide-border/60 rounded-lg border border-border/70 bg-card/60">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-md border border-border/80 bg-muted/30 flex items-center justify-center text-muted-foreground font-mono text-[10px] shrink-0">
                  <Package className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    SKU: {item.sku} · Qty: {item.qty}
                  </p>
                </div>
              </div>
              <div className="font-semibold text-foreground">{item.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Payment Breakdown */}
      <div className="rounded-lg border border-border/70 bg-card/60 p-4 text-xs space-y-2">
        <h4 className="font-semibold text-foreground flex items-center gap-1.5 mb-2">
          <CreditCard className="size-3.5 text-muted-foreground" />
          <span>Financial Summary</span>
        </h4>
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">{order.payment.subtotal}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>{order.payment.shipping}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span>{order.payment.tax}</span>
        </div>
        {order.payment.discount && order.payment.discount !== "$0.00" && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Discount</span>
            <span>-{order.payment.discount}</span>
          </div>
        )}
        <Separator className="my-1.5" />
        <div className="flex justify-between font-bold text-foreground text-sm">
          <span>Total Paid</span>
          <span className="text-indigo-600 dark:text-indigo-400">{order.payment.total}</span>
        </div>
      </div>

      {/* 4. Timeline Progress */}
      {order.progress && (
        <div className="rounded-lg border border-border/70 bg-card/60 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Fulfillment Timeline
          </h4>
          <OrderTimeline steps={order.progress.steps} />
        </div>
      )}
    </DetailDrawer>
  )
}
