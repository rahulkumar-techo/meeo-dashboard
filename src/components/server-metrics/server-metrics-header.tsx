/**
 * @file server-metrics-header.tsx
 * @description Header bar with PageHeader, live beacon, Node.js version pill, and auto-refresh controls.
 * Default auto-refresh set to 1 minute (60s) to prevent unnecessary network load.
 */

"use client"

import * as React from "react"
import { Clock, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ParsedRuntimeInfo } from "@/services/metrics.service"

interface ServerMetricsHeaderProps {
  runtime?: ParsedRuntimeInfo
  refreshInterval: number | false
  onRefreshIntervalChange: (val: number | false) => void
  isFetching: boolean
  onRefresh: () => void
}

export function ServerMetricsHeader({
  runtime,
  refreshInterval,
  onRefreshIntervalChange,
  isFetching,
  onRefresh,
}: ServerMetricsHeaderProps) {
  return (
    <PageHeader
      title="Server Status & System Metrics"
      badge="PROMETHEUS /METRICS"
      badgeVariant="brand"
      description="Real-time telemetry monitoring for Node.js V8 runtime, process memory, event loop latency, and active handles."
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Live Status Beacon */}
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
          </span>
          <span>Server Live</span>
        </div>

        {/* Node.js Version Pill */}
        <Badge variant="outline" className="font-mono text-xs px-2 py-1 bg-muted/30 text-foreground">
          Node {runtime?.version || "Active"}
        </Badge>

        {/* Refresh Interval Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="size-3.5 text-muted-foreground hidden sm:inline" />
          <select
            value={refreshInterval === false ? "pause" : String(refreshInterval)}
            onChange={(e) => {
              const val = e.target.value
              onRefreshIntervalChange(val === "pause" ? false : Number(val))
            }}
            className="h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden font-medium cursor-pointer"
          >
            <option value="60000">Every 1 min (Default)</option>
            <option value="30000">Every 30s</option>
            <option value="120000">Every 2 mins</option>
            <option value="300000">Every 5 mins</option>
            <option value="10000">Every 10s (Fast)</option>
            <option value="pause">Pause Auto-Refresh</option>
          </select>
        </div>

        {/* Manual Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-8.5 gap-1.5 text-xs font-medium cursor-pointer"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin text-indigo-600")} />
          <span>{isFetching ? "Polling..." : "Refresh"}</span>
        </Button>
      </div>
    </PageHeader>
  )
}
