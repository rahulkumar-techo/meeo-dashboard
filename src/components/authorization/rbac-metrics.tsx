/**
 * @file rbac-metrics.tsx
 * @description KPI summary cards for Role-Based Access Control & Security Policies.
 */

"use client"

import * as React from "react"
import { MetricGrid } from "@/components/common/metric-grid"
import type { MetricCardProps } from "@/components/common/metric-card"
import { Skeleton } from "@/components/ui/skeleton"

export interface RBACMetricsProps {
  rolesCount?: number
  permissionsCount?: number
  operatorsCount?: number
  isLoading?: boolean
}

export function RBACMetrics({
  rolesCount = 0,
  permissionsCount = 0,
  operatorsCount = 0,
  isLoading,
}: RBACMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const items: MetricCardProps[] = [
    {
      title: "System RBAC Roles",
      value: `${rolesCount} Defined`,
      colorTheme: "indigo",
      badge: { text: "Least Privilege", variant: "brand" },
      footnote: "Granular capability profiles",
    },
    {
      title: "Permission Catalog",
      value: `${permissionsCount} Granular`,
      colorTheme: "cyan",
      badge: { text: "12 Domains", variant: "outline" },
      footnote: "API route & action guards",
    },
    {
      title: "Privileged Operators",
      value: `${operatorsCount} Accounts`,
      colorTheme: "emerald",
      badge: { text: "MFA Enforced", variant: "success" },
      footnote: "Active administrative users",
    },
    {
      title: "Cache Invalidation",
      value: "Real-Time",
      colorTheme: "violet",
      badge: { text: "Sub-Second", variant: "success" },
      footnote: "Automatic session flush on edit",
    },
  ]

  return <MetricGrid columns={4} items={items} />
}
