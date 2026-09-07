/**
 * @file page.tsx
 * @description RMA Returns, Refunds & Chargeback Arbitration Console (< 220 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { RotateCcw, Download, Eye, CheckCircle2, Ban } from "lucide-react"
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
  DetailDrawer,
} from "@/components/common"
import { REFUND_QUEUE_DATA, RefundItem } from "@/data/refunds"

export default function RefundsPage() {
  const [refunds, setRefunds] = React.useState<RefundItem[]>(REFUND_QUEUE_DATA)
  const [selectedRefund, setSelectedRefund] = React.useState<RefundItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredRefunds = React.useMemo(() => {
    return refunds.filter((r) => {
      if (statusFilter !== "all" && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          r.id.toLowerCase().includes(q) ||
          r.orderId.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [refunds, statusFilter, searchQuery])

  const handleApprove = (id: string) => {
    setRefunds((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Settled" } : r)))
    setIsDrawerOpen(false)
  }

  const handleDecline = (id: string) => {
    setRefunds((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Declined" } : r)))
    setIsDrawerOpen(false)
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Refunds, RMA Returns & Chargebacks"
        badge="Arbitration Desk (3 Pending)"
        badgeVariant="brand"
        description="Process reverse logistics RMA returns, instant store credit bonuses, Visa/Mastercard dispute responses, and automated refund thresholds."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export RMA Log (CSV)</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Pending RMA Queue", value: "3 Claims", colorTheme: "amber", badge: { text: "1 SLA Urgent", variant: "warning" }, footnote: "Avg resolution: 4.2h" },
          { title: "Monthly Refund Rate", value: "0.84%", colorTheme: "emerald", trend: { value: "-0.12%", isPositive: true }, footnote: "Benchmark target: < 1.5%" },
          { title: "Total Refunded (30D)", value: "$4,280.50", colorTheme: "indigo", footnote: "34 transactions" },
          { title: "Chargeback Win Rate", value: "88.4%", colorTheme: "cyan", badge: { text: "Low Risk", variant: "success" }, footnote: "Evidence automated" },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter by RMA ID, Order ID, customer name, reason..."
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
          >
            <option value="all">All RMA Statuses</option>
            <option value="pending">Pending</option>
            <option value="under dispute">Under Dispute</option>
            <option value="settled">Settled</option>
            <option value="declined">Declined</option>
          </select>
        }
        activeFiltersCount={statusFilter !== "all" ? 1 : 0}
        onResetFilters={() => { setStatusFilter("all"); setSearchQuery("") }}
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredRefunds.length === 0 ? (
          <EmptyState
            title="No Refunds Found"
            description="No refund records match your search criteria."
            actionLabel="Reset Filters"
            onAction={() => { setStatusFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">RMA ID</TableHead>
                  <TableHead className="font-bold">ORDER REF</TableHead>
                  <TableHead className="font-bold">CUSTOMER</TableHead>
                  <TableHead className="font-bold">REASON</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">SLA TIMER</TableHead>
                  <TableHead className="font-bold text-right">AMOUNT</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredRefunds.map((ref) => (
                  <TableRow
                    key={ref.id}
                    onClick={() => { setSelectedRefund(ref); setIsDrawerOpen(true) }}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{ref.id}</TableCell>
                    <TableCell className="font-mono font-medium"><Link href="/orders" onClick={(e) => e.stopPropagation()} className="hover:underline">{ref.orderId}</Link></TableCell>
                    <TableCell><p className="font-semibold text-foreground">{ref.customer}</p><p className="text-[10.5px] text-muted-foreground">{ref.email}</p></TableCell>
                    <TableCell><p className="font-medium">{ref.reason}</p><p className="text-[10.5px] text-muted-foreground line-clamp-1">{ref.reasonDetail}</p></TableCell>
                    <TableCell><StatusBadge status={ref.status.toLowerCase()} showDot /></TableCell>
                    <TableCell><span className={`font-mono text-xs ${ref.slaUrgent ? "font-bold text-rose-600" : "text-muted-foreground"}`}>{ref.slaTimer}</span></TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">{ref.amount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedRefund(ref); setIsDrawerOpen(true) }} className="h-7 px-2 text-xs">
                        <Eye className="mr-1 size-3.5" /> Inspect
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
          totalItems={filteredRefunds.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 5. Detail Drawer */}
      {selectedRefund && (
        <DetailDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          size="lg"
          title={<div className="flex items-center gap-2"><span>RMA {selectedRefund.id}</span><StatusBadge status={selectedRefund.status.toLowerCase()} /></div>}
          description={`Order ${selectedRefund.orderId} • ${selectedRefund.gateway}`}
          footer={
            <div className="flex w-full justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => handleDecline(selectedRefund.id)} className="h-8 text-xs text-rose-600">
                <Ban className="mr-1.5 size-3.5" /> Decline Request
              </Button>
              <Button size="sm" onClick={() => handleApprove(selectedRefund.id)} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="mr-1.5 size-3.5" /> Authorize Full Refund ({selectedRefund.amount})
              </Button>
            </div>
          }
        >
          <div className="rounded-lg border border-border/70 bg-card/60 p-4 space-y-3 text-xs">
            <div className="flex justify-between font-semibold"><span className="text-muted-foreground">Reason:</span><span>{selectedRefund.reason}</span></div>
            <p className="text-muted-foreground leading-relaxed">{selectedRefund.reasonDetail}</p>
            <div className="border-t border-border/60 pt-2 flex justify-between"><span className="text-muted-foreground">Tracking Number:</span><span className="font-mono">{selectedRefund.trackingNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Warehouse Station:</span><span>{selectedRefund.warehouseStation}</span></div>
          </div>
        </DetailDrawer>
      )}
    </div>
  )
}
