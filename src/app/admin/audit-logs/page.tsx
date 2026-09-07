/**
 * @file page.tsx
 * @description Immutable Compliance Audit Trail & Administrative Event Ledger (< 200 lines).
 */

"use client"

import * as React from "react"
import { Download, ShieldCheck, Terminal, Eye } from "lucide-react"
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
import {
  PageHeader,
  MetricGrid,
  StatusBadge,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import { ADMIN_AUDIT_LOGS, AuditLogEntry } from "@/data/admin"

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>(ADMIN_AUDIT_LOGS)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredLogs = React.useMemo(() => {
    return logs.filter((l) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          l.id.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.actor.toLowerCase().includes(q) ||
          l.resource.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [logs, searchQuery])

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Compliance Audit Trail & Administrative Ledger"
        badge="WORM Tamper-Evident"
        badgeVariant="success"
        description="Cryptographically signed ledger of all administrative mutations, permission escalations, refund approvals, and security events."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Audit Log (JSON)</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Logged Actions (30D)", value: "14,820", colorTheme: "indigo", footnote: "100% write-once audit guarantee" },
          { title: "Sensitive Mutations", value: "3 Events", colorTheme: "amber", badge: { text: "Verified", variant: "warning" }, footnote: "Refunds & permissions" },
          { title: "Cryptographic Chain", value: "Valid", colorTheme: "emerald", badge: { text: "SHA-256", variant: "success" }, footnote: "Zero hash anomalies" },
          { title: "SOC-2 Compliance", value: "Certified", colorTheme: "cyan", footnote: "Annual audit verified" },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search action name, operator actor, resource ID..."
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No Audit Records Found"
            description="No audit trail events matched your search."
            actionLabel="Reset Filters"
            onAction={() => setSearchQuery("")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">EVENT ID</TableHead>
                  <TableHead className="font-bold">ACTION</TableHead>
                  <TableHead className="font-bold">ACTOR</TableHead>
                  <TableHead className="font-bold">RESOURCE TARGET</TableHead>
                  <TableHead className="font-bold">IP INGRESS</TableHead>
                  <TableHead className="font-bold text-right">TIMESTAMP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell><StatusBadge status={log.status} showDot /></TableCell>
                    <TableCell className="font-mono font-medium text-foreground">{log.id}</TableCell>
                    <TableCell className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{log.action}</TableCell>
                    <TableCell>
                      <p className="font-semibold text-foreground">{log.actor}</p>
                      <p className="text-[10.5px] text-muted-foreground">{log.actorEmail}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{log.resource}</p>
                      <p className="text-[10.5px] font-mono text-muted-foreground">{log.resourceId}</p>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{log.ipAddress}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{log.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DataTablePagination
          currentPage={page}
          totalPages={1}
          pageSize={pageSize}
          totalItems={filteredLogs.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  )
}
