/**
 * @file queue-health-cards.tsx
 * @description BullMQ Queue Health & Backlog Status Cards.
 * Visualizes queue depths (waiting, active, delayed, failed) across critical domain queues.
 */

"use client"

import * as React from "react"
import {
  Layers,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Pause,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { JobOverviewQueue, JobCategory } from "@/types/job"

export interface QueueHealthCardsProps {
  queues?: JobOverviewQueue[]
  selectedCategory?: JobCategory | string
  onSelectCategory?: (category: JobCategory | string) => void
  className?: string
}

export function QueueHealthCards({
  queues,
  selectedCategory,
  onSelectCategory,
  className,
}: QueueHealthCardsProps) {
  if (!queues || queues.length === 0) return null

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3", className)}>
      {queues.map((q) => {
        const isSelected = selectedCategory === q.category
        const isCritical = (q.status || "").toUpperCase() === "CRITICAL"
        const isDegraded = (q.status || "").toUpperCase() === "DEGRADED"

        return (
          <Card
            key={q.name}
            onClick={() => onSelectCategory?.(q.category)}
            className={cn(
              "cursor-pointer border-border/75 bg-card/90 transition-all duration-200 hover:border-primary/50 hover:shadow-xs",
              isSelected && "ring-2 ring-primary border-primary bg-primary/5",
              isCritical && !isSelected && "border-rose-500/40 bg-rose-500/5",
              isDegraded && !isSelected && "border-amber-500/40 bg-amber-500/5"
            )}
          >
            <CardContent className="p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-1">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold text-foreground truncate">
                    {q.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate uppercase font-semibold">
                    {q.category.replace(/_/g, " ")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase font-bold px-1.5 py-0.5",
                    isCritical
                      ? "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300"
                      : isDegraded
                      ? "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300"
                      : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300"
                  )}
                >
                  {q.status}
                </Badge>
              </div>

              {/* Sub Metrics (Waiting, Active, Completed, Failed) */}
              <div className="grid grid-cols-4 gap-1 text-center font-mono">
                <div className="rounded bg-muted/40 p-1">
                  <p className="text-[9px] text-muted-foreground uppercase font-sans">Wait</p>
                  <p className="text-xs font-bold text-foreground">{q.waiting}</p>
                </div>
                <div className="rounded bg-sky-500/10 p-1 border border-sky-500/20">
                  <p className="text-[9px] text-sky-700 dark:text-sky-300 uppercase font-sans">Active</p>
                  <p className="text-xs font-bold text-sky-700 dark:text-sky-300">{q.active}</p>
                </div>
                <div className="rounded bg-emerald-500/10 p-1 border border-emerald-500/20">
                  <p className="text-[9px] text-emerald-700 dark:text-emerald-300 uppercase font-sans">Done</p>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {q.completed > 1000 ? `${(q.completed / 1000).toFixed(1)}k` : q.completed}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded p-1",
                    q.failed > 0
                      ? "bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300"
                      : "bg-muted/40 text-muted-foreground"
                  )}
                >
                  <p className="text-[9px] uppercase font-sans">Fail</p>
                  <p className="text-xs font-bold">{q.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
