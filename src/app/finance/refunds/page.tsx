"use client"

import * as React from "react"
import Link from "next/link"
import {
  RotateCcw,
  Search,
  Download,
  Plus,
  TrendingUp,
  AlertTriangle,
  Radio,
  Eye,
  MoreVertical,
  Mail,
  Tag,
  Ban,
  ExternalLink,
  ChevronDown,
  X,
  Phone,
  Shield,
  Star,
  Receipt,
  FileText,
  CreditCard,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Send,
  Calendar,
  Clock,
  MapPin,
  BadgeCheck,
  Lock,
  Sparkles,
  ShoppingBag,
  Package,
  Layers,
  Award,
  Boxes,
  Truck,
  MessageSquare,
  History,
  PieChart,
  DollarSign,
  Copy,
  Check,
  SlidersHorizontal,
  FileSpreadsheet,
  Gavel,
  Zap,
  CheckCircle,
  HelpCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RefundItem {
  id: string
  orderId: string
  customer: string
  email: string
  tier?: string
  amount: string
  rawAmount: number
  type: "Full" | "Partial (-15%)" | "Chargeback" | "Credit (+10%)"
  reason: string
  reasonDetail: string
  slaTimer: string
  slaUrgent?: boolean
  status: "Pending" | "Under Dispute" | "Settled" | "Dispute Won" | "Declined"
  statusVariant: "warning" | "destructive" | "success" | "secondary"
  date: string
  gateway: "Stripe" | "PayPal" | "Affirm" | "Apple Pay"
  trackingNumber: string
  warehouseStation: string
  evidencePhotos: { name: string; url: string }[]
  documents: string[]
}

const REFUND_QUEUE_DATA: RefundItem[] = [
  {
    id: "ref_89201A",
    orderId: "ORD-10244",
    customer: "Liam Vance",
    email: "lvance@design.co",
    tier: "VIP",
    amount: "$189.00",
    rawAmount: 189.0,
    type: "Full",
    reason: "Defective Switch",
    reasonDetail:
      "The mechanical switch housing on the Spacebar and Left Shift key emits a scraping friction noise and fails keypress registration intermittently on model APX-KB-BLK-TAC.",
    slaTimer: "6h left",
    slaUrgent: true,
    status: "Pending",
    statusVariant: "warning",
    date: "May 14, 2024",
    gateway: "Stripe",
    trackingNumber: "7489 2018 4910",
    warehouseStation: "Warehouse East #04",
    evidencePhotos: [
      {
        name: "stem_alignment.jpg",
        url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80",
      },
      {
        name: "serial_box_tag.jpg",
        url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300&auto=format&fit=crop&q=80",
      },
    ],
    documents: ["signed_bol_7489.pdf", "zendesk_ticket_491.pdf"],
  },
  {
    id: "disp_39401B",
    orderId: "ORD-10239",
    customer: "Evelyn Shaw",
    email: "eshaw@architects.io",
    tier: "T2",
    amount: "$450.00",
    rawAmount: 450.0,
    type: "Chargeback",
    reason: "Fraudulent Charge",
    reasonDetail: "Customer filed unauthorized transaction dispute via Chase Bank card issuing portal.",
    slaTimer: "2d left",
    slaUrgent: true,
    status: "Under Dispute",
    statusVariant: "destructive",
    date: "May 12, 2024",
    gateway: "Stripe",
    trackingNumber: "USPS-940011189921",
    warehouseStation: "Warehouse East #01",
    evidencePhotos: [],
    documents: ["chargeback_notice_chase.pdf", "delivery_photo_geo.pdf"],
  },
  {
    id: "ref_89198K",
    orderId: "ORD-10190",
    customer: "Marcus Chen",
    email: "marcus.c@techcorp.io",
    amount: "$89.00",
    rawAmount: 89.0,
    type: "Partial (-15%)",
    reason: "Customer Remorse",
    reasonDetail: "Customer opened box but decided on different switch variant. 15% restocking fee calculated.",
    slaTimer: "14h left",
    status: "Pending",
    statusVariant: "warning",
    date: "May 11, 2024",
    gateway: "Affirm",
    trackingNumber: "FEDEX-882190241829",
    warehouseStation: "Warehouse West #02",
    evidencePhotos: [],
    documents: ["rma_slip_89198.pdf"],
  },
  {
    id: "ref_89195F",
    orderId: "ORD-10188",
    customer: "Clara Oswald",
    email: "clara.o@studio.co.uk",
    amount: "$320.00",
    rawAmount: 320.0,
    type: "Full",
    reason: "Transit Damage",
    reasonDetail: "Outer box crushed by carrier courier. Internal aluminum chassis dented on right edge.",
    slaTimer: "18h left",
    status: "Pending",
    statusVariant: "warning",
    date: "May 10, 2024",
    gateway: "Stripe",
    trackingNumber: "DHL-4819204918",
    warehouseStation: "Warehouse East #04",
    evidencePhotos: [
      {
        name: "crushed_box.jpg",
        url: "https://images.unsplash.com/photo-1541140532154-b024d705b909?w=300&auto=format&fit=crop&q=80",
      },
    ],
    documents: ["dhl_damage_claim_819.pdf"],
  },
  {
    id: "ref_89170Z",
    orderId: "ORD-10142",
    customer: "Devon Banks",
    email: "devon.b@banks.org",
    tier: "VIP",
    amount: "$112.50",
    rawAmount: 112.5,
    type: "Credit (+10%)",
    reason: "Size Exchange",
    reasonDetail: "Customer opted for store credit payout with 10% bonus credit applied ($123.75 balance issued).",
    slaTimer: "Settled",
    status: "Settled",
    statusVariant: "success",
    date: "May 08, 2024",
    gateway: "PayPal",
    trackingNumber: "USPS-940011189901",
    warehouseStation: "Warehouse Central #01",
    evidencePhotos: [],
    documents: ["store_credit_receipt_9170.pdf"],
  },
  {
    id: "disp_39210C",
    orderId: "ORD-09881",
    customer: "Siddharth N.",
    email: "sid.n@global.in",
    amount: "$690.00",
    rawAmount: 690.0,
    type: "Chargeback",
    reason: "Unrecognized",
    reasonDetail: "Carrier signature POD and GPS timestamp evidence submitted to Stripe. Dispute resolved in merchant favor.",
    slaTimer: "Won (Carrier POD)",
    status: "Dispute Won",
    statusVariant: "success",
    date: "May 04, 2024",
    gateway: "Stripe",
    trackingNumber: "FEDEX-910248201948",
    warehouseStation: "Warehouse East #01",
    evidencePhotos: [],
    documents: ["signed_carrier_pod.pdf", "stripe_dispute_decision.pdf"],
  },
  {
    id: "ref_89162M",
    orderId: "ORD-10114",
    customer: "Amara Walker",
    email: "amara.w@creative.com",
    amount: "$54.00",
    rawAmount: 54.0,
    type: "Full",
    reason: "Accidental Dupl",
    reasonDetail: "Customer double clicked submit checkout order button. Duplicate line item refunded automatically.",
    slaTimer: "22h left",
    status: "Pending",
    statusVariant: "warning",
    date: "May 02, 2024",
    gateway: "Apple Pay",
    trackingNumber: "—",
    warehouseStation: "System Auto-Cancel",
    evidencePhotos: [],
    documents: ["order_duplicate_log.pdf"],
  },
]

export default function RefundsDisputesQueuePage() {
  const [activeTab, setActiveTab] = React.useState<"pending" | "disputes" | "settled" | "declined">("pending")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedItem, setSelectedItem] = React.useState<RefundItem>(REFUND_QUEUE_DATA[0])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([REFUND_QUEUE_DATA[0].id])
  const [reasonFilter, setReasonFilter] = React.useState<string>("all")
  const [gatewayFilter, setGatewayFilter] = React.useState<string>("all")
  const [settlementRoute, setSettlementRoute] = React.useState<"original" | "credit">("original")
  const [isExecuting, setIsExecuting] = React.useState(false)
  const [executedSuccess, setExecutedSuccess] = React.useState(false)
  const [manualRefundModal, setManualRefundModal] = React.useState(false)
  const [policyConfigModal, setPolicyConfigModal] = React.useState(false)

  // Filter items
  const filteredItems = REFUND_QUEUE_DATA.filter((item) => {
    if (activeTab === "pending" && item.status !== "Pending") return false
    if (activeTab === "disputes" && item.status !== "Under Dispute" && item.status !== "Dispute Won") return false
    if (activeTab === "settled" && item.status !== "Settled" && item.status !== "Dispute Won") return false
    if (activeTab === "declined" && item.status !== "Declined") return false

    if (reasonFilter !== "all" && !item.reason.toLowerCase().includes(reasonFilter.toLowerCase())) return false
    if (gatewayFilter !== "all" && item.gateway.toLowerCase() !== gatewayFilter.toLowerCase()) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        item.id.toLowerCase().includes(q) ||
        item.orderId.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.trackingNumber.toLowerCase().includes(q)
      )
    }
    return true
  })

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredItems.map((i) => i.id))
    }
  }

  const toggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleApproveRefund = () => {
    setIsExecuting(true)
    setTimeout(() => {
      setIsExecuting(false)
      setExecutedSuccess(true)
      setTimeout(() => setExecutedSuccess(false), 3000)
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* 1. Sub-Header & Breadcrumb Bar */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer">Finance</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Refunds &amp; Disputes Queue</span>
            <span>•</span>
            <Badge variant="brand" className="text-[10px] font-bold uppercase tracking-wider">
              Live Queue: 7 Pending
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              className="gap-1.5 text-xs font-medium h-7"
              onClick={() => setPolicyConfigModal(true)}
            >
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              <span>Policy Rules Config</span>
            </Button>

            <Button
              size="xs"
              variant="outline"
              className="gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 h-7"
              onClick={() => alert("Batch approving 4 return-bar verified pending refunds...")}
            >
              <Zap className="size-3.5 text-indigo-600" />
              <span>Batch Approve Pending (4)</span>
            </Button>

            <Button
              size="xs"
              className="gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white h-7 shadow-xs"
              onClick={() => setManualRefundModal(true)}
            >
              <RotateCcw className="size-3.5" />
              <span>Issue Manual Refund</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1">
          <div>
            <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Refunds &amp; Dispute Resolutions
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage automated return settlements, merchant refund authorizations, and formal Stripe chargeback defenses.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span>Cycle: <strong className="text-foreground">May 01 - May 31</strong></span>
            <span>|</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gateway Webhooks Synchronized
            </span>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Grid (4 Analytical Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>Active Refund Requests</span>
              <Badge variant="warning" className="text-[10px] font-mono font-semibold">
                SLA: 4.2h Avg
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                7 Pending
              </span>
              <span className="font-mono text-xs text-muted-foreground">($1,294.00)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>4 auto-approved ReturnBar</span>
              <span className="text-emerald-600 font-mono font-semibold">+18% vs lw</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "65%" }} />
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>Total Refunded (30D)</span>
              <Badge variant="success" className="text-[10px] font-mono font-semibold">
                Healthy &lt; 2.5%
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                $18,420.00
              </span>
              <span className="font-mono text-xs text-muted-foreground">/ 1.2% GMV</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Gross Volume: $1,535,000</span>
              <span className="text-emerald-600 font-mono font-semibold">-0.3% mom</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "48%" }} />
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-[10.5px] font-bold uppercase tracking-wider">
              <span>Formal Chargebacks</span>
              <Badge variant="destructive" className="text-[10px] font-mono font-semibold">
                High Priority
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                3 Active
              </span>
              <span className="font-mono text-xs text-muted-foreground">($1,140.00)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Evidence deadline: <strong className="text-foreground">5 days</strong></span>
              <span className="text-rose-600 font-mono font-semibold">1 imminent</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: "82%" }} />
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>Restocking &amp; Return Rate</span>
              <Badge variant="secondary" className="text-[10px] font-mono font-semibold">
                Target 3.0%
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                3.4%
              </span>
              <span className="font-mono text-xs text-muted-foreground">returns/order</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Highest: <strong className="text-foreground">Keycaps &amp; Switches</strong></span>
              <span className="text-amber-600 font-mono font-semibold">Elevated</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "68%" }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filter & Tab Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/20 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors ${
                activeTab === "pending"
                  ? "bg-card text-indigo-600 shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Pending Authorization</span>
              <Badge variant="warning" className="h-4 px-1 text-[10px] font-bold">
                7
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("disputes")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors ${
                activeTab === "disputes"
                  ? "bg-card text-rose-600 shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Chargeback Disputes</span>
              <Badge variant="destructive" className="h-4 px-1 text-[10px] font-bold">
                3
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settled")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "settled"
                  ? "bg-card text-emerald-600 shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Completed Settlements</span>
              <span className="text-[11px] font-mono text-muted-foreground">148</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("declined")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "declined"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Declined / Cancelled</span>
              <span className="text-[11px] font-mono text-muted-foreground">12</span>
            </button>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              disabled={selectedIds.length === 0}
              className="gap-1.5 text-xs font-semibold h-7"
              onClick={() => alert(`Approved ${selectedIds.length} refunds.`)}
            >
              <CheckCircle className="size-3.5 text-emerald-600" />
              <span>Approve Selected ({selectedIds.length})</span>
            </Button>

            <Button
              size="xs"
              variant="outline"
              disabled={selectedIds.length === 0}
              className="gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 h-7"
              onClick={() => {
                const reason = prompt("Enter rejection reason for customer notification:")
                if (reason) alert(`Declined refund with note: ${reason}`)
              }}
            >
              <Ban className="size-3.5" />
              <span>Reject with Reason</span>
            </Button>

            <Button
              size="xs"
              variant="outline"
              className="gap-1.5 text-xs font-medium h-7"
              onClick={() => alert("Exporting refunds queue CSV...")}
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Search + Filter Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-2 text-xs shadow-2xs">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Refund ID (ref_*), Order ID, Customer, or Carrier Tracking..."
              className="h-8 w-full rounded-md border border-border/80 bg-background pl-8 pr-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground"
            >
              <option value="all">Reason: All Types</option>
              <option value="Defective">Defective Switch / Item</option>
              <option value="Damage">Transit Damage</option>
              <option value="Remorse">Customer Remorse</option>
              <option value="Fraud">Fraud / Chargeback</option>
              <option value="Dupl">Duplicate Order</option>
            </select>

            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground"
            >
              <option value="all">Gateway: All Gateways</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="affirm">Affirm BNPL</option>
              <option value="apple pay">Apple Pay</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Main Multi-Pane Content Canvas: Table (Left) + Detail Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANE: Active Refunds & Dispute Work Table (7 cols / 8 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 bg-card rounded-xl border border-border/80 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-mono uppercase text-[10.5px]">
                  <th className="p-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border accent-indigo-600"
                    />
                  </th>
                  <th className="p-3">Refund ID</th>
                  <th className="p-3">Order Ref</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">SLA Timer</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 font-medium"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => toggleSelectId(item.id, e)}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => {}}
                          className="rounded border-border accent-indigo-600"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-600 whitespace-nowrap">
                        {item.id}
                      </td>
                      <td className="p-3 font-mono font-medium text-foreground whitespace-nowrap">
                        {item.orderId}
                      </td>
                      <td className="p-3 max-w-[120px] truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-foreground truncate">{item.customer}</span>
                          {item.tier && (
                            <Badge variant="brand" className="text-[9px] px-1 h-3.5 font-mono">
                              {item.tier}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {item.amount}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {item.type}
                      </td>
                      <td className="p-3 max-w-[130px] truncate">
                        <Badge variant="secondary" className="text-[10px] font-normal truncate">
                          {item.reason}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                        <span className={item.slaUrgent ? "text-amber-600 font-bold" : "text-muted-foreground"}>
                          {item.slaTimer}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant={item.statusVariant} className="text-[10px]">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          size="xs"
                          variant={isSelected ? "default" : "ghost"}
                          className={`h-6 px-2 text-xs ${
                            isSelected ? "bg-indigo-600 text-white font-bold" : "text-indigo-600"
                          }`}
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-border/70 bg-muted/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
            <div>
              Showing {filteredItems.length} records • Selection: {selectedIds.length} items
            </div>
            <div className="flex items-center gap-1">
              <Button size="xs" variant="outline" className="h-6 px-2" disabled>
                Previous
              </Button>
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold">1</span>
              <Button size="xs" variant="outline" className="h-6 px-2" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Interactive Review & Dispute Evidence Drawer (5 cols) */}
        {selectedItem && (
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 bg-card rounded-xl border border-border/80 shadow-md flex flex-col overflow-hidden sticky top-20">
            {/* Drawer Header */}
            <div className="p-4 border-b border-border/70 bg-muted/20 flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-indigo-600">
                    {selectedItem.id}
                  </span>
                  <Badge variant={selectedItem.statusVariant} className="text-[10px] font-bold">
                    {selectedItem.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Origin: ReturnBar Portal • Gateway: {selectedItem.gateway}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  nativeButton={false}
                  render={<Link href={`/orders`} />}
                  size="xs"
                  variant="ghost"
                  className="p-1 size-7 text-muted-foreground hover:text-foreground"
                  title="Open in dedicated page"
                >
                  <ExternalLink className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="p-4 space-y-4 text-xs max-h-[calc(100vh-230px)] overflow-y-auto">
              {/* Order & Customer Association Block */}
              <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target Order:</span>
                  <Link
                    href="/orders"
                    className="font-mono font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>{selectedItem.orderId}</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Original Paid:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {selectedItem.amount} USD via {selectedItem.gateway}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Purchaser:</span>
                  <div className="flex items-center gap-1 font-medium text-foreground">
                    <span>{selectedItem.customer}</span>
                    <span className="text-muted-foreground font-mono text-[11px]">({selectedItem.email})</span>
                  </div>
                </div>
              </div>

              {/* Customer Claim Details */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10.5px]">
                    Customer Claim &amp; Reason
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {selectedItem.reason}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg border border-border/70 bg-background leading-relaxed text-foreground italic">
                  "{selectedItem.reasonDetail}"
                </div>
              </div>

              {/* Defect Photo Evidence */}
              {selectedItem.evidencePhotos.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10.5px]">
                      Uploaded Defect Evidence ({selectedItem.evidencePhotos.length})
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-mono text-[11px] font-bold">
                      <CheckCircle2 className="size-3" />
                      AI Optical Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedItem.evidencePhotos.map((photo, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-border group bg-muted">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px]">
                          {photo.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logistics & Return Warehouse Tracker */}
              <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Truck className="size-3.5 text-indigo-600" />
                    <span>Courier Return Tracking</span>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Received &amp; Passed
                  </Badge>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                  <span>Tracking: <strong className="text-foreground">{selectedItem.trackingNumber}</strong></span>
                  <span>Intake: <strong className="text-foreground">{selectedItem.warehouseStation}</strong></span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Physical inspection completed: item received in factory box with all cabling and accessories intact.
                </p>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
                <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10.5px]">
                  Financial Resolution Breakdown
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Original Line Item:</span>
                    <span className="font-mono text-foreground font-semibold">{selectedItem.amount} USD</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Return Shipping Fee:</span>
                    <span className="font-mono text-emerald-600 font-semibold">$0.00 (Merchant Absorbed)</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Restocking Fee (15%):</span>
                    <span className="font-mono text-emerald-600 font-semibold">$0.00 (Waived Defect)</span>
                  </div>
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <span className="font-bold text-foreground">Net Refund Authorization:</span>
                    <span className="font-mono text-base font-bold text-indigo-600">
                      {selectedItem.amount} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Settlement Route Selection (Interactive Radio Option) */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10.5px]">
                  Settlement Destination Route
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    onClick={() => setSettlementRoute("original")}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      settlementRoute === "original"
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "border-border bg-background hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="route"
                      checked={settlementRoute === "original"}
                      onChange={() => setSettlementRoute("original")}
                      className="mt-0.5 accent-indigo-600"
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">Original Payment Gateway</span>
                        <span className="font-mono text-[10.5px] text-muted-foreground">{selectedItem.gateway}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        Credited directly back to customer payment card in 3-5 business banking days.
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setSettlementRoute("credit")}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      settlementRoute === "credit"
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "border-border bg-background hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="route"
                      checked={settlementRoute === "credit"}
                      onChange={() => setSettlementRoute("credit")}
                      className="mt-0.5 accent-indigo-600"
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600">Apex Store Credit (+10% Bonus)</span>
                        <Badge variant="brand" className="text-[9px] font-mono font-bold">
                          +${(selectedItem.rawAmount * 0.1).toFixed(2)} BONUS
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        Issue ${(selectedItem.rawAmount * 1.1).toFixed(2)} instant wallet credit to customer profile.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Defense Documents */}
              {selectedItem.documents.length > 0 && (
                <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    <span>Evidence &amp; Legal Defense Documents</span>
                    <span>{selectedItem.documents.length} Files</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.documents.map((doc, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-background border border-border text-foreground font-mono text-[10.5px] flex items-center gap-1 shadow-2xs"
                      >
                        <FileText className="size-3 text-indigo-600" />
                        <span>{doc}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Bottom Execution Action Bar */}
            <div className="p-3.5 border-t border-border/70 bg-muted/20 space-y-2">
              <Button
                disabled={isExecuting}
                onClick={handleApproveRefund}
                className={`w-full h-9 font-bold text-xs shadow-xs gap-2 transition-colors ${
                  executedSuccess
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                {isExecuting ? (
                  <>
                    <span className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Broadcasting to {selectedItem.gateway} API...</span>
                  </>
                ) : executedSuccess ? (
                  <>
                    <CheckCircle className="size-4 text-white" />
                    <span>Refund #{selectedItem.id} Executed Successfully!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4" />
                    <span>
                      Approve &amp; Execute Refund (
                      {settlementRoute === "credit"
                        ? `$${(selectedItem.rawAmount * 1.1).toFixed(2)} Credit`
                        : `${selectedItem.amount} USD`}
                      )
                    </span>
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  className="text-xs font-semibold h-7 truncate"
                  onClick={() => {
                    setSettlementRoute("credit")
                    handleApproveRefund()
                  }}
                >
                  Convert to Credit (+10%)
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  className="text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 h-7 truncate"
                  onClick={() => {
                    const reason = prompt("State rejection reason for compliance records:")
                    if (reason) alert(`Declined refund with note: ${reason}`)
                  }}
                >
                  Decline Refund
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Refund Modal */}
      {manualRefundModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-md w-full space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <RotateCcw className="size-4 text-indigo-600" />
                <span>Issue Manual Refund</span>
              </h3>
              <button
                type="button"
                onClick={() => setManualRefundModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground font-semibold">Order Reference ID</label>
                <input
                  type="text"
                  placeholder="e.g. ORD-10248"
                  className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 font-mono text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-muted-foreground font-semibold">Refund Amount ($ USD)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 font-mono text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-muted-foreground font-semibold">Reason Code</label>
                <select className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 text-xs text-foreground">
                  <option>Defective Product</option>
                  <option>Customer Remorse (Subject to Restocking)</option>
                  <option>Damaged in Transit</option>
                  <option>Goodwill Merchant Concession</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button size="xs" variant="outline" onClick={() => setManualRefundModal(false)}>
                Cancel
              </Button>
              <Button
                size="xs"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                onClick={() => {
                  alert("Manual refund authorized and broadcast to Stripe.")
                  setManualRefundModal(false)
                }}
              >
                Submit Authorization
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Rules Config Modal */}
      {policyConfigModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-lg w-full space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <SlidersHorizontal className="size-4 text-indigo-600" />
                <span>Automated Refund Policy &amp; Triage Rules</span>
              </h3>
              <button
                type="button"
                onClick={() => setPolicyConfigModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Auto-Approval Threshold</span>
                  <span className="font-mono text-indigo-600 font-bold">&lt; $100.00</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Automatically approve verified ReturnBar drop-offs with optical AI confirmation under $100 without manual human intervention.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Restocking Fee Standard</span>
                  <span className="font-mono text-foreground font-bold">15.0%</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Apply 15% restocking fee on remorse returns unless customer selects Store Credit (+10% bonus).
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button size="xs" variant="outline" onClick={() => setPolicyConfigModal(false)}>
                Close
              </Button>
              <Button
                size="xs"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                onClick={() => {
                  alert("Policy rules saved.")
                  setPolicyConfigModal(false)
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
