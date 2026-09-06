"use client"

import * as React from "react"
import Link from "next/link"
import {
  CreditCard,
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
  RotateCcw,
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
  RefreshCw,
  Code,
  Globe,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PaymentRecord {
  id: string
  orderId: string
  customer: string
  countryFlag: string
  countryCode: string
  method: string
  cardLast4: string
  gateway: "Stripe" | "PayPal" | "Apple Pay" | "Affirm"
  grossAmount: string
  fee: string
  netAmount: string
  riskScore: number
  riskLabel: "Normal" | "Elevated" | "High Risk"
  status: "insufficient_funds" | "radar_blocked" | "expired_card" | "succeeded" | "gateway_timeout" | "do_not_honor"
  statusLabel: string
  statusVariant: "destructive" | "warning" | "success" | "secondary"
  timestamp: string
  recommendation?: string
  smartRetryWindow?: string
  recoveryProbability?: string
  timeline: { title: string; time: string; desc: string; type: "success" | "error" | "brand" }[]
}

const PAYMENTS_DATA: PaymentRecord[] = [
  {
    id: "pi_3M4k9bL291k",
    orderId: "ORD-10246",
    customer: "Marcus Chen",
    countryFlag: "🇺🇸",
    countryCode: "US",
    method: "Visa",
    cardLast4: "4242",
    gateway: "Stripe",
    grossAmount: "$342.50",
    fee: "$10.22",
    netAmount: "$332.28",
    riskScore: 14,
    riskLabel: "Normal",
    status: "insufficient_funds",
    statusLabel: "insufficient_funds",
    statusVariant: "destructive",
    timestamp: "Oct 31, 14:21:04",
    recommendation: "Automated Retries",
    smartRetryWindow: "Today @ 18:25:00 UTC",
    recoveryProbability: "72.4%",
    timeline: [
      {
        title: "3DS Authentication Successful",
        time: "14:21:00",
        desc: "Frictionless flow approved by Chase Bank 3DS Server",
        type: "success",
      },
      {
        title: "Stripe Auth Rejected",
        time: "14:21:04",
        desc: "Decline code: insufficient_funds (HTTP 402)",
        type: "error",
      },
      {
        title: "Smart Retry Queued",
        time: "14:25:12",
        desc: "Scheduled for execution at optimal liquidity window",
        type: "brand",
      },
    ],
  },
  {
    id: "pi_3M4e19X882p",
    orderId: "ORD-10245",
    customer: "Elena Rostov",
    countryFlag: "🇷🇴",
    countryCode: "RO",
    method: "Mastercard",
    cardLast4: "9811",
    gateway: "Stripe",
    grossAmount: "$1,290.00",
    fee: "$0.00",
    netAmount: "$1,290.00",
    riskScore: 91,
    riskLabel: "High Risk",
    status: "radar_blocked",
    statusLabel: "radar_blocked",
    statusVariant: "destructive",
    timestamp: "Oct 31, 14:02:18",
    recommendation: "Manual Identity Verification",
    smartRetryWindow: "Blocked by Radar Rule #49",
    recoveryProbability: "12.0%",
    timeline: [
      {
        title: "High Velocity Device Fingerprint",
        time: "14:02:15",
        desc: "4 attempts across 2 IP addresses within 60 seconds",
        type: "error",
      },
      {
        title: "Stripe Radar Block",
        time: "14:02:18",
        desc: "Blocked by rule: Block if risk_score > 85",
        type: "error",
      },
    ],
  },
  {
    id: "pp_99482X9012a",
    orderId: "ORD-10243",
    customer: "Julian Vance",
    countryFlag: "🇬🇧",
    countryCode: "GB",
    method: "PayPal",
    cardLast4: "Wallet",
    gateway: "PayPal",
    grossAmount: "$189.00",
    fee: "$6.45",
    netAmount: "$182.55",
    riskScore: 22,
    riskLabel: "Normal",
    status: "do_not_honor",
    statusLabel: "do_not_honor",
    statusVariant: "destructive",
    timestamp: "Oct 31, 13:45:10",
    recommendation: "Customer Recovery Email Link",
    smartRetryWindow: "User re-authentication required",
    recoveryProbability: "64.0%",
    timeline: [
      {
        title: "PayPal Vault Token Invoked",
        time: "13:45:08",
        desc: "Token expired or revoked by buyer account",
        type: "error",
      },
    ],
  },
  {
    id: "pi_3M4c11Z992k",
    orderId: "ORD-10240",
    customer: "Devon Banks",
    countryFlag: "🇺🇸",
    countryCode: "US",
    method: "Visa",
    cardLast4: "1092",
    gateway: "Stripe",
    grossAmount: "$540.00",
    fee: "$16.20",
    netAmount: "$523.80",
    riskScore: 0.02,
    riskLabel: "Normal",
    status: "succeeded",
    statusLabel: "succeeded",
    statusVariant: "success",
    timestamp: "Oct 31, 13:22:00",
    timeline: [
      {
        title: "Stripe 3DS Frictionless Auth",
        time: "13:21:58",
        desc: "Cardholder verified",
        type: "success",
      },
      {
        title: "Captured $540.00 USD",
        time: "13:22:00",
        desc: "Settlement scheduled for next payout batch",
        type: "success",
      },
    ],
  },
  {
    id: "pi_3M4b88L002x",
    orderId: "ORD-10237",
    customer: "Amina Diop",
    countryFlag: "🇫🇷",
    countryCode: "FR",
    method: "Visa",
    cardLast4: "1182",
    gateway: "Stripe",
    grossAmount: "$219.00",
    fee: "$0.00",
    netAmount: "$219.00",
    riskScore: 11,
    riskLabel: "Normal",
    status: "expired_card",
    statusLabel: "expired_card",
    statusVariant: "destructive",
    timestamp: "Oct 31, 12:54:19",
    recommendation: "Card Expiration Update Notice",
    smartRetryWindow: "Awaiting new token",
    recoveryProbability: "88.5%",
    timeline: [
      {
        title: "Auth Declined: Card Expired",
        time: "12:54:19",
        desc: "Expiration date 10/24 past current billing cycle",
        type: "error",
      },
    ],
  },
]

export default function PaymentsLedgerFailureTriagePage() {
  const [activePreset, setActivePreset] = React.useState<"all" | "failed" | "pending" | "disputes" | "radar">(
    "failed"
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [gatewayFilter, setGatewayFilter] = React.useState("all")
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentRecord>(PAYMENTS_DATA[0])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([PAYMENTS_DATA[0].id])
  const [isRetrying, setIsRetrying] = React.useState(false)
  const [retrySuccess, setRetrySuccess] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [paymentLinkModal, setPaymentLinkModal] = React.useState(false)
  const [jsonPayloadModal, setJsonPayloadModal] = React.useState(false)

  const filteredPayments = PAYMENTS_DATA.filter((p) => {
    if (activePreset === "failed" && p.status === "succeeded") return false
    if (activePreset === "disputes" && p.status !== "radar_blocked" && p.status !== "do_not_honor") return false
    if (activePreset === "radar" && p.riskScore < 75) return false

    if (statusFilter !== "all" && p.status !== statusFilter) return false
    if (gatewayFilter !== "all" && p.gateway.toLowerCase() !== gatewayFilter.toLowerCase()) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        p.id.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q) ||
        p.cardLast4.includes(q)
      )
    }
    return true
  })

  const handleCopy = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    navigator.clipboard?.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleInstantRetry = () => {
    setIsRetrying(true)
    setTimeout(() => {
      setIsRetrying(false)
      setRetrySuccess(true)
      setTimeout(() => setRetrySuccess(false), 3500)
    }, 1100)
  }

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* 1. Sub-Header & Live Webhook Telemetry */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>Finance</span>
            <span>/</span>
            <span className="text-indigo-600 font-semibold">Payments</span>
            <span>/</span>
            <span className="text-foreground">Ledger &amp; Failure Triage</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              className="gap-1.5 text-xs font-medium h-7"
              onClick={() => alert("Exporting 30-day settlement CSV...")}
            >
              <Download className="size-3.5" />
              <span>Export Settlement CSV</span>
            </Button>

            <Button
              size="xs"
              variant="outline"
              className="gap-1.5 text-xs font-medium h-7 text-indigo-600"
              onClick={() => alert("Triggering re-synchronization of all dead-letter webhooks...")}
            >
              <RefreshCw className="size-3.5" />
              <span>Re-run Failed Webhooks</span>
            </Button>

            <Button
              size="xs"
              className="gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white h-7 shadow-xs"
              onClick={() => setPaymentLinkModal(true)}
            >
              <Plus className="size-3.5" />
              <span>Manual Payment Link</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1">
          <div>
            <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Payments Ledger &amp; Failure Triage
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live multi-gateway settlement stream, automatic ML smart retries, and radar risk triage.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1 text-xs font-mono text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Stripe &amp; PayPal Webhooks Active</span>
            <span className="text-muted-foreground">•</span>
            <span>Latency 38ms</span>
          </div>
        </div>
      </div>

      {/* 2. KPI Density Bar Cards (4 Cards with Sparkline & Progress) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* KPI 1 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>Total Volume (30D)</span>
              <DollarSign className="size-3.5 text-indigo-600" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  $1,429,812.40
                </span>
                <div className="flex items-center gap-1 mt-0.5 text-xs">
                  <span className="font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.2 rounded">
                    +14.8%
                  </span>
                  <span className="text-muted-foreground text-[11px]">vs prev 30d</span>
                </div>
              </div>

              {/* Micro SVG Sparkline */}
              <svg className="w-16 h-8 text-indigo-600 overflow-visible shrink-0" fill="none" viewBox="0 0 64 32">
                <path
                  d="M0 24 L10 20 L20 22 L30 14 L40 18 L50 8 L64 2"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M0 24 L10 20 L20 22 L30 14 L40 18 L50 8 L64 2 V 32 H 0 Z"
                  fill="currentColor"
                  fillOpacity="0.1"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>Settlement Success</span>
              <CheckCircle2 className="size-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  98.42%
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  14,210 successful txns
                </span>
              </div>
              <div className="w-16 h-2 rounded-full bg-muted overflow-hidden shrink-0">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "98.42%" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-[10.5px] font-bold uppercase tracking-wider">
              <span>Failed &amp; Blocked</span>
              <AlertTriangle className="size-3.5 text-rose-600" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                  $4,280.50
                </span>
                <div className="flex items-center gap-1 mt-0.5 text-[11px]">
                  <Badge variant="destructive" className="text-[9px] font-mono px-1 h-3.5">
                    24 incidents
                  </Badge>
                  <span className="text-muted-foreground">18 card, 4 radar</span>
                </div>
              </div>
              <Badge variant="destructive" className="text-[10px] font-mono uppercase">
                Triage
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>Disputes &amp; Chargebacks</span>
              <Gavel className="size-3.5 text-amber-600" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  $1,140.00
                </span>
                <div className="flex items-center gap-1 mt-0.5 text-[11px]">
                  <span className="font-mono text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-1 py-0.2 rounded font-semibold">
                    3 active
                  </span>
                  <span className="text-muted-foreground">0.08% rate (Safe)</span>
                </div>
              </div>
              <div className="flex items-center text-emerald-600 font-mono text-xs font-bold gap-0.5">
                <Shield className="size-3.5" />
                <span>Safe</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filter Strip & Preset Buttons */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/70 bg-muted/20 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActivePreset("all")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activePreset === "all"
                  ? "bg-card font-bold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>All Transactions</span>
              <span className="ml-1 font-mono text-[10.5px] text-muted-foreground">14,234</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePreset("failed")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors ${
                activePreset === "failed"
                  ? "bg-card font-bold text-rose-600 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="size-1.5 rounded-full bg-rose-500" />
              <span>Failed Triage</span>
              <Badge variant="destructive" className="h-4 px-1 text-[10px] font-bold">
                24
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActivePreset("pending")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activePreset === "pending"
                  ? "bg-card font-bold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Pending Capture</span>
              <span className="ml-1 font-mono text-[10.5px] text-muted-foreground">12</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePreset("disputes")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activePreset === "disputes"
                  ? "bg-card font-bold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Disputes &amp; Inquiries</span>
              <span className="ml-1 font-mono text-[10.5px] text-muted-foreground">3</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePreset("radar")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activePreset === "radar"
                  ? "bg-card font-bold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Radar Risk (&gt;75)</span>
              <span className="ml-1 font-mono text-[10.5px] text-muted-foreground">8</span>
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>Auto-refresh:</span>
            <Badge variant="brand" className="text-[10px] font-mono">
              10s
            </Badge>
          </div>
        </div>

        {/* Search & Multifactor Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-2 text-xs shadow-2xs">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Payment ID (pi_*, ch_*), Order, Customer, or Card last4..."
              className="h-8 w-full rounded-md border border-border/80 bg-background pl-8 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/80 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌘F
            </kbd>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground"
            >
              <option value="all">Status: All Failures</option>
              <option value="insufficient_funds">Insufficient Funds</option>
              <option value="radar_blocked">Radar Blocked</option>
              <option value="expired_card">Expired Card</option>
              <option value="do_not_honor">Do Not Honor</option>
            </select>

            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground"
            >
              <option value="all">Gateway: All Gateways</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal Express</option>
              <option value="apple pay">Apple Pay</option>
              <option value="affirm">Affirm BNPL</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Split Workspace: Payments Table (Left) & Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Data Table (7 cols / 8 cols) */}
        <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 bg-card rounded-xl border border-border/80 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-mono uppercase text-[10.5px]">
                  <th className="p-3">Payment ID</th>
                  <th className="p-3">Order Ref</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Method</th>
                  <th className="p-3 text-right">Amount / Fee</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Status &amp; Code</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPayments.map((pay) => {
                  const isSelected = selectedPayment?.id === pay.id
                  return (
                    <tr
                      key={pay.id}
                      onClick={() => setSelectedPayment(pay)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 font-medium"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="p-3 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-indigo-600">{pay.id}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(pay.id, e)}
                            className="text-muted-foreground hover:text-indigo-600 p-0.5"
                          >
                            {copiedId === pay.id ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                          <Badge variant="secondary" className="text-[9px] px-1 h-3.5 font-mono">
                            {pay.gateway}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-medium text-foreground">
                        {pay.orderId}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground truncate">{pay.customer}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {pay.countryFlag} {pay.countryCode}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {pay.method} •••• {pay.cardLast4}
                      </td>
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-foreground">{pay.grossAmount}</div>
                        <div className="text-[10px] text-muted-foreground">Fee: {pay.fee}</div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={pay.riskScore > 75 ? "destructive" : "secondary"}
                          className="text-[10px] font-mono"
                        >
                          {pay.riskScore} {pay.riskLabel}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={pay.statusVariant} className="text-[10px] font-mono">
                          {pay.statusLabel}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[10.5px] text-muted-foreground whitespace-nowrap">
                        {pay.timestamp}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-border/70 bg-muted/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
            <div>
              Showing {filteredPayments.length} of 24 triage candidates • Backlog: $4,280.50
            </div>
            <div className="flex items-center gap-1">
              <Button size="xs" variant="outline" className="h-6 px-2" disabled>
                &lt;
              </Button>
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold">1</span>
              <Button size="xs" variant="outline" className="h-6 px-2" disabled>
                &gt;
              </Button>
            </div>
          </div>
        </div>

        {/* Transaction Inspector Drawer (Right Pane - 5 cols) */}
        {selectedPayment && (
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 bg-card rounded-xl border border-border/80 shadow-md p-4 space-y-4 text-xs sticky top-20">
            {/* Top Bar */}
            <div className="flex items-start justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {selectedPayment.id}
                  </span>
                  <Badge variant={selectedPayment.statusVariant} className="text-[10px] uppercase font-bold">
                    {selectedPayment.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Order {selectedPayment.orderId} • Customer {selectedPayment.customer}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="xs"
                  variant="ghost"
                  className="size-7 p-0 text-muted-foreground"
                  title="View raw JSON"
                  onClick={() => setJsonPayloadModal(true)}
                >
                  <Code className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Failure & ML Recommendation Box */}
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-rose-600 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="font-bold text-rose-900 dark:text-rose-200 text-xs">
                    Declined: {selectedPayment.status}
                  </div>
                  <p className="text-[11px] text-rose-800/90 dark:text-rose-300 leading-relaxed">
                    The card issuing bank reported an authorization rejection for the {selectedPayment.grossAmount} debit attempt.
                  </p>
                </div>
              </div>

              {selectedPayment.recommendation && (
                <div className="p-2.5 rounded bg-card border border-border/70 text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground uppercase font-semibold">
                    <span>Apex Engine Recommendation:</span>
                    <span className="text-indigo-600 font-bold">{selectedPayment.recommendation}</span>
                  </div>
                  <p className="text-muted-foreground">
                    Next retry window: <strong className="text-foreground">{selectedPayment.smartRetryWindow}</strong>. Recovery probability:{" "}
                    <strong className="text-emerald-600 font-mono">{selectedPayment.recoveryProbability}</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Action Triggers */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                disabled={isRetrying}
                onClick={handleInstantRetry}
                className="h-8 font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-xs"
              >
                {isRetrying ? (
                  <>
                    <span className="size-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Retrying...</span>
                  </>
                ) : retrySuccess ? (
                  <>
                    <Check className="size-3.5" />
                    <span>Retry Succeeded!</span>
                  </>
                ) : (
                  <>
                    <Zap className="size-3.5" />
                    <span>Instant Retry</span>
                  </>
                )}
              </Button>

              <Button
                size="xs"
                variant="outline"
                className="h-8 font-medium text-xs gap-1.5"
                onClick={() => {
                  alert(`Recovery payment link dispatched via SMS & Email to ${selectedPayment.customer}.`)
                }}
              >
                <Mail className="size-3.5 text-indigo-600" />
                <span>Recovery Link</span>
              </Button>
            </div>

            {/* Attempt Timeline */}
            <div className="space-y-2">
              <div className="font-mono text-[10.5px] uppercase font-bold tracking-wider text-muted-foreground">
                Attempt &amp; Lifecycle Timeline
              </div>
              <div className="space-y-3 relative pl-3.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {selectedPayment.timeline.map((event, idx) => (
                  <div key={idx} className="relative space-y-0.5">
                    <span
                      className={`absolute -left-3.5 top-1.5 size-2 rounded-full ring-2 ring-card ${
                        event.type === "success"
                          ? "bg-emerald-500"
                          : event.type === "error"
                          ? "bg-rose-500"
                          : "bg-indigo-600"
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-[11.5px]">{event.title}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{event.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{event.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Link Modal */}
      {paymentLinkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-sm w-full space-y-3 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="font-bold text-sm text-foreground">Create Manual Payment Link</h3>
              <button onClick={() => setPaymentLinkModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-2.5">
              <div>
                <label className="text-muted-foreground font-semibold">Customer Email</label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 font-mono text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-muted-foreground font-semibold">Amount ($ USD)</label>
                <input
                  type="number"
                  placeholder="249.00"
                  className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 font-mono text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button size="xs" variant="outline" onClick={() => setPaymentLinkModal(false)}>
                Cancel
              </Button>
              <Button
                size="xs"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                onClick={() => {
                  alert("Generated payment link: https://pay.apexcommerce.io/pl_994821a")
                  setPaymentLinkModal(false)
                }}
              >
                Generate Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON Payload Modal */}
      {jsonPayloadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-lg w-full space-y-3 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="font-bold text-sm text-foreground font-mono">Stripe Webhook Payload</h3>
              <button onClick={() => setJsonPayloadModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-muted/40 font-mono text-[11px] text-foreground overflow-x-auto max-h-72">
              {JSON.stringify(selectedPayment, null, 2)}
            </pre>
            <div className="flex justify-end pt-1">
              <Button size="xs" onClick={() => setJsonPayloadModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
