/**
 * @file payment-metrics.tsx
 * @description KPI summary cards displaying live payment health, gross platform volume, success rate, and refund breakdown.
 */

"use client"

import * as React from "react"
import { DollarSign, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react"
import { MetricGrid } from "@/components/common"
import type { PaymentListItem } from "@/types/payment"

interface PaymentMetricsProps {
  items: PaymentListItem[]
  isLoading?: boolean
}

export function PaymentMetrics({ items, isLoading }: PaymentMetricsProps) {
  const metrics = React.useMemo(() => {
    let totalGross = 0
    let totalRefunded = 0
    let successCount = 0
    let failedCount = 0
    let processingCount = 0

    items.forEach((item) => {
      const amt = Number(item.amount) || 0
      const refAmt = Number(item.refundedAmount) || 0
      totalGross += amt
      totalRefunded += refAmt

      if (item.status === "SUCCESS") successCount++
      else if (item.status === "FAILED" || item.status === "CANCELLED") failedCount++
      else if (item.status === "PROCESSING" || item.status === "REQUIRES_ACTION" || item.status === "PENDING") {
        processingCount++
      }
    })

    const totalValid = items.length
    const successRate = totalValid > 0 ? ((successCount / totalValid) * 100).toFixed(1) : "100.0"

    return {
      totalGross,
      totalRefunded,
      successCount,
      failedCount,
      processingCount,
      successRate,
      netVolume: totalGross - totalRefunded,
    }
  }, [items])

  return (
    <MetricGrid
      columns={4}
      items={[
        {
          title: "Gross Captured Volume",
          value: `$${metrics.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          colorTheme: "emerald",
          footnote: `${metrics.successCount} captured payments`,
        },
        {
          title: "Gateway Success Rate",
          value: `${metrics.successRate}%`,
          colorTheme: "indigo",
          trend: {
            value: Number(metrics.successRate) >= 95 ? "Optimal" : "Attention needed",
            isPositive: Number(metrics.successRate) >= 95,
          },
          footnote: `${metrics.failedCount} failed / declined`,
        },
        {
          title: "Total Refunded & Debited",
          value: `$${metrics.totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          colorTheme: "amber",
          footnote: "Settled against ledger",
        },
        {
          title: "In-Flight / Processing",
          value: `${metrics.processingCount} Intents`,
          colorTheme: "cyan",
          badge:
            metrics.processingCount > 0
              ? { text: "Active", variant: "brand" }
              : undefined,
          footnote: "Self-healing reconciliation enabled",
        },
      ]}
    />
  )
}
