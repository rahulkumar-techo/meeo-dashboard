/**
 * @file observability-header.tsx
 * @description Header banner for Observability & System Metrics Console.
 * Controls time range, auto-refresh rate, and manual refetching.
 */

"use client"

import * as React from "react"
import {
  Activity,
  RefreshCw,
  Clock,
  Radio,
  CheckCircle2,
  ShieldCheck,
  Server,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertRulesDialog } from "./alert-rules-dialog"

interface ObservabilityHeaderProps {
  timeRange: string
  onTimeRangeChange: (range: string) => void
  refreshInterval: number | false
  onRefreshIntervalChange: (interval: number | false) => void
  isFetching?: boolean
  onRefresh: () => void
  activeNodesCount?: number
}

const TIME_RANGES = [
  { value: "15m", label: "Last 15m" },
  { value: "1h", label: "Last 1h" },
  { value: "6h", label: "Last 6h" },
  { value: "24h", label: "Last 24h" },
]

const REFRESH_OPTIONS = [
  { value: 5000, label: "5s (Realtime)" },
  { value: 15000, label: "15s (Normal)" },
  { value: 30000, label: "30s (Eco)" },
  { value: 60000, label: "60s (Slow)" },
  { value: false, label: "Paused" },
]

export function ObservabilityHeader({
  timeRange,
  onTimeRangeChange,
  refreshInterval,
  onRefreshIntervalChange,
  isFetching,
  onRefresh,
  activeNodesCount = 7,
}: ObservabilityHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card/95 to-indigo-950/20 p-5 shadow-sm">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 size-48 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Title & Status Badges */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Activity className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Observability & Telemetry Center
                </h1>
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cluster Operational
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <Server className="size-3 text-indigo-500" />
                  {activeNodesCount} Active Services
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  Prometheus + Loki + OpenTelemetry + BullMQ
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls: Time Range, Refresh Interval, Manual Refetch */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-background/80 p-0.5 text-xs">
            <Clock className="size-3.5 text-muted-foreground ml-2" />
            {TIME_RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => onTimeRangeChange(r.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                  timeRange === r.value
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Refresh Interval Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-background/80 px-2 py-1 text-xs">
            <Radio
              className={cn(
                "size-3.5",
                refreshInterval ? "text-emerald-500 animate-pulse" : "text-amber-500"
              )}
            />
            <select
              value={refreshInterval === false ? "false" : String(refreshInterval)}
              onChange={(e) => {
                const val = e.target.value === "false" ? false : Number(e.target.value)
                onRefreshIntervalChange(val)
              }}
              className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1"
            >
              {REFRESH_OPTIONS.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Alert Rules & Dynamic Thresholds */}
          <AlertRulesDialog />

          {/* Refresh Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={isFetching}
            className="h-8 gap-1.5 border-border/70 bg-background/80 text-xs font-medium hover:bg-muted cursor-pointer"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            <span>Refetch</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
