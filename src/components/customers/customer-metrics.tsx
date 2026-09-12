/**
 * @file customer-metrics.tsx
 * @description KPI summary cards for platform customer metrics, repeat purchase rates, LTV, and risk flagged profiles.
 */

"use client"

import * as React from "react"
import { Users, Repeat, DollarSign, ShieldAlert, UserCheck } from "lucide-react"
import { MetricGrid } from "@/components/common"
import { formatCurrency as globalFormatCurrency } from "@/lib/formatters"
import type { CustomerMetrics } from "@/types/customer"

export interface CustomerMetricsProps {
  metrics?: CustomerMetrics | null
  isLoading?: boolean
}

export function CustomerMetricsCards({
  metrics,
  isLoading,
}: CustomerMetricsProps) {
  const totalCustomers = metrics?.totalCustomers ?? 0
  const activeCustomers = metrics?.activeCustomers ?? 0
  const repeatRate = metrics?.repeatPurchaseRate ?? 0
  const avgLtv = metrics?.averageLifetimeValue ?? 0
  const riskFlagged = metrics?.riskFlaggedAccounts ?? 0
  const tierCounts = metrics?.tierDistribution ?? {}

  const vipCount = (tierCounts.GOLD ?? 0) + (tierCounts.PLATINUM ?? 0)

  const formatCurrency = (val: number) => globalFormatCurrency(val)

  return (
    <MetricGrid
      columns={4}
      items={[
        {
          title: "Total Customer Profiles",
          value: isLoading ? "..." : totalCustomers.toLocaleString(),
          colorTheme: "indigo",
          icon: Users,
          footnote: `${activeCustomers.toLocaleString()} active in good standing`,
        },
        {
          title: "Repeat Purchase Rate",
          value: isLoading ? "..." : `${repeatRate.toFixed(1)}%`,
          colorTheme: "emerald",
          icon: Repeat,
          badge: { text: "Cohort Retention", variant: "brand" },
          footnote: "Buyers with 2+ completed orders",
        },
        {
          title: "Average Lifetime Value (LTV)",
          value: isLoading ? "..." : formatCurrency(avgLtv),
          colorTheme: "cyan",
          icon: DollarSign,
          footnote: `${vipCount} VIP members (Gold & Platinum)`,
        },
        {
          title: "Risk Flagged Profiles",
          value: isLoading ? "..." : `${riskFlagged} Accounts`,
          colorTheme: riskFlagged > 0 ? "rose" : "slate",
          icon: ShieldAlert,
          badge:
            riskFlagged > 0
              ? { text: `${riskFlagged} Action Req`, variant: "destructive" }
              : undefined,
          footnote:
            riskFlagged > 0
              ? "High cancellation / fraud risk"
              : "Zero high risk flags",
        },
      ]}
    />
  )
}
