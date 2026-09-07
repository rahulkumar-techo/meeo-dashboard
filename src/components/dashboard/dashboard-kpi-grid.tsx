/**
 * @file dashboard-kpi-grid.tsx
 * @description Executive KPI Metric Cards component for Dashboard Overview.
 * Maps live overview analytics into interactive KPI cards that open drilldown breakdown modals on click.
 */

"use client"

import * as React from "react"
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react"
import { MetricGrid, type MetricCardProps } from "@/components/common"
import { DashboardKpiDetailModal, type KpiMetricType } from "./dashboard-kpi-detail-modal"
import type { DashboardOverviewPayload } from "@/types/dashboard-overview"

export interface DashboardKpiGridProps {
  /** Live dashboard overview data from TanStack Query / API */
  overview?: DashboardOverviewPayload | null
  /** Optional custom container styling */
  className?: string
}

/**
 * Builds interactive metric card objects from raw overview data.
 */
export function mapOverviewToKpiItems(
  overview: DashboardOverviewPayload | null | undefined,
  onSelectMetric?: (metric: KpiMetricType) => void
): MetricCardProps[] {
  return [
    {
      id: "revenue",
      title: "Net Revenue",
      value:
        overview?.revenue?.netRevenue !== undefined
          ? `$${overview.revenue.netRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "$0.00",
      trend: {
        value:
          overview?.revenue?.change !== undefined
            ? `${overview.revenue.change >= 0 ? "+" : ""}${overview.revenue.change}%`
            : `AOV: $${(overview?.revenue?.averageOrderValue ?? 0).toFixed(2)}`,
        isPositive: (overview?.revenue?.change ?? 0) >= 0,
        comparisonPeriod: overview?.revenue?.change !== undefined ? "prior period" : "avg order",
      },
      icon: DollarSign,
      colorTheme: "indigo",
      footnote: `Gross: $${(overview?.revenue?.grossRevenue ?? 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })} • Discounts: $${(overview?.revenue?.totalDiscountGranted ?? 0).toFixed(2)}`,
      badge: { text: "View Details →", variant: "brand" },
      onClick: () => onSelectMetric?.("revenue"),
    },
    {
      id: "orders",
      title: "Total Orders",
      value:
        overview?.orders?.totalOrders !== undefined
          ? overview.orders.totalOrders.toLocaleString("en-US")
          : "0",
      trend: {
        value: `${overview?.orders?.fulfillmentRate ?? 0}%`,
        isPositive: (overview?.orders?.fulfillmentRate ?? 0) >= 90,
        comparisonPeriod: "fulfillment",
      },
      icon: ShoppingBag,
      colorTheme: "emerald",
      footnote: `${overview?.orders?.statusBreakdown?.PENDING ?? 0} pending • ${overview?.orders?.statusBreakdown?.DELIVERED ?? 0} delivered`,
      badge: { text: "Breakdown →", variant: "success" },
      onClick: () => onSelectMetric?.("orders"),
    },
    {
      id: "users",
      title: "Active Users",
      value:
        overview?.users?.activeUsers !== undefined
          ? overview.users.activeUsers.toLocaleString("en-US")
          : "0",
      trend: {
        value: `+${(overview?.users?.newUsersInPeriod ?? 0).toLocaleString("en-US")}`,
        isPositive: true,
        comparisonPeriod: "new users",
      },
      icon: Users,
      colorTheme: "cyan",
      footnote: `${(overview?.users?.totalUsers ?? 0).toLocaleString("en-US")} total accounts • ${overview?.users?.blockedUsers ?? 0} blocked`,
      badge: { text: "Demographics →", variant: "outline" },
      onClick: () => onSelectMetric?.("users"),
    },
    {
      id: "inventory",
      title: "Total Inventory",
      value:
        overview?.inventory?.totalPhysicalUnits !== undefined
          ? `${overview.inventory.totalPhysicalUnits.toLocaleString("en-US")} units`
          : "0 units",
      trend: {
        value: `${overview?.inventory?.lowStockCount ?? 0} low stock`,
        isPositive: (overview?.inventory?.lowStockCount ?? 0) === 0,
        comparisonPeriod: "threshold",
      },
      icon: TrendingUp,
      colorTheme: "amber",
      footnote: `${overview?.inventory?.outOfStockCount ?? 0} out of stock • ${overview?.inventory?.totalTrackedVariants ?? 0} variants`,
      badge: { text: "Stock Status →", variant: "outline" },
      onClick: () => onSelectMetric?.("inventory"),
    },
  ]
}

export function DashboardKpiGrid({ overview, className }: DashboardKpiGridProps) {
  const [activeMetric, setActiveMetric] = React.useState<KpiMetricType>(null)

  const kpiItems = React.useMemo(
    () => mapOverviewToKpiItems(overview, (metric) => setActiveMetric(metric)),
    [overview]
  )

  return (
    <>
      <MetricGrid items={kpiItems} className={className} />
      <DashboardKpiDetailModal
        selectedMetric={activeMetric}
        onClose={() => setActiveMetric(null)}
        overview={overview}
      />
    </>
  )
}
