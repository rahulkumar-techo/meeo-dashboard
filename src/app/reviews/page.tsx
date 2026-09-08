/**
 * @file page.tsx
 * @description Central Product Reviews & Ratings Moderation Console with live queue triage, bulk actions, and spam report resolution.
 */

"use client"

import * as React from "react"
import {
  Download,
  Star,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Layers,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PageHeader, DataTableToolbar, ConfirmDialog } from "@/components/common"
import {
  useAdminReviewsQuery,
  useModerationQueueQuery,
  useAbuseReportsQuery,
  useDeleteReviewMutation,
} from "@/hooks/use-review-query"
import {
  ReviewMetricsCards,
  ReviewTable,
  ModerationQueuePane,
  AbuseReportsPane,
  ModerateReviewDialog,
  BulkModerateDialog,
  ResolveReportDialog,
  ReviewGuideCard,
} from "@/components/reviews"
import type {
  AdminReview,
  ReviewAbuseReport,
  ReviewStatus,
} from "@/types/review"

export default function ReviewsPage() {
  // Navigation tab state
  const [activeTab, setActiveTab] = React.useState<string>("all")

  // Query & pagination state for All Reviews
  const [searchQuery, setSearchQuery] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [verifiedFilter, setVerifiedFilter] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string>("createdAt")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Query state for Moderation Queue
  const [queuePage, setQueuePage] = React.useState(1)
  const [queuePageSize, setQueuePageSize] = React.useState(15)

  // Query state for Abuse Reports
  const [repPage, setRepPage] = React.useState(1)
  const [repPageSize, setRepPageSize] = React.useState(15)
  const [repStatus, setRepStatus] = React.useState<string>("")
  const [repReason, setRepReason] = React.useState<string>("")

  // Dialog states
  const [selectedReview, setSelectedReview] = React.useState<AdminReview | null>(null)
  const [moderateTargetStatus, setModerateTargetStatus] = React.useState<"APPROVED" | "REJECTED">("APPROVED")
  const [moderateDialogOpen, setModerateDialogOpen] = React.useState(false)

  const [bulkReviewIds, setBulkReviewIds] = React.useState<string[]>([])
  const [bulkTargetStatus, setBulkTargetStatus] = React.useState<"APPROVED" | "REJECTED">("APPROVED")
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false)

  const [selectedReport, setSelectedReport] = React.useState<ReviewAbuseReport | null>(null)
  const [resolveDialogOpen, setResolveDialogOpen] = React.useState(false)

  const [reviewToDelete, setReviewToDelete] = React.useState<AdminReview | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)

  // Map active tab to status filter
  const effectiveStatus = React.useMemo(() => {
    if (activeTab === "approved") return "APPROVED"
    if (activeTab === "rejected") return "REJECTED"
    if (statusFilter !== "all") return statusFilter
    return undefined
  }, [activeTab, statusFilter])

  // Queries
  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    refetch: refetchReviews,
  } = useAdminReviewsQuery({
    page,
    limit: pageSize,
    search: searchQuery.trim() || undefined,
    status: effectiveStatus,
    rating: ratingFilter !== "all" ? parseInt(ratingFilter, 10) : undefined,
    isVerifiedPurchase: verifiedFilter === "verified" ? true : undefined,
    sortBy,
    sortOrder,
  })

  const {
    data: queueData,
    isLoading: isQueueLoading,
    refetch: refetchQueue,
  } = useModerationQueueQuery({
    page: queuePage,
    limit: queuePageSize,
  })

  const {
    data: reportsData,
    isLoading: isReportsLoading,
    refetch: refetchReports,
  } = useAbuseReportsQuery({
    page: repPage,
    limit: repPageSize,
    status: repStatus || undefined,
    reason: repReason || undefined,
  })

  const deleteMutation = useDeleteReviewMutation()

  const items = reviewsData?.items ?? []
  const total = reviewsData?.pagination?.total ?? items.length
  const totalPages = reviewsData?.pagination?.totalPages ?? 1

  const queueItems = queueData?.items ?? []
  const queueTotal = queueData?.pagination?.total ?? queueItems.length
  const queueTotalPages = queueData?.pagination?.totalPages ?? 1

  const reportItems = reportsData?.items ?? []
  const reportTotal = reportsData?.pagination?.total ?? reportItems.length
  const reportTotalPages = reportsData?.pagination?.totalPages ?? 1

  const handleRefreshAll = () => {
    refetchReviews()
    refetchQueue()
    refetchReports()
  }

  // Action Triggers
  const handleOpenApprove = (review: AdminReview) => {
    setSelectedReview(review)
    setModerateTargetStatus("APPROVED")
    setModerateDialogOpen(true)
  }

  const handleOpenReject = (review: AdminReview) => {
    setSelectedReview(review)
    setModerateTargetStatus("REJECTED")
    setModerateDialogOpen(true)
  }

  const handleOpenBulk = (reviewIds: string[], status: "APPROVED" | "REJECTED") => {
    setBulkReviewIds(reviewIds)
    setBulkTargetStatus(status)
    setBulkDialogOpen(true)
  }

  const handleOpenResolveReport = (report: ReviewAbuseReport) => {
    setSelectedReport(report)
    setResolveDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return
    try {
      await deleteMutation.mutateAsync(reviewToDelete.id)
      setDeleteConfirmOpen(false)
      setReviewToDelete(null)
      handleRefreshAll()
    } catch (err) {
      console.error("Failed to delete review", err)
    }
  }

  // Client-side CSV export generator
  const handleExportCSV = () => {
    if (items.length === 0) return
    const headers = [
      "Review ID",
      "Product Name",
      "Author",
      "Rating",
      "Title",
      "Content",
      "Verified Purchase",
      "Status",
      "Created At",
    ]
    const rows = items.map((r) => [
      r.id,
      `"${r.product?.name || ""}"`,
      `"${r.user?.email || ""}"`,
      r.rating,
      `"${r.title || ""}"`,
      `"${r.content.replace(/"/g, '""')}"`,
      r.isVerifiedPurchase,
      r.status,
      r.createdAt,
    ])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `reviews_export_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Product Reviews & Ratings Moderation"
        badge="Trust & Safety Console"
        badgeVariant="brand"
        description="Moderate customer feedback, audit verified buyers, batch approve submissions, and resolve user-submitted spam/abuse reports."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
        >
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Reviews (CSV)</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics Grid */}
      <ReviewMetricsCards
        items={items}
        pendingCount={queueTotal}
        reportsCount={reportTotal}
        isLoading={isReviewsLoading || isQueueLoading}
      />

      {/* 3. Onboarding & Moderation Guide */}
      <ReviewGuideCard />

      {/* 4. Tabbed Subsystems */}
      <Tabs
        value={activeTab}
        onValueChange={(tab) => {
          setActiveTab(tab)
          setStatusFilter("all")
          setRatingFilter("all")
          setPage(1)
        }}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border/60">
          <TabsTrigger value="all" className="text-xs gap-1.5 font-medium">
            <Layers className="size-3.5" />
            <span>All Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="queue" className="text-xs gap-1.5 font-medium relative">
            <Clock className="size-3.5 text-amber-500" />
            <span>Pending Moderation</span>
            {queueTotal > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
                {queueTotal}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs gap-1.5 font-medium relative">
            <ShieldAlert className="size-3.5 text-rose-500" />
            <span>Abuse Reports</span>
            {reportTotal > 0 && (
              <span className="ml-1 rounded-full bg-rose-600 text-white px-1.5 py-0.2 text-[10px] font-bold">
                {reportTotal}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs gap-1.5 font-medium">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            <span>Published Storefront</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs gap-1.5 font-medium">
            <XCircle className="size-3.5 text-rose-600" />
            <span>Rejected & Hidden</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: All Reviews / Published / Rejected */}
        {(activeTab === "all" || activeTab === "approved" || activeTab === "rejected") && (
          <TabsContent value={activeTab} className="space-y-4">
            {/* Toolbar */}
            <DataTableToolbar
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q)
                setPage(1)
              }}
              searchPlaceholder="Search product name, review title, body, reviewer..."
              filters={
                <div className="flex flex-wrap items-center gap-2">
                  {/* Star Rating Filter */}
                  <select
                    value={ratingFilter}
                    onChange={(e) => {
                      setRatingFilter(e.target.value)
                      setPage(1)
                    }}
                    className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
                  >
                    <option value="all">All Star Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>

                  {/* Verified Buyer Filter */}
                  <select
                    value={verifiedFilter}
                    onChange={(e) => {
                      setVerifiedFilter(e.target.value)
                      setPage(1)
                    }}
                    className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
                  >
                    <option value="all">All Buyers</option>
                    <option value="verified">Verified Buyers Only</option>
                  </select>

                  {/* Status filter if in 'all' tab */}
                  {activeTab === "all" && (
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value)
                        setPage(1)
                      }}
                      className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
                    >
                      <option value="all">All Statuses</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  )}

                  {/* Sort Filter */}
                  <select
                    value={`${sortBy}:${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split(":")
                      setSortBy(field)
                      setSortOrder(order as "asc" | "desc")
                      setPage(1)
                    }}
                    className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden font-mono"
                  >
                    <option value="createdAt:desc">Newest First</option>
                    <option value="createdAt:asc">Oldest First</option>
                    <option value="rating:desc">Highest Rating</option>
                    <option value="rating:asc">Lowest Rating</option>
                  </select>
                </div>
              }
              activeFiltersCount={
                (ratingFilter !== "all" ? 1 : 0) +
                (verifiedFilter !== "all" ? 1 : 0) +
                (statusFilter !== "all" ? 1 : 0)
              }
              onResetFilters={() => {
                setRatingFilter("all")
                setVerifiedFilter("all")
                setStatusFilter("all")
                setSearchQuery("")
                setPage(1)
              }}
            />

            <ReviewTable
              items={items}
              total={total}
              totalPages={totalPages}
              page={page}
              pageSize={pageSize}
              isLoading={isReviewsLoading}
              hasActiveFilters={Boolean(
                searchQuery ||
                  ratingFilter !== "all" ||
                  verifiedFilter !== "all" ||
                  statusFilter !== "all"
              )}
              onApprove={handleOpenApprove}
              onReject={handleOpenReject}
              onDelete={(review) => {
                setReviewToDelete(review)
                setDeleteConfirmOpen(true)
              }}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onResetFilters={() => {
                setRatingFilter("all")
                setVerifiedFilter("all")
                setStatusFilter("all")
                setSearchQuery("")
                setPage(1)
              }}
            />
          </TabsContent>
        )}

        {/* Tab 2: Pending Moderation Queue */}
        <TabsContent value="queue">
          <ModerationQueuePane
            items={queueItems}
            total={queueTotal}
            totalPages={queueTotalPages}
            page={queuePage}
            pageSize={queuePageSize}
            isLoading={isQueueLoading}
            onApprove={handleOpenApprove}
            onReject={handleOpenReject}
            onBulkAction={handleOpenBulk}
            onRefresh={handleRefreshAll}
            onPageChange={setQueuePage}
            onPageSizeChange={setQueuePageSize}
          />
        </TabsContent>

        {/* Tab 3: Abuse & Spam Reports */}
        <TabsContent value="reports">
          <AbuseReportsPane
            items={reportItems}
            total={reportTotal}
            totalPages={reportTotalPages}
            page={repPage}
            pageSize={repPageSize}
            isLoading={isReportsLoading}
            statusFilter={repStatus}
            reasonFilter={repReason}
            onStatusFilterChange={(s) => {
              setRepStatus(s)
              setRepPage(1)
            }}
            onReasonFilterChange={(r) => {
              setRepReason(r)
              setRepPage(1)
            }}
            onResolveReport={handleOpenResolveReport}
            onPageChange={setRepPage}
            onPageSizeChange={setRepPageSize}
            onResetFilters={() => {
              setRepStatus("")
              setRepReason("")
              setRepPage(1)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* 5. Modals */}
      <ModerateReviewDialog
        review={selectedReview}
        targetStatus={moderateTargetStatus}
        open={moderateDialogOpen}
        onOpenChange={setModerateDialogOpen}
        onSuccess={handleRefreshAll}
      />

      <BulkModerateDialog
        reviewIds={bulkReviewIds}
        targetStatus={bulkTargetStatus}
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onSuccess={handleRefreshAll}
      />

      <ResolveReportDialog
        report={selectedReport}
        open={resolveDialogOpen}
        onOpenChange={setResolveDialogOpen}
        onSuccess={handleRefreshAll}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Permanently Delete Review"
        description="Are you sure you want to delete this review? This action is irreversible and will recalculate the product's average rating."
        confirmLabel="Delete Review"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
