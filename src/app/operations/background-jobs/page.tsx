/**
 * @file page.tsx
 * @description Background Jobs & Worker Fleet Observability Dashboard.
 * Connects directly to backend BullMQ Redis queues, worker pod telemetry, in-flight jobs, DLQ triggers, and bulk lifecycle actions.
 */

"use client"

import * as React from "react"
import {
  Trash2,
  RotateCcw,
  RefreshCw,
  Zap,
  Flame,
  Layers,
  Server,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PageHeader,
  DataTableToolbar,
  DataTablePagination,
  ConfirmDialog,
} from "@/components/common"
import {
  WorkerNodesTelemetry,
  JobMetrics,
  QueueHealthCards,
  JobTable,
  JobDetailSheet,
  BulkActionDialog,
  JobGuideCard,
} from "@/components/jobs"
import {
  useJobsOverviewQuery,
  useWorkersQuery,
  useJobsQuery,
  useRetryJobMutation,
  useCancelJobMutation,
  useBulkJobActionMutation,
} from "@/hooks/use-job-query"
import type {
  JobItem,
  JobCategory,
  JobOverviewQueue,
  BulkJobActionType,
} from "@/types/job"

export default function BackgroundJobsPage() {
  // Query parameters state
  const [activeCategory, setActiveCategory] = React.useState<string>("ALL")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Status Notification Banner
  const [bannerMessage, setBannerMessage] = React.useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  // Modals & Drawers state
  const [selectedJob, setSelectedJob] = React.useState<JobItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = React.useState(false)
  const [bulkDialogInitialAction, setBulkDialogInitialAction] =
    React.useState<BulkJobActionType>("RETRY_ALL_FAILED")
  const [confirmPurgeOpen, setConfirmPurgeOpen] = React.useState(false)

  // In-flight action trackers
  const [retryingId, setRetryingId] = React.useState<string | null>(null)
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Queries
  const {
    data: overview,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
    isRefetching: isOverviewRefetching,
  } = useJobsOverviewQuery()

  const {
    data: workers,
    isLoading: isWorkersLoading,
    refetch: refetchWorkers,
  } = useWorkersQuery()

  const {
    data: jobsData,
    isLoading: isJobsLoading,
    refetch: refetchJobs,
    isRefetching: isJobsRefetching,
  } = useJobsQuery({
    filter: activeCategory !== "ALL" ? activeCategory : undefined,
    queue: activeCategory !== "ALL" ? activeCategory : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
  })

  // Mutations
  const retryMutation = useRetryJobMutation()
  const cancelMutation = useCancelJobMutation()
  const bulkActionMutation = useBulkJobActionMutation()

  const rawJobs = jobsData?.items ?? []
  const pagination = jobsData?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
  }

  // 1. Dynamically aggregate and deduplicate all distinct queues from overview + loaded jobs
  const availableQueues: JobOverviewQueue[] = React.useMemo(() => {
    const queueMap = new Map<string, JobOverviewQueue>()

    // Merge from overview telemetry
    if (overview?.queues && Array.isArray(overview.queues)) {
      overview.queues.forEach((q) => {
        queueMap.set(q.name, {
          name: q.name,
          category: q.category || q.name,
          waiting: q.waiting || 0,
          active: q.active || 0,
          completed: q.completed || 0,
          failed: q.failed || 0,
          delayed: q.delayed || 0,
          status: q.status || "HEALTHY",
        })
      })
    }

    // Discover any additional dynamic queues from loaded jobs
    rawJobs.forEach((j) => {
      if (j.queue && !queueMap.has(j.queue)) {
        queueMap.set(j.queue, {
          name: j.queue,
          category: typeof j.category === "string" ? j.category : j.queue,
          waiting: (j.status || "").toUpperCase() === "WAITING" ? 1 : 0,
          active: (j.status || "").toUpperCase() === "ACTIVE" ? 1 : 0,
          completed: (j.status || "").toUpperCase() === "COMPLETED" ? 1 : 0,
          failed:
            (j.status || "").toUpperCase() === "FAILED" ||
            (j.status || "").toUpperCase() === "DEAD_LETTER"
              ? 1
              : 0,
          delayed: (j.status || "").toUpperCase() === "DELAYED" ? 1 : 0,
          status:
            (j.status || "").toUpperCase() === "FAILED" ||
            (j.status || "").toUpperCase() === "DEAD_LETTER"
              ? "DEGRADED"
              : "HEALTHY",
        })
      }
    })

    return Array.from(queueMap.values())
  }, [overview?.queues, rawJobs])

  // 2. Compute displayedJobs matching activeCategory (queue name, category, or DLQ)
  const displayedJobs = React.useMemo(() => {
    if (activeCategory === "ALL") return rawJobs
    if (activeCategory === "DEAD_LETTER_TRIGGER") {
      return rawJobs.filter(
        (j) =>
          (j.status || "").toUpperCase() === "DEAD_LETTER" ||
          j.category === "DEAD_LETTER_TRIGGER"
      )
    }
    const catLower = activeCategory.toLowerCase()
    const catUpper = activeCategory.toUpperCase()
    const filtered = rawJobs.filter(
      (j) =>
        (j.queue && j.queue.toLowerCase() === catLower) ||
        (j.category &&
          (j.category.toUpperCase() === catUpper ||
            j.category.toLowerCase() === catLower))
    )
    return filtered.length > 0 ? filtered : rawJobs
  }, [rawJobs, activeCategory])

  const showBanner = (type: "success" | "error", text: string) => {
    setBannerMessage({ type, text })
    setTimeout(() => {
      setBannerMessage((prev) => (prev?.text === text ? null : prev))
    }, 4000)
  }

  // Handle Manual Refresh
  const handleRefreshAll = () => {
    refetchOverview()
    refetchWorkers()
    refetchJobs()
    showBanner("success", "Telemetry and background jobs pipeline refreshed")
  }

  // Handle Single Job Retry
  const handleRetryJob = async (jobId: string) => {
    try {
      setRetryingId(jobId)
      const res = await retryMutation.mutateAsync(jobId)
      showBanner(
        "success",
        res.message || `Job ${jobId} reset and enqueued for execution`
      )
      refetchOverview()
      refetchJobs()
    } catch (err: any) {
      showBanner(
        "error",
        err?.response?.data?.message || err?.message || "Failed to retry job"
      )
    } finally {
      setRetryingId(null)
    }
  }

  // Handle Single Job Cancel
  const handleCancelJob = async (jobId: string) => {
    try {
      setCancellingId(jobId)
      const res = await cancelMutation.mutateAsync(jobId)
      showBanner(
        "success",
        res.message || `Job ${jobId} cancelled successfully`
      )
      refetchOverview()
      refetchJobs()
      if (selectedJob?.jobId === jobId || selectedJob?.id === jobId) {
        setIsDetailOpen(false)
      }
    } catch (err: any) {
      showBanner(
        "error",
        err?.response?.data?.message || err?.message || "Failed to cancel job"
      )
    } finally {
      setCancellingId(null)
    }
  }

  // Handle Bulk Actions
  const handleExecuteBulkAction = async (action: BulkJobActionType) => {
    try {
      const res = await bulkActionMutation.mutateAsync({ action })
      showBanner(
        "success",
        res.data?.message ||
          res.message ||
          `Action ${action} executed successfully`
      )
      setIsBulkDialogOpen(false)
      setConfirmPurgeOpen(false)
      refetchOverview()
      refetchJobs()
    } catch (err: any) {
      showBanner(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to execute bulk action"
      )
    }
  }

  // Reset Filters
  const handleResetFilters = () => {
    setActiveCategory("ALL")
    setStatusFilter("ALL")
    setSearchQuery("")
    setPage(1)
  }

  const activeFiltersCount =
    (activeCategory !== "ALL" ? 1 : 0) +
    (statusFilter !== "ALL" ? 1 : 0) +
    (searchQuery ? 1 : 0)

  const isRefreshing = isOverviewRefetching || isJobsRefetching

  const workerNodeCount =
    overview?.workerNodes?.totalNodes ?? workers?.length ?? 0
  const dlqDepth = overview?.summary?.deadLetterQueueDepth ?? 0

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Background Jobs & Worker Fleet"
        badge={`BullMQ Cluster (${workerNodeCount} Pod${workerNodeCount === 1 ? "" : "s"})`}
        badgeVariant="brand"
        description="Real-time BullMQ Redis scheduler, worker pod CPU/RAM telemetry, priority queue routing, and DLQ recovery."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="h-8.5 gap-1.5 text-xs font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          {dlqDepth > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmPurgeOpen(true)}
              className="h-8.5 gap-1.5 text-xs font-medium shadow-xs"
            >
              <Trash2 className="size-3.5" />
              <span>Purge DLQ ({dlqDepth})</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => {
              setBulkDialogInitialAction("RETRY_ALL_FAILED")
              setIsBulkDialogOpen(true)
            }}
            className="h-8.5 gap-1.5 text-xs font-medium bg-primary text-primary-foreground shadow-xs"
          >
            <Zap className="size-3.5" />
            <span>Bulk Actions</span>
          </Button>
        </div>
      </PageHeader>

      {/* Banner Feedback */}
      {bannerMessage && (
        <div
          className={`flex items-center justify-between rounded-lg p-3 text-xs border ${
            bannerMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMessage.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
            )}
            <span>{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 2. Operational Guide / Runbook */}
      <JobGuideCard />

      {/* 3. Live Worker Pods Telemetry */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Worker Nodes Health & Pod Utilization Telemetry
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Heartbeat: {overview?.timestamp ? new Date(overview.timestamp).toLocaleTimeString() : "Live"}
          </span>
        </div>
        <WorkerNodesTelemetry
          workers={workers}
          isLoading={isWorkersLoading}
        />
      </div>

      {/* 4. Real-time Overview KPIs */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Layers className="size-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Throughput & Queue Telemetry
          </h3>
        </div>
        <JobMetrics
          summary={overview?.summary}
          isLoading={isOverviewLoading}
        />
      </div>

      {/* 5. Dynamic Queue Health Cards */}
      {availableQueues.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              <span>Queue Fleet Telemetry & Backlog (Click Card to Filter)</span>
            </h4>
            <span className="text-[10px] font-mono text-muted-foreground">
              {availableQueues.length} Active Queue{availableQueues.length === 1 ? "" : "s"} Monitored
            </span>
          </div>
          <QueueHealthCards
            queues={availableQueues}
            selectedCategory={activeCategory}
            onSelectCategory={(cat) => {
              setActiveCategory(cat as string)
              setPage(1)
            }}
          />
        </div>
      )}

      {/* 6. Dynamic Queue Dropdown & Filter Hub */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Layers className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-foreground">
                  Queue Workload Selector
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                  {availableQueues.length} Available
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {activeCategory === "ALL"
                  ? "Showing jobs across all queues in cluster"
                  : `Filtered by queue: ${activeCategory.replace(/_/g, " ")}`}
              </p>
            </div>
          </div>

          {/* Dynamic Dropdown List */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(e) => {
                  setActiveCategory(e.target.value)
                  setPage(1)
                }}
                className="h-9 min-w-[210px] rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground shadow-2xs focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="ALL">
                  📦 All Queues ({pagination.total || rawJobs.length} Jobs)
                </option>
                {availableQueues.map((q) => (
                  <option key={q.name} value={q.name}>
                    ⚡ {q.name} {q.category ? `(${q.category.replace(/_/g, " ")})` : ""} {q.failed > 0 ? `• [${q.failed} Failed]` : ""}
                  </option>
                ))}
                <option value="DEAD_LETTER_TRIGGER">
                  🔥 Dead Letter Queue ({dlqDepth})
                </option>
              </select>
            </div>

            {activeCategory !== "ALL" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveCategory("ALL")
                  setPage(1)
                }}
                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1 border-border/80"
              >
                <X className="size-3.5" />
                <span>Clear</span>
              </Button>
            )}
          </div>
        </div>

        {/* 7. Filter Toolbar with Search and Status Filter */}
        <DataTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Filter jobs by ID, handler name, worker pod..."
          filters={
            <div className="flex flex-wrap items-center gap-2">
              {/* Secondary Queue Quick-Select for Table */}
              <select
                value={activeCategory}
                onChange={(e) => {
                  setActiveCategory(e.target.value)
                  setPage(1)
                }}
                className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden"
              >
                <option value="ALL">All Queues ({availableQueues.length})</option>
                {availableQueues.map((q) => (
                  <option key={q.name} value={q.name}>
                    {q.name}
                  </option>
                ))}
                <option value="DEAD_LETTER_TRIGGER">Dead Letter ({dlqDepth})</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="WAITING">WAITING</option>
                <option value="DELAYED">DELAYED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
                <option value="DEAD_LETTER">DEAD LETTER</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          }
          activeFiltersCount={activeFiltersCount}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* 8. Interactive Jobs Table */}
      <div className="space-y-3">
        <JobTable
          jobs={displayedJobs}
          isLoading={isJobsLoading}
          onInspect={(job) => {
            setSelectedJob(job)
            setIsDetailOpen(true)
          }}
          onRetry={handleRetryJob}
          onCancel={handleCancelJob}
          isRetryingId={retryingId}
          isCancellingId={cancellingId}
          onResetFilters={handleResetFilters}
        />

        {/* Pagination */}
        <DataTablePagination
          currentPage={pagination.page || page}
          totalPages={pagination.totalPages || 1}
          pageSize={pagination.limit || pageSize}
          totalItems={pagination.total || rawJobs.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </div>

      {/* 9. Deep Inspection Detail Sheet */}
      <JobDetailSheet
        job={selectedJob}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onRetry={handleRetryJob}
        onCancel={handleCancelJob}
        isRetrying={Boolean(retryingId && retryingId === (selectedJob?.jobId || selectedJob?.id))}
        isCancelling={Boolean(cancellingId && cancellingId === (selectedJob?.jobId || selectedJob?.id))}
      />

      {/* 10. Bulk Queue Action Dialog */}
      <BulkActionDialog
        open={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        initialAction={bulkDialogInitialAction}
        onExecute={handleExecuteBulkAction}
        isSubmitting={bulkActionMutation.isPending}
      />

      {/* 11. Confirm Purge DLQ Dialog */}
      <ConfirmDialog
        open={confirmPurgeOpen}
        onOpenChange={setConfirmPurgeOpen}
        title="Purge Dead Letter Queue"
        description="Are you sure you want to permanently purge all unrecoverable jobs from the Dead Letter Queue? This action cannot be undone."
        confirmLabel="Purge Dead Letters"
        variant="destructive"
        onConfirm={() => handleExecuteBulkAction("PURGE_DEAD_LETTER")}
        loading={bulkActionMutation.isPending}
      />
    </div>
  )
}
