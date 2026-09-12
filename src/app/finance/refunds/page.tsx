/**
 * @file page.tsx
 * @description Admin Refunds & Financial Chargeback Management Console.
 * Directly integrates with Admin Payment API (GET /api/v1/payments/admin/list, POST /refund, POST /reconcile, GET /:id).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { RotateCcw, Download, RefreshCw, Eye, Plus, ShieldCheck } from "lucide-react"
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
import { formatCurrency } from "@/lib/formatters"
import {
  PaymentStatusBadge,
  PaymentDetailSheet,
  RefundDialog,
  ReconcileDialog,
} from "@/components/payments"
import { useAdminPayments } from "@/hooks/use-payment-query"
import type { PaymentListItem } from "@/types/payment"

export default function RefundsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [providerFilter, setProviderFilter] = React.useState<string>("all")
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
    provider: providerFilter !== "all" ? providerFilter : undefined,
    orderId: searchQuery.trim() || undefined,
  })

  const rawItems = paymentData?.items ?? []

  // Focus on refunds or filter as requested
  const items: PaymentListItem[] = React.useMemo(() => {
    if (statusFilter !== "all") return rawItems
    return rawItems
  }, [rawItems, statusFilter])

  const totalPages = paymentData?.pagination?.totalPages ?? 1
  const totalItems = paymentData?.pagination?.total ?? items.length

  // Calculate live refund metrics strictly from real data
  const metrics = React.useMemo(() => {
    let totalRefunded = 0
    let fullyRefundedCount = 0
    let partiallyRefundedCount = 0
    let refundableBalance = 0

    const currency = rawItems.find((p: PaymentListItem) => p.currency)?.currency || "INR"

    rawItems.forEach((p: PaymentListItem) => {
      const ref = Number(p.refundedAmount) || 0
      const amt = Number(p.amount) || 0
      totalRefunded += ref
      if (p.status === "REFUNDED") fullyRefundedCount++
      else if (p.status === "PARTIALLY_REFUNDED") partiallyRefundedCount++

      if (p.status === "SUCCESS" || p.status === "PARTIALLY_REFUNDED") {
        refundableBalance += Math.max(0, amt - ref)
      }
    })

    return {
      currency,
      totalRefunded,
      fullyRefundedCount,
      partiallyRefundedCount,
      totalRefundCases: fullyRefundedCount + partiallyRefundedCount,
      refundableBalance,
    }
  }, [rawItems])

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
      "Provider",
      "Gross Amount",
      "Refunded Amount",
      "Remaining Refundable",
      "Currency",
      "Status",
      "Date",
    ]
    const rows = items.map((p) => {
      const amt = Number(p.amount) || 0
      const ref = Number(p.refundedAmount) || 0
      return [
        p.id,
        p.orderId,
        p.provider,
        amt,
        ref,
        Math.max(0, amt - ref),
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
    link.setAttribute("download", `platform_refunds_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Refunds & Balance Settlements"
        badge="Live Gateway Invariant"
        badgeVariant="brand"
        description="Issue full or partial refunds, debit double-entry ledger transactions, and monitor multi-gateway settlement balances."
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
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={items.length === 0}
            className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </Button>
        </div>
      </PageHeader>

      {/* 2. KPI Metrics Grid */}
      <MetricGrid
        columns={4}
        items={[
          {
            title: "Total Refunded Debits",
            value: isLoading
              ? "..."
              : formatCurrency(metrics.totalRefunded, {
                  currency: metrics.currency,
                }),
            colorTheme: "amber",
            footnote: "Audited against double-entry ledger",
          },
          {
            title: "Settled Refund Records",
            value: isLoading ? "..." : `${metrics.totalRefundCases} Payments`,
            colorTheme: "indigo",
            footnote: `${metrics.fullyRefundedCount} full, ${metrics.partiallyRefundedCount} partial`,
          },
          {
            title: "Available Refund Pool",
            value: isLoading
              ? "..."
              : formatCurrency(metrics.refundableBalance, {
                  currency: metrics.currency,
                }),
            colorTheme: "emerald",
            footnote: "Unrefunded captured balances",
          },
          {
            title: "Gateway Protection",
            value: "100% Invariant",
            colorTheme: "cyan",
            badge: { text: "Protected", variant: "brand" },
            footnote: "Over-refunding prevented by API",
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
              <option value="all">All Platform Records</option>
              <option value="REFUNDED">Fully Refunded</option>
              <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
              <option value="SUCCESS">Captured (Refund Eligible)</option>
            </select>

            <select
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value)
                setPage(1)
              }}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Providers</option>
              <option value="STRIPE">Stripe</option>
              <option value="RAZORPAY">Razorpay</option>
              <option value="MOCK">Mock Gateway</option>
            </select>
          </div>
        }
        activeFiltersCount={
          (statusFilter !== "all" ? 1 : 0) + (providerFilter !== "all" ? 1 : 0)
        }
        onResetFilters={() => {
          setStatusFilter("all")
          setProviderFilter("all")
          setSearchQuery("")
          setPage(1)
        }}
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {!isLoading && items.length === 0 ? (
          <EmptyState
            title="No Refund Records Found"
            description="No refund records or eligible payments matched your active filters."
            actionLabel="Reset All Filters"
            onAction={() => {
              setStatusFilter("all")
              setProviderFilter("all")
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
                  <TableHead className="font-bold text-right">ORIGINAL</TableHead>
                  <TableHead className="font-bold text-right">REFUNDED</TableHead>
                  <TableHead className="font-bold text-right">REMAINING</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">UPDATED</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="animate-spin inline-block size-5 border-2 border-current border-t-transparent rounded-full text-indigo-600 mb-2" />
                      <div>Loading refund records from admin ledger...</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((pay) => {
                    const amount = Number(pay.amount) || 0
                    const refunded = Number(pay.refundedAmount) || 0
                    const remaining = Math.max(0, amount - refunded)
                    const isRefundable =
                      (pay.status === "SUCCESS" ||
                        pay.status === "PARTIALLY_REFUNDED") &&
                      remaining > 0

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
                            {pay.order?.orderNumber ||
                              (pay.orderId.length > 16
                                ? `${pay.orderId.slice(0, 10)}...`
                                : pay.orderId)}
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

                        <TableCell className="text-right font-mono font-medium text-foreground">
                          {formatCurrency(amount, { currency: pay.currency })}
                        </TableCell>

                        <TableCell className="text-right font-mono">
                          {refunded > 0 ? (
                            <span className="font-bold text-orange-600 dark:text-orange-400">
                              -{formatCurrency(refunded, { currency: pay.currency })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {formatCurrency(0, { currency: pay.currency })}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(remaining, { currency: pay.currency })}
                        </TableCell>

                        <TableCell>
                          <PaymentStatusBadge status={pay.status} />
                        </TableCell>

                        <TableCell className="text-muted-foreground text-[11px]">
                          {new Date(pay.updatedAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInspect(pay)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="Inspect Payment & Ledger"
                            >
                              <Eye className="size-3.5" />
                            </Button>

                            {isRefundable && (
                              <Button
                                size="sm"
                                onClick={() => handleRefund(pay)}
                                className="h-7 px-2 text-xs bg-orange-600 hover:bg-orange-700 text-white font-medium gap-1"
                              >
                                <RotateCcw className="size-3" />
                                <span>Refund</span>
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReconcile(pay)}
                              className="h-7 w-7 p-0 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                              title="Reconcile with Gateway"
                            >
                              <RefreshCw className="size-3.5" />
                            </Button>
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
