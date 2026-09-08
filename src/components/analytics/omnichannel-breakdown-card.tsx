/**
 * @file omnichannel-breakdown-card.tsx
 * @description Channel GMV Distribution & Omnichannel Breakdown Donut Visualizations.
 * Renders platform device share (Desktop/Mobile Web/App) and Payment Gateway split strictly from API telemetry.
 */

"use client"

import * as React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { ChannelDistribution } from "@/types/analytics"

export interface OmnichannelBreakdownCardProps {
  distribution?: ChannelDistribution
  isLoading?: boolean
  className?: string
}

const CHANNEL_COLORS = [
  "#6366f1", // Desktop - Indigo
  "#06b6d4", // Mobile Web - Cyan
  "#8b5cf6", // Mobile App - Violet
  "#10b981", // Emerald
  "#f59e0b", // Amber
]

const GATEWAY_COLORS = [
  "#6366f1", // Stripe - Indigo
  "#10b981", // Razorpay - Emerald
  "#f59e0b", // COD - Amber
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
]

export function OmnichannelBreakdownCard({
  distribution,
  isLoading,
  className,
}: OmnichannelBreakdownCardProps) {
  const [activeTab, setActiveTab] = React.useState<"channel" | "gateway">(
    "channel"
  )

  if (isLoading) {
    return (
      <Card className={cn("border-border/70 bg-card/95 shadow-2xs", className)}>
        <CardHeader className="p-4 pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-52 mt-1" />
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <Skeleton className="h-[260px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  const channelData =
    distribution?.omnichannelShare?.map((c, idx) => ({
      name:
        c.channel === "WEB_DESKTOP"
          ? "Desktop Web"
          : c.channel === "MOBILE_WEB"
          ? "Mobile Web"
          : c.channel === "MOBILE_APP"
          ? "Mobile Apps"
          : c.channel.replace(/_/g, " "),
      value: c.gmv || c.sharePercent || 0,
      sharePercent: c.sharePercent || 0,
      gmv: c.gmv || 0,
      color: CHANNEL_COLORS[idx % CHANNEL_COLORS.length],
    })) ?? []

  const gatewayData =
    distribution?.paymentGateways?.map((g, idx) => ({
      name:
        g.provider === "STRIPE"
          ? "Stripe"
          : g.provider === "RAZORPAY"
          ? "Razorpay"
          : g.provider === "COD"
          ? "Cash on Delivery"
          : g.provider,
      value: g.transactionCount || g.sharePercent || 0,
      sharePercent: g.sharePercent || 0,
      count: g.transactionCount || 0,
      color: GATEWAY_COLORS[idx % GATEWAY_COLORS.length],
    })) ?? []

  const activeData = activeTab === "channel" ? channelData : gatewayData
  const totalGmv = channelData.reduce((sum, item) => sum + (item.gmv || 0), 0)
  const totalTx = gatewayData.reduce((sum, item) => sum + (item.count || 0), 0)

  const centerLabel =
    activeTab === "channel"
      ? formatCurrency(totalGmv, { compact: true })
      : `${totalTx.toLocaleString()}`
  const centerSublabel =
    activeTab === "channel" ? "Total GMV" : "Transactions"

  return (
    <Card className={cn("border-border/70 bg-card/95 shadow-2xs", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
        <div>
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            {activeTab === "channel"
              ? "Channel GMV Distribution"
              : "Payment Gateway Split"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            {activeTab === "channel"
              ? "Omnichannel platform device breakdown"
              : "Gateway transaction share"}
          </CardDescription>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("channel")}
            className={cn(
              "px-2 py-1 rounded-md font-medium transition-colors",
              activeTab === "channel"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Channels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gateway")}
            className={cn(
              "px-2 py-1 rounded-md font-medium transition-colors",
              activeTab === "gateway"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Gateways
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1">
        {activeData.length === 0 ? (
          <div className="flex h-[260px] w-full items-center justify-center text-xs text-muted-foreground">
            No channel distribution telemetry available for this period.
          </div>
        ) : (
          <div className="relative" style={{ width: "100%", height: 260 }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <span className="text-lg font-bold text-foreground sm:text-xl">
                {centerLabel}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {centerSublabel}
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload
                      return (
                        <div className="rounded-lg border border-border/80 bg-background/95 p-2.5 shadow-md backdrop-blur-xs text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-semibold text-foreground">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-muted-foreground">
                            <span>
                              {activeTab === "channel" ? "Revenue:" : "Orders:"}
                            </span>
                            <span className="font-bold text-foreground">
                              {activeTab === "channel"
                                ? formatCurrency(item.gmv || item.value)
                                : `${item.count || item.value} orders`}{" "}
                              ({item.sharePercent}%)
                            </span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />

                <Pie
                  data={activeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {activeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="transparent"
                    />
                  ))}
                </Pie>

                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => {
                    const entry = activeData.find((d) => d.name === value)
                    return (
                      <span className="text-xs text-muted-foreground">
                        {value}{" "}
                        <span className="text-[10px] text-muted-foreground/80 font-mono">
                          ({entry?.sharePercent}%)
                        </span>
                      </span>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
