/**
 * @file page.tsx
 * @description Real-Time Notifications Dispatcher & Webhook Fanout Log (< 220 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Download, Plus, RotateCcw } from "lucide-react"
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
import { NOTIFICATIONS_LOGS, DispatchLog } from "@/data/notifications"

export default function NotificationsPage() {
  const [logs, setLogs] = React.useState<DispatchLog[]>(NOTIFICATIONS_LOGS)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredLogs = React.useMemo(() => {
    return logs.filter((l) => {
      if (channelFilter !== "all" && l.channel !== channelFilter) return false
      if (statusFilter !== "all" && l.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          l.id.toLowerCase().includes(q) ||
          l.eventName.toLowerCase().includes(q) ||
          l.recipient.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [logs, channelFilter, statusFilter, searchQuery])

  const handleRetry = (id: string) => {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: "delivered", statusDetail: "200 OK (Manual Retry)" } : l
      )
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <PageHeader
        title="Notifications & Webhook Fanout Stream"
        badge="Multi-Provider Router"
        badgeVariant="brand"
        description="Transactional email delivery (AWS SES), SMS carrier gateway (Twilio), push alerts, and external webhook integrations."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Logs (CSV)</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Delivery Success Rate", value: "99.8%", colorTheme: "emerald", trend: { value: "+0.1%", isPositive: true }, footnote: "14,890 sent (24h)" },
          { title: "Average Latency", value: "142ms", colorTheme: "indigo", badge: { text: "AWS SES Pool", variant: "success" }, footnote: "P99: 1.2s" },
          { title: "Webhook Retries in Flight", value: "1 Endpoint", colorTheme: "amber", badge: { text: "Throttled", variant: "warning" }, footnote: "Partner ERP" },
          { title: "Bounced / Suppressed", value: "0.02%", colorTheme: "cyan", footnote: "Reputation optimal" },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search message ID, event, recipient..."
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="webhook">Webhook</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        }
        activeFiltersCount={(channelFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
        onResetFilters={() => { setChannelFilter("all"); setStatusFilter("all"); setSearchQuery("") }}
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No Dispatch Logs Found"
            description="No notifications matched your filters."
            actionLabel="Reset Filters"
            onAction={() => { setChannelFilter("all"); setStatusFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">MESSAGE ID</TableHead>
                  <TableHead className="font-bold">CHANNEL</TableHead>
                  <TableHead className="font-bold">EVENT NAME</TableHead>
                  <TableHead className="font-bold">RECIPIENT</TableHead>
                  <TableHead className="font-bold">PROVIDER</TableHead>
                  <TableHead className="font-bold">LATENCY</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell><StatusBadge status={log.status} label={log.statusDetail} showDot /></TableCell>
                    <TableCell className="font-mono font-medium text-foreground">{log.id}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] uppercase">{log.channel}</Badge></TableCell>
                    <TableCell className="font-semibold text-foreground">{log.eventName}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{log.recipient}</TableCell>
                    <TableCell className="text-muted-foreground">{log.provider}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{log.latencyMs}ms</TableCell>
                    <TableCell className="text-right">
                      {log.status === "failed" && (
                        <Button size="sm" onClick={() => handleRetry(log.id)} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                          <RotateCcw className="mr-1 size-3" /> Retry Dispatch
                        </Button>
                      )}
                    </TableCell>
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
