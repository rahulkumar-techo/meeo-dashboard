/**
 * @file page.tsx
 * @description System Security & Compliance Audit Logs Dashboard.
 * Connects directly to immutable forensic log endpoints (/api/v1/admin/audit-logs) with zero mock data.
 */

"use client"

import * as React from "react"
import {
  Download,
  RefreshCw,
  ShieldCheck,
  Filter,
  Search,
  Calendar,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  PageHeader,
  DataTableToolbar,
  DataTablePagination,
} from "@/components/common"
import {
  AuditMetrics,
  AuditLogTable,
  AuditLogDetailSheet,
  AuditGuideCard,
} from "@/components/audit-logs"
import { useAuditLogsQuery } from "@/hooks/use-audit-log-query"
import type { AuditLogItem } from "@/types/audit-log"

export default function AuditLogsPage() {
  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [entityTypeFilter, setEntityTypeFilter] = React.useState("ALL")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Modals state
  const [selectedLog, setSelectedLog] = React.useState<AuditLogItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // API Query
  const {
    data: auditData,
    isLoading,
    refetch,
    isRefetching,
  } = useAuditLogsQuery({
    entityType: entityTypeFilter !== "ALL" ? entityTypeFilter : undefined,
    action: debouncedSearch || undefined,
    page,
    limit: pageSize,
  })

  const logs = auditData?.items ?? []
  const pagination = auditData?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setEntityTypeFilter("ALL")
    setPage(1)
  }

  // Export JSON functionality
  const handleExportJSON = () => {
    if (logs.length === 0) return
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const activeFiltersCount =
    (entityTypeFilter !== "ALL" ? 1 : 0) + (searchQuery ? 1 : 0)

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Compliance Audit Trail & Administrative Ledger"
        badge="WORM Tamper-Evident"
        badgeVariant="success"
        description="Immutable, cryptographically signed ledger of all administrative mutations, permission escalations, refund approvals, and security events."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8.5 gap-1.5 text-xs font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            disabled={logs.length === 0}
            className="h-8.5 gap-1.5 text-xs font-medium"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export Evidence (JSON)</span>
          </Button>
        </div>
      </PageHeader>

      {/* 2. Operational Guide / Runbook */}
      <AuditGuideCard />

      {/* 3. KPI Metrics */}
      <AuditMetrics
        items={logs}
        totalCount={pagination.total}
        isLoading={isLoading}
      />

      {/* 4. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter by action (e.g. UPDATE_USER_ROLE, REFUND_ISSUED)..."
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={entityTypeFilter}
              onChange={(e) => {
                setEntityTypeFilter(e.target.value)
                setPage(1)
              }}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="ALL">All Entity Types</option>
              <option value="User">User</option>
              <option value="Role">Role</option>
              <option value="Payment">Payment</option>
              <option value="Order">Order</option>
              <option value="Inventory">Inventory</option>
              <option value="Coupon">Coupon</option>
            </select>
          </div>
        }
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
      />

      {/* 5. Interactive Audit Log Table */}
      <div className="space-y-3">
        <AuditLogTable
          logs={logs}
          isLoading={isLoading}
          onInspect={(log) => {
            setSelectedLog(log)
            setIsDetailOpen(true)
          }}
          onResetFilters={handleResetFilters}
        />

        {/* Pagination */}
        <DataTablePagination
          currentPage={pagination.page || page}
          totalPages={pagination.totalPages || 1}
          pageSize={pagination.limit || pageSize}
          totalItems={pagination.total || logs.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </div>

      {/* 6. Deep State Diff Inspector Sheet */}
      <AuditLogDetailSheet
        log={selectedLog}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
