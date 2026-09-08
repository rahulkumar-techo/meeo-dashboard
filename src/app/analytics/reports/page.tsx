/**
 * @file page.tsx
 * @description Scheduled Reports & Automated Data Exports Console.
 * Manages recurring BI data exports, customer email distribution, and data lake synchronization.
 */

"use client"

import * as React from "react"
import { Download, Plus, FileSpreadsheet, Calendar, Mail, FileText } from "lucide-react"
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

export interface ScheduledReport {
  id: string
  name: string
  format: "CSV" | "PDF" | "XLSX" | "PARQUET" | string
  frequency: "Daily" | "Weekly" | "Monthly" | string
  recipients: string
  lastGenerated: string
  fileSize: string
  status: "active" | "paused" | "failed" | string
}

export default function ReportsPage() {
  const [reports, setReports] = React.useState<ScheduledReport[]>([])
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
        badge="Data Pipelines"
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
          {
            title: "Active Export Schedules",
            value: `${reports.filter((r) => r.status === "active").length} Schedules`,
            colorTheme: "indigo",
            footnote: "Automated recurring jobs",
          },
          {
            title: "Reports Configured",
            value: `${reports.length}`,
            colorTheme: "emerald",
            footnote: "Total registered exports",
          },
          {
            title: "Export Formats",
            value: "CSV / PDF",
            colorTheme: "cyan",
            footnote: "Supported export standards",
          },
          {
            title: "Scheduler Pipeline",
            value: "Live",
            colorTheme: "emerald",
            badge: { text: "CRON Engine", variant: "success" },
            footnote: "Background worker fleet ready",
          },
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
            title="No Scheduled Reports Configured"
            description="Create an automated scheduled export to deliver recurring commerce telemetry to executives and data analysts."
            actionLabel="Create Scheduled Report"
            onAction={() => {}}
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
                  <TableRow
                    key={rep.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <p className="font-semibold text-foreground">{rep.name}</p>
                      <p className="text-[10.5px] text-muted-foreground font-mono">
                        {rep.id} • {rep.fileSize}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {rep.format}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{rep.frequency}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-xs">
                      {rep.recipients}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {rep.lastGenerated}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={rep.status} showDot />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                      >
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
          totalPages={Math.ceil(filteredReports.length / pageSize) || 1}
          pageSize={pageSize}
          totalItems={filteredReports.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  )
}
