/**
 * @file page.tsx
 * @description Central Transactional Outbox & Background Jobs Operations Console.
 * Directly integrates with Admin Outbox API (GET /api/v1/outbox/events, GET /metrics, POST /publish-now, POST /events/:id/retry, GET /processed).
 */

"use client"

import * as React from "react"
import { Play, RotateCcw, RefreshCw, ShieldCheck, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  PageHeader,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import {
  OutboxMetrics,
  OutboxGuideCard,
  OutboxTable,
  OutboxDetailSheet,
  PublishNowDialog,
  ProcessedIdempotencyModal,
} from "@/components/outbox"
import {
  useOutboxEventsQuery,
  useOutboxMetricsQuery,
  useRetryOutboxEventMutation,
} from "@/hooks/use-outbox-query"
import type { OutboxEventItem, OutboxEventStatus } from "@/types/outbox"

export default function OutboxOperationsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [aggregateFilter, setAggregateFilter] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Modals state
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = React.useState(false)
  const [idempotencyModalOpen, setIdempotencyModalOpen] = React.useState(false)

  // Queries
  const {
    data: outboxData,
    isLoading: isEventsLoading,
    isFetching: isEventsFetching,
    refetch: refetchEvents,
  } = useOutboxEventsQuery({
    page,
    limit: pageSize,
    status: statusFilter !== "all" ? statusFilter : undefined,
    aggregateType: aggregateFilter !== "all" ? aggregateFilter : undefined,
    eventType: searchQuery.trim() || undefined,
  })

  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useOutboxMetricsQuery()

  const retryMutation = useRetryOutboxEventMutation()

  const items = outboxData?.items ?? []
  const totalPages = outboxData?.pagination?.totalPages ?? 1
  const totalItems = outboxData?.pagination?.total ?? items.length

  const handleInspect = (event: OutboxEventItem) => {
    setSelectedEventId(event.id)
    setDetailSheetOpen(true)
  }

  const handleRetry = async (event: OutboxEventItem) => {
    await retryMutation.mutateAsync(event.id)
    refetchEvents()
    refetchMetrics()
  }

  const handleExportCSV = () => {
    if (items.length === 0) return
    const headers = [
      "Event ID",
      "Event Type",
      "Aggregate Type",
      "Aggregate ID",
      "Status",
      "Attempts",
      "Max Attempts",
      "Locked By",
      "Published At",
      "Created At",
    ]
    const rows = items.map((e) => [
      e.id,
      e.eventType,
      e.aggregateType,
      e.aggregateId,
      e.status,
      e.attempts,
      e.maxAttempts,
      e.lockedBy ?? "",
      e.publishedAt ? new Date(e.publishedAt).toISOString() : "",
      new Date(e.createdAt).toISOString(),
    ])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `outbox_events_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Transactional Outbox & Background Jobs"
        badge="BullMQ + Redis"
        badgeVariant="brand"
        description="Transactional dual-write prevention, distributed poller locks, BullMQ queue streams, and dead-letter queue (DLQ) recovery."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchEvents()
              refetchMetrics()
            }}
            disabled={isEventsFetching}
            className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
          >
            <RefreshCw
              className={`size-3.5 text-muted-foreground ${
                isEventsFetching ? "animate-spin text-indigo-500" : ""
              }`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIdempotencyModalOpen(true)}
            className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
          >
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Idempotency Audit</span>
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

          <Button
            size="sm"
            onClick={() => setPublishDialogOpen(true)}
            className="h-8.5 gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Play className="size-3.5" />
            <span>Publish Batch Now</span>
          </Button>
        </div>
      </PageHeader>

      {/* 2. Live Metrics */}
      <OutboxMetrics metricsData={metricsData} isLoading={isMetricsLoading} />

      {/* 3. Outbox Architecture Guide */}
      <OutboxGuideCard />

      {/* 4. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Event Type (e.g. ORDER_CONFIRMED, PAYMENT_SUCCEEDED)..."
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
              <option value="all">All Event Statuses</option>
              <option value="PUBLISHED">Published (Enqueued)</option>
              <option value="PENDING">Pending Poller</option>
              <option value="PROCESSING">Processing (Lock Claimed)</option>
              <option value="FAILED">Failed / Dead-Letter (DLQ)</option>
            </select>

            {/* Aggregate Filter */}
            <select
              value={aggregateFilter}
              onChange={(e) => {
                setAggregateFilter(e.target.value)
                setPage(1)
              }}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Aggregates</option>
              <option value="Order">Order Aggregate</option>
              <option value="Payment">Payment Aggregate</option>
              <option value="Product">Product Aggregate</option>
              <option value="Inventory">Inventory Aggregate</option>
              <option value="User">User Aggregate</option>
            </select>
          </div>
        }
        activeFiltersCount={
          (statusFilter !== "all" ? 1 : 0) + (aggregateFilter !== "all" ? 1 : 0)
        }
        onResetFilters={() => {
          setStatusFilter("all")
          setAggregateFilter("all")
          setSearchQuery("")
          setPage(1)
        }}
      />

      {/* 5. Outbox Events Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {!isEventsLoading && items.length === 0 ? (
          <EmptyState
            title="No Outbox Events Found"
            description="No transactional outbox records matched your active query filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setStatusFilter("all")
              setAggregateFilter("all")
              setSearchQuery("")
            }}
          />
        ) : (
          <OutboxTable
            events={items}
            isLoading={isEventsLoading}
            onInspect={handleInspect}
            onRetry={handleRetry}
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
      <OutboxDetailSheet
        eventId={selectedEventId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onRetrySuccess={() => {
          refetchEvents()
          refetchMetrics()
        }}
      />

      <PublishNowDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        onSuccess={() => {
          refetchEvents()
          refetchMetrics()
        }}
      />

      <ProcessedIdempotencyModal
        open={idempotencyModalOpen}
        onOpenChange={setIdempotencyModalOpen}
      />
    </div>
  )
}
