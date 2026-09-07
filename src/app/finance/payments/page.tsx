/**
 * @file page.tsx
 * @description Payment Gateway Settlements & Failed Intent Triage Console (< 220 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Download, CreditCard, RotateCcw, AlertTriangle } from "lucide-react"
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
  StatusBadge,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import { PAYMENTS_LIST_DATA, PaymentIntentRecord } from "@/data/payments"

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState<PaymentIntentRecord[]>(PAYMENTS_LIST_DATA)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredPayments = React.useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status.toLowerCase() !== statusFilter.toLowerCase()) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          p.id.toLowerCase().includes(q) ||
          p.orderId.toLowerCase().includes(q) ||
          p.customer.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [payments, statusFilter, searchQuery])

  const handleRetryPayment = (id: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "succeeded", statusLabel: "Captured (Smart Retry)" } : p
      )
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Payment Gateways & Failed Intent Triage"
        badge="Stripe · PayPal · Apple Pay"
        badgeVariant="brand"
        description="Automated dunning retries, card decline triage, multi-gateway fee optimization, and 3D Secure verification monitoring."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Payouts (CSV)</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Gateway Authorization Rate", value: "98.8%", colorTheme: "emerald", trend: { value: "+0.4%", isPositive: true }, footnote: "Stripe Radar ML active" },
          { title: "Failed Payment Volume (Today)", value: "5 Orders ($412.00)", colorTheme: "rose", badge: { text: "Action Req", variant: "destructive" }, footnote: "Auto-retry recovering 64%" },
          { title: "Blended Processing Cost", value: "2.42%", colorTheme: "indigo", footnote: "Interchange optimized" },
          { title: "Pending Gateway Payout", value: "$42,190.00", colorTheme: "cyan", footnote: "Depositing in 6 hours" },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search payment ID, order ID, customer name..."
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
          >
            <option value="all">All Intent Statuses</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed / Declined</option>
          </select>
        }
        activeFiltersCount={statusFilter !== "all" ? 1 : 0}
        onResetFilters={() => { setStatusFilter("all"); setSearchQuery("") }}
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredPayments.length === 0 ? (
          <EmptyState
            title="No Payment Records Found"
            description="No payment intent records matched your search."
            actionLabel="Reset Filters"
            onAction={() => { setStatusFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">INTENT ID</TableHead>
                  <TableHead className="font-bold">ORDER REF</TableHead>
                  <TableHead className="font-bold">CUSTOMER</TableHead>
                  <TableHead className="font-bold">METHOD / CARD</TableHead>
                  <TableHead className="font-bold">GATEWAY</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-right">GROSS</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredPayments.map((pay) => (
                  <TableRow key={pay.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{pay.id}</TableCell>
                    <TableCell className="font-mono font-medium"><Link href="/orders" className="hover:underline">{pay.orderId}</Link></TableCell>
                    <TableCell className="font-semibold">{pay.customer}</TableCell>
                    <TableCell>{pay.method} {pay.cardLast4 !== "N/A" ? `•••• ${pay.cardLast4}` : ""}</TableCell>
                    <TableCell className="font-medium">{pay.gateway}</TableCell>
                    <TableCell><StatusBadge status={pay.status} label={pay.statusLabel} showDot /></TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">{pay.grossAmount}</TableCell>
                    <TableCell className="text-right">
                      {pay.status === "failed" && (
                        <Button size="sm" onClick={() => handleRetryPayment(pay.id)} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                          <RotateCcw className="mr-1 size-3" /> Retry Charge
                        </Button>
                      )}
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
          totalItems={filteredPayments.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  )
}
