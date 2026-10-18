/**
 * @file metric-chart-card.tsx
 * @description Responsive Recharts time-series chart component for Prometheus metrics.
 * Displays interactive tooltips, linear gradients, and statistical aggregates.
 */

"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { Activity, ArrowUp, ArrowDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MetricsRangeResponse } from "@/types/observability"

interface MetricChartCardProps {
  title: string
  description?: string
  unit: string
  data?: MetricsRangeResponse
  isLoading?: boolean
  color?: "indigo" | "blue" | "emerald" | "amber" | "rose" | "purple"
  height?: number
  className?: string
}

const COLOR_MAP = {
  indigo: {
    stroke: "#6366f1",
    fill: "#6366f1",
    badgeBg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  },
  blue: {
    stroke: "#3b82f6",
    fill: "#3b82f6",
    badgeBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  emerald: {
    stroke: "#10b981",
    fill: "#10b981",
    badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  amber: {
    stroke: "#f59e0b",
    fill: "#f59e0b",
    badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  rose: {
    stroke: "#f43f5e",
    fill: "#f43f5e",
    badgeBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
  purple: {
    stroke: "#a855f7",
    fill: "#a855f7",
    badgeBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
}

export function MetricChartCard({
  title,
  description,
  unit,
  data,
  isLoading,
  color = "indigo",
  height = 240,
  className,
}: MetricChartCardProps) {
  const series = data?.series?.[0]
  const summary = series?.summary
  const activeColor = COLOR_MAP[color] || COLOR_MAP.indigo

  const chartData = React.useMemo(() => {
    if (!series?.points?.length) return []
    return series.points.map((p) => ({
      time: new Date(p.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      rawTime: p.timestamp,
      value: p.value,
    }))
  }, [series])

  const gradientId = React.useId().replace(/:/g, "")

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border/80 bg-card p-4 shadow-xs transition-all hover:border-border",
        className
      )}
    >
      {/* Header with Title & Stats summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
            <span
              className={cn(
                "rounded-md border px-1.5 py-0.5 text-[10px] font-mono font-medium",
                activeColor.badgeBg
              )}
            >
              {unit}
            </span>
            {isLoading && chartData.length > 0 && (
              <span className="relative flex size-1.5 shrink-0" title="Syncing telemetry in background...">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-indigo-500" />
              </span>
            )}
          </div>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>

        {/* Aggregates (Latest, Avg, Min, Max) */}
        {summary && (
          <div className="flex items-center gap-2.5 text-[11px] font-mono text-muted-foreground">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Now: </span>
              <span className="font-semibold text-foreground">
                {summary.latest} {unit}
              </span>
            </div>
            <span>•</span>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Avg: </span>
              <span className="font-medium text-foreground">
                {summary.avg} {unit}
              </span>
            </div>
            <span>•</span>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Peak: </span>
              <span className="font-medium text-foreground">
                {summary.max} {unit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recharts Area Canvas */}
      <div className="w-full pt-3" style={{ height }}>
        {isLoading && chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground animate-pulse">
            Loading metrics stream...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No telemetry points collected for this interval
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeColor.fill} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={activeColor.fill} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={25}
              />
              <YAxis
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}${unit === "%" ? "%" : ""}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload
                    return (
                      <div className="rounded-lg border border-border bg-popover/95 p-2 shadow-lg backdrop-blur-xs text-xs font-mono">
                        <div className="text-[10px] text-muted-foreground mb-1">
                          {dataPoint.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: activeColor.stroke }}
                          />
                          <span className="font-semibold text-foreground">
                            {dataPoint.value} {unit}
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={activeColor.stroke}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
