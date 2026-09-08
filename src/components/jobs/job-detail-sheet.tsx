/**
 * @file job-detail-sheet.tsx
 * @description Deep Inspection Sheet for background jobs and trace telemetry.
 * Displays aggregate context, execution traces, consumer idempotency logs, and full JSON payloads.
 */

"use client"

import * as React from "react"
import {
  RotateCcw,
  Ban,
  Copy,
  Check,
  Terminal,
  Activity,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  Server,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DetailDrawer } from "@/components/common/detail-drawer"
import { JobStatusBadge } from "./job-status-badge"
import { useJobDetailQuery } from "@/hooks/use-job-query"
import { Skeleton } from "@/components/ui/skeleton"
import type { JobItem } from "@/types/job"

export interface JobDetailSheetProps {
  job: JobItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRetry?: (jobId: string) => void
  onCancel?: (jobId: string) => void
  isRetrying?: boolean
  isCancelling?: boolean
}

export function JobDetailSheet({
  job,
  open,
  onOpenChange,
  onRetry,
  onCancel,
  isRetrying,
  isCancelling,
}: JobDetailSheetProps) {
  const [copiedPayload, setCopiedPayload] = React.useState(false)
  const jobId = job?.jobId || job?.id || ""

  const { data: detail, isLoading } = useJobDetailQuery(jobId, open)

  const handleCopyPayload = () => {
    const payloadToCopy = detail?.payload ?? job?.payloadSummary
    if (!payloadToCopy) return

    navigator.clipboard.writeText(
      typeof payloadToCopy === "string"
        ? payloadToCopy
        : JSON.stringify(payloadToCopy, null, 2)
    )
    setCopiedPayload(true)
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  const effectiveStatus = detail?.status || job?.status || "UNKNOWN"
  const statusUpper = effectiveStatus.toUpperCase()
  const canRetry =
    statusUpper === "FAILED" ||
    statusUpper === "DEAD_LETTER" ||
    job?.actions?.includes("RETRY")
  const canCancel =
    statusUpper === "ACTIVE" ||
    statusUpper === "WAITING" ||
    statusUpper === "DELAYED" ||
    job?.actions?.includes("CANCEL")

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={
        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          <span>{job?.handler || "Background Job"}</span>
          <JobStatusBadge status={effectiveStatus} />
        </div>
      }
      description={`Job ID: ${jobId}`}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-muted-foreground truncate">
            {job?.queue ? `Queue: ${job.queue}` : ""}
          </div>
          <div className="flex items-center gap-2">
            {canCancel && onCancel && (
              <Button
                variant="outline"
                size="sm"
                disabled={isCancelling}
                onClick={() => onCancel(jobId)}
                className="h-8 text-xs border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Ban className="mr-1.5 size-3.5" />
                {isCancelling ? "Cancelling..." : "Cancel Job"}
              </Button>
            )}

            {canRetry && onRetry && (
              <Button
                size="sm"
                disabled={isRetrying}
                onClick={() => onRetry(jobId)}
                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                <RotateCcw
                  className={`mr-1.5 size-3.5 ${isRetrying ? "animate-spin" : ""}`}
                />
                {isRetrying ? "Retrying..." : "Retry Job Now"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Top Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-border/80 bg-muted/20 p-3.5">
          <div>
            <span className="text-muted-foreground text-[11px]">Queue:</span>
            <p className="font-mono font-semibold text-foreground truncate">
              {job?.queue || "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Worker Node:</span>
            <p className="font-mono font-semibold text-foreground truncate">
              {job?.worker || "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Attempts:</span>
            <p className="font-mono font-semibold text-foreground">
              {detail
                ? `${detail.attempts} / ${detail.maxAttempts}`
                : job?.attempt || "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Runtime:</span>
            <p className="font-mono font-semibold text-foreground">
              {job?.runtime || "-"}
            </p>
          </div>
        </div>

        {/* Aggregate Metadata */}
        {(detail?.aggregateType || detail?.eventType) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-border/80 bg-card p-3">
            {detail.eventType && (
              <div>
                <span className="text-muted-foreground text-[11px]">Event Type:</span>
                <p className="font-mono font-semibold text-primary">
                  {detail.eventType}
                </p>
              </div>
            )}
            {detail.aggregateType && (
              <div>
                <span className="text-muted-foreground text-[11px]">Aggregate Type:</span>
                <p className="font-mono font-semibold text-foreground">
                  {detail.aggregateType}
                </p>
              </div>
            )}
            {detail.aggregateId && (
              <div>
                <span className="text-muted-foreground text-[11px]">Aggregate ID:</span>
                <p className="font-mono font-semibold text-foreground truncate">
                  {detail.aggregateId}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error / Failure Reason Banner */}
        {(detail?.lastError || job?.failedReason) && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
              <AlertTriangle className="size-4 text-rose-600 dark:text-rose-400" />
              <span>Execution Exception / Stack Trace:</span>
            </div>
            <pre className="font-mono text-[11px] whitespace-pre-wrap overflow-x-auto bg-black/10 dark:bg-black/40 p-2.5 rounded border border-rose-500/20">
              {detail?.lastError || job?.failedReason}
            </pre>
          </div>
        )}

        {/* Consumer Logs Trail */}
        {detail?.consumerLogs && detail.consumerLogs.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Terminal className="size-3.5 text-primary" />
              <span>Consumer Execution History ({detail.consumerLogs.length})</span>
            </p>
            <div className="rounded-lg border border-border/80 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground">
                  <tr>
                    <th className="p-2">Consumer</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Processed At</th>
                    <th className="p-2">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {detail.consumerLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20">
                      <td className="p-2 font-mono font-medium text-primary">
                        {log.consumerName}
                      </td>
                      <td className="p-2 font-mono">
                        <JobStatusBadge status={log.status} />
                      </td>
                      <td className="p-2 font-mono text-muted-foreground">
                        {log.processedAt ? new Date(log.processedAt).toLocaleString() : "-"}
                      </td>
                      <td className="p-2 font-mono text-rose-600 dark:text-rose-400 truncate max-w-[200px]">
                        {log.lastError || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* JSON Payload Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" />
              <span>Job Payload Arguments</span>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPayload}
              className="h-7 px-2 text-[11px] gap-1"
            >
              {copiedPayload ? (
                <>
                  <Check className="size-3 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  Copy JSON
                </>
              )}
            </Button>
          </div>

          {isLoading ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : (
            <pre className="max-h-64 overflow-auto rounded-lg border border-border/80 bg-zinc-950 p-3.5 font-mono text-[11px] text-zinc-100 dark:bg-zinc-900">
              <code>
                {detail?.payload
                  ? JSON.stringify(detail.payload, null, 2)
                  : job?.payloadSummary || "{}"}
              </code>
            </pre>
          )}
        </div>
      </div>
    </DetailDrawer>
  )
}
