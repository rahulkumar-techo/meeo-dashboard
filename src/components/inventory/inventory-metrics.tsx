/**
 * @file inventory-metrics.tsx
 * @description KPI summary cards displaying live inventory health, available vs. reserved units, and reorder warnings.
 */

"use client"

import * as React from "react"
import { Package, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { MetricGrid } from "@/components/common"
import type { InventoryRecord, LowStockAlert } from "@/types/inventory"

export interface InventoryMetricsProps {
  items: InventoryRecord[]
  lowStockAlerts: LowStockAlert[]
  isLoading?: boolean
}

export function InventoryMetrics({
  items,
  lowStockAlerts,
  isLoading,
}: InventoryMetricsProps) {
  // Aggregate metrics across the catalog
  const { totalUnits, availableUnits, reservedUnits, criticalOutCount } =
    React.useMemo(() => {
      let total = 0
      let available = 0
      let reserved = 0
      let criticalOut = 0

      items.forEach((item) => {
        const itemAvail = item.availableQuantity || 0
        const itemRes = item.reservedQuantity || 0
        const itemTot = item.totalStock ?? itemAvail + itemRes

        total += itemTot
        available += itemAvail
        reserved += itemRes

        if (itemAvail === 0) {
          criticalOut += 1
        }
      })

      return {
        totalUnits: total,
        availableUnits: available,
        reservedUnits: reserved,
        criticalOutCount: criticalOut,
      }
    }, [items])

  const lowStockCount = lowStockAlerts.length

  return (
    <MetricGrid
      columns={4}
      items={[
        {
          title: "Total Units on Hand",
          value: isLoading ? "..." : `${totalUnits.toLocaleString()} Units`,
          colorTheme: "indigo",
          icon: Package,
          footnote: `Catalog SKUs: ${items.length}`,
        },
        {
          title: "Available for Sale",
          value: isLoading ? "..." : `${availableUnits.toLocaleString()} Units`,
          colorTheme: "emerald",
          icon: CheckCircle2,
          footnote: `${((availableUnits / (totalUnits || 1)) * 100).toFixed(0)}% available stock pool`,
        },
        {
          title: "Reserved in Checkouts",
          value: isLoading ? "..." : `${reservedUnits.toLocaleString()} Units`,
          colorTheme: "cyan",
          icon: Clock,
          footnote: "Active holds with TTL expiration",
        },
        {
          title: "Low Stock / Critical",
          value: isLoading ? "..." : `${lowStockCount} SKUs`,
          colorTheme: lowStockCount > 0 ? "amber" : "slate",
          icon: AlertTriangle,
          badge:
            lowStockCount > 0
              ? { text: `${lowStockCount} Reorders`, variant: "warning" }
              : undefined,
          footnote:
            criticalOutCount > 0
              ? `${criticalOutCount} out of stock`
              : "Safety levels healthy",
        },
      ]}
    />
  )
}
