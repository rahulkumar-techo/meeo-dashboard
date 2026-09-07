/**
 * @file page.tsx
 * @description Executive Revenue & Funnel Telemetry Analytics (< 220 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Download, Calendar, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PageHeader, MetricGrid } from "@/components/common"
import {
  AreaTrendChart,
  DonutDistributionChart,
} from "@/components/charts"
import {
  REVENUE_TREND_DATA,
  CHANNEL_SHARE_DATA,
  FUNNEL_STAGES,
} from "@/data/analytics"
import { formatCurrency } from "@/lib/formatters"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("30d")

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <PageHeader
        title="Executive Revenue & Funnel Analytics"
        badge="Live Telemetry"
        badgeVariant="brand"
        description="Real-time commerce telemetry, multi-channel cohort conversion, unit economics, and GMV forecasting."
      >
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Analytics</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Net GMV Velocity (30D)", value: "$1,248,320.50", colorTheme: "emerald", trend: { value: "+18.4%", isPositive: true }, footnote: "vs $1,054,120.00 baseline" },
          { title: "Blended Conversion Rate", value: "3.84%", colorTheme: "indigo", trend: { value: "+0.42%", isPositive: true }, footnote: "E-Commerce benchmark: 2.5%" },
          { title: "Average Order Value (AOV)", value: "$87.35", colorTheme: "amber", trend: { value: "+5.6%", isPositive: true }, footnote: "Prior period: $82.70" },
          { title: "Customer Acquisition Cost", value: "$18.40", colorTheme: "cyan", trend: { value: "-8.2%", isPositive: true }, footnote: "LTV / CAC Ratio: 22.4x" },
        ]}
      />

      {/* 3. Recharts Section: Revenue Velocity Area Chart + Omnichannel Donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <AreaTrendChart
            title="30-Day Financial Velocity Curve ($)"
            description="Continuous revenue throughput comparison with prior baseline"
            data={REVENUE_TREND_DATA}
            valueFormatter={(val) => formatCurrency(val)}
            previousDataKey="previousValue"
            seriesLabel="Current 30D"
            previousSeriesLabel="Baseline 30D"
            color="#6366f1"
          />
        </div>

        <div className="lg:col-span-4">
          <DonutDistributionChart
            title="Channel GMV Distribution"
            description="Omnichannel share breakdown"
            data={CHANNEL_SHARE_DATA}
            centerLabel="$1.25M"
            centerSublabel="Total GMV"
            valueFormatter={(val) => formatCurrency(val, { compact: true })}
          />
        </div>
      </div>

      {/* 4. Conversion Funnel Stages */}
      <Card className="border-border/70 bg-card/95 shadow-2xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold tracking-tight">E-Commerce Conversion Funnel Throughput</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {FUNNEL_STAGES.map((st, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">{st.stage}</span>
                <span className="font-mono text-muted-foreground">{st.count} ({st.dropoff})</span>
              </div>
              <Progress value={st.pct} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
