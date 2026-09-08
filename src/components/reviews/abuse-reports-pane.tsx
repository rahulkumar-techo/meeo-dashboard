/**
 * @file abuse-reports-pane.tsx
 * @description Abuse & Spam reports management table with resolution badges and action triggers.
 */

"use client"

import * as React from "react"
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Filter,
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
import type { ReviewAbuseReport, ReportStatus, ReportReason } from "@/types/review"

export interface AbuseReportsPaneProps {
  items: ReviewAbuseReport[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  statusFilter: string
  reasonFilter: string
  onStatusFilterChange: (status: string) => void
  onReasonFilterChange: (reason: string) => void
  onResolveReport: (report: ReviewAbuseReport) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onResetFilters?: () => void
}

export function AbuseReportsPane({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  statusFilter,
  reasonFilter,
  onStatusFilterChange,
  onReasonFilterChange,
  onResolveReport,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
}: AbuseReportsPaneProps) {
  const renderReasonBadge = (reason: ReportReason) => {
    switch (reason) {
      case "SPAM":
        return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 font-bold text-[10px]">SPAM</Badge>
      case "FAKE_REVIEW":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 font-bold text-[10px]">FAKE REVIEW</Badge>
      case "HARASSMENT":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 font-bold text-[10px]">HARASSMENT</Badge>
      case "INAPPROPRIATE":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 font-bold text-[10px]">INAPPROPRIATE</Badge>
      default:
        return <Badge variant="outline" className="text-[10px]">{reason}</Badge>
    }
  }

  const renderStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "ACTIONED":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 text-[10px] font-semibold">
            <CheckCircle2 className="size-3" />
            <span>ACTIONED</span>
          </Badge>
        )
      case "DISMISSED":
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 gap-1 text-[10px] font-semibold">
            <XCircle className="size-3" />
            <span>DISMISSED</span>
          </Badge>
        )
      case "REVIEWED":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 gap-1 text-[10px] font-semibold">
            <span>REVIEWED</span>
          </Badge>
        )
      case "PENDING":
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 gap-1 text-[10px] font-semibold">
            <AlertTriangle className="size-3" />
            <span>PENDING</span>
          </Badge>
        )
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

  const hasActiveFilters = Boolean(statusFilter || reasonFilter)

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-border bg-card p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
          >
            <option value="">All Report Statuses</option>
            <option value="PENDING">Pending Triage</option>
            <option value="ACTIONED">Actioned (Violation)</option>
            <option value="DISMISSED">Dismissed (False Positive)</option>
            <option value="REVIEWED">Reviewed</option>
          </select>

          <select
            value={reasonFilter}
            onChange={(e) => onReasonFilterChange(e.target.value)}
            className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
          >
            <option value="">All Flag Reasons</option>
            <option value="SPAM">Spam / Promo Links</option>
            <option value="FAKE_REVIEW">Fake / Competitor Review</option>
            <option value="HARASSMENT">Harassment</option>
            <option value="INAPPROPRIATE">Inappropriate Content</option>
            <option value="OFF_TOPIC">Off Topic</option>
          </select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 text-xs">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 font-semibold text-foreground">REPORTED REASON</TableHead>
                <TableHead className="font-semibold text-foreground">TARGET PRODUCT / REVIEW</TableHead>
                <TableHead className="font-semibold text-foreground">FLAG DETAILS</TableHead>
                <TableHead className="font-semibold text-foreground">REPORTER</TableHead>
                <TableHead className="font-semibold text-foreground">STATUS</TableHead>
                <TableHead className="font-semibold text-foreground">REPORTED AT</TableHead>
                <TableHead className="text-right pr-4 font-semibold text-foreground">ACTION</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-xs">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    <TableCell className="pl-4 py-3.5"><div className="h-5 w-20 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-5 w-36 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-48 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-28 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-5 w-16 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                    <TableCell className="text-right pr-4"><div className="h-7 w-20 ml-auto bg-muted rounded" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      title="No Abuse Reports Found"
                      description={
                        hasActiveFilters
                          ? "No user-flagged reports match your active filters."
                          : "No reviews have been reported for policy violations."
                      }
                      actionLabel={hasActiveFilters ? "Reset Filters" : undefined}
                      onAction={onResetFilters}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((rep) => {
                  const reporterEmail = rep.reporter?.email || "User"
                  const productName = rep.review?.product?.name || "Product"
                  const reviewTitle = rep.review?.title || rep.review?.content

                  return (
                    <TableRow key={rep.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="pl-4 py-3">
                        {renderReasonBadge(rep.reason)}
                      </TableCell>

                      <TableCell className="max-w-[200px]">
                        <p className="font-semibold text-foreground truncate">{productName}</p>
                        <p className="text-[11px] text-muted-foreground italic truncate">
                          "{reviewTitle}"
                        </p>
                      </TableCell>

                      <TableCell className="max-w-[220px]">
                        <p className="text-muted-foreground line-clamp-2 text-[11.5px]">
                          {rep.details || <span className="italic text-muted-foreground/50">No details provided</span>}
                        </p>
                        {rep.resolutionNote && (
                          <p className="text-[10.5px] font-mono text-emerald-600 mt-0.5">
                            Note: {rep.resolutionNote}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="text-muted-foreground font-mono text-[11px]">
                        {reporterEmail}
                      </TableCell>

                      <TableCell>{renderStatusBadge(rep.status)}</TableCell>

                      <TableCell className="text-muted-foreground text-[11px] whitespace-nowrap">
                        {formatTimestamp(rep.createdAt)}
                      </TableCell>

                      <TableCell className="text-right pr-4">
                        <Button
                          size="sm"
                          onClick={() => onResolveReport(rep)}
                          className="h-7 px-2 text-[11px] gap-1 bg-primary text-primary-foreground font-medium"
                          title="Resolve report & action review"
                        >
                          <ShieldCheck className="size-3" />
                          <span>Resolve</span>
                        </Button>
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
    </div>
  )
}
