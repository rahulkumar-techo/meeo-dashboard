/**
 * @file opentelemetry-trace-viewer.tsx
 * @description Distributed Trace Waterfall & Span Explorer (OpenTelemetry Reference).
 * Visualizes distributed execution timelines, latencies, and service span breakdowns.
 */

"use client"

import * as React from "react"
import {
  Timer,
  GitBranch,
  Layers,
  CheckCircle2,
  AlertCircle,
  Database,
  Radio,
  HardDrive,
  Cpu,
  ChevronRight,
  Code2,
  Terminal,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OtelTrace, OtelSpan } from "@/types/observability"

interface OpenTelemetryTraceViewerProps {
  traces: OtelTrace[]
  isLoading?: boolean
  className?: string
  onCorrelateLogs?: (queryOrReqId: string) => void
}

const SERVICE_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  "meeo-gateway": {
    bar: "bg-indigo-500",
    text: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/30",
  },
  "auth-engine": {
    bar: "bg-blue-500",
    text: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  "redis-cache": {
    bar: "bg-amber-500",
    text: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  "redis-queue": {
    bar: "bg-purple-500",
    text: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
  "postgres-db": {
    bar: "bg-teal-500",
    text: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/30",
  },
  "socket-server": {
    bar: "bg-rose-500",
    text: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
  },
}

export function OpenTelemetryTraceViewer({
  traces,
  isLoading,
  className,
  onCorrelateLogs,
}: OpenTelemetryTraceViewerProps) {
  const [selectedTraceId, setSelectedTraceId] = React.useState<string>(traces[0]?.id || "")
  const [selectedSpanId, setSelectedSpanId] = React.useState<string | null>(null)

  const activeTrace = traces.find((t) => t.id === selectedTraceId) || traces[0]
  const activeSpan =
    activeTrace?.spans.find((s) => s.id === selectedSpanId) || activeTrace?.spans[0]

  const totalDuration = activeTrace?.durationMs || 100

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs",
        className
      )}
    >
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/70 bg-muted/20 px-5 py-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500 border border-teal-500/20">
            <GitBranch className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>Distributed Traces & Spans (OpenTelemetry Engine)</span>
              <Badge variant="outline" className="text-[10px] font-mono border-teal-500/30 text-teal-400">
                {traces.length} Captured Traces
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cross-service execution waterfall with Prisma query latencies and middleware timings
            </p>
          </div>
        </div>
      </div>

      {traces.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-t border-border/60">
          <GitBranch className="size-8 text-muted-foreground/40 mb-2" />
          <p className="text-xs font-semibold text-foreground">No OpenTelemetry traces captured yet</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Incoming API requests will stream into this distributed execution waterfall in real time
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
          {/* Left Column: Trace List Selector */}
          <div className="lg:col-span-4 p-4 space-y-2.5 bg-muted/10">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1">
              Recent Requests
            </span>

            <div className="space-y-2">
            {traces.map((trace) => {
              const isSelected = selectedTraceId === trace.id
              // 401 Unauthorized is auth checking, not an error trace
              const isError =
                (trace.hasError && trace.httpStatus !== 401) ||
                (trace.httpStatus >= 400 && trace.httpStatus !== 401)

              return (
                <div
                  key={trace.id}
                  onClick={() => {
                    setSelectedTraceId(trace.id)
                    setSelectedSpanId(null)
                  }}
                  className={cn(
                    "rounded-xl border p-3 transition-all cursor-pointer bg-card hover:border-border",
                    isSelected
                      ? "border-teal-500 ring-1 ring-teal-500/30 shadow-xs"
                      : "border-border/70"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                      <span className="text-indigo-400">{trace.httpMethod}</span>
                      <span className="text-foreground truncate max-w-[150px]">
                        {trace.httpPath}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-mono",
                        isError
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      )}
                    >
                      {trace.httpStatus}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Timer className="size-3 text-teal-500" />
                      {trace.durationMs}ms
                    </span>
                    <span>{trace.spansCount} spans</span>
                    <span>
                      {new Date(trace.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Waterfall Timeline & Span Attribute Inspector */}
        <div className="lg:col-span-8 p-5 space-y-5 bg-card">
          {activeTrace ? (
            <>
              {/* Trace Header */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-border/60 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground font-mono">
                      {activeTrace.rootSpanName}
                    </h4>
                    <span className="text-xs text-muted-foreground font-mono">
                      Trace #{activeTrace.id}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Total Duration:{" "}
                    <span className="font-semibold text-foreground font-mono">
                      {activeTrace.durationMs} ms
                    </span>{" "}
                    across {(activeTrace.spans || []).length} discrete operations
                  </p>
                </div>

                {/* Timeline scale header & Log correlation */}
                <div className="flex items-center gap-3">
                  {onCorrelateLogs && (
                    <button
                      type="button"
                      onClick={() => onCorrelateLogs(`{job="meeo-api"} |= "${activeTrace.id}"`)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-mono transition-colors cursor-pointer"
                      title="Search Loki logs for this trace ID"
                    >
                      <Terminal className="size-3" />
                      Correlate Logs
                    </button>
                  )}
                  <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
                    <span>0ms</span>
                    <span>{(totalDuration * 0.5).toFixed(1)}ms</span>
                    <span>{totalDuration.toFixed(1)}ms</span>
                  </div>
                </div>
              </div>

              {/* Waterfall Spans Gantt Chart */}
              <div className="space-y-2.5">
                {(activeTrace.spans || []).map((span) => {
                  const leftPct = Math.max(0, Math.min(100, (span.startTimeMs / totalDuration) * 100))
                  const widthPct = Math.max(
                    2,
                    Math.min(100 - leftPct, (span.durationMs / totalDuration) * 100)
                  )
                  const serviceStyle =
                    SERVICE_COLORS[span.serviceName] || SERVICE_COLORS["meeo-gateway"]
                  const isSelected = selectedSpanId === span.id

                  return (
                    <div
                      key={span.id}
                      onClick={() => setSelectedSpanId(span.id)}
                      className={cn(
                        "rounded-lg p-2 transition-colors cursor-pointer border",
                        isSelected
                          ? "bg-muted/60 border-teal-500/50"
                          : "hover:bg-muted/30 border-transparent"
                      )}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold",
                              serviceStyle.bg,
                              serviceStyle.text
                            )}
                          >
                            {span.serviceName}
                          </span>
                          <span className="font-mono text-foreground font-medium truncate max-w-[280px]">
                            {span.name}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {span.durationMs}ms
                        </span>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="relative h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                        <div
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          className={cn(
                            "absolute top-0 bottom-0 rounded-full transition-all",
                            serviceStyle.bar
                          )}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Active Span Inspector Drawer */}
              {activeSpan && (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2.5 text-xs font-mono animate-in fade-in-50">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="font-bold text-foreground">{activeSpan.name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono border-teal-500/30 text-teal-400">
                      Kind: {activeSpan.kind}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-muted-foreground">
                    <div>
                      <span className="text-[10px] uppercase">Duration:</span>{" "}
                      <span className="text-foreground font-semibold">
                        {activeSpan.durationMs}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase">Start Offset:</span>{" "}
                      <span className="text-foreground font-semibold">
                        +{activeSpan.startTimeMs}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase">Status:</span>{" "}
                      <span className="text-emerald-500 font-semibold">
                        {activeSpan.statusCode}
                      </span>
                    </div>
                  </div>

                  {activeSpan.attributes && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Code2 className="size-3" /> Span OpenTelemetry Attributes:
                      </span>
                      <pre className="rounded-lg border border-border/70 bg-zinc-950 p-2 text-[10px] text-zinc-300 overflow-x-auto">
                        {JSON.stringify(activeSpan.attributes, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-60 items-center justify-center text-xs text-muted-foreground">
              Select a trace from the left panel to inspect the span waterfall
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  )
}
