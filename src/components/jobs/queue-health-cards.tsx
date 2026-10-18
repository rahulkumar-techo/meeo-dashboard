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
  showAllCard?: boolean
  totalJobsCount?: number
  className?: string
}

export function QueueHealthCards({
  queues,
  selectedCategory = "ALL",
  onSelectCategory,
  showAllCard = true,
  className,
}: QueueHealthCardsProps) {
  // Calculate cluster-wide totals for the master card
  const totals = React.useMemo(() => {
    if (!queues || queues.length === 0) {
      return { waiting: 0, active: 0, completed: 0, failed: 0 }
    }
    return queues.reduce(
      (acc, q) => ({
        waiting: acc.waiting + (q.waiting || 0),
        active: acc.active + (q.active || 0),
        completed: acc.completed + (q.completed || 0),
        failed: acc.failed + (q.failed || 0),
      }),
      { waiting: 0, active: 0, completed: 0, failed: 0 }
    )
  }, [queues])

  if (!queues || queues.length === 0) return null

  const isAllSelected = selectedCategory === "ALL" || !selectedCategory

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3",
        className
      )}
    >
      {/* 1. Master All Queues Fleet Card */}
      {showAllCard && (
        <Card
          onClick={() => onSelectCategory?.("ALL")}
          className={cn(
            "cursor-pointer border-border/80 bg-card/90 transition-all duration-200 hover:border-primary/50 hover:shadow-xs group",
            isAllSelected &&
              "ring-2 ring-primary border-primary bg-primary/5 shadow-xs"
          )}
        >
          <CardContent className="p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  All Queues Fleet
                </p>
                <p className="text-[10px] text-muted-foreground truncate uppercase font-semibold">
                  {queues.length} Queues Active
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] uppercase font-bold px-1.5 py-0.5 transition-colors",
                  isAllSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {isAllSelected ? "Active" : "Cluster"}
              </Badge>
            </div>

            {/* Sub Metrics for Cluster */}
            <div className="grid grid-cols-4 gap-1 text-center font-mono">
              <div className="rounded bg-muted/40 p-1">
                <p className="text-[9px] text-muted-foreground uppercase font-sans">Wait</p>
                <p className="text-xs font-bold text-foreground">{totals.waiting}</p>
              </div>
              <div className="rounded bg-sky-500/10 p-1 border border-sky-500/20">
                <p className="text-[9px] text-sky-700 dark:text-sky-300 uppercase font-sans">Active</p>
                <p className="text-xs font-bold text-sky-700 dark:text-sky-300">{totals.active}</p>
              </div>
              <div className="rounded bg-emerald-500/10 p-1 border border-emerald-500/20">
                <p className="text-[9px] text-emerald-700 dark:text-emerald-300 uppercase font-sans">Done</p>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {totals.completed > 1000
                    ? `${(totals.completed / 1000).toFixed(1)}k`
                    : totals.completed}
                </p>
              </div>
              <div
                className={cn(
                  "rounded p-1",
                  totals.failed > 0
                    ? "bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300"
                    : "bg-muted/40 text-muted-foreground"
                )}
              >
                <p className="text-[9px] uppercase font-sans">Fail</p>
                <p className="text-xs font-bold">{totals.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Dynamically Mapped Individual Queue Cards */}
      {queues.map((q) => {
        const isSelected =
          selectedCategory === q.name ||
          selectedCategory === q.category ||
          selectedCategory?.toLowerCase() === q.name?.toLowerCase()

        const statusUpper = (q.status || "HEALTHY").toUpperCase()
        const isCritical = statusUpper === "CRITICAL" || (q.failed || 0) > 5
        const isDegraded = statusUpper === "DEGRADED" || (q.failed || 0) > 0

        const handleClick = () => {
          if (isSelected) {
            onSelectCategory?.("ALL")
          } else {
            onSelectCategory?.(q.name || q.category)
          }
        }

        return (
          <Card
            key={q.name}
            onClick={handleClick}
            className={cn(
              "cursor-pointer border-border/80 bg-card/90 transition-all duration-200 hover:border-primary/50 hover:shadow-xs group relative",
              isSelected &&
                "ring-2 ring-primary border-primary bg-primary/5 shadow-xs",
              isCritical && !isSelected && "border-rose-500/40 bg-rose-500/5",
              isDegraded && !isCritical && !isSelected && "border-amber-500/40 bg-amber-500/5"
            )}
          >
            <CardContent className="p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-1">
                <div className="min-w-0 pr-1">
                  <p className="font-mono text-xs font-bold text-foreground truncate flex items-center gap-1">
                    <Layers className="size-3 text-primary shrink-0" />
                    <span className="truncate">{q.name}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate uppercase font-semibold">
                    {(q.category || q.name).replace(/_/g, " ")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase font-bold px-1.5 py-0.5 shrink-0",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : isCritical
                      ? "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300"
                      : isDegraded
                      ? "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300"
                      : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300"
                  )}
                >
                  {isSelected ? "Filtered" : q.status || "HEALTHY"}
                </Badge>
              </div>

              {/* Sub Metrics (Waiting, Active, Completed, Failed) */}
              <div className="grid grid-cols-4 gap-1 text-center font-mono">
                <div className="rounded bg-muted/40 p-1">
                  <p className="text-[9px] text-muted-foreground uppercase font-sans">Wait</p>
                  <p className="text-xs font-bold text-foreground">{q.waiting || 0}</p>
                </div>
                <div className="rounded bg-sky-500/10 p-1 border border-sky-500/20">
                  <p className="text-[9px] text-sky-700 dark:text-sky-300 uppercase font-sans">Active</p>
                  <p className="text-xs font-bold text-sky-700 dark:text-sky-300">{q.active || 0}</p>
                </div>
                <div className="rounded bg-emerald-500/10 p-1 border border-emerald-500/20">
                  <p className="text-[9px] text-emerald-700 dark:text-emerald-300 uppercase font-sans">Done</p>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {(q.completed || 0) > 1000
                      ? `${((q.completed || 0) / 1000).toFixed(1)}k`
                      : q.completed || 0}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded p-1",
                    (q.failed || 0) > 0
                      ? "bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300"
                      : "bg-muted/40 text-muted-foreground"
                  )}
                >
                  <p className="text-[9px] uppercase font-sans">Fail</p>
                  <p className="text-xs font-bold">{q.failed || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
