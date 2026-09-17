/**
 * @file v8-heap-spaces-chart.tsx
 * @description Real V8 physical memory partitions bar chart from Prometheus telemetry.
 * Zero dummy/mock data: strictly plots real parsed heap spaces.
 */

"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HardDrive, Info } from "lucide-react"
import type { ParsedMemoryMetrics } from "@/services/metrics.service"

interface V8HeapSpacesChartProps {
  memory?: ParsedMemoryMetrics
  className?: string
}

export function V8HeapSpacesChart({ memory, className }: V8HeapSpacesChartProps) {
  const spaces = memory?.spaces || []

  const chartData = spaces.map((s) => ({
    name: s.space.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    usedMb: parseFloat((s.usedBytes / (1024 * 1024)).toFixed(2)),
    availableMb: parseFloat((s.availableBytes / (1024 * 1024)).toFixed(2)),
    totalMb: parseFloat((s.totalBytes / (1024 * 1024)).toFixed(2)),
    usedPercent: s.usedPercent,
  }))

  return (
    <Card className={`border-border/70 bg-card shadow-2xs ${className || ""}`}>
      <CardHeader className="p-4 pb-2 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <HardDrive className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">V8 Memory Partitions (Heap Spaces)</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Live Old Space, Code, Trusted, and Large Object allocations
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="font-mono text-[11px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
              {memory ? (memory.heapUsedBytes / (1024 * 1024)).toFixed(1) : 0} MB Used / {memory ? (memory.heapTotalBytes / (1024 * 1024)).toFixed(1) : 0} MB
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3 space-y-3">
        {chartData.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
            No heap space telemetry recorded yet.
          </div>
        ) : (
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  unit=" MB"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs space-y-1 min-w-[180px]">
                          <div className="font-semibold text-foreground border-b border-border pb-1">
                            {data.name} Space
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Used Memory:</span>
                            <span className="font-mono font-medium text-indigo-500">{data.usedMb} MB</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Available:</span>
                            <span className="font-mono font-medium text-emerald-500">{data.availableMb} MB</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Utilization:</span>
                            <span className="font-mono font-medium text-foreground">{data.usedPercent}%</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
                  formatter={(value) => <span className="text-foreground">{value}</span>}
                />
                <Bar dataKey="usedMb" name="Used (MB)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="availableMb" name="Available (MB)" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="p-2.5 rounded-md bg-muted/30 border border-border/40 text-xs text-muted-foreground flex items-start gap-2">
          <Info className="size-4 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">V8 Partitioning:</strong> <span className="font-semibold">Old Space</span> holds long-lived objects; <span className="font-semibold">Code Space</span> stores JIT-compiled bytecode; <span className="font-semibold">Trusted Space</span> isolates security-sensitive runtime metadata.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
