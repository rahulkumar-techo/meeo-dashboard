/**
 * @file handles-gc-matrix.tsx
 * @description Garbage Collection (GC) latency graphs and Libuv active resources matrix.
 * Zero dummy/mock data: strictly plots real parsed GC cycles and handles.
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
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio, Info, Activity } from "lucide-react"
import type { ParsedGcMetrics, ParsedHandlesMetrics } from "@/services/metrics.service"

interface HandlesGcMatrixProps {
  gc?: ParsedGcMetrics
  handles?: ParsedHandlesMetrics
  className?: string
}

export function HandlesGcMatrix({ gc, handles, className }: HandlesGcMatrixProps) {
  const gcData = (gc?.kinds || []).map((k) => ({
    name: k.kind.charAt(0).toUpperCase() + k.kind.slice(1) + " GC",
    cycles: k.count,
    totalPauseMs: parseFloat((k.sumSeconds * 1000).toFixed(2)),
    avgPauseMs: parseFloat(k.avgLatencyMs.toFixed(2)),
  }))

  const activeHandlesList = handles?.activeHandles || []

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${className || ""}`}>
      {/* Left: GC Pauses & Latency Bar Graph */}
      <Card className="lg:col-span-6 border-border/70 bg-card shadow-2xs">
        <CardHeader className="p-4 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Activity className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">V8 Garbage Collection Latency</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Stop-The-World (STW) pauses across Minor (Scavenge) vs Major (Mark-Sweep)
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[11px] bg-amber-500/10 text-amber-600 border-amber-500/20">
              {gc ? gc.totalGcCount : 0} Cycles ({(gc ? gc.totalGcTimeSeconds * 1000 : 0).toFixed(1)} ms)
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-3 space-y-3">
          {gcData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
              No GC cycles recorded yet.
            </div>
          ) : (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gcData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    unit=" ms"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs space-y-1 min-w-[180px]">
                            <div className="font-semibold text-foreground border-b border-border pb-1">
                              {data.name}
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Total Pauses:</span>
                              <span className="font-mono font-medium text-amber-500">{data.totalPauseMs} ms</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Total Cycles:</span>
                              <span className="font-mono font-medium text-foreground">{data.cycles} runs</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Avg Pause / Run:</span>
                              <span className="font-mono font-medium text-foreground">{data.avgPauseMs} ms</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="totalPauseMs" name="Total Pause (ms)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="p-2.5 rounded-md bg-muted/30 border border-border/40 text-xs text-muted-foreground flex items-start gap-2">
            <Info className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground">GC Diagnostic:</strong> Minor GC collects young nursery objects. Major GC pauses execution to sweep tenured memory; average latencies &gt; 50ms suggest heap memory thrashing.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right: Active Libuv Handles & Sockets */}
      <Card className="lg:col-span-6 border-border/70 bg-card shadow-2xs">
        <CardHeader className="p-4 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Radio className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Active Libuv Handles & I/O Sockets</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Active OS resource handles keeping the Node.js event loop alive
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[11px] bg-teal-500/10 text-teal-600 border-teal-500/20">
              {handles?.activeHandlesTotal || 0} Handles
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-3 space-y-3">
          {activeHandlesList.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
              No active Libuv handles recorded.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {activeHandlesList.map((h) => (
                <div
                  key={h.type}
                  className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center space-y-1"
                >
                  <span className="text-[11px] font-medium text-muted-foreground block truncate">
                    {h.type}
                  </span>
                  <span className="text-lg font-bold font-mono text-foreground block">
                    {h.count}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="p-2.5 rounded-md bg-muted/30 border border-border/40 text-xs text-muted-foreground flex items-start gap-2">
            <Info className="size-4 text-teal-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground">Libuv Handles:</strong> <code className="font-mono text-xs">TCPSocketWrap</code> and <code className="font-mono text-xs">TLSSocket</code> hold persistent HTTP client keep-alive connections; <code className="font-mono text-xs">TCPServerWrap</code> holds the Fastify port listener.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
