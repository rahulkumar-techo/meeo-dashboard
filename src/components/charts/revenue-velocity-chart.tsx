"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RevenueVelocityChartProps {
  className?: string
}

export function RevenueVelocityChart({ className }: RevenueVelocityChartProps) {
  const [activeMetricTab, setActiveMetricTab] = React.useState<"revenue" | "orders" | "aov">("revenue")
  const [activeTimeGranularity, setActiveTimeGranularity] = React.useState<"H" | "D" | "W" | "M">("D")

  return (
    <Card className={cn("shadow-2xs border-border/70 flex flex-col justify-between", className)}>
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
                  className={cn(
                    "rounded px-2 py-1 text-[11px] font-medium transition-colors",
                    activeMetricTab === tab.key
                      ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
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
                  className={cn(
                    "size-6 rounded text-[10px] font-semibold transition-colors",
                    activeTimeGranularity === g
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
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
  )
}
