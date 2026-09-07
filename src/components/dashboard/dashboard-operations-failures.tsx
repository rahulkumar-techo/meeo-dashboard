/**
 * @file dashboard-operations-failures.tsx
 * @description Operations & Failures panel displaying live payment failures, review moderation, and promotion campaigns.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DashboardOverviewPayload } from "@/types/dashboard-overview"
import { cn } from "@/lib/utils"

export interface DashboardOperationsFailuresProps {
  /** Overview data from API */
  overview?: DashboardOverviewPayload | null
  /** Container classes */
  className?: string
}

export function DashboardOperationsFailures({
  overview,
  className,
}: DashboardOperationsFailuresProps) {
  const failedPayments = overview?.payments?.failedPayments ?? 0
  const pendingReviews = overview?.reviews?.pendingModeration ?? 0
  const activeCoupons = overview?.promotions?.activeCouponsCount ?? 0
  const avgRating = overview?.reviews?.averagePlatformRating ?? 0
  const flaggedUsers = (overview?.users?.blockedUsers ?? 0) + (overview?.users?.suspendedUsers ?? 0)

  return (
    <Card className={cn("shadow-2xs border-border/70", className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="size-4 text-rose-500" />
            <CardTitle className="text-sm font-bold tracking-tight">Operations & Failures</CardTitle>
          </div>
          <Badge
            variant={failedPayments > 0 ? "destructive" : "secondary"}
            className="text-[10px] font-bold"
          >
            {failedPayments > 0 ? "Action Required" : "Normal"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3 text-xs">
        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1">
          <div className="flex justify-between font-mono font-bold text-rose-600">
            <span>Payment Failures ({failedPayments})</span>
            <span className="text-[10.5px] text-muted-foreground">
              {overview?.payments?.failureRate ? `${overview.payments.failureRate}% rate` : "Gateway Feed"}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {failedPayments > 0
              ? `${failedPayments} customer payments encountered decline or timeout errors.`
              : "All payment transactions processing smoothly."}
          </div>
          {failedPayments > 0 && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="bg-indigo-600 text-white text-[10.5px] h-6 px-2">
                Retry Charges
              </Button>
              <Button size="sm" variant="outline" className="text-[10.5px] h-6 px-2">
                Notify Customers
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1">
          <div className="flex justify-between font-semibold">
            <span className="text-amber-700 dark:text-amber-400">Reviews & Promotions</span>
            <span className="text-[10.5px] text-muted-foreground">{activeCoupons} Active Coupons</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {pendingReviews} reviews pending moderation • Avg rating: {avgRating > 0 ? `${avgRating.toFixed(1)} ★` : "N/A"}
          </div>
          <div className="flex justify-between items-center pt-0.5">
            <Link
              href="/reviews"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Moderate Reviews ({pendingReviews}) →
            </Link>
            {flaggedUsers > 0 && (
              <span className="text-[10.5px] text-muted-foreground">
                {flaggedUsers} flagged users
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
