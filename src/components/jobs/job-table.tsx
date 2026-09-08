/**
 * @file job-table.tsx
 * @description Interactive Jobs Table specification for administrative lifecycle control.
 * Renders status badges, UUIDs, handler names, worker pods, runtimes, attempt ratios, and inline action buttons.
 */

"use client"

import * as React from "react"
import {
  Eye,
  RotateCcw,
  Ban,
  Activity,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { JobStatusBadge } from "./job-status-badge"
import { EmptyState } from "@/components/common/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { JobItem } from "@/types/job"

export interface JobTableProps {
  jobs: JobItem[]
  isLoading?: boolean
  onInspect: (job: JobItem) => void
  onRetry?: (jobId: string) => void
  onCancel?: (jobId: string) => void
  isRetryingId?: string | null
  isCancellingId?: string | null
  onResetFilters?: () => void
}

export function JobTable({
  jobs,
  isLoading,
  onInspect,
  onRetry,
  onCancel,
  isRetryingId,
  isCancellingId,
  onResetFilters,
}: JobTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No Background Jobs Found"
        description="No background jobs match your current category, search, or status filter criteria."
        actionLabel={onResetFilters ? "Reset Filters" : undefined}
        onAction={onResetFilters}
      />
    )
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/40">
              <TableHead className="w-[130px] font-bold">Status</TableHead>
              <TableHead className="font-bold">Job ID</TableHead>
              <TableHead className="font-bold">Handler</TableHead>
              <TableHead className="font-bold">Queue</TableHead>
              <TableHead className="font-bold">Worker Pod</TableHead>
              <TableHead className="font-bold">Run Time</TableHead>
              <TableHead className="font-bold">Attempt</TableHead>
              <TableHead className="font-bold text-right w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {jobs.map((job) => {
              const statusUpper = (job.status || "").toUpperCase()
              const canRetry =
                job.actions?.includes("RETRY") ||
                statusUpper === "FAILED" ||
                statusUpper === "DEAD_LETTER"
              const canCancel =
                job.actions?.includes("CANCEL") ||
                statusUpper === "ACTIVE" ||
                statusUpper === "WAITING" ||
                statusUpper === "DELAYED"

              const isThisRetrying = isRetryingId === job.jobId || isRetryingId === job.id
              const isThisCancelling = isCancellingId === job.jobId || isCancellingId === job.id

              return (
                <TableRow
                  key={job.id || job.jobId}
                  onClick={() => onInspect(job)}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50 transition-colors group",
                    statusUpper === "DEAD_LETTER" && "bg-rose-500/5 hover:bg-rose-500/10",
                    statusUpper === "FAILED" && "bg-amber-500/5 hover:bg-amber-500/10"
                  )}
                >
                  {/* Status Badge */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <JobStatusBadge status={job.status} />
                  </TableCell>

                  {/* Job ID */}
                  <TableCell className="font-mono font-medium text-foreground">
                    <span className="truncate block max-w-[180px] sm:max-w-[220px]" title={job.jobId || job.id}>
                      {job.jobId || job.id}
                    </span>
                  </TableCell>

                  {/* Handler */}
                  <TableCell className="font-mono font-medium text-primary">
                    <span className="truncate block max-w-[160px]" title={job.handler}>
                      {job.handler}
                    </span>
                  </TableCell>

                  {/* Queue */}
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    <span className="truncate block max-w-[140px]" title={job.queue}>
                      {job.queue}
                    </span>
                  </TableCell>

                  {/* Worker */}
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    <span className="truncate block max-w-[150px]" title={job.worker}>
                      {job.worker}
                    </span>
                  </TableCell>

                  {/* Run Time */}
                  <TableCell className="font-mono text-foreground font-medium whitespace-nowrap">
                    {job.runtime || (job.runtimeMs ? `${job.runtimeMs} ms` : "-")}
                  </TableCell>

                  {/* Attempt */}
                  <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                    <span
                      className={cn(
                        job.attemptsCount >= job.maxAttempts && job.maxAttempts > 0
                          ? "text-rose-600 dark:text-rose-400 font-bold"
                          : ""
                      )}
                    >
                      {job.attempt || `${job.attemptsCount || 0}/${job.maxAttempts || 1}`}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {canRetry && onRetry && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isThisRetrying}
                          onClick={() => onRetry(job.jobId || job.id)}
                          className="h-7 px-2 text-[11px] border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/40 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                        >
                          <RotateCcw className={cn("mr-1 size-3", isThisRetrying && "animate-spin")} />
                          {isThisRetrying ? "Retrying..." : "Retry"}
                        </Button>
                      )}

                      {canCancel && onCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isThisCancelling}
                          onClick={() => onCancel(job.jobId || job.id)}
                          className="h-7 px-2 text-[11px] border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          <Ban className="mr-1 size-3" />
                          Cancel
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onInspect(job)}
                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="mr-1 size-3" />
                        Inspect
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
