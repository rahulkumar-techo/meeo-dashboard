/**
 * @file order-metrics.tsx
 * @description KPI summary cards displaying Total Revenue, Total Orders, AOV, and Active Fulfillments pipeline.
 */

"use client"

import * as React from "react"
import { DollarSign, ShoppingBag, Truck, TrendingUp, Package } from "lucide-react"
import { MetricGrid } from "@/components/common"
import type { AdminOrderMetrics } from "@/types/order"

export interface OrderMetricsProps {
  metrics?: AdminOrderMetrics | null
  isLoading?: boolean
}

export function OrderMetrics({ metrics, isLoading }: OrderMetricsProps) {
  const totalRevenue = metrics?.totalRevenue ?? 0
  const totalOrders = metrics?.totalOrders ?? 0
  const aov = metrics?.averageOrderValue ?? 0
  const activeFulfillments = metrics?.activeFulfillments ?? 0
  const statusCounts = metrics?.statusCounts ?? {}

  const pendingCount = (statusCounts.PENDING ?? 0) + (statusCounts.PAYMENT_PENDING ?? 0)
  const processingCount = (statusCounts.CONFIRMED ?? 0) + (statusCounts.PROCESSING ?? 0)
  const inTransitCount = statusCounts.SHIPPED ?? 0
  const deliveredCount = statusCounts.DELIVERED ?? 0

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(val)

  return (
    <MetricGrid
      columns={4}
      items={[
        {
          title: "Total Platform Revenue",
          value: isLoading ? "..." : formatCurrency(totalRevenue),
          colorTheme: "indigo",
          icon: DollarSign,
          footnote: `Lifetime Gross Volume`,
        },
        {
          title: "Total Orders Placed",
          value: isLoading ? "..." : totalOrders.toLocaleString(),
          colorTheme: "emerald",
          icon: ShoppingBag,
          footnote: `${deliveredCount.toLocaleString()} successfully delivered`,
        },
        {
          title: "Average Order Value (AOV)",
          value: isLoading ? "..." : formatCurrency(aov),
          colorTheme: "cyan",
          icon: TrendingUp,
          footnote: `Across all completed checkouts`,
        },
        {
          title: "Active Fulfillment Queue",
          value: isLoading ? "..." : `${activeFulfillments} Orders`,
          colorTheme: activeFulfillments > 0 ? "amber" : "slate",
          icon: Truck,
          badge:
            pendingCount > 0
              ? { text: `${pendingCount} Pending`, variant: "warning" }
              : undefined,
          footnote: `${processingCount} packing • ${inTransitCount} in-transit`,
        },
      ]}
    />
  )
}
