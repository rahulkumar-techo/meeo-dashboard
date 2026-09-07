/**
 * @file dashboard-kpi-detail-modal.tsx
 * @description Interactive KPI drilldown modal displaying deep breakdown data for Revenue, Orders, Users, and Inventory.
 */

"use client"

import * as React from "react"
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RotateCcw,
  Truck,
  ShieldAlert,
  Percent,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { DashboardOverviewPayload } from "@/types/dashboard-overview"
import { cn } from "@/lib/utils"

export type KpiMetricType = "revenue" | "orders" | "users" | "inventory" | null

export interface DashboardKpiDetailModalProps {
  selectedMetric: KpiMetricType
  onClose: () => void
  overview?: DashboardOverviewPayload | null
}

export function DashboardKpiDetailModal({
  selectedMetric,
  onClose,
  overview,
}: DashboardKpiDetailModalProps) {
  if (!selectedMetric || !overview) return null

  const isOpen = Boolean(selectedMetric)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        {selectedMetric === "revenue" && <RevenueBreakdownDetail overview={overview} />}
        {selectedMetric === "orders" && <OrdersBreakdownDetail overview={overview} />}
        {selectedMetric === "users" && <UsersBreakdownDetail overview={overview} />}
        {selectedMetric === "inventory" && <InventoryBreakdownDetail overview={overview} />}
      </DialogContent>
    </Dialog>
  )
}

/** 1. Revenue Breakdown View */
function RevenueBreakdownDetail({ overview }: { overview: DashboardOverviewPayload }) {
  const rev = overview.revenue
  const net = rev?.netRevenue ?? 0
  const gross = rev?.grossRevenue ?? 0
  const aov = rev?.averageOrderValue ?? 0
  const discounts = rev?.totalDiscountGranted ?? 0
  const refunds = rev?.totalRefunds ?? 0

  return (
    <div className="space-y-4">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <DollarSign className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold">Revenue Analytics & Breakdown</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Financial velocity for period: <span className="font-semibold text-foreground">{overview.period}</span>
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Main Net Revenue Hero */}
      <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Total Net Revenue
        </div>
        <div className="mt-1 text-3xl font-extrabold text-foreground">
          ${net.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Average Order Value: <strong className="text-foreground">${aov.toFixed(2)}</strong>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/70 bg-card p-3 space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Gross Revenue</span>
          <div className="text-lg font-bold text-foreground">
            ${gross.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-muted-foreground">Pre-discount volume</span>
        </div>

        <div className="rounded-lg border border-border/70 bg-card p-3 space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Average Order (AOV)</span>
          <div className="text-lg font-bold text-foreground">${aov.toFixed(2)}</div>
          <span className="text-[10px] text-muted-foreground">Per completed checkout</span>
        </div>

        <div className="rounded-lg border border-border/70 bg-card p-3 space-y-1">
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Discounts Granted</span>
          <div className="text-lg font-bold text-foreground">
            ${discounts.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-muted-foreground">Coupons & promotion cuts</span>
        </div>

        <div className="rounded-lg border border-border/70 bg-card p-3 space-y-1">
          <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Total Refunds</span>
          <div className="text-lg font-bold text-foreground">
            ${refunds.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-muted-foreground">Returned customer transactions</span>
        </div>
      </div>
    </div>
  )
}

/** 2. Orders Lifecycle & Status Breakdown View */
function OrdersBreakdownDetail({ overview }: { overview: DashboardOverviewPayload }) {
  const ord = overview.orders
  const total = ord?.totalOrders ?? 0
  const success = ord?.successfulOrders ?? 0
  const rate = ord?.fulfillmentRate ?? 0
  const sb = ord?.statusBreakdown || {
    PENDING: 0,
    PROCESSING: 0,
    CONFIRMED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    REFUNDED: 0,
    PAYMENT_PENDING: 0,
    EXPIRED: 0,
  }

  const statusItems = [
    { key: "DELIVERED", label: "Delivered", count: sb.DELIVERED, color: "bg-emerald-500", icon: CheckCircle2, text: "text-emerald-700 dark:text-emerald-400" },
    { key: "SHIPPED", label: "Shipped", count: sb.SHIPPED, color: "bg-cyan-500", icon: Truck, text: "text-cyan-700 dark:text-cyan-400" },
    { key: "CONFIRMED", label: "Confirmed", count: sb.CONFIRMED, color: "bg-indigo-500", icon: CheckCircle2, text: "text-indigo-700 dark:text-indigo-400" },
    { key: "PROCESSING", label: "Processing", count: sb.PROCESSING, color: "bg-blue-500", icon: Clock, text: "text-blue-700 dark:text-blue-400" },
    { key: "PENDING", label: "Pending", count: sb.PENDING, color: "bg-amber-500", icon: Clock, text: "text-amber-700 dark:text-amber-400" },
    { key: "PAYMENT_PENDING", label: "Payment Pending", count: sb.PAYMENT_PENDING, color: "bg-orange-500", icon: AlertTriangle, text: "text-orange-700 dark:text-orange-400" },
    { key: "REFUNDED", label: "Refunded", count: sb.REFUNDED, color: "bg-purple-500", icon: RotateCcw, text: "text-purple-700 dark:text-purple-400" },
    { key: "CANCELLED", label: "Cancelled", count: sb.CANCELLED, color: "bg-rose-500", icon: XCircle, text: "text-rose-700 dark:text-rose-400" },
    { key: "EXPIRED", label: "Expired", count: sb.EXPIRED, color: "bg-slate-500", icon: Clock, text: "text-slate-600 dark:text-slate-400" },
  ]

  return (
    <div className="space-y-4">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShoppingBag className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold">Order Lifecycle & Status Breakdown</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Complete distribution across all order execution stages
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Summary Highlights */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/70 bg-card p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Orders</span>
          <div className="text-xl font-extrabold text-foreground mt-0.5">{total.toLocaleString("en-US")}</div>
        </div>
        <div className="rounded-lg border border-border/70 bg-card p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Successful</span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{success.toLocaleString("en-US")}</div>
        </div>
        <div className="rounded-lg border border-border/70 bg-card p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Fulfillment</span>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{rate}%</div>
        </div>
      </div>

      {/* Status Breakdown List */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-bold text-foreground">Status Breakdown</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {statusItems.map((item) => {
            const Icon = item.icon
            const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0"
            return (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className={cn("size-2 rounded-full", item.color)} />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground">{item.count}</span>
                  <Badge variant="outline" className="text-[9.5px] px-1 py-0 h-4">
                    {percentage}%
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** 3. Users Demographics View */
function UsersBreakdownDetail({ overview }: { overview: DashboardOverviewPayload }) {
  const users = overview.users
  const total = users?.totalUsers ?? 0
  const active = users?.activeUsers ?? 0
  const newUsers = users?.newUsersInPeriod ?? 0
  const blocked = users?.blockedUsers ?? 0
  const suspended = users?.suspendedUsers ?? 0

  const activeRate = total > 0 ? ((active / total) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-4">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Users className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold">Customer & User Accounts</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              User growth, activity rate, and safety moderation statuses
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Active Users</span>
          <div className="text-2xl font-bold text-foreground">{active.toLocaleString("en-US")}</div>
          <span className="text-[10px] text-muted-foreground">{activeRate}% of total registered</span>
        </div>

        <div className="rounded-lg border border-border/70 bg-card p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">New in Period</span>
          <div className="text-2xl font-bold text-foreground">+{newUsers.toLocaleString("en-US")}</div>
          <span className="text-[10px] text-muted-foreground">Recently joined customers</span>
        </div>

        <div className="rounded-lg border border-border/70 bg-card p-3 space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Total Registered</span>
          <div className="text-lg font-bold text-foreground">{total.toLocaleString("en-US")}</div>
          <span className="text-[10px] text-muted-foreground">All accounts created</span>
        </div>

        <div className="rounded-lg border border-rose-200/60 bg-rose-50/40 p-3 space-y-1 dark:border-rose-900/40 dark:bg-rose-950/20">
          <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Flagged / Suspended</span>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{blocked + suspended}</div>
          <span className="text-[10px] text-muted-foreground">
            {blocked} blocked • {suspended} suspended
          </span>
        </div>
      </div>
    </div>
  )
}

/** 4. Inventory Health View */
function InventoryBreakdownDetail({ overview }: { overview: DashboardOverviewPayload }) {
  const inv = overview.inventory
  const physicalUnits = inv?.totalPhysicalUnits ?? 0
  const trackedVariants = inv?.totalTrackedVariants ?? 0
  const inStock = inv?.inStockCount ?? 0
  const lowStock = inv?.lowStockCount ?? 0
  const outOfStock = inv?.outOfStockCount ?? 0
  const reserved = inv?.totalReservedUnits ?? 0

  return (
    <div className="space-y-4">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Package className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold">Inventory & Warehouse Health</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Stock levels, variant tracking, and replenishment alerts
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/70 bg-card p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Physical Units</span>
          <div className="text-xl font-extrabold text-foreground mt-0.5">{physicalUnits.toLocaleString("en-US")}</div>
        </div>
        <div className="rounded-lg border border-border/70 bg-card p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Tracked SKUs</span>
          <div className="text-xl font-extrabold text-foreground mt-0.5">{trackedVariants.toLocaleString("en-US")}</div>
        </div>
        <div className="rounded-lg border border-border/70 bg-card p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Reserved Units</span>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{reserved.toLocaleString("en-US")}</div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/40 p-3 flex justify-between items-center text-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div>
            <div className="font-bold text-emerald-800 dark:text-emerald-300">In Stock Units</div>
            <div className="text-[11px] text-muted-foreground">Available for immediate fulfillment</div>
          </div>
          <div className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400">{inStock.toLocaleString("en-US")}</div>
        </div>

        <div className="rounded-lg border border-amber-200/60 bg-amber-50/40 p-3 flex justify-between items-center text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <div>
            <div className="font-bold text-amber-800 dark:text-amber-300">Low Stock Warnings</div>
            <div className="text-[11px] text-muted-foreground">Variants under reorder threshold</div>
          </div>
          <Badge className="bg-amber-100 text-amber-800 text-xs">{lowStock} items</Badge>
        </div>

        <div className="rounded-lg border border-rose-200/60 bg-rose-50/40 p-3 flex justify-between items-center text-xs dark:border-rose-900/40 dark:bg-rose-950/20">
          <div>
            <div className="font-bold text-rose-800 dark:text-rose-300">Out of Stock Alert</div>
            <div className="text-[11px] text-muted-foreground">Immediate supplier replenishment required</div>
          </div>
          <Badge variant={outOfStock > 0 ? "destructive" : "secondary"} className="text-xs">
            {outOfStock} items
          </Badge>
        </div>
      </div>
    </div>
  )
}
