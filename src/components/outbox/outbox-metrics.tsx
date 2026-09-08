/**
 * @file outbox-metrics.tsx
 * @description KPI summary cards for live Outbox table health and BullMQ Redis queue depths.
 */

"use client"

import * as React from "react"
import { MetricGrid } from "@/components/common"
import type { OutboxMetricsResponseData } from "@/types/outbox"

interface OutboxMetricsProps {
  metricsData?: OutboxMetricsResponseData | null
  isLoading?: boolean
}

export function OutboxMetrics({ metricsData, isLoading }: OutboxMetricsProps) {
  const outbox = metricsData?.outbox
  const domainQueue = metricsData?.queues?.domainEvents
  const dlqQueue = metricsData?.queues?.deadLetter

  const pendingCount = outbox?.pending ?? 0
  const processingCount = outbox?.processing ?? 0
  const publishedCount = outbox?.published ?? 0
  const failedCount = outbox?.failed ?? 0

  const dlqWaiting = dlqQueue?.waiting ?? 0
  const domainWaiting = domainQueue?.waiting ?? 0
  const domainActive = domainQueue?.active ?? 0

  return (
    <MetricGrid
      columns={4}
      items={[
        {
          title: "Published Event Stream",
          value: publishedCount.toLocaleString(),
          colorTheme: "emerald",
          footnote: "Committed to BullMQ queue",
        },
        {
          title: "Pending Outbox Batch",
          value: `${pendingCount + processingCount} Events`,
          colorTheme: "indigo",
          badge:
            processingCount > 0
              ? { text: `${processingCount} Active Lock`, variant: "brand" }
              : undefined,
          footnote: `${pendingCount} waiting for polling cycle`,
        },
        {
          title: "BullMQ Queue Depth",
          value: `${domainWaiting + domainActive} Jobs`,
          colorTheme: "cyan",
          footnote: `${domainActive} in-flight, ${domainWaiting} waiting`,
        },
        {
          title: "Dead-Letter Queue (DLQ)",
          value: `${failedCount + dlqWaiting} Events`,
          colorTheme: failedCount + dlqWaiting > 0 ? "rose" : "emerald",
          badge:
            failedCount + dlqWaiting > 0
              ? { text: "SRE Attention", variant: "destructive" }
              : { text: "Clean", variant: "brand" },
          footnote: "Unrecoverable worker failures",
        },
      ]}
    />
  )
}
