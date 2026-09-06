"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Percent,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Store,
  Smartphone,
  Building2,
  Tv,
  Package,
  Activity,
  Zap,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { cn } from "cn"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("30d")
  const [channel, setChannel] = React.useState("all")
  const [chartInterval, setChartInterval] = React.useState<"hourly" | "daily" | "weekly" | "monthly">("daily")
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 800)
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase">
            <span>Analytics</span>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">Performance Intelligence</span>
            <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
              SYS-TELEMETRY: LIVE
            </Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BarChart3 className="size-7 text-indigo-600" />
            Executive Revenue & Funnel Analytics
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Real-time commerce telemetry, multi-channel cohort conversion, unit economics, and GMV forecasting.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-9 px-3 rounded-lg border text-xs bg-card text-foreground cursor-pointer focus:outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days (Oct 1 - Oct 31, 2024)</option>
            <option value="90d">Last 90 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-xs font-mono text-indigo-700 font-semibold border border-indigo-200">
            <TrendingUp className="size-3.5" />
            <span>Prev Period: +14.2% YoY</span>
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleRefresh}
            className="size-9"
            title="Refresh Telemetry"
          >
            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin text-indigo-600")} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button size="sm" className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium" />}>
              <Download className="size-4" />
              <span>Export BI</span>
              <ChevronDown className="size-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <span className="font-mono text-indigo-600 font-bold">CSV</span> Raw Transaction Logs (1.4 MB)
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <span className="font-mono text-purple-600 font-bold">PARQ</span> Parquet Lake Export (0.3 MB)
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <span className="font-mono text-rose-600 font-bold">PDF</span> Executive Deck Report (4.2 MB)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 4 High-Density Tactical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: GMV */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Gross Merchandise Value (GMV)</span>
              <div className="text-2xl font-bold font-mono text-foreground tracking-tight">$1,842,910.40</div>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px] font-semibold gap-0.5">
              <ArrowUpRight className="size-3" /> +18.4%
            </Badge>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-mono text-[11px]">Target: $1.75M</span>
              <span className="font-semibold text-indigo-600 font-mono text-[11px]">104% Goal Pacing</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        {/* Card 2: Net Operating Margin */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Net Operating Margin</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-foreground">28.4%</span>
                <span className="text-xs font-mono text-muted-foreground">($523,386)</span>
              </div>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px] font-semibold gap-0.5">
              <ArrowUpRight className="size-3" /> +2.1%
            </Badge>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>COGS 52%</span>
              <span>Log 9.8%</span>
              <span>Ads 7.4%</span>
              <span>Pay 2.4%</span>
            </div>
            <div className="h-2 w-full rounded-full flex overflow-hidden bg-muted">
              <div className="bg-slate-400" style={{ width: "52%" }} title="COGS 52%" />
              <div className="bg-indigo-600" style={{ width: "28.4%" }} title="Net Margin 28.4%" />
              <div className="bg-purple-500" style={{ width: "9.8%" }} title="Logistics 9.8%" />
              <div className="bg-amber-500" style={{ width: "7.4%" }} title="Ads 7.4%" />
              <div className="bg-rose-400" style={{ width: "2.4%" }} title="Payment Fees 2.4%" />
            </div>
          </div>
        </div>

        {/* Card 3: Unit Economics CAC/LTV */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Blended Unit Economics</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-foreground">4.2x</span>
                <span className="text-xs font-mono text-muted-foreground">LTV : CAC</span>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">Benchmark &gt; 3.0x</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2 rounded-lg font-mono text-xs">
            <div>
              <span className="text-muted-foreground text-[10px] block">Blended CAC</span>
              <span className="font-bold text-foreground">$34.20</span>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block">Payback Period</span>
              <span className="font-bold text-indigo-600">48 Days</span>
            </div>
          </div>
        </div>

        {/* Card 4: Conversion & Abandonment */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Conversion & Abandonment</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-foreground">3.62%</span>
                <span className="text-xs font-mono text-muted-foreground">Net Conv</span>
              </div>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px] font-semibold gap-0.5">
              <ArrowUpRight className="size-3" /> +0.4% lift
            </Badge>
          </div>
          <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg font-mono text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">Cart Recovery</span>
              <span className="font-bold text-foreground">24.8%</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Recovered GMV</span>
              <span className="font-bold text-indigo-600">+$84,200</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Layout: Left (8 Cols) + Right (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chart Module: Revenue & Order Velocity */}
          <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-foreground">Revenue & Order Volume Multi-Axis Velocity</h2>
                  <Badge variant="outline" className="font-mono text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 font-bold">
                    DUAL AXIS
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daily gross receipts versus fulfilled transaction counts across 30 calendar days
                </p>
              </div>

              <div className="flex items-center bg-muted p-0.5 rounded-lg text-xs font-medium">
                {(["hourly", "daily", "weekly", "monthly"] as const).map((int) => (
                  <button
                    key={int}
                    onClick={() => setChartInterval(int)}
                    className={cn(
                      "px-2.5 py-1 rounded transition-colors capitalize",
                      chartInterval === int ? "bg-card text-foreground font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {int}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Legend Badges */}
            <div className="flex flex-wrap items-center gap-4 py-2 px-3 bg-muted/40 rounded-lg text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-indigo-600" />
                <span className="text-muted-foreground">Gross Sales:</span>
                <span className="font-bold text-foreground">$1.84M</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">Net Sales:</span>
                <span className="font-bold text-foreground">$1.62M</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Discounts:</span>
                <span className="font-bold text-foreground">-$142.8k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-500" />
                <span className="text-muted-foreground">Refunds:</span>
                <span className="font-bold text-rose-600">-$18.4k</span>
              </div>
            </div>

            {/* Peak Sales Banner */}
            <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-indigo-600" />
                <span className="font-semibold text-foreground">Peak Sales Event: Oct 28 Flash Drop</span>
                <span className="text-muted-foreground font-mono">($94.2k GMV • 1,120 orders • Peak Conv 5.12%)</span>
              </div>
              <span className="font-mono text-indigo-700 font-semibold text-[11px]">99.4% Gateway OK</span>
            </div>

            {/* High Density SVG Visualizer */}
            <div className="h-64 w-full relative pt-2">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 220">
                <defs>
                  <linearGradient id="gmvAreaGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="40" x2="700" y2="40" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="700" y2="90" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="700" y2="140" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="190" x2="700" y2="190" stroke="#e2e8f0" strokeDasharray="3 3" />

                {/* Column Bars (Order count) */}
                <g fill="#94a3b8" opacity="0.35">
                  <rect x="35" y="150" width="12" height="60" rx="2" />
                  <rect x="105" y="130" width="12" height="80" rx="2" />
                  <rect x="175" y="120" width="12" height="90" rx="2" />
                  <rect x="245" y="115" width="12" height="95" rx="2" />
                  <rect x="315" y="105" width="12" height="105" rx="2" />
                  <rect x="385" y="85" width="12" height="125" rx="2" />
                  <rect x="455" y="75" width="12" height="135" rx="2" />
                  <rect x="525" y="65" width="12" height="145" rx="2" />
                  <rect x="595" y="30" width="12" height="180" rx="2" fill="#4f46e5" opacity="0.8" />
                  <rect x="665" y="70" width="12" height="140" rx="2" />
                </g>

                {/* GMV Area */}
                <path
                  d="M0,170 Q70,160 140,150 T280,140 T420,110 T560,95 T630,22 T700,80 L700,210 L0,210 Z"
                  fill="url(#gmvAreaGrad)"
                />
                {/* GMV Line */}
                <path
                  d="M0,170 Q70,160 140,150 T280,140 T420,110 T560,95 T630,22 T700,80"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                />

                {/* Peak Dot */}
                <circle cx="630" cy="22" r="5" fill="#4f46e5" className="animate-pulse" />
                <circle cx="630" cy="22" r="2.5" fill="#ffffff" />
              </svg>
            </div>
            <div className="flex justify-between font-mono text-[11px] text-muted-foreground pt-1 border-t">
              <span>Oct 01</span>
              <span>Oct 08</span>
              <span>Oct 15</span>
              <span>Oct 22</span>
              <span className="text-indigo-600 font-bold">Oct 28 (Peak)</span>
              <span>Oct 31</span>
            </div>
          </div>

          {/* Storefront Conversion Funnel & Drop-Off Telemetry */}
          <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Storefront Conversion Funnel & Telemetry</h2>
                <p className="text-xs text-muted-foreground">Step-down drop-off analysis from edge session arrival to completed transaction</p>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-mono text-xs font-bold">
                Net Conv: 3.62%
              </Badge>
            </div>

            {/* 5-Step Funnel Bars */}
            <div className="space-y-3 text-xs">
              {/* Step 1 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-indigo-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">1</span>
                    <span className="font-semibold text-foreground">Storefront Sessions</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-foreground">384,200</span>
                    <span className="text-muted-foreground w-12 text-right">100.0%</span>
                  </div>
                </div>
                <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-indigo-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">2</span>
                    <span className="font-semibold text-foreground">Product Detail Page (PDP) Views</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-foreground">198,400</span>
                    <span className="text-muted-foreground w-12 text-right">51.6%</span>
                  </div>
                </div>
                <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: "51.6%" }} />
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-purple-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">3</span>
                    <span className="font-semibold text-foreground">Added to Cart</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-foreground">42,100</span>
                    <span className="text-muted-foreground w-12 text-right">11.0%</span>
                  </div>
                </div>
                <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: "11.0%" }} />
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-amber-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">4</span>
                    <span className="font-semibold text-foreground">Checkout Initiated (Step 1 Address)</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-foreground">21,400</span>
                    <span className="text-amber-600 font-semibold w-12 text-right">5.6%</span>
                  </div>
                </div>
                <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "5.6%" }} />
                </div>
              </div>

              {/* Step 5 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-emerald-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">5</span>
                    <span className="font-semibold text-foreground">Payment Authorized (Completed Orders)</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-emerald-600">13,910</span>
                    <span className="text-emerald-700 font-bold w-12 text-right">3.62%</span>
                  </div>
                </div>
                <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: "3.62%" }} />
                </div>
              </div>
            </div>

            {/* Funnel Diagnostics Note */}
            <div className="p-3 rounded-lg bg-muted/40 border flex items-start gap-2.5 text-xs">
              <Sparkles className="size-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-muted-foreground">
                <span className="font-semibold text-foreground">Funnel Optimization Lever:</span>
                <p>
                  Largest drop occurs at <strong className="text-foreground font-semibold">Cart → Checkout Step 1 (-49.2% drop)</strong>. Enforcing cart threshold banners ($75 free shipping) and 1-Click Apple Pay reduces abandoned checkout instances by an estimated 14.8%.
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Cohort Retention Matrix */}
          <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-3 overflow-x-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Monthly Acquisition Cohort Retention Matrix</h2>
                <p className="text-xs text-muted-foreground">LTV repeat repurchase frequency tracked over 6 subsequent operational months</p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">6-Month Trajectory</Badge>
            </div>

            <div className="min-w-[580px] space-y-1.5 pt-2 text-xs font-mono">
              <div className="grid grid-cols-8 gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-1">
                <div className="col-span-2">Cohort Month</div>
                <div className="text-center">M0</div>
                <div className="text-center">M+1</div>
                <div className="text-center">M+2</div>
                <div className="text-center">M+3</div>
                <div className="text-center">M+4</div>
                <div className="text-center">M+5</div>
              </div>

              {[
                { month: "May 2024 (1,840 users)", rates: ["100%", "44.2%", "38.6%", "33.1%", "30.4%", "28.2%"] },
                { month: "Jun 2024 (2,120 users)", rates: ["100%", "46.5%", "39.8%", "35.0%", "31.8%", "—"] },
                { month: "Jul 2024 (2,490 users)", rates: ["100%", "48.1%", "41.2%", "36.8%", "—", "—"] },
                { month: "Aug 2024 (2,810 users)", rates: ["100%", "51.0%", "43.4%", "—", "—", "—"] },
                { month: "Sep 2024 (3,040 users)", rates: ["100%", "53.4%", "—", "—", "—", "—"] },
                { month: "Oct 2024 (3,410 users)", rates: ["100%", "—", "—", "—", "—", "—"] },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-8 gap-1.5 items-center">
                  <div className="col-span-2 text-foreground font-sans font-medium text-xs truncate">{row.month}</div>
                  {row.rates.map((rate, rIdx) => {
                    const isFilled = rate !== "—"
                    return (
                      <div
                        key={rIdx}
                        className={cn(
                          "h-7 rounded flex items-center justify-center font-mono text-[11px]",
                          rate === "100%" ? "bg-indigo-600 text-white font-bold" :
                          isFilled ? "bg-indigo-100 text-indigo-900 font-semibold" :
                          "bg-muted/40 text-muted-foreground/50"
                        )}
                      >
                        {rate}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sales Channel GMV Breakdown */}
          <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-foreground">Sales Channels & GMV Share</h2>

            <div className="space-y-3 text-xs">
              {/* Channel 1 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Store className="size-4 text-indigo-600" />
                    <span className="font-semibold text-foreground">Online Storefront</span>
                  </div>
                  <span className="font-mono font-bold">$1,142,600 (62%)</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "62%" }} />
                </div>
              </div>

              {/* Channel 2 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="size-4 text-purple-600" />
                    <span className="font-semibold text-foreground">Mobile App (iOS / Android)</span>
                  </div>
                  <span className="font-mono font-bold">$442,300 (24%)</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: "24%" }} />
                </div>
              </div>

              {/* Channel 3 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="size-4 text-emerald-600" />
                    <span className="font-semibold text-foreground">B2B Wholesale Portal</span>
                  </div>
                  <span className="font-mono font-bold">$184,300 (10%)</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: "10%" }} />
                </div>
              </div>

              {/* Channel 4 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Tv className="size-4 text-amber-600" />
                    <span className="font-semibold text-foreground">POS Kiosks</span>
                  </div>
                  <span className="font-mono font-bold">$73,710 (4%)</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: "4%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Top Velocity SKUs */}
          <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Top SKU Velocity Leaderboard</h2>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">30D Volume</span>
            </div>

            <div className="space-y-3">
              {[
                { name: "Apex Pro Custom Keyboard", sku: "APX-KB-BLK-TAC", gmv: "$284,100", units: "1,420", growth: "+22%" },
                { name: "Moondrop Blessing 3 IEMs", sku: "MND-BL3-IEM", gmv: "$198,400", units: "622", growth: "+38%" },
                { name: "Ergonomic Mesh Armchair", sku: "FURN-CH-ERG-01", gmv: "$142,800", units: "410", growth: "+8%" },
                { name: "Braided Coiled Aviator Cable", sku: "CBL-AVT-CHR", gmv: "$64,200", units: "1,426", growth: "+19%" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border text-xs">
                  <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                    <div className="font-semibold text-foreground truncate">{item.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{item.sku}</div>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <div className="font-bold text-foreground">{item.gmv}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">{item.growth} • {item.units} sold</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forecasting & GMV Projection */}
          <div className="rounded-xl border bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">ML Forecast (Q4 Proj)</span>
              <Badge className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-mono text-[10px]">
                95% Conf
              </Badge>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight">$2,410,000</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on rolling 30-day velocity and seasonality coefficient, gross revenue is projected to expand by +24% during Cyber Week.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
