/**
 * @file worker-nodes-telemetry.tsx
 * @description Live Worker Nodes Health & Pod Utilization telemetry cards.
 * Displays CPU utilization %, RSS/Heap memory buffer, concurrency limits, uptime, and heartbeat.
 */

"use client"

import * as React from "react"
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { WorkerNodeTelemetry } from "@/types/job"

export interface WorkerNodesTelemetryProps {
  workers?: WorkerNodeTelemetry[]
  isLoading?: boolean
  className?: string
}

export function WorkerNodesTelemetry({
  workers,
  isLoading,
  className,
}: WorkerNodesTelemetryProps) {
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5", className)}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!workers || workers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
        No active worker nodes detected in the cluster.
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5", className)}>
      {workers.map((worker) => {
        const isHealthy = (worker.status || "").toUpperCase() === "HEALTHY"
        const isDegraded = (worker.status || "").toUpperCase() === "DEGRADED"

        const memUsed = worker.memoryUtilization?.percentUsed ?? 0
        const cpuUsed = worker.cpuUtilizationPercent ?? 0
        const activeJobs = worker.concurrency?.activeJobs ?? 0
        const concurrencyLimit = worker.concurrency?.limit ?? 10
        const concurrencyPercent = Math.min(
          100,
          Math.round((activeJobs / Math.max(1, concurrencyLimit)) * 100)
        )

        return (
          <Card
            key={worker.nodeId || worker.podName}
            className={cn(
              "group relative overflow-hidden border-border/80 bg-card/95 transition-all duration-200 hover:border-primary/40 hover:shadow-md",
              isDegraded && "border-amber-500/40 bg-amber-500/5",
              !isHealthy && !isDegraded && "border-rose-500/40 bg-rose-500/5"
            )}
          >
            <CardContent className="p-4 space-y-3.5">
              {/* Top Bar: Pod Name, Hostname, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg border",
                      isHealthy
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : isDegraded
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                    )}
                  >
                    <Server className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-mono text-xs font-bold text-foreground">
                        {worker.podName || worker.nodeId}
                      </p>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      Host: {worker.hostname}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 gap-1",
                    isHealthy
                      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : isDegraded
                      ? "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300"
                      : "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full animate-pulse",
                      isHealthy
                        ? "bg-emerald-500"
                        : isDegraded
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    )}
                  />
                  {worker.status || "UNKNOWN"}
                </Badge>
              </div>

              {/* Resource Gauges */}
              <div className="grid grid-cols-2 gap-3 pt-0.5">
                {/* CPU Utilization */}
                <div className="space-y-1 rounded-md bg-muted/40 p-2 border border-border/50">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground font-medium">
                      <Cpu className="size-3 text-sky-500" />
                      CPU Load
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {cpuUsed}%
                    </span>
                  </div>
                  <Progress
                    value={cpuUsed}
                    className={cn(
                      "h-1.5",
                      cpuUsed > 80 ? "[&>div]:bg-rose-500" : cpuUsed > 60 ? "[&>div]:bg-amber-500" : "[&>div]:bg-sky-500"
                    )}
                  />
                </div>

                {/* RAM / Heap Buffer */}
                <div className="space-y-1 rounded-md bg-muted/40 p-2 border border-border/50">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground font-medium">
                      <HardDrive className="size-3 text-purple-500" />
                      Memory
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {memUsed}%
                    </span>
                  </div>
                  <Progress
                    value={memUsed}
                    className={cn(
                      "h-1.5",
                      memUsed > 85 ? "[&>div]:bg-rose-500" : memUsed > 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-purple-500"
                    )}
                  />
                </div>
              </div>

              {/* Memory Details line */}
              {worker.memoryUtilization && (
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono px-1">
                  <span>
                    Heap: {worker.memoryUtilization.heapUsedMb?.toFixed(1) ?? 0} MB /{" "}
                    {worker.memoryUtilization.heapTotalMb?.toFixed(1) ?? 0} MB
                  </span>
                  <span>
                    RSS: {worker.memoryUtilization.rssMb?.toFixed(1) ?? 0} MB
                  </span>
                </div>
              )}

              {/* Concurrency & Uptime Footer */}
              <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Layers className="size-3 text-primary/70" />
                  <span>Concurrency:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {activeJobs} / {concurrencyLimit}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <Clock className="size-3" />
                  <span>{worker.uptimeHuman || `${worker.uptimeSeconds}s`}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
