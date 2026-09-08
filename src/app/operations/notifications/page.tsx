/**
 * @file page.tsx
 * @description Central Notification & Communication Operations Console.
 * Directly integrates with Admin Notification API (POST /api/v1/notifications/send, POST /:id/retry) with multi-channel dispatch, delivery error tracking, and audio chime alerts.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Send,
  RotateCcw,
  Download,
  Mail,
  Smartphone,
  Bell,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Play,
  Layers,
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
import {
  PageHeader,
  MetricGrid,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import {
  NotificationChannelBadge,
  NotificationStatusBadge,
  NotificationSoundToggle,
  DispatchNotificationDialog,
  RetryNotificationDialog,
  NotificationTemplateCard,
} from "@/components/notifications"
import { notificationAudio } from "@/lib/notification-sound"
import type {
  NotificationChannel,
  NotificationStatus,
  NotificationLogItem,
} from "@/types/notification"

export default function NotificationsPage() {
  const [logs, setLogs] = React.useState<NotificationLogItem[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Modals state
  const [dispatchOpen, setDispatchOpen] = React.useState(false)
  const [retryItem, setRetryItem] = React.useState<NotificationLogItem | null>(null)
  const [retryOpen, setRetryOpen] = React.useState(false)

  // Filtered log records
  const filteredLogs = React.useMemo(() => {
    return logs.filter((l) => {
      if (channelFilter !== "all" && l.channel !== channelFilter) return false
      if (statusFilter !== "all" && l.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          l.id.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q) ||
          l.title.toLowerCase().includes(q) ||
          (l.recipientEmail && l.recipientEmail.toLowerCase().includes(q)) ||
          (l.userId && l.userId.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [logs, channelFilter, statusFilter, searchQuery])

  // Real-time KPI summary
  const metrics = React.useMemo(() => {
    let sentCount = 0
    let failedCount = 0
    let emailCount = 0
    let pushCount = 0
    let inAppCount = 0

    logs.forEach((l) => {
      if (l.status === "SENT") sentCount++
      else if (l.status === "FAILED") failedCount++

      if (l.channel === "EMAIL") emailCount++
      else if (l.channel === "PUSH") pushCount++
      else if (l.channel === "IN_APP") inAppCount++
    })

    const total = logs.length
    const successRate = total > 0 ? ((sentCount / total) * 100).toFixed(1) : "100.0"

    return {
      sentCount,
      failedCount,
      emailCount,
      pushCount,
      inAppCount,
      successRate,
    }
  }, [logs])

  const handleRetryPrompt = (item: NotificationLogItem) => {
    setRetryItem(item)
    setRetryOpen(true)
  }

  const handleRetrySuccess = () => {
    if (retryItem) {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === retryItem.id
            ? {
                ...l,
                status: "SENT",
                attempts: l.attempts + 1,
                lastError: null,
                sentAt: new Date().toISOString(),
              }
            : l
        )
      )
    }
  }

  const handleDispatchSuccess = (res: any) => {
    // Append new records to top of live log
    const newItems: NotificationLogItem[] = res.results.map((r: any) => ({
      id: r.notificationId || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "CAMPAIGN",
      title: "Dispatched Notification",
      body: "Multi-channel message",
      channel: r.channel,
      status: r.success ? "SENT" : "FAILED",
      attempts: 1,
      lastError: r.error || null,
      sentAt: r.success ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
    }))

    setLogs((prev) => [...newItems, ...prev])
  }

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return
    const headers = [
      "Notification ID",
      "Type",
      "Channel",
      "Title",
      "Recipient",
      "Status",
      "Attempts",
      "Last Error",
      "Sent At",
    ]
    const rows = filteredLogs.map((l) => [
      l.id,
      l.type,
      l.channel,
      l.title,
      l.recipientEmail || l.userId || "Broadcast",
      l.status,
      l.attempts,
      l.lastError || "",
      l.sentAt || "",
    ])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `notification_logs_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Notification & Communication Engine"
        badge="Email · Push · In-App"
        badgeVariant="brand"
        description="Multi-channel message dispatcher, transactional email delivery (SMTP/Resend), push fanout, and delivery error retry engine."
      >
        <div className="flex items-center gap-2">
          {/* Audio Chime Controls */}
          <NotificationSoundToggle />

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export Logs (CSV)</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setDispatchOpen(true)}
            className="h-8.5 gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Send className="size-3.5" />
            <span>Dispatch Notification</span>
          </Button>
        </div>
      </PageHeader>

      {/* 2. KPI Metrics Grid */}
      <MetricGrid
        columns={4}
        items={[
          {
            title: "Delivery Success Rate",
            value: `${metrics.successRate}%`,
            colorTheme: "emerald",
            trend: {
              value: Number(metrics.successRate) >= 98 ? "Optimal" : "Attention",
              isPositive: Number(metrics.successRate) >= 98,
            },
            footnote: `${metrics.sentCount} delivered successfully`,
          },
          {
            title: "Failed Delivery Queue",
            value: `${metrics.failedCount} Messages`,
            colorTheme: "rose",
            badge:
              metrics.failedCount > 0
                ? { text: "Retry Ready", variant: "destructive" }
                : undefined,
            footnote: "Self-healing retry enabled",
          },
          {
            title: "Email Dispatch (SMTP)",
            value: `${metrics.emailCount} Sent`,
            colorTheme: "indigo",
            footnote: "Resend / SMTP driver active",
          },
          {
            title: "Push & In-App Alerts",
            value: `${metrics.pushCount + metrics.inAppCount} Delivered`,
            colorTheme: "cyan",
            footnote: `${metrics.pushCount} push, ${metrics.inAppCount} in-app`,
          },
        ]}
      />

      {/* 3. Notification Templates Reference */}
      <NotificationTemplateCard />

      {/* 4. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search message ID, event type, recipient..."
        filters={
          <div className="flex items-center gap-2">
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value)
                setPage(1)
              }}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Channels</option>
              <option value="EMAIL">Email (SMTP)</option>
              <option value="PUSH">Mobile Push</option>
              <option value="IN_APP">In-App Feed</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Delivery Statuses</option>
              <option value="SENT">Delivered (Sent)</option>
              <option value="FAILED">Failed (Delivery Error)</option>
              <option value="PENDING">Queued / Pending</option>
            </select>
          </div>
        }
        activeFiltersCount={
          (channelFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)
        }
        onResetFilters={() => {
          setChannelFilter("all")
          setStatusFilter("all")
          setSearchQuery("")
          setPage(1)
        }}
      />

      {/* 5. Logs Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No Notification Logs Found"
            description="No dispatched messages matched your active query filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setChannelFilter("all")
              setStatusFilter("all")
              setSearchQuery("")
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
                  <TableHead className="font-bold">NOTIFICATION ID</TableHead>
                  <TableHead className="font-bold">EVENT TYPE</TableHead>
                  <TableHead className="font-bold">CHANNEL</TableHead>
                  <TableHead className="font-bold">TITLE / SUBJECT</TableHead>
                  <TableHead className="font-bold">RECIPIENT</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">ATTEMPTS</TableHead>
                  <TableHead className="font-bold">SENT DATE</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredLogs.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    <TableCell className="font-mono text-muted-foreground text-[11px]">
                      {item.id.length > 16
                        ? `${item.id.slice(0, 12)}...`
                        : item.id}
                    </TableCell>

                    <TableCell>
                      <code className="text-[11px] font-mono font-semibold bg-muted px-1.5 py-0.5 rounded text-foreground">
                        {item.type}
                      </code>
                    </TableCell>

                    <TableCell>
                      <NotificationChannelBadge channel={item.channel} />
                    </TableCell>

                    <TableCell className="font-medium text-foreground max-w-[220px] truncate">
                      {item.title}
                    </TableCell>

                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {item.recipientEmail ||
                        (item.userId
                          ? `${item.userId.slice(0, 10)}...`
                          : "Broadcast")}
                    </TableCell>

                    <TableCell>
                      <NotificationStatusBadge status={item.status} />
                    </TableCell>

                    <TableCell className="font-mono text-[11px]">
                      {item.attempts}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-[11px]">
                      {item.sentAt
                        ? new Date(item.sentAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Not sent"}
                    </TableCell>

                    <TableCell className="text-right">
                      {item.status === "FAILED" && (
                        <Button
                          size="sm"
                          onClick={() => handleRetryPrompt(item)}
                          className="h-7 px-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-1"
                          title="Retry Delivery"
                        >
                          <RotateCcw className="size-3" />
                          <span>Retry</span>
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
          totalPages={Math.ceil(filteredLogs.length / pageSize) || 1}
          pageSize={pageSize}
          totalItems={filteredLogs.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 6. Modals */}
      <DispatchNotificationDialog
        open={dispatchOpen}
        onOpenChange={setDispatchOpen}
        onSuccess={handleDispatchSuccess}
      />

      <RetryNotificationDialog
        item={retryItem}
        open={retryOpen}
        onOpenChange={setRetryOpen}
        onSuccess={handleRetrySuccess}
      />
    </div>
  )
}
