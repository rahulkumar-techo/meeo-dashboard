"use client"

import * as React from "react"
import Link from "next/link"
import {
  Receipt,
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
  BookOpen,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface JournalPosting {
  account: string
  code: string
  debit: string
  credit: string
}

interface LedgerTransaction {
  id: string
  timeUtc: string
  date: string
  type: "Charge" | "Refund" | "Adjustment" | "Dispute Fee"
  typeVariant: "brand" | "destructive" | "secondary" | "warning"
  customer: string
  orderId: string
  sku: string
  gateway: "Stripe" | "Adyen" | "PayPal" | "Apple Pay" | "Internal Ledger"
  gatewayDetail: string
  railDetail: string
  grossAmount: string
  netFee: string
  settlementAmount: string
  isPositive: boolean
  status: "Reconciled" | "Pending Payout" | "Fee Mismatch" | "Under Review"
  statusVariant: "success" | "secondary" | "destructive" | "warning"
  payoutId: string
  blockHash: string
  authId: string
  batchId: string
  postings: JournalPosting[]
}

const LEDGER_DATA: LedgerTransaction[] = [
  {
    id: "txn_3m4k9bL291k",
    timeUtc: "18:42:19.492",
    date: "2024-10-31",
    type: "Charge",
    typeVariant: "brand",
    customer: "Liam Vance",
    orderId: "ORD-10248",
    sku: "APX-9980",
    gateway: "Stripe",
    gatewayDetail: "us-east-1 • acct_apex_main",
    railDetail: "Visa •••• 1092",
    grossAmount: "+$249.00",
    netFee: "-$6.23",
    settlementAmount: "+$242.77",
    isPositive: true,
    status: "Reconciled",
    statusVariant: "success",
    payoutId: "po_1O9VzQL291a09",
    blockHash: "0x892a4f9104de8201fa8820c",
    authId: "ch_3M4k9bL291k_auth",
    batchId: "BAT-2024-10-31-09",
    postings: [
      { account: "1010 Cash Clearing (Stripe)", code: "ASSET-1010", debit: "$242.77", credit: "—" },
      { account: "5010 Gateway Interchange Expense", code: "EXP-5010", debit: "$6.23", credit: "—" },
      { account: "4010 Product Sales Revenue", code: "REV-4010", debit: "—", credit: "$249.00" },
    ],
  },
  {
    id: "txn_8x2v1qP882m",
    timeUtc: "18:41:02.110",
    date: "2024-10-31",
    type: "Charge",
    typeVariant: "brand",
    customer: "Elena Rostova",
    orderId: "ORD-10247",
    sku: "PRO-1020",
    gateway: "Adyen",
    gatewayDetail: "eu-west-1 • ady_live_corp",
    railDetail: "MC •••• 4421",
    grossAmount: "+$820.50",
    netFee: "-$18.05",
    settlementAmount: "+$802.45",
    isPositive: true,
    status: "Reconciled",
    statusVariant: "success",
    payoutId: "ady_po_882019a",
    blockHash: "0x771bc29104fa2810a90184e",
    authId: "ady_auth_882m",
    batchId: "BAT-2024-10-31-08",
    postings: [
      { account: "1012 Cash Clearing (Adyen EU)", code: "ASSET-1012", debit: "$802.45", credit: "—" },
      { account: "5010 Gateway Interchange Expense", code: "EXP-5010", debit: "$18.05", credit: "—" },
      { account: "4010 Product Sales Revenue", code: "REV-4010", debit: "—", credit: "$820.50" },
    ],
  },
  {
    id: "txn_9r5k1lM441d",
    timeUtc: "18:38:44.802",
    date: "2024-10-31",
    type: "Refund",
    typeVariant: "destructive",
    customer: "Mark Thorne",
    orderId: "ORD-10190",
    sku: "RMA-903",
    gateway: "Stripe",
    gatewayDetail: "us-east-1 • acct_apex_main",
    railDetail: "Amex •••• 3004",
    grossAmount: "-$145.00",
    netFee: "+$0.00",
    settlementAmount: "-$145.00",
    isPositive: false,
    status: "Reconciled",
    statusVariant: "success",
    payoutId: "po_1O9VzQL291a09",
    blockHash: "0x110fb29948aa019283e741",
    authId: "re_3M4k9bL_ref",
    batchId: "BAT-2024-10-31-09",
    postings: [
      { account: "4090 Refunds & Customer Returns", code: "REV-4090", debit: "$145.00", credit: "—" },
      { account: "1010 Cash Clearing (Stripe)", code: "ASSET-1010", debit: "—", credit: "$145.00" },
    ],
  },
  {
    id: "txn_4w7n2kR901a",
    timeUtc: "18:35:10.041",
    date: "2024-10-31",
    type: "Charge",
    typeVariant: "brand",
    customer: "Chloe Bennett",
    orderId: "ORD-10246",
    sku: "LUX-4401",
    gateway: "PayPal",
    gatewayDetail: "global • pp_apex_corp",
    railDetail: "Wallet PP-Balance",
    grossAmount: "+$310.00",
    netFee: "-$8.99",
    settlementAmount: "+$301.01",
    isPositive: true,
    status: "Pending Payout",
    statusVariant: "secondary",
    payoutId: "pp_sweep_pending",
    blockHash: "0x662aa09124fb0019284ea",
    authId: "pp_capture_901a",
    batchId: "BAT-2024-10-31-10",
    postings: [
      { account: "1015 Cash Clearing (PayPal)", code: "ASSET-1015", debit: "$301.01", credit: "—" },
      { account: "5010 Gateway Interchange Expense", code: "EXP-5010", debit: "$8.99", credit: "—" },
      { account: "4010 Product Sales Revenue", code: "REV-4010", debit: "—", credit: "$310.00" },
    ],
  },
  {
    id: "txn_2z9m8xQ112j",
    timeUtc: "18:29:55.719",
    date: "2024-10-31",
    type: "Charge",
    typeVariant: "brand",
    customer: "Marcus Brody",
    orderId: "ORD-10245",
    sku: "IND-8002",
    gateway: "Stripe",
    gatewayDetail: "us-east-1 • acct_apex_main",
    railDetail: "Visa •••• 9920",
    grossAmount: "+$1,240.00",
    netFee: "-$38.10*",
    settlementAmount: "+$1,201.90",
    isPositive: true,
    status: "Fee Mismatch",
    statusVariant: "destructive",
    payoutId: "po_1O9VzQL291a09",
    blockHash: "0x449fa10248e102948bb109",
    authId: "ch_2z9m8x_auth",
    batchId: "BAT-2024-10-31-09",
    postings: [
      { account: "1010 Cash Clearing (Stripe)", code: "ASSET-1010", debit: "$1,201.90", credit: "—" },
      { account: "5010 Gateway Interchange Expense", code: "EXP-5010", debit: "$38.10", credit: "—" },
      { account: "4010 Product Sales Revenue", code: "REV-4010", debit: "—", credit: "$1,240.00" },
    ],
  },
  {
    id: "txn_6q3p0wK511b",
    timeUtc: "18:22:15.309",
    date: "2024-10-31",
    type: "Charge",
    typeVariant: "brand",
    customer: "Priya Sharma",
    orderId: "ORD-10244",
    sku: "ACC-3101",
    gateway: "Apple Pay",
    gatewayDetail: "ap_direct • merchant.apex",
    railDetail: "Tokenized DPAN",
    grossAmount: "+$89.00",
    netFee: "-$2.44",
    settlementAmount: "+$86.56",
    isPositive: true,
    status: "Reconciled",
    statusVariant: "success",
    payoutId: "ap_sweep_901",
    blockHash: "0x992aa1024bb88204910ea",
    authId: "ap_auth_511b",
    batchId: "BAT-2024-10-31-07",
    postings: [
      { account: "1010 Cash Clearing (Stripe)", code: "ASSET-1010", debit: "$86.56", credit: "—" },
      { account: "5010 Gateway Interchange Expense", code: "EXP-5010", debit: "$2.44", credit: "—" },
      { account: "4010 Product Sales Revenue", code: "REV-4010", debit: "—", credit: "$89.00" },
    ],
  },
  {
    id: "adj_1048291a8",
    timeUtc: "18:14:00.000",
    date: "2024-10-31",
    type: "Adjustment",
    typeVariant: "secondary",
    customer: "Sarah Jenkins (Operations)",
    orderId: "JN-9912",
    sku: "CORP-ADJ",
    gateway: "Internal Ledger",
    gatewayDetail: "ledger • apex_corp_clearing",
    railDetail: "Clearing Fee Credit",
    grossAmount: "$0.00",
    netFee: "+$15.00",
    settlementAmount: "+$15.00",
    isPositive: true,
    status: "Reconciled",
    statusVariant: "success",
    payoutId: "manual_journal_9912",
    blockHash: "0x00019284102948bb119283",
    authId: "jn_auth_sarah",
    batchId: "JN-9912",
    postings: [
      { account: "1010 Cash Clearing (Stripe)", code: "ASSET-1010", debit: "$15.00", credit: "—" },
      { account: "5010 Gateway Interchange Expense", code: "EXP-5010", debit: "—", credit: "$15.00" },
    ],
  },
]

export default function FinancialTransactionsLedgerPage() {
  const [activeTab, setActiveTab] = React.useState<"all" | "settled" | "pending" | "disputed" | "adjustments">("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [gatewayFilter, setGatewayFilter] = React.useState("all")
  const [currencyFilter, setCurrencyFilter] = React.useState("usd")
  const [selectedTxn, setSelectedTxn] = React.useState<LedgerTransaction>(LEDGER_DATA[0])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([LEDGER_DATA[0].id])
  const [journalModal, setJournalModal] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const filteredTxns = LEDGER_DATA.filter((txn) => {
    if (activeTab === "settled" && txn.status !== "Reconciled") return false
    if (activeTab === "pending" && txn.status !== "Pending Payout") return false
    if (activeTab === "disputed" && txn.status !== "Fee Mismatch" && txn.status !== "Under Review") return false
    if (activeTab === "adjustments" && txn.type !== "Adjustment") return false

    if (gatewayFilter !== "all" && txn.gateway.toLowerCase() !== gatewayFilter.toLowerCase()) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        txn.id.toLowerCase().includes(q) ||
        txn.orderId.toLowerCase().includes(q) ||
        txn.customer.toLowerCase().includes(q) ||
        txn.railDetail.toLowerCase().includes(q)
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

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* 1. Header & Engine Status Pill */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>Finance</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Transactions &amp; Settlement Ledger</span>
            <Badge variant="brand" className="text-[10px] font-mono">
              v3.2 Reconciliation Engine
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Reconciliation Sync: <strong className="text-foreground">14s ago</strong></span>
            <span>|</span>
            <span>Ledger Block: #4,892,104</span>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mt-1">
          <div className="space-y-0.5">
            <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Financial Transactions &amp; Settlement Ledger
            </h1>
            <p className="text-xs text-muted-foreground max-w-3xl">
              Immutable double-entry transaction record across payment gateways, merchant settlements, fee schedules, and automated ledger reconciliation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              size="xs"
              variant="outline"
              className="gap-1.5 text-xs font-medium h-7"
              onClick={() => alert("Exporting General Ledger CSV...")}
            >
              <Download className="size-3.5" />
              <span>Export Ledger CSV</span>
            </Button>

            <Button
              size="xs"
              variant="outline"
              className="gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 h-7"
              onClick={() => alert("Running real-time auto-reconciliation across Stripe & Adyen...")}
            >
              <RefreshCw className="size-3.5" />
              <span>Run Auto-Reconciliation</span>
            </Button>

            <Button
              size="xs"
              className="gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white h-7 shadow-xs"
              onClick={() => setJournalModal(true)}
            >
              <Plus className="size-3.5" />
              <span>New Journal Entry</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Metric KPI Summary Section (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Card 1: Gross Transaction Volume */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>24H Gross Volume</span>
              <Badge variant="success" className="text-[9px] font-mono">
                +12.4%
              </Badge>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  $482,910.40
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">1,842 Transactions</span>
              </div>
              {/* Micro SVG Sparkline */}
              <svg className="w-20 h-7 text-indigo-600 overflow-visible shrink-0" fill="none" viewBox="0 0 112 24">
                <path
                  d="M0 18 L12 16 L24 20 L36 12 L48 15 L60 9 L72 13 L84 6 L96 8 L112 2"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M0 18 L12 16 L24 20 L36 12 L48 15 L60 9 L72 13 L84 6 L96 8 L112 2 L112 24 L0 24 Z"
                  fill="currentColor"
                  fillOpacity="0.1"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Settlement Health */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>Gateway Settlement</span>
              <Badge variant="brand" className="text-[9px] font-mono">
                Optimal
              </Badge>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                99.94% Settled
              </div>
              <div className="flex flex-wrap gap-1 mt-1 text-[10px] font-mono">
                <span className="bg-muted px-1 py-0.2 rounded">Stripe $312k</span>
                <span className="bg-muted px-1 py-0.2 rounded">Adyen $118k</span>
                <span className="bg-muted px-1 py-0.2 rounded">PayPal $42k</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Processing Fees */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>Processing Fees</span>
              <Badge variant="secondary" className="text-[9px] font-mono">
                2.58% eff.
              </Badge>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                $12,492.10
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                <span>Blended 2.4% + $0.30</span>
                <span>98.2% Auto-Captured</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Discrepancies */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-[10.5px] font-bold uppercase tracking-wider">
              <span>Discrepancies</span>
              <Badge variant="destructive" className="text-[9px] font-mono">
                Action Req
              </Badge>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                3 Items ($1,240)
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                <span>2 Timing • 1 Fee Mismatch</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("disputed")}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  Resolve →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filter & Segment Control Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/70 bg-muted/20 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-card font-bold text-indigo-600 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>All Transactions</span>
              <span className="ml-1 font-mono text-[10.5px]">1,842</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settled")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "settled"
                  ? "bg-card font-bold text-emerald-600 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Captured &amp; Settled</span>
              <span className="ml-1 font-mono text-[10.5px]">1,798</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-card font-bold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Pending Settlement</span>
              <span className="ml-1 font-mono text-[10.5px]">34</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("disputed")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "disputed"
                  ? "bg-card font-bold text-rose-600 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Disputed / Held</span>
              <Badge variant="destructive" className="h-4 px-1 text-[10px] ml-1">
                7
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("adjustments")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "adjustments"
                  ? "bg-card font-bold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Fee Adjustments</span>
              <span className="ml-1 font-mono text-[10.5px]">3</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <Lock className="size-3 text-emerald-600" />
            <span>Ledger Hash: <code className="text-foreground font-bold">sha256:09a1...ff3b</code></span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-2 text-xs shadow-2xs">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search txn_..., order ORD-..., auth code, or customer..."
              className="h-8 w-full rounded-md border border-border/80 bg-background pl-8 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/80 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌘F
            </kbd>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground"
            >
              <option value="all">Gateway: All Gateways</option>
              <option value="stripe">Stripe</option>
              <option value="adyen">Adyen</option>
              <option value="paypal">PayPal</option>
              <option value="apple pay">Apple Pay</option>
              <option value="internal ledger">Internal Ledger</option>
            </select>

            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground"
            >
              <option value="usd">Currency: USD ($)</option>
              <option value="eur">Currency: EUR (€)</option>
              <option value="gbp">Currency: GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Ledger Data Grid + Double Entry Inspector */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-5 items-start">
        {/* Left: General Ledger Table (7/8 cols on 2xl) */}
        <div className="2xl:col-span-8 bg-card rounded-xl border border-border/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3 bg-muted/20 border-b border-border/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <BookOpen className="size-4 text-indigo-600" />
              <span>Ledger Entries</span>
              <Badge variant="secondary" className="text-[10px] font-mono">
                Showing {filteredTxns.length} of 1,842
              </Badge>
            </div>
            <span className="font-mono text-muted-foreground text-[11px]">Sort: Timestamp (UTC DESC)</span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-mono uppercase text-[10.5px]">
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3">Transaction ID / Type</th>
                  <th className="p-3">Order Ref</th>
                  <th className="p-3">Gateway &amp; Rail</th>
                  <th className="p-3 text-right">Gross</th>
                  <th className="p-3 text-right">Net Fee</th>
                  <th className="p-3 text-right">Settlement</th>
                  <th className="p-3">Status &amp; Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTxns.map((txn) => {
                  const isSelected = selectedTxn?.id === txn.id
                  return (
                    <tr
                      key={txn.id}
                      onClick={() => setSelectedTxn(txn)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 font-medium"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="p-3 font-mono whitespace-nowrap">
                        <div className="font-semibold text-foreground">{txn.timeUtc}</div>
                        <div className="text-[10.5px] text-muted-foreground">{txn.date}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-indigo-600">{txn.id}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(txn.id, e)}
                            className="text-muted-foreground hover:text-indigo-600"
                          >
                            {copiedId === txn.id ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                          </button>
                          <Badge variant={txn.typeVariant} className="text-[9px] px-1 h-3.5 font-mono uppercase">
                            {txn.type}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground">{txn.customer}</div>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-semibold text-foreground">{txn.orderId}</span>
                        <div className="text-[10.5px] text-muted-foreground">{txn.sku}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground flex items-center gap-1">
                          <span>{txn.gateway}</span>
                          <span className="text-muted-foreground font-mono text-[11px]">• {txn.railDetail}</span>
                        </div>
                        <div className="font-mono text-[10.5px] text-muted-foreground">{txn.gatewayDetail}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold whitespace-nowrap">
                        <span className={txn.isPositive ? "text-emerald-600" : "text-rose-600"}>
                          {txn.grossAmount}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-muted-foreground whitespace-nowrap">
                        {txn.netFee}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {txn.settlementAmount}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant={txn.statusVariant} className="text-[10px]">
                          {txn.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-border/70 bg-muted/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
            <div>
              Showing {filteredTxns.length} entries • Block Integrity 100%
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

        {/* Right: Double Entry General Ledger Drawer (4 cols on 2xl) */}
        {selectedTxn && (
          <div className="2xl:col-span-4 bg-card rounded-xl border border-border/80 shadow-md p-4 space-y-4 text-xs sticky top-20">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">{selectedTxn.id}</span>
                  <Badge variant={selectedTxn.statusVariant} className="text-[10px]">
                    {selectedTxn.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Settled via Payout <span className="font-mono font-medium text-foreground">{selectedTxn.payoutId}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(selectedTxn.id)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
                title="Copy Transaction ID"
              >
                {copiedId === selectedTxn.id ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              </button>
            </div>

            {/* 1. Double-Entry Journal Postings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-indigo-600" />
                  <span>Double-Entry Journal Postings</span>
                </span>
                <Badge variant="success" className="text-[10px] font-mono">
                  Balanced: Net $0.00
                </Badge>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5 space-y-2 font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground text-[10px] uppercase">
                      <th className="pb-1">General Ledger Account</th>
                      <th className="pb-1 text-right">Debit</th>
                      <th className="pb-1 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {selectedTxn.postings.map((post, idx) => (
                      <tr key={idx} className="py-1">
                        <td className="py-1.5 text-foreground">
                          <div className="font-semibold">{post.account}</div>
                          <div className="text-[10px] text-muted-foreground">{post.code}</div>
                        </td>
                        <td className="py-1.5 text-right font-bold text-foreground">{post.debit}</td>
                        <td className="py-1.5 text-right font-bold text-foreground">{post.credit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Technical Reconciled Proofs */}
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2 font-mono text-[11px]">
              <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                Cryptographic Proofs &amp; Trace
              </span>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Block Hash:</span>
                  <span className="text-foreground font-semibold truncate max-w-[170px]">{selectedTxn.blockHash}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Auth ID:</span>
                  <span className="text-foreground font-semibold">{selectedTxn.authId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Settlement Batch:</span>
                  <span className="text-indigo-600 font-bold">{selectedTxn.batchId}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                size="xs"
                variant="outline"
                className="h-8 text-xs font-semibold"
                onClick={() => alert(`Downloaded audited reconciliation certificate for ${selectedTxn.id}`)}
              >
                <Download className="size-3.5" />
                <span>Audit Certificate</span>
              </Button>

              <Button
                size="xs"
                className="h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                onClick={() => setJournalModal(true)}
              >
                <span>Add Adjustment</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Journal Entry Modal */}
      {journalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-md w-full space-y-3 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Building2 className="size-4 text-indigo-600" />
                <span>New General Ledger Journal Adjustment</span>
              </h3>
              <button onClick={() => setJournalModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground font-semibold">Debit Account</label>
                <select className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 text-xs text-foreground">
                  <option>1010 Cash Clearing (Stripe US)</option>
                  <option>1012 Cash Clearing (Adyen EU)</option>
                  <option>5010 Gateway Interchange Expense</option>
                  <option>4090 Refunds &amp; Chargeback Allowance</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground font-semibold">Credit Account</label>
                <select className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 text-xs text-foreground">
                  <option>4010 Merchant Product Sales Revenue</option>
                  <option>1010 Cash Clearing (Stripe US)</option>
                  <option>5010 Gateway Interchange Expense</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground font-semibold">Adjustment Amount ($ USD)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 font-mono text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-muted-foreground font-semibold">Memo / Compliance Justification</label>
                <textarea
                  rows={2}
                  placeholder="State operational rationale for general ledger adjustment..."
                  className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button size="xs" variant="outline" onClick={() => setJournalModal(false)}>
                Cancel
              </Button>
              <Button
                size="xs"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                onClick={() => {
                  alert("Journal entry posted to immutable ledger.")
                  setJournalModal(false)
                }}
              >
                Post Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
