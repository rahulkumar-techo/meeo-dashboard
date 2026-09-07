/**
 * @file dashboard-triage-strip.tsx
 * @description Operational triage queue banner mapping live overview data:
 * Inventory alerts, pending orders, payment failures, review moderation, and active promotions.
 */

"use client"

import * as React from "react"
import { TriageBanner } from "@/components/common"
import type { TriageQueueItem } from "@/types/common"
import type { DashboardOverviewPayload } from "@/types/dashboard-overview"

export interface DashboardTriageStripProps {
  /** Live dashboard overview data */
  overview?: DashboardOverviewPayload | null
  /** Custom container class */
  className?: string
}

/**
 * Transforms overview data into prioritized operational triage queue items.
 */
export function mapOverviewToTriageItems(overview?: DashboardOverviewPayload | null): TriageQueueItem[] {
  const lowStock = overview?.inventory?.lowStockCount ?? 0
  const outOfStock = overview?.inventory?.outOfStockCount ?? 0
  const pendingOrders =
    (overview?.orders?.statusBreakdown?.PENDING ?? 0) +
    (overview?.orders?.statusBreakdown?.PROCESSING ?? 0)
  const failedPayments = overview?.payments?.failedPayments ?? 0
  const pendingReviews = overview?.reviews?.pendingModeration ?? 0
  const activeCoupons = overview?.promotions?.activeCouponsCount ?? 0

  return [
    {
      id: "low_stock",
      label: "Low Stock",
      count: `${lowStock} items`,
      severity: lowStock > 0 ? "warning" : "normal",
    },
    {
      id: "out_of_stock",
      label: "Out of Stock",
      count: `${outOfStock} items`,
      severity: outOfStock > 0 ? "danger" : "normal",
    },
    {
      id: "pending_fulfillment",
      label: "Pending Orders",
      count: `${pendingOrders} orders`,
      severity: pendingOrders > 50 ? "warning" : "info",
    },
    {
      id: "failed_payments",
      label: "Failed Payments",
      count: `${failedPayments}`,
      severity: failedPayments > 0 ? "danger" : "normal",
    },
    {
      id: "pending_reviews",
      label: "Pending Reviews",
      count: `${pendingReviews} reviews`,
      severity: pendingReviews > 0 ? "warning" : "normal",
    },
    {
      id: "active_promotions",
      label: "Active Coupons",
      count: `${activeCoupons} coupons`,
      severity: "info",
    },
  ]
}

export function DashboardTriageStrip({ overview, className }: DashboardTriageStripProps) {
  const triageItems = React.useMemo(() => mapOverviewToTriageItems(overview), [overview])

  const failureRate = overview?.payments?.failureRate ?? 0
  const successRate = Math.max(0, 100 - failureRate)
  const isHealthy = (overview?.payments?.failedPayments ?? 0) === 0 && (overview?.inventory?.outOfStockCount ?? 0) === 0

  return (
    <TriageBanner
      items={triageItems}
      className={className}
      healthStatus={{
        text: `Cluster healthy (${successRate.toFixed(1)}% payment success)`,
        isHealthy,
      }}
    />
  )
}
