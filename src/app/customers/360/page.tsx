"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
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
  Bookmark,
  Pin,
  Edit,
  KeyRound,
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OrderRecord {
  id: string
  date: string
  status: "Delivered" | "Processing" | "Shipped" | "Confirmed" | "Refunded"
  statusVariant: "success" | "brand" | "secondary" | "warning" | "destructive"
  itemsCount: number
  itemsSummary: string
  totalAmount: string
  trackingNumber?: string
  paymentMethod: string
}

interface ActivityEvent {
  id: string
  type: "purchase" | "payment" | "fulfillment" | "comms" | "review" | "security" | "support"
  title: string
  code?: string
  badgeText?: string
  badgeVariant?: "success" | "brand" | "secondary" | "warning"
  timestamp: string
  description: string
  meta?: string[]
  productThumb?: {
    name: string
    sku: string
    qty: number
    image: string
  }
  reviewRating?: number
  reviewQuote?: string
}

const HISTORIC_ORDERS: OrderRecord[] = [
  {
    id: "ORD-10248",
    date: "Oct 24, 2024",
    status: "Processing",
    statusVariant: "brand",
    itemsCount: 2,
    itemsSummary: "Apex Pro Keyboard (TKL), Braided USB-C Cable",
    totalAmount: "$249.00",
    trackingNumber: "FEDEX-748920184910",
    paymentMethod: "Visa •••• 1092",
  },
  {
    id: "ORD-09820",
    date: "Sep 19, 2024",
    status: "Delivered",
    statusVariant: "success",
    itemsCount: 3,
    itemsSummary: "Artisan Keycap Set, Desk Mat XL, Audio DAC Hub",
    totalAmount: "$780.50",
    trackingNumber: "UPS-1Z99999999999",
    paymentMethod: "Visa •••• 1092",
  },
  {
    id: "ORD-08912",
    date: "Aug 04, 2024",
    status: "Delivered",
    statusVariant: "success",
    itemsCount: 2,
    itemsSummary: "Studio Monitor Isolation Stand, Cable Management Rail",
    totalAmount: "$512.00",
    trackingNumber: "FEDEX-882190241829",
    paymentMethod: "Apple Pay (Mastercard)",
  },
  {
    id: "ORD-07611",
    date: "Jul 12, 2024",
    status: "Delivered",
    statusVariant: "success",
    itemsCount: 1,
    itemsSummary: "CNC Machined Wrist Rest (Walnut)",
    totalAmount: "$189.00",
    trackingNumber: "USPS-940011189922",
    paymentMethod: "Visa •••• 1092",
  },
  {
    id: "ORD-07204",
    date: "May 28, 2024",
    status: "Delivered",
    statusVariant: "success",
    itemsCount: 4,
    itemsSummary: "Lubed Mechanical Switches 110x, Switch Puller, Krytox Lube Kit",
    totalAmount: "$340.00",
    trackingNumber: "FEDEX-910248201948",
    paymentMethod: "Visa •••• 1092",
  },
  {
    id: "ORD-06890",
    date: "Apr 15, 2024",
    status: "Delivered",
    statusVariant: "success",
    itemsCount: 1,
    itemsSummary: "Apex Wireless Numpad (Slate Gray)",
    totalAmount: "$165.00",
    trackingNumber: "FEDEX-481920491820",
    paymentMethod: "Apple Pay (Mastercard)",
  },
  {
    id: "ORD-06102",
    date: "Feb 10, 2024",
    status: "Delivered",
    statusVariant: "success",
    itemsCount: 2,
    itemsSummary: "Sound Dampening Desk Foam, Custom Coil Cable",
    totalAmount: "$210.00",
    trackingNumber: "UPS-1Z84920194820",
    paymentMethod: "Visa •••• 1092",
  },
]

const ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: "evt-1",
    type: "purchase",
    title: "Order Placed & Confirmed",
    code: "ORD-10248",
    badgeText: "$249.00",
    badgeVariant: "brand",
    timestamp: "Today 14:23 EST",
    description: "Web Storefront direct checkout via Chrome 129.0 on macOS Sonoma. IP: 72.229.28.185 (New York, US). Discount code ARCH-STUDIO-10 applied.",
    productThumb: {
      name: "Apex Pro Keyboard (TKL / Gateron Oil King)",
      sku: "SKU: KB-APX-TKL-OIL",
      qty: 1,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "evt-2",
    type: "payment",
    title: "Stripe 3DS Payment Authorized",
    code: "ch_3NtR98B2910",
    badgeText: "Capturing $249.00",
    badgeVariant: "success",
    timestamp: "Today 14:24 EST",
    description: "Captured $249.00 USD via primary Visa ending in 1092. Radar Risk Score evaluated at 0.01 (Frictionless flow).",
    meta: ["Auth ID: ch_3NtR98B2910", "AVS: Full Match (ZIP 11217)", "3D-Secure Authenticated"],
  },
  {
    id: "evt-3",
    type: "fulfillment",
    title: "Fulfillment Label Created & Dispatched",
    code: "WH-EAST-02 Newark",
    badgeText: "FedEx Ground",
    badgeVariant: "secondary",
    timestamp: "Today 14:25 EST",
    description: "Fulfillment warehouse WH-EAST-02 generated tracking slip. Tracking # 7489 2018 4910. Estimated Brooklyn delivery: Tomorrow by 17:00 EST.",
  },
  {
    id: "evt-4",
    type: "comms",
    title: "Opened Marketing Campaign 'Autumn Tech Drops'",
    badgeText: "Klaviyo VIP",
    badgeVariant: "secondary",
    timestamp: "Oct 12, 09:14 EST",
    description: "Klaviyo Event ID klv_evt_499201. Direct CTR link clicked on featured CNC Artisan Volume Knob accessory section.",
  },
  {
    id: "evt-5",
    type: "review",
    title: "Product Review Submitted (5 / 5 Stars)",
    badgeText: "Verified Buyer",
    badgeVariant: "warning",
    timestamp: "Sep 28, 18:40 EST",
    description: "Customer rated Apex Pro Keyboard with 5 stars on official storefront product page.",
    reviewRating: 5,
    reviewQuote: "Best mechanical keyboard I have ever owned. The sound profile in our architecture studio is crisp and subdued. Client onboarding gift favorite.",
  },
  {
    id: "evt-6",
    type: "security",
    title: "2FA TOTP Authentication Verified",
    badgeText: "Hardware Token",
    badgeVariant: "success",
    timestamp: "Aug 14, 11:02 EST",
    description: "Customer successfully bound hardware YubiKey TOTP authenticator to account. Trust score elevated to 99.8/100.",
  },
]

export default function Customer360Page() {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "orders" | "payments" | "addresses" | "reviews" | "support" | "audit"
  >("overview")
  const [activityFilter, setActivityFilter] = React.useState<"all" | "purchase" | "support" | "comms" | "security">(
    "all"
  )
  const [copiedEmail, setCopiedEmail] = React.useState(false)
  const [notes, setNotes] = React.useState<string[]>([
    "VIP Architect buyer. Prefers carbon-neutral shipping options when available. High priority allocation for new keyboard drops and early artisan batches.",
  ])
  const [newNoteText, setNewNoteText] = React.useState("")
  const [impersonating, setImpersonating] = React.useState(false)
  const [showMoreActions, setShowMoreActions] = React.useState(false)
  const [storeCreditModal, setStoreCreditModal] = React.useState(false)
  const [creditAmount, setCreditAmount] = React.useState("50.00")
  const [currentCredit, setCurrentCredit] = React.useState(0.0)

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText("david.m@example.com")
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteText.trim()) return
    setNotes([newNoteText.trim(), ...notes])
    setNewNoteText("")
  }

  const handleAddCredit = () => {
    const val = parseFloat(creditAmount) || 0
    setCurrentCredit((prev) => prev + val)
    setStoreCreditModal(false)
  }

  const filteredEvents = ACTIVITY_EVENTS.filter((evt) => {
    if (activityFilter === "all") return true
    if (activityFilter === "purchase") return evt.type === "purchase" || evt.type === "payment" || evt.type === "fulfillment"
    if (activityFilter === "comms") return evt.type === "comms"
    if (activityFilter === "security") return evt.type === "security"
    if (activityFilter === "support") return evt.type === "support"
    return true
  })

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* 1. Sub-Header & Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Button
            nativeButton={false}
            render={
              <Link
                href="/customers"
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold"
              />
            }
            variant="ghost"
            size="xs"
            className="h-7 px-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Customers</span>
          </Button>
          <span>/</span>
          <span>Directory</span>
          <span>/</span>
          <span className="font-mono text-foreground font-bold">David Miller (CUST-94821)</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[11px]">Session Active</span>
          </div>
          <span className="text-muted-foreground text-[11px]">IP 72.229.28.185 (NY, US)</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground text-[11px]">Last active 3m ago</span>
        </div>
      </div>

      {/* 2. Main Hero Identity & Fast Action Banner */}
      <Card className="shadow-xs border-border/80 overflow-hidden relative">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        
        <CardContent className="p-5 sm:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Customer Avatar & Bio */}
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="size-16 sm:size-20 rounded-xl border-2 border-background shadow-md">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    alt="David Miller"
                  />
                  <AvatarFallback className="rounded-xl bg-indigo-100 text-indigo-700 text-lg font-bold">
                    DM
                  </AvatarFallback>
                </Avatar>
                <span
                  className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 ring-2 ring-background"
                  title="Online Now"
                />
              </div>

              <div className="flex flex-col min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    David Miller
                  </h1>
                  <Badge variant="brand" className="text-[10px] font-bold uppercase tracking-wider">
                    VIP Tier 1
                  </Badge>
                  <Badge variant="success" className="text-[10px] font-bold uppercase tracking-wider">
                    Active Buyer
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
                    Corporate Architect
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono font-bold text-foreground">
                    <Award className="size-3.5 text-indigo-600" />
                    CUST-94821
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    Brooklyn, NY, United States
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    Member since Mar 14, 2022 (2.6 yrs)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="size-3.5" />
                    KYB Verified Entity
                  </span>
                </div>
              </div>
            </div>

            {/* Fast Action Ribbon */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant={impersonating ? "destructive" : "outline"}
                className="h-8 gap-1.5 text-xs font-semibold"
                onClick={() => setImpersonating(!impersonating)}
              >
                <Radio className={`size-3.5 ${impersonating ? "animate-pulse" : "text-indigo-600"}`} />
                <span>{impersonating ? "Exit Impersonation" : "Impersonate Session"}</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs font-medium"
                onClick={() => {
                  const subject = encodeURIComponent("ApexCommerce VIP Support - David Miller")
                  window.location.href = `mailto:david.m@example.com?subject=${subject}`
                }}
              >
                <Mail className="size-3.5" />
                <span>Direct Message</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs font-medium"
                onClick={() => {
                  document.getElementById("note-input-field")?.focus()
                }}
              >
                <Pin className="size-3.5 text-amber-600" />
                <span>Pin Note</span>
              </Button>

              <Button
                nativeButton={false}
                render={<Link href="/orders" className="flex items-center gap-1.5" />}
                size="sm"
                className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs"
              >
                <ShoppingBag className="size-3.5" />
                <span>Create Custom Order</span>
              </Button>

              {/* More Actions dropdown */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowMoreActions(!showMoreActions)}
                >
                  <MoreVertical className="size-3.5" />
                </Button>
                {showMoreActions && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 rounded-lg border border-border bg-card p-1 shadow-lg z-30 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        setStoreCreditModal(true)
                        setShowMoreActions(false)
                      }}
                      className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-foreground hover:bg-muted"
                    >
                      <DollarSign className="size-3.5 text-emerald-600" />
                      <span>Issue Store Credit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        alert("Initiating formal KYC/KYB re-verification workflow for David Miller.")
                        setShowMoreActions(false)
                      }}
                      className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-foreground hover:bg-muted"
                    >
                      <Shield className="size-3.5 text-indigo-600" />
                      <span>Request KYC Refresh</span>
                    </button>
                    <div className="my-1 border-t border-border/60" />
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to suspend this VIP customer account?")) {
                          alert("Account suspended by Sarah Jenkins (Operations Lead).")
                        }
                        setShowMoreActions(false)
                      }}
                      className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Ban className="size-3.5" />
                      <span>Suspend Account</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Core Financial & Performance Metric Cards (5 Metrics) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            {/* Metric 1 */}
            <div className="rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
                <span>Lifetime Value</span>
                <DollarSign className="size-3.5 text-indigo-600" />
              </div>
              <div className="my-1.5">
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  $4,280.00
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <TrendingUp className="size-3" />
                <span>Top 1% buyer (99.4th %)</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
                <span>Total Orders</span>
                <ShoppingBag className="size-3.5 text-muted-foreground" />
              </div>
              <div className="my-1.5">
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  14 Orders
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground font-medium">
                0 returns • 100% fulfill rate
              </div>
            </div>

            {/* Metric 3 */}
            <div className="rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
                <span>Avg Order Value</span>
                <PieChart className="size-3.5 text-muted-foreground" />
              </div>
              <div className="my-1.5">
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  $305.71
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <TrendingUp className="size-3" />
                <span>+38.4% vs catalog mean</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
                <span>Fraud Risk Score</span>
                <Shield className="size-3.5 text-emerald-600" />
              </div>
              <div className="my-1.5">
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-emerald-600">
                  0.02
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium truncate">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Stripe Radar Verified</span>
              </div>
            </div>

            {/* Metric 5 */}
            <div className="rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
                <span>Net Contribution</span>
                <Sparkles className="size-3.5 text-indigo-600" />
              </div>
              <div className="my-1.5">
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  $1,480.20
                </div>
              </div>
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                34.6% Net Realized Margin
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Operational Tab Navigation Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/70">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white shadow-2xs"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <Layers className="size-3.5" />
          <span>Overview &amp; 360 Summary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === "orders"
              ? "bg-indigo-600 text-white shadow-2xs"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <span>Orders History</span>
          <Badge variant={activeTab === "orders" ? "secondary" : "outline"} className="h-4 px-1 text-[10px]">
            14
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === "payments"
              ? "bg-indigo-600 text-white shadow-2xs"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <span>Payment &amp; Billing</span>
          <Badge variant={activeTab === "payments" ? "secondary" : "outline"} className="h-4 px-1 text-[10px]">
            3
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("addresses")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === "addresses"
              ? "bg-indigo-600 text-white shadow-2xs"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <span>Addresses</span>
          <Badge variant={activeTab === "addresses" ? "secondary" : "outline"} className="h-4 px-1 text-[10px]">
            2
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === "reviews"
              ? "bg-indigo-600 text-white shadow-2xs"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <span>Reviews &amp; NPS</span>
          <Badge variant={activeTab === "reviews" ? "secondary" : "outline"} className="h-4 px-1 text-[10px]">
            4
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("support")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === "support"
              ? "bg-indigo-600 text-white shadow-2xs"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <span>Support Tickets</span>
          <Badge variant={activeTab === "support" ? "secondary" : "outline"} className="h-4 px-1 text-[10px]">
            2
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-indigo-600 text-white shadow-2xs"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <Lock className="size-3" />
          <span>Audit &amp; Session Logs</span>
        </button>
      </div>

      {/* 4. Deep 360 Split Canvas: 65% Primary Ops Stream / 35% Inspector & Controls */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: 8 COLS (~65%) */}
          <div className="lg:col-span-8 space-y-5 min-w-0">
            {/* 1. Real-Time Omnichannel Activity Timeline */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <History className="size-4 text-indigo-600" />
                    <CardTitle className="text-sm font-bold text-foreground">
                      Omnichannel Activity Timeline
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      Live Sync
                    </Badge>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/20 p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setActivityFilter("all")}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        activityFilter === "all"
                          ? "bg-card font-bold text-indigo-600 shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityFilter("purchase")}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        activityFilter === "purchase"
                          ? "bg-card font-bold text-indigo-600 shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Purchases
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityFilter("support")}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        activityFilter === "support"
                          ? "bg-card font-bold text-indigo-600 shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Support
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityFilter("comms")}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        activityFilter === "comms"
                          ? "bg-card font-bold text-indigo-600 shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Comms
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityFilter("security")}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        activityFilter === "security"
                          ? "bg-card font-bold text-indigo-600 shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Security
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-start gap-3.5 rounded-xl border border-border/50 bg-card p-3.5 hover:bg-muted/20 transition-colors shadow-2xs"
                  >
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                        evt.type === "purchase"
                          ? "bg-indigo-600 text-white"
                          : evt.type === "payment"
                          ? "bg-emerald-600 text-white"
                          : evt.type === "fulfillment"
                          ? "bg-blue-600 text-white"
                          : evt.type === "review"
                          ? "bg-amber-500 text-white"
                          : evt.type === "security"
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      {evt.type === "purchase" && <ShoppingBag className="size-4" />}
                      {evt.type === "payment" && <CreditCard className="size-4" />}
                      {evt.type === "fulfillment" && <Truck className="size-4" />}
                      {evt.type === "comms" && <Mail className="size-4" />}
                      {evt.type === "review" && <Star className="size-4 fill-white" />}
                      {evt.type === "security" && <Shield className="size-4" />}
                      {evt.type === "support" && <MessageSquare className="size-4" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-foreground">{evt.title}</span>
                          {evt.code && (
                            <span className="font-mono text-[11px] font-bold text-indigo-600">
                              {evt.code}
                            </span>
                          )}
                          {evt.badgeText && (
                            <Badge variant={evt.badgeVariant || "secondary"} className="text-[10px] font-mono">
                              {evt.badgeText}
                            </Badge>
                          )}
                        </div>
                        <span className="font-mono text-[10.5px] text-muted-foreground whitespace-nowrap">
                          {evt.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {evt.description}
                      </p>

                      {/* Mini Product Payload Preview */}
                      {evt.productThumb && (
                        <div className="mt-2 flex items-center gap-3 rounded-lg border border-border/80 bg-muted/20 p-2 max-w-md">
                          <img
                            src={evt.productThumb.image}
                            alt={evt.productThumb.name}
                            className="size-10 rounded-md object-cover shrink-0 border border-border"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {evt.productThumb.name}
                            </span>
                            <span className="font-mono text-[10.5px] text-muted-foreground">
                              {evt.productThumb.sku} • Qty: {evt.productThumb.qty}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Review Quote Payload */}
                      {evt.reviewQuote && (
                        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200 italic">
                          "{evt.reviewQuote}"
                        </div>
                      )}

                      {/* Metadata tags */}
                      {evt.meta && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10.5px] text-muted-foreground">
                          {evt.meta.map((m, idx) => (
                            <span key={idx} className="bg-muted/40 px-1.5 py-0.5 rounded border border-border/60">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 2. Category Affinity & Purchasing Heatmap Bento */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <PieChart className="size-4 text-indigo-600" />
                      <span>Category Affinity &amp; Purchasing Cadence</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Historical allocation across 14 transactions totaling $4,280.00
                    </CardDescription>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-[10.5px] text-muted-foreground uppercase">
                      Repurchase Velocity
                    </div>
                    <div className="font-bold text-xs text-indigo-600">
                      Every 22 days avg
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Affinity Multi-Segment Bar */}
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
                    <div
                      className="bg-indigo-600 h-full transition-all"
                      style={{ width: "68%" }}
                      title="Mechanical Keyboards: 68%"
                    />
                    <div
                      className="bg-sky-500 h-full transition-all"
                      style={{ width: "22%" }}
                      title="Studio Audio Gear: 22%"
                    />
                    <div
                      className="bg-slate-400 h-full transition-all"
                      style={{ width: "10%" }}
                      title="Desk Ergonomics: 10%"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground truncate block">
                          Mechanical Keyboards
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          68% ($2,910.40)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-sky-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground truncate block">
                          Studio Audio Gear
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          22% ($941.60)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground truncate block">
                          Desk Ergonomics
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          10% ($428.00)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quarterly Order Frequency Visualization Bar Chart */}
                <div className="pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground pb-2">
                    <span className="uppercase font-semibold">QUARTERLY ORDER FREQUENCY (2023 - 2024)</span>
                    <span className="text-indigo-600 font-bold">Predictive Next Order: Nov 4-8</span>
                  </div>

                  <div className="w-full h-24 rounded-lg bg-muted/20 border border-border/60 p-2.5 flex items-end justify-between gap-2">
                    {[
                      { quarter: "Q1 '23", height: 35, orders: "1 order" },
                      { quarter: "Q2 '23", height: 48, orders: "2 orders" },
                      { quarter: "Q3 '23", height: 40, orders: "2 orders" },
                      { quarter: "Q4 '23", height: 60, orders: "3 orders" },
                      { quarter: "Q1 '24", height: 45, orders: "2 orders" },
                      { quarter: "Q2 '24", height: 55, orders: "2 orders" },
                      { quarter: "Q3 '24", height: 72, orders: "2 orders", current: true },
                    ].map((q) => (
                      <div key={q.quarter} className="flex-1 flex flex-col items-center gap-1 group">
                        <div
                          className={`w-full rounded-t transition-all ${
                            q.current
                              ? "bg-indigo-600"
                              : "bg-indigo-500/30 group-hover:bg-indigo-500/60"
                          }`}
                          style={{ height: `${q.height}px` }}
                          title={`${q.quarter}: ${q.orders}`}
                        />
                        <span
                          className={`font-mono text-[10px] ${
                            q.current ? "text-indigo-600 font-bold" : "text-muted-foreground"
                          }`}
                        >
                          {q.quarter}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RFM Triad breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase font-semibold">
                      Recency (R)
                    </div>
                    <div className="text-sm font-bold text-indigo-600 mt-0.5">Top 5%</div>
                    <div className="text-[11px] text-muted-foreground">Purchased today (ORD-10248)</div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase font-semibold">
                      Frequency (F)
                    </div>
                    <div className="text-sm font-bold text-indigo-600 mt-0.5">High (1.2/mo)</div>
                    <div className="text-[11px] text-muted-foreground">14 orders in 2.6 years</div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase font-semibold">
                      Monetary (M)
                    </div>
                    <div className="text-sm font-bold text-indigo-600 mt-0.5">$4,280.00</div>
                    <div className="text-[11px] text-muted-foreground">Platinum Buyer Tier</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Active & Recent Purchase Orders Table */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="size-4 text-indigo-600" />
                    <CardTitle className="text-sm font-bold text-foreground">
                      Recent Purchase Orders
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] font-mono font-semibold">
                      14 Lifetime Records
                    </Badge>
                  </div>

                  <Button
                    nativeButton={false}
                    render={<Link href="/orders" className="flex items-center gap-1" />}
                    variant="ghost"
                    size="xs"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>View all orders</span>
                    <ExternalLink className="size-3" />
                  </Button>
                </div>
              </CardHeader>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-mono uppercase text-[10.5px]">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Items</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {HISTORIC_ORDERS.slice(0, 4).map((ord) => (
                      <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-600">
                          {ord.id}
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">
                          {ord.date}
                        </td>
                        <td className="p-3">
                          <Badge variant={ord.statusVariant} className="text-[10px]">
                            {ord.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-foreground font-medium max-w-xs truncate">
                          {ord.itemsSummary}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-foreground">
                          {ord.totalAmount}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            nativeButton={false}
                            render={<Link href={`/orders`} />}
                            variant="ghost"
                            size="xs"
                            className="h-6 px-2 text-indigo-600 hover:text-indigo-700"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: 4 COLS (~35%) */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Customer Profile & Contact Details Card */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="p-4 pb-2.5 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-indigo-600" />
                    <span>Contact &amp; Legal Identity</span>
                  </CardTitle>
                  <Badge variant="success" className="text-[10px] font-mono">
                    Verified
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                {/* Email Box */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase font-semibold">
                    Primary Email
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-foreground truncate select-all">
                      david.m@example.com
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="text-muted-foreground hover:text-indigo-600 transition-colors p-1"
                      title="Copy Email"
                    >
                      {copiedEmail ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-600">
                    <CheckCircle2 className="size-3" />
                    <span>Google OAuth &amp; Workspace Verified</span>
                  </div>
                </div>

                {/* Phone Box */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase font-semibold">
                    Direct Phone
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground select-all">
                      +1 (555) 234-8921
                    </span>
                    <Badge variant="brand" className="text-[9px] font-mono">
                      SMS Opt-in
                    </Badge>
                  </div>
                </div>

                {/* Organization Box */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase font-semibold">
                    Billing Organization
                  </div>
                  <div className="font-semibold text-foreground">
                    Miller Architectural Studio LLC
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10.5px] text-muted-foreground pt-0.5">
                    <span>Tax-Exempt ID: NY-EX-992140</span>
                    <span className="text-emerald-600 font-bold">Active</span>
                  </div>
                </div>

                {/* Marketing Preferences */}
                <div className="pt-1 space-y-1.5">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase font-semibold">
                    Marketing Subscriptions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">
                      Email Newsletters ✓
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      SMS Alerts ✓
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      VIP Drops ✓
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Saved Payment Instruments & Store Credit */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="p-4 pb-2.5 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="size-3.5 text-indigo-600" />
                    <span>Billing &amp; Store Credit</span>
                  </CardTitle>
                  <Button
                    size="xs"
                    variant="outline"
                    className="h-6 px-2 text-indigo-600 font-semibold"
                    onClick={() => setStoreCreditModal(true)}
                  >
                    + Issue Credit
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                {/* Available Credit Box */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase font-semibold">
                      Available Store Credit
                    </div>
                    <div className="font-mono text-lg font-bold text-foreground">
                      ${currentCredit.toFixed(2)} USD
                    </div>
                  </div>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                    onClick={() => alert("Store credit audit log: 0 active claims.")}
                  >
                    Adjustment Log
                  </Button>
                </div>

                {/* Saved Payment Instruments */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded bg-card border border-border flex items-center justify-center font-mono font-bold text-[10px] text-indigo-600">
                        VISA
                      </div>
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          <span>Visa ending in 1092</span>
                          <Badge variant="brand" className="text-[9px] font-bold">
                            Default
                          </Badge>
                        </div>
                        <div className="font-mono text-[10.5px] text-muted-foreground">
                          Expires 08/2028 • Stripe Vault
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded bg-card border border-border flex items-center justify-center font-mono font-bold text-[10px] text-foreground">
                        Pay
                      </div>
                      <div>
                        <div className="font-bold text-foreground">Apple Pay Connected</div>
                        <div className="font-mono text-[10.5px] text-muted-foreground">
                          Mastercard •••• 4491
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Validated Shipping & Billing Addresses */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="p-4 pb-2.5 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-indigo-600" />
                    <span>Validated Addresses (2)</span>
                  </CardTitle>
                  <span className="font-mono text-[10.5px] text-emerald-600 font-semibold">
                    USPS CASS Validated
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand" className="text-[9px] font-bold uppercase">
                      Default Shipping &amp; Billing
                    </Badge>
                    <button className="text-muted-foreground hover:text-indigo-600">
                      <Edit className="size-3" />
                    </button>
                  </div>
                  <div className="text-foreground font-medium leading-relaxed">
                    David Miller<br />
                    Miller Architectural Studio LLC<br />
                    458 Atlantic Ave, Apt 3B<br />
                    Brooklyn, NY 11217-2804, United States
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground pt-1 flex items-center gap-1 border-t border-border/60">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    <span>Residential Delivery Indicator (RDI): Commercial Loft</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Internal Operations Pinned Notes */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="p-4 pb-2.5 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Pin className="size-3.5 text-amber-600" />
                    <span>Operations Pinned Notes</span>
                  </CardTitle>
                  <Badge variant="warning" className="text-[10px] font-mono">
                    {notes.length} Active
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                {notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-amber-200/80 bg-amber-50/40 p-3 space-y-1.5 dark:border-amber-900/40 dark:bg-amber-950/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Pin className="size-3 text-amber-600" />
                        <span className="font-bold text-foreground">Sarah Jenkins</span>
                        <span className="text-[10px] text-muted-foreground">• Operations Lead</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">Pinned</span>
                    </div>
                    <p className="text-foreground leading-relaxed">"{note}"</p>
                  </div>
                ))}

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2 pt-1">
                  <textarea
                    id="note-input-field"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add internal operational note (visible to staff only)..."
                    rows={2}
                    className="w-full rounded-md border border-border/80 bg-background p-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="xs"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-7 px-3"
                    >
                      Save Note
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 5. Security & Governance Card */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="p-4 pb-2.5 border-b border-border/60">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Shield className="size-3.5 text-indigo-600" />
                  <span>Security &amp; Governance</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 text-emerald-600" />
                      <span className="font-semibold text-foreground">Two-Factor Auth (2FA)</span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-600 font-bold">
                      TOTP Hardware Key
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Lock className="size-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">Device Trust Index</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-foreground">
                      99.8 / 100
                    </span>
                  </div>
                </div>

                {/* Privileged / Danger Zone Actions */}
                <div className="pt-2 border-t border-border/60 space-y-2">
                  <div className="font-mono text-[10px] text-rose-600 uppercase font-bold tracking-wider">
                    Privileged Actions
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    <Button
                      variant="outline"
                      size="xs"
                      className="justify-between text-xs font-medium h-7"
                      onClick={() => alert("Password reset token generated and dispatched via email.")}
                    >
                      <span>Force Password Reset</span>
                      <RotateCcw className="size-3 text-muted-foreground" />
                    </Button>

                    <Button
                      variant="outline"
                      size="xs"
                      className="justify-between text-xs font-medium h-7"
                      onClick={() => alert("Generating full GDPR compressed data archive...")}
                    >
                      <span>GDPR Data Archive / Export</span>
                      <Download className="size-3 text-muted-foreground" />
                    </Button>

                    <Button
                      variant="destructive"
                      size="xs"
                      className="justify-between text-xs font-semibold h-7 bg-rose-600 hover:bg-rose-500"
                      onClick={() => {
                        if (confirm("Are you sure you want to suspend David Miller's account?")) {
                          alert("Customer account marked as Suspended.")
                        }
                      }}
                    >
                      <span>Suspend Customer Account</span>
                      <Ban className="size-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 5. Tab Content: Orders History */}
      {activeTab === "orders" && (
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-4 sm:p-5 border-b border-border/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Complete Order History (14 Orders)
                </CardTitle>
                <CardDescription className="text-xs">
                  All lifetime commercial transactions settled with Miller Architectural Studio LLC
                </CardDescription>
              </div>
              <Button size="xs" variant="outline" className="gap-1.5 font-semibold text-xs h-7">
                <Download className="size-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-mono uppercase text-[10.5px]">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Line Items</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Tracking</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {HISTORIC_ORDERS.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-600">{ord.id}</td>
                    <td className="p-3 font-mono text-muted-foreground">{ord.date}</td>
                    <td className="p-3">
                      <Badge variant={ord.statusVariant} className="text-[10px]">
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium text-foreground max-w-sm truncate">
                      {ord.itemsSummary}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{ord.paymentMethod}</td>
                    <td className="p-3 font-mono text-indigo-600">{ord.trackingNumber || "—"}</td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      {ord.totalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 6. Tab Content: Payments & Billing */}
      {activeTab === "payments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="shadow-xs border-border/80">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground">
                Payment Gateways &amp; Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-foreground">Stripe Customer Vault</div>
                  <Badge variant="brand" className="text-[10px]">Primary Gateway</Badge>
                </div>
                <div className="font-mono text-muted-foreground text-[11px]">
                  Customer Vault ID: cus_N94821_Studio<br />
                  Fingerprint: fp_99214_NY_US
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-border/80">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground">
                Tax Exemption Certificate
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="font-bold">New York Resale &amp; Architectural Exemption</div>
                <div className="font-mono text-[11px]">NY-EX-992140 (Expires Dec 31, 2025)</div>
                <div className="text-[11px]">Auto-applied on all qualifying studio mechanical hardware line items.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 7. Tab Content: Reviews & Feedback */}
      {activeTab === "reviews" && (
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-4 sm:p-5 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground">
                Verified Customer Reviews (4 Reviews)
              </CardTitle>
              <div className="flex items-center gap-1 font-bold text-amber-600 font-mono text-xs">
                <span>5.0 / 5.0 Average (NPS: 10/10 Promoter)</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="p-3.5 rounded-lg border border-border/70 bg-card space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-foreground">Apex Pro Keyboard (TKL)</div>
                <div className="text-amber-500 font-mono">★★★★★ (5/5)</div>
              </div>
              <p className="text-muted-foreground italic leading-relaxed">
                "Best mechanical keyboard I have ever owned. The sound profile in our architecture studio is crisp and subdued. Client onboarding gift favorite."
              </p>
              <div className="font-mono text-[10px] text-muted-foreground pt-1">
                Reviewed on Sep 28, 2024 • Verified Purchase
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 8. Tab Content: Support Tickets */}
      {activeTab === "support" && (
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-4 sm:p-5 border-b border-border/60">
            <CardTitle className="text-sm font-bold text-foreground">
              Zendesk / Intercom Support Inquiries (2 Resolved)
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-mono uppercase text-[10.5px]">
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">First Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-indigo-600">TICK-4819</td>
                  <td className="p-3 font-mono text-muted-foreground">Aug 06, 2024</td>
                  <td className="p-3 font-semibold text-foreground">Custom Artisan Keycap Stem Compatibility</td>
                  <td className="p-3"><Badge variant="success" className="text-[10px]">Resolved</Badge></td>
                  <td className="p-3 font-mono text-muted-foreground">8 minutes</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-indigo-600">TICK-3102</td>
                  <td className="p-3 font-mono text-muted-foreground">Feb 12, 2024</td>
                  <td className="p-3 font-semibold text-foreground">FedEx Courier Hold at Location Request</td>
                  <td className="p-3"><Badge variant="success" className="text-[10px]">Resolved</Badge></td>
                  <td className="p-3 font-mono text-muted-foreground">11 minutes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Store Credit Modal */}
      {storeCreditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-5 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="font-bold text-sm text-foreground">Issue Store Credit</h3>
              <button
                type="button"
                onClick={() => setStoreCreditModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <label className="text-muted-foreground font-semibold">Credit Amount (USD)</label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="w-full rounded-md border border-border/80 bg-background p-2 font-mono text-sm text-foreground focus:border-indigo-500 focus:outline-hidden"
              />
              <p className="text-muted-foreground text-[11px]">
                Credit will be instantly applied to David Miller's ApexCommerce balance and notified via email.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="xs" variant="outline" onClick={() => setStoreCreditModal(false)}>
                Cancel
              </Button>
              <Button size="xs" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold" onClick={handleAddCredit}>
                Apply Credit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
