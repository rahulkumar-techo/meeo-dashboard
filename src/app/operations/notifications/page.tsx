/**
 * @file page.tsx
 * @description Central Notification & Communication Operations Console.
 * Directly integrates with Admin Notification API:
 * - GET /api/v1/notifications/admin/overview (Aggregated KPIs & channel stats)
 * - GET /api/v1/notifications/admin (Filtered notification log list)
 * - POST /api/v1/notifications/send (Multi-channel dispatch)
 * - POST /api/v1/notifications/:id/retry (Failed delivery retry)
 */

"use client"

import * as React from "react"
import {
  Send,
  RotateCcw,
  Download,
  RefreshCw,
  Clock,
  User,
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
  NotificationPermissionCard,
} from "@/components/notifications"
import {
  useAdminNotificationOverviewQuery,
  useAdminNotificationsQuery,
} from "@/hooks/use-notification-query"
import type {
  AdminNotificationItem,
  AdminNotificationFilters,
} from "@/types/notification"

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Modals state
  const [dispatchOpen, setDispatchOpen] = React.useState(false)
  const [retryItem, setRetryItem] = React.useState<AdminNotificationItem | null>(null)
  const [retryOpen, setRetryOpen] = React.useState(false)

  // Construct query filters
  const filters: AdminNotificationFilters = React.useMemo(() => {
    const f: AdminNotificationFilters = {
      page,
      limit: pageSize,
    }
    if (channelFilter !== "all") f.channel = channelFilter as any
    if (statusFilter !== "all") f.status = statusFilter as any
    if (searchQuery.trim()) f.search = searchQuery.trim()
    return f
  }, [page, pageSize, channelFilter, statusFilter, searchQuery])

  // Backend Queries
  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    isRefetching: isRefetchingOverview,
    refetch: refetchOverview,
  } = useAdminNotificationOverviewQuery()

  const {
    data: listData,
    isLoading: isLoadingList,
    isRefetching: isRefetchingList,
    refetch: refetchList,
  } = useAdminNotificationsQuery(filters)

  const isRefreshing = isRefetchingOverview || isRefetchingList

  const handleRefreshAll = () => {
    refetchOverview()
    refetchList()
  }

  const handleRetryPrompt = (item: AdminNotificationItem) => {
    setRetryItem(item)
    setRetryOpen(true)
  }

  const handleRetrySuccess = () => {
    refetchOverview()
    refetchList()
  }

  const handleDispatchSuccess = () => {
    refetchOverview()
    refetchList()
  }

  const items = listData?.items || []
  const totalItems = listData?.pagination.total || 0
  const totalPages = listData?.pagination.totalPages || 1

  const handleExportCSV = () => {
    if (items.length === 0) return
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
      "Created At",
    ]
    const rows = items.map((l) => [
      l.id,
      l.type,
      l.channel,
      l.title,
      l.recipientEmail || (l.user?.email ? `${l.user.firstName || ""} ${l.user.lastName || ""} (${l.user.email})`.trim() : l.userId || "Broadcast"),
      l.status,
      l.attempts,
      l.lastError || "",
      l.sentAt || "",
      l.createdAt || "",
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

  const overview = overviewData?.overview
  const channelBreakdown = overviewData?.channelBreakdown

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
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={items.length === 0}
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
            value: `${overview ? overview.successRate : 100}%`,
            colorTheme: "emerald",
            trend: {
              value: (overview?.successRate ?? 100) >= 98 ? "Optimal" : "Attention",
              isPositive: (overview?.successRate ?? 100) >= 98,
            },
            footnote: `${overview?.successfulDeliveries ?? 0} delivered successfully`,
          },
          {
            title: "Failed Delivery Queue",
            value: `${overview?.failedDeliveries ?? 0} Messages`,
            colorTheme: "rose",
            badge:
              (overview?.failedDeliveries ?? 0) > 0
                ? { text: "Retry Ready", variant: "destructive" }
                : undefined,
            footnote: `${overview?.pendingDeliveries ?? 0} pending / queued`,
          },
          {
            title: "Email Dispatch (SMTP)",
            value: `${channelBreakdown?.EMAIL ?? 0} Sent`,
            colorTheme: "indigo",
            footnote: "Transactional & SMTP active",
          },
          {
            title: "Push & In-App Alerts",
            value: `${(channelBreakdown?.PUSH ?? 0) + (channelBreakdown?.IN_APP ?? 0)} Delivered`,
            colorTheme: "cyan",
            footnote: `${channelBreakdown?.PUSH ?? 0} push, ${channelBreakdown?.IN_APP ?? 0} in-app`,
          },
        ]}
      />

      {/* 3. Push Notification & Device Permission Authorization */}
      <NotificationPermissionCard />

      {/* 4. Notification Templates Reference */}
      <NotificationTemplateCard />

      {/* 5. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val)
          setPage(1)
        }}
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
              <option value="READ">Read (In-App)</option>
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

      {/* 6. Logs Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {isLoadingList ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="size-4 animate-spin text-indigo-500" />
            <span>Loading platform notification records...</span>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No Notification Logs Found"
            description="No dispatched messages matched your active query filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setChannelFilter("all")
              setStatusFilter("all")
              setSearchQuery("")
              setPage(1)
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
                {items.map((item) => (
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

                    <TableCell className="font-medium text-foreground max-w-[220px] truncate" title={item.title}>
                      {item.title}
                    </TableCell>

                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {item.user ? (
                        <div className="flex items-center gap-1">
                          <User className="size-3 text-muted-foreground" />
                          <span>{item.user.firstName || item.user.email || item.user.id.slice(0, 8)}</span>
                        </div>
                      ) : item.recipientEmail ? (
                        item.recipientEmail
                      ) : item.userId ? (
                        `${item.userId.slice(0, 10)}...`
                      ) : (
                        "Broadcast"
                      )}
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
                        : item.createdAt
                        ? new Date(item.createdAt).toLocaleTimeString([], {
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
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
        />
      </div>

      {/* 7. Modals */}
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
