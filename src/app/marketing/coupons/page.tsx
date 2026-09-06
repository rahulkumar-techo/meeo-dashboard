"use client"

import * as React from "react"
import Link from "next/link"
import {
  Ticket,
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
  Users,
  Percent,
  PauseCircle,
  PlayCircle,
  Archive,
  Link2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RedemptionEvent {
  orderId: string
  customer: string
  discountAmount: string
  timestamp: string
  isCapped?: boolean
}

interface CouponRecord {
  id: string
  code: string
  name: string
  type: string
  typeDetail: string
  discountValue: string
  redemptionsCount: number
  redemptionsCap: number | "unlimited"
  percentUsed: number
  eligibility: string
  validWindow: string
  channels: string[]
  status: "Active" | "Scheduled" | "Expired" | "Suspended"
  statusVariant: "brand" | "secondary" | "outline" | "destructive"
  gmvGenerated: string
  discountCost: string
  roi: string
  lift: string
  minSpend: string
  maxDiscountCap: string
  velocityGuard: string
  stackingRule: string
  eligibilitySegment: string
  resolvedPool: string
  recentRedemptions: RedemptionEvent[]
}

const COUPONS_DATA: CouponRecord[] = [
  {
    id: "cpn_9a1e804f82d",
    code: "WELCOME-10",
    name: "New Customer Onboarding",
    type: "Percentage",
    typeDetail: "10% Off Cart",
    discountValue: "10%",
    redemptionsCount: 4120,
    redemptionsCap: 5000,
    percentUsed: 82.4,
    eligibility: "First-Time Buyers Only",
    validWindow: "Oct 01 - Dec 31, 2024",
    channels: ["Web", "App"],
    status: "Active",
    statusVariant: "brand",
    gmvGenerated: "$142,850.00",
    discountCost: "$14,285.00",
    roi: "9.8x Net",
    lift: "+24.2% Conv",
    minSpend: "$50.00 USD",
    maxDiscountCap: "$30.00 per order",
    velocityGuard: "1 per Email + Card Fingerprint",
    stackingRule: "Exclusive (No sitewide promos)",
    eligibilitySegment: "New Customers (< 30 days)",
    resolvedPool: "12,410 accounts",
    recentRedemptions: [
      { orderId: "ORD-10248", customer: "David Miller", discountAmount: "-$24.90", timestamp: "14m ago" },
      { orderId: "ORD-10245", customer: "Sarah Connor", discountAmount: "-$18.50", timestamp: "1h ago" },
      { orderId: "ORD-10241", customer: "Alex Mercer", discountAmount: "-$30.00", timestamp: "3h ago", isCapped: true },
    ],
  },
  {
    id: "cpn_771ba82901c",
    code: "BLACKFRIDAY-VIP",
    name: "Early Access 2024",
    type: "Fixed Amount",
    typeDetail: "$50.00 Flat (Min $250)",
    discountValue: "$50.00",
    redemptionsCount: 890,
    redemptionsCap: 1000,
    percentUsed: 89.0,
    eligibility: "VIP Tier 1 & 2 Only",
    validWindow: "Nov 20 - Nov 28, 2024",
    channels: ["All Channels"],
    status: "Scheduled",
    statusVariant: "secondary",
    gmvGenerated: "$222,500.00",
    discountCost: "$44,500.00",
    roi: "5.0x Net",
    lift: "+41.8% Conv",
    minSpend: "$250.00 USD",
    maxDiscountCap: "$50.00 flat",
    velocityGuard: "1 per VIP Account Token",
    stackingRule: "Stackable with Member Free Ship",
    eligibilitySegment: "VIP Loyalty Cohort",
    resolvedPool: "1,240 VIPs",
    recentRedemptions: [],
  },
  {
    id: "cpn_442bb01948e",
    code: "FREESHIP-KB",
    name: "Mechanical Keyboard Drop",
    type: "Free Shipping",
    typeDetail: "Free Express Ship",
    discountValue: "Free Ship",
    redemptionsCount: 2450,
    redemptionsCap: "unlimited",
    percentUsed: 45.0,
    eligibility: "Min cart $120, Keyboards only",
    validWindow: "Ongoing (No Expiry)",
    channels: ["Web"],
    status: "Active",
    statusVariant: "brand",
    gmvGenerated: "$294,000.00",
    discountCost: "$24,500.00",
    roi: "12.0x Net",
    lift: "+18.0% Conv",
    minSpend: "$120.00 USD",
    maxDiscountCap: "Express Shipping Fee Waived ($15 value)",
    velocityGuard: "Uncapped per customer",
    stackingRule: "Stackable with Item Coupons",
    eligibilitySegment: "Keyboard Catalog Shoppers",
    resolvedPool: "Open Public",
    recentRedemptions: [
      { orderId: "ORD-10247", customer: "Elena Rostova", discountAmount: "-$15.00", timestamp: "42m ago" },
      { orderId: "ORD-10244", customer: "Liam Vance", discountAmount: "-$15.00", timestamp: "2h ago" },
    ],
  },
  {
    id: "cpn_110fc99182a",
    code: "FALLSALE20",
    name: "Autumn Clearance",
    type: "Percentage",
    typeDetail: "20% Off Select",
    discountValue: "20%",
    redemptionsCount: 5000,
    redemptionsCap: 5000,
    percentUsed: 100.0,
    eligibility: "All Customers",
    validWindow: "Sep 15 - Oct 15, 2024",
    channels: ["Web"],
    status: "Expired",
    statusVariant: "outline",
    gmvGenerated: "$180,000.00",
    discountCost: "$36,000.00",
    roi: "5.0x Net",
    lift: "+30.2% Conv",
    minSpend: "$0.00",
    maxDiscountCap: "$100.00 per order",
    velocityGuard: "1 per customer",
    stackingRule: "Exclusive",
    eligibilitySegment: "General Public",
    resolvedPool: "All Store Users",
    recentRedemptions: [],
  },
  {
    id: "cpn_882cc10294b",
    code: "INFLUENCER-DEV",
    name: "DevTech Partnership",
    type: "Affiliate Payout",
    typeDetail: "15% Off + 5% Payout",
    discountValue: "15%",
    redemptionsCount: 1840,
    redemptionsCap: 2500,
    percentUsed: 73.6,
    eligibility: "Single-use per customer",
    validWindow: "Ongoing",
    channels: ["All Channels"],
    status: "Active",
    statusVariant: "brand",
    gmvGenerated: "$110,400.00",
    discountCost: "$16,560.00",
    roi: "6.6x Net",
    lift: "+19.5% Conv",
    minSpend: "$40.00 USD",
    maxDiscountCap: "$45.00 per order",
    velocityGuard: "1 per Customer ID",
    stackingRule: "Exclusive",
    eligibilitySegment: "DevTech Community Referral",
    resolvedPool: "Referral Audience",
    recentRedemptions: [
      { orderId: "ORD-10243", customer: "Julian Vance", discountAmount: "-$22.50", timestamp: "5h ago" },
    ],
  },
  {
    id: "cpn_009aa49102f",
    code: "GLITCH-50",
    name: "Suspicious Velocity Alert",
    type: "Percentage",
    typeDetail: "50% Off Flash",
    discountValue: "50%",
    redemptionsCount: 410,
    redemptionsCap: 500,
    percentUsed: 82.0,
    eligibility: "Multi-account botting detected",
    validWindow: "Suspended (Auto)",
    channels: ["All"],
    status: "Suspended",
    statusVariant: "destructive",
    gmvGenerated: "$12,300.00",
    discountCost: "$12,300.00",
    roi: "1.0x (Abuse)",
    lift: "Abuse Tripwire",
    minSpend: "$0.00",
    maxDiscountCap: "None",
    velocityGuard: "Tripwire Hit: 80 attempts in 2m",
    stackingRule: "Invalidated",
    eligibilitySegment: "Flagged IPs & Device IDs",
    resolvedPool: "Blocked",
    recentRedemptions: [],
  },
]

export default function CouponsPage() {
  const [activeTab, setActiveTab] = React.useState<"all" | "active" | "scheduled" | "expired" | "suspended">("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [channelFilter, setChannelFilter] = React.useState("all")
  const [selectedCoupon, setSelectedCoupon] = React.useState<CouponRecord>(COUPONS_DATA[0])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([COUPONS_DATA[0].id])
  const [createModal, setCreateModal] = React.useState(false)
  const [validateModal, setValidateModal] = React.useState(false)
  const [jsonModal, setJsonModal] = React.useState(false)
  const [testCode, setTestCode] = React.useState("WELCOME-10")
  const [validationResult, setValidationResult] = React.useState<string | null>(null)
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)

  const filteredCoupons = COUPONS_DATA.filter((c) => {
    if (activeTab === "active" && c.status !== "Active") return false
    if (activeTab === "scheduled" && c.status !== "Scheduled") return false
    if (activeTab === "expired" && c.status !== "Expired") return false
    if (activeTab === "suspended" && c.status !== "Suspended") return false

    if (typeFilter !== "all" && !c.type.toLowerCase().includes(typeFilter.toLowerCase())) return false
    if (channelFilter !== "all" && !c.channels.some((ch) => ch.toLowerCase().includes(channelFilter.toLowerCase()))) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.eligibility.toLowerCase().includes(q)
    }
    return true
  })

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCoupons.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredCoupons.map((c) => c.id))
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

  const handleCopyCode = (code: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleValidateVoucher = (e: React.FormEvent) => {
    e.preventDefault()
    const target = COUPONS_DATA.find((c) => c.code.toUpperCase() === testCode.trim().toUpperCase())
    if (!target) {
      setValidationResult("Voucher code not found in directory.")
    } else if (target.status === "Suspended") {
      setValidationResult(`Voucher code ${target.code} is suspended due to fraud velocity flags.`)
    } else if (target.status === "Expired") {
      setValidationResult(`Voucher code ${target.code} expired on ${target.validWindow}.`)
    } else {
      setValidationResult(`Valid Voucher! Benefit: ${target.typeDetail}. Eligible: ${target.eligibility}.`)
    }
  }

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* 1. Header Ribbon */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>Marketing</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Discount Codes &amp; Vouchers</span>
            <Badge variant="brand" className="text-[10px] font-mono">
              v2.4 Engine
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              className="gap-1.5 text-xs font-medium h-7"
              onClick={() => alert("Exporting coupons list CSV...")}
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </Button>

            <Button
              size="xs"
              variant="outline"
              className="gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/30 h-7"
              onClick={() => setValidateModal(true)}
            >
              <CheckCircle className="size-3.5" />
              <span>Validate Voucher</span>
            </Button>

            <Button
              size="xs"
              className="gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white h-7 shadow-xs"
              onClick={() => setCreateModal(true)}
            >
              <Plus className="size-3.5" />
              <span>Create Coupon</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1">
          <div>
            <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Coupons &amp; Promotional Vouchers
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure multi-tiered discount codes, redemption velocity limits, customer eligibility rules, and audit real-time usage history.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Dense Metric KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* KPI 1 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>Active Coupons</span>
              <Ticket className="size-3.5 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                28 Active
              </span>
              <Badge variant="brand" className="text-[9px] font-mono">
                +4 this wk
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>64 configured overall</span>
              <span className="font-mono text-foreground font-semibold">43.7% pool</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "43.7%" }} />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>30D Promo GMV Influenced</span>
              <TrendingUp className="size-3.5 text-indigo-600" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  $384,920.00
                </span>
                <span className="text-[11px] text-emerald-600 font-mono font-bold">+18.4% mom</span>
              </div>
              {/* Micro SVG Sparkline */}
              <svg className="w-16 h-7 text-indigo-600 overflow-visible shrink-0" fill="none" viewBox="0 0 120 20">
                <path
                  d="M0 16 L20 14 L40 17 L60 8 L80 11 L100 4 L120 2"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Avg discount rate</span>
              <span className="font-mono text-foreground font-semibold">12.8%</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              <span>Total Redemptions</span>
              <Receipt className="size-3.5 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                14,820 Uses
              </span>
              <span className="font-mono text-xs text-muted-foreground">Cap 20.5k</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Budget cap burn rate</span>
              <span className="font-mono text-indigo-600 font-bold">72.4%</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "72.4%" }} />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-[10.5px] font-bold uppercase tracking-wider">
              <span>Fraud / Abuse Blocked</span>
              <ShieldAlert className="size-3.5 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                142 Attempts
              </span>
              <Badge variant="destructive" className="text-[9px] font-mono">
                Shield Active
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Velocity + Fingerprinting</span>
              <span className="font-mono text-emerald-600 font-bold">100% Mitigated</span>
            </div>
            <div className="w-full bg-rose-200 dark:bg-rose-950 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: "100%" }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filter Toolbar & Tabs Strip */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/20 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-card font-bold text-indigo-600 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>All Coupons</span>
              <Badge variant="brand" className="h-4 px-1 text-[10px] ml-1">
                64
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "active"
                  ? "bg-card font-bold text-emerald-600 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Active</span>
              <Badge variant="success" className="h-4 px-1 text-[10px] ml-1">
                28
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("scheduled")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "scheduled"
                  ? "bg-card font-bold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Scheduled</span>
              <span className="ml-1 font-mono text-[10.5px]">12</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("expired")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "expired"
                  ? "bg-card font-bold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Depleted / Expired</span>
              <span className="ml-1 font-mono text-[10.5px]">18</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("suspended")}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                activeTab === "suspended"
                  ? "bg-card font-bold text-rose-600 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Suspended / Flagged</span>
              <Badge variant="destructive" className="h-4 px-1 text-[10px] ml-1">
                6
              </Badge>
            </button>
          </div>
        </div>

        {/* Floating Bulk Action Bar (When selected) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-indigo-900 px-3.5 py-2 text-white shadow-md text-xs">
            <div className="flex items-center gap-2">
              <span className="flex size-4 items-center justify-center rounded bg-indigo-600 text-white text-[10px] font-bold">
                ✓
              </span>
              <span className="font-bold">{selectedIds.length} Coupon Selected</span>
              <span className="text-indigo-300">|</span>
              <span className="text-indigo-200 font-mono">
                {COUPONS_DATA.find((c) => c.id === selectedIds[0])?.code}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="xs"
                variant="outline"
                className="bg-indigo-800 border-indigo-700 text-white hover:bg-indigo-700 h-7 text-xs gap-1"
                onClick={() => alert(`Paused coupon ${selectedCoupon.code}`)}
              >
                <PauseCircle className="size-3.5" />
                <span>Pause Selected</span>
              </Button>
              <Button
                size="xs"
                variant="outline"
                className="bg-indigo-800 border-indigo-700 text-white hover:bg-indigo-700 h-7 text-xs gap-1"
                onClick={() => alert(`Extended validity by +30 days for ${selectedCoupon.code}`)}
              >
                <Calendar className="size-3.5" />
                <span>Extend Expiry</span>
              </Button>
              <Button
                size="xs"
                variant="outline"
                className="bg-indigo-800 border-indigo-700 text-white hover:bg-indigo-700 h-7 text-xs gap-1"
                onClick={() => alert(`Exporting full redemption audit log for ${selectedCoupon.code}...`)}
              >
                <Download className="size-3.5" />
                <span>Export Redemptions</span>
              </Button>
            </div>
          </div>
        )}

        {/* Search & Multifactor Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-2 text-xs shadow-2xs">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupon code, campaign, or tag... (⌘F)"
              className="h-8 w-full rounded-md border border-border/80 bg-background pl-8 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/80 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌘F
            </kbd>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground"
            >
              <option value="all">Type: All Types</option>
              <option value="percentage">Percentage Off</option>
              <option value="fixed">Fixed Amount</option>
              <option value="free shipping">Free Shipping</option>
              <option value="affiliate">Affiliate Payout</option>
            </select>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground"
            >
              <option value="all">Channel: All Channels</option>
              <option value="web">Web Storefront</option>
              <option value="app">Mobile App</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Main Dual Pane Grid (Table Left + Context Inspector Right) */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Data Grid Table */}
        <div className="2xl:col-span-8 bg-card rounded-xl border border-border/80 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-mono uppercase text-[10.5px]">
                  <th className="p-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredCoupons.length && filteredCoupons.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border accent-indigo-600"
                    />
                  </th>
                  <th className="p-3">Coupon Code &amp; Name</th>
                  <th className="p-3">Type &amp; Value</th>
                  <th className="p-3 min-w-[160px]">Redemption Velocity</th>
                  <th className="p-3">Eligibility</th>
                  <th className="p-3">Valid Window</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCoupons.map((coupon) => {
                  const isSelected = selectedCoupon?.id === coupon.id
                  return (
                    <tr
                      key={coupon.id}
                      onClick={() => setSelectedCoupon(coupon)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 font-medium"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => toggleSelectId(coupon.id, e)}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(coupon.id)}
                          onChange={() => {}}
                          className="rounded border-border accent-indigo-600"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-indigo-600">{coupon.code}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(coupon.code, e)}
                            className="text-muted-foreground hover:text-indigo-600"
                          >
                            {copiedCode === coupon.code ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                          </button>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">{coupon.name}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {coupon.typeDetail}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between font-mono text-[10.5px]">
                            <span className="text-foreground">
                              {coupon.redemptionsCount.toLocaleString("en-US")} /{" "}
                              {coupon.redemptionsCap === "unlimited" ? "∞" : coupon.redemptionsCap.toLocaleString("en-US")}
                            </span>
                            <span className={coupon.percentUsed >= 100 ? "text-rose-600 font-bold" : "text-indigo-600 font-semibold"}>
                              {coupon.percentUsed}%
                            </span>
                          </div>
                          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                coupon.percentUsed >= 100 ? "bg-rose-500" : "bg-indigo-600"
                              }`}
                              style={{ width: `${Math.min(coupon.percentUsed, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground text-[11px] max-w-[130px] truncate">
                        {coupon.eligibility}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {coupon.validWindow}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex gap-1 font-mono text-[10px]">
                          {coupon.channels.map((ch, idx) => (
                            <span key={idx} className="px-1 py-0.2 rounded bg-muted/60">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant={coupon.statusVariant} className="text-[10px]">
                          {coupon.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          size="xs"
                          variant="ghost"
                          className="h-6 px-2 text-indigo-600 hover:text-indigo-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCoupon(coupon)
                          }}
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
              Showing {filteredCoupons.length} of 64 records
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

        {/* Right Column: Context Drawer (4 cols on 2xl) */}
        {selectedCoupon && (
          <div className="2xl:col-span-4 bg-card rounded-xl border border-border/80 shadow-md p-4 space-y-4 text-xs sticky top-20">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">{selectedCoupon.code}</span>
                  <Badge variant={selectedCoupon.statusVariant} className="text-[10px] font-bold">
                    {selectedCoupon.status}
                  </Badge>
                </div>
                <p className="font-mono text-[10.5px] text-muted-foreground">ID: {selectedCoupon.id}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleCopyCode(selectedCoupon.code)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Copy Code"
                >
                  {copiedCode === selectedCoupon.code ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setJsonModal(true)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Inspect raw JSON"
                >
                  <Code className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Performance Summary Bento */}
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10.5px]">
                Performance Ledger
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex flex-col">
                  <span className="text-[11px] text-muted-foreground">GMV Generated</span>
                  <span className="font-mono text-sm font-bold text-foreground mt-0.5">
                    {selectedCoupon.gmvGenerated}
                  </span>
                  <span className="font-mono text-[10.5px] text-emerald-600 font-bold mt-1">
                    ROI: {selectedCoupon.roi}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex flex-col">
                  <span className="text-[11px] text-muted-foreground">Discount Cost</span>
                  <span className="font-mono text-sm font-bold text-foreground mt-0.5">
                    {selectedCoupon.discountCost}
                  </span>
                  <span className="font-mono text-[10.5px] text-indigo-600 font-bold mt-1">
                    Lift: {selectedCoupon.lift}
                  </span>
                </div>
              </div>
            </div>

            {/* Discount Configuration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10.5px]">
                  Discount Configuration
                </span>
                <button className="text-indigo-600 hover:underline font-semibold text-[11px]">Edit</button>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5 space-y-1.5 text-[11.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discount Type:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedCoupon.type} ({selectedCoupon.discountValue})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Minimum Spend:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedCoupon.minSpend}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Max Discount Cap:</span>
                  <span className="font-mono font-bold text-indigo-600">{selectedCoupon.maxDiscountCap}</span>
                </div>
              </div>
            </div>

            {/* Guardrails & Limits */}
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10.5px]">
                Guardrails &amp; Limits
              </span>
              <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5 space-y-1.5 text-[11.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Redemption Cap:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {selectedCoupon.redemptionsCount.toLocaleString("en-US")} / {selectedCoupon.redemptionsCap.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Velocity Guard:</span>
                  <span className="font-mono text-foreground">{selectedCoupon.velocityGuard}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stacking Logic:</span>
                  <span className="font-mono text-foreground">{selectedCoupon.stackingRule}</span>
                </div>
              </div>
            </div>

            {/* Eligibility Segment */}
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-indigo-600 shrink-0" />
                <div>
                  <div className="font-bold text-foreground">{selectedCoupon.eligibilitySegment}</div>
                  <div className="font-mono text-[10.5px] text-muted-foreground">Pool: {selectedCoupon.resolvedPool}</div>
                </div>
              </div>
            </div>

            {/* Real-Time Usage Stream */}
            {selectedCoupon.recentRedemptions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10.5px]">
                    Real-Time Usage Stream
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-600 font-bold">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/20 divide-y divide-border/60">
                  {selectedCoupon.recentRedemptions.map((red, idx) => (
                    <div key={idx} className="p-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-indigo-600">{red.orderId}</div>
                        <div className="text-[11px] text-muted-foreground">{red.customer}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-foreground">{red.discountAmount}</div>
                        <div className="text-[10px] text-muted-foreground">{red.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drawer Footer Actions */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  className="h-8 text-xs font-semibold"
                  onClick={() => alert(`Added +1,000 to cap for ${selectedCoupon.code}`)}
                >
                  <Plus className="size-3.5" />
                  <span>+1,000 Cap</span>
                </Button>

                <Button
                  size="xs"
                  variant="outline"
                  className="h-8 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  onClick={() => alert(`Toggled active/pause status for ${selectedCoupon.code}`)}
                >
                  <PauseCircle className="size-3.5" />
                  <span>Pause Coupon</span>
                </Button>
              </div>

              <Button
                size="xs"
                className="w-full h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                onClick={() => alert(`Navigating to full audit log for ${selectedCoupon.code}...`)}
              >
                <Receipt className="size-3.5" />
                <span>View Full Redemption Ledger</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Validate Voucher Modal */}
      {validateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-sm w-full space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <CheckCircle className="size-4 text-indigo-600" />
                <span>Validate Voucher Code</span>
              </h3>
              <button onClick={() => setValidateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleValidateVoucher} className="space-y-3">
              <div>
                <label className="text-muted-foreground font-semibold">Enter Code</label>
                <input
                  type="text"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  placeholder="e.g. WELCOME-10"
                  className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 font-mono text-xs uppercase text-foreground focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {validationResult && (
                <div className="p-2.5 rounded-lg border border-border/80 bg-muted/30 font-medium text-foreground text-xs leading-relaxed">
                  {validationResult}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button size="xs" variant="outline" type="button" onClick={() => setValidateModal(false)}>
                  Close
                </Button>
                <Button size="xs" type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                  Test Voucher
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-md w-full space-y-3 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Ticket className="size-4 text-indigo-600" />
                <span>Create New Coupon</span>
              </h3>
              <button onClick={() => setCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-2.5">
              <div>
                <label className="text-muted-foreground font-semibold">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. HOLIDAY25"
                  className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 font-mono text-xs uppercase text-foreground focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground font-semibold">Discount Type</label>
                  <select className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 text-xs text-foreground">
                    <option>Percentage Off (%)</option>
                    <option>Fixed Amount ($)</option>
                    <option>Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground font-semibold">Discount Value</label>
                  <input
                    type="number"
                    placeholder="15"
                    className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 font-mono text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground font-semibold">Max Redemption Cap</label>
                <input
                  type="number"
                  placeholder="1000"
                  className="mt-1 w-full rounded-md border border-border/80 bg-background p-2 font-mono text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button size="xs" variant="outline" onClick={() => setCreateModal(false)}>
                Cancel
              </Button>
              <Button
                size="xs"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                onClick={() => {
                  alert("New coupon created and activated across channels.")
                  setCreateModal(false)
                }}
              >
                Create Coupon
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON Payload Modal */}
      {jsonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-lg w-full space-y-3 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="font-bold text-sm text-foreground font-mono">Coupon Configuration JSON</h3>
              <button onClick={() => setJsonModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-muted/40 font-mono text-[11px] text-foreground overflow-x-auto max-h-72">
              {JSON.stringify(selectedCoupon, null, 2)}
            </pre>
            <div className="flex justify-end pt-1">
              <Button size="xs" onClick={() => setJsonModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
