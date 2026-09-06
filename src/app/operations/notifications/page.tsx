"use client"

import * as React from "react"
import Link from "next/link"
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  Search,
  Filter,
  RefreshCw,
  Send,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Copy,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Terminal,
  Zap,
  MoreVertical,
  Check,
  RotateCcw,
  Eye,
  Sliders,
  Radio,
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

interface DispatchLog {
  id: string
  channel: "email" | "sms" | "push" | "webhook"
  status: "delivered" | "sent" | "failed" | "opened" | "bounced" | "retrying"
  statusDetail: string
  eventName: string
  referenceId: string
  recipient: string
  recipientDetail?: string
  provider: string
  providerSub: string
  latencyMs: number
  deliveryDuration: string
  timestamp: string
  timeAgo: string
  payloadJson: Record<string, any>
  hops: { step: string; timestamp: string; status: "success" | "pending" | "failed"; detail: string }[]
}

const INITIAL_LOGS: DispatchLog[] = [
  {
    id: "dsp_948201",
    channel: "email",
    status: "delivered",
    statusDetail: "250 OK Delivered",
    eventName: "Order Confirmation (ORD-10248)",
    referenceId: "ORD-10248",
    recipient: "david.m@example.com",
    recipientDetail: "David Miller • VIP Gold",
    provider: "AWS SES (us-east-1)",
    providerSub: "Pool: trans-prod-01",
    latencyMs: 142,
    deliveryDuration: "1.2s",
    timestamp: "14:28:11",
    timeAgo: "Just now",
    payloadJson: {
      event: "order.confirmed",
      order_id: "ORD-10248",
      customer_id: "usr_90218",
      total: 349.50,
      currency: "USD",
      items_count: 3,
      tracking_carrier: "FedEx",
      template_id: "tmpl_order_confirm_v4",
      ses_message_id: "0100018b2-c7f8a-9810-bce42",
    },
    hops: [
      { step: "Message Enqueued", timestamp: "14:28:10.120", status: "success", detail: "Placed in RabbitMQ high-priority queue" },
      { step: "Sanitized & Rate Check", timestamp: "14:28:10.180", status: "success", detail: "Spam token 0.01 / Token bucket pass" },
      { step: "Dispatched to AWS SES", timestamp: "14:28:10.322", status: "success", detail: "TLS 1.3 encrypted handshake" },
      { step: "250 OK Handset Ack", timestamp: "14:28:11.340", status: "success", detail: "Delivered to mx.google.com" },
    ],
  },
  {
    id: "dsp_948202",
    channel: "sms",
    status: "sent",
    statusDetail: "Handset Ack",
    eventName: "Out for Delivery (FedEx #74892)",
    referenceId: "TRK-74892",
    recipient: "+1 (555) 234-8921",
    recipientDetail: "Sarah Connor • San Francisco, CA",
    provider: "Twilio Route US",
    providerSub: "Shortcode: 88209",
    latencyMs: 89,
    deliveryDuration: "0.8s",
    timestamp: "14:27:04",
    timeAgo: "1m ago",
    payloadJson: {
      event: "shipment.out_for_delivery",
      carrier: "FedEx Express",
      tracking_number: "748928192019",
      eta: "Today before 5:00 PM",
      short_link: "https://apx.link/tr/74892",
      twilio_sid: "SM8f9201ac04b9e281",
    },
    hops: [
      { step: "Event Triggered", timestamp: "14:27:03.410", status: "success", detail: "Webhook from FedEx carrier ingest" },
      { step: "Carrier Gateway Forward", timestamp: "14:27:03.500", status: "success", detail: "Routed via Twilio Tier-1 Aggregator" },
      { step: "Delivered to Handset", timestamp: "14:27:04.290", status: "success", detail: "Carrier delivery receipt returned" },
    ],
  },
  {
    id: "dsp_948203",
    channel: "push",
    status: "delivered",
    statusDetail: "Delivered (APNs)",
    eventName: "Security 2FA Challenge",
    referenceId: "SEC-2FA-991",
    recipient: "mchen@acme.org",
    recipientDetail: "Device APNs-iOS-iPhone15",
    provider: "Apple APNs v2",
    providerSub: "Priority: High (10)",
    latencyMs: 32,
    deliveryDuration: "0.14s",
    timestamp: "14:25:28",
    timeAgo: "3m ago",
    payloadJson: {
      event: "auth.mfa_push",
      session_id: "sess_91823a01",
      ip_address: "192.88.99.12",
      geo: "Chicago, IL, US",
      apns_collapse_id: "auth_challenge",
    },
    hops: [
      { step: "MFA Challenge Issued", timestamp: "14:25:28.010", status: "success", detail: "Auth server token generate" },
      { step: "APNs HTTP/2 Post", timestamp: "14:25:28.042", status: "success", detail: "200 Success from gateway.push.apple.com" },
    ],
  },
  {
    id: "dsp_948204",
    channel: "webhook",
    status: "delivered",
    statusDetail: "200 OK Response",
    eventName: "Webhook: order.created",
    referenceId: "WH-EVT-4091",
    recipient: "https://api.erp-hub.internal/events",
    recipientDetail: "NetSuite ERP Sync Endpoint",
    provider: "Internal Outbox Bus",
    providerSub: "Signature: HMAC-SHA256",
    latencyMs: 18,
    deliveryDuration: "0.05s",
    timestamp: "14:22:15",
    timeAgo: "6m ago",
    payloadJson: {
      event: "order.created",
      order_id: "ORD-10247",
      timestamp: "2024-10-28T14:22:15Z",
      payload_sha: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    hops: [
      { step: "Outbox Poller Read", timestamp: "14:22:15.001", status: "success", detail: "Polled from outbox_events partition 2" },
      { step: "HTTP POST Sent", timestamp: "14:22:15.019", status: "success", detail: "ERP responded with 200 OK (body: {received: true})" },
    ],
  },
  {
    id: "dsp_948205",
    channel: "email",
    status: "opened",
    statusDetail: "Opened & Clicked",
    eventName: "Abandoned Cart Recovery (Tier 1)",
    referenceId: "REC-CART-340",
    recipient: "elena.r@techcorp.io",
    recipientDetail: "Cart Value: $340.00",
    provider: "Klaviyo Engine Fanout",
    providerSub: "Campaign: CART_RECOV_4H",
    latencyMs: 380,
    deliveryDuration: "2.1s",
    timestamp: "14:19:02",
    timeAgo: "9m ago",
    payloadJson: {
      event: "campaign.cart_recovery",
      cart_token: "crt_8192a0",
      coupon_code: "SAVE10-ELENA",
      opened_at: "14:21:05",
      clicked_at: "14:24:12",
    },
    hops: [
      { step: "Enqueued", timestamp: "14:19:00.100", status: "success", detail: "Batch marketing dispatch" },
      { step: "Delivered SES", timestamp: "14:19:02.200", status: "success", detail: "250 OK Received" },
      { step: "Pixel Beacon Open", timestamp: "14:21:05.110", status: "success", detail: "Image pixel loaded" },
      { step: "CTA Link Clicked", timestamp: "14:24:12.890", status: "success", detail: "Redirected to checkout" },
    ],
  },
  {
    id: "dsp_948206",
    channel: "email",
    status: "failed",
    statusDetail: "550 Mailbox Full",
    eventName: "Flash Drop: Moondrop Audio",
    referenceId: "PRM-FLSH-MOON",
    recipient: "j.beck@berlin.de",
    recipientDetail: "Hard bounce recorded",
    provider: "AWS SES (eu-central-1)",
    providerSub: "Pool: promo-bulk-02",
    latencyMs: 1420,
    deliveryDuration: "1.4s",
    timestamp: "14:12:44",
    timeAgo: "15m ago",
    payloadJson: {
      event: "promo.flash_announcement",
      recipient: "j.beck@berlin.de",
      error_code: "550 5.2.2",
      error_message: "Mailbox is full / quota exceeded",
      suppressed: true,
    },
    hops: [
      { step: "Dispatched to SES", timestamp: "14:12:43.010", status: "success", detail: "Sent via bulk pool" },
      { step: "SMTP 550 Error", timestamp: "14:12:44.430", status: "failed", detail: "Remote host rejected message (Mailbox full)" },
      { step: "Auto-Suppression Added", timestamp: "14:12:44.450", status: "success", detail: "Recipient added to temporary suppression list" },
    ],
  },
]

export default function NotificationsDispatchPage() {
  const [logs, setLogs] = React.useState<DispatchLog[]>(INITIAL_LOGS)
  const [selectedLogId, setSelectedLogId] = React.useState<string>(INITIAL_LOGS[0].id)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState("all")
  const [statusTab, setStatusTab] = React.useState("all")
  const [autoTail, setAutoTail] = React.useState(true)
  const [isManualDispatchOpen, setIsManualDispatchOpen] = React.useState(false)
  const [copiedPayload, setCopiedPayload] = React.useState(false)

  // Manual Dispatch Form
  const [manualForm, setManualForm] = React.useState({
    channel: "email" as DispatchLog["channel"],
    recipient: "",
    eventName: "Manual Operations Test Broadcast",
    templateKey: "tmpl_system_alert",
    payloadRaw: '{\n  "test_mode": true,\n  "sender": "ops_console"\n}',
  })

  const selectedLog = React.useMemo(() => {
    return logs.find((l) => l.id === selectedLogId) || logs[0]
  }, [logs, selectedLogId])

  // Filter logs
  const filteredLogs = React.useMemo(() => {
    return logs.filter((l) => {
      if (statusTab === "delivered" && !["delivered", "sent", "opened"].includes(l.status)) return false
      if (statusTab === "failed" && !["failed", "retrying"].includes(l.status)) return false
      if (statusTab === "bounced" && l.status !== "bounced" && !l.statusDetail.includes("550")) return false

      if (channelFilter !== "all" && l.channel !== channelFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          l.id.toLowerCase().includes(q) ||
          l.recipient.toLowerCase().includes(q) ||
          l.eventName.toLowerCase().includes(q) ||
          l.referenceId.toLowerCase().includes(q) ||
          l.provider.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [logs, statusTab, channelFilter, searchQuery])

  // Copy payload helper
  const handleCopyPayload = () => {
    if (selectedLog) {
      navigator.clipboard.writeText(JSON.stringify(selectedLog.payloadJson, null, 2))
      setCopiedPayload(true)
      setTimeout(() => setCopiedPayload(false), 2000)
    }
  }

  // Handle manual dispatch submit
  const handleSendManual = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualForm.recipient) return

    let parsedPayload = {}
    try {
      parsedPayload = JSON.parse(manualForm.payloadRaw)
    } catch {
      parsedPayload = { raw: manualForm.payloadRaw }
    }

    const newLog: DispatchLog = {
      id: `dsp_${Math.floor(100000 + Math.random() * 900000)}`,
      channel: manualForm.channel,
      status: "delivered",
      statusDetail: "200 Sent Immediately",
      eventName: manualForm.eventName,
      referenceId: `MAN-${Date.now().toString().slice(-4)}`,
      recipient: manualForm.recipient,
      recipientDetail: "Manual Dispatch from Console",
      provider: manualForm.channel === "email" ? "AWS SES (us-east-1)" : manualForm.channel === "sms" ? "Twilio US" : "Firebase FCM",
      providerSub: "Pool: manual-ops",
      latencyMs: 95,
      deliveryDuration: "0.4s",
      timestamp: new Date().toTimeString().slice(0, 8),
      timeAgo: "Just now",
      payloadJson: parsedPayload,
      hops: [
        { step: "Manual Trigger Ingest", timestamp: new Date().toTimeString().slice(0, 8), status: "success", detail: "Sent from Operations Admin Console" },
        { step: "Delivered to Provider Gateway", timestamp: new Date().toTimeString().slice(0, 8), status: "success", detail: "200 Success Response" },
      ],
    }

    setLogs((prev) => [newLog, ...prev])
    setSelectedLogId(newLog.id)
    setIsManualDispatchOpen(false)
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase">
            <span>Operations</span>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">Dispatch Center</span>
            <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
              Mesh Online
            </Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="size-7 text-indigo-600" />
            Notifications & Multi-Channel Dispatch Center
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Real-time omnichannel delivery telemetry, outbox fanouts, message templates, and transaction event tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 text-xs font-mono text-muted-foreground">
            <Activity className="size-3.5 text-emerald-600" />
            <span>Rate Limit: 4,800/min OK</span>
          </div>
          <Button
            size="sm"
            onClick={() => setIsManualDispatchOpen(true)}
            className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
          >
            <Send className="size-4" />
            Manual Dispatch
          </Button>
        </div>
      </div>

      {/* 4 High-Density KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Dispatched (24h)</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Send className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">482,910</span>
            <span className="text-xs font-semibold text-emerald-600 font-mono">+12.4%</span>
          </div>
          <div className="flex items-end justify-between gap-1 pt-1">
            <div className="flex-1 flex items-end h-7 gap-0.5">
              <div className="w-full bg-indigo-200 rounded-t h-[35%]" />
              <div className="w-full bg-indigo-300 rounded-t h-[48%]" />
              <div className="w-full bg-indigo-400 rounded-t h-[75%]" />
              <div className="w-full bg-indigo-600 rounded-t h-[92%]" />
              <div className="w-full bg-indigo-500 rounded-t h-[84%]" />
              <div className="w-full bg-indigo-300 rounded-t h-[52%]" />
            </div>
            <div className="text-right pl-2 shrink-0">
              <span className="text-[10px] text-muted-foreground block font-mono">Success Rate</span>
              <span className="text-xs font-bold text-emerald-600 font-mono">99.84%</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Channel Latency (p95)</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">184ms</span>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px]">Optimal</Badge>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[11px] pt-1 bg-muted/40 rounded-md p-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><span className="size-1.5 rounded-full bg-blue-500" />SES</span>
              <span className="font-semibold">420ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" />SMS</span>
              <span className="font-semibold">890ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><span className="size-1.5 rounded-full bg-purple-500" />FCM</span>
              <span className="font-semibold">95ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><span className="size-1.5 rounded-full bg-amber-500" />Hook</span>
              <span className="font-semibold">48ms</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bounced / Suppressed</span>
            <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <Shield className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">142</span>
            <span className="text-xs text-muted-foreground font-mono">0.029% of vol</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
              <span>Hard Bounces: 114</span>
              <span>Spam: 18</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: "99.7%" }} />
              <div className="bg-amber-400 h-full" style={{ width: "0.2%" }} />
              <div className="bg-rose-500 h-full" style={{ width: "0.1%" }} />
            </div>
            <div className="flex justify-between text-[11px] pt-0.5">
              <span className="text-muted-foreground">Reputation Health</span>
              <span className="text-emerald-700 font-semibold font-mono">Low Risk Profile</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Queue Backlog & Rate</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">18 <span className="text-xs text-muted-foreground font-normal">/ sec</span></span>
            <span className="text-xs text-muted-foreground font-mono">Peak 120/s</span>
          </div>
          <div className="flex items-center justify-between bg-muted/40 p-2 rounded-md">
            <div>
              <div className="text-xs font-semibold text-foreground font-mono">42 messages</div>
              <div className="text-[10px] text-muted-foreground">Buffered in FIFO</div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-xs font-semibold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Zero Lag
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
          <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full sm:w-auto">
            <TabsList className="bg-muted/70 p-1">
              <TabsTrigger value="all" className="text-xs gap-1.5">
                All Dispatches <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{logs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="delivered" className="text-xs gap-1.5">
                Delivered <Badge className="bg-emerald-100 text-emerald-800 px-1.5 py-0 text-[10px]">{logs.filter(l => ["delivered", "sent", "opened"].includes(l.status)).length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="failed" className="text-xs gap-1.5">
                Failed & Retrying <Badge className="bg-rose-100 text-rose-800 px-1.5 py-0 text-[10px]">{logs.filter(l => ["failed", "retrying"].includes(l.status)).length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="bounced" className="text-xs gap-1.5">
                Bounced / Unreachable
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoTail}
                onChange={(e) => setAutoTail(e.target.checked)}
                className="accent-indigo-600 rounded"
              />
              Auto-tail stream
            </label>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <RefreshCw className="size-3.5" /> Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative min-w-[240px] max-w-md flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Filter by recipient email, phone, reference ID, template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-card"
              />
            </div>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-8 px-2.5 rounded-md border text-xs bg-card text-foreground cursor-pointer focus:outline-none"
            >
              <option value="all">Channel: All Channels</option>
              <option value="email">Email (SES / Klaviyo)</option>
              <option value="sms">SMS (Twilio)</option>
              <option value="push">Push (APNs / FCM)</option>
              <option value="webhook">Webhook (Outbox)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Table (Left 7 cols) + Detail Inspector (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Dispatch Table */}
        <div className="lg:col-span-7 rounded-xl border bg-card shadow-2xs overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/50 border-b flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Live Telemetry Feed</span>
            <span className="text-[11px] font-mono text-muted-foreground">Showing {filteredLogs.length} events</span>
          </div>

          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="h-9">
                <TableHead className="w-28 text-[10px] font-bold uppercase tracking-wider">Status / Ch</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Event & Recipient</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Provider</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Latency</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs">
                    No dispatch events found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = selectedLogId === log.id
                  return (
                    <TableRow
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className={cn(
                        "h-11 cursor-pointer transition-colors",
                        isSelected ? "bg-indigo-50/70 hover:bg-indigo-50/90" : "hover:bg-muted/40"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className={cn(
                            "size-6 rounded flex items-center justify-center shrink-0",
                            log.channel === "email" ? "bg-blue-100 text-blue-700" :
                            log.channel === "sms" ? "bg-emerald-100 text-emerald-700" :
                            log.channel === "push" ? "bg-purple-100 text-purple-700" :
                            "bg-amber-100 text-amber-800"
                          )}>
                            {log.channel === "email" && <Mail className="size-3.5" />}
                            {log.channel === "sms" && <MessageSquare className="size-3.5" />}
                            {log.channel === "push" && <Smartphone className="size-3.5" />}
                            {log.channel === "webhook" && <Webhook className="size-3.5" />}
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-mono font-bold px-1 py-0",
                              log.status === "delivered" || log.status === "sent" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              log.status === "opened" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-rose-50 text-rose-700 border-rose-200"
                            )}
                          >
                            {log.status === "delivered" ? "200" : log.status === "opened" ? "OPEN" : log.status === "sent" ? "SENT" : "550"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 min-w-[160px]">
                          <div className="font-semibold text-xs text-foreground truncate">{log.eventName}</div>
                          <div className="font-mono text-[10px] text-muted-foreground truncate">{log.recipient}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-mono text-xs text-foreground">{log.provider}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{log.providerSub}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        <span className="font-semibold text-foreground">{log.latencyMs}ms</span>
                        <span className="block text-[10px] text-muted-foreground">{log.deliveryDuration}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        <span className="text-indigo-600 font-semibold">{log.timeAgo}</span>
                        <span className="block text-[10px] text-muted-foreground">{log.timestamp}</span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Right: Detailed Context Inspector Drawer */}
        <div className="lg:col-span-5 rounded-xl border bg-card shadow-2xs p-5 space-y-5 sticky top-20">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Context Inspector</span>
              <h3 className="text-sm font-semibold font-mono text-foreground">{selectedLog.id}</h3>
            </div>
            <Badge
              className={cn(
                "font-mono text-[10px] uppercase font-bold",
                selectedLog.status === "failed" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
              )}
            >
              {selectedLog.statusDetail}
            </Badge>
          </div>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Event Type</span>
              <div className="font-medium text-foreground mt-0.5">{selectedLog.eventName}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Channel & Provider</span>
              <div className="font-mono text-foreground mt-0.5">{selectedLog.channel.toUpperCase()} • {selectedLog.provider}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Recipient</span>
              <div className="font-mono text-foreground mt-0.5 truncate">{selectedLog.recipient}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Latency Telemetry</span>
              <div className="font-mono text-emerald-600 font-semibold mt-0.5">{selectedLog.latencyMs}ms (Deliv {selectedLog.deliveryDuration})</div>
            </div>
          </div>

          {/* Delivery Waterfall Hops */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Delivery Pipeline Hops</span>
            <div className="space-y-2 border-l-2 border-indigo-200 pl-3 ml-2">
              {selectedLog.hops.map((hop, i) => (
                <div key={i} className="relative space-y-0.5 text-xs">
                  <div className="absolute -left-[19px] top-1 size-2 rounded-full bg-indigo-600 ring-4 ring-card" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{hop.step}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{hop.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">{hop.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Raw JSON Payload Inspector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Terminal className="size-3.5 text-indigo-600" />
                Raw Event Payload
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyPayload}
                className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
              >
                {copiedPayload ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                {copiedPayload ? "Copied" : "Copy JSON"}
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48 leading-tight">
              {JSON.stringify(selectedLog.payloadJson, null, 2)}
            </pre>
          </div>

          {/* Context Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" className="flex-1 text-xs h-8 gap-1.5">
              <RotateCcw className="size-3.5" /> Replay Dispatch
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs h-8 gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50">
              <Shield className="size-3.5" /> Suppress Address
            </Button>
          </div>
        </div>
      </div>

      {/* Manual Dispatch Modal */}
      <Dialog open={isManualDispatchOpen} onOpenChange={setIsManualDispatchOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <form onSubmit={handleSendManual}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Send className="size-4 text-indigo-600" /> Dispatch Manual Test Message
              </DialogTitle>
              <DialogDescription className="text-xs">
                Trigger an ad-hoc notification across your delivery channels for QA and operator testing.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Channel</label>
                  <select
                    value={manualForm.channel}
                    onChange={(e) => setManualForm({ ...manualForm, channel: e.target.value as any })}
                    className="w-full h-8 px-2.5 rounded-md border text-xs bg-background"
                  >
                    <option value="email">Email (SES)</option>
                    <option value="sms">SMS (Twilio)</option>
                    <option value="push">Push (APNs / FCM)</option>
                    <option value="webhook">Webhook Endpoint</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Recipient Target *</label>
                  <Input
                    required
                    placeholder="e.g. dev@apexcommerce.io or +1555019"
                    value={manualForm.recipient}
                    onChange={(e) => setManualForm({ ...manualForm, recipient: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Event Label / Subject</label>
                <Input
                  value={manualForm.eventName}
                  onChange={(e) => setManualForm({ ...manualForm, eventName: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Payload Data (JSON)</label>
                <textarea
                  rows={4}
                  value={manualForm.payloadRaw}
                  onChange={(e) => setManualForm({ ...manualForm, payloadRaw: e.target.value })}
                  className="w-full p-2.5 rounded-md border font-mono text-xs bg-background focus:outline-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsManualDispatchOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                Dispatch Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
