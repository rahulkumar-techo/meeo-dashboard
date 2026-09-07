/**
 * @file page.tsx
 * @description Root Dashboard Page - Modularized and clean (< 250 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calendar,
  Download,
  Truck,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  PageHeader,
  TriageBanner,
  MetricGrid,
  StatusBadge,
} from "@/components/common"
import {
  DASHBOARD_TRIAGE_ITEMS,
  DASHBOARD_KPI_CARDS,
  DASHBOARD_LIVE_ORDERS,
} from "@/data/dashboard"

export default function DashboardPage() {
  const [activeMetricTab, setActiveMetricTab] = React.useState<"revenue" | "orders" | "aov">("revenue")
  const [activeTimeGranularity, setActiveTimeGranularity] = React.useState<"H" | "D" | "W" | "M">("D")

  return (
    <div className="space-y-4">
      {/* 1. Page Header */}
      <PageHeader
        title="Dashboard"
        badge="GLOBAL REALTIME"
        description="Welcome back, Sarah. Here is what is happening across your global stores today."
        cacheStatus="Cached 2m ago"
      >
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium border-border/80">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span>Last 30 Days</span>
          <span className="text-muted-foreground">▾</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Snapshot</span>
        </Button>
      </PageHeader>

      {/* 2. Triage Alert Strip */}
      <TriageBanner items={DASHBOARD_TRIAGE_ITEMS} />

      {/* 3. Four KPI Metric Cards */}
      <MetricGrid items={DASHBOARD_KPI_CARDS} />

      {/* 4. Financial Velocity & Volume + Inventory Thresholds */}
      <div className="grid gap-3.5 lg:grid-cols-12">
        {/* Left: Financial Velocity & Volume Chart */}
        <Card className="lg:col-span-8 shadow-2xs border-border/70 flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-bold tracking-tight">
                    Financial Velocity & Volume
                  </CardTitle>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9.5px] font-mono font-medium text-muted-foreground">
                    Live Pipeline
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Real-time throughput comparison with preceding 30-day baseline
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-md border border-border/80 bg-muted/40 p-0.5 text-xs">
                  {(
                    [
                      { key: "revenue", label: "Revenue ($)" },
                      { key: "orders", label: "Orders (#)" },
                      { key: "aov", label: "AOV ($)" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveMetricTab(tab.key)}
                      className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                        activeMetricTab === tab.key
                          ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

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
            <div className="relative h-56 w-full pt-4">
              <svg className="size-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" strokeDasharray="3 3" className="text-border/60" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="currentColor" strokeDasharray="3 3" className="text-border/60" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" strokeDasharray="3 3" className="text-border/60" />
                <path d="M0 135 C 70 140, 140 120, 210 130 C 280 140, 350 125, 420 95 C 490 65, 540 85, 600 100" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M0 130 C 70 120, 140 125, 210 110 C 280 95, 350 100, 420 40 C 490 60, 540 45, 600 50 L 600 180 L 0 180 Z" fill="url(#dashboardAreaGrad)" />
                <path d="M0 130 C 70 120, 140 125, 210 110 C 280 95, 350 100, 420 40 C 490 60, 540 45, 600 50" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="420" cy="40" r="5" fill="#4f46e5" className="animate-pulse" />
                <circle cx="420" cy="40" r="2.5" fill="#ffffff" />
              </svg>

              <div className="absolute left-[65%] top-[10px] -translate-x-1/2 rounded-md bg-[#0f172a] p-2 text-white shadow-xl text-left border border-slate-700 min-w-36 pointer-events-none text-xs">
                <div className="text-[10px] font-medium text-slate-300">Oct 24 (Peak Sale)</div>
                <div className="text-sm font-bold text-white mt-0.5">$54,200.00</div>
                <div className="text-[10px] font-semibold text-emerald-400 mt-0.5">↗ +34.2% vs baseline</div>
              </div>

              <div className="flex justify-between text-[11px] font-mono text-muted-foreground pt-2">
                <span>Oct 01</span>
                <span>Oct 08</span>
                <span>Oct 15</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Oct 24 (Peak)</span>
                <span>Oct 31</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 sm:grid-cols-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">30D GROSS TOTAL</div>
                <div className="text-sm font-bold text-foreground mt-0.5">$1,248,320.50</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">DAILY AVERAGE</div>
                <div className="text-sm font-bold text-foreground mt-0.5">$41,610.68</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">PEAK DAY RECORD</div>
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">$54,200.00</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CONVERSION VELOCITY</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">3.84% (+0.4%)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Inventory Thresholds */}
        <Card className="lg:col-span-4 shadow-2xs border-border/70">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-amber-500" />
                <CardTitle className="text-sm font-bold tracking-tight">Inventory Thresholds</CardTitle>
              </div>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                3 Critical
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="font-bold">Apex Pro Wireless Mouse</span><Badge className="bg-amber-100 text-amber-800 text-[10px]">4 left</Badge></div>
              <div className="text-[11px] text-muted-foreground">SKU: APX-MS-GRY • Reorder: 25</div>
              <Link href="/inventory" className="text-xs font-semibold text-indigo-600 hover:underline">Reorder / Adjust →</Link>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="font-bold">Ergonomic Keycap Set</span><Badge className="bg-amber-100 text-amber-800 text-[10px]">2 left</Badge></div>
              <div className="text-[11px] text-muted-foreground">SKU: APX-KC-NOR • Reorder: 15</div>
              <Link href="/inventory" className="text-xs font-semibold text-indigo-600 hover:underline">Adjust →</Link>
            </div>
            <div className="rounded-lg border border-rose-200/80 bg-rose-50/40 p-2.5 space-y-1.5 text-xs dark:border-rose-900/50 dark:bg-rose-950/20">
              <div className="flex justify-between"><span className="font-bold">Studio Monitor Desk Mount</span><Badge variant="destructive" className="text-[9.5px]">OUT OF STOCK</Badge></div>
              <div className="text-[11px] text-muted-foreground">Stockout: 3h 12m</div>
              <Button size="sm" className="bg-rose-700 text-white text-[10.5px] h-6 px-2">Emergency Restock</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Bottom Section: Live Stream + Operations */}
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
                      <td className={`py-2.5 font-mono font-bold ${ord.isError ? "text-rose-600" : "text-indigo-600"}`}>
                        <Link href="/orders" className="hover:underline">{ord.id}</Link>
                      </td>
                      <td className="py-2.5"><div className="font-semibold">{ord.customer.name}</div><div className="text-[10.5px] text-muted-foreground">{ord.customer.email}</div></td>
                      <td className="py-2.5 text-center font-mono text-muted-foreground">{ord.itemsCount}</td>
                      <td className="py-2.5"><StatusBadge status={ord.payment.status} tone={ord.payment.tone} /></td>
                      <td className="py-2.5"><StatusBadge status={ord.fulfillment.status} tone={ord.fulfillment.tone} /></td>
                      <td className={`py-2.5 text-right font-mono font-bold ${ord.isError ? "text-rose-600" : ""}`}>{ord.total}</td>
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

        <Card className="lg:col-span-4 shadow-2xs border-border/70">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="size-4 text-rose-500" />
                <CardTitle className="text-sm font-bold tracking-tight">Operations & Failures</CardTitle>
              </div>
              <Badge variant="destructive" className="text-[10px] font-bold">Action Required</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3 text-xs">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1">
              <div className="flex justify-between font-mono font-bold text-rose-600"><span>PAY-99214 ($342.50)</span><span className="text-[10.5px] text-muted-foreground">42m ago</span></div>
              <div className="text-[11px] text-muted-foreground">Card declined: <code>insufficient_funds</code> (Stripe)</div>
              <div className="flex gap-2 pt-1"><Button size="sm" className="bg-indigo-600 text-white text-[10.5px] h-6 px-2">Retry Charge</Button><Button size="sm" variant="outline" className="text-[10.5px] h-6 px-2">Notify</Button></div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1">
              <div className="flex justify-between font-mono font-bold text-amber-700"><span>EVT-88102 (Outbox)</span><span className="text-[10.5px] text-muted-foreground">1h 14m ago</span></div>
              <div className="text-[11px] text-muted-foreground"><code>inventory.reserved</code> timed out after 3 retries.</div>
              <Link href="/operations/outbox-events" className="text-xs font-semibold text-indigo-600 hover:underline">Inspect Payload →</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}