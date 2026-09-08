/**
 * @file audit-log-detail-sheet.tsx
 * @description Deep Inspection Drawer for Audit Log Records and State Diffs.
 * Displays actor identity, network ingress headers, masked PII, and side-by-side JSON state diffs.
 */

"use client"

import * as React from "react"
import {
  Copy,
  Check,
  Globe,
  User,
  Clock,
  Terminal,
  ShieldCheck,
  Layers,
  ArrowRight,
  FileCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DetailDrawer } from "@/components/common/detail-drawer"
import { AuditActionBadge } from "./audit-action-badge"
import { useAuditLogDetailQuery } from "@/hooks/use-audit-log-query"
import { Skeleton } from "@/components/ui/skeleton"
import type { AuditLogItem } from "@/types/audit-log"

export interface AuditLogDetailSheetProps {
  log: AuditLogItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogDetailSheet({
  log,
  open,
  onOpenChange,
}: AuditLogDetailSheetProps) {
  const [copied, setCopied] = React.useState(false)
  const logId = log?.id || ""

  const { data: detail, isLoading } = useAuditLogDetailQuery(logId, open)

  const record = detail || log

  const handleCopyJSON = () => {
    if (!record) return
    navigator.clipboard.writeText(JSON.stringify(record, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const oldValue = record?.oldValue
  const newValue = record?.newValue

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={
        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          <span>{record?.action || "Audit Record"}</span>
          {record?.action && <AuditActionBadge action={record.action} />}
        </div>
      }
      description={`Audit Event ID: ${logId}`}
      footer={
        <div className="flex w-full items-center justify-between gap-3 text-xs">
          <span className="font-mono text-[11px] text-muted-foreground truncate">
            Entity: {record?.entityType} ({record?.entityId})
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJSON}
            className="h-8 gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span>Copied JSON</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy Raw JSON</span>
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* 1. Forensic Header Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-border/80 bg-muted/20 p-3.5">
          <div>
            <span className="text-muted-foreground text-[11px]">Entity Type:</span>
            <p className="font-mono font-semibold text-foreground">
              {record?.entityType || "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Target Entity ID:</span>
            <p className="font-mono font-semibold text-foreground truncate" title={record?.entityId}>
              {record?.entityId || "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">IP Address:</span>
            <p className="font-mono font-semibold text-foreground">
              {record?.ipAddress || "Internal"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Timestamp:</span>
            <p className="font-mono font-semibold text-foreground">
              {record?.createdAt
                ? new Date(record.createdAt).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>

        {/* 2. Acting Administrator Profile */}
        <div className="rounded-lg border border-border/80 bg-card p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <User className="size-4 text-primary" />
            <span>Acting Operator Identity</span>
          </div>
          {record?.actor ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-semibold text-foreground">
                  {record.actor.name || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-mono font-semibold text-primary">
                  {record.actor.email}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Actor UUID:</span>
                <p className="font-mono text-muted-foreground truncate" title={record.actor.id}>
                  {record.actor.id}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground font-mono text-[11px]">
              Automated System Cron / Webhook Ingress
            </p>
          )}

          {record?.userAgent && (
            <div className="pt-2 border-t border-border/60">
              <span className="text-[10.5px] text-muted-foreground">User Agent:</span>
              <p className="font-mono text-[10.5px] text-muted-foreground break-all">
                {record.userAgent}
              </p>
            </div>
          )}
        </div>

        {/* 3. Sensitive Data Masking Compliance Banner */}
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[11px] text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Automated PII Masking: Passwords, tokens, and PAN cards are cryptographically redacted before ledger write.
          </span>
        </div>

        {/* 4. State Diff Comparison (oldValue vs newValue) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <FileCode className="size-4 text-primary" />
            <span>State Mutation Diff (Before & After)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Old Value */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                <span>Previous State (oldValue)</span>
              </div>
              <pre className="max-h-56 overflow-auto rounded-lg border border-rose-500/20 bg-zinc-950 p-3 font-mono text-[11px] text-rose-300 dark:bg-zinc-900">
                <code>
                  {oldValue
                    ? JSON.stringify(oldValue, null, 2)
                    : "// No previous state record"}
                </code>
              </pre>
            </div>

            {/* New Value */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span>New Mutated State (newValue)</span>
              </div>
              <pre className="max-h-56 overflow-auto rounded-lg border border-emerald-500/20 bg-zinc-950 p-3 font-mono text-[11px] text-emerald-300 dark:bg-zinc-900">
                <code>
                  {newValue
                    ? JSON.stringify(newValue, null, 2)
                    : "// No new state record"}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </DetailDrawer>
  )
}
