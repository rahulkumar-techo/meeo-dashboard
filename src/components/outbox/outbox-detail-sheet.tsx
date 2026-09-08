/**
 * @file outbox-detail-sheet.tsx
 * @description Slide-over drawer for inspecting outbox event payloads, distributed lock states, and error stack diagnostics.
 */

"use client"

import * as React from "react"
import {
  Copy,
  CheckCircle2,
  RotateCcw,
  Layers,
  Database,
  AlertCircle,
  Clock,
  ShieldCheck,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  useOutboxEventDetailQuery,
  useRetryOutboxEventMutation,
} from "@/hooks/use-outbox-query"
import { OutboxStatusBadge } from "./outbox-status-badge"
import type { OutboxEventItem } from "@/types/outbox"

interface OutboxDetailSheetProps {
  eventId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRetrySuccess?: () => void
}

export function OutboxDetailSheet({
  eventId,
  open,
  onOpenChange,
  onRetrySuccess,
}: OutboxDetailSheetProps) {
  const [copiedPayload, setCopiedPayload] = React.useState(false)

  const { data: event, isLoading, refetch } = useOutboxEventDetailQuery(
    eventId || "",
    open && Boolean(eventId)
  )

  const retryMutation = useRetryOutboxEventMutation()

  const copyPayload = () => {
    if (!event?.payload) return
    navigator.clipboard.writeText(JSON.stringify(event.payload, null, 2))
    setCopiedPayload(true)
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  const handleRetry = async () => {
    if (!eventId) return
    await retryMutation.mutateAsync(eventId)
    refetch()
    onRetrySuccess?.()
  }

  if (!eventId) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/70 bg-muted/20">
          <SheetHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                  {event?.aggregateType || "AGGREGATE"}
                </Badge>
                {event && <OutboxStatusBadge status={event.status} />}
              </div>

              {event && (event.status === "FAILED" || event.status === "PROCESSING") && (
                <Button
                  size="sm"
                  onClick={handleRetry}
                  disabled={retryMutation.isPending}
                  className="h-8 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  <RotateCcw className="size-3.5" />
                  <span>{retryMutation.isPending ? "Re-queuing..." : "Manual Retry"}</span>
                </Button>
              )}
            </div>

            <div>
              <SheetTitle className="text-lg font-mono font-bold flex items-center gap-2">
                <span>{event?.eventType || "Outbox Event"}</span>
              </SheetTitle>
              <SheetDescription className="text-xs font-mono text-muted-foreground mt-1">
                ID: {eventId}
              </SheetDescription>
            </div>
          </SheetHeader>
        </div>

        {isLoading || !event ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <div className="animate-spin inline-block size-6 border-2 border-current border-t-transparent rounded-full text-indigo-600" />
            <p>Loading event payload & error diagnostics...</p>
          </div>
        ) : (
          <div className="flex-1 p-6 space-y-6 text-xs">
            {/* Metadata Summary Box */}
            <div className="rounded-lg border border-border/70 bg-card divide-y divide-border/60">
              <div className="p-3 flex justify-between items-center">
                <span className="text-muted-foreground">Aggregate ID:</span>
                <span className="font-mono font-medium text-foreground">
                  {event.aggregateId}
                </span>
              </div>

              <div className="p-3 flex justify-between items-center">
                <span className="text-muted-foreground">Attempts Count:</span>
                <span className="font-mono text-foreground font-semibold">
                  {event.attempts} / {event.maxAttempts} max
                </span>
              </div>

              <div className="p-3 flex justify-between items-center">
                <span className="text-muted-foreground">Distributed Poller Lock:</span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  {event.lockedBy || "None (Free)"}
                </span>
              </div>

              <div className="p-3 flex justify-between items-center">
                <span className="text-muted-foreground">Created Timestamp:</span>
                <span className="text-foreground text-[11px]">
                  {new Date(event.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="p-3 flex justify-between items-center">
                <span className="text-muted-foreground">Published Timestamp:</span>
                <span className="text-foreground text-[11px]">
                  {event.publishedAt
                    ? new Date(event.publishedAt).toLocaleString()
                    : "Not published"}
                </span>
              </div>
            </div>

            {/* Error Diagnostics (If Failed) */}
            {event.lastError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-1.5">
                <div className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="size-4" />
                  <span>Outbox Worker Error Trace</span>
                </div>
                <pre className="font-mono text-[11px] text-rose-900 dark:text-rose-200 whitespace-pre-wrap break-all p-2 rounded bg-rose-500/5">
                  {event.lastError}
                </pre>
              </div>
            )}

            {/* JSON Payload Viewer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Database className="size-3.5" />
                  <span>Event JSON Payload</span>
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPayload}
                  className="h-6 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  {copiedPayload ? (
                    <>
                      <CheckCircle2 className="size-3 text-emerald-500" />
                      <span>Copied JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy Payload</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/40 p-3.5 overflow-x-auto">
                <pre className="font-mono text-[11px] text-foreground leading-relaxed">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
