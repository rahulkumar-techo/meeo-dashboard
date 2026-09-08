/**
 * @file audit-log-table.tsx
 * @description Interactive data table for System Security & Compliance Audit Logs.
 * Displays action badges, target entity UUIDs, acting operator profiles, ingress IP addresses, and state diff inspectors.
 */

"use client"

import * as React from "react"
import { Eye, Terminal, Globe, User, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/common/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { AuditActionBadge } from "./audit-action-badge"
import { cn } from "@/lib/utils"
import type { AuditLogItem } from "@/types/audit-log"

export interface AuditLogTableProps {
  logs: AuditLogItem[]
  isLoading?: boolean
  onInspect: (log: AuditLogItem) => void
  onResetFilters?: () => void
}

export function AuditLogTable({
  logs,
  isLoading,
  onInspect,
  onResetFilters,
}: AuditLogTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        title="No Audit Records Found"
        description="No audit events matched your search, entity filter, or date range."
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
              <TableHead className="font-bold">ACTION</TableHead>
              <TableHead className="font-bold">TARGET ENTITY</TableHead>
              <TableHead className="font-bold">ACTING OPERATOR</TableHead>
              <TableHead className="font-bold">IP INGRESS</TableHead>
              <TableHead className="font-bold">TIMESTAMP</TableHead>
              <TableHead className="font-bold text-right w-[100px]">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {logs.map((log) => (
              <TableRow
                key={log.id}
                onClick={() => onInspect(log)}
                className="cursor-pointer hover:bg-muted/50 transition-colors group"
              >
                {/* Action Badge */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <AuditActionBadge action={log.action} />
                </TableCell>

                {/* Target Entity */}
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 font-semibold bg-muted/60"
                      >
                        {log.entityType}
                      </Badge>
                    </div>
                    <p
                      className="font-mono text-[10.5px] text-muted-foreground truncate max-w-[180px] sm:max-w-[220px]"
                      title={log.entityId}
                    >
                      {log.entityId}
                    </p>
                  </div>
                </TableCell>

                {/* Acting Operator */}
                <TableCell>
                  {log.actor ? (
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">
                        {log.actor.name || log.actor.email}
                      </p>
                      <p className="text-[10.5px] text-muted-foreground font-mono truncate max-w-[160px]">
                        {log.actor.email}
                      </p>
                    </div>
                  ) : (
                    <span className="font-mono text-muted-foreground text-[11px]">
                      System / Webhook
                    </span>
                  )}
                </TableCell>

                {/* Ingress IP */}
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Globe className="size-3 text-muted-foreground/70" />
                    <span>{log.ipAddress || "Internal"}</span>
                  </div>
                </TableCell>

                {/* Timestamp */}
                <TableCell className="font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                  {log.createdAt
                    ? new Date(log.createdAt).toLocaleString()
                    : "-"}
                </TableCell>

                {/* Inspect Action */}
                <TableCell
                  className="text-right whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onInspect(log)}
                    className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="mr-1 size-3.5" />
                    Inspect
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
