/**
 * @file review-table.tsx
 * @description Master data table for viewing all platform reviews with star ratings, verified buyer badges, status badges, and quick moderation actions.
 */

"use client"

import * as React from "react"
import {
  CheckCircle2,
  XCircle,
  Trash2,
  ShieldCheck,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState, DataTablePagination } from "@/components/common"
import { ReviewStatusBadge } from "./review-status-badge"
import { ReviewRatingStars } from "./review-rating-stars"
import type { AdminReview } from "@/types/review"

export interface ReviewTableProps {
  items: AdminReview[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  hasActiveFilters?: boolean
  onApprove: (review: AdminReview) => void
  onReject: (review: AdminReview) => void
  onDelete: (review: AdminReview) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onResetFilters?: () => void
}

export function ReviewTable({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  hasActiveFilters,
  onApprove,
  onReject,
  onDelete,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
}: ReviewTableProps) {
  const formatTimestamp = (dateStr?: string | null) => {
    if (!dateStr) return "N/A"
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 font-semibold text-foreground">PRODUCT</TableHead>
              <TableHead className="font-semibold text-foreground">AUTHOR</TableHead>
              <TableHead className="font-semibold text-foreground">RATING</TableHead>
              <TableHead className="font-semibold text-foreground">REVIEW HEADLINE & BODY</TableHead>
              <TableHead className="font-semibold text-foreground">STATUS</TableHead>
              <TableHead className="font-semibold text-foreground">DATE</TableHead>
              <TableHead className="text-right pr-4 font-semibold text-foreground">MODERATION ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-xs">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell className="pl-4 py-3.5"><div className="h-5 w-36 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-28 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-60 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-16 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                  <TableCell className="text-right pr-4"><div className="h-7 w-28 ml-auto bg-muted rounded" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState
                    title="No Reviews Found"
                    description={
                      hasActiveFilters
                        ? "No customer reviews match your active filter criteria."
                        : "No reviews have been submitted yet."
                    }
                    actionLabel={hasActiveFilters ? "Reset Filters" : undefined}
                    onAction={onResetFilters}
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((rev) => {
                const authorName =
                  rev.user?.firstName || rev.user?.lastName
                    ? `${rev.user.firstName || ""} ${rev.user.lastName || ""}`.trim()
                    : rev.user?.email || "Anonymous Customer"
                const productName = rev.product?.name || "Product"

                return (
                  <TableRow key={rev.id} className="hover:bg-muted/40 transition-colors">
                    {/* Product */}
                    <TableCell className="pl-4 py-3">
                      <p className="font-semibold text-foreground line-clamp-1 max-w-[200px]">
                        {productName}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        PID: {rev.productId.slice(0, 8)}...
                      </p>
                    </TableCell>

                    {/* Author */}
                    <TableCell>
                      <div className="space-y-0.5 max-w-[180px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground truncate">
                            {authorName}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span title="Verified Buyer (Confirmed Order)">
                              <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        {rev.user?.email && (
                          <p className="text-[10.5px] text-muted-foreground truncate">
                            {rev.user.email}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Rating */}
                    <TableCell>
                      <ReviewRatingStars rating={rev.rating} showScore size="sm" />
                    </TableCell>

                    {/* Headline & Body */}
                    <TableCell className="max-w-md">
                      <div className="space-y-1">
                        {rev.title && (
                          <p className="font-semibold text-foreground line-clamp-1">
                            {rev.title}
                          </p>
                        )}
                        <p className="text-muted-foreground line-clamp-2 text-[11.5px] leading-relaxed">
                          {rev.content}
                        </p>
                        {rev.images && rev.images.length > 0 && (
                          <div className="flex items-center gap-1 text-[10.5px] text-primary pt-0.5">
                            <ImageIcon className="size-3" />
                            <span>{rev.images.length} Attached Photo(s)</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="space-y-1">
                        <ReviewStatusBadge status={rev.status} />
                        {rev._count?.reports && rev._count.reports > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            <AlertTriangle className="size-3" />
                            <span>{rev._count.reports} Flagged</span>
                          </span>
                        ) : null}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-muted-foreground text-[11px] whitespace-nowrap">
                      {formatTimestamp(rev.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {rev.status !== "APPROVED" && (
                          <Button
                            size="sm"
                            onClick={() => onApprove(rev)}
                            className="h-7 px-2 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                            title="Approve Review"
                          >
                            <CheckCircle2 className="size-3" />
                            <span>Approve</span>
                          </Button>
                        )}

                        {rev.status !== "REJECTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReject(rev)}
                            className="h-7 px-2 text-[11px] gap-1 text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium"
                            title="Reject Review"
                          >
                            <XCircle className="size-3" />
                            <span>Reject</span>
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onDelete(rev)}
                          className="hover:bg-rose-50 text-muted-foreground hover:text-rose-600"
                          title="Delete Review"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        currentPage={page}
        totalPages={totalPages || 1}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
