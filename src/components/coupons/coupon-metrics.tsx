/**
 * @file coupon-metrics.tsx
 * @description KPI summary cards for promotion campaign performance, active coupons, and total discount dollars.
 */

"use client"

import * as React from "react"
import { MetricGrid } from "@/components/common"
import type { CouponMetricsResponseData } from "@/types/coupon"

interface CouponMetricsProps {
  metricsData?: CouponMetricsResponseData | null
  isLoading?: boolean
}

export function CouponMetrics({ metricsData, isLoading }: CouponMetricsProps) {
  const summary = metricsData?.summary

  const totalCoupons = summary?.totalCoupons ?? 0
  const activeCoupons = summary?.activeCoupons ?? 0
  const totalRedemptions = summary?.totalRedemptions ?? 0
  const totalDiscount = summary?.totalDiscountGiven ?? 0
  const avgDiscount = summary?.averageDiscountPerOrder ?? 0

  return (
    <MetricGrid
      columns={4}
      items={[
        {
          title: "Active Campaigns",
          value: `${activeCoupons} Active`,
          colorTheme: "emerald",
          badge:
            summary?.expiredCoupons && summary.expiredCoupons > 0
              ? { text: `${summary.expiredCoupons} Expired`, variant: "outline" }
              : undefined,
          footnote: `Out of ${totalCoupons} total coupons`,
        },
        {
          title: "Total Redemptions",
          value: totalRedemptions.toLocaleString(),
          colorTheme: "indigo",
          footnote: "Across all completed orders",
        },
        {
          title: "Total Discount Granted",
          value: `$${totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          colorTheme: "amber",
          footnote: "Marketing spend attributed",
        },
        {
          title: "Avg Discount / Order",
          value: `$${avgDiscount.toFixed(2)}`,
          colorTheme: "cyan",
          footnote: "Per redeemed checkout",
        },
      ]}
    />
  )
}
