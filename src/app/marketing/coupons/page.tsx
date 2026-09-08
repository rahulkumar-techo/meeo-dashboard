/**
 * @file page.tsx
 * @description Central Coupons & Promotional Campaigns Console.
 * Directly connects to Admin Coupon API (GET /api/v1/coupons, GET /metrics, POST /, PUT /:id, PATCH /:id/status, DELETE /:id, GET /:id/usages).
 */

"use client"

import * as React from "react"
import { Download, Plus, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  PageHeader,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import {
  CouponMetrics,
  CouponGuideCard,
  CouponTable,
  CreateCouponDialog,
  EditCouponDialog,
  CouponDetailSheet,
  CouponUsagesDialog,
} from "@/components/coupons"
import {
  useCouponsQuery,
  useCouponMetricsQuery,
  useToggleCouponStatusMutation,
  useDeleteCouponMutation,
} from "@/hooks/use-coupon-query"
import type { Coupon, CouponType, CouponStatus } from "@/types/coupon"

export default function CouponsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Modals state
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [selectedCoupon, setSelectedCoupon] = React.useState<Coupon | null>(null)
  const [detailSheetCouponId, setDetailSheetCouponId] = React.useState<string | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false)
  const [usagesDialogOpen, setUsagesDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [couponToDelete, setCouponToDelete] = React.useState<Coupon | null>(null)

  // Queries
  const {
    data: couponsData,
    isLoading: isCouponsLoading,
    isFetching: isCouponsFetching,
    refetch: refetchCoupons,
  } = useCouponsQuery({
    page,
    limit: pageSize,
    search: searchQuery.trim() || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  })

  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useCouponMetricsQuery()

  // Mutations
  const toggleStatusMutation = useToggleCouponStatusMutation()
  const deleteCouponMutation = useDeleteCouponMutation()

  const items = couponsData?.items ?? []
  const totalPages = couponsData?.pagination?.totalPages ?? 1
  const totalItems = couponsData?.pagination?.total ?? items.length

  const handleInspect = (coupon: Coupon) => {
    setDetailSheetCouponId(coupon.id)
    setDetailSheetOpen(true)
  }

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setEditDialogOpen(true)
  }

  const handleViewUsages = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setUsagesDialogOpen(true)
  }

  const handleToggleStatus = async (coupon: Coupon) => {
    const newStatus: CouponStatus = coupon.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    await toggleStatusMutation.mutateAsync({
      id: coupon.id,
      payload: { status: newStatus },
    })
  }

  const handleDeletePrompt = (coupon: Coupon) => {
    setCouponToDelete(coupon)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return
    await deleteCouponMutation.mutateAsync(couponToDelete.id)
    setDeleteDialogOpen(false)
    setCouponToDelete(null)
  }

  const handleExportCSV = () => {
    if (items.length === 0) return
    const headers = [
      "Coupon Code",
      "Type",
      "Value",
      "Min Subtotal",
      "Max Cap",
      "Global Limit",
      "Per User Limit",
      "Redemptions",
      "Status",
      "Starts At",
      "Expires At",
    ]
    const rows = items.map((c) => [
      c.code,
      c.type,
      c.value,
      c.minimumOrderAmount ?? "",
      c.maximumDiscountAmount ?? "",
      c.usageLimit ?? "",
      c.usageLimitPerUser ?? "",
      c._count?.usages ?? 0,
      c.status,
      c.startsAt ? new Date(c.startsAt).toISOString() : "",
      c.expiresAt ? new Date(c.expiresAt).toISOString() : "",
    ])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `platform_coupons_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Promotional Coupons & Voucher Engine"
        badge="Live Rules Engine"
        badgeVariant="brand"
        description="Configure discount formulas, percentage caps, minimum subtotal thresholds, concurrency limits, and redemption audit trails."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchCoupons()
              refetchMetrics()
            }}
            disabled={isCouponsFetching}
            className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
          >
            <RefreshCw
              className={`size-3.5 text-muted-foreground ${
                isCouponsFetching ? "animate-spin text-indigo-500" : ""
              }`}
            />
            <span>Refresh</span>
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
            onClick={() => setCreateDialogOpen(true)}
            className="h-8.5 gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="size-3.5" />
            <span>Create Coupon Code</span>
          </Button>
        </div>
      </PageHeader>

      {/* 2. KPI Metrics Grid */}
      <CouponMetrics metricsData={metricsData} isLoading={isMetricsLoading} />

      {/* 3. Guide Card */}
      <CouponGuideCard />

      {/* 4. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search coupon code (e.g. SUMMER20)..."
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
              <option value="all">All Campaign Statuses</option>
              <option value="ACTIVE">Active (Live)</option>
              <option value="INACTIVE">Inactive (Paused)</option>
              <option value="EXPIRED">Expired</option>
            </select>

            {/* Discount Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(1)
              }}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Discount Types</option>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
          </div>
        }
        activeFiltersCount={
          (statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0)
        }
        onResetFilters={() => {
          setStatusFilter("all")
          setTypeFilter("all")
          setSearchQuery("")
          setPage(1)
        }}
      />

      {/* 5. Coupons Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {!isCouponsLoading && items.length === 0 ? (
          <EmptyState
            title="No Promotional Coupons Found"
            description="No campaign voucher codes matched your active search query or filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setStatusFilter("all")
              setTypeFilter("all")
              setSearchQuery("")
            }}
          />
        ) : (
          <CouponTable
            coupons={items}
            isLoading={isCouponsLoading}
            onInspect={handleInspect}
            onEdit={handleEdit}
            onViewUsages={handleViewUsages}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeletePrompt}
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

      {/* 6. Modals & Drawers */}
      <CreateCouponDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetchCoupons()
          refetchMetrics()
        }}
      />

      <EditCouponDialog
        coupon={selectedCoupon}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          refetchCoupons()
          refetchMetrics()
        }}
      />

      <CouponDetailSheet
        couponId={detailSheetCouponId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onEdit={(coupon) => {
          setDetailSheetOpen(false)
          handleEdit(coupon)
        }}
      />

      <CouponUsagesDialog
        coupon={selectedCoupon}
        open={usagesDialogOpen}
        onOpenChange={setUsagesDialogOpen}
      />

      {/* Delete / Archive Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-base">
                Delete or Archive Coupon?
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs pt-2 leading-relaxed">
              Are you sure you want to remove coupon{" "}
              <strong className="font-mono text-foreground">
                &quot;{couponToDelete?.code}&quot;
              </strong>
              ?
              <br />
              <br />
              <span className="text-muted-foreground">
                <strong>Audit Invariant Notice:</strong> If this coupon has never
                been used in orders, it will be hard-deleted. If it has existing
                order redemptions, it will be safely deactivated (
                <code className="text-[11px]">status = &quot;INACTIVE&quot;</code>) to preserve
                invoice integrity.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={deleteCouponMutation.isPending}
              onClick={handleConfirmDelete}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {deleteCouponMutation.isPending ? "Processing..." : "Confirm Removal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
