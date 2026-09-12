/**
 * @file payment-metrics.tsx
 * @description KPI summary cards displaying live payment health, gross platform volume, success rate, and refund breakdown.
 */

"use client"

import * as React from "react"
import { DollarSign, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react"
import { MetricGrid } from "@/components/common"
import { formatCurrency } from "@/lib/formatters"
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

    const currency = items.find((item) => item.currency)?.currency || "INR"

    items.forEach((item) => {
      const amt = Number(item.amount) || 0
      const refAmt = Number(item.refundedAmount) || 0
      totalGross += amt
      totalRefunded += refAmt

      const status = (item.status || "").toUpperCase()
      if (status === "SUCCESS") {
        successCount++
      } else if (status === "FAILED" || status === "CANCELLED") {
        failedCount++
      } else if (
        status === "PROCESSING" ||
        status === "REQUIRES_ACTION" ||
        status === "PENDING"
      ) {
        processingCount++
      }
    })

    const totalValid = items.length
    const successRate =
      totalValid > 0 ? ((successCount / totalValid) * 100).toFixed(1) : "0.0"

    return {
      currency,
      totalGross,
      totalRefunded,
      successCount,
      failedCount,
      processingCount,
      successRate,
      totalValid,
      netVolume: totalGross - totalRefunded,
    }
  }, [items])

  return (
    <MetricGrid
      columns={4}
      items={[
        {
          title: "Gross Payment Volume",
          value: isLoading
            ? "..."
            : formatCurrency(metrics.totalGross, {
                currency: metrics.currency,
              }),
          colorTheme: "emerald",
          footnote: isLoading
            ? "Loading transactions..."
            : `${metrics.successCount} captured · ${metrics.totalValid} total`,
        },
        {
          title: "Gateway Success Rate",
          value: isLoading ? "..." : `${metrics.successRate}%`,
          colorTheme: "indigo",
          trend: {
            value:
              Number(metrics.successRate) >= 80
                ? "Optimal"
                : metrics.processingCount > 0
                ? "In Progress"
                : "Attention needed",
            isPositive: Number(metrics.successRate) >= 80,
          },
          footnote: isLoading
            ? "Evaluating rate..."
            : `${metrics.failedCount} failed · ${metrics.processingCount} pending`,
        },
        {
          title: "Total Refunded & Debited",
          value: isLoading
            ? "..."
            : formatCurrency(metrics.totalRefunded, {
                currency: metrics.currency,
              }),
          colorTheme: "amber",
          footnote: "Settled against ledger",
        },
        {
          title: "In-Flight / Pending",
          value: isLoading ? "..." : `${metrics.processingCount} Intents`,
          colorTheme: "cyan",
          badge:
            metrics.processingCount > 0
              ? { text: "Active", variant: "brand" }
              : undefined,
          footnote: "UPI, Cards & Netbanking",
        },
      ]}
    />
  )
}
