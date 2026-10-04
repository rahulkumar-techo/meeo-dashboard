/**
 * @file customer-360-behaviour-tab.tsx
 * @description Behavioural telemetry tab displaying user event actions, browsing intensity, cart manipulation, and search activity.
 */

"use client"

import * as React from "react"
import {
  Eye,
  ShoppingCart,
  ShoppingBag,
  Search,
  CheckCircle2,
  XCircle,
  Activity,
  Clock,
  TrendingUp,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MetricGrid, EmptyState } from "@/components/common"
import { formatDate } from "@/lib/formatters"
import type { User360BehaviorSummary } from "@/types/tracking"

interface Customer360BehaviourTabProps {
  behavior?: User360BehaviorSummary | null
}

export function Customer360BehaviourTab({ behavior }: Customer360BehaviourTabProps) {
  const productViews = behavior?.productViews ?? 0
  const cartAdds = behavior?.cartAdds ?? 0
  const cartRemoves = behavior?.cartRemoves ?? 0
  const checkoutStarted = behavior?.checkoutStarted ?? 0
  const paymentSuccess = behavior?.paymentSuccess ?? 0
  const paymentFailure = behavior?.paymentFailure ?? 0
  const totalSearches = behavior?.totalSearches ?? 0
  const lastActiveAt = behavior?.lastActiveAt

  const telemetryChartData = [
    { name: "Product Views", count: productViews, color: "#6366f1" },
    { name: "Cart Adds", count: cartAdds, color: "#10b981" },
    { name: "Cart Removes", count: cartRemoves, color: "#f43f5e" },
    { name: "Checkouts", count: checkoutStarted, color: "#3b82f6" },
    { name: "Purchases", count: paymentSuccess, color: "#059669" },
    { name: "Failures", count: paymentFailure, color: "#ef4444" },
    { name: "Searches", count: totalSearches, color: "#8b5cf6" },
  ]

  const totalActions =
    productViews + cartAdds + cartRemoves + checkoutStarted + paymentSuccess + paymentFailure + totalSearches

  return (
    <div className="space-y-6">
      {/* 1. Behaviour Telemetry KPIs */}
      <MetricGrid
        columns={4}
        items={[
          {
            title: "Product Catalog Views",
            value: productViews,
            colorTheme: "indigo",
            icon: Eye,
            footnote: "Browsing depth across products",
          },
          {
            title: "Cart Additions",
            value: cartAdds,
            subValue: `${cartRemoves} removed`,
            colorTheme: "emerald",
            icon: ShoppingCart,
            footnote: cartAdds > 0 ? `${Math.round((cartRemoves / cartAdds) * 100)}% removal rate` : "No cart actions",
          },
          {
            title: "Checkouts Initiated",
            value: checkoutStarted,
            subValue: `${paymentSuccess} paid`,
            colorTheme: "cyan",
            icon: ShoppingBag,
            footnote: checkoutStarted > 0 ? `${Math.round((paymentSuccess / checkoutStarted) * 100)}% checkout conversion` : "0%",
          },
          {
            title: "Search Queries Run",
            value: totalSearches,
            colorTheme: "violet",
            icon: Search,
            footnote: "In-app discovery queries executed",
          },
        ]}
      />

      {/* 2. Telemetry Distribution Chart & Health Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Telemetry Actions Distribution Chart */}
        <Card className="border-border/70 bg-card shadow-2xs lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Telemetry Event Volume Distribution</span>
              <span className="text-xs text-muted-foreground font-normal">
                {totalActions} Total Event Signals
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Aggregate event frequency across customer store journey
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {totalActions === 0 ? (
              <EmptyState
                title="No Telemetry Data"
                description="No telemetry events have been recorded for this user yet."
              />
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={telemetryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "currentColor", opacity: 0.08 }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const item = payload[0]
                        return (
                          <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-md text-xs text-popover-foreground backdrop-blur-xs space-y-1">
                            <p className="font-semibold text-foreground">{item.payload.name}</p>
                            <p className="font-mono font-bold text-foreground">
                              {item.value} {Number(item.value) === 1 ? "event" : "events"}
                            </p>
                          </div>
                        )
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {telemetryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Telemetry Insights Sidebar Card */}
        <Card className="border-border/70 bg-card shadow-2xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <span>Browsing Health & Intent</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Behavioural telemetry diagnostics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Clock className="size-3.5 text-primary" />
                <span>Last Telemetry Heartbeat</span>
              </span>
              <p className="font-semibold text-foreground text-sm">
                {lastActiveAt ? formatDate(lastActiveAt, "datetime") : "No recorded activity"}
              </p>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Payment Success Ratio</span>
              </span>
              <p className="font-semibold text-foreground text-sm">
                {paymentSuccess + paymentFailure > 0
                  ? `${Math.round((paymentSuccess / (paymentSuccess + paymentFailure)) * 100)}% (${paymentSuccess} ok, ${paymentFailure} fail)`
                  : "No payment attempts"}
              </p>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <TrendingUp className="size-3.5 text-indigo-500" />
                <span>Browse-to-Cart Conversion</span>
              </span>
              <p className="font-semibold text-foreground text-sm">
                {productViews > 0 ? `${((cartAdds / productViews) * 100).toFixed(1)}%` : "0%"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
