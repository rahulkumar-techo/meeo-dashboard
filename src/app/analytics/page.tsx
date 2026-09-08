/**
 * @file page.tsx
 * @description Executive Revenue, Funnel & Omnichannel Analytics Dashboard.
 * Connects directly to backend admin endpoints (/api/v1/admin/dashboard) with zero mock data.
 */

"use client"

import * as React from "react"
import {
  Download,
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common"
import {
  FinancialKPIs,
  RevenueVelocityAreaChart,
  ConversionFunnelCard,
  OmnichannelBreakdownCard,
  TopSellersLeaderboard,
  OperationalHealthStrip,
  AnalyticsGuideCard,
} from "@/components/analytics"
import {
  useExecutiveOverviewQuery,
  useSalesChartQuery,
  useTopSellersQuery,
  useDashboardHealthQuery,
} from "@/hooks/dashboard/use-analytics-query"
import type { AnalyticsPeriod } from "@/types/analytics"

export default function AnalyticsPage() {
  const [period, setPeriod] = React.useState<AnalyticsPeriod>("30d")

  // API Queries
  const {
    data: overview,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
    isRefetching: isOverviewRefetching,
  } = useExecutiveOverviewQuery({ period })

  const {
    data: salesChart,
    isLoading: isSalesLoading,
    refetch: refetchSales,
    isRefetching: isSalesRefetching,
  } = useSalesChartQuery({ period, interval: "day" })

  const {
    data: topSellers,
    isLoading: isTopSellersLoading,
    refetch: refetchTopSellers,
  } = useTopSellersQuery({ period, limit: 10 })

  const {
    data: health,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useDashboardHealthQuery()

  const isRefreshing =
    isOverviewRefetching || isSalesRefetching

  const handleRefreshAll = () => {
    refetchOverview()
    refetchSales()
    refetchTopSellers()
    refetchHealth()
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header with Period Select & Refresh Actions */}
      <PageHeader
        title="Executive Revenue & Funnel Analytics"
        badge="Live Telemetry"
        badgeVariant="brand"
        description="Real-time Net GMV Velocity (30D), conversion funnel throughput, omnichannel device distribution, and SKU velocity."
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground hidden sm:inline" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden font-medium"
            >
              <option value="today">Today (24h)</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="h-8.5 gap-1.5 text-xs font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </PageHeader>

      {/* 2. Operational Backlog Health Strip */}
      <OperationalHealthStrip
        health={health}
        isLoading={isHealthLoading}
      />

      {/* 3. Executive Accounting Runbook & Formulas */}
      <AnalyticsGuideCard />

      {/* 4. Financial KPIs & Net GMV 30D Velocity */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <TrendingUp className="size-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Financial Health & Net GMV Velocity
          </h3>
        </div>
        <FinancialKPIs
          financials={overview?.financials}
          isLoading={isOverviewLoading}
        />
      </div>

      {/* 5. Revenue Velocity Chart + Omnichannel Donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RevenueVelocityAreaChart
            salesData={salesChart}
            isLoading={isSalesLoading}
          />
        </div>

        <div className="lg:col-span-4">
          <OmnichannelBreakdownCard
            distribution={overview?.channelDistribution}
            isLoading={isOverviewLoading}
          />
        </div>
      </div>

      {/* 6. Conversion Funnel + Top Sellers SKU Leaderboard */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ConversionFunnelCard
            funnel={overview?.conversionFunnel}
            isLoading={isOverviewLoading}
          />
        </div>

        <div className="lg:col-span-6">
          <TopSellersLeaderboard
            topSellers={topSellers}
            isLoading={isTopSellersLoading}
          />
        </div>
      </div>
    </div>
  )
}
