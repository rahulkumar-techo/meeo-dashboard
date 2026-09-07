/**
 * @file metric-grid.tsx
 * @description Responsive container layout for KPI Metric Cards.
 * Follows Open/Closed Principle (OCP) with support for both data-driven props and direct children.
 */

"use client"

import * as React from "react"
import { MetricCard, MetricCardProps } from "./metric-card"
import { cn } from "@/lib/utils"

export interface MetricGridProps {
  /** Array of metric card data items */
  items?: MetricCardProps[]
  /** Direct children if composing custom elements */
  children?: React.ReactNode
  /** Number of columns for desktop layout (default: 4) */
  columns?: 2 | 3 | 4 | 5
  /** Custom container styling */
  className?: string
}

export function MetricGrid({
  items,
  children,
  columns = 4,
  className,
}: MetricGridProps) {
  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  }[columns]

  return (
    <div className={cn("grid gap-3.5", colClass, className)}>
      {items
        ? items.map((item, idx) => <MetricCard key={item.id || idx} {...item} />)
        : children}
    </div>
  )
}
