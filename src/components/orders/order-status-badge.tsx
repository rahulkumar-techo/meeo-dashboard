/**
 * @file order-status-badge.tsx
 * @description Status badge component supporting all 9 platform order lifecycle states.
 */

"use client"

import * as React from "react"
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  TimerOff,
  RotateCcw,
  AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/types/order"

export interface OrderStatusBadgeProps {
  status: OrderStatus | string
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const normalized = (status || "").toUpperCase() as OrderStatus

  switch (normalized) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 gap-1 text-[10.5px] font-semibold ${className}`}
        >
          <Clock className="size-3" />
          <span>PENDING</span>
        </Badge>
      )
    case "PAYMENT_PENDING":
      return (
        <Badge
          variant="outline"
          className={`bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-300 gap-1 text-[10.5px] font-semibold ${className}`}
        >
          <Clock className="size-3" />
          <span>PAYMENT PENDING</span>
        </Badge>
      )
    case "CONFIRMED":
      return (
        <Badge
          variant="outline"
          className={`bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-300 gap-1 text-[10.5px] font-semibold ${className}`}
        >
          <CheckCircle2 className="size-3" />
          <span>CONFIRMED</span>
        </Badge>
      )
    case "PROCESSING":
      return (
        <Badge
          variant="outline"
          className={`bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-300 gap-1 text-[10.5px] font-semibold ${className}`}
        >
          <Package className="size-3" />
          <span>PROCESSING</span>
        </Badge>
      )
    case "SHIPPED":
      return (
        <Badge
          variant="outline"
          className={`bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-300 gap-1 text-[10.5px] font-semibold ${className}`}
        >
          <Truck className="size-3" />
          <span>SHIPPED</span>
        </Badge>
      )
    case "DELIVERED":
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 gap-1 text-[10.5px] font-semibold ${className}`}
        >
          <CheckCheck className="size-3" />
          <span>DELIVERED</span>
        </Badge>
      )
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className={`bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 gap-1 text-[10.5px] font-semibold ${className}`}
        >
          <XCircle className="size-3" />
          <span>CANCELLED</span>
        </Badge>
      )
    case "EXPIRED":
      return (
        <Badge
          variant="outline"
          className={`bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 gap-1 text-[10.5px] font-semibold ${className}`}
        >
          <TimerOff className="size-3" />
          <span>EXPIRED</span>
        </Badge>
      )
    case "REFUNDED":
      return (
        <Badge
          variant="outline"
          className={`bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-300 gap-1 text-[10.5px] font-semibold ${className}`}
        >
          <RotateCcw className="size-3" />
          <span>REFUNDED</span>
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className={`text-[10.5px] font-semibold ${className}`}>
          {status}
        </Badge>
      )
  }
}
