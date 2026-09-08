/**
 * @file top-sellers-leaderboard.tsx
 * @description Top-Selling Products & SKU Velocity Leaderboard.
 * Ranks products by units sold, gross revenue generated, and live inventory levels.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Trophy, Package, ArrowUpRight, AlertTriangle } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { TopSellerItem } from "@/types/analytics"

export interface TopSellersLeaderboardProps {
  topSellers?: TopSellerItem[]
  isLoading?: boolean
  className?: string
}

export function TopSellersLeaderboard({
  topSellers,
  isLoading,
  className,
}: TopSellersLeaderboardProps) {
  if (isLoading) {
    return (
      <Card className={cn("border-border/70 bg-card/95 shadow-2xs", className)}>
        <CardHeader className="p-4 pb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-64 mt-1" />
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const items = topSellers ?? []

  return (
    <Card className={cn("border-border/70 bg-card/95 shadow-2xs", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <Trophy className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Top-Selling Products & SKU Velocity
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Ranked by commercial volume and gross cash generation
            </CardDescription>
          </div>
        </div>
        <Link
          href="/products"
          className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
        >
          Catalog <ArrowUpRight className="size-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-1">
        {items.length === 0 ? (
          <div className="flex h-32 w-full items-center justify-center text-xs text-muted-foreground">
            No sales recorded in the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 w-8">#</th>
                  <th className="pb-2">PRODUCT</th>
                  <th className="pb-2 font-mono">SKU</th>
                  <th className="pb-2 text-right">UNITS SOLD</th>
                  <th className="pb-2 text-right">GROSS REVENUE</th>
                  <th className="pb-2 text-right">AVAILABLE STOCK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {items.map((item, idx) => {
                  const isLowStock = item.currentAvailableStock <= 15
                  return (
                    <tr key={item.productId || item.sku || idx} className="hover:bg-muted/30">
                      <td className="py-2.5 font-bold text-muted-foreground text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 font-medium text-foreground max-w-[200px] truncate">
                        <span title={item.productName}>{item.productName}</span>
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-muted-foreground">
                        {item.sku}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-foreground">
                        {item.unitsSold.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.grossRevenue)}
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        {isLowStock ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-600 bg-amber-500/10"
                          >
                            <AlertTriangle className="mr-1 size-2.5" />
                            {item.currentAvailableStock} left
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            {item.currentAvailableStock} units
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
