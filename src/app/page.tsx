/**
 * @file page.tsx
 * @description Root Dashboard Page - Connected directly to live TanStack Query overview and real orders feed with zero mock data.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Download,
  Truck,
  RefreshCw,
  ShoppingBag,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useOverView } from "@/hooks/dashboard/use-overview.hook"
import { useAdminOrdersQuery } from "@/hooks/use-order-query"
import { cn } from "@/lib/utils"
import type { DashboardOverviewPayload, PayloadParams } from "@/types/dashboard-overview"
import type { AdminOrder } from "@/types/order"

const commonBtnCss = "h-8 gap-1.5 text-xs font-medium border-border/80"

export default function DashboardPage() {
  const [periodParams, setPeriodParams] = React.useState<PayloadParams>({ period: "30d" })
  const { data, isLoading, refetch, isFetching } = useOverView(periodParams)

  // Live real orders feed from Admin Orders API
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useAdminOrdersQuery({ page: 1, limit: 5 })

  const liveOrders: AdminOrder[] = ordersData?.items ?? []
  const totalOrdersCount = ordersData?.pagination?.total ?? liveOrders.length

  const handleRefresh = () => {
    refetch()
    refetchOrders()
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
        description="Here is what is happening across your global stores today."
        cacheStatus="Live Feed"
      >
        <DashboardPeriodSelect
          value={periodParams}
          onChange={setPeriodParams}
          disabled={isFetching}
        />
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
            {isOrdersLoading ? (
              <div className="space-y-2 py-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : liveOrders.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <ShoppingBag className="mx-auto size-6 text-muted-foreground/50 mb-1.5" />
                <p className="font-semibold text-foreground">No recent orders found</p>
                <p className="text-[11px] mt-0.5">New incoming storefront customer orders will appear here in real-time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2">ORDER #</th>
                      <th className="pb-2">CUSTOMER</th>
                      <th className="pb-2 text-center">ITEMS</th>
                      <th className="pb-2">STATUS</th>
                      <th className="pb-2 text-right">TOTAL</th>
                      <th className="pb-2 text-right">DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {liveOrders.map((ord) => {
                      const customerName = ord.user?.firstName
                        ? `${ord.user.firstName} ${ord.user.lastName || ""}`.trim()
                        : ord.user?.email || "Guest Customer"

                      const grandTotalNum = typeof ord.grandTotal === "number" ? ord.grandTotal : parseFloat(ord.grandTotal) || 0
                      const itemsCount = ord.itemCount ?? ord.items?.length ?? 1

                      return (
                        <tr key={ord.id} className="hover:bg-muted/30">
                          <td className="py-2.5 font-mono font-bold text-indigo-600">
                            <Link href={`/orders`} className="hover:underline">
                              {ord.orderNumber || ord.id.slice(0, 8)}
                            </Link>
                          </td>
                          <td className="py-2.5">
                            <div className="font-semibold">{customerName}</div>
                            <div className="text-[10.5px] text-muted-foreground font-mono">{ord.user?.email || "-"}</div>
                          </td>
                          <td className="py-2.5 text-center font-mono text-muted-foreground">{itemsCount}</td>
                          <td className="py-2.5">
                            <StatusBadge status={ord.status} showDot />
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold">
                            ${grandTotalNum.toFixed(2)}
                          </td>
                          <td className="py-2.5 text-right text-[11px] text-muted-foreground font-mono">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-3 flex justify-between border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
              <span>Showing {liveOrders.length} of {totalOrdersCount} orders</span>
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