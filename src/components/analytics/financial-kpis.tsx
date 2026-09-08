/**
 * @file financial-kpis.tsx
 * @description Executive Financial KPIs & Net GMV 30-Day Velocity.
 * Calculates Net GMV, Daily Run-Rate Velocity, AOV, Discount burn rate, and Refund ratios.
 */

"use client"

import * as React from "react"
import { MetricGrid } from "@/components/common/metric-grid"
import type { MetricCardProps } from "@/components/common/metric-card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/formatters"
import type { ExecutiveFinancials } from "@/types/analytics"

export interface FinancialKPIsProps {
  financials?: ExecutiveFinancials
  isLoading?: boolean
}

export function FinancialKPIs({ financials, isLoading }: FinancialKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const grossRevenue = financials?.grossRevenue ?? 0
  const netRevenue = financials?.netRevenue ?? 0
  const velocity30D =
    financials?.netGmv30DVelocity || (netRevenue > 0 ? netRevenue / 30 : 0)
  const aov = financials?.averageOrderValue ?? 0
  const discounts = financials?.totalDiscounts ?? 0
  const refunds = financials?.totalRefunds ?? 0
  const currency = financials?.currency || "USD"

  const discountRate =
    grossRevenue > 0 ? ((discounts / grossRevenue) * 100).toFixed(1) : "0.0"
  const refundRate =
    grossRevenue > 0 ? ((refunds / grossRevenue) * 100).toFixed(1) : "0.0"

  const items: MetricCardProps[] = [
    {
      title: "Net GMV 30D Velocity",
      value: formatCurrency(velocity30D, { currency, compact: false }),
      colorTheme: "emerald",
      badge: {
        text: "Daily Run-Rate",
        variant: "success",
      },
      footnote: `30-Day Total: ${formatCurrency(netRevenue, { currency, compact: true })}`,
    },
    {
      title: "Gross Merchandise Value",
      value: formatCurrency(grossRevenue, { currency, compact: false }),
      colorTheme: "indigo",
      badge: {
        text: "Total GMV",
        variant: "outline",
      },
      footnote: `Discounts: -${formatCurrency(discounts, { currency, compact: true })} (${discountRate}%)`,
    },
    {
      title: "Average Order Value (AOV)",
      value: formatCurrency(aov, { currency }),
      colorTheme: "amber",
      badge: {
        text: "Basket Health",
        variant: aov > 100 ? "success" : "outline",
      },
      footnote: "Completed orders basket size",
    },
    {
      title: "Net Realized Revenue",
      value: formatCurrency(netRevenue, { currency, compact: false }),
      colorTheme: "cyan",
      badge: {
        text: `Refunds: ${refundRate}%`,
        variant: Number(refundRate) > 5 ? "warning" : "success",
      },
      footnote: `Refunded: -${formatCurrency(refunds, { currency, compact: true })}`,
    },
  ]

  return <MetricGrid columns={4} items={items} />
}
