"use client"

import * as React from "react"
import Link from "next/link"
import {
  Cpu,
  Server,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Terminal,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Zap,
  ArrowRight,
  Database,
  Eye,
  Copy,
  ChevronRight,
  MoreVertical,
  Check,
  Radio,
  SlidersHorizontal,
  Flame,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "cn"

interface BackgroundJob {
  id: string
  handler: string
  queue: "critical-checkout" | "order-fulfillment-sync" | "marketing-email-batch" | "dead-letter-triage"
  priority: string
  workerNode: string
  pid: number
  status: "running" | "completed" | "failed" | "retrying" | "queued"
  runtime: string
  memory: string
  startedAgo: string
  attempts: string
  args: Record<string, any>
  stackTrace?: string
  errorReason?: string
}

const INITIAL_JOBS: BackgroundJob[] = [
  {
    id: "job_4481b092",
    handler: "SyncFedExTrackingUpdatesJob",
    queue: "dead-letter-triage",
    priority: "P10 (Sync)",
    workerNode: "pod-02c.us-east-1",
    pid: 24108,
    status: "failed",
    runtime: "8.4s (Timeout)",
    memory: "84 MB",
    startedAgo: "4m ago",
    attempts: "3/3 EXHAUSTED",
    args: { order_id: "ORD-10244", carrier: "FEDEX", tracking_id: "748928192019" },
    errorReason: "HTTP 504 Gateway Timeout from FedEx API v3",
    stackTrace: `CarrierTimeoutError: Endpoint api.fedex.com/track/v3 failed after 8000ms\n  at FedExGateway.fetchStatus (/app/services/carriers/fedex.ts:142)\n  at SyncFedExTrackingUpdatesJob.perform (/app/jobs/sync_fedex.ts:38)\n  at Worker.execute (/app/node_modules/bullmq/dist/classes/worker.js:180)`,
  },
  {
    id: "job_8f29c41d",
    handler: "ProcessStripeWebhookJob",
    queue: "critical-checkout",
    priority: "P0 (Realtime)",
    workerNode: "pod-01a.us-east-1",
    pid: 9281,
    status: "running",
    runtime: "124ms",
    memory: "42 MB",
    startedAgo: "Just now",
    attempts: "1/1",
    args: { evt_id: "evt_3M4k9bL291k", amt: 29900, currency: "usd" },
  },
  {
    id: "job_1192d04a",
    handler: "GenerateQuarterlyTaxReportJob",
    queue: "order-fulfillment-sync",
    priority: "P10 (Normal)",
    workerNode: "pod-04b.us-east-1",
    pid: 18492,
    status: "running",
    runtime: "4.2s",
    memory: "188 MB",
    startedAgo: "12s ago",
    attempts: "1/1",
    args: { quarter: "Q3-2024", entity_id: "ENT_US_MAIN" },
  },
  {
    id: "job_7731a89c",
    handler: "BroadcastPushNotificationBatchJob",
    queue: "marketing-email-batch",
    priority: "P50 (Low)",
    workerNode: "pod-02c.us-east-1",
    pid: 31092,
    status: "queued",
    runtime: "—",
    memory: "—",
    startedAgo: "In queue (pos #4)",
    attempts: "0/3",
    args: { campaign_id: "cmp_autumn_drop", recipients_count: 4200 },
  },
  {
    id: "job_9921b302",
    handler: "ReserveWarehouseInventoryLockJob",
    queue: "critical-checkout",
    priority: "P0 (Realtime)",
    workerNode: "pod-01b.us-east-1",
    pid: 14029,
    status: "completed",
    runtime: "18ms",
    memory: "36 MB",
    startedAgo: "1m ago",
    attempts: "1/1",
    args: { sku: "APX-KB-BLK-TAC", warehouse_id: "wh_us_east_1", qty: 1 },
  },
]

export default function BackgroundJobsPage() {
  const [jobs, setJobs] = React.useState<BackgroundJob[]>(INITIAL_JOBS)
  const [selectedJobId, setSelectedJobId] = React.useState<string>(INITIAL_JOBS[0].id)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [queueFilter, setQueueFilter] = React.useState("all")
  const [statusTab, setStatusTab] = React.useState("all")
  const [isTriggerModalOpen, setIsTriggerModalOpen] = React.useState(false)
  const [copiedArgs, setCopiedArgs] = React.useState(false)

  // Manual Trigger Form
  const [triggerForm, setTriggerForm] = React.useState({
    handler: "SyncFedExTrackingUpdatesJob",
    queue: "critical-checkout" as BackgroundJob["queue"],
    priority: "P0 (High)",
    payload: '{\n  "order_id": "ORD-10250",\n  "force_sync": true\n}',
  })

  const selectedJob = React.useMemo(() => {
    return jobs.find((j) => j.id === selectedJobId) || jobs[0]
  }, [jobs, selectedJobId])

  // Filter jobs
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((j) => {
      if (statusTab === "running" && j.status !== "running") return false
      if (statusTab === "failed" && j.status !== "failed") return false
      if (statusTab === "queued" && j.status !== "queued") return false
      if (statusTab === "completed" && j.status !== "completed") return false

      if (queueFilter !== "all" && j.queue !== queueFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          j.id.toLowerCase().includes(q) ||
          j.handler.toLowerCase().includes(q) ||
          j.workerNode.toLowerCase().includes(q) ||
          j.queue.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [jobs, statusTab, queueFilter, searchQuery])

  // Re-queue job
  const handleRequeueJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          return {
            ...j,
            status: "running",
            runtime: "14ms",
            attempts: "1/3 Retried",
            errorReason: undefined,
            stackTrace: undefined,
          }
        }
        return j
      })
    )
  }

  // Handle manual trigger
  const handleTriggerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let parsed = {}
    try {
      parsed = JSON.parse(triggerForm.payload)
    } catch {
      parsed = { raw: triggerForm.payload }
    }

    const newJob: BackgroundJob = {
      id: `job_${Math.floor(10000000 + Math.random() * 90000000).toString(16)}`,
      handler: triggerForm.handler,
      queue: triggerForm.queue,
      priority: triggerForm.priority,
      workerNode: "pod-01a.us-east-1",
      pid: Math.floor(10000 + Math.random() * 20000),
      status: "running",
      runtime: "8ms",
      memory: "38 MB",
      startedAgo: "Just now",
      attempts: "1/1",
      args: parsed,
    }

    setJobs((prev) => [newJob, ...prev])
    setSelectedJobId(newJob.id)
    setIsTriggerModalOpen(false)
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase">
            <span>Operations</span>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">Worker Queue Pools</span>
            <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
              12 Nodes Online
            </Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Cpu className="size-7 text-indigo-600" />
            Background Jobs & Worker Queue Operations
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Real-time telemetry for distributed BullMQ & Celery worker nodes, retry policies, payload debugging, and dead-letter recovery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/60 text-xs font-mono text-muted-foreground">
            <Server className="size-3.5 text-indigo-600" />
            <span>Redis 7.2.4 Cluster (Replica Synced)</span>
          </div>
          <Button
            size="sm"
            onClick={() => setIsTriggerModalOpen(true)}
            className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
          >
            <Play className="size-4" />
            Manual Job Trigger
          </Button>
        </div>
      </div>

      {/* 4 High-Density Cluster KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Worker Threads</span>
            <Badge variant="outline" className="font-mono text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">66.7% Saturation</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">64 <span className="text-xs text-muted-foreground font-normal">/ 96 threads</span></span>
            <Cpu className="size-5 text-indigo-600" />
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "66.7%" }} />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>12 Node Pods</span>
              <span>32 idle reserve</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Job Throughput</span>
            <span className="font-mono text-[11px] text-muted-foreground">84.2k / hr</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">1,420 <span className="text-xs text-muted-foreground font-normal">/ min</span></span>
            {/* Sparkline */}
            <svg className="w-20 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 100 30">
              <path d="M0 24 L14 20 L28 22 L42 12 L56 16 L70 6 L84 10 L100 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
            <span>Peak 2,800/min</span>
            <span className="text-emerald-600 font-semibold">+14.2% vs avg</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Queue Latency (p99)</span>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px]">SLA In Bounds</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">42ms</span>
            <Activity className="size-5 text-emerald-600" />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
            <span>p50: 9ms</span>
            <span>p95: 28ms</span>
            <span>jitter: ±3ms</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Dead Letter Queue</span>
            <Badge className="bg-rose-100 text-rose-800 border-none font-mono text-[10px] font-bold">14 FAILED</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-rose-600 font-mono">14 <span className="text-xs text-muted-foreground font-normal">Jobs</span></span>
            <AlertTriangle className="size-5 text-rose-600" />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
            <span>$0 risk exposure</span>
            <span className="text-indigo-600 font-semibold">3 auto-retrying</span>
          </div>
        </div>
      </div>

      {/* 4 Queue Pools Bento Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Queue Pool Allocations</h2>
            <Badge variant="outline" className="font-mono text-[10px]">4 Active Channels</Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600 gap-1">
            <SlidersHorizontal className="size-3" /> Adjust Concurrency Weights
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Pool 1 */}
          <div className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-mono text-xs font-semibold text-foreground truncate">critical-checkout</span>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[9px]">Healthy</Badge>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center bg-muted/40 rounded p-1 font-mono text-xs">
              <div><span className="text-[10px] text-muted-foreground">Act</span><div className="font-bold">18</div></div>
              <div><span className="text-[10px] text-muted-foreground">Que</span><div className="font-bold">0</div></div>
              <div><span className="text-[10px] text-muted-foreground">Del</span><div className="text-muted-foreground">0</div></div>
              <div><span className="text-[10px] text-muted-foreground">Fail</span><div className="text-emerald-600 font-bold">0</div></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>24 workers • P0</span>
              <span className="font-semibold text-foreground">4ms p99</span>
            </div>
          </div>

          {/* Pool 2 */}
          <div className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-mono text-xs font-semibold text-foreground truncate">order-fulfillment-sync</span>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[9px]">Healthy</Badge>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center bg-muted/40 rounded p-1 font-mono text-xs">
              <div><span className="text-[10px] text-muted-foreground">Act</span><div className="font-bold">22</div></div>
              <div><span className="text-[10px] text-muted-foreground">Que</span><div className="font-bold">4</div></div>
              <div><span className="text-[10px] text-muted-foreground">Del</span><div className="font-bold">12</div></div>
              <div><span className="text-[10px] text-muted-foreground">Fail</span><div className="text-amber-600 font-bold">1</div></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>32 workers • P10</span>
              <span className="font-semibold text-foreground">18ms p99</span>
            </div>
          </div>

          {/* Pool 3 */}
          <div className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                <span className="font-mono text-xs font-semibold text-foreground truncate">marketing-email-batch</span>
              </div>
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-mono text-[9px]">Backlog</Badge>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center bg-muted/40 rounded p-1 font-mono text-xs">
              <div><span className="text-[10px] text-muted-foreground">Act</span><div className="font-bold">16</div></div>
              <div><span className="text-[10px] text-muted-foreground">Que</span><div className="text-amber-600 font-bold">142</div></div>
              <div><span className="text-[10px] text-muted-foreground">Del</span><div className="font-bold">850</div></div>
              <div><span className="text-[10px] text-muted-foreground">Fail</span><div className="text-amber-600 font-bold">2</div></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>16 workers • P50</span>
              <span className="font-semibold text-amber-700">240ms p99</span>
            </div>
          </div>

          {/* Pool 4 */}
          <div className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                <span className="font-mono text-xs font-semibold text-rose-600 truncate">dead-letter-triage</span>
              </div>
              <Badge className="bg-rose-100 text-rose-800 border-none font-mono text-[9px] font-bold">Alert (14)</Badge>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center bg-rose-50 rounded p-1 font-mono text-xs">
              <div><span className="text-[10px] text-muted-foreground">Tot</span><div className="text-rose-700 font-bold">14</div></div>
              <div><span className="text-[10px] text-muted-foreground">Ret</span><div className="font-bold">14d</div></div>
              <div><span className="text-[10px] text-muted-foreground">Rtry</span><div className="text-indigo-600 font-bold">3</div></div>
              <div><span className="text-[10px] text-muted-foreground">Dead</span><div className="text-rose-700 font-bold">11</div></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>Backoff (5x)</span>
              <span className="font-semibold text-rose-600">Action Needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
          <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full sm:w-auto">
            <TabsList className="bg-muted/70 p-1">
              <TabsTrigger value="all" className="text-xs gap-1.5">
                All Jobs <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{jobs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="running" className="text-xs gap-1.5">
                Active Running <Badge className="bg-indigo-100 text-indigo-800 px-1.5 py-0 text-[10px]">{jobs.filter(j => j.status === "running").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="failed" className="text-xs gap-1.5">
                Failed / DLQ <Badge className="bg-rose-100 text-rose-800 px-1.5 py-0 text-[10px]">{jobs.filter(j => j.status === "failed").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="queued" className="text-xs gap-1.5">
                Queued
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs gap-1.5">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <RefreshCw className="size-3.5" /> Auto-tail: 5s
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative min-w-[240px] max-w-md flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search job UUID, worker node, handler class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-card"
              />
            </div>

            <select
              value={queueFilter}
              onChange={(e) => setQueueFilter(e.target.value)}
              className="h-8 px-2.5 rounded-md border text-xs bg-card text-foreground cursor-pointer focus:outline-none"
            >
              <option value="all">Queue: All Queues</option>
              <option value="critical-checkout">critical-checkout (P0)</option>
              <option value="order-fulfillment-sync">order-fulfillment-sync (P10)</option>
              <option value="marketing-email-batch">marketing-email-batch (P50)</option>
              <option value="dead-letter-triage">dead-letter-triage (DLQ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Table (7 cols) + Diagnostics Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Execution Table */}
        <div className="lg:col-span-7 rounded-xl border bg-card shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="h-9">
                <TableHead className="w-10 text-center text-[10px] font-bold uppercase tracking-wider">St</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Job ID & Handler</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Queue & Priority</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Worker Node</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Runtime</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-xs">
                    No background jobs found matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedJobId === job.id
                  return (
                    <TableRow
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={cn(
                        "h-12 cursor-pointer transition-colors",
                        job.status === "failed" ? "bg-rose-50/40 hover:bg-rose-50/60" :
                        isSelected ? "bg-indigo-50/70 hover:bg-indigo-50/90" : "hover:bg-muted/40"
                      )}
                    >
                      <TableCell className="text-center">
                        {job.status === "running" ? (
                          <span className="relative flex size-2.5 mx-auto">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                            <span className="relative inline-flex rounded-full size-2.5 bg-indigo-600" />
                          </span>
                        ) : job.status === "failed" ? (
                          <AlertTriangle className="size-4 text-rose-600 mx-auto" />
                        ) : job.status === "completed" ? (
                          <CheckCircle2 className="size-4 text-emerald-600 mx-auto" />
                        ) : (
                          <Clock className="size-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 min-w-[170px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-semibold text-foreground">{job.id}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-mono px-1 py-0",
                                job.status === "failed" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                job.status === "running" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                "bg-muted text-muted-foreground"
                              )}
                            >
                              {job.attempts}
                            </Badge>
                          </div>
                          <div className="font-medium text-xs text-foreground truncate">{job.handler}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] text-foreground font-medium">{job.queue}</span>
                          <div className="font-mono text-[10px] text-muted-foreground">{job.priority}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <span className="text-foreground">{job.workerNode}</span>
                          <span className="block text-[10px] text-muted-foreground">pid: {job.pid}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        <span className={cn(job.status === "failed" ? "text-rose-600 font-bold" : "text-foreground")}>
                          {job.runtime}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">{job.memory}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {job.startedAgo}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Right: Detailed Diagnostics & Payload Inspector */}
        <div className="lg:col-span-5 rounded-xl border bg-card shadow-2xs p-5 space-y-5 sticky top-20">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Job Diagnostics & State</span>
              <h3 className="text-sm font-semibold font-mono text-foreground">{selectedJob.id}</h3>
            </div>
            <Badge
              className={cn(
                "font-mono text-[10px] uppercase font-bold",
                selectedJob.status === "failed" ? "bg-rose-100 text-rose-800" :
                selectedJob.status === "running" ? "bg-indigo-100 text-indigo-800" :
                "bg-emerald-100 text-emerald-800"
              )}
            >
              {selectedJob.status}
            </Badge>
          </div>

          {/* Key Properties Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Handler Class</span>
              <div className="font-mono text-foreground font-semibold mt-0.5 truncate">{selectedJob.handler}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Worker Target</span>
              <div className="font-mono text-foreground mt-0.5">{selectedJob.workerNode} (PID {selectedJob.pid})</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Queue / Priority</span>
              <div className="font-mono text-foreground mt-0.5">{selectedJob.queue} • {selectedJob.priority}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Execution Memory</span>
              <div className="font-mono text-foreground mt-0.5">{selectedJob.runtime} ({selectedJob.memory})</div>
            </div>
          </div>

          {/* Stack Trace if Failed */}
          {selectedJob.stackTrace && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" />
                Error Diagnostics & Stack Trace
              </span>
              <div className="p-3 rounded-lg bg-rose-950/90 text-rose-200 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed border border-rose-900">
                <div className="font-bold text-rose-100 pb-1">{selectedJob.errorReason}</div>
                <pre className="text-rose-300/90">{selectedJob.stackTrace}</pre>
              </div>
            </div>
          )}

          {/* Job Arguments Payload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Terminal className="size-3.5 text-indigo-600" />
                Job Arguments (JSON)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedJob.args, null, 2))
                  setCopiedArgs(true)
                  setTimeout(() => setCopiedArgs(false), 2000)
                }}
                className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
              >
                {copiedArgs ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                {copiedArgs ? "Copied" : "Copy Payload"}
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-40 leading-tight">
              {JSON.stringify(selectedJob.args, null, 2)}
            </pre>
          </div>

          {/* Diagnostics Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              size="sm"
              onClick={() => handleRequeueJob(selectedJob.id)}
              className="flex-1 text-xs h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <RotateCcw className="size-3.5" /> Re-Queue Job Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setJobs(prev => prev.filter(j => j.id !== selectedJob.id))}
              className="flex-1 text-xs h-8 gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <Trash2 className="size-3.5" /> Purge from DLQ
            </Button>
          </div>
        </div>
      </div>

      {/* Manual Trigger Dialog */}
      <Dialog open={isTriggerModalOpen} onOpenChange={setIsTriggerModalOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <form onSubmit={handleTriggerSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Play className="size-4 text-indigo-600" /> Dispatch Background Worker Job
              </DialogTitle>
              <DialogDescription className="text-xs">
                Enqueue an asynchronous task directly into the Redis BullMQ cluster for immediate worker execution.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Handler Class</label>
                <select
                  value={triggerForm.handler}
                  onChange={(e) => setTriggerForm({ ...triggerForm, handler: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-md border text-xs bg-background font-mono"
                >
                  <option value="SyncFedExTrackingUpdatesJob">SyncFedExTrackingUpdatesJob</option>
                  <option value="ProcessStripeWebhookJob">ProcessStripeWebhookJob</option>
                  <option value="GenerateQuarterlyTaxReportJob">GenerateQuarterlyTaxReportJob</option>
                  <option value="BroadcastPushNotificationBatchJob">BroadcastPushNotificationBatchJob</option>
                  <option value="ReserveWarehouseInventoryLockJob">ReserveWarehouseInventoryLockJob</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Destination Queue</label>
                  <select
                    value={triggerForm.queue}
                    onChange={(e) => setTriggerForm({ ...triggerForm, queue: e.target.value as any })}
                    className="w-full h-8 px-2.5 rounded-md border text-xs bg-background font-mono"
                  >
                    <option value="critical-checkout">critical-checkout (P0)</option>
                    <option value="order-fulfillment-sync">order-fulfillment-sync (P10)</option>
                    <option value="marketing-email-batch">marketing-email-batch (P50)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Priority Level</label>
                  <select
                    value={triggerForm.priority}
                    onChange={(e) => setTriggerForm({ ...triggerForm, priority: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md border text-xs bg-background"
                  >
                    <option value="P0 (Realtime)">P0 (Realtime Immediate)</option>
                    <option value="P10 (Normal)">P10 (Normal Priority)</option>
                    <option value="P50 (Low)">P50 (Low Priority Batch)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Payload Arguments (JSON)</label>
                <textarea
                  rows={4}
                  value={triggerForm.payload}
                  onChange={(e) => setTriggerForm({ ...triggerForm, payload: e.target.value })}
                  className="w-full p-2.5 rounded-md border font-mono text-xs bg-background focus:outline-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTriggerModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                Enqueue Job
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
