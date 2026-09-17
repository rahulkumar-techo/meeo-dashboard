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
              {memory ? formatBytes(memory.residentBytes) : "179.21 MB"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              Heap: {memory ? formatBytes(memory.heapUsedBytes) : "74.93 MB"} • Ext: {memory ? formatBytes(memory.externalBytes) : "5.93 MB"}
            </p>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10.5px] font-mono text-muted-foreground">
              <span>Heap Allocation:</span>
              <span>{memory?.heapUsedPercent ?? 95}% used</span>
            </div>
            <Progress value={memory?.heapUsedPercent ?? 95} className="h-1.5" />
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
              {eventLoop ? formatTimeDuration(eventLoop.lagMeanSeconds) : "18.54 ms"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              P50: {eventLoop ? formatTimeDuration(eventLoop.lagP50Seconds) : "16.72 ms"} • P99: {eventLoop ? formatTimeDuration(eventLoop.lagP99Seconds) : "35.19 ms"}
            </p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Status: {eventLoopStatus}
            </Badge>
            <span className="text-[10.5px] font-mono text-muted-foreground">
              StdDev: {eventLoop ? formatTimeDuration(eventLoop.lagStddevSeconds) : "11.30 ms"}
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
              {cpu ? `${cpu.totalSeconds.toFixed(2)}s` : "1.59s"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              User: {cpu ? `${cpu.userSeconds.toFixed(2)}s` : "1.39s"} • Sys: {cpu ? `${cpu.systemSeconds.toFixed(2)}s` : "0.20s"}
            </p>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-muted-foreground">Process Uptime:</span>
            <Badge variant="secondary" className="font-mono text-[10.5px]">
              {cpu ? formatUptime(cpu.uptimeSeconds) : "1h 24m"}
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
              {handles ? `${handles.activeHandlesTotal} Handles` : "8 Handles"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              Resources: {handles?.activeResourcesTotal ?? 9} • GC Cycles: {gc?.totalGcCount ?? 8}
            </p>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-muted-foreground">GC Pause Sum:</span>
            <span className="font-mono font-semibold text-foreground">
              {gc ? formatTimeDuration(gc.totalGcTimeSeconds) : "141.8 ms"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
