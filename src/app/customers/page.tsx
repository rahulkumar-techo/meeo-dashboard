"use client"

import * as React from "react"
import Link from "next/link"
import {
  Users,
  Search,
  Download,
  Plus,
  TrendingUp,
  UserCheck,
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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CustomerRecord {
  id: string
  name: string
  email: string
  country: string
  avatar: string
  status: "Active" | "Attention" | "Dispute / Return" | "Suspended"
  statusBadgeVariant: "success" | "warning" | "destructive" | "brand"
  tier: string
  tierBadgeVariant: "brand" | "warning" | "secondary" | "destructive"
  ordersCount: number
  ordersCadence: string
  totalSpend: string
  avgOrderValue: string
  lastOrder: {
    id: string
    date: string
    isFailed?: boolean
    isChargeback?: boolean
  }
  riskScore: string
  riskLabel: "Very Low" | "Low" | "Moderate" | "Minimal" | "Elevated" | "High Risk"
  riskVariant: "success" | "warning" | "destructive"
  phone: string
  address: string
  returnRate: string
  avgReview: string
  reviewsCount: number
  recentOrders: {
    id: string
    date: string
    items?: string
    amount: string
    status: string
    statusVariant: "brand" | "success" | "secondary"
  }[]
}

const CUSTOMERS_DATA: CustomerRecord[] = [
  {
    id: "CUST-94821",
    name: "David Miller",
    email: "david.m@example.com",
    country: "US",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    status: "Active",
    statusBadgeVariant: "success",
    tier: "VIP Tier 1",
    tierBadgeVariant: "brand",
    ordersCount: 14,
    ordersCadence: "Avg 1 order / 22 days",
    totalSpend: "$4,280.00",
    avgOrderValue: "Avg $305.71",
    lastOrder: {
      id: "ORD-10248",
      date: "Today, 2h ago",
    },
    riskScore: "0.02",
    riskLabel: "Very Low",
    riskVariant: "success",
    phone: "+1 (555) 234-8921",
    address: "Brooklyn, NY, USA (Zip 11201)",
    returnRate: "0.0%",
    avgReview: "5.0",
    reviewsCount: 6,
    recentOrders: [
      { id: "ORD-10248", date: "Today • 2 items", amount: "$249.00", status: "Shipped", statusVariant: "brand" },
      { id: "ORD-10190", date: "Sep 14 • 4 items", amount: "$450.00", status: "Delivered", statusVariant: "success" },
      { id: "ORD-09940", date: "Jul 22 • 1 item", amount: "$189.00", status: "Delivered", statusVariant: "success" },
    ],
  },
  {
    id: "CUST-94820",
    name: "Elena Rostova",
    email: "elena.r@techcorp.io",
    country: "UK",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    status: "Active",
    statusBadgeVariant: "success",
    tier: "Tier 2 Gold",
    tierBadgeVariant: "warning",
    ordersCount: 9,
    ordersCadence: "Avg 1 order / 34 days",
    totalSpend: "$2,840.50",
    avgOrderValue: "Avg $315.60",
    lastOrder: {
      id: "ORD-10247",
      date: "Yesterday",
    },
    riskScore: "0.05",
    riskLabel: "Low",
    riskVariant: "success",
    phone: "+44 20 7946 0912",
    address: "London, W1B 5AH, UK",
    returnRate: "0.0%",
    avgReview: "4.9",
    reviewsCount: 4,
    recentOrders: [
      { id: "ORD-10247", date: "Yesterday • 1 item", amount: "$1,199.00", status: "Processing", statusVariant: "brand" },
    ],
  },
  {
    id: "CUST-94819",
    name: "Marcus Chen",
    email: "mchen@acme.org",
    country: "US",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    status: "Attention",
    statusBadgeVariant: "warning",
    tier: "Standard",
    tierBadgeVariant: "secondary",
    ordersCount: 4,
    ordersCadence: "Recent decline",
    totalSpend: "$1,120.00",
    avgOrderValue: "Avg $280.00",
    lastOrder: {
      id: "ORD-10246",
      date: "Failed Auth - Today",
      isFailed: true,
    },
    riskScore: "0.45",
    riskLabel: "Moderate",
    riskVariant: "warning",
    phone: "+1 (415) 890-2109",
    address: "San Francisco, CA 94102, USA",
    returnRate: "2.1%",
    avgReview: "4.5",
    reviewsCount: 2,
    recentOrders: [
      { id: "ORD-10246", date: "Today • 5 items", amount: "$342.50", status: "Failed Auth", statusVariant: "secondary" },
    ],
  },
  {
    id: "CUST-94818",
    name: "Sarah Connor",
    email: "s.connor@sky.net",
    country: "US",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    status: "Active",
    statusBadgeVariant: "success",
    tier: "VIP Tier 1",
    tierBadgeVariant: "brand",
    ordersCount: 22,
    ordersCadence: "Power Buyer",
    totalSpend: "$6,890.00",
    avgOrderValue: "Avg $313.18",
    lastOrder: {
      id: "ORD-10245",
      date: "Oct 31",
    },
    riskScore: "0.01",
    riskLabel: "Minimal",
    riskVariant: "success",
    phone: "+1 (512) 349-8012",
    address: "Austin, TX 78701, USA",
    returnRate: "0.5%",
    avgReview: "5.0",
    reviewsCount: 12,
    recentOrders: [
      { id: "ORD-10245", date: "Oct 31 • 2 items", amount: "$89.00", status: "Delivered", statusVariant: "success" },
    ],
  },
  {
    id: "CUST-94817",
    name: "Liam Vance",
    email: "lvance@design.co",
    country: "CA",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
    status: "Dispute / Return",
    statusBadgeVariant: "brand",
    tier: "Standard",
    tierBadgeVariant: "secondary",
    ordersCount: 3,
    ordersCadence: "1 active return",
    totalSpend: "$640.00",
    avgOrderValue: "Avg $213.33",
    lastOrder: {
      id: "ORD-10244",
      date: "Return Pending",
    },
    riskScore: "0.38",
    riskLabel: "Elevated",
    riskVariant: "warning",
    phone: "+1 (416) 902-8411",
    address: "Toronto, ON M5H 1J9, Canada",
    returnRate: "8.4%",
    avgReview: "4.0",
    reviewsCount: 1,
    recentOrders: [
      { id: "ORD-10244", date: "Oct 31 • 4 items", amount: "$450.00", status: "Return Pending", statusVariant: "secondary" },
    ],
  },
  {
    id: "CUST-94816",
    name: "Amara Okafor",
    email: "amara.o@global.ng",
    country: "NG",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    status: "Active",
    statusBadgeVariant: "success",
    tier: "Tier 2 Gold",
    tierBadgeVariant: "warning",
    ordersCount: 7,
    ordersCadence: "Cadence normal",
    totalSpend: "$1,950.00",
    avgOrderValue: "Avg $278.57",
    lastOrder: {
      id: "ORD-10243",
      date: "Oct 31",
    },
    riskScore: "0.04",
    riskLabel: "Low",
    riskVariant: "success",
    phone: "+234 803 123 4567",
    address: "Lagos, 101241, Nigeria",
    returnRate: "0.0%",
    avgReview: "4.8",
    reviewsCount: 3,
    recentOrders: [
      { id: "ORD-10243", date: "Oct 31 • 2 items", amount: "$110.00", status: "Processing", statusVariant: "brand" },
    ],
  },
  {
    id: "CUST-94815",
    name: "Julian Beck",
    email: "j.beck@berlin.de",
    country: "DE",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    status: "Suspended",
    statusBadgeVariant: "destructive",
    tier: "Fraud Flag",
    tierBadgeVariant: "destructive",
    ordersCount: 2,
    ordersCadence: "Chargeback filed",
    totalSpend: "$890.00",
    avgOrderValue: "Avg $445.00",
    lastOrder: {
      id: "ORD-10242",
      date: "Chargeback",
      isChargeback: true,
    },
    riskScore: "0.89",
    riskLabel: "High Risk",
    riskVariant: "destructive",
    phone: "+49 30 901820",
    address: "10117 Berlin, Germany",
    returnRate: "50.0%",
    avgReview: "1.0",
    reviewsCount: 1,
    recentOrders: [
      { id: "ORD-10242", date: "Oct 30 • 1 item", amount: "$70.00", status: "Chargeback", statusVariant: "secondary" },
    ],
  },
]

export default function CustomersCohortDirectoryPage() {
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>("CUST-94821")
  const [activeCohort, setActiveCohort] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>(["CUST-94821"])

  const selectedCustomer = React.useMemo(() => {
    return CUSTOMERS_DATA.find((c) => c.id === selectedCustomerId) ?? CUSTOMERS_DATA[0]
  }, [selectedCustomerId])

  const toggleSelectCustomer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === CUSTOMERS_DATA.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(CUSTOMERS_DATA.map((c) => c.id))
    }
  }

  const filteredCustomers = React.useMemo(() => {
    return CUSTOMERS_DATA.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
      if (activeCohort === "vip") return matchesSearch && c.tier.includes("VIP")
      if (activeCohort === "highFreq") return matchesSearch && c.ordersCount >= 5
      if (activeCohort === "atRisk") return matchesSearch && (c.status === "Attention" || c.status === "Suspended")
      return matchesSearch
    })
  }, [searchQuery, activeCohort])

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Header Bar */}
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
            <span>Customers</span>
            <span>&gt;</span>
            <span className="text-foreground font-semibold">Directory &amp; Cohorts</span>
            <span className="text-border">|</span>
            <span className="text-[11px] text-indigo-600 font-mono">LIVE SYNC (12S AGO)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Customers &amp; Cohort Directory
            </h1>
            <Badge
              variant="outline"
              className="border-indigo-200/80 bg-indigo-50/70 font-mono text-[11px] font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              8,940 Total Records
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Segment, analyze, and manage customer accounts, lifetime value, loyalty tiers, and risk profiles across regional nodes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <Radio className="size-3.5 text-indigo-600" />
            <span>Segment Builder</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            className="h-8 gap-1.5 bg-indigo-600 px-3 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700"
          >
            <Plus className="size-3.5" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* 2. Four KPI Metric Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL CUSTOMERS */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                TOTAL CUSTOMERS
              </span>
              <Badge variant="success" className="text-[10px] font-bold px-1.5 py-0">
                ↗ +9.8%
              </Badge>
            </div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              8,940
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>6,412 active in last 90d</span>
              {/* Mini Sparkline */}
              <div className="h-4 w-16 overflow-hidden">
                <svg className="size-full" viewBox="0 0 50 14">
                  <path d="M0 10 Q12 12 25 8 T50 2" fill="none" stroke="#4f46e5" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AVG CUSTOMER LTV */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                AVG CUSTOMER LTV
              </span>
              <Badge variant="brand" className="text-[10px] font-bold px-1.5 py-0">
                +14.2% YoY
              </Badge>
            </div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              $1,428.50
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>Median 3.4 orders/customer</span>
              {/* Mini bar spark */}
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-1 bg-indigo-200 h-1.5 rounded-xs" />
                <span className="w-1 bg-indigo-300 h-2 rounded-xs" />
                <span className="w-1 bg-indigo-400 h-2.5 rounded-xs" />
                <span className="w-1 bg-indigo-600 h-3 rounded-xs" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* REPEAT PURCHASE RATE */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                REPEAT PURCHASE RATE
              </span>
              <span className="text-[10.5px] font-mono text-muted-foreground">
                Target: &gt;40% <strong className="text-emerald-600">Healthy</strong>
              </span>
            </div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              42.8%
            </div>
            <div className="space-y-1 pt-1">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[42.8%]" />
              </div>
              <div className="text-[10.5px] text-muted-foreground">
                Cohort retention strong
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AT-RISK / HIGH CHURN */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                AT-RISK / HIGH CHURN
              </span>
              <Badge variant="warning" className="text-[9.5px] font-bold px-1.5 py-0">
                1.6% churn rate - Low
              </Badge>
            </div>
            <div className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
              148
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>Inactive &gt; 120 days</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">! 14 under review</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Cohort Filters Tab Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveCohort("all")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              activeCohort === "all"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>All Customers</span>
            <Badge variant="brand" className="ml-1.5 h-3.5 px-1 text-[9px] font-bold">
              8,940
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveCohort("vip")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeCohort === "vip"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>VIP &amp; Tier 1 (&gt;$2,000)</span>
            <Badge variant="secondary" className="ml-1.5 h-3.5 px-1 text-[9px]">
              412
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveCohort("highFreq")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeCohort === "highFreq"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>High Frequency (5+ Orders)</span>
            <Badge variant="secondary" className="ml-1.5 h-3.5 px-1 text-[9px]">
              620
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveCohort("new")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeCohort === "new"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>New Customers (Last 30D)</span>
            <Badge variant="secondary" className="ml-1.5 h-3.5 px-1 text-[9px]">
              890
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveCohort("atRisk")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeCohort === "atRisk"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>At-Risk Churn</span>
            <Badge variant="destructive" className="ml-1.5 h-3.5 px-1 text-[9px]">
              148
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveCohort("suspended")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeCohort === "suspended"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Suspended / Flagged</span>
            <Badge variant="secondary" className="ml-1.5 h-3.5 px-1 text-[9px]">
              14
            </Badge>
          </button>
        </div>
      </div>

      {/* 4. Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, phone, or ID..."
            className="h-8 w-full rounded-md border border-border/80 bg-background pl-8 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/80 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
            ⌘F
          </kbd>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-1 rounded-md border border-border/80 bg-card px-2.5 py-1 font-medium hover:bg-muted/40">
            <span>Loyalty Tier: <strong className="text-foreground">All Tiers</strong></span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>

          <button className="flex items-center gap-1 rounded-md border border-border/80 bg-card px-2.5 py-1 font-medium hover:bg-muted/40">
            <span>Spend: <strong className="text-foreground">Any Spend</strong></span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>

          <button className="flex items-center gap-1 rounded-md border border-border/80 bg-card px-2.5 py-1 font-medium hover:bg-muted/40">
            <span>Region: <strong className="text-foreground">Global (All)</strong></span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>

          <button className="flex items-center gap-1 rounded-md border border-border/80 bg-card px-2.5 py-1 font-medium hover:bg-muted/40">
            <span>Risk: <strong className="text-foreground">All Levels</strong></span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* 5. Bulk Action Strip (When items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-indigo-900 bg-slate-900 px-3.5 py-2 text-white shadow-md text-xs">
          <div className="flex items-center gap-2">
            <span className="flex size-4 items-center justify-center rounded bg-indigo-600 text-white text-[10px]">
              ✓
            </span>
            <span className="font-bold">{selectedIds.length} customer selected</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">Batch actions ready for applied segment:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="xs"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-1.5 h-7 px-2.5"
            >
              <Send className="size-3.5" />
              <span>Send Campaign</span>
            </Button>

            <Button
              size="xs"
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white gap-1.5 h-7 px-2.5"
            >
              <Tag className="size-3.5" />
              <span>Add Tag</span>
            </Button>

            <Button
              size="xs"
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white gap-1.5 h-7 px-2.5"
            >
              <Download className="size-3.5" />
              <span>Export Selected</span>
            </Button>

            <Button
              size="xs"
              variant="destructive"
              className="border-rose-900 bg-rose-950/60 text-rose-300 hover:bg-rose-900 hover:text-white gap-1.5 h-7 px-2.5"
            >
              <Ban className="size-3.5" />
              <span>Bulk Suspend</span>
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded p-1 text-slate-400 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Customers Table */}
      <Card className="shadow-2xs border-border/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === CUSTOMERS_DATA.length}
                    onChange={toggleSelectAll}
                    className="rounded border-border text-indigo-600 focus:ring-indigo-500 size-3.5"
                  />
                </th>
                <th className="p-3 font-bold">CUSTOMER</th>
                <th className="p-3 font-bold">STATUS &amp; TIER</th>
                <th className="p-3 font-bold">ORDERS &amp; VELOCITY</th>
                <th className="p-3 font-bold">TOTAL SPEND (LTV)</th>
                <th className="p-3 font-bold">LAST ORDER</th>
                <th className="p-3 font-bold">RISK SCORE</th>
                <th className="p-3 font-bold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-normal">
              {filteredCustomers.map((customer) => {
                const isSelected = selectedIds.includes(customer.id)
                const isInspected = selectedCustomerId === customer.id

                return (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className={`cursor-pointer transition-colors ${
                      isInspected
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40"
                        : isSelected
                        ? "bg-muted/40"
                        : "hover:bg-muted/20"
                    }`}
                  >
                    <td className="p-3" onClick={(e) => toggleSelectCustomer(customer.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-border text-indigo-600 focus:ring-indigo-500 size-3.5"
                      />
                    </td>

                    {/* Customer Name & Avatar */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 rounded-full border border-border">
                          <AvatarImage src={customer.avatar} alt={customer.name} />
                          <AvatarFallback className="text-xs bg-indigo-50 text-indigo-700">
                            {customer.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1 font-bold text-foreground text-xs">
                            <span>{customer.name}</span>
                            <span className="text-[10px] font-mono font-medium rounded bg-muted px-1 text-muted-foreground">
                              {customer.country}
                            </span>
                          </div>
                          <div className="text-[10.5px] font-mono text-muted-foreground">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status & Tier */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={customer.statusBadgeVariant}
                          className="text-[10px] font-medium gap-1"
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              customer.status === "Active"
                                ? "bg-emerald-500"
                                : customer.status === "Suspended"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span>{customer.status}</span>
                        </Badge>
                        <Badge variant={customer.tierBadgeVariant} className="text-[10px] font-semibold">
                          {customer.tier}
                        </Badge>
                      </div>
                    </td>

                    {/* Orders & Velocity */}
                    <td className="p-3">
                      <div className="font-bold text-foreground text-xs">
                        {customer.ordersCount} orders
                      </div>
                      <div className="text-[10.5px] text-muted-foreground font-mono">
                        {customer.ordersCadence}
                      </div>
                    </td>

                    {/* Total Spend */}
                    <td className="p-3">
                      <div className="font-mono font-bold text-foreground text-xs">
                        {customer.totalSpend}
                      </div>
                      <div className="text-[10.5px] text-muted-foreground font-mono">
                        {customer.avgOrderValue}
                      </div>
                    </td>

                    {/* Last Order */}
                    <td className="p-3 font-mono text-xs">
                      <div
                        className={`font-bold ${
                          customer.lastOrder.isFailed || customer.lastOrder.isChargeback
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {customer.lastOrder.id}
                      </div>
                      <div className="text-[10.5px] text-muted-foreground">
                        {customer.lastOrder.date}
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 font-mono text-xs font-bold">
                        <span
                          className={`size-2 rounded-full ${
                            customer.riskVariant === "success"
                              ? "bg-emerald-500"
                              : customer.riskVariant === "destructive"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span className={customer.riskVariant === "destructive" ? "text-rose-600" : "text-foreground"}>
                          {customer.riskScore} {customer.riskLabel}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href="/customers/360"
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Open 360 Profile"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        <button className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                          <MoreVertical className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 p-3 text-xs bg-muted/10">
          <div className="text-muted-foreground">
            Showing <strong className="text-foreground font-semibold">1 to 25</strong> of{" "}
            <strong className="text-foreground font-semibold">8,940</strong> customers
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>Rows per page:</span>
              <select className="rounded border border-border bg-card px-2 py-0.5 text-xs font-medium text-foreground">
                <option>25</option>
                <option>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button className="flex size-6 items-center justify-center rounded border border-border bg-card text-muted-foreground">
                &lt;
              </button>
              <button className="flex size-6 items-center justify-center rounded bg-indigo-600 font-bold text-white text-xs">
                1
              </button>
              <button className="flex size-6 items-center justify-center rounded border border-border bg-card hover:bg-muted text-muted-foreground text-xs">
                2
              </button>
              <button className="flex size-6 items-center justify-center rounded border border-border bg-card hover:bg-muted text-muted-foreground text-xs">
                3
              </button>
              <span className="px-1 text-muted-foreground">...</span>
              <button className="flex size-6 items-center justify-center rounded border border-border bg-card hover:bg-muted text-muted-foreground text-xs">
                358
              </button>
              <button className="flex size-6 items-center justify-center rounded border border-border bg-card text-muted-foreground">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 7. Customer Quick Glance Drawer (Bottom Panel) */}
      {selectedCustomer && (
        <Card className="shadow-2xs border-border/70 overflow-hidden">
          <CardHeader className="p-3.5 pb-2.5 border-b border-border/60 bg-muted/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-indigo-600" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider">
                  Customer Quick Glance
                </CardTitle>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/customers/360"
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  <span>Open 360 View</span>
                  <ExternalLink className="size-3" />
                </Link>
                <button
                  onClick={() => setSelectedCustomerId("")}
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4 text-xs">
            {/* Identity & Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 rounded-full border border-border">
                  <AvatarImage src={selectedCustomer.avatar} />
                  <AvatarFallback className="text-xs bg-indigo-50 text-indigo-700">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">
                      {selectedCustomer.name}
                    </h3>
                    <Badge variant="brand" className="text-[10px] font-bold">
                      {selectedCustomer.tier}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Customer since March 2022 • NYC Zone
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[10px] font-medium gap-1">
                  <CheckCircle2 className="size-3" />
                  <span>US Verified Buyer</span>
                </Badge>
                <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                  Marketing Opt-in
                </Badge>
              </div>
            </div>

            {/* 4 Summary Stat Boxes */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 rounded-lg border border-border/60 bg-muted/20 p-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  TOTAL SPEND
                </div>
                <div className="text-base font-black text-foreground mt-0.5 font-mono">
                  {selectedCustomer.totalSpend}
                </div>
                <div className="text-[10px] text-indigo-600 font-semibold">Top 3% percentile</div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  TOTAL ORDERS
                </div>
                <div className="text-base font-black text-foreground mt-0.5 font-mono">
                  {selectedCustomer.ordersCount}
                </div>
                <div className="text-[10px] text-muted-foreground">{selectedCustomer.avgOrderValue}</div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  RETURN RATE
                </div>
                <div className="text-base font-black text-emerald-600 mt-0.5 font-mono">
                  {selectedCustomer.returnRate}
                </div>
                <div className="text-[10px] text-muted-foreground">Clean record</div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  AVG REVIEW
                </div>
                <div className="text-base font-black text-foreground mt-0.5 font-mono flex items-center gap-1">
                  <span>{selectedCustomer.avgReview}</span>
                  <span className="text-amber-500 text-xs">★★★</span>
                </div>
                <div className="text-[10px] text-muted-foreground">{selectedCustomer.reviewsCount} reviews submitted</div>
              </div>
            </div>

            {/* Contact & Fulfillment Node */}
            <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5 font-mono text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-sans">
                CONTACT &amp; FULFILLMENT NODE
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3 text-muted-foreground" />
                  <span>Email:</span>
                </span>
                <span className="text-foreground">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3 text-muted-foreground" />
                  <span>Phone:</span>
                </span>
                <span className="text-foreground">{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3 text-muted-foreground" />
                  <span>Default Ship:</span>
                </span>
                <span className="text-foreground">{selectedCustomer.address}</span>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  RECENT ORDERS
                </span>
                <Link href="/orders" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                  View All {selectedCustomer.ordersCount}
                </Link>
              </div>

              <div className="divide-y divide-border/40 rounded-lg border border-border/60 bg-card p-2">
                {selectedCustomer.recentOrders.map((ord) => (
                  <div key={ord.id} className="flex items-center justify-between py-1.5 text-xs first:pt-0 last:pb-0 font-mono">
                    <div className="flex items-center gap-2 font-sans">
                      <Receipt className="size-3.5 text-indigo-600" />
                      <span className="font-bold text-foreground">{ord.id}</span>
                      <span className="text-muted-foreground text-[11px] font-mono">{ord.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{ord.amount}</span>
                      <Badge variant={ord.statusVariant} className="text-[9.5px] font-medium font-sans">
                        {ord.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="space-y-2 pt-1">
              <Button
                size="sm"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-8 gap-1.5 shadow-2xs"
              >
                <Plus className="size-3.5" />
                <span>Create Order for Customer</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border/80">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span>Send Message</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border/80">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <span>Add Note</span>
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5 border-border/80 text-muted-foreground hover:text-foreground"
              >
                <CreditCard className="size-3.5" />
                <span>Issue Store Credit</span>
              </Button>

              <div className="text-center pt-1">
                <button type="button" className="text-xs font-semibold text-rose-600 hover:underline flex items-center justify-center gap-1 mx-auto">
                  <Ban className="size-3" />
                  <span>Suspend Account</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
