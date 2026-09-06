"use client"

import * as React from "react"
import Link from "next/link"
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  ShoppingBag,
  TrendingUp,
  Percent,
  DollarSign,
  Tag,
  ArrowRight,
  Store,
  Smartphone,
  Globe,
  Sliders,
  Play,
  RotateCcw,
  Eye,
  Trash2,
  Copy,
  ChevronRight,
  MoreVertical,
  FlaskConical,
  Calendar,
  X,
  ShieldCheck,
  Check,
  Timer,
  Keyboard,
  Cable,
  Package,
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface PromotionRule {
  id: string
  name: string
  codeRef?: string
  type: "tiered_cart" | "bundle_bogo" | "flash_sale" | "free_shipping" | "category_pct"
  typeLabel: string
  priority: number
  status: "active" | "scheduled" | "paused" | "expired"
  startDate: string
  endDate: string
  channels: ("web" | "mobile" | "pos" | "b2b")[]
  stacking: "compound" | "exclusive" | "priority_override"
  triggerSummary: string
  actionSummary: string
  attributedGmv: number
  redemptions: number
  marginDelta: number
  featured?: boolean
}

const INITIAL_PROMOTIONS: PromotionRule[] = [
  {
    id: "prm_9011",
    name: "Cyber Tech Week: Tiered Cart Savings",
    codeRef: "PRM-TIER-CYBER",
    type: "tiered_cart",
    typeLabel: "Tiered Cart Value",
    priority: 100,
    status: "active",
    startDate: "2024-10-25",
    endDate: "2024-11-05",
    channels: ["web", "mobile"],
    stacking: "compound",
    triggerSummary: "Cart subtotal ≥ $150 / $300 / $500",
    actionSummary: "Tiered cash discounts: -$15 / -$40 / -$80",
    attributedGmv: 184200,
    redemptions: 1420,
    marginDelta: -2.8,
    featured: true,
  },
  {
    id: "prm_8820",
    name: "Apex Pro Keyboard & Aviator Cable Bundle",
    codeRef: "PRM-BNDL-KEYCBL",
    type: "bundle_bogo",
    typeLabel: "Bundle Pairing (BOGO)",
    priority: 90,
    status: "active",
    startDate: "2024-09-01",
    endDate: "2024-12-31",
    channels: ["web"],
    stacking: "compound",
    triggerSummary: "Buy APX-KB-BLK-TAC Keyboard",
    actionSummary: "Get CBL-AVT-CHR Cable at 40% Off ($27.00)",
    attributedGmv: 78400,
    redemptions: 620,
    marginDelta: -1.4,
    featured: true,
  },
  {
    id: "prm_9340",
    name: "Midnight Flash Drop: Moondrop Audio Series",
    codeRef: "PRM-FLSH-MOON",
    type: "flash_sale",
    typeLabel: "Timed Catalog Markdown",
    priority: 120,
    status: "active",
    startDate: "2024-10-28 00:00",
    endDate: "2024-10-28 23:59",
    channels: ["web", "mobile"],
    stacking: "priority_override",
    triggerSummary: "Brand: Moondrop (18 catalog SKUs)",
    actionSummary: "Direct 25% price strikethrough",
    attributedGmv: 42100,
    redemptions: 310,
    marginDelta: -4.1,
    featured: true,
  },
  {
    id: "prm_7741",
    name: "VIP Tier: Complimentary Express Freight",
    codeRef: "PRM-VIP-EXPFREIGHT",
    type: "free_shipping",
    typeLabel: "Tiered Shipping Waiver",
    priority: 80,
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    channels: ["web", "mobile", "b2b"],
    stacking: "compound",
    triggerSummary: "Customer tier Gold+ and subtotal ≥ $120",
    actionSummary: "100% Free 2-Day Air Shipping ($18.50 value)",
    attributedGmv: 92800,
    redemptions: 880,
    marginDelta: -0.9,
    featured: false,
  },
  {
    id: "prm_6632",
    name: "Monitors & Displays Autumn Clearance",
    codeRef: "PRM-CAT-DISP20",
    type: "category_pct",
    typeLabel: "Category Markdown",
    priority: 70,
    status: "scheduled",
    startDate: "2024-11-10",
    endDate: "2024-11-20",
    channels: ["web", "pos"],
    stacking: "exclusive",
    triggerSummary: "Category: Displays & Ultrawide Monitors",
    actionSummary: "15% off at checkout",
    attributedGmv: 0,
    redemptions: 0,
    marginDelta: -2.2,
    featured: false,
  },
  {
    id: "prm_5409",
    name: "B2B Bulk Purchase Pallet Discount",
    codeRef: "PRM-B2B-VOL200",
    type: "tiered_cart",
    typeLabel: "Wholesale Tier",
    priority: 85,
    status: "active",
    startDate: "2024-06-01",
    endDate: "2024-12-31",
    channels: ["b2b"],
    stacking: "exclusive",
    triggerSummary: "Order qty ≥ 50 units across SKU groups",
    actionSummary: "Additional 12% wholesale tier reduction",
    attributedGmv: 114900,
    redemptions: 48,
    marginDelta: -3.8,
    featured: false,
  },
  {
    id: "prm_4102",
    name: "Summer Kickoff Sitewide BOGO 50%",
    codeRef: "PRM-SMR-BOGO50",
    type: "bundle_bogo",
    typeLabel: "Buy 1 Get 1 50% Off",
    priority: 95,
    status: "expired",
    startDate: "2024-07-01",
    endDate: "2024-07-15",
    channels: ["web", "mobile"],
    stacking: "exclusive",
    triggerSummary: "Equal or lesser value apparel accessories",
    actionSummary: "50% off second item",
    attributedGmv: 68300,
    redemptions: 920,
    marginDelta: -3.5,
    featured: false,
  },
]

export default function PromotionsCampaignsPage() {
  const [promotions, setPromotions] = React.useState<PromotionRule[]>(INITIAL_PROMOTIONS)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedTab, setSelectedTab] = React.useState<"all" | "active" | "scheduled" | "automated" | "expired">("all")
  const [ruleTypeFilter, setRuleTypeFilter] = React.useState("all")
  const [channelFilter, setChannelFilter] = React.useState("all")
  const [stackingFilter, setStackingFilter] = React.useState("all")
  const [viewMode, setViewMode] = React.useState<"list" | "timeline">("list")
  
  // Simulator State
  const [simCartItems, setSimCartItems] = React.useState<
    { id: string; name: string; sku: string; price: number; qty: number; brand: string }[]
  >([
    { id: "1", name: "Apex Pro Custom Mechanical Keyboard", sku: "APX-KB-BLK-TAC", price: 199.0, qty: 1, brand: "Apex" },
    { id: "2", name: "Braided Aviator Coiled USB-C Cable", sku: "CBL-AVT-CHR", price: 45.0, qty: 1, brand: "Apex" },
    { id: "3", name: "Moondrop Blessing 3 Hybrid IEMs", sku: "MND-BL3-IEM", price: 319.0, qty: 1, brand: "Moondrop" },
  ])
  const [simCustomerTier, setSimCustomerTier] = React.useState<"standard" | "vip_gold" | "b2b">("vip_gold")
  const [isSimulatorOpen, setIsSimulatorOpen] = React.useState(false)

  // New Rule Modal
  const [isNewRuleOpen, setIsNewRuleOpen] = React.useState(false)
  const [newRuleForm, setNewRuleForm] = React.useState({
    name: "",
    codeRef: "",
    type: "tiered_cart" as PromotionRule["type"],
    priority: 100,
    startDate: "2024-11-01",
    endDate: "2024-11-30",
    channels: ["web", "mobile"] as ("web" | "mobile" | "pos" | "b2b")[],
    stacking: "compound" as PromotionRule["stacking"],
    triggerSummary: "",
    actionSummary: "",
  })

  // Flash Countdown Timer
  const [countdown, setCountdown] = React.useState("03h : 42m : 18s")
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const end = new Date()
      end.setHours(23, 59, 59)
      const diff = Math.max(0, end.getTime() - now.getTime())
      const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0")
      const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0")
      const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0")
      setCountdown(`${h}h : ${m}m : ${s}s`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Toggle rule status
  const handleToggleStatus = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === "active" ? "paused" : "active"
          return { ...p, status: nextStatus }
        }
        return p
      })
    )
  }

  // Filter calculations
  const filteredPromotions = React.useMemo(() => {
    return promotions.filter((p) => {
      // Tab filter
      if (selectedTab === "active" && p.status !== "active") return false
      if (selectedTab === "scheduled" && p.status !== "scheduled") return false
      if (selectedTab === "expired" && p.status !== "expired") return false
      if (selectedTab === "automated" && !["tiered_cart", "bundle_bogo", "free_shipping"].includes(p.type)) return false

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.codeRef && p.codeRef.toLowerCase().includes(q)) ||
          p.triggerSummary.toLowerCase().includes(q)
        if (!match) return false
      }

      // Type filter
      if (ruleTypeFilter !== "all" && p.type !== ruleTypeFilter) return false

      // Channel filter
      if (channelFilter !== "all" && !p.channels.includes(channelFilter as any)) return false

      // Stacking filter
      if (stackingFilter !== "all" && p.stacking !== stackingFilter) return false

      return true
    })
  }, [promotions, selectedTab, searchQuery, ruleTypeFilter, channelFilter, stackingFilter])

  // Simulator Calculation Engine
  const cartCalculation = React.useMemo(() => {
    const rawSubtotal = simCartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    const appliedDiscounts: { ruleId: string; name: string; amount: number; description: string }[] = []

    // Rule 1: Moondrop Flash 25% (Priority 120 Override)
    const moondropItem = simCartItems.find((i) => i.brand === "Moondrop")
    if (moondropItem) {
      const discountVal = moondropItem.price * moondropItem.qty * 0.25
      appliedDiscounts.push({
        ruleId: "prm_9340",
        name: "Midnight Flash: Moondrop 25% Off",
        amount: discountVal,
        description: `25% off ${moondropItem.name} (-$${discountVal.toFixed(2)})`,
      })
    }

    // Rule 2: Tiered Cart Savings (Priority 100)
    if (rawSubtotal >= 500) {
      appliedDiscounts.push({
        ruleId: "prm_9011",
        name: "Cyber Tech Week: Tier 3 Savings",
        amount: 80.0,
        description: "Cart subtotal ≥ $500 (-$80.00)",
      })
    } else if (rawSubtotal >= 300) {
      appliedDiscounts.push({
        ruleId: "prm_9011",
        name: "Cyber Tech Week: Tier 2 Savings",
        amount: 40.0,
        description: "Cart subtotal ≥ $300 (-$40.00)",
      })
    } else if (rawSubtotal >= 150) {
      appliedDiscounts.push({
        ruleId: "prm_9011",
        name: "Cyber Tech Week: Tier 1 Savings",
        amount: 15.0,
        description: "Cart subtotal ≥ $150 (-$15.00)",
      })
    }

    // Rule 3: Bundle Keyboard + Cable 40% Off Addon (Priority 90)
    const hasKeyboard = simCartItems.some((i) => i.sku === "APX-KB-BLK-TAC" && i.qty >= 1)
    const cableItem = simCartItems.find((i) => i.sku === "CBL-AVT-CHR")
    if (hasKeyboard && cableItem) {
      const cableDiscount = cableItem.price * 0.4
      appliedDiscounts.push({
        ruleId: "prm_8820",
        name: "Keyboard & Cable Bundle",
        amount: cableDiscount,
        description: "40% off paired aviator cable (-$18.00)",
      })
    }

    // Rule 4: VIP Free Express Shipping ($18.50 waiver)
    const shippingBase = 18.5
    let shippingCost = shippingBase
    if (simCustomerTier === "vip_gold" && rawSubtotal >= 120) {
      appliedDiscounts.push({
        ruleId: "prm_7741",
        name: "VIP Tier: Free Express Freight",
        amount: shippingBase,
        description: "100% Free 2-Day Air for VIP Gold (-$18.50)",
      })
      shippingCost = 0
    }

    const totalDiscounts = appliedDiscounts.reduce((acc, d) => acc + d.amount, 0)
    const discountedSubtotal = Math.max(0, rawSubtotal - (totalDiscounts - (shippingCost === 0 ? shippingBase : 0)))
    const estimatedTax = discountedSubtotal * 0.0825
    const finalTotal = discountedSubtotal + shippingCost + estimatedTax

    return {
      rawSubtotal,
      appliedDiscounts,
      totalDiscounts,
      discountedSubtotal,
      shippingCost,
      estimatedTax,
      finalTotal,
    }
  }, [simCartItems, simCustomerTier])

  // Create rule handler
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRuleForm.name) return
    const newRule: PromotionRule = {
      id: `prm_${Math.floor(1000 + Math.random() * 9000)}`,
      name: newRuleForm.name,
      codeRef: newRuleForm.codeRef || `PRM-${Date.now().toString().slice(-4)}`,
      type: newRuleForm.type,
      typeLabel:
        newRuleForm.type === "tiered_cart"
          ? "Tiered Cart Value"
          : newRuleForm.type === "bundle_bogo"
          ? "Bundle Pairing (BOGO)"
          : newRuleForm.type === "flash_sale"
          ? "Timed Catalog Markdown"
          : newRuleForm.type === "free_shipping"
          ? "Shipping Waiver"
          : "Category Markdown",
      priority: Number(newRuleForm.priority),
      status: "active",
      startDate: newRuleForm.startDate,
      endDate: newRuleForm.endDate,
      channels: newRuleForm.channels,
      stacking: newRuleForm.stacking,
      triggerSummary: newRuleForm.triggerSummary || "Configured condition matrix",
      actionSummary: newRuleForm.actionSummary || "Automated discount applied",
      attributedGmv: 0,
      redemptions: 0,
      marginDelta: -2.5,
    }

    setPromotions((prev) => [newRule, ...prev])
    setIsNewRuleOpen(false)
    setNewRuleForm({
      name: "",
      codeRef: "",
      type: "tiered_cart",
      priority: 100,
      startDate: "2024-11-01",
      endDate: "2024-11-30",
      channels: ["web", "mobile"],
      stacking: "compound",
      triggerSummary: "",
      actionSummary: "",
    })
  }

  return (
    <div className="w-full min-w-0 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase">
            <span>Marketing</span>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">Campaigns & Pricing Rules</span>
            <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold bg-indigo-50/50 text-indigo-700 border-indigo-200">
              Rule-Engine v2.4
            </Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Megaphone className="size-7 text-indigo-600" />
            Promotions & Dynamic Campaign Engine
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Orchestrate automated cart rules, tiered volume discounts, flash sales schedules, and bundle pricing logic across omni-channel storefronts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSimulatorOpen(true)}
            className="h-9 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <FlaskConical className="size-4 text-indigo-600" />
            Simulator / Test Cart
          </Button>
          <Button
            size="sm"
            onClick={() => setIsNewRuleOpen(true)}
            className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
          >
            <Plus className="size-4" />
            New Promotion Rule
          </Button>
        </div>
      </div>

      {/* 4 High Density KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-2xs">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Campaigns</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">8 Running</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>3 Scheduled</span>
              <span>•</span>
              <span className="text-rose-600 font-semibold">1 Ending in 4h</span>
            </div>
            {/* Sparkline */}
            <svg className="w-14 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 64 20">
              <path d="M1 15 L16 11 L30 14 L45 6 L63 8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-2xs">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-600" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Attributed GMV (30D)</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">$512,400.00</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono text-[11px]">
              <strong className="text-indigo-600 font-semibold">41.0%</strong> of catalog gross volume
            </span>
            <svg className="w-14 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 64 20">
              <path d="M1 18 L15 13 L32 10 L48 4 L63 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-2xs">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Average Order Lift (AOV)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShoppingBag className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">$104.20</span>
            <span className="text-xs font-semibold text-emerald-600 font-mono">+19.3%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono text-[11px]">vs $87.35 baseline basket</span>
            <svg className="w-14 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 64 20">
              <path d="M1 16 L18 14 L34 9 L49 11 L63 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-2xs">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Margin Impact</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Percent className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">3.2%</span>
            <span className="text-xs text-muted-foreground">Margin Absorption</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "71%" }} />
            </div>
            <span className="font-mono text-[10px] shrink-0">Ceiling: 4.5%</span>
          </div>
        </div>
      </div>

      {/* Featured Live Priority Stream Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Live & Priority Automated Rules</h2>
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-mono text-[11px] gap-1 px-2">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-ping" />
              8 Active Now
            </Badge>
          </div>
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
            <ArrowUpDown className="size-3 text-indigo-600" />
            Ordered by execution priority (Desc)
          </span>
        </div>

        <div className="space-y-3">
          {/* Card 1: Tiered Cart */}
          <div className="rounded-xl border bg-card p-4 lg:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Layers className="size-5" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 font-bold">
                    PRIORITY 100
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px] font-medium gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-600" /> Live & Processing
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> Oct 25 - Nov 05, 2024 (Ends in 4 days)
                  </span>
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-foreground">Cyber Tech Week: Tiered Cart Savings</h3>
                  <span className="text-xs text-muted-foreground font-mono">• Tiered Cart Value Discount</span>
                </div>
                {/* Rule Flow Pills */}
                <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                  <div className="px-2 py-0.5 rounded bg-muted font-mono text-xs text-foreground flex items-center gap-1">
                    <span className="text-muted-foreground">Tier 1:</span> Spend $150 → <span className="font-semibold text-indigo-600">-$15.00 Off</span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-muted font-mono text-xs text-foreground flex items-center gap-1">
                    <span className="text-muted-foreground">Tier 2:</span> Spend $300 → <span className="font-semibold text-indigo-600">-$40.00 Off</span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-muted font-mono text-xs text-foreground flex items-center gap-1">
                    <span className="text-muted-foreground">Tier 3:</span> Spend $500 → <span className="font-semibold text-indigo-600">-$80.00 Off</span>
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Store className="size-3.5 text-indigo-600" /> Target: Web Storefront + Mobile App
                  </span>
                  <span className="flex items-center gap-1">
                    <Filter className="size-3.5 text-muted-foreground" /> Trigger: Sitewide (Excl. Clearance SKUs)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Sparkles className="size-3.5 text-emerald-600" /> Stacking: Auto-applies at checkout
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between xl:justify-end gap-6 pt-3 xl:pt-0 border-t xl:border-t-0 shrink-0">
              <div className="grid grid-cols-3 gap-5 text-left">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Attributed GMV</div>
                  <div className="text-sm font-semibold font-mono text-foreground mt-0.5">$184,200</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Redemptions</div>
                  <div className="text-sm font-semibold font-mono text-foreground mt-0.5">1,420 orders</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Margin Delta</div>
                  <div className="text-sm font-semibold font-mono text-amber-600 mt-0.5">-2.8%</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-3 border-l">
                <Switch
                  checked={promotions.find((p) => p.id === "prm_9011")?.status === "active"}
                  onCheckedChange={() => handleToggleStatus("prm_9011")}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Bundle Keyboard & Aviator Cable */}
          <div className="rounded-xl border bg-card p-4 lg:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Package className="size-5" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-purple-50 text-purple-700 border-purple-200 font-bold">
                    PRIORITY 90
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px] font-medium gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-600" /> Evergreen Active
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> Always-On Bundle Policy
                  </span>
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-foreground">Apex Pro Keyboard & Aviator Cable Bundle</h3>
                  <span className="text-xs text-muted-foreground font-mono">• Bundle Pairing (BOGO-style)</span>
                </div>
                <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                  <div className="px-2 py-0.5 rounded bg-muted font-mono text-xs text-foreground flex items-center gap-1.5">
                    <Keyboard className="size-3.5 text-indigo-600" />
                    <span>Primary SKU: <code className="font-semibold">APX-KB-BLK-TAC</code></span>
                    <span className="text-muted-foreground">+</span>
                    <Cable className="size-3.5 text-purple-600" />
                    <span>Add-on SKU: <code className="font-semibold">CBL-AVT-CHR</code></span>
                    <span className="text-indigo-600 font-semibold pl-1">(40% Off Accessory)</span>
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="size-3.5 text-muted-foreground" /> Behavior: Auto-adds paired SKU to checkout
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="size-3.5 text-muted-foreground" /> Channels: Online Storefront
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between xl:justify-end gap-6 pt-3 xl:pt-0 border-t xl:border-t-0 shrink-0">
              <div className="grid grid-cols-3 gap-5 text-left">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bundle GMV</div>
                  <div className="text-sm font-semibold font-mono text-foreground mt-0.5">$78,400</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bundles Sold</div>
                  <div className="text-sm font-semibold font-mono text-foreground mt-0.5">620 units</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Attach Rate</div>
                  <div className="text-sm font-semibold font-mono text-emerald-600 mt-0.5">38.4%</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-3 border-l">
                <Switch
                  checked={promotions.find((p) => p.id === "prm_8820")?.status === "active"}
                  onCheckedChange={() => handleToggleStatus("prm_8820")}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Midnight Flash Drop (Countdown) */}
          <div className="relative overflow-hidden rounded-xl border bg-card p-4 lg:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />
            <div className="flex items-start gap-4 flex-1 pl-1">
              <div className="size-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Timer className="size-5" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-rose-50 text-rose-700 border-rose-200 font-bold">
                    PRIORITY 120 (OVERRIDE)
                  </Badge>
                  <Badge className="bg-rose-100 text-rose-800 border-none font-mono text-[11px] font-semibold flex items-center gap-1.5 px-2.5">
                    <span className="size-2 rounded-full bg-rose-600 animate-ping" />
                    <span>Ends in {countdown}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">Brand Markdown</span>
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-foreground">Midnight Flash Drop: Moondrop Audio Series</h3>
                  <span className="text-xs text-muted-foreground font-mono">• Timed Catalog Markdown (25% Strikethrough)</span>
                </div>
                <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                  <div className="px-2 py-0.5 rounded bg-muted font-mono text-xs text-foreground flex items-center gap-1.5">
                    <span className="text-muted-foreground">Scope:</span>
                    <span className="font-semibold">Brand: Moondrop</span>
                    <span className="text-muted-foreground">•</span>
                    <span>Automatic 25% price strikethrough across 18 catalog SKUs</span>
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Store className="size-3.5 text-muted-foreground" /> Channel: Direct Web Storefront
                  </span>
                  <span className="flex items-center gap-1 text-rose-600 font-medium">
                    <AlertTriangle className="size-3.5" /> Inventory Warning: Stock remaining 14%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between xl:justify-end gap-6 pt-3 xl:pt-0 border-t xl:border-t-0 shrink-0">
              <div className="grid grid-cols-3 gap-5 text-left">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Flash GMV</div>
                  <div className="text-sm font-semibold font-mono text-foreground mt-0.5">$42,100</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Units Moved</div>
                  <div className="text-sm font-semibold font-mono text-foreground mt-0.5">310 items</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Margin Delta</div>
                  <div className="text-sm font-semibold font-mono text-rose-600 mt-0.5">-4.1%</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-3 border-l">
                <Switch
                  checked={promotions.find((p) => p.id === "prm_9340")?.status === "active"}
                  onCheckedChange={() => handleToggleStatus("prm_9340")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filter Toolbar */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
          <Tabs value={selectedTab} onValueChange={(v: any) => setSelectedTab(v)} className="w-full sm:w-auto">
            <TabsList className="bg-muted/70 p-1">
              <TabsTrigger value="all" className="text-xs gap-1.5">
                All Promotions <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{promotions.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs gap-1.5">
                Live Now <Badge className="bg-emerald-100 text-emerald-800 px-1.5 py-0 text-[10px]">{promotions.filter(p => p.status === "active").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="text-xs gap-1.5">
                Scheduled Future <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{promotions.filter(p => p.status === "scheduled").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="automated" className="text-xs gap-1.5">
                Automated Triggered Rules
              </TabsTrigger>
              <TabsTrigger value="expired" className="text-xs gap-1.5">
                Past Campaigns
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <Sliders className="size-3.5" /> Columns
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              Export Rules JSON
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Filter by rule name, SKU trigger, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-card"
              />
            </div>

            {/* Rule Type Filter */}
            <select
              value={ruleTypeFilter}
              onChange={(e) => setRuleTypeFilter(e.target.value)}
              className="h-8 px-2.5 rounded-md border text-xs bg-card text-foreground cursor-pointer focus:outline-none"
            >
              <option value="all">Rule Type: All Types</option>
              <option value="tiered_cart">Tiered Volume Discounts</option>
              <option value="bundle_bogo">BOGO / Bundle Pairings</option>
              <option value="flash_sale">Flash Markdowns</option>
              <option value="free_shipping">Shipping Waivers</option>
              <option value="category_pct">Category Markdown</option>
            </select>

            {/* Channel Filter */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-8 px-2.5 rounded-md border text-xs bg-card text-foreground cursor-pointer focus:outline-none"
            >
              <option value="all">Channel: All Channels</option>
              <option value="web">Online Storefront</option>
              <option value="mobile">Mobile App</option>
              <option value="b2b">B2B Wholesale Portal</option>
              <option value="pos">POS Kiosks</option>
            </select>

            {/* Stacking Filter */}
            <select
              value={stackingFilter}
              onChange={(e) => setStackingFilter(e.target.value)}
              className="h-8 px-2.5 rounded-md border text-xs bg-card text-foreground cursor-pointer focus:outline-none"
            >
              <option value="all">Stacking: All Behaviors</option>
              <option value="compound">Compounding Allowed</option>
              <option value="exclusive">Strictly Exclusive</option>
              <option value="priority_override">Priority Override</option>
            </select>

            {(searchQuery || ruleTypeFilter !== "all" || channelFilter !== "all" || stackingFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setRuleTypeFilter("all")
                  setChannelFilter("all")
                  setStackingFilter("all")
                }}
                className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3" /> Reset
              </Button>
            )}
          </div>
        </div>

        {/* Complete Promotions Data Table */}
        <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="h-9">
                <TableHead className="w-20 text-[10px] font-bold uppercase tracking-wider">Priority</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Rule Name & Code</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Rule Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Trigger Condition</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Action / Discount</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Stacking</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Channels</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Attributed GMV</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-center">Status</TableHead>
                <TableHead className="w-12 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground text-xs">
                    No promotions found matching current filter parameters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPromotions.map((rule) => (
                  <TableRow key={rule.id} className="h-10 hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-[10px] font-bold",
                          rule.priority >= 100
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        P-{rule.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                          {rule.name}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                          <code>{rule.id}</code>
                          <span>•</span>
                          <span>{rule.codeRef}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{rule.typeLabel}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-foreground">{rule.triggerSummary}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-indigo-700 font-medium">{rule.actionSummary}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-mono",
                          rule.stacking === "compound"
                            ? "bg-emerald-50 text-emerald-700"
                            : rule.stacking === "priority_override"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-slate-100 text-slate-700"
                        )}
                      >
                        {rule.stacking}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {rule.channels.map((c) => (
                          <Badge key={c} variant="outline" className="text-[9px] uppercase px-1 py-0">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">
                      ${rule.attributedGmv.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={rule.status === "active"}
                          onCheckedChange={() => handleToggleStatus(rule.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="size-7" />}>
                          <MoreVertical className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 text-xs">
                          <DropdownMenuLabel>Rule Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setIsSimulatorOpen(true)} className="gap-2">
                            <FlaskConical className="size-3.5 text-indigo-600" /> Test in Simulator
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Copy className="size-3.5" /> Clone Rule Template
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setPromotions(prev => prev.filter(p => p.id !== rule.id))}
                            className="gap-2 text-rose-600 focus:text-rose-600"
                          >
                            <Trash2 className="size-3.5" /> Archive / Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Simulator / Test Cart Drawer Dialog */}
      <Dialog open={isSimulatorOpen} onOpenChange={setIsSimulatorOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FlaskConical className="size-5 text-indigo-600" />
              Promotion Rule Engine Simulator & Cart Validator
            </DialogTitle>
            <DialogDescription className="text-xs">
              Simulate cart checkout payloads and observe how tiered volume rules, flash discounts, bundle logic, and VIP waivers interact sequentially.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Customer Tier Switcher */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">Customer Segment Tier:</span>
                <p className="text-[11px] text-muted-foreground">Adjust user membership to test tier-gated shipping and loyalty pricing.</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant={simCustomerTier === "standard" ? "default" : "outline"}
                  onClick={() => setSimCustomerTier("standard")}
                  className="h-7 text-xs"
                >
                  Standard
                </Button>
                <Button
                  size="sm"
                  variant={simCustomerTier === "vip_gold" ? "default" : "outline"}
                  onClick={() => setSimCustomerTier("vip_gold")}
                  className="h-7 text-xs"
                >
                  VIP Gold+
                </Button>
                <Button
                  size="sm"
                  variant={simCustomerTier === "b2b" ? "default" : "outline"}
                  onClick={() => setSimCustomerTier("b2b")}
                  className="h-7 text-xs"
                >
                  B2B Wholesale
                </Button>
              </div>
            </div>

            {/* Test Cart Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Active Cart Basket Items</span>
                <span className="text-muted-foreground font-mono text-[11px]">{simCartItems.length} items</span>
              </div>
              <div className="rounded-lg border bg-card overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="h-8">
                      <TableHead className="text-[10px]">Item & SKU</TableHead>
                      <TableHead className="text-[10px] w-20 text-right">Price</TableHead>
                      <TableHead className="text-[10px] w-24 text-center">Qty</TableHead>
                      <TableHead className="text-[10px] w-24 text-right">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {simCartItems.map((item) => (
                      <TableRow key={item.id} className="h-9">
                        <TableCell>
                          <div className="font-medium text-foreground">{item.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{item.sku} • {item.brand}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1.5 border rounded px-1.5 py-0.5 bg-muted/40">
                            <button
                              onClick={() =>
                                setSimCartItems((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
                                )
                              }
                              className="text-muted-foreground hover:text-foreground font-bold px-1"
                            >
                              -
                            </button>
                            <span className="font-mono font-semibold">{item.qty}</span>
                            <button
                              onClick={() =>
                                setSimCartItems((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
                                )
                              }
                              className="text-muted-foreground hover:text-foreground font-bold px-1"
                            >
                              +
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          ${(item.price * item.qty).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Rule Execution Waterfall */}
            <div className="space-y-2">
              <span className="font-semibold text-foreground">Rule Execution Waterfall & Applied Reductions</span>
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                {cartCalculation.appliedDiscounts.length === 0 ? (
                  <div className="text-center py-2 text-muted-foreground">No active promotion rules qualified for this basket.</div>
                ) : (
                  cartCalculation.appliedDiscounts.map((disc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-card border text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[9px] bg-indigo-50 text-indigo-700">
                          {disc.ruleId}
                        </Badge>
                        <span className="font-medium text-foreground">{disc.name}</span>
                        <span className="text-[11px] text-muted-foreground">({disc.description})</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600">-${disc.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="rounded-lg border bg-card p-3 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Raw Gross Subtotal:</span>
                <span>${cartCalculation.rawSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Total Promotional Deductions:</span>
                <span>-${cartCalculation.totalDiscounts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Express Shipping:</span>
                <span>${cartCalculation.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated State Tax (8.25%):</span>
                <span>${cartCalculation.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between text-sm font-bold text-foreground">
                <span>Simulated Order Total:</span>
                <span className="text-indigo-600">${cartCalculation.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSimulatorOpen(false)} className="text-xs h-8">
              Close Simulator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Promotion Rule Dialog */}
      <Dialog open={isNewRuleOpen} onOpenChange={setIsNewRuleOpen}>
        <DialogContent className="sm:max-w-[580px]">
          <form onSubmit={handleCreateRule}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Plus className="size-4 text-indigo-600" /> Create Promotion Campaign Rule
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure rule priority, discount triggers, channel targeting, and stacking behavior.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Promotion Name *</label>
                  <Input
                    required
                    placeholder="e.g. Black Friday Flash 30%"
                    value={newRuleForm.name}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, name: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Reference Code</label>
                  <Input
                    placeholder="e.g. PRM-BF-2024"
                    value={newRuleForm.codeRef}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, codeRef: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Rule Type</label>
                  <select
                    value={newRuleForm.type}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, type: e.target.value as any })}
                    className="w-full h-8 px-2.5 rounded-md border text-xs bg-background"
                  >
                    <option value="tiered_cart">Tiered Volume Cart</option>
                    <option value="bundle_bogo">Bundle Pairing / BOGO</option>
                    <option value="flash_sale">Timed Flash Markdown</option>
                    <option value="free_shipping">Free Shipping Waiver</option>
                    <option value="category_pct">Category Markdown</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Priority Weight (1-200)</label>
                  <Input
                    type="number"
                    min="1"
                    max="200"
                    value={newRuleForm.priority}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, priority: Number(e.target.value) })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={newRuleForm.startDate}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, startDate: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">End Date</label>
                  <Input
                    type="date"
                    value={newRuleForm.endDate}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, endDate: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Trigger Condition Summary</label>
                <Input
                  placeholder="e.g. Cart Subtotal ≥ $200 OR specific brand SKU"
                  value={newRuleForm.triggerSummary}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, triggerSummary: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Action / Discount Summary</label>
                <Input
                  placeholder="e.g. -$25 cash rebate at checkout"
                  value={newRuleForm.actionSummary}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, actionSummary: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Stacking Behavior</label>
                <select
                  value={newRuleForm.stacking}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, stacking: e.target.value as any })}
                  className="w-full h-8 px-2.5 rounded-md border text-xs bg-background"
                >
                  <option value="compound">Compound (Can stack with other promotions & coupons)</option>
                  <option value="exclusive">Exclusive (Cancels other rule evaluations)</option>
                  <option value="priority_override">Priority Override (Supersedes lower priority rules)</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewRuleOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                Save & Deploy Rule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
