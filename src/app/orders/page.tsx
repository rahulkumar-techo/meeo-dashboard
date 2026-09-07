/**
 * @file page.tsx
 * @description Realtime Orders Management Console (< 230 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Download, Plus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PageHeader,
  TriageBanner,
  MetricGrid,
  StatusBadge,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import {
  OrderDetailSheet,
  OrderDetails,
} from "@/components/modules/orders"
import { ORDERS_DATA } from "@/data/orders"

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<OrderDetails[]>(ORDERS_DATA)
  const [selectedOrder, setSelectedOrder] = React.useState<OrderDetails | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [paymentFilter, setPaymentFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Filter orders
  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.fulfillment.status.toLowerCase() !== statusFilter.toLowerCase())
        return false
      if (
        paymentFilter !== "all" &&
        !o.payment.status.toLowerCase().includes(paymentFilter.toLowerCase())
      )
        return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [orders, statusFilter, paymentFilter, searchQuery])

  const handleInspect = (order: OrderDetails) => {
    setSelectedOrder(order)
    setIsSheetOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Orders & Live Fulfillment"
        badge="Realtime Ledger (14,290)"
        badgeVariant="brand"
        description="Comprehensive omnichannel order triage, automated fraud checks, split-shipment routing, and sub-minute settlement ledger."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Orders</span>
        </Button>
        <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>Create Order</span>
        </Button>
      </PageHeader>

      {/* 2. Triage Alert Bar */}
      <TriageBanner
        items={[
          { id: "pending", label: "Pending Fulfillment", count: "142 orders", severity: "info" },
          { id: "fraud", label: "High Fraud Score", count: "1 flag", severity: "danger" },
          { id: "unpaid", label: "Payment Incomplete", count: "5 orders", severity: "warning" },
        ]}
      />

      {/* 3. Metric KPI Cards */}
      <MetricGrid
        columns={4}
        items={[
          {
            title: "Total Orders Today",
            value: "142",
            colorTheme: "indigo",
            trend: { value: "+14.2%", isPositive: true, comparisonPeriod: "yesterday" },
            footnote: "Gross: $18,420.50",
          },
          {
            title: "Awaiting Shipment",
            value: "38",
            colorTheme: "amber",
            badge: { text: "Warehouse East-1", variant: "warning" },
            footnote: "Avg queue time: 32m",
          },
          {
            title: "In-Transit Carrier",
            value: "84",
            colorTheme: "cyan",
            footnote: "FedEx: 52 · UPS: 32",
          },
          {
            title: "Delivered (Today)",
            value: "20",
            colorTheme: "emerald",
            trend: { value: "100%", isPositive: true },
            footnote: "Zero carrier returns",
          },
        ]}
      />

      {/* 4. Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search order ID, customer name, email address..."
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Fulfillment</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Payments</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="apple pay">Apple Pay</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        }
        activeFiltersCount={(statusFilter !== "all" ? 1 : 0) + (paymentFilter !== "all" ? 1 : 0)}
        onResetFilters={() => {
          setStatusFilter("all")
          setPaymentFilter("all")
          setSearchQuery("")
        }}
      />

      {/* 5. Orders Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No Orders Found"
            description="No orders match your filter criteria. Try resetting search query or filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setStatusFilter("all")
              setPaymentFilter("all")
              setSearchQuery("")
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">ORDER ID</TableHead>
                  <TableHead className="font-bold">CUSTOMER</TableHead>
                  <TableHead className="font-bold text-center">ITEMS</TableHead>
                  <TableHead className="font-bold">PAYMENT STATUS</TableHead>
                  <TableHead className="font-bold">FULFILLMENT</TableHead>
                  <TableHead className="font-bold text-right">TOTAL AMOUNT</TableHead>
                  <TableHead className="font-bold text-right">TIME</TableHead>
                  <TableHead className="font-bold text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    onClick={() => handleInspect(order)}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {order.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6 border border-border">
                          <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                          <AvatarFallback className="text-[9px]">
                            {order.customer.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{order.customer.name}</p>
                          <p className="text-[10.5px] text-muted-foreground">{order.customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">{order.itemsCount}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={order.payment.status.includes("Paid") ? "paid" : order.payment.status.toLowerCase()}
                        label={order.payment.status}
                      />
                    </TableCell>
                    <TableCell><StatusBadge status={order.fulfillment.status} showDot /></TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">{order.payment.total}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{order.time}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleInspect(order) }} className="h-7 px-2 text-xs">
                        <Eye className="mr-1 size-3.5" /> Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DataTablePagination
          currentPage={page}
          totalPages={1}
          pageSize={pageSize}
          totalItems={filteredOrders.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 6. Order Detail Slide-Over Sheet */}
      <OrderDetailSheet
        order={selectedOrder}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onCancelOrder={(order) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === order.id ? { ...o, fulfillment: { status: "Cancelled" } } : o))
          )
          setIsSheetOpen(false)
        }}
      />
    </div>
  )
}
