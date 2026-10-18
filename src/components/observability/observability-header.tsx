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
import { useObservabilityContext, parseIntervalToMs } from "@/context/observability-context"

interface ObservabilityHeaderProps {
  timeRange: string
  onTimeRangeChange: (range: string) => void
  refreshInterval: number | false
  onRefreshIntervalChange: (interval: number | false) => void
  isFetching?: boolean
  onRefresh: () => void
  activeNodesCount?: number
}

const DEFAULT_WINDOWS = ["15m", "1h", "6h", "24h"]
const DEFAULT_INTERVALS = ["5s", "15s", "30s", "Off"]

export function ObservabilityHeader({
  timeRange,
  onTimeRangeChange,
  refreshInterval,
  onRefreshIntervalChange,
  isFetching,
  onRefresh,
  activeNodesCount = 0,
}: ObservabilityHeaderProps) {
  const { pollingPolicy } = useObservabilityContext()

  // Dynamically derive time ranges from server-enforced allowed windows
  const allowedWindows = pollingPolicy?.allowedWindows?.length
    ? pollingPolicy.allowedWindows
    : DEFAULT_WINDOWS

  const timeRanges = React.useMemo(() => {
    const labels: Record<string, string> = {
      "15m": "Last 15m",
      "1h": "Last 1h",
      "6h": "Last 6h",
      "24h": "Last 24h",
    }
    return allowedWindows.map((w) => ({
      value: w,
      label: labels[w] || `Last ${w}`,
    }))
  }, [allowedWindows])

  // Dynamically derive refresh interval options from server-enforced allowed intervals
  const allowedIntervals = pollingPolicy?.allowedIntervals?.length
    ? pollingPolicy.allowedIntervals
    : DEFAULT_INTERVALS

  const refreshOptions = React.useMemo(() => {
    return allowedIntervals.map((iv) => {
      const ms = parseIntervalToMs(iv)
      let label = iv
      if (iv === "5s") label = "5s (Realtime)"
      else if (iv === "15s") label = "15s (Normal)"
      else if (iv === "30s") label = "30s (Eco)"
      else if (iv.toLowerCase() === "off") label = "Paused (Off)"
      else if (ms !== false) label = `${iv} (${Math.round(ms / 1000)}s)`

      return {
        value: ms,
        raw: iv,
        label,
      }
    })
  }, [allowedIntervals])

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
                {pollingPolicy?.cacheTier && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-mono text-[10px] hidden sm:inline-flex"
                    title={`Server Polling Policy (${pollingPolicy.cacheTier})`}
                  >
                    <Radio className="size-2.5 text-indigo-400" />
                    {pollingPolicy.cacheTier}
                  </Badge>
                )}
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
            {timeRanges.map((r) => (
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
              {refreshOptions.map((opt) => (
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
