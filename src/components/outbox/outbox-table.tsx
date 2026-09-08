/**
 * @file outbox-table.tsx
 * @description Master data table for transactional outbox events with live status badges, attempt progress indicators, and payload inspector triggers.
 */

"use client"

import * as React from "react"
import { Eye, RotateCcw, Copy, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OutboxStatusBadge } from "./outbox-status-badge"
import type { OutboxEventItem } from "@/types/outbox"

interface OutboxTableProps {
  events: OutboxEventItem[]
  isLoading?: boolean
  onInspect: (event: OutboxEventItem) => void
  onRetry: (event: OutboxEventItem) => void
}

export function OutboxTable({
  events,
  isLoading,
  onInspect,
  onRetry,
}: OutboxTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground space-y-3">
        <div className="animate-spin inline-block size-6 border-2 border-current border-t-transparent rounded-full text-indigo-600" />
        <p>Loading outbox events stream...</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
            <TableHead className="font-bold">EVENT ID</TableHead>
            <TableHead className="font-bold">EVENT TYPE</TableHead>
            <TableHead className="font-bold">AGGREGATE</TableHead>
            <TableHead className="font-bold">ENTITY ID</TableHead>
            <TableHead className="font-bold">ATTEMPTS</TableHead>
            <TableHead className="font-bold">STATUS</TableHead>
            <TableHead className="font-bold">CREATED AT</TableHead>
            <TableHead className="font-bold text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs font-normal">
          {events.map((event) => (
            <TableRow
              key={event.id}
              className="hover:bg-muted/40 transition-colors group"
            >
              {/* 1. Event ID */}
              <TableCell className="font-mono font-medium">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onInspect(event)}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {event.id.length > 16
                      ? `${event.id.slice(0, 12)}...`
                      : event.id}
                  </button>
                  <button
                    onClick={() => copyToClipboard(event.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                    title="Copy Event ID"
                  >
                    {copiedId === event.id ? (
                      <CheckCircle2 className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </TableCell>

              {/* 2. Event Type */}
              <TableCell>
                <code className="text-[11px] font-mono font-semibold bg-muted px-1.5 py-0.5 rounded text-foreground">
                  {event.eventType}
                </code>
              </TableCell>

              {/* 3. Aggregate Type */}
              <TableCell>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono uppercase bg-muted/30"
                >
                  {event.aggregateType}
                </Badge>
              </TableCell>

              {/* 4. Aggregate Entity ID */}
              <TableCell className="font-mono text-muted-foreground text-[11px]">
                {event.aggregateId.length > 16
                  ? `${event.aggregateId.slice(0, 10)}...`
                  : event.aggregateId}
              </TableCell>

              {/* 5. Attempts */}
              <TableCell className="font-mono text-[11px]">
                <span
                  className={
                    event.attempts > 1
                      ? "text-amber-600 dark:text-amber-400 font-bold"
                      : "text-muted-foreground"
                  }
                >
                  {event.attempts}
                </span>{" "}
                / {event.maxAttempts}
              </TableCell>

              {/* 6. Status Badge */}
              <TableCell>
                <OutboxStatusBadge status={event.status} />
              </TableCell>

              {/* 7. Date */}
              <TableCell className="text-muted-foreground text-[11px]">
                {new Date(event.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </TableCell>

              {/* 8. Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onInspect(event)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    title="Inspect Payload & Error Trace"
                  >
                    <Eye className="size-3.5" />
                  </Button>

                  {(event.status === "FAILED" || event.status === "PROCESSING") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry(event)}
                      className="h-7 w-7 p-0 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                      title="Re-enqueue Event"
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
