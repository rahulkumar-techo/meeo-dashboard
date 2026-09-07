/**
 * @file page.tsx
 * @description Background Worker Clusters & Job Pipeline (< 220 lines).
 */

"use client"

import * as React from "react"
import { Trash2, RotateCcw, Eye } from "lucide-react"
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
  ConfirmDialog,
} from "@/components/common"
import { WorkerHealthCard } from "@/components/modules/operations"
import {
  OPERATIONS_WORKERS,
  OPERATIONS_JOBS,
  BackgroundJobData,
} from "@/data/operations"

export default function BackgroundJobsPage() {
  const [jobs, setJobs] = React.useState<BackgroundJobData[]>(OPERATIONS_JOBS)
  const [selectedJob, setSelectedJob] = React.useState<BackgroundJobData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [queueFilter, setQueueFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Filter jobs
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((j) => {
      if (queueFilter !== "all" && j.queue !== queueFilter) return false
      if (statusFilter !== "all" && j.status !== statusFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          j.id.toLowerCase().includes(q) ||
          j.handler.toLowerCase().includes(q) ||
          j.workerNode.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [jobs, queueFilter, statusFilter, searchQuery])

  // Replay job
  const handleReplayJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "running",
              runtime: "10ms",
              attempts: "1/3",
              errorReason: undefined,
              stackTrace: undefined,
            }
          : j
      )
    )
    setIsDetailOpen(false)
  }

  const handlePurgeFailed = () => {
    setJobs((prev) => prev.filter((j) => j.status !== "failed"))
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <PageHeader
        title="Background Jobs & Worker Fleet"
        badge="BullMQ Cluster (14 Workers)"
        badgeVariant="brand"
        description="Real-time Redis job scheduler, concurrency throttle, priority queues, and unrecoverable DLQ recovery."
      >
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setIsPurgeConfirmOpen(true)}
          className="h-8.5 gap-2 text-xs font-medium"
        >
          <Trash2 className="size-3.5" />
          Purge Dead Letter Queue
        </Button>
      </PageHeader>

      {/* 2. Worker Nodes Health */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
          Worker Node Health & Utilization
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {OPERATIONS_WORKERS.map((worker) => (
            <WorkerHealthCard key={worker.id} worker={worker} />
          ))}
        </div>
      </div>

      {/* 3. Job Stats Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Active Jobs In-Flight", value: "14", colorTheme: "indigo", badge: { text: "Throttled", variant: "outline" }, footnote: "Concurrency limit: 24" },
          { title: "Jobs Processed (24h)", value: "248,190", colorTheme: "emerald", trend: { value: "+8.4%", isPositive: true }, footnote: "99.98% success rate" },
          { title: "Avg Execution Latency", value: "142ms", colorTheme: "cyan", badge: { text: "Optimal", variant: "success" }, footnote: "P99: 890ms" },
          { title: "Dead Letter Queue (DLQ)", value: "1", colorTheme: "rose", badge: { text: "Needs Action", variant: "destructive" }, footnote: "SyncFedExTracking timeout" },
        ]}
      />

      {/* 4. Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter jobs by ID, handler name, worker pod..."
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={queueFilter}
              onChange={(e) => setQueueFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Queues</option>
              <option value="critical-checkout">critical-checkout (P0)</option>
              <option value="order-fulfillment-sync">order-fulfillment-sync (P10)</option>
              <option value="marketing-email-batch">marketing-email-batch (P20)</option>
              <option value="dead-letter-triage">dead-letter-triage</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="retrying">Retrying</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        }
        activeFiltersCount={(queueFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
        onResetFilters={() => { setQueueFilter("all"); setStatusFilter("all"); setSearchQuery("") }}
      />

      {/* 5. Jobs Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredJobs.length === 0 ? (
          <EmptyState
            title="No Jobs Found"
            description="No jobs match your search or filter options."
            actionLabel="Reset Filters"
            onAction={() => { setQueueFilter("all"); setStatusFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">JOB ID</TableHead>
                  <TableHead className="font-bold">HANDLER</TableHead>
                  <TableHead className="font-bold">QUEUE</TableHead>
                  <TableHead className="font-bold">WORKER</TableHead>
                  <TableHead className="font-bold">RUNTIME</TableHead>
                  <TableHead className="font-bold">ATTEMPTS</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredJobs.map((job) => (
                  <TableRow
                    key={job.id}
                    onClick={() => { setSelectedJob(job); setIsDetailOpen(true) }}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <TableCell><StatusBadge status={job.status} showDot /></TableCell>
                    <TableCell className="font-mono font-medium text-foreground">{job.id}</TableCell>
                    <TableCell className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">{job.handler}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{job.queue}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{job.workerNode}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{job.runtime}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{job.attempts}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedJob(job); setIsDetailOpen(true) }} className="h-7 px-2 text-xs">
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
          totalItems={filteredJobs.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 6. Job Detail Drawer */}
      {selectedJob && (
        <DetailDrawer
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          size="xl"
          title={
            <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
              <span>{selectedJob.handler}</span>
              <StatusBadge status={selectedJob.status} showDot />
            </div>
          }
          description={`Job ID: ${selectedJob.id} • Worker: ${selectedJob.workerNode} (PID ${selectedJob.pid})`}
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">Priority: {selectedJob.priority}</span>
              {selectedJob.status === "failed" && (
                <Button size="sm" onClick={() => handleReplayJob(selectedJob.id)} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                  <RotateCcw className="mr-1.5 size-3.5" /> Retry Job Now
                </Button>
              )}
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-card/60 p-3.5 text-xs">
            <div><span className="text-muted-foreground text-[11px]">Queue:</span><p className="font-mono font-medium text-foreground">{selectedJob.queue}</p></div>
            <div><span className="text-muted-foreground text-[11px]">Started:</span><p className="font-medium text-foreground">{selectedJob.startedAgo}</p></div>
            <div><span className="text-muted-foreground text-[11px]">Runtime:</span><p className="font-mono text-foreground">{selectedJob.runtime}</p></div>
            <div><span className="text-muted-foreground text-[11px]">Memory:</span><p className="font-mono text-foreground">{selectedJob.memory}</p></div>
          </div>

          {selectedJob.errorReason && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <p className="font-semibold">Execution Exception:</p>
              <p className="font-mono text-[11px] mt-0.5">{selectedJob.errorReason}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-foreground mb-1.5">Job Payload Arguments</p>
            <pre className="max-h-48 overflow-auto rounded-lg border border-border/80 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-100 dark:bg-zinc-900">
              <code>{JSON.stringify(selectedJob.args, null, 2)}</code>
            </pre>
          </div>
        </DetailDrawer>
      )}

      {/* 7. Confirm Dialog for Purge */}
      <ConfirmDialog
        open={isPurgeConfirmOpen}
        onOpenChange={setIsPurgeConfirmOpen}
        title="Purge Dead Letter Queue"
        description="Are you sure you want to discard all failed background jobs? This action is permanent and unrecoverable."
        confirmLabel="Purge Dead Letters"
        variant="destructive"
        onConfirm={handlePurgeFailed}
      />
    </div>
  )
}
