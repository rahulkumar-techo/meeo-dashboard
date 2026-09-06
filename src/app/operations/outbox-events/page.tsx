"use client"

import * as React from "react"
import Link from "next/link"
import {
  Send,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Terminal,
  Search,
  Filter,
  RefreshCw,
  Zap,
  ArrowRight,
  Database,
  Eye,
  Copy,
  ChevronRight,
  Check,
  Radio,
  Sliders,
  Play,
  Trash2,
  Layers,
  ShieldAlert,
  Server,
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
import { cn } from "cn"

interface OutboxEvent {
  id: string
  aggregateType: "Order" | "Payment" | "Inventory" | "Customer"
  aggregateId: string
  eventName: string
  status: "published" | "processing" | "pending" | "failed" | "retrying"
  attempts: string
  payloadPreview: string
  nextRetryOrLatency: string
  timestamp: string
  idempotencyKey: string
  partition: string
  failureReason?: string
  stackTrace?: string
  fullPayload: Record<string, any>
}

const INITIAL_OUTBOX_EVENTS: OutboxEvent[] = [
  {
    id: "evt_01HV99281A",
    aggregateType: "Order",
    aggregateId: "ord_10248",
    eventName: "order.inventory_reserved",
    status: "failed",
    attempts: "3 / 3 (Max)",
    payloadPreview: '{"order_id":"ord_10248","warehouse_id":"wh_east_1"...}',
    nextRetryOrLatency: "EXHAUSTED",
    timestamp: "14:24:12",
    idempotencyKey: "idemp_ord_10248_resv_99a",
    partition: "cdc_partition_04 (us-east-1)",
    failureReason: "WarehouseLockTimeoutException: Lock acquisition failed for SKU APX-MSE-BLK at wh_east_1",
    stackTrace: `WarehouseLockTimeoutException: Resource lock expired after 5000ms\n  at InventoryCluster.acquireLock (/app/services/inventory/lock.ts:89)\n  at OutboxDispatcher.processEvent (/app/workers/outbox_worker.ts:142)\n  at KafkaProducer.emitSync (/app/lib/kafka/producer.ts:64)`,
    fullPayload: {
      event_id: "evt_01HV99281A",
      event_name: "order.inventory_reserved",
      aggregate_type: "Order",
      aggregate_id: "ord_10248",
      order_id: "ord_10248",
      warehouse_id: "wh_east_1",
      skus: [{ sku: "APX-MSE-BLK", qty: 1, allocation_strategy: "strict_fifo" }],
      trace_id: "trc_90128a-4410",
      created_at: "2024-10-28T14:24:08.120Z",
    },
  },
  {
    id: "evt_01HV99279B",
    aggregateType: "Payment",
    aggregateId: "pay_99214",
    eventName: "payment.webhook_dispatched",
    status: "retrying",
    attempts: "2 / 5",
    payloadPreview: '{"payment_id":"pay_99214","provider":"stripe"...}',
    nextRetryOrLatency: "in 42s (exp backoff)",
    timestamp: "14:23:55",
    idempotencyKey: "idemp_pay_99214_wh_01",
    partition: "cdc_partition_01 (us-east-1)",
    failureReason: "HTTP 503 Service Unavailable from external merchant webhook endpoint",
    fullPayload: {
      event_id: "evt_01HV99279B",
      event_name: "payment.webhook_dispatched",
      payment_id: "pay_99214",
      amount: 450.0,
      currency: "USD",
      gateway: "stripe",
      endpoint: "https://partner-erp.acme.com/webhooks",
    },
  },
  {
    id: "evt_01HV99278C",
    aggregateType: "Customer",
    aggregateId: "usr_88190",
    eventName: "customer.welcome_email_queued",
    status: "processing",
    attempts: "1 / 3",
    payloadPreview: '{"user_id":"usr_88190","email":"david.m@example...}',
    nextRetryOrLatency: "In-flight (#04)",
    timestamp: "14:23:50",
    idempotencyKey: "idemp_usr_88190_welc",
    partition: "cdc_partition_02 (us-east-1)",
    fullPayload: {
      event_id: "evt_01HV99278C",
      user_id: "usr_88190",
      email: "david.m@example.com",
      tier: "VIP Gold",
    },
  },
  {
    id: "evt_01HV99275D",
    aggregateType: "Order",
    aggregateId: "ord_10247",
    eventName: "order.payment_authorized",
    status: "published",
    attempts: "1 / 3",
    payloadPreview: '{"order_id":"ord_10247","amount":1199.00...}',
    nextRetryOrLatency: "18ms",
    timestamp: "14:05:02",
    idempotencyKey: "idemp_ord_10247_auth",
    partition: "cdc_partition_04 (us-east-1)",
    fullPayload: {
      event_id: "evt_01HV99275D",
      order_id: "ord_10247",
      amount: 1199.0,
      captured: true,
      auth_code: "AUTH_891240",
    },
  },
  {
    id: "evt_01HV99271E",
    aggregateType: "Inventory",
    aggregateId: "inv_38192",
    eventName: "inventory.stock_decremented",
    status: "published",
    attempts: "1 / 3",
    payloadPreview: '{"sku":"APX-DSK-PRO","delta":-1,"remaining":14}',
    nextRetryOrLatency: "24ms",
    timestamp: "14:05:01",
    idempotencyKey: "idemp_inv_38192_decr",
    partition: "cdc_partition_03 (us-east-1)",
    fullPayload: {
      sku: "APX-DSK-PRO",
      delta: -1,
      remaining: 14,
      warehouse: "wh_us_central",
    },
  },
]

export default function OutboxOperationsPage() {
  const [events, setEvents] = React.useState<OutboxEvent[]>(INITIAL_OUTBOX_EVENTS)
  const [selectedEventId, setSelectedEventId] = React.useState<string>(INITIAL_OUTBOX_EVENTS[0].id)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [aggregateFilter, setAggregateFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [copiedPayload, setCopiedPayload] = React.useState(false)

  const selectedEvent = React.useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0]
  }, [events, selectedEventId])

  // Filter events
  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      if (aggregateFilter !== "all" && e.aggregateType !== aggregateFilter) return false
      if (statusFilter !== "all" && e.status !== statusFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          e.id.toLowerCase().includes(q) ||
          e.aggregateId.toLowerCase().includes(q) ||
          e.eventName.toLowerCase().includes(q) ||
          e.idempotencyKey.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [events, aggregateFilter, statusFilter, searchQuery])

  // Replay event
  const handleReplayEvent = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            status: "published",
            nextRetryOrLatency: "12ms (Replayed)",
            attempts: "1 / 3",
            failureReason: undefined,
            stackTrace: undefined,
          }
        }
        return e
      })
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase">
            <span>Operations</span>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">Transactional Outbox</span>
            <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
              Live Dispatcher (248 evt/min)
            </Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Zap className="size-7 text-indigo-600" />
            Outbox Events & Reliability Triage
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Transactional outbox pattern event stream, CDC replication lag, webhook fanouts, idempotency locks, and unrecoverable DLQ replay.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => handleReplayEvent(selectedEvent.id)}
            className="h-9 gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs"
          >
            <RotateCcw className="size-4" />
            Dead-Letter Replay (Bulk)
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
          >
            <Check className="size-4" />
            Clear Resolved
          </Button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Pending Events */}
        <div className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pending Events</span>
            <Badge variant="outline" className="text-[10px] font-mono">Normal</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-foreground">14</span>
            <span className="text-xs font-mono text-muted-foreground">buffer 1.2%</span>
          </div>
          <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: "14%" }} />
          </div>
        </div>

        {/* Card 2: In-Flight Workers */}
        <div className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">In-Flight Workers</span>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono">Healthy</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-foreground">8 <span className="text-xs text-muted-foreground font-normal">/ 12</span></span>
            <span className="text-xs font-mono text-muted-foreground">66.7% cap</span>
          </div>
          <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: "66.7%" }} />
          </div>
        </div>

        {/* Card 3: Published (1hr) */}
        <div className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Published (1hr)</span>
            <span className="text-xs font-mono text-emerald-600 font-semibold">Optimal</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-foreground">18,420</span>
            <span className="text-xs font-mono text-emerald-600">+4.1%</span>
          </div>
          <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: "88%" }} />
          </div>
        </div>

        {/* Card 4: Retrying Queue */}
        <div className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Retrying Queue</span>
            <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-mono">Warning</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-700">3</span>
            <span className="text-xs font-mono text-muted-foreground">Backoff Active</span>
          </div>
          <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: "25%" }} />
          </div>
        </div>

        {/* Card 5: Dead-Letter (DLQ) */}
        <div className="rounded-xl border bg-rose-50/50 p-3.5 shadow-2xs space-y-2 border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Dead-Letter (DLQ)</span>
            <Badge className="bg-rose-600 text-white text-[10px] font-mono uppercase font-bold">Alert</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-700">1</span>
            <span className="text-xs font-mono text-rose-800 font-semibold">Unrecoverable</span>
          </div>
          <div className="w-full bg-rose-200 h-1 rounded-full overflow-hidden">
            <div className="bg-rose-600 h-full rounded-full" style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-card rounded-md border p-0.5 text-xs">
            {["all", "Order", "Payment", "Inventory", "Customer"].map((ag) => (
              <button
                key={ag}
                onClick={() => setAggregateFilter(ag)}
                className={cn(
                  "px-2.5 py-1 rounded transition-colors font-medium",
                  aggregateFilter === ag ? "bg-indigo-600 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {ag === "all" ? "All Aggregates" : ag}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Filter by Aggregate, Event, or Trace ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-card"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 rounded-md border text-xs bg-card text-foreground cursor-pointer focus:outline-none"
          >
            <option value="all">Status: All Statuses</option>
            <option value="published">Published</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="retrying">Retrying</option>
            <option value="failed">Failed (DLQ)</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Table (7 cols) + Inspector Pane (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Events Data Table */}
        <div className="lg:col-span-7 rounded-xl border bg-card shadow-2xs overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/40 border-b flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Outbox Event Stream</span>
            <span className="text-[11px] font-mono text-muted-foreground">Latency SLA: &lt; 50ms</span>
          </div>

          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="h-9">
                <TableHead className="w-24 text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Event ID</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Aggregate</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Event Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-center">Attempts</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-xs">
                    No outbox events match filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((evt) => {
                  const isSelected = selectedEventId === evt.id
                  return (
                    <TableRow
                      key={evt.id}
                      onClick={() => setSelectedEventId(evt.id)}
                      className={cn(
                        "h-11 cursor-pointer transition-colors",
                        evt.status === "failed" ? "bg-rose-50/50 hover:bg-rose-50/70" :
                        isSelected ? "bg-indigo-50/70 hover:bg-indigo-50/90" : "hover:bg-muted/40"
                      )}
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-mono font-bold px-1.5 py-0",
                            evt.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            evt.status === "processing" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                            evt.status === "retrying" ? "bg-amber-50 text-amber-800 border-amber-200" :
                            "bg-rose-600 text-white border-rose-600"
                          )}
                        >
                          {evt.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-indigo-700">
                        {evt.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">{evt.aggregateType}</Badge>
                          <span className="text-muted-foreground">{evt.aggregateId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground font-medium truncate max-w-[140px]">
                        {evt.eventName}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        <span className={cn(evt.status === "failed" ? "text-rose-600 font-bold" : "text-muted-foreground")}>
                          {evt.attempts}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {evt.timestamp}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Right: Detailed Outbox Event Inspector Pane */}
        <div className="lg:col-span-5 rounded-xl border bg-card shadow-2xs p-5 space-y-5 sticky top-20">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Event Inspector</span>
              <h3 className="text-sm font-semibold font-mono text-foreground">{selectedEvent.id}</h3>
            </div>
            <Badge
              className={cn(
                "font-mono text-[10px] uppercase font-bold",
                selectedEvent.status === "failed" ? "bg-rose-600 text-white" : "bg-emerald-100 text-emerald-800"
              )}
            >
              {selectedEvent.status}
            </Badge>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Aggregate Reference</span>
              <div className="font-mono text-foreground font-semibold mt-0.5">{selectedEvent.aggregateType} • {selectedEvent.aggregateId}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">CDC Partition</span>
              <div className="font-mono text-foreground mt-0.5 truncate">{selectedEvent.partition}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Idempotency Key</span>
              <div className="font-mono text-foreground mt-0.5 truncate">{selectedEvent.idempotencyKey}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Next State / Telemetry</span>
              <div className="font-mono text-foreground mt-0.5 font-semibold">{selectedEvent.nextRetryOrLatency}</div>
            </div>
          </div>

          {/* Failure Stack Trace */}
          {selectedEvent.stackTrace && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" />
                Failure Diagnostics
              </span>
              <div className="p-3 rounded-lg bg-rose-950/90 text-rose-200 font-mono text-[11px] overflow-x-auto max-h-40 leading-relaxed border border-rose-900">
                <div className="font-bold text-rose-100 pb-1">{selectedEvent.failureReason}</div>
                <pre className="text-rose-300/90">{selectedEvent.stackTrace}</pre>
              </div>
            </div>
          )}

          {/* Envelope Payload JSON */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Terminal className="size-3.5 text-indigo-600" />
                Raw Event Envelope (JSON)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedEvent.fullPayload, null, 2))
                  setCopiedPayload(true)
                  setTimeout(() => setCopiedPayload(false), 2000)
                }}
                className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
              >
                {copiedPayload ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                {copiedPayload ? "Copied" : "Copy JSON"}
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-40 leading-tight">
              {JSON.stringify(selectedEvent.fullPayload, null, 2)}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              size="sm"
              onClick={() => handleReplayEvent(selectedEvent.id)}
              className="flex-1 text-xs h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <RotateCcw className="size-3.5" /> Replay Event Dispatch
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEvents(prev => prev.filter(e => e.id !== selectedEvent.id))}
              className="flex-1 text-xs h-8 gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <Trash2 className="size-3.5" /> Force Acknowledge
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
