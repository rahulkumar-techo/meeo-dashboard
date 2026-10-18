/**
 * @file server-kpi-grid.tsx
 * @description Top KPI Grid for Server Status with memory gauges, event loop metrics, and CPU telemetry.
 */

"use client"

import * as React from "react"
import { HardDrive, Activity, Cpu, Radio, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { ServerMetricsData } from "@/services/metrics.service"

interface ServerKpiGridProps {
  metrics?: ServerMetricsData
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 MB"
  const mb = bytes / (1024 * 1024)
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`
}

function formatTimeDuration(seconds: number): string {
  if (seconds < 0.001) return `${(seconds * 1000000).toFixed(1)} µs`
  if (seconds < 1) return `${(seconds * 1000).toFixed(2)} ms`
  return `${seconds.toFixed(2)} s`
}

function formatUptime(uptimeSec: number): string {
  const hours = Math.floor(uptimeSec / 3600)
  const minutes = Math.floor((uptimeSec % 3600) / 60)
  const seconds = Math.floor(uptimeSec % 60)
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

export function ServerKpiGrid({ metrics }: ServerKpiGridProps) {
  const cpu = metrics?.cpu
  const memory = metrics?.memory
  const eventLoop = metrics?.eventLoop
  const handles = metrics?.handles
  const gc = metrics?.gc

  const eventLoopStatus =
    (eventLoop?.lagMeanSeconds ?? 0) < 0.05
      ? "Optimal"
      : (eventLoop?.lagMeanSeconds ?? 0) < 0.15
      ? "Moderate"
      : "High Latency"

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Memory RSS */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Resident Memory (RSS)
            </span>
            <div className="size-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HardDrive className="size-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {memory && memory.residentBytes > 0 ? formatBytes(memory.residentBytes) : "0 MB"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              Heap: {memory && memory.heapUsedBytes > 0 ? formatBytes(memory.heapUsedBytes) : "0 MB"} • Ext: {memory && memory.externalBytes > 0 ? formatBytes(memory.externalBytes) : "0 MB"}
            </p>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10.5px] font-mono text-muted-foreground">
              <span>Heap Allocation:</span>
              <span>{memory?.heapUsedPercent ?? 0}% used</span>
            </div>
            <Progress value={memory?.heapUsedPercent ?? 0} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Event Loop Lag */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Event Loop Lag (Mean)
            </span>
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="size-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {eventLoop && eventLoop.lagMeanSeconds > 0 ? formatTimeDuration(eventLoop.lagMeanSeconds) : "0 ms"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              P50: {eventLoop && eventLoop.lagP50Seconds > 0 ? formatTimeDuration(eventLoop.lagP50Seconds) : "0 ms"} • P99: {eventLoop && eventLoop.lagP99Seconds > 0 ? formatTimeDuration(eventLoop.lagP99Seconds) : "0 ms"}
            </p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Status: {eventLoopStatus}
            </Badge>
            <span className="text-[10.5px] font-mono text-muted-foreground">
              StdDev: {eventLoop && eventLoop.lagStddevSeconds > 0 ? formatTimeDuration(eventLoop.lagStddevSeconds) : "0 ms"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 3. CPU Time & Uptime */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Process CPU Seconds
            </span>
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Cpu className="size-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {cpu && cpu.totalSeconds > 0 ? `${cpu.totalSeconds.toFixed(2)}s` : "0s"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              User: {cpu && cpu.userSeconds > 0 ? `${cpu.userSeconds.toFixed(2)}s` : "0s"} • Sys: {cpu && cpu.systemSeconds > 0 ? `${cpu.systemSeconds.toFixed(2)}s` : "0s"}
            </p>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-muted-foreground">Process Uptime:</span>
            <Badge variant="secondary" className="font-mono text-[10.5px]">
              {cpu && cpu.uptimeSeconds > 0 ? formatUptime(cpu.uptimeSeconds) : "0s"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 4. Active Handles & GC */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Active Handles & GC
            </span>
            <div className="size-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Radio className="size-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {handles && handles.activeHandlesTotal > 0 ? `${handles.activeHandlesTotal} Handles` : "0 Handles"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              Resources: {handles?.activeResourcesTotal ?? 0} • GC Cycles: {gc?.totalGcCount ?? 0}
            </p>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-muted-foreground">GC Pause Sum:</span>
            <span className="font-mono font-semibold text-foreground">
              {gc && gc.totalGcTimeSeconds > 0 ? formatTimeDuration(gc.totalGcTimeSeconds) : "0 ms"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
