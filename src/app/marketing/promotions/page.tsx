/**
 * @file page.tsx
 * @description Central Promotions & Campaign Rules Orchestrator Console.
 * Directly integrates with Admin Promotion API:
 * - GET /api/v1/promotions (List)
 * - GET /api/v1/promotions/:id (Details)
 * - POST /api/v1/promotions (Create via /marketing/promotions/create)
 * - PUT /api/v1/promotions/:id (Update via /marketing/promotions/[id]/edit)
 * - PATCH /api/v1/promotions/:id/publish (Publish)
 * - PATCH /api/v1/promotions/:id/pause (Pause)
 * - PATCH /api/v1/promotions/:id/archive (Archive)
 * - PATCH /api/v1/promotions/:id/status (Toggle Status)
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  PromotionTable,
  PromotionDetailSheet,
} from "@/components/promotions"
import {
  usePromotionsQuery,
  usePublishPromotionMutation,
  usePausePromotionMutation,
  useArchivePromotionMutation,
} from "@/hooks/use-promotion-query"
import type { PromotionListItem } from "@/types/promotion"

export default function PromotionsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Drawer and Dialog states
  const [detailSheetPromotionId, setDetailSheetPromotionId] = React.useState<string | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = React.useState(false)
  const [promoToArchive, setPromoToArchive] = React.useState<PromotionListItem | null>(null)

  // Queries & Mutations
  const { data: promotionsData, isLoading, isFetching, refetch } = usePromotionsQuery({
    page,
    limit: pageSize,
    search: searchQuery.trim() || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  })

  const publishMutation = usePublishPromotionMutation()
  const pauseMutation = usePausePromotionMutation()
  const archiveMutation = useArchivePromotionMutation()

  const promotions = promotionsData?.promotions ?? []
  const totalPages = promotionsData?.pagination?.totalPages ?? 1
  const totalItems = promotionsData?.pagination?.total ?? promotions.length

  const handleInspect = (p: PromotionListItem) => {
    setDetailSheetPromotionId(p.id)
    setDetailSheetOpen(true)
  }

  const handleEdit = (p: PromotionListItem) => {
    router.push(`/marketing/promotions/${p.id}/edit`)
  }

  const handleArchiveConfirm = async () => {
    if (!promoToArchive) return
    await archiveMutation.mutateAsync(promoToArchive.id)
    setArchiveDialogOpen(false)
    setPromoToArchive(null)
  }

  const handleExportCSV = () => {
    if (promotions.length === 0) return
    const headers = ["ID", "Name", "Slug", "Type", "Status", "Priority", "Discount", "Trigger", "Usage"]
    const rows = promotions.map((p) => [
      p.id, p.name, p.slug, p.type, p.status, p.priority,
      p.discountValue ?? "", p.isAutomatic ? "AUTO" : "CODE", p.currentUsageCount ?? 0,
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", `promotions_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <PageHeader
        title="Promotions & Campaign Rules"
        badge="Engine Active"
        badgeVariant="brand"
        description="Configure dynamic cart rules, BOGO bundles, tiered basket savings, and automated discount orchestrators."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-indigo-500" : "text-muted-foreground"}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={promotions.length === 0}
            className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </Button>

          <Link href="/marketing/promotions/create">
            <Button
              size="sm"
              className="h-8.5 gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Create Campaign</span>
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* 2. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search campaign name or slug (e.g. Summer 20%)..."
        filters={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active (Live)</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PAUSED">Paused</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground"
            >
              <option value="all">All Types</option>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_DISCOUNT">Fixed Discount (₹)</option>
              <option value="BUY_X_GET_Y">Buy X Get Y (BOGO)</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
              <option value="PRODUCT_DISCOUNT">Product Discount</option>
              <option value="CATEGORY_DISCOUNT">Category Discount</option>
              <option value="BRAND_DISCOUNT">Brand Discount</option>
              <option value="FLASH_SALE">Flash Sale</option>
            </select>
          </div>
        }
        activeFiltersCount={(statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0)}
        onResetFilters={() => { setStatusFilter("all"); setTypeFilter("all"); setSearchQuery(""); setPage(1) }}
      />

      {/* 3. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {!isLoading && promotions.length === 0 ? (
          <EmptyState
            title="No Promotional Campaigns Found"
            description="No campaign rules matched your active search query or filters."
            actionLabel="Reset Filters"
            onAction={() => { setStatusFilter("all"); setTypeFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <PromotionTable
            promotions={promotions}
            isLoading={isLoading}
            onInspect={handleInspect}
            onEdit={handleEdit}
            onPublish={(p) => publishMutation.mutateAsync(p.id)}
            onPause={(p) => pauseMutation.mutateAsync(p.id)}
            onArchive={(p) => { setPromoToArchive(p); setArchiveDialogOpen(true) }}
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

      {/* 4. Detail Drawer */}
      <PromotionDetailSheet
        promotionId={detailSheetPromotionId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onEdit={(p) => { setDetailSheetOpen(false); handleEdit(p) }}
      />

      {/* Archive Modal */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-base">Archive Promotion?</DialogTitle>
            </div>
            <DialogDescription className="text-xs pt-2 leading-relaxed">
              Are you sure you want to archive campaign <strong className="text-foreground">{promoToArchive?.name}</strong>? This deactivates the rule permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => setArchiveDialogOpen(false)} className="text-xs">Cancel</Button>
            <Button
              type="button"
              size="sm"
              disabled={archiveMutation.isPending}
              onClick={handleArchiveConfirm}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {archiveMutation.isPending ? "Archiving..." : "Confirm Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
