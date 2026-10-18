/**
 * @file bull-board-queue-monitor.tsx
 * @description BullMQ / Redis background job and queue monitor (Bull Board reference).
 * Provides visual queue progress bars, job execution lifecycles, and failure diagnostics.
 */

"use client"

import * as React from "react"
import {
  Layers,
  Play,
  Pause,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Cpu,
  ChevronDown,
  ChevronRight,
  Code2,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { QueueSummary, QueueJob, JobState } from "@/types/observability"

interface BullBoardQueueMonitorProps {
  queues: QueueSummary[]
  recentJobs: QueueJob[]
  isLoading?: boolean
  className?: string
}

const JOB_STATE_COLORS: Record<JobState, { bg: string; text: string; bar: string }> = {
  active: {
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-500",
    bar: "bg-blue-500",
  },
  waiting: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-500",
    bar: "bg-amber-500",
  },
  completed: {
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-500",
    bar: "bg-emerald-500",
  },
  failed: {
    bg: "bg-rose-500/10 border-rose-500/30",
    text: "text-rose-500",
    bar: "bg-rose-500",
  },
  delayed: {
    bg: "bg-purple-500/10 border-purple-500/30",
    text: "text-purple-500",
    bar: "bg-purple-500",
  },
  paused: {
    bg: "bg-zinc-500/10 border-zinc-500/30",
    text: "text-zinc-400",
    bar: "bg-zinc-500",
  },
}

export function BullBoardQueueMonitor({
  queues,
  recentJobs,
  isLoading,
  className,
}: BullBoardQueueMonitorProps) {
  const [selectedQueue, setSelectedQueue] = React.useState<string>("all")
  const [stateFilter, setStateFilter] = React.useState<string>("all")
  const [expandedJobId, setExpandedJobId] = React.useState<string | null>(null)

  // Filter jobs by selected queue and state
  const filteredJobs = React.useMemo(() => {
    return recentJobs.filter((job) => {
      if (selectedQueue !== "all" && job.queueName !== selectedQueue) return false
      if (stateFilter !== "all" && job.state !== stateFilter) return false
      return true
    })
  }, [recentJobs, selectedQueue, stateFilter])

  // Total cluster-wide queue stats
  const totals = React.useMemo(() => {
    return (queues || []).reduce(
      (acc, q) => {
        const counts = q?.counts || {
          active: (q as any)?.active ?? 0,
          waiting: (q as any)?.waiting ?? 0,
          completed: (q as any)?.completed ?? 0,
          failed: (q as any)?.failed ?? 0,
          delayed: (q as any)?.delayed ?? 0,
        }
        const active = Number(counts.active ?? 0)
        const waiting = Number(counts.waiting ?? 0)
        const completed = Number(counts.completed ?? 0)
        const failed = Number(counts.failed ?? 0)
        const delayed = Number(counts.delayed ?? 0)

        return {
          active: acc.active + active,
          waiting: acc.waiting + waiting,
          completed: acc.completed + completed,
          failed: acc.failed + failed,
          delayed: acc.delayed + delayed,
          totalJobs: acc.totalJobs + active + waiting + completed + failed + delayed,
        }
      },
      { active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0, totalJobs: 0 }
    )
  }, [queues])

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs",
        className
      )}
    >
      {/* Top Banner & Bull Board Summary */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/70 bg-muted/20 px-5 py-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Cpu className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>BullMQ Queue Dashboard (Bull Board Monitor)</span>
              <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-500">
                {queues.length} Active Queues
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Redis async background workers, event streaming & delayed job schedules
            </p>
          </div>
        </div>

        {/* Global KPI counters */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Active: {totals.active}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="size-3" />
            <span>Waiting: {totals.waiting}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3" />
            <span>Completed: {totals.completed}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="size-3" />
            <span>Failed: {totals.failed}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
        {/* Left Column: Queues List with Visual Multi-Segment Progress Bars */}
        <div className="lg:col-span-5 p-5 space-y-3.5 bg-muted/10">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Registered Bull Queues
            </span>
            <button
              type="button"
              onClick={() => setSelectedQueue("all")}
              className={cn(
                "text-xs font-medium cursor-pointer transition-colors",
                selectedQueue === "all"
                  ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Show All ({queues.length})
            </button>
          </div>

          <div className="space-y-3">
            {queues.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-border/80 rounded-xl">
                <Cpu className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-medium text-foreground">No BullMQ queues registered on Redis</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Worker queues will appear here once background producers initialize
                </p>
              </div>
            ) : (
              queues.map((q) => {
                const counts = q?.counts || {
                  active: (q as any)?.active ?? 0,
                  waiting: (q as any)?.waiting ?? 0,
                  completed: (q as any)?.completed ?? 0,
                  failed: (q as any)?.failed ?? 0,
                  delayed: (q as any)?.delayed ?? 0,
                }
                const active = Number(counts.active ?? 0)
                const waiting = Number(counts.waiting ?? 0)
                const completed = Number(counts.completed ?? 0)
                const failed = Number(counts.failed ?? 0)
                const delayed = Number(counts.delayed ?? 0)

                const total = active + waiting + completed + failed + delayed || 1

                const activePct = (active / total) * 100
                const waitingPct = (waiting / total) * 100
                const completedPct = (completed / total) * 100
                const failedPct = (failed / total) * 100
                const delayedPct = (delayed / total) * 100

                const isSelected = selectedQueue === q.name

                return (
                  <div
                    key={q.name}
                    onClick={() => setSelectedQueue(q.name)}
                    className={cn(
                      "rounded-xl border p-3.5 transition-all cursor-pointer bg-card hover:border-border",
                      isSelected
                        ? "border-amber-500/60 ring-1 ring-amber-500/30 shadow-sm"
                        : "border-border/70"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">{q.displayName}</h4>
                        <p className="text-[10px] font-mono text-muted-foreground">{q.name}</p>
                      </div>
                      <div className="text-right text-[11px] font-mono">
                        <span className="text-foreground font-semibold">{q.throughputRps ?? 0}</span>{" "}
                        <span className="text-muted-foreground text-[10px]">jobs/s</span>
                      </div>
                    </div>

                    {/* Multi-segment Colored Status Bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60 flex">
                      <div style={{ width: `${completedPct}%` }} className="bg-emerald-500 transition-all" title={`Completed: ${completed}`} />
                      <div style={{ width: `${activePct}%` }} className="bg-blue-500 transition-all" title={`Active: ${active}`} />
                      <div style={{ width: `${waitingPct}%` }} className="bg-amber-500 transition-all" title={`Waiting: ${waiting}`} />
                      <div style={{ width: `${delayedPct}%` }} className="bg-purple-500 transition-all" title={`Delayed: ${delayed}`} />
                      <div style={{ width: `${failedPct}%` }} className="bg-rose-500 transition-all" title={`Failed: ${failed}`} />
                    </div>

                    {/* Queue counters legend */}
                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 text-muted-foreground">
                      <span className="text-emerald-500">{completed} done</span>
                      <span className="text-blue-400">{active} active</span>
                      <span className="text-amber-400">{waiting} wait</span>
                      <span className="text-rose-500">{failed} err</span>
                      <span className="text-muted-foreground">avg {q.averageLatencyMs ?? 0}ms</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Recent Jobs Table & Detailed Inspector */}
        <div className="lg:col-span-7 p-5 space-y-3.5 bg-card">
          <div className="flex flex-wrap items-center justify-between pb-1 gap-2">
            <div>
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Job Queue Execution Pipeline
              </span>
              <p className="text-[11px] text-muted-foreground">
                Filtered: {selectedQueue === "all" ? "All Queues" : selectedQueue}
              </p>
            </div>

            {/* State filter buttons */}
            <div className="flex rounded-md border border-border/70 bg-background/80 p-0.5 text-xs">
              {["all", "active", "waiting", "completed", "failed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStateFilter(st)}
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-medium capitalize rounded transition-colors cursor-pointer",
                    stateFilter === st
                      ? "bg-amber-600 text-white font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground border border-dashed border-border/80 rounded-xl">
                <Layers className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-medium text-foreground">No active or historical jobs found</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Jobs dispatched by producers will appear in this execution pipeline
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const colors = JOB_STATE_COLORS[job.state] || JOB_STATE_COLORS.waiting
                const isExpanded = expandedJobId === job.id

                return (
                  <div
                    key={job.id}
                    className="rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-border text-xs"
                  >
                    <div
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="size-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-3.5 text-muted-foreground" />
                        )}
                        <span className="font-mono font-semibold text-foreground">{job.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          #{job.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] capitalize font-mono border", colors.bg, colors.text)}
                        >
                          {job.state}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {new Date(job.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Job Inspector (Payload & Failure diagnostics) */}
                    {isExpanded && (
                      <div className="mt-2.5 pt-2.5 border-t border-border/50 space-y-2 text-[11px] font-mono animate-in fade-in-50">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-muted-foreground">
                          <div>
                            <span className="uppercase text-[9px]">Queue:</span>{" "}
                            <span className="text-foreground">{job.queueName}</span>
                          </div>
                          <div>
                            <span className="uppercase text-[9px]">Attempts:</span>{" "}
                            <span className="text-foreground">{job.attemptsMade}</span>
                          </div>
                          <div>
                            <span className="uppercase text-[9px]">Progress:</span>{" "}
                            <span className="text-foreground">{job.progress}%</span>
                          </div>
                        </div>

                        {job.failedReason && (
                          <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400">
                            <span className="font-semibold">Failure Stack: </span>
                            {job.failedReason}
                          </div>
                        )}

                        {job.data && (
                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Code2 className="size-3" /> Payload Parameters
                            </span>
                            <pre className="rounded-md border border-border/70 bg-zinc-950 p-2 text-[10px] text-zinc-300 overflow-x-auto">
                              {JSON.stringify(job.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
