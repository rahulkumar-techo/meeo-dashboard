/**
 * @file event-loop-latency-chart.tsx
 * @description Recharts latency percentile graph & utilization distribution for Node.js Libuv Event Loop.
 */

"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Info, Zap } from "lucide-react"
import type { ParsedEventLoopMetrics } from "@/services/metrics.service"

interface EventLoopLatencyChartProps {
  eventLoop?: ParsedEventLoopMetrics
  className?: string
}

export function EventLoopLatencyChart({ eventLoop, className }: EventLoopLatencyChartProps) {
  const pMin = eventLoop ? eventLoop.lagMinSeconds * 1000 : 0.36
  const p50 = eventLoop ? eventLoop.lagP50Seconds * 1000 : 16.72
  const p90 = eventLoop ? eventLoop.lagP90Seconds * 1000 : 25.02
  const p99 = eventLoop ? eventLoop.lagP99Seconds * 1000 : 35.19
  const pMean = eventLoop ? eventLoop.lagMeanSeconds * 1000 : 18.54
  const pMax = eventLoop ? eventLoop.lagMaxSeconds * 1000 : 455.60

  const percentileData = [
    { label: "Min", latencyMs: parseFloat(pMin.toFixed(2)), description: "Fastest execution cycle" },
    { label: "P50 (Median)", latencyMs: parseFloat(p50.toFixed(2)), description: "50% of tasks execute within" },
    { label: "Mean", latencyMs: parseFloat(pMean.toFixed(2)), description: "Average task execution delay" },
    { label: "P90", latencyMs: parseFloat(p90.toFixed(2)), description: "90% of tasks execute within" },
    { label: "P99", latencyMs: parseFloat(p99.toFixed(2)), description: "99th percentile execution time" },
    { label: "Max Spike", latencyMs: parseFloat(pMax.toFixed(2)), description: "Worst recorded stall/blocking" },
  ]

  return (
    <Card className={`border-border/70 bg-card shadow-2xs ${className || ""}`}>
      <CardHeader className="p-4 pb-2 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Event Loop Latency Distribution Graph</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Delay curve in milliseconds between scheduled timers and Libuv execution
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
            {pMean.toFixed(2)} ms Mean Lag
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3 space-y-3">
        {/* Recharts Area Graph */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={percentileData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="eventLoopLagGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10.5, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                tickFormatter={(val) => `${val}ms`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-3 shadow-xl text-xs space-y-1 min-w-[170px] text-popover-foreground animate-in fade-in-50">
                      <span className="font-bold text-foreground block">{d.label}</span>
                      <p className="text-[11px] text-muted-foreground">{d.description}</p>
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm pt-1 border-t border-border/40">
                        <span>Latency:</span>
                        <span>{d.latencyMs} ms</span>
                      </div>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="latencyMs"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#eventLoopLagGradient)"
                activeDot={{ r: 5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Calculation Description Note */}
        <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 text-[11px] text-muted-foreground flex items-start gap-2">
          <Info className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <p>
            <strong>What this calculates:</strong> Derived from <code className="font-mono text-foreground">nodejs_eventloop_lag_*</code> using <code className="font-mono text-foreground">perf_hooks.monitorEventLoopDelay</code>. It measures how many milliseconds the event loop was blocked by synchronous tasks before handling queued I/O events.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
