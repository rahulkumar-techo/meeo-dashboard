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
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
  })

  // Mutations
  const retryMutation = useRetryJobMutation()
  const cancelMutation = useCancelJobMutation()
  const bulkActionMutation = useBulkJobActionMutation()

  const jobs = jobsData?.items ?? []
  const pagination = jobsData?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
  }

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

      {/* 5. Queue Backlog Cards */}
      {overview?.queues && overview.queues.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Queue Health & Backlogs (Click to Filter)
          </h4>
          <QueueHealthCards
            queues={overview.queues}
            selectedCategory={activeCategory}
            onSelectCategory={(cat) => {
              setActiveCategory(cat as string)
              setPage(1)
            }}
          />
        </div>
      )}

      {/* 6. Queue Category Filter Tabs */}
      <div className="space-y-3">
        <Tabs
          value={activeCategory}
          onValueChange={(val) => {
            setActiveCategory(val)
            setPage(1)
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-muted/70">
            <TabsTrigger value="ALL" className="text-xs py-1.5 font-medium">
              All Queues
            </TabsTrigger>
            <TabsTrigger
              value="CRITICAL_CHECKOUTS"
              className="text-xs py-1.5 font-medium"
            >
              Critical Checkouts
            </TabsTrigger>
            <TabsTrigger
              value="ORDER_FULFILLMENT_SYNC"
              className="text-xs py-1.5 font-medium"
            >
              Fulfillment Sync
            </TabsTrigger>
            <TabsTrigger
              value="MARKETING_EMAIL_BATCH"
              className="text-xs py-1.5 font-medium"
            >
              Marketing Batch
            </TabsTrigger>
            <TabsTrigger
              value="DEAD_LETTER_TRIGGER"
              className="text-xs py-1.5 font-medium text-rose-600 dark:text-rose-400 data-[state=active]:bg-rose-500/15"
            >
              <Flame className="mr-1 size-3.5 inline" />
              Dead Letter ({dlqDepth})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 7. Filter Toolbar */}
        <DataTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Filter jobs by ID, handler name, worker pod..."
          filters={
            <div className="flex flex-wrap items-center gap-2">
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
          jobs={jobs}
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
          totalItems={pagination.total || jobs.length}
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
