/**
 * @file order-lifecycle-bar.tsx
 * @description Clean, professional order lifecycle timeline component.
 * Follows a standard timeline pattern:
 * - Straight connecting line through step nodes (horizontal on desktop, vertical on mobile)
 * - Clear status states: completed (green check), active (primary pulse), upcoming (muted)
 * - Step timestamps and short status labels
 * - Fully theme-responsive (light & dark mode compatible)
 */

"use client"

import * as React from "react"
import {
  ShoppingBag,
  ShieldCheck,
  Package,
  Truck,
  CheckCheck,
  Check,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/formatters"
import type { AdminOrder, OrderStatus } from "@/types/order"

export interface OrderLifecycleBarProps {
  order: AdminOrder
  className?: string
}

interface StepItem {
  key: OrderStatus
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

const LIFECYCLE_STEPS: StepItem[] = [
  {
    key: "PENDING",
    title: "Order Placed",
    subtitle: "Payment authorized",
    icon: ShoppingBag,
  },
  {
    key: "CONFIRMED",
    title: "Confirmed",
    subtitle: "Stock allocated",
    icon: ShieldCheck,
  },
  {
    key: "PROCESSING",
    title: "Processing",
    subtitle: "Packaging in depot",
    icon: Package,
  },
  {
    key: "SHIPPED",
    title: "Dispatched",
    subtitle: "In courier transit",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    subtitle: "Received by customer",
    icon: CheckCheck,
  },
]

const STATUS_LEVEL_MAP: Record<OrderStatus, number> = {
  PENDING: 1,
  PAYMENT_PENDING: 1,
  CONFIRMED: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  DELIVERED: 5,
  CANCELLED: -1,
  EXPIRED: -1,
  REFUNDED: -1,
}

function formatStepTime(dateStr?: string | null): string {
  if (!dateStr) return "--:--"
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return "--:--"
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
  } catch {
    return "--:--"
  }
}

export function OrderLifecycleBar({ order, className = "" }: OrderLifecycleBarProps) {
  const status = order.status
  const isTerminal = status === "CANCELLED" || status === "EXPIRED" || status === "REFUNDED"
  const currentLevel = STATUS_LEVEL_MAP[status] ?? 1

  // Extract chronological timestamps from order
  const stepTimestamps = React.useMemo<Partial<Record<OrderStatus, string | null>>>(() => {
    const history = order.statusHistory || []

    const findHistoryDate = (targetStatus: OrderStatus) => {
      const match = history.find((h) => h.newStatus === targetStatus)
      return match?.createdAt || null
    }

    return {
      PENDING: order.createdAt,
      CONFIRMED: findHistoryDate("CONFIRMED"),
      PROCESSING: findHistoryDate("PROCESSING"),
      SHIPPED: order.shipment?.shippedAt || findHistoryDate("SHIPPED"),
      DELIVERED: findHistoryDate("DELIVERED"),
    }
  }, [order])

  // Progress percentage (0 to 100)
  const progressPercentage = React.useMemo(() => {
    if (isTerminal || currentLevel <= 1) return 0
    if (currentLevel >= 5) return 100
    return (currentLevel - 1) * 25
  }, [currentLevel, isTerminal])

  // Handle Cancelled / Refunded / Expired terminal states
  if (isTerminal) {
    const terminalHistory = order.statusHistory?.find(
      (h) => h.newStatus === "CANCELLED" || h.newStatus === "REFUNDED" || h.newStatus === "EXPIRED"
    )
    const isRefund = status === "REFUNDED"
    const Icon = isRefund ? RotateCcw : status === "EXPIRED" ? AlertTriangle : XCircle

    return (
      <Card className={`border-rose-500/30 bg-rose-500/5 shadow-2xs ${className}`}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Icon className="size-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-foreground">
                    Order Lifecycle: {status}
                  </h3>
                  <Badge variant="destructive" className="text-[10px] font-mono uppercase py-0">
                    Terminal
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {terminalHistory?.reason ||
                    "This order has been terminated. Holds were released and fulfillment halted."}
                </p>
              </div>
            </div>

            {terminalHistory?.createdAt && (
              <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground shrink-0 self-start sm:self-auto">
                <Clock className="size-3.5 text-rose-500" />
                <span>{formatDate(terminalHistory.createdAt, "datetime")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-border/70 bg-card shadow-2xs ${className}`}>
      <CardContent className="p-4 sm:p-5 space-y-5">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-2.5">
              {currentLevel < 5 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full size-2.5 ${
                  currentLevel === 5 ? "bg-emerald-500" : "bg-primary"
                }`}
              />
            </span>
            <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Order Timeline
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono font-semibold py-0 ${
                currentLevel === 5
                  ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  : "border-primary/40 text-primary bg-primary/10"
              }`}
            >
              {currentLevel === 5 ? "Delivered" : `Step 0${currentLevel} of 05: ${status}`}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Clock className="size-3.5 text-muted-foreground/70" />
            <span>Updated: {formatDate(order.updatedAt || order.createdAt, "short")}</span>
          </div>
        </div>

        {/* Desktop Horizontal Timeline (md and above) */}
        <div className="relative hidden md:block pt-1 pb-2">
          {/* Timeline Track Lines */}
          <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-border/80 z-0" />
          <div
            className="absolute top-[18px] left-[10%] h-0.5 bg-emerald-500 transition-all duration-500 ease-out z-0"
            style={{ width: `${progressPercentage * 0.8}%` }}
          />

          {/* 5 Step Nodes Grid */}
          <div className="grid grid-cols-5 relative z-10">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const stepIndex = idx + 1
              const isCompleted = currentLevel > stepIndex || (currentLevel === 5 && stepIndex === 5)
              const isCurrent = currentLevel === stepIndex && currentLevel < 5
              const isUpcoming = currentLevel < stepIndex
              const timestamp = stepTimestamps[step.key]
              const timeText = formatStepTime(timestamp)
              const Icon = step.icon

              return (
                <div key={step.key} className="flex flex-col items-center text-center px-1">
                  {/* Step Node Circle (Height 36px, centered on top-18px) */}
                  <div className="relative mb-2">
                    {isCurrent && (
                      <span className="absolute -inset-1 rounded-full bg-primary/20 animate-pulse pointer-events-none" />
                    )}

                    <div
                      className={`size-9 rounded-full flex items-center justify-center transition-all ring-4 ring-card ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-2xs"
                          : isCurrent
                          ? "border-2 border-primary bg-background text-primary shadow-xs"
                          : "border border-border/80 bg-muted/60 text-muted-foreground/60"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="size-4 stroke-[2.5]" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </div>

                    {/* Step Index Pill */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full text-[8.5px] font-mono font-bold flex items-center justify-center border border-card ${
                        isCompleted
                          ? "bg-emerald-700 text-white"
                          : isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {stepIndex}
                    </span>
                  </div>

                  {/* Step Title & Subtitle */}
                  <div className="space-y-0.5">
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="mt-1.5">
                    {timestamp ? (
                      <span className="inline-block text-[10.5px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/40">
                        {timeText}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground/50">
                        {isUpcoming ? "Pending" : "In Progress"}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Vertical Timeline (below md) */}
        <div className="relative md:hidden space-y-4 pl-1">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[16px] top-4 bottom-4 w-0.5 bg-border z-0" />
          <div
            className="absolute left-[16px] top-4 w-0.5 bg-emerald-500 transition-all duration-500 z-0"
            style={{ height: `${progressPercentage}%` }}
          />

          {LIFECYCLE_STEPS.map((step, idx) => {
            const stepIndex = idx + 1
            const isCompleted = currentLevel > stepIndex || (currentLevel === 5 && stepIndex === 5)
            const isCurrent = currentLevel === stepIndex && currentLevel < 5
            const isUpcoming = currentLevel < stepIndex
            const timestamp = stepTimestamps[step.key]
            const timeText = formatStepTime(timestamp)
            const Icon = step.icon

            return (
              <div key={step.key} className="relative z-10 flex items-start gap-3">
                <div
                  className={`size-8 rounded-full flex items-center justify-center shrink-0 ring-4 ring-card ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "border-2 border-primary bg-background text-primary"
                      : "border border-border bg-muted/60 text-muted-foreground/60"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="size-3.5 stroke-[2.5]" />
                  ) : (
                    <Icon className="size-3.5" />
                  )}
                </div>

                <div className="space-y-0.5 pt-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs font-semibold ${
                        isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {timeText}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
