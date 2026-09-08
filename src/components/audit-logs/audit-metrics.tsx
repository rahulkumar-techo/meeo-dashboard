/**
 * @file audit-metrics.tsx
 * @description KPI summary cards for Compliance Audit Logs & Security Trails.
 */

"use client"

import * as React from "react"
import { MetricGrid } from "@/components/common/metric-grid"
import type { MetricCardProps } from "@/components/common/metric-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { AuditLogItem } from "@/types/audit-log"

export interface AuditMetricsProps {
  items?: AuditLogItem[]
  totalCount?: number
  isLoading?: boolean
}

export function AuditMetrics({
  items = [],
  totalCount = 0,
  isLoading,
}: AuditMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const uniqueActors = new Set(
    items.map((i) => i.actor?.id || i.actor?.email).filter(Boolean)
  ).size

  const uniqueEntities = new Set(items.map((i) => i.entityType).filter(Boolean))
    .size

  const sensitiveMutations = items.filter(
    (i) =>
      i.action.includes("ROLE") ||
      i.action.includes("REFUND") ||
      i.action.includes("SUSPEND") ||
      i.action.includes("BLOCK")
  ).length

  const metricCards: MetricCardProps[] = [
    {
      title: "Total Audit Records",
      value: (totalCount || items.length).toLocaleString(),
      colorTheme: "indigo",
      badge: { text: "WORM Immutable", variant: "brand" },
      footnote: "Append-only security log",
    },
    {
      title: "Active Admin Operators",
      value: `${uniqueActors} Operator${uniqueActors === 1 ? "" : "s"}`,
      colorTheme: "emerald",
      badge: { text: "Authenticated", variant: "success" },
      footnote: "Privileged actor identities",
    },
    {
      title: "Entity Scope Coverage",
      value: `${uniqueEntities} Entities`,
      colorTheme: "cyan",
      footnote: "Orders, Roles, Users, Payments, Stock",
    },
    {
      title: "Sensitive Mutations",
      value: `${sensitiveMutations} In Page`,
      colorTheme: sensitiveMutations > 0 ? "amber" : "slate",
      badge:
        sensitiveMutations > 0
          ? { text: "Tracked", variant: "warning" }
          : { text: "Clean", variant: "success" },
      footnote: "Roles, refunds, and suspensions",
    },
  ]

  return <MetricGrid columns={4} items={metricCards} />
}
