/**
 * @file revenue-velocity-area-chart.tsx
 * @description Dynamic Area Trend Chart for Time-Series Sales & Revenue Trends.
 * Visualizes revenue trajectory, orders volume, and AOV per bucket.
 */

"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { SalesChartData } from "@/types/analytics"

export interface RevenueVelocityAreaChartProps {
  salesData?: SalesChartData
  isLoading?: boolean
  className?: string
}

export function RevenueVelocityAreaChart({
  salesData,
  isLoading,
  className,
}: RevenueVelocityAreaChartProps) {
  const gradientId = React.useId().replace(/:/g, "_")

  if (isLoading) {
    return (
      <Card className={cn("border-border/70 bg-card/95 shadow-2xs", className)}>
        <CardHeader className="p-4 pb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-64 mt-1" />
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  const points = salesData?.points ?? []
  const totalRevenue = salesData?.totals?.totalRevenue ?? 0
  const totalOrders = salesData?.totals?.totalOrders ?? 0

  const chartData = points.map((p) => ({
    label: p.date,
    revenue: p.revenue,
    orders: p.ordersCount,
    aov: p.averageOrderValue,
  }))

  return (
    <Card className={cn("border-border/70 bg-card/95 shadow-2xs", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 p-4">
        <div>
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Revenue Velocity & Financial Run-Rate
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Aggregated revenue curve and order throughput across selected interval
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-[11px] font-mono border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
          >
            {formatCurrency(totalRevenue, { compact: true })} Total
          </Badge>
          <Badge
            variant="outline"
            className="text-[11px] font-mono border-border text-muted-foreground"
          >
            {totalOrders.toLocaleString()} Orders
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1">
        {chartData.length === 0 ? (
          <div className="flex h-[280px] w-full items-center justify-center text-xs text-muted-foreground">
            No revenue data available for the selected period.
          </div>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id={`revenue_fill_${gradientId}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-border/40"
                />

                <XAxis
                  dataKey="label"
                  stroke="currentColor"
                  className="text-[11px] text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="currentColor"
                  className="text-[11px] text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    val >= 1000
                      ? `$${(val / 1000).toFixed(0)}k`
                      : `$${val}`
                  }
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload
                      return (
                        <div className="rounded-lg border border-border/80 bg-background/95 p-3 shadow-md backdrop-blur-xs text-xs space-y-1.5 min-w-[170px]">
                          <p className="font-semibold text-foreground border-b border-border/60 pb-1">
                            {label}
                          </p>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-indigo-500" />
                              Revenue:
                            </span>
                            <span className="font-mono font-bold text-foreground">
                              {formatCurrency(Number(item.revenue))}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Orders:</span>
                            <span className="font-mono font-semibold text-foreground">
                              {item.orders}
                            </span>
                          </div>
                          {item.aov > 0 && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span>AOV:</span>
                              <span className="font-mono text-muted-foreground">
                                {formatCurrency(Number(item.aov))}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    }
                    return null
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#revenue_fill_${gradientId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
