/**
 * @file customer-360-commerce-tab.tsx
 * @description Commerce overview tab with order velocity, AOV KPIs, order status breakdown chart, and recent orders ledger.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  IndianRupee,
  ShoppingBag,
  CreditCard,
  RotateCcw,
  Calendar,
  ExternalLink,
  TrendingUp,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MetricGrid, StatusBadge, EmptyState } from "@/components/common"
import { formatCurrency, formatDate } from "@/lib/formatters"
import type { User360CommerceMetrics, User360RecentOrder } from "@/types/tracking"

interface Customer360CommerceTabProps {
  commerce?: User360CommerceMetrics | null
  recentOrders?: User360RecentOrder[]
}

export function Customer360CommerceTab({
  commerce,
  recentOrders = [],
}: Customer360CommerceTabProps) {
  const totalSpend = commerce?.totalSpend ?? 0
  const totalOrders = commerce?.totalOrders ?? 0
  const completedOrders = commerce?.completedOrders ?? 0
  const cancelledOrders = commerce?.cancelledOrders ?? 0
  const averageOrderValue = commerce?.averageOrderValue ?? 0

  const orderChartData = [
    { name: "Completed", count: completedOrders, color: "#10b981" },
    { name: "Cancelled", count: cancelledOrders, color: "#f43f5e" },
    {
      name: "In-Flight",
      count: Math.max(0, totalOrders - completedOrders - cancelledOrders),
      color: "#f59e0b",
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Commerce Financial Metrics */}
      <MetricGrid
        columns={4}
        items={[
          {
            title: "Lifetime Gross Spend",
            value: formatCurrency(totalSpend),
            colorTheme: "indigo",
            icon: IndianRupee,
            footnote: "Non-cancelled completed order ledger",
          },
          {
            title: "Total Orders Placed",
            value: totalOrders,
            subValue: `${completedOrders} fulfilled`,
            colorTheme: "emerald",
            icon: ShoppingBag,
            footnote: `${cancelledOrders} cancellations / returns`,
          },
          {
            title: "Average Order Value (AOV)",
            value: formatCurrency(averageOrderValue),
            colorTheme: "cyan",
            icon: CreditCard,
            footnote: "Basket size per completed checkout",
          },
          {
            title: "Order Fulfilment Rate",
            value: totalOrders > 0 ? `${Math.round((completedOrders / totalOrders) * 100)}%` : "0%",
            colorTheme: "violet",
            icon: TrendingUp,
            footnote: "Percentage of checkouts delivered",
          },
        ]}
      />

      {/* 2. Charts & Timestamps Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Breakdown Chart */}
        <Card className="border-border/70 bg-card shadow-2xs lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Order Fulfilment Distribution</CardTitle>
            <CardDescription className="text-xs">
              Breakdown of total lifetime order placements by terminal state
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "currentColor", opacity: 0.08 }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const item = payload[0]
                      return (
                        <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-md text-xs text-popover-foreground backdrop-blur-xs space-y-1">
                          <p className="font-semibold text-foreground">{item.payload.name} Orders</p>
                          <p className="font-mono font-bold text-foreground">
                            {item.value} {Number(item.value) === 1 ? "order" : "orders"}
                          </p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {orderChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Commerce Timeline Summary */}
        <Card className="border-border/70 bg-card shadow-2xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Commerce Lifecycle Milestones</CardTitle>
            <CardDescription className="text-xs">First and latest checkout timestamps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 text-primary" />
                <span>First Recorded Order</span>
              </span>
              <p className="font-semibold text-foreground text-sm">
                {commerce?.firstOrderAt ? formatDate(commerce.firstOrderAt, "medium") : "None placed yet"}
              </p>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <ShoppingBag className="size-3.5 text-emerald-500" />
                <span>Most Recent Order</span>
              </span>
              <p className="font-semibold text-foreground text-sm">
                {commerce?.lastOrderAt ? formatDate(commerce.lastOrderAt, "medium") : "None placed yet"}
              </p>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <RotateCcw className="size-3.5 text-rose-500" />
                <span>Cancelled / Refunded Rate</span>
              </span>
              <p className="font-semibold text-foreground text-sm">
                {totalOrders > 0 ? `${Math.round((cancelledOrders / totalOrders) * 100)}%` : "0%"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Orders Ledger Table */}
      <Card className="border-border/70 bg-card shadow-2xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span>Recent Purchase Ledger</span>
            <span className="text-xs font-normal text-muted-foreground">
              Showing last {recentOrders.length} orders
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          {recentOrders.length === 0 ? (
            <EmptyState
              title="No Purchase Records Found"
              description="This customer does not have any recorded orders in the system."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40 text-xs">
                  <TableRow>
                    <TableHead className="font-semibold">Order Number</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Item Count</TableHead>
                    <TableHead className="font-semibold">Grand Total</TableHead>
                    <TableHead className="font-semibold">Date Placed</TableHead>
                    <TableHead className="font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {recentOrders.map((ord) => (
                    <TableRow key={ord.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-medium text-foreground">
                        {ord.orderNumber}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ord.status.toLowerCase()} showDot />
                      </TableCell>
                      <TableCell className="font-mono">{ord.itemCount} items</TableCell>
                      <TableCell className="font-mono font-semibold text-foreground">
                        {formatCurrency(ord.grandTotal)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(ord.createdAt, "datetime")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                          <span>View Order</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
