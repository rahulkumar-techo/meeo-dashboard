/**
 * @file metrics-kpi-grid.tsx
 * @description 6-card summary telemetry KPI grid showing 100% real live metrics.
 * Zero mock or dummy data.
 */

"use client"

import * as React from "react"
import {
  Activity,
  AlertTriangle,
  Zap,
  Cpu,
  HardDrive,
  Timer,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MetricsRangeResponse, ObservabilityConfigItem } from "@/types/observability"
import type { ServerMetricsData } from "@/types/server-metrics"
import { evaluateServerAlert } from "@/utils/observabilityAlerts"

interface MetricsKpiGridProps {
  httpRateData?: MetricsRangeResponse
  errorRateData?: MetricsRangeResponse
  latencyData?: MetricsRangeResponse
  cpuData?: MetricsRangeResponse
  memoryData?: MetricsRangeResponse
  eventLoopData?: MetricsRangeResponse
  hostMetrics?: ServerMetricsData
  configs?: ObservabilityConfigItem[]
  isLoading?: boolean
}

export function MetricsKpiGrid({
  httpRateData,
  errorRateData,
  latencyData,
  cpuData,
  memoryData,
  eventLoopData,
  hostMetrics,
  configs,
  isLoading,
}: MetricsKpiGridProps) {
  // Helper to extract stats strictly from real telemetry
  const getStats = (res?: MetricsRangeResponse, fallbackRealValue = 0) => {
    const s = res?.series?.[0]?.summary
    return {
      latest: s?.latest !== undefined ? s.latest : fallbackRealValue,
      avg: s?.avg !== undefined ? s.avg : fallbackRealValue,
      max: s?.max !== undefined ? s.max : fallbackRealValue,
      min: s?.min !== undefined ? s.min : fallbackRealValue,
      hasData: Boolean(s?.count && s.count > 0),
    }
  }

  // Derive real fallback values from live host Prometheus parser if range series is empty
  const realHostReqs = hostMetrics?.httpTraffic?.totalRequests ?? 0
  const realHostErrors = hostMetrics?.httpTraffic?.totalErrors ?? 0
  const realHostErrorPct = hostMetrics?.httpTraffic?.overallErrorRatePercent ?? 0
  const realHostLatency = hostMetrics?.httpTraffic?.avgLatencyMs ?? 0
  const realHostRps = hostMetrics?.httpTraffic?.requestsPerSecond ?? 0
  const realHostCpu = hostMetrics?.cpu?.totalSeconds
    ? Number(((hostMetrics.cpu.userSeconds / hostMetrics.cpu.totalSeconds) * 100).toFixed(1))
    : 0
  const realHostMemory = hostMetrics?.memory?.residentBytes
    ? Number((hostMetrics.memory.residentBytes / (1024 * 1024)).toFixed(0))
    : 0
  const realHostEventLoop = hostMetrics?.eventLoop?.lagP90Seconds
    ? Number((hostMetrics.eventLoop.lagP90Seconds * 1000).toFixed(2))
    : 0

  const httpRate = getStats(httpRateData, realHostRps)
  const errorRate = getStats(errorRateData, realHostErrorPct)
  const latency = getStats(latencyData, realHostLatency)
  const cpu = getStats(cpuData, realHostCpu)
  const memory = getStats(memoryData, realHostMemory)
  const eventLoop = getStats(eventLoopData, realHostEventLoop)

  // Evaluate dynamic threshold alert rules (L1 memory cache backed)
  const serverConfig = configs?.find((c) => c.key === "thresholds:server_5xx")
  const serverAlert = evaluateServerAlert(errorRate.latest, serverConfig?.value)

  const cards = [
    {
      title: "HTTP Request Rate",
      value: httpRate.hasData ? `${httpRate.latest.toFixed(1)}` : `${realHostReqs}`,
      unit: httpRate.hasData ? "req/s" : "total reqs",
      avg: httpRate.hasData ? `${httpRate.avg.toFixed(1)} avg` : `${realHostReqs} total`,
      status: "normal",
      statusText: "Active",
      icon: Activity,
      color: "text-blue-500",
      bgGradient: "from-blue-500/10 to-indigo-500/5",
      borderColor: "border-blue-500/20",
    },
    {
      title: "5xx Server Error Rate",
      value: `${errorRate.latest.toFixed(2)}`,
      unit: "%",
      avg: `${errorRate.avg.toFixed(2)}% avg`,
      status:
        serverAlert.severity === "critical"
          ? "danger"
          : serverAlert.severity === "warning"
          ? "warning"
          : "normal",
      statusText:
        serverAlert.severity === "critical"
          ? "Critical"
          : serverAlert.severity === "warning"
          ? "Warning"
          : "Nominal",
      icon: AlertTriangle,
      color:
        serverAlert.severity === "critical"
          ? "text-rose-500"
          : serverAlert.severity === "warning"
          ? "text-amber-500"
          : "text-emerald-500",
      bgGradient:
        serverAlert.severity === "critical"
          ? "from-rose-500/15 to-red-500/10"
          : serverAlert.severity === "warning"
          ? "from-amber-500/15 to-orange-500/10"
          : "from-emerald-500/10 to-teal-500/5",
      borderColor:
        serverAlert.severity === "critical"
          ? "border-rose-500/40"
          : serverAlert.severity === "warning"
          ? "border-amber-500/40"
          : "border-emerald-500/20",
    },
    {
      title: "P95 Request Latency",
      value: `${latency.latest.toFixed(1)}`,
      unit: "ms",
      avg: `${latency.avg.toFixed(1)} ms avg`,
      status: latency.latest > 200 ? "warning" : "normal",
      statusText: latency.latest > 200 ? "Elevated" : "Normal",
      icon: Zap,
      color: latency.latest > 200 ? "text-amber-500" : "text-indigo-500",
      bgGradient: "from-indigo-500/10 to-violet-500/5",
      borderColor: "border-indigo-500/20",
    },
    {
      title: "Process CPU Usage",
      value: `${cpu.latest.toFixed(1)}`,
      unit: "%",
      avg: `${cpu.avg.toFixed(1)}% avg`,
      status: cpu.latest > 75 ? "danger" : cpu.latest > 45 ? "warning" : "normal",
      statusText: cpu.latest > 75 ? "High Load" : "Nominal",
      icon: Cpu,
      color: "text-purple-500",
      bgGradient: "from-purple-500/10 to-fuchsia-500/5",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Resident Memory (RSS)",
      value: `${memory.latest.toFixed(0)}`,
      unit: "MB",
      avg: `${memory.max.toFixed(0)} MB max`,
      status: memory.latest > 800 ? "warning" : "normal",
      statusText: "V8 Heap",
      icon: HardDrive,
      color: "text-teal-500",
      bgGradient: "from-teal-500/10 to-emerald-500/5",
      borderColor: "border-teal-500/20",
    },
    {
      title: "Event Loop Lag (P95)",
      value: `${eventLoop.latest.toFixed(2)}`,
      unit: "ms",
      avg: `${eventLoop.avg.toFixed(2)} ms avg`,
      status: eventLoop.latest > 20 ? "warning" : "normal",
      statusText: eventLoop.latest > 20 ? "Delay" : "Responsive",
      icon: Timer,
      color: "text-amber-500",
      bgGradient: "from-amber-500/10 to-orange-500/5",
      borderColor: "border-amber-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className={cn(
              "relative overflow-hidden rounded-xl border bg-card p-3.5 shadow-xs transition-all hover:shadow-md",
              card.borderColor
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute -right-6 -bottom-6 size-20 rounded-full bg-gradient-to-br blur-xl opacity-60",
                card.bgGradient
              )}
            />

            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[11px] font-medium text-muted-foreground truncate">
                {card.title}
              </span>
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/60",
                  card.color
                )}
              >
                <Icon className="size-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span className="text-xl font-bold tracking-tight text-foreground font-mono">
                {card.value}
              </span>
              <span className="text-xs text-muted-foreground font-medium">{card.unit}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40 mt-2">
              <span className="text-muted-foreground truncate">{card.avg}</span>
              <span
                className={cn(
                  "font-medium px-1.5 py-0.5 rounded text-[10px] uppercase font-mono shrink-0",
                  card.status === "danger"
                    ? "bg-rose-500/10 text-rose-500"
                    : card.status === "warning"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-emerald-500/10 text-emerald-500"
                )}
              >
                {card.statusText}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
