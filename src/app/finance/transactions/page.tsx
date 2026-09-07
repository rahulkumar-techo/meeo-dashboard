/**
 * @file page.tsx
 * @description Real-Time Financial Transactions & Ledger Console (< 220 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Download, Plus, Eye } from "lucide-react"
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
import {
  TransactionDetailModal,
  TransactionRecord,
} from "@/components/modules/finance"
import {
  FINANCE_TRANSACTIONS,
  ExtendedTransaction,
} from "@/data/finance"

export default function TransactionsPage() {
  const [transactions, setTransactions] = React.useState<ExtendedTransaction[]>(FINANCE_TRANSACTIONS)
  const [selectedTxn, setSelectedTxn] = React.useState<ExtendedTransaction | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [gatewayFilter, setGatewayFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Filter transactions
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      if (gatewayFilter !== "all" && t.gateway.toLowerCase() !== gatewayFilter.toLowerCase())
        return false
      if (statusFilter !== "all" && t.status.toLowerCase() !== statusFilter.toLowerCase())
        return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          t.id.toLowerCase().includes(q) ||
          t.orderId.toLowerCase().includes(q) ||
          t.customer.name.toLowerCase().includes(q) ||
          t.customer.email.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [transactions, gatewayFilter, statusFilter, searchQuery])

  const handleInspect = (txn: ExtendedTransaction) => {
    setSelectedTxn(txn)
    setIsModalOpen(true)
  }

  const handleRefund = (txn: TransactionRecord) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txn.id
          ? {
              ...t,
              status: "refunded",
              amount: typeof t.amount === "number" ? -Math.abs(t.amount) : t.amount,
              isPositive: false,
            }
          : t
      )
    )
    setIsModalOpen(false)
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Double-Entry Financial Transactions & Ledger"
        badge="Reconciled (Continuous)"
        badgeVariant="success"
        description="Immutable double-entry financial journal, automated gateway fee audits, dispute protection, and multi-rail settlement clearing."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export General Ledger (CSV)</span>
        </Button>
        <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>Manual Journal Entry</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Gross Settled Volume (30D)", value: "$1,248,320.50", colorTheme: "emerald", trend: { value: "+18.4%", isPositive: true }, footnote: "Reconciliation match: 100%" },
          { title: "Gateway Fees Incurred", value: "$31,208.01", colorTheme: "amber", badge: { text: "2.5% Blended", variant: "warning" }, footnote: "Optimal interchange tier" },
          { title: "Pending Batch Payouts", value: "$42,190.00", colorTheme: "indigo", badge: { text: "Clearing in 6h", variant: "outline" }, footnote: "Stripe ACH Transfer" },
          { title: "Dispute / Chargeback Rate", value: "0.02%", colorTheme: "cyan", badge: { text: "Visa Threshold: 0.90%", variant: "success" }, footnote: "3D Secure protected" },
        ]}
      />

      {/* 3. Toolbar & Filters */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search txn ID, order ID, customer name, email..."
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Gateways</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        }
        activeFiltersCount={(gatewayFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
        onResetFilters={() => { setGatewayFilter("all"); setStatusFilter("all"); setSearchQuery("") }}
      />

      {/* 4. Transactions Data Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredTransactions.length === 0 ? (
          <EmptyState
            title="No Transactions Found"
            description="No transaction ledger entries match your filter criteria."
            actionLabel="Reset Filters"
            onAction={() => { setGatewayFilter("all"); setStatusFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">TXN ID</TableHead>
                  <TableHead className="font-bold">CUSTOMER</TableHead>
                  <TableHead className="font-bold">ORDER REF</TableHead>
                  <TableHead className="font-bold">GATEWAY</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-right">GROSS</TableHead>
                  <TableHead className="font-bold text-right">NET</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredTransactions.map((txn) => (
                  <TableRow
                    key={txn.id}
                    onClick={() => handleInspect(txn)}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{txn.id}</TableCell>
                    <TableCell><div><p className="font-semibold">{txn.customer.name}</p><p className="text-[10.5px] text-muted-foreground">{txn.customer.email}</p></div></TableCell>
                    <TableCell className="font-mono font-medium text-foreground"><Link href="/orders" onClick={(e) => e.stopPropagation()} className="hover:underline">{txn.orderId}</Link></TableCell>
                    <TableCell><span className="capitalize">{txn.gateway}</span> <span className="text-[11px] text-muted-foreground font-mono">({txn.railDetail})</span></TableCell>
                    <TableCell><StatusBadge status={txn.status} showDot /></TableCell>
                    <TableCell className={`text-right font-mono font-bold ${txn.isPositive ? "text-foreground" : "text-rose-600"}`}>{typeof txn.amount === "number" ? `${txn.isPositive ? "+" : ""}$${Math.abs(txn.amount).toFixed(2)}` : txn.amount}</TableCell>
                    <TableCell className={`text-right font-mono font-bold ${txn.isPositive ? "text-emerald-600" : "text-rose-600"}`}>{txn.settlementAmount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleInspect(txn) }} className="h-7 px-2 text-xs">
                        <Eye className="mr-1 size-3.5" /> Audit
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
          totalItems={filteredTransactions.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 5. Transaction Detail Audit Modal */}
      <TransactionDetailModal
        transaction={selectedTxn}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onRefund={handleRefund}
      />
    </div>
  )
}
