/**
 * @file moderation-queue-pane.tsx
 * @description Dedicated FIFO pending review moderation workbench with batch selection and quick 1-click triage actions.
 */

"use client"

import * as React from "react"
import {
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  Square,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState, DataTablePagination } from "@/components/common"
import { ReviewRatingStars } from "./review-rating-stars"
import type { AdminReview } from "@/types/review"

export interface ModerationQueuePaneProps {
  items: AdminReview[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  onApprove: (review: AdminReview) => void
  onReject: (review: AdminReview) => void
  onBulkAction: (reviewIds: string[], status: "APPROVED" | "REJECTED") => void
  onRefresh: () => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function ModerationQueuePane({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  onApprove,
  onReject,
  onBulkAction,
  onRefresh,
  onPageChange,
  onPageSizeChange,
}: ModerationQueuePaneProps) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((i) => i.id))
    }
  }

  const formatTimestamp = (dateStr?: string | null) => {
    if (!dateStr) return "N/A"
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-4">
      {/* Batch Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSelectAll}
            disabled={items.length === 0}
            className="h-8 gap-1.5 text-xs text-foreground font-semibold"
          >
            {selectedIds.length === items.length && items.length > 0 ? (
              <CheckSquare className="size-4 text-primary" />
            ) : (
              <Square className="size-4 text-muted-foreground" />
            )}
            <span>
              {selectedIds.length > 0
                ? `${selectedIds.length} Selected`
                : "Select All in Queue"}
            </span>
          </Button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in-50 duration-200">
              <Button
                size="sm"
                onClick={() => onBulkAction(selectedIds, "APPROVED")}
                className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Bulk Approve ({selectedIds.length})</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onBulkAction(selectedIds, "REJECTED")}
                className="h-8 gap-1.5 text-xs font-medium"
              >
                <XCircle className="size-3.5" />
                <span>Bulk Reject ({selectedIds.length})</span>
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 gap-1.5 text-xs"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* Queue Cards List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border border-border/70 bg-card p-4 animate-pulse space-y-3">
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-7 w-32 ml-auto bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Moderation Queue Empty"
          description="All submitted customer reviews have been reviewed and moderated."
        />
      ) : (
        <div className="space-y-3">
          {items.map((rev) => {
            const authorName =
              rev.user?.firstName || rev.user?.lastName
                ? `${rev.user.firstName || ""} ${rev.user.lastName || ""}`.trim()
                : rev.user?.email || "Anonymous Customer"
            const productName = rev.product?.name || "Product"
            const isSelected = selectedIds.includes(rev.id)
            const reportsCount = rev._count?.reports ?? 0

            return (
              <div
                key={rev.id}
                className={`rounded-xl border p-4 transition-all shadow-2xs space-y-3 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-card hover:border-border"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(rev.id)}
                      className="size-4 rounded border-border text-primary focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">
                          {productName}
                        </span>
                        {reportsCount > 0 && (
                          <Badge variant="destructive" className="text-[10px] gap-1 py-0 font-bold">
                            <AlertTriangle className="size-3" />
                            <span>{reportsCount} Abuse Reports</span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>By {authorName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <ShieldCheck className="size-3" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                        <span>•</span>
                        <span>{formatTimestamp(rev.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <ReviewRatingStars rating={rev.rating} showScore size="sm" />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  {rev.title && (
                    <h4 className="font-bold text-sm text-foreground">{rev.title}</h4>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rev.content}
                  </p>
                </div>

                {/* Images */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    {rev.images.map((imgUrl, i) => (
                      <a
                        key={i}
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-border/80 overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={imgUrl}
                          alt="Review attachment"
                          className="size-14 object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(rev)}
                    className="h-8 gap-1.5 text-xs text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium"
                  >
                    <XCircle className="size-3.5" />
                    <span>Reject</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onApprove(rev)}
                    className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>Approve & Publish</span>
                  </Button>
                </div>
              </div>
            )
          })}

          <DataTablePagination
            currentPage={page}
            totalPages={totalPages || 1}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  )
}
