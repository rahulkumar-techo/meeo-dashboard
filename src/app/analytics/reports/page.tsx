"use client"

import * as React from "react"
import Link from "next/link"
import {
  FileText,
  Calendar,
  Clock,
  Database,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Cloud,
  Terminal,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
  Copy,
  ChevronRight,
  MoreVertical,
  Check,
  Sliders,
  Sparkles,
  Layers,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "cn"

interface ScheduledReport {
  id: string
  name: string
  category: "finance" | "inventory" | "marketing" | "compliance"
  categoryLabel: string
  cadence: string
  cronExpr: string
  destinationType: "s3" | "snowflake" | "bigquery" | "sftp"
  destinationPath: string
  lastRunStatus: "success" | "failed" | "running"
  lastRunTime: string
  nextRunTime: string
  avgSize: string
  format: "Parquet" | "CSV" | "JSONL" | "XLSX"
  schemaVersion: string
  sqlQuery: string
}

const INITIAL_REPORTS: ScheduledReport[] = [
  {
    id: "RPT-FIN-001",
    name: "Daily End-of-Day Financial Ledger & Settlement",
    category: "finance",
    categoryLabel: "Finance",
    cadence: "Daily @ 23:59 UTC",
    cronExpr: "0 23:59 * * *",
    destinationType: "s3",
    destinationPath: "s3://apex-finance-lake/settlements/daily/",
    lastRunStatus: "success",
    lastRunTime: "Today, 23:59 (200 OK)",
    nextRunTime: "Tomorrow, 23:59",
    avgSize: "42.4 MB",
    format: "Parquet",
    schemaVersion: "v3.2",
    sqlQuery: `SELECT \n  date_trunc('day', created_at) AS settlement_date,\n  gateway_provider,\n  currency,\n  COUNT(*) AS tx_count,\n  SUM(gross_amount) AS gross_gmv,\n  SUM(fee_amount) AS gateway_fees,\n  SUM(net_settled) AS net_payout\nFROM ledger_transactions\nWHERE status = 'settled'\nGROUP BY 1, 2, 3 ORDER BY 1 DESC;`,
  },
  {
    id: "RPT-INV-004",
    name: "Multi-Hub Inventory Delta & Valuation Ledger",
    category: "inventory",
    categoryLabel: "Logistics",
    cadence: "Every 6 Hours",
    cronExpr: "0 */6 * * *",
    destinationType: "snowflake",
    destinationPath: "Snowflake: ANALYTICS.COMMERCE.INV_SNAPSHOT",
    lastRunStatus: "success",
    lastRunTime: "2h ago (OK)",
    nextRunTime: "In 4 hours",
    avgSize: "18.2 MB",
    format: "Parquet",
    schemaVersion: "v2.0",
    sqlQuery: `SELECT \n  w.warehouse_code,\n  i.sku,\n  i.quantity_on_hand,\n  i.quantity_reserved,\n  i.unit_cost_basis,\n  (i.quantity_on_hand * i.unit_cost_basis) AS total_valuation\nFROM warehouse_inventory i\nJOIN warehouses w ON w.id = i.warehouse_id\nWHERE i.active = true;`,
  },
  {
    id: "RPT-PAY-012",
    name: "Stripe & Multi-Gateway Fee Reconciliation",
    category: "finance",
    categoryLabel: "Finance",
    cadence: "Weekly (Mondays)",
    cronExpr: "0 0 * * 1",
    destinationType: "sftp",
    destinationPath: "sftp.audit.apex.internal/weekly/fees/",
    lastRunStatus: "success",
    lastRunTime: "Oct 28 (OK)",
    nextRunTime: "Nov 04, 00:00",
    avgSize: "14.8 MB",
    format: "CSV",
    schemaVersion: "v1.4",
    sqlQuery: `SELECT \n  gateway_transaction_id,\n  order_id,\n  charge_amount,\n  fixed_fee,\n  variable_fee_pct,\n  interchange_rate\nFROM gateway_settlement_entries\nWHERE settlement_window = CURRENT_WEEK;`,
  },
  {
    id: "RPT-TAX-009",
    name: "State Sales Tax & Nexus Liability Manifest",
    category: "compliance",
    categoryLabel: "Compliance",
    cadence: "Monthly (1st)",
    cronExpr: "0 0 1 * *",
    destinationType: "bigquery",
    destinationPath: "BigQuery: finance_dw.tax_nexus_2024",
    lastRunStatus: "success",
    lastRunTime: "Oct 01 (OK)",
    nextRunTime: "Nov 01, 00:00",
    avgSize: "8.6 MB",
    format: "Parquet",
    schemaVersion: "v4.0",
    sqlQuery: `SELECT \n  shipping_state,\n  tax_jurisdiction_code,\n  COUNT(DISTINCT order_id) AS taxable_transactions,\n  SUM(taxable_base) AS gross_sales,\n  SUM(tax_collected) AS total_tax_remitted\nFROM order_tax_lines\nWHERE tax_status = 'collected'\nGROUP BY 1, 2;`,
  },
  {
    id: "RPT-MKT-021",
    name: "Customer Repurchase Cohort & Retention Feed",
    category: "marketing",
    categoryLabel: "Marketing",
    cadence: "Daily @ 04:00 UTC",
    cronExpr: "0 4 * * *",
    destinationType: "s3",
    destinationPath: "s3://apex-bi-exports/marketing/cohorts/",
    lastRunStatus: "success",
    lastRunTime: "Today, 04:00 (OK)",
    nextRunTime: "Tomorrow, 04:00",
    avgSize: "32.1 MB",
    format: "JSONL",
    schemaVersion: "v2.8",
    sqlQuery: `SELECT \n  customer_id,\n  cohort_month,\n  orders_count_ltd,\n  gmv_ltd,\n  days_since_last_order,\n  predicted_churn_score\nFROM customer_profiles_analytics;`,
  },
]

export default function ScheduledReportsPage() {
  const [reports, setReports] = React.useState<ScheduledReport[]>(INITIAL_REPORTS)
  const [selectedReportId, setSelectedReportId] = React.useState<string>(INITIAL_REPORTS[0].id)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryTab, setCategoryTab] = React.useState("all")
  const [formatFilter, setFormatFilter] = React.useState("all")
  const [isNewExportModalOpen, setIsNewExportModalOpen] = React.useState(false)
  const [copiedQuery, setCopiedQuery] = React.useState(false)

  // New Export Form
  const [newExportForm, setNewExportForm] = React.useState({
    name: "",
    category: "finance" as ScheduledReport["category"],
    cadence: "Daily @ 00:00 UTC",
    cronExpr: "0 0 * * *",
    destinationType: "s3" as ScheduledReport["destinationType"],
    destinationPath: "s3://apex-reports-lake/exports/",
    format: "Parquet" as ScheduledReport["format"],
    sqlQuery: "SELECT * FROM orders WHERE created_at >= NOW() - INTERVAL '24 HOURS';",
  })

  const selectedReport = React.useMemo(() => {
    return reports.find((r) => r.id === selectedReportId) || reports[0]
  }, [reports, selectedReportId])

  // Filter reports
  const filteredReports = React.useMemo(() => {
    return reports.filter((r) => {
      if (categoryTab !== "all" && r.category !== categoryTab) return false
      if (formatFilter !== "all" && r.format !== formatFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          r.name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.destinationPath.toLowerCase().includes(q) ||
          r.categoryLabel.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [reports, categoryTab, formatFilter, searchQuery])

  // Handle create export
  const handleCreateExport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExportForm.name) return

    const newRpt: ScheduledReport = {
      id: `RPT-CUSTOM-${Math.floor(100 + Math.random() * 900)}`,
      name: newExportForm.name,
      category: newExportForm.category,
      categoryLabel: newExportForm.category.charAt(0).toUpperCase() + newExportForm.category.slice(1),
      cadence: newExportForm.cadence,
      cronExpr: newExportForm.cronExpr,
      destinationType: newExportForm.destinationType,
      destinationPath: newExportForm.destinationPath,
      lastRunStatus: "success",
      lastRunTime: "Scheduled (Pending First Run)",
      nextRunTime: "Next Trigger Window",
      avgSize: "Pending",
      format: newExportForm.format,
      schemaVersion: "v1.0",
      sqlQuery: newExportForm.sqlQuery,
    }

    setReports((prev) => [newRpt, ...prev])
    setSelectedReportId(newRpt.id)
    setIsNewExportModalOpen(false)
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase">
            <span>Analytics</span>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">Scheduled Reports & Exports</span>
            <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
              Engine v4.12
            </Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="size-7 text-indigo-600" />
            Scheduled Reports & Data Warehouse Feeds
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Automated financial accounting reconciliations, inventory sync exports, taxation manifests, and ad-hoc query exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
          >
            <Cloud className="size-4 text-indigo-600" />
            Connect S3 / Snowflake
          </Button>
          <Button
            size="sm"
            onClick={() => setIsNewExportModalOpen(true)}
            className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
          >
            <Plus className="size-4" />
            New Scheduled Export
          </Button>
        </div>
      </div>

      {/* 4 Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Recurring Schedules</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-foreground">24</span>
            <span className="text-xs text-indigo-600 font-medium font-mono">Automated Jobs</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-mono pt-1">
            <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-indigo-600" />12 Daily</span>
            <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-purple-500" />8 Weekly</span>
            <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-slate-400" />4 Monthly</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Export Volume (30D)</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <HardDrive className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-foreground">184.2 <span className="text-xs text-muted-foreground font-normal">GB</span></span>
            <span className="text-xs font-mono text-emerald-600">+8.4%</span>
          </div>
          <div className="flex flex-wrap gap-1 text-[10px] font-mono text-muted-foreground pt-1">
            <Badge variant="outline" className="text-[9px] px-1 py-0">Parquet 58%</Badge>
            <Badge variant="outline" className="text-[9px] px-1 py-0">CSV 24%</Badge>
            <Badge variant="outline" className="text-[9px] px-1 py-0">JSONL 12%</Badge>
            <Badge variant="outline" className="text-[9px] px-1 py-0">XLSX 6%</Badge>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Destination Health</span>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono">100% Uptime</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-600">Optimal</span>
            <Cloud className="size-5 text-emerald-600" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-mono pt-1">
            <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" />S3 East</span>
            <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" />Snowflake</span>
            <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" />BigQuery</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Compliance & Security</span>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-mono font-bold">VERIFIED</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-foreground">SOC2 Type II</span>
            <ShieldCheck className="size-5 text-indigo-600" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-mono pt-1">
            <span>PII Redaction: <b>Active</b></span>
            <span>90d SHA-256</span>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
          <Tabs value={categoryTab} onValueChange={setCategoryTab} className="w-full sm:w-auto">
            <TabsList className="bg-muted/70 p-1">
              <TabsTrigger value="all" className="text-xs gap-1.5">
                All Reports <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{reports.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="finance" className="text-xs gap-1.5">
                Financial & Reconciliation
              </TabsTrigger>
              <TabsTrigger value="inventory" className="text-xs gap-1.5">
                Inventory & Logistics
              </TabsTrigger>
              <TabsTrigger value="marketing" className="text-xs gap-1.5">
                Customer & Marketing
              </TabsTrigger>
              <TabsTrigger value="compliance" className="text-xs gap-1.5">
                Compliance
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <Download className="size-3.5" /> Export Manifest
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative min-w-[240px] max-w-md flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Filter by report name, template ID, or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-card"
              />
            </div>

            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="h-8 px-2.5 rounded-md border text-xs bg-card text-foreground cursor-pointer focus:outline-none"
            >
              <option value="all">Format: All Formats</option>
              <option value="Parquet">Apache Parquet</option>
              <option value="CSV">CSV (Gzip)</option>
              <option value="JSONL">JSON Lines</option>
              <option value="XLSX">Excel (XLSX)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split: Table (7 cols) + Report Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Reports Table */}
        <div className="lg:col-span-7 rounded-xl border bg-card shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="h-9">
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Report & ID</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Category</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Schedule / Cron</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Destination</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Avg Size</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-xs">
                    No scheduled reports found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((rpt) => {
                  const isSelected = selectedReportId === rpt.id
                  return (
                    <TableRow
                      key={rpt.id}
                      onClick={() => setSelectedReportId(rpt.id)}
                      className={cn(
                        "h-12 cursor-pointer transition-colors",
                        isSelected ? "bg-indigo-50/70 hover:bg-indigo-50/90" : "hover:bg-muted/40"
                      )}
                    >
                      <TableCell>
                        <div className="space-y-0.5 min-w-[160px]">
                          <div className="font-semibold text-xs text-foreground truncate">{rpt.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                            <span>{rpt.id}</span>
                            <span>•</span>
                            <span>{rpt.schemaVersion}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-mono",
                            rpt.category === "finance" ? "bg-indigo-50 text-indigo-700" :
                            rpt.category === "inventory" ? "bg-emerald-50 text-emerald-700" :
                            rpt.category === "compliance" ? "bg-purple-50 text-purple-700" :
                            "bg-amber-50 text-amber-800"
                          )}
                        >
                          {rpt.categoryLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="text-xs text-foreground font-medium">{rpt.cadence}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{rpt.cronExpr}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
                          <Cloud className="size-3 text-indigo-600 shrink-0" />
                          <span className="truncate">{rpt.destinationPath}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        <span className="font-semibold text-foreground">{rpt.avgSize}</span>
                        <span className="block text-[10px] text-muted-foreground">{rpt.format}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon-sm" className="size-7">
                          <Play className="size-3.5 text-indigo-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Right: Detailed Report Inspector */}
        <div className="lg:col-span-5 rounded-xl border bg-card shadow-2xs p-5 space-y-5 sticky top-20">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Export Configuration</span>
              <h3 className="text-sm font-semibold font-mono text-foreground">{selectedReport.id}</h3>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 font-mono text-[10px] uppercase font-bold">
              Active Cron
            </Badge>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Report Label</span>
              <div className="font-semibold text-foreground mt-0.5">{selectedReport.name}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Schedule Frequency</span>
              <div className="font-mono text-foreground mt-0.5">{selectedReport.cadence} ({selectedReport.cronExpr})</div>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Destination URI</span>
              <div className="font-mono text-foreground mt-0.5 text-[11px] truncate">{selectedReport.destinationPath}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Last Status</span>
              <div className="font-mono text-emerald-600 font-semibold mt-0.5">{selectedReport.lastRunTime}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Next Execution</span>
              <div className="font-mono text-foreground mt-0.5">{selectedReport.nextRunTime}</div>
            </div>
          </div>

          {/* SQL Query / Schema View */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Terminal className="size-3.5 text-indigo-600" />
                SQL Query Manifest
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(selectedReport.sqlQuery)
                  setCopiedQuery(true)
                  setTimeout(() => setCopiedQuery(false), 2000)
                }}
                className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
              >
                {copiedQuery ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                {copiedQuery ? "Copied" : "Copy SQL"}
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
              {selectedReport.sqlQuery}
            </pre>
          </div>

          {/* Inspector Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button size="sm" className="flex-1 text-xs h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Play className="size-3.5" /> Execute & Export Now
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs h-8 gap-1.5">
              <Download className="size-3.5" /> Download Last Batch
            </Button>
          </div>
        </div>
      </div>

      {/* New Scheduled Export Modal */}
      <Dialog open={isNewExportModalOpen} onOpenChange={setIsNewExportModalOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <form onSubmit={handleCreateExport}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4 text-indigo-600" /> Create Scheduled Report & Data Feed
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure automated SQL queries, export cadences, cloud bucket endpoints, and compression formats.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Report Name *</label>
                <Input
                  required
                  placeholder="e.g. Daily Marketplace Tax Nexus Export"
                  value={newExportForm.name}
                  onChange={(e) => setNewExportForm({ ...newExportForm, name: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Category</label>
                  <select
                    value={newExportForm.category}
                    onChange={(e) => setNewExportForm({ ...newExportForm, category: e.target.value as any })}
                    className="w-full h-8 px-2.5 rounded-md border text-xs bg-background"
                  >
                    <option value="finance">Finance & Reconciliation</option>
                    <option value="inventory">Inventory & Logistics</option>
                    <option value="marketing">Customer & Marketing</option>
                    <option value="compliance">Tax & Compliance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Output Format</label>
                  <select
                    value={newExportForm.format}
                    onChange={(e) => setNewExportForm({ ...newExportForm, format: e.target.value as any })}
                    className="w-full h-8 px-2.5 rounded-md border text-xs bg-background font-mono"
                  >
                    <option value="Parquet">Apache Parquet (Columnar)</option>
                    <option value="CSV">CSV (Gzip Compressed)</option>
                    <option value="JSONL">JSON Lines</option>
                    <option value="XLSX">Excel Spreadsheet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Cadence Schedule</label>
                  <Input
                    value={newExportForm.cadence}
                    onChange={(e) => setNewExportForm({ ...newExportForm, cadence: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Cron Expression</label>
                  <Input
                    value={newExportForm.cronExpr}
                    onChange={(e) => setNewExportForm({ ...newExportForm, cronExpr: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Destination Cloud Path / Bucket</label>
                <Input
                  value={newExportForm.destinationPath}
                  onChange={(e) => setNewExportForm({ ...newExportForm, destinationPath: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">SQL Query Definition</label>
                <textarea
                  rows={4}
                  value={newExportForm.sqlQuery}
                  onChange={(e) => setNewExportForm({ ...newExportForm, sqlQuery: e.target.value })}
                  className="w-full p-2.5 rounded-md border font-mono text-xs bg-background focus:outline-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewExportModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
