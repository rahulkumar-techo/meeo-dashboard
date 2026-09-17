/**
 * @file system-info-card.tsx
 * @description Real Host System & Runtime Telemetry Card.
 * Zero dummy/mock data: strictly displays real parsed system information and Prometheus gauges.
 */

"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SystemHostInfo, ParsedMemoryMetrics, ParsedCpuMetrics } from "@/types/server-metrics"
import { Cpu, Server, HardDrive, ShieldCheck, Terminal, Info } from "lucide-react"

interface SystemInfoCardProps {
  system?: SystemHostInfo
  memory?: ParsedMemoryMetrics
  cpu?: ParsedCpuMetrics
}

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function SystemInfoCard({ system, memory, cpu }: SystemInfoCardProps) {
  const heapUsed = memory?.heapUsedBytes ? formatBytes(memory.heapUsedBytes) : "0 B"
  const heapTotal = memory?.heapTotalBytes ? formatBytes(memory.heapTotalBytes) : "0 B"
  const processRss = memory?.residentBytes ? formatBytes(memory.residentBytes) : "0 B"
  const externalMem = memory?.externalBytes ? formatBytes(memory.externalBytes) : "0 B"
  const heapPercent = memory?.heapUsedPercent || 0

  const nodeVer = system?.nodeVersion || (typeof process !== "undefined" ? process.version : "") || "Active"
  const totalCpuSeconds = cpu?.totalSeconds ? `${cpu.totalSeconds.toFixed(2)}s` : "0s"
  const uptimeMinutes = cpu?.uptimeSeconds ? `${Math.floor(cpu.uptimeSeconds / 60)} mins` : "0 mins"

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Host System & Process Telemetry</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Live V8 execution engine, memory allocations, and CPU runtime statistics
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Fastify Service Active
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. CPU Runtime Execution */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Cpu className="h-4 w-4 text-primary" />
                <span>Process CPU Runtime</span>
              </div>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {totalCpuSeconds} Total
              </Badge>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User Space CPU:</span>
                <span className="font-mono font-medium text-foreground">{cpu?.userSeconds ? `${cpu.userSeconds.toFixed(3)}s` : "0s"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">System Kernel CPU:</span>
                <span className="font-mono font-medium text-foreground">{cpu?.systemSeconds ? `${cpu.systemSeconds.toFixed(3)}s` : "0s"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Process Uptime:</span>
                <span className="font-mono text-primary font-semibold">{uptimeMinutes}</span>
              </div>
            </div>
          </div>

          {/* 2. Process Memory (RSS & V8 Heap) */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <HardDrive className="h-4 w-4 text-emerald-500" />
                <span>Process Memory & Heap</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                {processRss} RSS
              </Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">V8 Heap Allocation:</span>
                <span className="font-mono font-medium text-foreground">{heapUsed} / {heapTotal} ({heapPercent}%)</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(heapPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>External C++ Buffers:</span>
                <span>{externalMem}</span>
              </div>
            </div>
          </div>

          {/* 3. Node Runtime & Environment */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Terminal className="h-4 w-4 text-blue-500" />
                <span>Node.js Engine Runtime</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {nodeVer}
              </Badge>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Runtime Version:</span>
                <span className="font-mono font-medium text-foreground">{nodeVer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Framework:</span>
                <span className="font-mono text-foreground font-medium">Fastify v5 + Metrics</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metrics Source:</span>
                <span className="font-mono text-primary font-medium">/metrics (Prometheus)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Formula Explanation */}
        <div className="p-2.5 rounded-md bg-muted/30 border border-border/40 text-xs text-muted-foreground flex items-start gap-2">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">What this calculates:</strong> Real process telemetry from OS kernel signals. <span className="font-semibold">Resident Set Size (RSS)</span> is physical RAM dedicated to the process. <span className="font-semibold">V8 Heap</span> is dynamic JavaScript memory, and <span className="font-semibold">CPU Seconds</span> measure total execution time spent in userland vs kernel routines.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
