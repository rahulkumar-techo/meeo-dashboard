/**
 * @file page.tsx
 * @description Admin Double-Entry Financial Transactions & Ledger Console.
 * Directly integrates with Admin Payment API (GET /api/v1/payments/admin/list, GET /:id, POST /refund, POST /reconcile).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Download, RefreshCw, Eye, RotateCcw, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  MetricGrid,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import {
  PaymentStatusBadge,
  PaymentDetailSheet,
  RefundDialog,
  ReconcileDialog,
} from "@/components/payments"
import { useAdminPayments } from "@/hooks/use-payment-query"
import type { PaymentListItem } from "@/types/payment"

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [gatewayFilter, setGatewayFilter] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Modals state
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentListItem | null>(null)
  const [detailSheetPaymentId, setDetailSheetPaymentId] = React.useState<string | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false)
  const [refundOpen, setRefundOpen] = React.useState(false)
  const [reconcileOpen, setReconcileOpen] = React.useState(false)

  // Fetch payments from admin API
  const {
    data: paymentData,
    isLoading,
    isFetching,
    refetch,
  } = useAdminPayments({
    page,
    limit: pageSize,
    status: statusFilter !== "all" ? statusFilter : undefined,
    provider: gatewayFilter !== "all" ? gatewayFilter : undefined,
    orderId: searchQuery.trim() || undefined,
  })

  const items: PaymentListItem[] = paymentData?.items ?? []
  const totalPages = paymentData?.pagination?.totalPages ?? 1
  const totalItems = paymentData?.pagination?.total ?? items.length

  // Calculate transaction metrics strictly from live data
  const metrics = React.useMemo(() => {
    let grossSettled = 0
    let totalRefundDebits = 0
    let capturedCount = 0
    let inFlightCount = 0

    items.forEach((p) => {
      const amt = Number(p.amount) || 0
      const ref = Number(p.refundedAmount) || 0
      grossSettled += amt
      totalRefundDebits += ref

      if (p.status === "SUCCESS") capturedCount++
      else if (p.status === "PROCESSING" || p.status === "REQUIRES_ACTION" || p.status === "PENDING") {
        inFlightCount++
      }
    })

    return {
      grossSettled,
      totalRefundDebits,
      netSettled: grossSettled - totalRefundDebits,
      capturedCount,
      inFlightCount,
    }
  }, [items])

  const handleInspect = (payment: PaymentListItem) => {
    setDetailSheetPaymentId(payment.id)
    setDetailSheetOpen(true)
  }

  const handleRefund = (payment: PaymentListItem) => {
    setSelectedPayment(payment)
    setRefundOpen(true)
  }

  const handleReconcile = (payment: PaymentListItem) => {
    setSelectedPayment(payment)
    setReconcileOpen(true)
  }

  const handleExportCSV = () => {
    if (items.length === 0) return
    const headers = [
      "Payment ID",
      "Order ID",
      "Gateway Provider",
      "Payment Method",
      "Gross Amount",
      "Refund Debit",
      "Net Settled",
      "Currency",
      "Status",
      "Created At",
    ]
    const rows = items.map((p) => {
      const amt = Number(p.amount) || 0
      const ref = Number(p.refundedAmount) || 0
      return [
        p.id,
        p.orderId,
        p.provider,
        p.paymentMethod || "",
        amt,
        ref,
        amt - ref,
        p.currency,
        p.status,
        new Date(p.createdAt).toISOString(),
      ]
    })
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `financial_ledger_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Double-Entry Financial Transactions & Ledger"
        badge="Immutable Journal"
        badgeVariant="success"
        description="Immutable double-entry financial journal, automated gateway captures, refund debits, and multi-rail settlements."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
          >
            <RefreshCw
              className={`size-3.5 text-muted-foreground ${
                isFetching ? "animate-spin text-indigo-500" : ""
              }`}
            />
            <span>Refresh Ledger</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={items.length === 0}
            className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export Journal (CSV)</span>
          </Button>
        </div>
      </PageHeader>

      {/* 2. KPI Metrics Grid */}
      <MetricGrid
        columns={4}
        items={[
          {
            title: "Total Gross Settled",
            value: `$${metrics.grossSettled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            colorTheme: "emerald",
            footnote: `${metrics.capturedCount} captured payments`,
          },
          {
            title: "Net Settlement Volume",
            value: `$${metrics.netSettled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            colorTheme: "indigo",
            footnote: "After refund deductions",
          },
          {
            title: "Total Refund Debits",
            value: `$${metrics.totalRefundDebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            colorTheme: "amber",
            footnote: "Debited against ledger",
          },
          {
            title: "In-Flight Clearing",
            value: `${metrics.inFlightCount} Intents`,
            colorTheme: "cyan",
            badge:
              metrics.inFlightCount > 0
                ? { text: "Active", variant: "brand" }
                : undefined,
            footnote: "Reconciliation available",
          },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Payment UUID, Order UUID..."
        filters={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Intent Statuses</option>
              <option value="SUCCESS">Success / Captured</option>
              <option value="PROCESSING">Processing</option>
              <option value="REQUIRES_ACTION">Requires Action</option>
              <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
              <option value="REFUNDED">Fully Refunded</option>
              <option value="FAILED">Failed / Declined</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={gatewayFilter}
              onChange={(e) => {
                setGatewayFilter(e.target.value)
                setPage(1)
              }}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Gateways</option>
              <option value="STRIPE">Stripe</option>
              <option value="RAZORPAY">Razorpay</option>
              <option value="MOCK">Mock Gateway</option>
            </select>
          </div>
        }
        activeFiltersCount={
          (statusFilter !== "all" ? 1 : 0) + (gatewayFilter !== "all" ? 1 : 0)
        }
        onResetFilters={() => {
          setStatusFilter("all")
          setGatewayFilter("all")
          setSearchQuery("")
          setPage(1)
        }}
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {!isLoading && items.length === 0 ? (
          <EmptyState
            title="No Financial Transactions Found"
            description="No ledger records matched your active query filters."
            actionLabel="Reset All Filters"
            onAction={() => {
              setStatusFilter("all")
              setGatewayFilter("all")
              setSearchQuery("")
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
                  <TableHead className="font-bold">PAYMENT ID</TableHead>
                  <TableHead className="font-bold">ORDER REF</TableHead>
                  <TableHead className="font-bold">PROVIDER</TableHead>
                  <TableHead className="font-bold">METHOD</TableHead>
                  <TableHead className="font-bold text-right">GROSS CAPTURE</TableHead>
                  <TableHead className="font-bold text-right">REFUND DEBIT</TableHead>
                  <TableHead className="font-bold text-right">NET</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">RECORDED AT</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="animate-spin inline-block size-5 border-2 border-current border-t-transparent rounded-full text-indigo-600 mb-2" />
                      <div>Loading ledger transactions from admin API...</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((pay) => {
                    const gross = Number(pay.amount) || 0
                    const ref = Number(pay.refundedAmount) || 0
                    const net = gross - ref
                    const isRefundable =
                      (pay.status === "SUCCESS" ||
                        pay.status === "PARTIALLY_REFUNDED") &&
                      gross - ref > 0

                    return (
                      <TableRow
                        key={pay.id}
                        className="hover:bg-muted/40 transition-colors group"
                      >
                        <TableCell className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          <button
                            onClick={() => handleInspect(pay)}
                            className="hover:underline"
                          >
                            {pay.id.length > 16
                              ? `${pay.id.slice(0, 12)}...`
                              : pay.id}
                          </button>
                        </TableCell>

                        <TableCell className="font-mono">
                          <Link
                            href="/orders"
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                          >
                            {pay.orderId.length > 16
                              ? `${pay.orderId.slice(0, 10)}...`
                              : pay.orderId}
                          </Link>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono uppercase bg-muted/30"
                          >
                            {pay.provider}
                          </Badge>
                        </TableCell>

                        <TableCell className="capitalize text-muted-foreground">
                          {pay.paymentMethod || "card_visa"}
                        </TableCell>

                        <TableCell className="text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          +${gross.toFixed(2)}
                        </TableCell>

                        <TableCell className="text-right font-mono">
                          {ref > 0 ? (
                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                              -${ref.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">$0.00</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right font-mono font-bold text-foreground">
                          ${net.toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <PaymentStatusBadge status={pay.status} />
                        </TableCell>

                        <TableCell className="text-muted-foreground text-[11px]">
                          {new Date(pay.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInspect(pay)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="Inspect Full Ledger"
                            >
                              <Eye className="size-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReconcile(pay)}
                              className="h-7 w-7 p-0 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                              title="Reconcile with Gateway"
                            >
                              <RefreshCw className="size-3.5" />
                            </Button>

                            {isRefundable && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRefund(pay)}
                                className="h-7 w-7 p-0 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                                title="Issue Refund"
                              >
                                <RotateCcw className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 5. Modals & Slide-Over Drawers */}
      <PaymentDetailSheet
        paymentId={detailSheetPaymentId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onActionSuccess={() => refetch()}
      />

      <RefundDialog
        payment={selectedPayment}
        open={refundOpen}
        onOpenChange={setRefundOpen}
        onSuccess={() => refetch()}
      />

      <ReconcileDialog
        payment={selectedPayment}
        open={reconcileOpen}
        onOpenChange={setReconcileOpen}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
