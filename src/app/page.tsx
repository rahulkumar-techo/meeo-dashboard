"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calendar,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Truck,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [activeMetricTab, setActiveMetricTab] = React.useState<"revenue" | "orders" | "aov">("revenue")
  const [activeTimeGranularity, setActiveTimeGranularity] = React.useState<"H" | "D" | "W" | "M">("D")

  return (
    <div className="space-y-4">
      {/* 1. Dashboard Top Header Bar */}
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Dashboard
            </h1>
            <Badge
              variant="outline"
              className="border-indigo-200/80 bg-indigo-50/70 font-mono text-[10px] font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              GLOBAL REALTIME
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Welcome back, Sarah. Here is what is happening across your global stores today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <Calendar className="size-3.5 text-muted-foreground" />
            <span>Last 30 Days</span>
            <span className="text-muted-foreground">▾</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export Snapshot</span>
          </Button>

          <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground">
            <RotateCcw className="size-3 text-muted-foreground" />
            <span>Cached 2m ago</span>
          </div>
        </div>
      </div>

      {/* 2. Triage Queue Alert Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-border/70 bg-card p-2.5 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
            <Radio className="size-3.5 animate-pulse" />
            <span>TRIAGE QUEUE:</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground text-[11.5px]">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>Low Stock:</span>
            <strong className="font-semibold text-foreground">8 items</strong>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground text-[11.5px]">
            <span className="size-1.5 rounded-full bg-rose-500" />
            <span>Out of Stock:</span>
            <strong className="font-semibold text-foreground">2 items</strong>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground text-[11.5px]">
            <span className="size-1.5 rounded-full bg-indigo-500" />
            <span>Pending Fulfillment:</span>
            <strong className="font-semibold text-foreground">142 orders</strong>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-rose-200/60 bg-rose-50/80 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertTriangle className="size-3 text-rose-600" />
            <span>Failed Payments: <strong>5 ($412.00)</strong></span>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-amber-200/60 bg-amber-50/80 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            <RefreshCw className="size-3 text-amber-600" />
            <span>Failed Outbox: <strong>1 event</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-3.5" />
          <span>Cluster healthy (99.98%)</span>
        </div>
      </div>

      {/* 3. Four KPI Metric Cards with Mini Sparkline Waves */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL REVENUE */}
        <Card className="shadow-2xs border-border/70 overflow-hidden relative">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                TOTAL REVENUE
              </span>
              <Badge variant="success" className="h-4.5 px-1.5 text-[10.5px] font-semibold gap-0.5">
                <TrendingUp className="size-3" /> +18.4%
              </Badge>
            </div>
            <div className="mt-1.5 text-2xl font-black tracking-tight text-foreground">
              $1,248,320.50
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              vs $1,054,120.00 prior 30d
            </div>
            {/* Sparkline wave */}
            <div className="mt-2.5 h-7 w-full overflow-hidden">
              <svg className="size-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
                <path
                  d="M0 20 Q15 12 30 18 T60 10 T85 14 T100 4"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* TOTAL ORDERS */}
        <Card className="shadow-2xs border-border/70 overflow-hidden relative">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                TOTAL ORDERS
              </span>
              <Badge variant="success" className="h-4.5 px-1.5 text-[10.5px] font-semibold gap-0.5">
                <TrendingUp className="size-3" /> +12.1%
              </Badge>
            </div>
            <div className="mt-1.5 text-2xl font-black tracking-tight text-foreground">
              14,290
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              vs 12,746 prior 30d
            </div>
            {/* Sparkline wave */}
            <div className="mt-2.5 h-7 w-full overflow-hidden">
              <svg className="size-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
                <path
                  d="M0 22 Q20 22 40 16 T70 12 T85 8 T100 3"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* AVERAGE ORDER VALUE */}
        <Card className="shadow-2xs border-border/70 overflow-hidden relative">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                AVERAGE ORDER VALUE
              </span>
              <Badge variant="success" className="h-4.5 px-1.5 text-[10.5px] font-semibold gap-0.5">
                <TrendingUp className="size-3" /> +5.6%
              </Badge>
            </div>
            <div className="mt-1.5 text-2xl font-black tracking-tight text-foreground">
              $87.35
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              vs $82.70 prior 30d
            </div>
            {/* Sparkline wave */}
            <div className="mt-2.5 h-7 w-full overflow-hidden">
              <svg className="size-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
                <path
                  d="M0 18 Q25 20 45 15 T70 18 T85 10 T100 5"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* ACTIVE CUSTOMERS */}
        <Card className="shadow-2xs border-border/70 overflow-hidden relative">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                ACTIVE CUSTOMERS
              </span>
              <Badge variant="success" className="h-4.5 px-1.5 text-[10.5px] font-semibold gap-0.5">
                <TrendingUp className="size-3" /> +9.8%
              </Badge>
            </div>
            <div className="mt-1.5 text-2xl font-black tracking-tight text-foreground">
              8,940
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              vs 8,142 prior 30d
            </div>
            {/* Sparkline wave */}
            <div className="mt-2.5 h-7 w-full overflow-hidden">
              <svg className="size-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
                <path
                  d="M0 20 Q20 18 40 18 T65 14 T80 6 T100 20"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Middle Section: Financial Velocity & Volume + Inventory Thresholds */}
      <div className="grid gap-3.5 lg:grid-cols-12">
        {/* Left Column: Financial Velocity & Volume Chart */}
        <Card className="lg:col-span-8 shadow-2xs border-border/70 flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-bold tracking-tight">
                    Financial Velocity & Volume
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[9.5px] font-mono font-medium text-muted-foreground"
                  >
                    Live Pipeline
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Real-time throughput comparison with preceding 30-day baseline
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {/* Metric Selector Buttons */}
                <div className="flex rounded-md border border-border/80 bg-muted/40 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveMetricTab("revenue")}
                    className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                      activeMetricTab === "revenue"
                        ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Revenue ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMetricTab("orders")}
                    className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                      activeMetricTab === "orders"
                        ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Orders (#)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMetricTab("aov")}
                    className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                      activeMetricTab === "aov"
                        ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    AOV ($)
                  </button>
                </div>

                {/* Granularity Tabs */}
                <div className="flex rounded-md border border-border/80 bg-muted/40 p-0.5 text-xs font-mono">
                  {(["H", "D", "W", "M"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setActiveTimeGranularity(g)}
                      className={`size-6 rounded text-[10px] font-semibold transition-colors ${
                        activeTimeGranularity === g
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-1 space-y-4">
            {/* Interactive SVG Chart Area with Double Curve and Peak Tooltip */}
            <div className="relative h-56 w-full pt-4">
              <svg className="size-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" strokeDasharray="3 3" className="text-border/60" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="currentColor" strokeDasharray="3 3" className="text-border/60" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" strokeDasharray="3 3" className="text-border/60" />

                {/* Baseline curve (dashed purple/gray) */}
                <path
                  d="M0 135 C 70 140, 140 120, 210 130 C 280 140, 350 125, 420 95 C 490 65, 540 85, 600 100"
                  fill="none"
                  stroke="#a5b4fc"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Current 30d filled area */}
                <path
                  d="M0 130 C 70 120, 140 125, 210 110 C 280 95, 350 100, 420 40 C 490 60, 540 45, 600 50 L 600 180 L 0 180 Z"
                  fill="url(#areaGradient)"
                />

                {/* Current 30d stroke line */}
                <path
                  d="M0 130 C 70 120, 140 125, 210 110 C 280 95, 350 100, 420 40 C 490 60, 540 45, 600 50"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Peak point indicator at x=420, y=40 */}
                <circle cx="420" cy="40" r="5" fill="#4f46e5" className="animate-pulse" />
                <circle cx="420" cy="40" r="2.5" fill="#ffffff" />
              </svg>

              {/* Peak Sale Floating Tooltip exactly matching screenshot */}
              <div className="absolute left-[65%] top-[10px] -translate-x-1/2 rounded-md bg-[#0f172a] p-2 text-white shadow-xl text-left border border-slate-700 min-w-36 pointer-events-none">
                <div className="text-[10px] font-medium text-slate-300">Oct 24 (Peak Sale)</div>
                <div className="text-sm font-bold text-white mt-0.5">$54,200.00</div>
                <div className="text-[10px] font-semibold text-emerald-400 mt-0.5 flex items-center gap-0.5">
                  <span>↗ +34.2% vs baseline</span>
                </div>
              </div>

              {/* X-Axis labels */}
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground pt-2">
                <span>Oct 01</span>
                <span>Oct 08</span>
                <span>Oct 15</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Oct 24 (Peak)</span>
                <span>Oct 31</span>
              </div>
            </div>

            {/* Bottom 4 Summary KPIs in light bar */}
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 sm:grid-cols-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  30D GROSS TOTAL
                </div>
                <div className="text-sm font-bold text-foreground mt-0.5">
                  $1,248,320.50
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  DAILY AVERAGE
                </div>
                <div className="text-sm font-bold text-foreground mt-0.5">
                  $41,610.68
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  PEAK DAY RECORD
                </div>
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  $54,200.00
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  CONVERSION VELOCITY
                </div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  3.84% (+0.4%)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Inventory Thresholds Card */}
        <Card className="lg:col-span-4 shadow-2xs border-border/70">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-amber-500" />
                <CardTitle className="text-sm font-bold tracking-tight">
                  Inventory Thresholds
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
              >
                3 Critical
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Automated replenishment alerts triggered at warehouse hub NJ-02
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 pt-2 space-y-3.5">
            {/* Item 1: Apex Pro Wireless Mouse */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">
                  Apex Pro Wireless Mouse
                </span>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold px-1.5 py-0">
                  4 left
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                SKU: APX-MS-GRY • Space Gray
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[16%]" />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Reorder threshold: 25</span>
                <button type="button" className="font-semibold text-indigo-600 hover:underline">
                  Reorder / Adjust
                </button>
              </div>
            </div>

            {/* Item 2: Ergonomic Keycap Set */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">
                  Ergonomic Keycap Set
                </span>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold px-1.5 py-0">
                  2 left
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                SKU: APX-KC-NOR • Nordic Layout
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[12%]" />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Reorder threshold: 15</span>
                <button type="button" className="font-semibold text-indigo-600 hover:underline">
                  Adjust
                </button>
              </div>
            </div>

            {/* Item 3: Studio Monitor Desk Mount */}
            <div className="rounded-lg border border-rose-200/80 bg-rose-50/40 p-3 space-y-2 dark:border-rose-900/50 dark:bg-rose-950/20">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">
                  Studio Monitor Desk M...
                </span>
                <Badge variant="destructive" className="bg-rose-600 text-white text-[9.5px] font-bold px-1.5 py-0">
                  OUT OF STOCK
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                SKU: MNT-DK-DUAL • Heavy Duty
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-rose-700 dark:text-rose-400 font-medium">Stockout duration: 3h 12m</span>
                <Button
                  size="xs"
                  className="bg-rose-700 hover:bg-rose-800 text-white font-semibold text-[10.5px] px-2 h-6"
                >
                  Emergency Restock
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Bottom Section: Recent Orders Live Stream + Operations & Failures */}
      <div className="grid gap-3.5 lg:grid-cols-12">
        {/* Left Column: Recent Orders Live Stream Table */}
        <Card className="lg:col-span-8 shadow-2xs border-border/70 flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Truck className="size-4 text-indigo-600" />
                  <CardTitle className="text-sm font-bold tracking-tight">
                    Recent Orders Live Stream
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Sub-minute settlement ledger synced with fulfillment hubs
                </CardDescription>
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
                    <th className="pb-2 font-bold">ORDER ID</th>
                    <th className="pb-2 font-bold">CUSTOMER</th>
                    <th className="pb-2 font-bold text-center">ITEMS</th>
                    <th className="pb-2 font-bold">PAYMENT</th>
                    <th className="pb-2 font-bold">FULFILLMENT</th>
                    <th className="pb-2 font-bold text-right">TOTAL AMOUNT</th>
                    <th className="pb-2 font-bold text-right">TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-normal">
                  {/* Row 1 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      ORD-10248
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-foreground">David Miller</div>
                      <div className="text-[10.5px] text-muted-foreground">david.m@example.com</div>
                    </td>
                    <td className="py-2.5 text-center font-mono text-muted-foreground">3</td>
                    <td className="py-2.5">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/70 text-[10px] font-medium">
                        Paid: Stripe
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200/70 text-[10px] font-medium">
                        Confirmed
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-foreground">$249.00</td>
                    <td className="py-2.5 text-right text-[11px] text-muted-foreground">4m ago</td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      ORD-10247
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-foreground">Elena Rostova</div>
                      <div className="text-[10.5px] text-muted-foreground">elena.r@techcorp.io</div>
                    </td>
                    <td className="py-2.5 text-center font-mono text-muted-foreground">1</td>
                    <td className="py-2.5">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/70 text-[10px] font-medium">
                        Paid: PayPal
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200/70 text-[10px] font-medium">
                        Processing
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-foreground">$1,199.00</td>
                    <td className="py-2.5 text-right text-[11px] text-muted-foreground">18m ago</td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                      ORD-10246
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-foreground">Marcus Chen</div>
                      <div className="text-[10.5px] text-muted-foreground">mchen@acme.org</div>
                    </td>
                    <td className="py-2.5 text-center font-mono text-muted-foreground">5</td>
                    <td className="py-2.5">
                      <Badge variant="destructive" className="text-[10px] font-medium">
                        Failed
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-medium">
                        Cancelled
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">$342.50</td>
                    <td className="py-2.5 text-right text-[11px] text-muted-foreground">42m ago</td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      ORD-10245
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-foreground">Sarah Connor</div>
                      <div className="text-[10.5px] text-muted-foreground">s.connor@sky.net</div>
                    </td>
                    <td className="py-2.5 text-center font-mono text-muted-foreground">2</td>
                    <td className="py-2.5">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/70 text-[10px] font-medium">
                        Paid: Stripe
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200/70 text-[10px] font-medium">
                        Shipped
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-foreground">$89.00</td>
                    <td className="py-2.5 text-right text-[11px] text-muted-foreground">1h ago</td>
                  </tr>

                  {/* Row 5 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      ORD-10244
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-foreground">Liam Vance</div>
                      <div className="text-[10.5px] text-muted-foreground">lvance@design.co</div>
                    </td>
                    <td className="py-2.5 text-center font-mono text-muted-foreground">4</td>
                    <td className="py-2.5">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/70 text-[10px] font-medium">
                        Paid: Apple Pay
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/70 text-[10px] font-medium">
                        Delivered
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-foreground">$450.00</td>
                    <td className="py-2.5 text-right text-[11px] text-muted-foreground">2h ago</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
              <span className="text-muted-foreground">
                Showing 5 of 14,290 synchronized orders
              </span>
              <Link
                href="/orders"
                className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                View All 14,290 Orders →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Operations & Failures */}
        <Card className="lg:col-span-4 shadow-2xs border-border/70 flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="size-4 text-rose-500" />
                <CardTitle className="text-sm font-bold tracking-tight">
                  Operations & Failures
                </CardTitle>
              </div>
              <Badge
                variant="destructive"
                className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] font-bold px-1.5 py-0"
              >
                Action Required
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2 space-y-3">
            {/* Event 1 */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-600 dark:text-rose-400 font-mono">
                  PAY-99214 ($342.50)
                </span>
                <span className="text-[10.5px] text-muted-foreground">42m ago</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Card declined: <code className="rounded bg-rose-50 text-rose-700 px-1 py-0.5 font-mono text-[10px]">insufficient_funds</code> (Stripe Gateway)
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button size="xs" className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-medium h-6 px-2.5">
                  Retry Charge
                </Button>
                <Button size="xs" variant="outline" className="text-[10.5px] font-medium h-6 px-2 border-border/80">
                  Notify Customer
                </Button>
              </div>
            </div>

            {/* Event 2 */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-700 dark:text-amber-400 font-mono">
                  EVT-88102 (Outbox)
                </span>
                <span className="text-[10.5px] text-muted-foreground">1h 14m ago</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                <code className="font-mono text-[10px] text-foreground">inventory.reserved</code> event timed out after 3 exponential retries.
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-muted-foreground font-mono text-[10px]">Broker: kafka-cluster-01</span>
                <button type="button" className="font-semibold text-indigo-600 hover:underline">
                  Inspect Payload
                </button>
              </div>
            </div>

            {/* Event 3 */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">
                  Shopify Sync Connector
                </span>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold px-1.5 py-0">
                  Degraded
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Catalog updates currently queued. Backlog latency elevated by +14m.
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-muted-foreground font-mono text-[10px]">Queue depth: 318</span>
                <Button size="xs" variant="outline" className="text-[10.5px] font-medium h-6 px-2 border-border/80">
                  Restart Worker
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}