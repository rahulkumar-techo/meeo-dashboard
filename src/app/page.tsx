/**
 * @file page.tsx
 * @description Root Dashboard Page - Modularized, clean, and connected to TanStack Query overview.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Download,
  Truck,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  PageHeader,
  StatusBadge,
} from "@/components/common"
import {
  DashboardPeriodSelect,
  DashboardKpiGrid,
  DashboardTriageStrip,
  DashboardInventoryThresholds,
  DashboardOperationsFailures,
} from "@/components/dashboard"
import { RevenueVelocityChart } from "@/components/charts"
import { DASHBOARD_LIVE_ORDERS } from "@/data/dashboard"
import { useOverView } from "@/hooks/dashboard/use-overview.hook"
import { cn } from "@/lib/utils"
import type { DashboardOverviewPayload, PayloadParams } from "@/types/dashboard-overview"

const commonBtnCss = "h-8 gap-1.5 text-xs font-medium border-border/80"

export default function DashboardPage() {
  const [periodParams, setPeriodParams] = React.useState<PayloadParams>({ period: "30d" })
  const { data, isLoading, error, refetch, isFetching } = useOverView(periodParams)

  React.useEffect(() => {
    if (data) {
      console.log("🔥 [Dashboard Overview Actual Response]:", data)
    }
  }, [data])

  const handleRefresh = () => {
    refetch()
  }

  const overview: DashboardOverviewPayload | undefined = data?.data

  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3">
        <Spinner className="size-8 text-indigo-600" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading dashboard overview...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 1. Page Header with Period Select & Refresh */}
      <PageHeader
        title="Dashboard"
        badge="GLOBAL REALTIME"
        description="Welcome back, Sarah. Here is what is happening across your global stores today."
        cacheStatus="Live Feed"
      >
        <DashboardPeriodSelect
          value={periodParams}
          onChange={setPeriodParams}
          disabled={isFetching}
        />
        <Button variant="outline" size="sm" className={commonBtnCss}>
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Snapshot</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className={cn(commonBtnCss, "flex items-center gap-1.5")}
          aria-label="Refresh overview data"
        >
          <RefreshCw className={cn("size-3.5 text-muted-foreground", isFetching && "animate-spin text-indigo-600")} />
          <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </PageHeader>

      {/* 2. Triage Alert Strip (Inventory, Orders, Payments, Reviews, Promotions) */}
      <DashboardTriageStrip overview={overview} />

      {/* 3. Four KPI Metric Cards (Revenue, Orders, Users, Inventory) */}
      <DashboardKpiGrid overview={overview} />

      {/* 4. Financial Velocity & Volume + Inventory Thresholds */}
      <div className="grid gap-3.5 lg:grid-cols-12">
        {/* Left: Financial Velocity & Volume Chart */}
        <RevenueVelocityChart className="lg:col-span-8" />

        {/* Right: Dynamic Inventory Thresholds */}
        <DashboardInventoryThresholds overview={overview} className="lg:col-span-4" />
      </div>

      {/* 5. Bottom Section: Live Stream + Operations & Failures */}
      <div className="grid gap-3.5 lg:grid-cols-12">
        <Card className="lg:col-span-8 shadow-2xs border-border/70">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Truck className="size-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold tracking-tight">Recent Orders Live Stream</CardTitle>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live streaming</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2">ORDER ID</th>
                    <th className="pb-2">CUSTOMER</th>
                    <th className="pb-2 text-center">ITEMS</th>
                    <th className="pb-2">PAYMENT</th>
                    <th className="pb-2">FULFILLMENT</th>
                    <th className="pb-2 text-right">TOTAL</th>
                    <th className="pb-2 text-right">TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {DASHBOARD_LIVE_ORDERS.map((ord) => (
                    <tr key={ord.id} className="hover:bg-muted/30">
                      <td className={cn("py-2.5 font-mono font-bold", ord.isError ? "text-rose-600" : "text-indigo-600")}>
                        <Link href="/orders" className="hover:underline">{ord.id}</Link>
                      </td>
                      <td className="py-2.5"><div className="font-semibold">{ord.customer.name}</div><div className="text-[10.5px] text-muted-foreground">{ord.customer.email}</div></td>
                      <td className="py-2.5 text-center font-mono text-muted-foreground">{ord.itemsCount}</td>
                      <td className="py-2.5"><StatusBadge status={ord.payment.status} tone={ord.payment.tone} /></td>
                      <td className="py-2.5"><StatusBadge status={ord.fulfillment.status} tone={ord.fulfillment.tone} /></td>
                      <td className={cn("py-2.5 text-right font-mono font-bold", ord.isError ? "text-rose-600" : "")}>{ord.total}</td>
                      <td className="py-2.5 text-right text-[11px] text-muted-foreground">{ord.timeAgo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-between border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
              <span>Showing 5 of 14,290 orders</span>
              <Link href="/orders" className="font-semibold text-indigo-600 hover:underline">View All Orders →</Link>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Operations & Failures (Payments, Reviews, Promotions) */}
        <DashboardOperationsFailures overview={overview} className="lg:col-span-4" />
      </div>
    </div>
  )
}