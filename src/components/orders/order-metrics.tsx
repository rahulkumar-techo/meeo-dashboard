/**
 * @file order-metrics.tsx
 * @description KPI summary cards displaying Total Revenue, Total Orders, AOV, and Active Fulfillments pipeline.
 */

"use client"

import * as React from "react"
import { DollarSign, ShoppingBag, Truck, TrendingUp, Package } from "lucide-react"
import { MetricGrid } from "@/components/common"
import { formatCurrency } from "@/lib/formatters"
import type { AdminOrder, AdminOrderMetrics } from "@/types/order"

export interface OrderMetricsProps {
  metrics?: AdminOrderMetrics | null
  items?: AdminOrder[]
  isLoading?: boolean
}

export function OrderMetrics({ metrics, items = [], isLoading }: OrderMetricsProps) {
  const calculatedMetrics = React.useMemo(() => {
    // 1. Detect currency
    const currency =
      metrics?.currency ||
      items.find((o) => o.currency)?.currency ||
      "INR"

    // 2. In-memory aggregations as reliable fallback / supplement
    let itemsGrossRevenue = 0
    let itemsDeliveredCount = 0
    let itemsPendingCount = 0
    let itemsProcessingCount = 0
    let itemsInTransitCount = 0

    items.forEach((order) => {
      const grandTotal = Number(order.grandTotal) || 0
      itemsGrossRevenue += grandTotal

      const status = (order.status || "").toUpperCase()
      if (status === "DELIVERED") {
        itemsDeliveredCount++
      } else if (status === "PENDING" || status === "PAYMENT_PENDING") {
        itemsPendingCount++
      } else if (status === "CONFIRMED" || status === "PROCESSING") {
        itemsProcessingCount++
      } else if (status === "SHIPPED") {
        itemsInTransitCount++
      }
    })

    const statusCounts = metrics?.statusCounts ?? {}
    const pendingCount =
      (statusCounts.PENDING ?? 0) +
      (statusCounts.PAYMENT_PENDING ?? 0) ||
      itemsPendingCount
    const processingCount =
      (statusCounts.CONFIRMED ?? 0) +
      (statusCounts.PROCESSING ?? 0) ||
      itemsProcessingCount
    const inTransitCount = statusCounts.SHIPPED ?? itemsInTransitCount
    const deliveredCount = statusCounts.DELIVERED ?? itemsDeliveredCount

    const totalOrders =
      metrics && metrics.totalOrders > 0
        ? metrics.totalOrders
        : items.length

    const totalRevenue =
      metrics && metrics.totalRevenue > 0
        ? metrics.totalRevenue
        : itemsGrossRevenue

    const aov =
      metrics && metrics.averageOrderValue > 0
        ? metrics.averageOrderValue
        : totalOrders > 0
        ? totalRevenue / totalOrders
        : 0

    const activeFulfillments =
      metrics && metrics.activeFulfillments > 0
        ? metrics.activeFulfillments
        : pendingCount + processingCount + inTransitCount

    return {
      currency,
      totalRevenue,
      totalOrders,
      aov,
      activeFulfillments,
      pendingCount,
      processingCount,
      inTransitCount,
      deliveredCount,
    }
  }, [metrics, items])

  return (
    <MetricGrid
      columns={4}
      items={[
        {
          title: "Total Platform Revenue",
          value: isLoading
            ? "..."
            : formatCurrency(calculatedMetrics.totalRevenue, {
                currency: calculatedMetrics.currency,
              }),
          colorTheme: "indigo",
          icon: DollarSign,
          footnote: `Lifetime Gross Volume (${calculatedMetrics.currency})`,
        },
        {
          title: "Total Orders Placed",
          value: isLoading
            ? "..."
            : calculatedMetrics.totalOrders.toLocaleString(),
          colorTheme: "emerald",
          icon: ShoppingBag,
          footnote: `${calculatedMetrics.deliveredCount.toLocaleString()} successfully delivered`,
        },
        {
          title: "Average Order Value (AOV)",
          value: isLoading
            ? "..."
            : formatCurrency(calculatedMetrics.aov, {
                currency: calculatedMetrics.currency,
              }),
          colorTheme: "cyan",
          icon: TrendingUp,
          footnote: `Across all completed checkouts`,
        },
        {
          title: "Active Fulfillment Queue",
          value: isLoading
            ? "..."
            : `${calculatedMetrics.activeFulfillments} Orders`,
          colorTheme:
            calculatedMetrics.activeFulfillments > 0 ? "amber" : "slate",
          icon: Truck,
          badge:
            calculatedMetrics.pendingCount > 0
              ? {
                  text: `${calculatedMetrics.pendingCount} Pending`,
                  variant: "warning",
                }
              : undefined,
          footnote: `${calculatedMetrics.processingCount} packing • ${calculatedMetrics.inTransitCount} in-transit`,
        },
      ]}
    />
  )
}
