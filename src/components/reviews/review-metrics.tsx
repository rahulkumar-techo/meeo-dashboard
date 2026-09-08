/**
 * @file review-metrics.tsx
 * @description KPI summary cards for Product Reviews, CSAT Average Ratings, Moderation Queue, and Abuse Reports.
 */

"use client"

import * as React from "react"
import { Star, MessageSquare, Clock, ShieldAlert, CheckCircle2 } from "lucide-react"
import { MetricGrid } from "@/components/common"
import type { AdminReview } from "@/types/review"

export interface ReviewMetricsProps {
  items: AdminReview[]
  pendingCount: number
  reportsCount: number
  isLoading?: boolean
}

export function ReviewMetricsCards({
  items,
  pendingCount,
  reportsCount,
  isLoading,
}: ReviewMetricsProps) {
  const { totalReviews, avgRating, verifiedBuyerPercent } = React.useMemo(() => {
    if (items.length === 0) {
      return { totalReviews: 0, avgRating: 5.0, verifiedBuyerPercent: 100 }
    }

    let sum = 0
    let verified = 0

    items.forEach((item) => {
      sum += item.rating || 5
      if (item.isVerifiedPurchase) verified += 1
    })

    return {
      totalReviews: items.length,
      avgRating: sum / items.length,
      verifiedBuyerPercent: (verified / items.length) * 100,
    }
  }, [items])

  return (
    <MetricGrid
      columns={4}
      items={[
        {
          title: "Average Storefront Rating",
          value: isLoading ? "..." : `${avgRating.toFixed(2)} / 5.0`,
          colorTheme: "amber",
          icon: Star,
          footnote: `${totalReviews.toLocaleString()} catalog ratings`,
        },
        {
          title: "Verified Buyer Ratio",
          value: isLoading ? "..." : `${verifiedBuyerPercent.toFixed(0)}% Verified`,
          colorTheme: "emerald",
          icon: CheckCircle2,
          badge: { text: "Order Matched", variant: "brand" },
          footnote: "Confirmed past order items",
        },
        {
          title: "Pending Moderation Queue",
          value: isLoading ? "..." : `${pendingCount} Reviews`,
          colorTheme: pendingCount > 0 ? "indigo" : "slate",
          icon: Clock,
          badge:
            pendingCount > 0
              ? { text: `${pendingCount} To Review`, variant: "warning" }
              : undefined,
          footnote: "Awaiting administrative approval",
        },
        {
          title: "Abuse & Spam Reports",
          value: isLoading ? "..." : `${reportsCount} Reports`,
          colorTheme: reportsCount > 0 ? "rose" : "slate",
          icon: ShieldAlert,
          badge:
            reportsCount > 0
              ? { text: `${reportsCount} Flagged`, variant: "destructive" }
              : undefined,
          footnote:
            reportsCount > 0
              ? "User-flagged policy violations"
              : "Zero unresolved spam reports",
        },
      ]}
    />
  )
}
