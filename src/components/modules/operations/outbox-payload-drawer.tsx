/**
 * @file outbox-payload-drawer.tsx
 * @description Slide-over drawer for inspecting Outbox CDC / Kafka Event payloads and metadata.
 * Follows Single Responsibility Principle (SRP).
 */

"use client"

import * as React from "react"
import { Copy, Check, RotateCcw, AlertTriangle, Code, ShieldCheck } from "lucide-react"
import { DetailDrawer } from "@/components/common/detail-drawer"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface OutboxEventRecord {
  id: string
  aggregateType: string
  aggregateId: string
  eventType: string
  payload: string | object
  status: "published" | "pending" | "retrying" | "dead" | string
  createdAt: string
  retries: number
  errorMessage?: string
  topic?: string
  partition?: string | number
  traceId?: string
}

export interface OutboxPayloadDrawerProps {
  event: OutboxEventRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReplayEvent?: (event: OutboxEventRecord) => void
}

export function OutboxPayloadDrawer({
  event,
  open,
  onOpenChange,
  onReplayEvent,
}: OutboxPayloadDrawerProps) {
  const [copied, setCopied] = React.useState(false)

  if (!event) return null

  const payloadString =
    typeof event.payload === "string"
      ? event.payload
      : JSON.stringify(event.payload, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(payloadString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={
        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          <span>{event.eventType}</span>
          <StatusBadge status={event.status} showDot />
        </div>
      }
      description={`Event ID: ${event.id} • Aggregate: ${event.aggregateType} (${event.aggregateId})`}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 text-xs"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 size-3.5 text-emerald-600" />
                Copied JSON
              </>
            ) : (
              <>
                <Copy className="mr-1.5 size-3.5" />
                Copy Payload
              </>
            )}
          </Button>

          {onReplayEvent && (
            <Button
              size="sm"
              onClick={() => onReplayEvent(event)}
              className="h-8 text-xs"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Replay Event Now
            </Button>
          )}
        </div>
      }
    >
      {/* Event Details Grid */}
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-card/60 p-3.5 text-xs">
        <div>
          <span className="text-muted-foreground text-[11px]">Kafka Topic:</span>
          <p className="font-mono font-medium text-foreground">
            {event.topic || `orders.${event.aggregateType.toLowerCase()}.v1`}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground text-[11px]">Partition:</span>
          <p className="font-mono font-medium text-foreground">{event.partition ?? 3}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-[11px]">Timestamp:</span>
          <p className="font-medium text-foreground">{event.createdAt}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-[11px]">Retry Count:</span>
          <p className="font-mono font-medium text-foreground">{event.retries} attempts</p>
        </div>
        {event.traceId && (
          <div className="col-span-2">
            <span className="text-muted-foreground text-[11px]">OpenTelemetry Trace:</span>
            <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 truncate">
              {event.traceId}
            </p>
          </div>
        )}
      </div>

      {/* Error Message banner if failed */}
      {event.errorMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
          <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Kafka Broker Error Response:</p>
            <p className="font-mono text-[11px] mt-0.5">{event.errorMessage}</p>
          </div>
        </div>
      )}

      {/* JSON Payload Viewer */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Code className="size-3.5 text-muted-foreground" />
            <span>CDC JSON Payload</span>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {payloadString.length} bytes
          </Badge>
        </div>

        <pre className="max-h-96 overflow-auto rounded-lg border border-border/80 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-100 dark:bg-zinc-900">
          <code>{payloadString}</code>
        </pre>
      </div>
    </DetailDrawer>
  )
}
