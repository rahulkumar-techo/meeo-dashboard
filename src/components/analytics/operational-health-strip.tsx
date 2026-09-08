/**
 * @file operational-health-strip.tsx
 * @description Operational Backlog Health & System Throughput Triage Strip.
 * Monitors Outbox event queues, moderation backlogs, carrier fulfillment latency, and DLQ depth.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Activity,
  Layers,
  MessageSquare,
  Truck,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { OperationalHealthData } from "@/types/analytics"

export interface OperationalHealthStripProps {
  health?: OperationalHealthData
  isLoading?: boolean
  className?: string
}

export function OperationalHealthStrip({
  health,
  isLoading,
  className,
}: OperationalHealthStripProps) {
  if (isLoading) {
    return <Skeleton className="h-16 w-full rounded-xl" />
  }

  const outboxBacklog = health?.outboxBacklog ?? 0
  const reviewQueue = health?.reviewQueue ?? 0
  const fulfillmentLag = health?.fulfillmentLagHours ?? 0
  const dlqDepth = health?.dlqDepth ?? 0
  const isHealthy = (health?.status || "HEALTHY").toUpperCase() === "HEALTHY"

  return (
    <Card className={cn("border-border/70 bg-card/90 shadow-2xs", className)}>
      <CardContent className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Overall Status */}
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-lg",
              isHealthy
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600"
            )}
          >
            <Activity className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <span>Operational Pipeline Health</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 uppercase font-semibold",
                  isHealthy
                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                )}
              >
                {health?.status || "HEALTHY"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Live event broker, carrier dispatch, and content moderation queues
            </p>
          </div>
        </div>

        {/* Right: Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          {/* Outbox Events Backlog */}
          <Link
            href="/operations/outbox-events"
            className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 hover:border-primary/40 transition-colors"
          >
            <Layers className="size-3.5 text-indigo-500" />
            <span className="font-sans text-muted-foreground">Outbox:</span>
            <span className="font-bold text-foreground">{outboxBacklog}</span>
          </Link>

          {/* Review Moderation */}
          <Link
            href="/reviews"
            className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 hover:border-primary/40 transition-colors"
          >
            <MessageSquare className="size-3.5 text-amber-500" />
            <span className="font-sans text-muted-foreground">Reviews:</span>
            <span className="font-bold text-foreground">{reviewQueue}</span>
          </Link>

          {/* Fulfillment Lag */}
          <Link
            href="/orders"
            className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 hover:border-primary/40 transition-colors"
          >
            <Truck className="size-3.5 text-sky-500" />
            <span className="font-sans text-muted-foreground">Carrier Lag:</span>
            <span className="font-bold text-foreground">
              {fulfillmentLag > 0 ? `${fulfillmentLag}h` : "< 2h"}
            </span>
          </Link>

          {/* DLQ Depth */}
          <Link
            href="/operations/background-jobs"
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 transition-colors",
              dlqDepth > 0
                ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold"
                : "border-border/80 bg-muted/40 text-muted-foreground hover:border-primary/40"
            )}
          >
            <Flame className={cn("size-3.5", dlqDepth > 0 ? "text-rose-600" : "text-muted-foreground")} />
            <span className="font-sans">DLQ:</span>
            <span className="font-bold font-mono">{dlqDepth}</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
