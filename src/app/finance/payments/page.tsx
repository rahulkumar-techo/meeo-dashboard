/**
 * @file page.tsx
 * @description Central Payment & Financial Operations Console.
 * Directly integrates with Admin Payment API (GET /api/v1/payments/admin/list, GET /:id, POST /refund, POST /reconcile).
 */

"use client"

import * as React from "react"
import { Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  PageHeader,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import {
  PaymentMetrics,
  PaymentGuideCard,
  PaymentTable,
  PaymentDetailSheet,
  RefundDialog,
  ReconcileDialog,
} from "@/components/payments"
import { useAdminPayments } from "@/hooks/use-payment-query"
import type { PaymentListItem } from "@/types/payment"

export default function PaymentsPage() {
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

  // Admin TanStack Query (Strictly real backend endpoints)
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

  // Live items strictly from backend API
  const items: PaymentListItem[] = paymentData?.items ?? []
  const totalPages = paymentData?.pagination?.totalPages ?? 1
  const totalItems = paymentData?.pagination?.total ?? items.length

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
      "Method",
      "Amount",
      "Refunded",
      "Currency",
      "Status",
      "Date",
    ]
    const rows = items.map((p) => [
      p.id,
      p.orderId,
      p.provider,
      p.paymentMethod || "",
      p.amount,
      p.refundedAmount,
      p.currency,
      p.status,
      new Date(p.createdAt).toISOString(),
    ])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `platform_payments_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Payment & Financial Operations"
        badge="Stripe · Razorpay · Mock"
        badgeVariant="brand"
        description="Double-entry financial ledger, self-healing gateway reconciliation, instant partial/full refunds, and webhook diagnostics."
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
            <span>Export CSV</span>
          </Button>
        </div>
      </PageHeader>

      {/* 2. KPI Metrics Grid */}
      <PaymentMetrics items={items} isLoading={isLoading} />

      {/* 3. Financial Architecture & Lifecycle Guide */}
      <PaymentGuideCard />

      {/* 4. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Payment UUID, Order UUID..."
        filters={
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Payment Statuses</option>
              <option value="SUCCESS">Success / Captured</option>
              <option value="PROCESSING">Processing / In-Flight</option>
              <option value="REQUIRES_ACTION">Requires Action (3DS)</option>
              <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
              <option value="REFUNDED">Fully Refunded</option>
              <option value="FAILED">Failed / Declined</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PENDING">Pending</option>
            </select>

            {/* Provider Filter */}
            <select
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value)
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
          (statusFilter !== "all" ? 1 : 0) + (providerFilter !== "all" ? 1 : 0)
        }
        onResetFilters={() => {
          setStatusFilter("all")
          setProviderFilter("all")
          setSearchQuery("")
          setPage(1)
        }}
      />

      {/* 5. Payments Data Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {!isLoading && items.length === 0 ? (
          <EmptyState
            title="No Payment Records Found"
            description="No transactions or payment intents matched your active filters."
            actionLabel="Reset All Filters"
            onAction={() => {
              setStatusFilter("all")
              setProviderFilter("all")
              setSearchQuery("")
            }}
          />
        ) : (
          <PaymentTable
            payments={items}
            isLoading={isLoading}
            onInspect={handleInspect}
            onRefund={handleRefund}
            onReconcile={handleReconcile}
          />
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

      {/* 6. Modals & Slide-Over Drawers */}
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
