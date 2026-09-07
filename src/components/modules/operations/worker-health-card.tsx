/**
 * @file worker-health-card.tsx
 * @description Cluster worker node status card showing CPU, memory, and concurrency metrics.
 * Follows Single Responsibility Principle (SRP).
 */

"use client"

import * as React from "react"
import { Cpu, Server, Activity, CheckCircle2, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/common/status-badge"
import { cn } from "@/lib/utils"

export interface WorkerNodeData {
  id: string
  name: string
  region: string
  cpuUsage: number
  memUsage: number
  activeJobs: number
  concurrencyLimit: number
  status: "healthy" | "degraded" | "dead" | string
}

export interface WorkerHealthCardProps {
  worker: WorkerNodeData
  className?: string
}

export function WorkerHealthCard({ worker, className }: WorkerHealthCardProps) {
  const isHealthy = worker.status === "healthy"

  return (
    <Card className={cn("border-border/70 bg-card/95 transition-all hover:border-indigo-500/40 text-xs", className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Server className="size-3.5" />
            </div>
            <div>
              <p className="font-bold text-foreground">{worker.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{worker.region}</p>
            </div>
          </div>
          <StatusBadge status={worker.status} showDot />
        </div>

        {/* CPU & Memory meters */}
        <div className="space-y-2 pt-1">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-muted-foreground">CPU Utilization</span>
              <span className="font-mono font-medium">{worker.cpuUsage}%</span>
            </div>
            <Progress value={worker.cpuUsage} className="h-1.5" />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-muted-foreground">Memory Buffer</span>
              <span className="font-mono font-medium">{worker.memUsage}%</span>
            </div>
            <Progress value={worker.memUsage} className="h-1.5" />
          </div>
        </div>

        {/* Concurrency slots */}
        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
          <span>Active Workers:</span>
          <span className="font-medium text-foreground">
            {worker.activeJobs} / {worker.concurrencyLimit} threads
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
