/**
 * @file review-status-badge.tsx
 * @description Status badge component for Product Reviews (Pending, Approved, Rejected).
 */

"use client"

import * as React from "react"
import { Clock, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ReviewStatus } from "@/types/review"

export interface ReviewStatusBadgeProps {
  status: ReviewStatus | string
  className?: string
}

export function ReviewStatusBadge({
  status = "PENDING",
  className,
}: ReviewStatusBadgeProps) {
  const normalized = (status || "PENDING").toUpperCase() as ReviewStatus

  switch (normalized) {
    case "APPROVED":
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 gap-1 text-[10.5px] font-semibold uppercase ${className}`}
        >
          <CheckCircle2 className="size-3" />
          <span>APPROVED</span>
        </Badge>
      )
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className={`bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 gap-1 text-[10.5px] font-semibold uppercase ${className}`}
        >
          <XCircle className="size-3" />
          <span>REJECTED</span>
        </Badge>
      )
    case "PENDING":
    default:
      return (
        <Badge
          variant="outline"
          className={`bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 gap-1 text-[10.5px] font-semibold uppercase ${className}`}
        >
          <Clock className="size-3" />
          <span>PENDING</span>
        </Badge>
      )
  }
}
