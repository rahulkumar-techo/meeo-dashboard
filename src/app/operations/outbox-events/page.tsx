/**
 * @file page.tsx
 * @description Outbox Operations & Reliability Triage Page (< 200 lines).
 */

"use client"

import * as React from "react"
import { RotateCcw, Check, Eye } from "lucide-react"
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
  OutboxPayloadDrawer,
  OutboxEventRecord,
} from "@/components/modules/operations"
import {
  OPERATIONS_OUTBOX_EVENTS,
  OutboxEventData,
} from "@/data/operations"

export default function OutboxOperationsPage() {
  const [events, setEvents] = React.useState<OutboxEventData[]>(OPERATIONS_OUTBOX_EVENTS)
  const [selectedEvent, setSelectedEvent] = React.useState<OutboxEventData | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [aggregateFilter, setAggregateFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Filter events
  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      if (aggregateFilter !== "all" && e.aggregateType !== aggregateFilter) return false
      if (statusFilter !== "all" && e.status !== statusFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          e.id.toLowerCase().includes(q) ||
          e.aggregateId.toLowerCase().includes(q) ||
          e.eventName.toLowerCase().includes(q) ||
          e.idempotencyKey.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [events, aggregateFilter, statusFilter, searchQuery])

  // Replay event handler
  const handleReplayEvent = (eventRecord: OutboxEventRecord) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventRecord.id) {
          return {
            ...e,
            status: "published",
            nextRetryOrLatency: "12ms (Replayed)",
            attempts: "1 / 3",
            errorMessage: undefined,
            failureReason: undefined,
            stackTrace: undefined,
          }
        }
        return e
      })
    )
    setIsDrawerOpen(false)
  }

  const handleInspect = (event: OutboxEventData) => {
    setSelectedEvent(event)
    setIsDrawerOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Outbox Events & Reliability Triage"
        badge="Live Dispatcher (248 evt/min)"
        badgeVariant="success"
        description="Transactional outbox pattern event stream, CDC replication lag, webhook fanouts, idempotency locks, and unrecoverable DLQ replay."
      >
        <Button
          size="sm"
          onClick={() => {
            const firstFailed = events.find((e) => e.status === "failed")
            if (firstFailed) handleReplayEvent(firstFailed)
          }}
          className="h-8.5 gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs text-xs"
        >
          <RotateCcw className="size-3.5" />
          Dead-Letter Replay (Bulk)
        </Button>
        <Button variant="outline" size="sm" className="h-8.5 gap-2 text-xs">
          <Check className="size-3.5" />
          Clear Resolved
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={5}
        items={[
          { title: "Pending Events", value: "14", colorTheme: "indigo", badge: { text: "Normal", variant: "outline" }, footnote: "buffer 1.2%" },
          { title: "In-Flight Workers", value: "8 / 12", colorTheme: "emerald", badge: { text: "Healthy", variant: "success" }, footnote: "66.7% capacity" },
          { title: "Published (1hr)", value: "14,892", colorTheme: "indigo", trend: { value: "+12.4%", isPositive: true }, footnote: "avg 248/min" },
          { title: "P99 Dispatch Latency", value: "28ms", colorTheme: "emerald", badge: { text: "Target < 50ms", variant: "success" }, footnote: "CDC lag: 4ms" },
          { title: "Dead Letter Queue", value: "1", colorTheme: "rose", badge: { text: "Action Req", variant: "destructive" }, footnote: "Needs manual replay" },
        ]}
      />

      {/* 3. Toolbar & Filters */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter by Event ID, Aggregate ID, Event Name, Idempotency..."
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={aggregateFilter}
              onChange={(e) => setAggregateFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Aggregates</option>
              <option value="Order">Order</option>
              <option value="Payment">Payment</option>
              <option value="Inventory">Inventory</option>
              <option value="Customer">Customer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="processing">Processing</option>
              <option value="retrying">Retrying</option>
              <option value="failed">Failed / DLQ</option>
            </select>
          </div>
        }
        activeFiltersCount={(aggregateFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
        onResetFilters={() => { setAggregateFilter("all"); setStatusFilter("all"); setSearchQuery("") }}
      />

      {/* 4. Events Data Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No Outbox Events Found"
            description="No events match your selected filters. Try resetting the search or filter criteria."
            actionLabel="Reset Filters"
            onAction={() => { setAggregateFilter("all"); setStatusFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">EVENT ID</TableHead>
                  <TableHead className="font-bold">AGGREGATE</TableHead>
                  <TableHead className="font-bold">EVENT TYPE</TableHead>
                  <TableHead className="font-bold">ATTEMPTS</TableHead>
                  <TableHead className="font-bold">LATENCY / RETRY</TableHead>
                  <TableHead className="font-bold">CREATED</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredEvents.map((evt) => (
                  <TableRow
                    key={evt.id}
                    onClick={() => handleInspect(evt)}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <TableCell><StatusBadge status={evt.status} showDot /></TableCell>
                    <TableCell className="font-mono font-medium text-foreground">{evt.id}</TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{evt.aggregateType}</span>
                      <span className="ml-1 text-[11px] font-mono text-muted-foreground">({evt.aggregateId})</span>
                    </TableCell>
                    <TableCell className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">{evt.eventName}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{evt.attempts}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{evt.nextRetryOrLatency}</TableCell>
                    <TableCell className="text-muted-foreground">{evt.timestamp}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleInspect(evt) }} className="h-7 px-2 text-xs">
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
          totalItems={filteredEvents.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 5. Slide-Over Event Payload Drawer */}
      <OutboxPayloadDrawer
        event={selectedEvent}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onReplayEvent={handleReplayEvent}
      />
    </div>
  )
}
