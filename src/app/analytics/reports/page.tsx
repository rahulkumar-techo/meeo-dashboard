/**
 * @file page.tsx
 * @description Scheduled Reports & Automated Data Exports Console (< 220 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Download, Plus, FileSpreadsheet, Calendar, Mail } from "lucide-react"
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
import { SCHEDULED_REPORTS_DATA, ScheduledReport } from "@/data/reports"

export default function ReportsPage() {
  const [reports, setReports] = React.useState<ScheduledReport[]>(SCHEDULED_REPORTS_DATA)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredReports = React.useMemo(() => {
    return reports.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          r.name.toLowerCase().includes(q) ||
          r.recipients.toLowerCase().includes(q) ||
          r.format.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [reports, searchQuery])

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <PageHeader
        title="Scheduled Reports & Automated Data Exports"
        badge="Autonomous Delivery"
        badgeVariant="brand"
        description="Automate recurring PDF/CSV/Parquet business intelligence exports, stakeholder email distribution, and data lake synchronization."
      >
        <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>New Scheduled Report</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Active Export Schedules", value: "3 Schedules", colorTheme: "indigo", footnote: "Daily, Weekly, Monthly jobs" },
          { title: "Reports Dispatched (30D)", value: "48 Reports", colorTheme: "emerald", footnote: "100% on-time delivery" },
          { title: "Data Lake Export Volume", value: "142 MB", colorTheme: "cyan", footnote: "Compressed Parquet archives" },
          { title: "Scheduler Engine", value: "Optimal", colorTheme: "emerald", badge: { text: "CRON Active", variant: "success" }, footnote: "Zero failed runs" },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search report title, recipient, format..."
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredReports.length === 0 ? (
          <EmptyState
            title="No Scheduled Reports Found"
            description="No reports matched your search."
            actionLabel="Reset Search"
            onAction={() => setSearchQuery("")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">REPORT NAME</TableHead>
                  <TableHead className="font-bold">FORMAT</TableHead>
                  <TableHead className="font-bold">FREQUENCY</TableHead>
                  <TableHead className="font-bold">RECIPIENTS</TableHead>
                  <TableHead className="font-bold">LAST GENERATED</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredReports.map((rep) => (
                  <TableRow key={rep.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <p className="font-semibold text-foreground">{rep.name}</p>
                      <p className="text-[10.5px] text-muted-foreground font-mono">{rep.id} • {rep.fileSize}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="font-mono text-[10px]">{rep.format}</Badge></TableCell>
                    <TableCell className="font-medium">{rep.frequency}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-xs">{rep.recipients}</TableCell>
                    <TableCell className="text-muted-foreground">{rep.lastGenerated}</TableCell>
                    <TableCell><StatusBadge status={rep.status} showDot /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <Download className="mr-1 size-3.5" /> Download
                      </Button>
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
          totalItems={filteredReports.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  )
}
