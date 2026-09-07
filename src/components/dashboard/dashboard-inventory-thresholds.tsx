/**
 * @file dashboard-inventory-thresholds.tsx
 * @description Dynamic inventory threshold status widget displaying all warehouse & stock health metrics from API data:
 * inStockCount, lowStockCount, outOfStockCount, totalPhysicalUnits, totalReservedUnits, and totalTrackedVariants.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, Package, CheckCircle2, Boxes } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DashboardOverviewPayload } from "@/types/dashboard-overview"
import { cn } from "@/lib/utils"

export interface DashboardInventoryThresholdsProps {
  /** Overview data from API */
  overview?: DashboardOverviewPayload | null
  /** Container classes */
  className?: string
}

export function DashboardInventoryThresholds({
  overview,
  className,
}: DashboardInventoryThresholdsProps) {
  const inv = overview?.inventory
  const inStockCount = inv?.inStockCount ?? 0
  const lowStockCount = inv?.lowStockCount ?? 0
  const outOfStockCount = inv?.outOfStockCount ?? 0
  const totalPhysicalUnits = inv?.totalPhysicalUnits ?? 0
  const totalReservedUnits = inv?.totalReservedUnits ?? 0
  const totalTrackedVariants = inv?.totalTrackedVariants ?? 0

  const totalCritical = lowStockCount + outOfStockCount

  return (
    <Card className={cn("shadow-2xs border-border/70", className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="size-4 text-amber-500" />
            <CardTitle className="text-sm font-bold tracking-tight">Inventory Thresholds</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold",
              totalCritical > 0
                ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            )}
          >
            {totalCritical > 0 ? `${totalCritical} Critical` : "Healthy"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-2.5">
        {/* Top 3 Summary Units */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md border border-border/60 bg-muted/20 p-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Units</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {totalPhysicalUnits.toLocaleString("en-US")}
            </span>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/20 p-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase block">SKUs</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {totalTrackedVariants.toLocaleString("en-US")}
            </span>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/20 p-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Reserved</span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {totalReservedUnits.toLocaleString("en-US")}
            </span>
          </div>
        </div>

        {/* In-Stock Status */}
        <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/40 p-2.5 flex justify-between items-center text-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-800 dark:text-emerald-300">In-Stock Availability</span>
              <div className="text-[10.5px] text-muted-foreground">Ready for customer orders</div>
            </div>
          </div>
          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
            {inStockCount.toLocaleString("en-US")} items
          </span>
        </div>

        {/* Low Stock Warning */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold">Low Stock Warning</span>
            <Badge className="bg-amber-100 text-amber-800 text-[10px] font-mono">
              {lowStockCount} items
            </Badge>
          </div>
          <div className="text-[11px] text-muted-foreground">Items currently below reorder threshold</div>
          <Link href="/inventory" className="inline-block text-xs font-semibold text-indigo-600 hover:underline pt-0.5">
            Manage Inventory →
          </Link>
        </div>

        {/* Out of Stock Critical */}
        <div className="rounded-lg border border-rose-200/80 bg-rose-50/40 p-2.5 space-y-1.5 text-xs dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="flex justify-between items-center">
            <span className="font-bold text-rose-800 dark:text-rose-300">Stockout Alert</span>
            <Badge
              variant={outOfStockCount > 0 ? "destructive" : "secondary"}
              className="text-[9.5px] font-mono"
            >
              {outOfStockCount > 0 ? `${outOfStockCount} OUT OF STOCK` : "0 OUT OF STOCK"}
            </Badge>
          </div>
          <div className="text-[11px] text-muted-foreground">Immediate supplier replenishment required</div>
          {outOfStockCount > 0 && (
            <Button size="sm" className="bg-rose-700 hover:bg-rose-800 text-white text-[10.5px] h-6 px-2">
              Emergency Restock
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
