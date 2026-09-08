/**
 * @file job-metrics.tsx
 * @description Operational metric cards for Background Jobs & Worker Fleet.
 * Visualizes active in-flight jobs, throughput, latencies (avg/p95), and DLQ depth.
 */

"use client"

import * as React from "react"
import { MetricGrid } from "@/components/common/metric-grid"
import type { MetricCardProps } from "@/components/common/metric-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { JobOverviewSummary } from "@/types/job"

export interface JobMetricsProps {
  summary?: JobOverviewSummary
  isLoading?: boolean
}

export function JobMetrics({ summary, isLoading }: JobMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const activeInFlight = summary?.activeJobsInFlight ?? 0
  const throttledJobs = summary?.throttledJobs ?? 0
  const processedTotal = summary?.jobsProcessedTotal ?? 0
  const successRate = summary?.successRatePercent ?? 100
  const avgLatency = summary?.averageExecutionLatencyMs ?? 0
  const p95Latency = summary?.p95ExecutionLatencyMs ?? 0
  const dlqDepth = summary?.deadLetterQueueDepth ?? 0
  const dlqTriggered = summary?.deadLetterTriggered || dlqDepth > 0

  const items: MetricCardProps[] = [
    {
      title: "Active In-Flight",
      value: activeInFlight.toLocaleString(),
      colorTheme: "indigo",
      badge:
        throttledJobs > 0
          ? { text: `${throttledJobs} Throttled`, variant: "outline" }
          : { text: "Optimal", variant: "success" },
      footnote: `${summary?.jobsSucceeded ?? 0} succeeded / ${summary?.jobsFailed ?? 0} failed`,
    },
    {
      title: "Jobs Processed Total",
      value: processedTotal.toLocaleString(),
      colorTheme: "emerald",
      badge: {
        text: `${successRate.toFixed(2)}% Success`,
        variant: successRate >= 99 ? "success" : "outline",
      },
      footnote: "Across all registered queues",
    },
    {
      title: "Execution Latency",
      value: `${avgLatency.toFixed(1)} ms`,
      colorTheme: "cyan",
      badge: {
        text: `P95: ${p95Latency.toFixed(1)} ms`,
        variant: "outline",
      },
      footnote: "End-to-end consumer execution",
    },
    {
      title: "Dead Letter Queue (DLQ)",
      value: dlqDepth.toLocaleString(),
      colorTheme: dlqTriggered ? "rose" : "slate",
      badge: dlqTriggered
        ? { text: "Action Required", variant: "destructive" }
        : { text: "Clean", variant: "success" },
      footnote: dlqTriggered
        ? "Exhausted retries in dead-letter-events"
        : "Zero unrecoverable jobs",
    },
  ]

  return <MetricGrid columns={4} items={items} />
}
