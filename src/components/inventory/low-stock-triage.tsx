/**
 * @file low-stock-triage.tsx
 * @description Urgent replenishment triage view listing variants at or below their safety reorder threshold.
 * Displays shortage calculations and offers a 1-click Restock action.
 */

"use client"

import * as React from "react"
import {
  AlertTriangle,
  PackagePlus,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Package,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common"
import type { LowStockAlert, InventoryRecord } from "@/types/inventory"

export interface LowStockTriageProps {
  alerts: LowStockAlert[]
  isLoading: boolean
  onRestock: (alert: LowStockAlert) => void
  onRefresh: () => void
}

export function LowStockTriage({
  alerts,
  isLoading,
  onRestock,
  onRefresh,
}: LowStockTriageProps) {
  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-500/15 p-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Low Stock & Safety Threshold Alerts
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Identifies product variants where available stock is below configured safety thresholds. Restock urgently to prevent lost sales.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 gap-1.5 text-xs shrink-0"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Alerts</span>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 font-semibold text-foreground">PRODUCT / VARIANT SKU</TableHead>
              <TableHead className="font-semibold text-center text-foreground">AVAILABLE</TableHead>
              <TableHead className="font-semibold text-center text-foreground">RESERVED</TableHead>
              <TableHead className="font-semibold text-center text-foreground">SAFETY THRESHOLD</TableHead>
              <TableHead className="font-semibold text-center text-foreground">SHORTAGE DEFICIT</TableHead>
              <TableHead className="text-right pr-4 font-semibold text-foreground">ACTION</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-xs">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell className="pl-4 py-4">
                    <div className="space-y-1.5">
                      <div className="h-4 w-40 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted/60 rounded" />
                    </div>
                  </TableCell>
                  <TableCell><div className="h-5 w-12 mx-auto bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-12 mx-auto bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-12 mx-auto bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-16 mx-auto bg-muted rounded" /></TableCell>
                  <TableCell className="text-right pr-4"><div className="h-7 w-28 ml-auto bg-muted rounded" /></TableCell>
                </TableRow>
              ))
            ) : alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
                      <ShieldCheck className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Stock Levels Healthy</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        No product variants are currently below their reorder safety thresholds.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => {
                const productName = alert.variant?.product?.name || "Product Variant"
                const sku = alert.variant?.sku || alert.variantId
                const available = alert.availableQuantity ?? 0
                const reserved = alert.reservedQuantity ?? 0
                const reorder = alert.reorderLevel ?? 10
                const shortage = alert.shortage ?? Math.max(0, reorder - available)

                return (
                  <TableRow key={alert.id || alert.variantId} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="pl-4 py-3">
                      <div>
                        <p className="font-semibold text-foreground">{productName}</p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">SKU: {sku}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-mono font-bold text-sm">
                      <span className={available === 0 ? "text-rose-600 font-extrabold" : "text-amber-600"}>
                        {available} units
                      </span>
                    </TableCell>

                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {reserved} units
                    </TableCell>

                    <TableCell className="text-center font-mono text-xs font-semibold text-foreground">
                      {reorder} units
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="destructive" className="font-mono text-xs gap-1">
                        <span>-{shortage} units</span>
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right pr-4">
                      <Button
                        size="sm"
                        onClick={() => onRestock(alert)}
                        className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                      >
                        <PackagePlus className="size-3.5" />
                        <span>Restock Now</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
