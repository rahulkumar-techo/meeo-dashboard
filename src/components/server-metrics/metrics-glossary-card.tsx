/**
 * @file metrics-glossary-card.tsx
 * @description Educational runbook card explaining what each Prometheus metric is and what it calculates.
 */

"use client"

import * as React from "react"
import { HelpCircle, ChevronDown, ChevronUp, Cpu, HardDrive, Activity, Radio, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function MetricsGlossaryCard() {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <Card className="border-indigo-200/80 bg-indigo-50/20 dark:border-indigo-900/50 dark:bg-indigo-950/20 shadow-2xs">
      <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Prometheus Telemetry Runbook & Metric Definitions
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Learn what each system metric measures, how it is calculated, and normal operating thresholds
            </CardDescription>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-7.5 px-2.5 text-xs gap-1 font-medium bg-background/80"
        >
          <span>{isExpanded ? "Hide Explanations" : "View Explanations & Formulas"}</span>
          {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 pt-1 border-t border-border/60 space-y-3.5 text-xs animate-in fade-in-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* CPU */}
            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Cpu className="size-3.5 text-amber-500" />
                <span>Process CPU Time</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                <strong>What it measures:</strong> Total CPU seconds consumed by the Node.js process split into <em>User Mode</em> (JavaScript execution) and <em>System Mode</em> (OS kernel syscalls and I/O).
              </p>
              <div className="font-mono text-[10.5px] bg-muted/30 p-1.5 rounded border border-border/40 text-foreground">
                Total CPU = process_cpu_user + process_cpu_system
              </div>
            </div>

            {/* Memory RSS */}
            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <HardDrive className="size-3.5 text-indigo-500" />
                <span>Resident Set Size (RSS)</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                <strong>What it measures:</strong> Total physical RAM occupied by the process. Includes V8 Heap, JIT code, execution stack, native C++ bindings, and ArrayBuffers.
              </p>
              <div className="font-mono text-[10.5px] bg-muted/30 p-1.5 rounded border border-border/40 text-foreground">
                RSS = V8 Heap + Code + Stack + External Buffers
              </div>
            </div>

            {/* V8 Heap Spaces */}
            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <HardDrive className="size-3.5 text-sky-500" />
                <span>V8 Heap Partitions</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                <strong>What it measures:</strong> V8 partitions memory into <em>New Space</em> (young short-lived objects), <em>Old Space</em> (survived objects), <em>Code Space</em> (JIT compiled bytecodes), and <em>Large Object Space</em>.
              </p>
              <div className="font-mono text-[10.5px] bg-muted/30 p-1.5 rounded border border-border/40 text-foreground">
                Heap Used % = (Used Bytes / Total Allocated) * 100
              </div>
            </div>

            {/* Event Loop Lag */}
            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Activity className="size-3.5 text-emerald-500" />
                <span>Event Loop Lag (Latency)</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                <strong>What it measures:</strong> The delay between when a timer is scheduled and when Libuv executes it. P99 lag &lt; 50ms indicates smooth non-blocking execution.
              </p>
              <div className="font-mono text-[10.5px] bg-muted/30 p-1.5 rounded border border-border/40 text-foreground">
                Lag = Actual Execution Time - Scheduled Timer Time
              </div>
            </div>

            {/* Event Loop Utilization */}
            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Activity className="size-3.5 text-cyan-500" />
                <span>Event Loop Utilization (ELU)</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                <strong>What it measures:</strong> Percentage of time the event loop is actively doing work vs waiting for I/O in the event provider. Values &lt; 20% indicate healthy idle headroom.
              </p>
              <div className="font-mono text-[10.5px] bg-muted/30 p-1.5 rounded border border-border/40 text-foreground">
                ELU = (Active Loop Time / Total Elapsed Time) * 100
              </div>
            </div>

            {/* Garbage Collection */}
            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Radio className="size-3.5 text-rose-500" />
                <span>Garbage Collection (GC)</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                <strong>What it measures:</strong> V8 GC execution pauses: <em>Minor GC (Scavenge)</em> for young space, <em>Major GC (Mark-Sweep-Compact)</em> for old space, and <em>Incremental Sweeps</em>.
              </p>
              <div className="font-mono text-[10.5px] bg-muted/30 p-1.5 rounded border border-border/40 text-foreground">
                Avg Latency = (GC Total Sum Seconds / Cycle Count) * 1000
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
