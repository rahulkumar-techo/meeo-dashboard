/**
 * @file customer-360-insights-tab.tsx
 * @description Customer Insights tab with conversion funnel visualization, cart abandonment analysis, and top product/category interest affinities.
 */

"use client"

import * as React from "react"
import {
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  Eye,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MetricGrid, EmptyState } from "@/components/common"
import type { User360Insights } from "@/types/tracking"

interface Customer360InsightsTabProps {
  insights?: User360Insights | null
}

export function Customer360InsightsTab({ insights }: Customer360InsightsTabProps) {
  const funnel = insights?.funnel
  const topInterests = insights?.topInterests ?? []

  const viewToCart = funnel?.viewToCartPercent ?? 0
  const cartToCheckout = funnel?.cartToCheckoutPercent ?? 0
  const checkoutToPurchase = funnel?.checkoutToPurchasePercent ?? 0
  const abandonment = funnel?.cartAbandonmentPercent ?? 0

  const funnelStages = [
    {
      stage: "1. View Catalog",
      percentage: 100,
      label: "Discovery",
      color: "bg-indigo-500",
      textColor: "text-indigo-500",
      icon: Eye,
      description: "User browses product catalog",
    },
    {
      stage: "2. Add to Cart",
      percentage: Math.min(100, viewToCart),
      label: `${viewToCart}% conversion`,
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      icon: ShoppingCart,
      description: "Intent to buy registered",
    },
    {
      stage: "3. Initiate Checkout",
      percentage: Math.min(100, cartToCheckout),
      label: `${cartToCheckout}% conversion`,
      color: "bg-cyan-500",
      textColor: "text-cyan-500",
      icon: CreditCard,
      description: "Payment details input",
    },
    {
      stage: "4. Completed Purchase",
      percentage: Math.min(100, checkoutToPurchase),
      label: `${checkoutToPurchase}% conversion`,
      color: "bg-violet-500",
      textColor: "text-violet-500",
      icon: CheckCircle2,
      description: "Order confirmed & paid",
    },
  ]

  const interestChartData = topInterests.map((item) => ({
    name: item.entityId.slice(0, 12),
    fullName: item.entityId,
    type: item.type,
    score: item.score,
    views: item.viewCount,
    carts: item.cartCount,
    purchases: item.purchaseCount,
  }))

  return (
    <div className="space-y-6">
      {/* 1. Funnel KPIs */}
      <MetricGrid
        columns={4}
        items={[
          {
            title: "View to Cart Rate",
            value: `${viewToCart}%`,
            colorTheme: "emerald",
            icon: ShoppingCart,
            footnote: "Percentage of browsed products added to cart",
          },
          {
            title: "Cart to Checkout Rate",
            value: `${cartToCheckout}%`,
            colorTheme: "cyan",
            icon: CreditCard,
            footnote: "Percentage of carts moving to payment",
          },
          {
            title: "Checkout to Purchase",
            value: `${checkoutToPurchase}%`,
            colorTheme: "indigo",
            icon: CheckCircle2,
            footnote: "Terminal payment conversion rate",
          },
          {
            title: "Cart Abandonment Rate",
            value: `${abandonment}%`,
            colorTheme: abandonment > 50 ? "rose" : "amber",
            icon: AlertTriangle,
            badge: {
              text: abandonment > 60 ? "High Abandonment" : "Normal",
              variant: abandonment > 60 ? "destructive" : "warning",
            },
            footnote: "Carts created without completing payment",
          },
        ]}
      />

      {/* 2. Visual Conversion Funnel Flow */}
      <Card className="border-border/70 bg-card shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <span>Full E-Commerce Conversion Funnel</span>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Deterministic Telemetry
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Step-by-step user traversal from initial product impression down to order payment confirmation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {funnelStages.map((stage, idx) => {
              const Icon = stage.icon
              return (
                <div
                  key={stage.stage}
                  className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-2.5 relative flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md bg-muted text-foreground`}>
                        <Icon className="size-4" />
                      </div>
                      <span className="font-semibold text-xs text-foreground">{stage.stage}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground text-[11px]">{stage.description}</span>
                      <span className={`font-mono font-bold ${stage.textColor}`}>
                        {stage.percentage}%
                      </span>
                    </div>
                    <Progress value={stage.percentage} className="h-2" />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Top Interest Affinities Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Interest Affinities Bar Chart */}
        <Card className="border-border/70 bg-card shadow-2xs lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Top Category & Product Interest Affinities</span>
              <span className="text-xs text-muted-foreground font-normal">
                Algorithmically Computed Affinity Scores
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Based on view time, repeated cart actions, and completed checkouts
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {interestChartData.length === 0 ? (
              <EmptyState
                title="No Interest Data"
                description="Insufficient browsing signals to compute affinity scores yet."
              />
            ) : (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={interestChartData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-border/40" />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={80}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      cursor={{ fill: "currentColor", opacity: 0.08 }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const item = payload[0].payload
                        return (
                          <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-md text-xs text-popover-foreground backdrop-blur-xs space-y-1">
                            <p className="font-bold text-foreground">{item.fullName}</p>
                            <p className="text-muted-foreground">Type: <span className="font-mono text-foreground uppercase">{item.type}</span></p>
                            <p className="text-muted-foreground">Affinity Score: <span className="font-mono font-bold text-indigo-400">{item.score}</span></p>
                            <p className="text-muted-foreground text-[11px]">{item.views} views · {item.carts} carts · {item.purchases} purchases</p>
                          </div>
                        )
                      }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Affinity Cards List */}
        <Card className="border-border/70 bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span>Affinity Signals</span>
            </CardTitle>
            <CardDescription className="text-xs">Top ranked affinities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {topInterests.length === 0 ? (
              <p className="text-muted-foreground text-xs py-4 text-center">No affinity rankings recorded</p>
            ) : (
              topInterests.map((item, idx) => (
                <div
                  key={`${item.type}-${item.entityId}`}
                  className="rounded-lg border border-border/50 bg-muted/20 p-2.5 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                      {item.entityId}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {item.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Score: {item.score}</span>
                    <span>
                      {item.viewCount}v · {item.cartCount}c · {item.purchaseCount}p
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
