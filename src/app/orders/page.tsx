"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  Download,
  Plus,
  Bookmark,
  RotateCcw,
  Printer,
  PackageCheck,
  Pause,
  ExternalLink,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Truck,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
  AlertCircle,
  FileSpreadsheet,
  Ban,
  Radio,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OrderItem {
  name: string
  sku: string
  qty: number
  price: string
  image: string
}

interface Order {
  id: string
  date: string
  time: string
  customer: {
    name: string
    email: string
    location: string
    avatar?: string
    tier: string
    lifetimeValue: string
    priorOrders: number
    fraudRisk: string
    shippingAddress: {
      line1: string
      line2: string
      cityStateZip: string
      country: string
      uspsValidated: boolean
    }
  }
  itemsCount: number
  items: OrderItem[]
  payment: {
    status: "Paid: Stripe" | "Paid: PayPal" | "Paid: Apple Pay" | "Failed" | "Refunded"
    badgeVariant: "success" | "destructive" | "secondary" | "brand"
    subtotal: string
    shipping: string
    tax: string
    discount: string
    total: string
  }
  fulfillment: {
    status: "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled"
    badgeVariant: "brand" | "info" | "success" | "secondary" | "destructive"
  }
  progress: {
    stepsCompleted: number
    totalSteps: number
    steps: {
      title: string
      time: string
      detail: string
      completed: boolean
    }[]
    nextStep: {
      title: string
      estimate: string
    }
  }
}

const ORDERS_DATA: Order[] = [
  {
    id: "ORD-10248",
    date: "Oct 31, 2024",
    time: "14:23:08 EST",
    customer: {
      name: "David Miller",
      email: "david.m@example.com",
      location: "New York, US",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      tier: "Tier 1 Buyer",
      lifetimeValue: "$1,420.00",
      priorOrders: 4,
      fraudRisk: "0.02 (Low)",
      shippingAddress: {
        line1: "458 Atlantic Ave, Apt 3B",
        line2: "",
        cityStateZip: "Brooklyn, NY 11217",
        country: "United States",
        uspsValidated: true,
      },
    },
    itemsCount: 3,
    items: [
      {
        name: "Apex Pro Wireless Mouse",
        sku: "APX-MSE-BLK",
        qty: 1,
        price: "$149.00",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "Coiled Aviator Cable (Charcoal)",
        sku: "CBL-AVT-CHR",
        qty: 1,
        price: "$45.00",
        image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "Precision Felt Desk Pad (XL)",
        sku: "MAT-FLT-890",
        qty: 1,
        price: "$55.00",
        image: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Paid: Stripe",
      badgeVariant: "success",
      subtotal: "$249.00",
      shipping: "FREE",
      tax: "$0.00 (Exempt)",
      discount: "-$0.00",
      total: "$249.00",
    },
    fulfillment: {
      status: "Confirmed",
      badgeVariant: "brand",
    },
    progress: {
      stepsCompleted: 3,
      totalSteps: 5,
      steps: [
        {
          title: "Order created by David Miller",
          time: "14:23:08 EST",
          detail: "Channel: Web Storefront",
          completed: true,
        },
        {
          title: "Payment $249.00 captured",
          time: "14:23:12 EST",
          detail: "Stripe ch_3M4k9bL291k",
          completed: true,
        },
        {
          title: "Inventory reserved",
          time: "14:24:01 EST",
          detail: "Warehouse East-1 (Aisle 4B)",
          completed: true,
        },
      ],
      nextStep: {
        title: "Ready for Pick & Pack",
        estimate: "Estimated dispatch in 45 mins",
      },
    },
  },
  {
    id: "ORD-10247",
    date: "Oct 31, 2024",
    time: "14:05:19 EST",
    customer: {
      name: "Elena Rostova",
      email: "elena.r@techcorp.io",
      location: "London, UK",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      tier: "Enterprise VIP",
      lifetimeValue: "$4,890.00",
      priorOrders: 11,
      fraudRisk: "0.01 (Low)",
      shippingAddress: {
        line1: "12 Regent Street, Suite 400",
        line2: "",
        cityStateZip: "London, W1B 5AH",
        country: "United Kingdom",
        uspsValidated: true,
      },
    },
    itemsCount: 1,
    items: [
      {
        name: "Studio Display Monitor Stand (Dual)",
        sku: "MNT-DK-DUAL",
        qty: 1,
        price: "$1,199.00",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Paid: PayPal",
      badgeVariant: "success",
      subtotal: "$1,199.00",
      shipping: "FREE",
      tax: "$0.00",
      discount: "-$0.00",
      total: "$1,199.00",
    },
    fulfillment: {
      status: "Processing",
      badgeVariant: "brand",
    },
    progress: {
      stepsCompleted: 2,
      totalSteps: 5,
      steps: [
        {
          title: "Order created by Elena Rostova",
          time: "14:05:19 EST",
          detail: "Channel: Enterprise Portal",
          completed: true,
        },
        {
          title: "Payment $1,199.00 captured",
          time: "14:05:22 EST",
          detail: "PayPal TXN-940219",
          completed: true,
        },
      ],
      nextStep: {
        title: "Inventory Allocation in Progress",
        estimate: "Warehouse Central (Bay 2)",
      },
    },
  },
  {
    id: "ORD-10246",
    date: "Oct 31, 2024",
    time: "13:41:00 EST",
    customer: {
      name: "Marcus Chen",
      email: "mchen@acme.org",
      location: "SF, US",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      tier: "Tier 2 Buyer",
      lifetimeValue: "$620.00",
      priorOrders: 2,
      fraudRisk: "0.84 (High)",
      shippingAddress: {
        line1: "880 Market St, Floor 5",
        line2: "",
        cityStateZip: "San Francisco, CA 94102",
        country: "United States",
        uspsValidated: false,
      },
    },
    itemsCount: 5,
    items: [
      {
        name: "Ergonomic Mechanical Keyboard (RGB)",
        sku: "KB-MECH-RGB",
        qty: 1,
        price: "$342.50",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Failed",
      badgeVariant: "destructive",
      subtotal: "$342.50",
      shipping: "$15.00",
      tax: "$0.00",
      discount: "-$0.00",
      total: "$342.50",
    },
    fulfillment: {
      status: "Cancelled",
      badgeVariant: "secondary",
    },
    progress: {
      stepsCompleted: 1,
      totalSteps: 5,
      steps: [
        {
          title: "Order attempt initiated",
          time: "13:41:00 EST",
          detail: "Channel: Mobile App",
          completed: true,
        },
      ],
      nextStep: {
        title: "Awaiting customer payment retry",
        estimate: "Declined (insufficient funds)",
      },
    },
  },
  {
    id: "ORD-10245",
    date: "Oct 31, 2024",
    time: "12:15:42 EST",
    customer: {
      name: "Sarah Connor",
      email: "s.connor@sky.net",
      location: "Austin, US",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      tier: "Tier 1 Buyer",
      lifetimeValue: "$980.00",
      priorOrders: 5,
      fraudRisk: "0.03 (Low)",
      shippingAddress: {
        line1: "701 Brazos St",
        line2: "",
        cityStateZip: "Austin, TX 78701",
        country: "United States",
        uspsValidated: true,
      },
    },
    itemsCount: 2,
    items: [
      {
        name: "Custom Braided USB-C Cable",
        sku: "CBL-USBC-BRD",
        qty: 2,
        price: "$89.00",
        image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Paid: Stripe",
      badgeVariant: "success",
      subtotal: "$89.00",
      shipping: "FREE",
      tax: "$0.00",
      discount: "-$0.00",
      total: "$89.00",
    },
    fulfillment: {
      status: "Shipped",
      badgeVariant: "brand",
    },
    progress: {
      stepsCompleted: 4,
      totalSteps: 5,
      steps: [
        {
          title: "Order created",
          time: "12:15:42 EST",
          detail: "Channel: Web Storefront",
          completed: true,
        },
        {
          title: "Payment captured",
          time: "12:15:45 EST",
          detail: "Stripe ch_3N28kaL01a",
          completed: true,
        },
        {
          title: "Picked & Packed",
          time: "12:45:00 EST",
          detail: "Warehouse South-2",
          completed: true,
        },
        {
          title: "Handed to Courier (FedEx)",
          time: "13:20:10 EST",
          detail: "Tracking: 789218492019",
          completed: true,
        },
      ],
      nextStep: {
        title: "In Transit to Austin, TX",
        estimate: "Expected delivery Tomorrow",
      },
    },
  },
  {
    id: "ORD-10244",
    date: "Oct 31, 2024",
    time: "11:30:10 EST",
    customer: {
      name: "Liam Vance",
      email: "lvance@design.co",
      location: "Toronto, CA",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
      tier: "Tier 1 Buyer",
      lifetimeValue: "$2,100.00",
      priorOrders: 6,
      fraudRisk: "0.01 (Low)",
      shippingAddress: {
        line1: "150 King St West",
        line2: "Suite 1200",
        cityStateZip: "Toronto, ON M5H 1J9",
        country: "Canada",
        uspsValidated: true,
      },
    },
    itemsCount: 4,
    items: [
      {
        name: "Wireless Charging Desk Pad",
        sku: "PAD-WRLS-BLK",
        qty: 1,
        price: "$120.00",
        image: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "Ergonomic Palm Rest (Walnut)",
        sku: "WST-PLM-WLN",
        qty: 1,
        price: "$65.00",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "Monitor Light Bar (Pro)",
        sku: "LGT-BAR-PRO",
        qty: 1,
        price: "$265.00",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Paid: Apple Pay",
      badgeVariant: "success",
      subtotal: "$450.00",
      shipping: "FREE",
      tax: "$0.00",
      discount: "-$0.00",
      total: "$450.00",
    },
    fulfillment: {
      status: "Delivered",
      badgeVariant: "success",
    },
    progress: {
      stepsCompleted: 5,
      totalSteps: 5,
      steps: [
        {
          title: "Order created",
          time: "11:30:10 EST",
          detail: "Channel: iOS App",
          completed: true,
        },
        {
          title: "Payment captured",
          time: "11:30:12 EST",
          detail: "Apple Pay Token",
          completed: true,
        },
        {
          title: "Packed & Dispatched",
          time: "12:10:00 EST",
          detail: "Warehouse North-1",
          completed: true,
        },
        {
          title: "Out for Delivery",
          time: "14:15:00 EST",
          detail: "Courier: DHL Express",
          completed: true,
        },
        {
          title: "Delivered & Signed",
          time: "15:40:00 EST",
          detail: "Signed by Front Desk",
          completed: true,
        },
      ],
      nextStep: {
        title: "Order Completed",
        estimate: "Delivered Successfully",
      },
    },
  },
  {
    id: "ORD-10243",
    date: "Oct 31, 2024",
    time: "10:12:55 EST",
    customer: {
      name: "Amara Okafor",
      email: "amara.o@global.ng",
      location: "Lagos, NG",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      tier: "Global Buyer",
      lifetimeValue: "$780.00",
      priorOrders: 3,
      fraudRisk: "0.05 (Low)",
      shippingAddress: {
        line1: "42 Victoria Island Way",
        line2: "",
        cityStateZip: "Lagos, 101241",
        country: "Nigeria",
        uspsValidated: true,
      },
    },
    itemsCount: 2,
    items: [
      {
        name: "Ergonomic Keycap Set (Nordic)",
        sku: "APX-KC-NOR",
        qty: 1,
        price: "$85.00",
        image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Paid: Stripe",
      badgeVariant: "success",
      subtotal: "$85.00",
      shipping: "$25.00",
      tax: "$0.00",
      discount: "-$0.00",
      total: "$110.00",
    },
    fulfillment: {
      status: "Processing",
      badgeVariant: "brand",
    },
    progress: {
      stepsCompleted: 2,
      totalSteps: 5,
      steps: [
        {
          title: "Order created",
          time: "10:12:55 EST",
          detail: "Channel: Web Storefront",
          completed: true,
        },
        {
          title: "Payment captured",
          time: "10:12:58 EST",
          detail: "Stripe International",
          completed: true,
        },
      ],
      nextStep: {
        title: "Customs Manifest Generation",
        estimate: "Estimated 2 hours",
      },
    },
  },
  {
    id: "ORD-10242",
    date: "Oct 30, 2024",
    time: "19:44:22 EST",
    customer: {
      name: "Julian Beck",
      email: "j.beck@berlin.de",
      location: "Berlin, DE",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      tier: "Tier 1 Buyer",
      lifetimeValue: "$340.00",
      priorOrders: 1,
      fraudRisk: "0.02 (Low)",
      shippingAddress: {
        line1: "Friedrichstraße 44",
        line2: "",
        cityStateZip: "10117 Berlin",
        country: "Germany",
        uspsValidated: true,
      },
    },
    itemsCount: 1,
    items: [
      {
        name: "Apex Gaming Headset Stand",
        sku: "APX-HDS-STD",
        qty: 1,
        price: "$60.00",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=100&auto=format&fit=crop&q=80",
      },
    ],
    payment: {
      status: "Refunded",
      badgeVariant: "secondary",
      subtotal: "$60.00",
      shipping: "$10.00",
      tax: "$0.00",
      discount: "-$0.00",
      total: "$70.00",
    },
    fulfillment: {
      status: "Cancelled",
      badgeVariant: "secondary",
    },
    progress: {
      stepsCompleted: 1,
      totalSteps: 5,
      steps: [
        {
          title: "Order placed & cancelled by customer",
          time: "19:44:22 EST",
          detail: "Full refund issued via Stripe",
          completed: true,
        },
      ],
      nextStep: {
        title: "Refund Reconciled",
        estimate: "Settled",
      },
    },
  },
]

export default function OrdersPage() {
  const [activeTab, setActiveTab] = React.useState<"all" | "unfulfilled" | "failed" | "highValue">("all")
  const [selectedOrderIds, setSelectedOrderIds] = React.useState<string[]>(["ORD-10248", "ORD-10247"])
  const [inspectingOrderId, setInspectingOrderId] = React.useState<string | null>("ORD-10248")

  const inspectingOrder = React.useMemo(() => {
    return ORDERS_DATA.find((o) => o.id === inspectingOrderId) ?? ORDERS_DATA[0]
  }, [inspectingOrderId])

  const toggleSelectOrder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === ORDERS_DATA.length) {
      setSelectedOrderIds([])
    } else {
      setSelectedOrderIds(ORDERS_DATA.map((o) => o.id))
    }
  }

  const cumulativeValue = React.useMemo(() => {
    return ORDERS_DATA.filter((o) => selectedOrderIds.includes(o.id))
      .reduce((sum, o) => {
        const val = parseFloat(o.payment.total.replace(/[^0-9.-]+/g, "")) || 0
        return sum + val
      }, 0)
      .toLocaleString("en-US", { style: "currency", currency: "USD" })
  }, [selectedOrderIds])

  return (
    <div className="space-y-3.5">
      {/* 1. Page Header Bar */}
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Orders
          </h1>
          <Badge
            variant="outline"
            className="border-indigo-200/80 bg-indigo-50/70 font-mono text-[11px] font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
          >
            12,482 total orders
          </Badge>

          <div className="flex items-center gap-1.5 rounded-md border border-border/70 bg-card px-2.5 py-1 text-xs">
            <span className="size-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11.5px] font-medium text-foreground">
              Realtime stream active
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              defaultValue="ORD-1024"
              placeholder="Filter order ID..."
              className="h-8 w-full rounded-md border border-border/80 bg-card pl-8 pr-8 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/30"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/80 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌘F
            </kbd>
          </div>

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
            <span>Create Order</span>
          </Button>
        </div>
      </div>

      {/* 2. Filter Views Tab Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2 text-xs">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
            VIEWS:
          </span>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>All Live Orders</span>
            <span className="font-mono text-[10px] opacity-75">12,482</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unfulfilled")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === "unfulfilled"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="size-1.5 rounded-full bg-rose-500" />
            <span>Unfulfilled Urgent</span>
            <Badge variant="destructive" className="h-3.5 px-1 text-[9px] font-bold">
              14
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("failed")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === "failed"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Failed Payments Today</span>
            <Badge variant="destructive" className="h-3.5 px-1 text-[9px] font-bold">
              8
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("highValue")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === "highValue"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>High Value (&gt;$500)</span>
            <Badge variant="secondary" className="h-3.5 px-1 text-[9px] font-bold">
              42
            </Badge>
          </button>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <button type="button" className="flex items-center gap-1 hover:text-foreground">
            <Bookmark className="size-3.5" />
            <span>Save Filter View</span>
          </button>
          <span className="text-border">|</span>
          <button type="button" className="flex items-center gap-1 hover:text-foreground">
            <RotateCcw className="size-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* 3. Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-1 rounded-md border border-border/80 bg-card px-2.5 py-1 font-medium hover:bg-muted/40">
            <span>Fulfillment: <strong className="font-semibold text-indigo-600">Active (5)</strong></span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>

          <button className="flex items-center gap-1 rounded-md border border-border/80 bg-card px-2.5 py-1 font-medium hover:bg-muted/40">
            <span>Payment: <strong className="font-semibold text-foreground">All</strong></span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>

          <button className="flex items-center gap-1 rounded-md border border-border/80 bg-card px-2.5 py-1 font-medium hover:bg-muted/40">
            <span>Gateway: <strong className="font-semibold text-indigo-600">Stripe, PayPal</strong></span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>

          <button className="flex items-center gap-1 rounded-md border border-border/80 bg-card px-2.5 py-1 font-medium hover:bg-muted/40">
            <span>📅 Last 30 Days (Oct 1 - Oct 31, 2024)</span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>

          <button className="flex items-center gap-1 rounded-md border border-border/80 bg-card px-2.5 py-1 font-medium hover:bg-muted/40">
            <span>Amount: <strong className="font-semibold text-foreground">All Tiers</strong></span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>
        </div>

        {/* Active Filter Chips */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="flex items-center gap-1 rounded border border-border bg-muted/40 px-1.5 py-0.5 text-muted-foreground">
            Gateway: Stripe, PayPal <X className="size-2.5 cursor-pointer hover:text-foreground" />
          </span>
          <span className="flex items-center gap-1 rounded border border-border bg-muted/40 px-1.5 py-0.5 text-muted-foreground">
            Range: 30D <X className="size-2.5 cursor-pointer hover:text-foreground" />
          </span>
        </div>
      </div>

      {/* 4. Bulk Action Bar (When items are selected) */}
      {selectedOrderIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-indigo-900 bg-slate-900 px-3.5 py-2 text-white shadow-md text-xs">
          <div className="flex items-center gap-2">
            <span className="flex size-4 items-center justify-center rounded bg-indigo-600 text-white text-[10px]">
              ✓
            </span>
            <span className="font-bold">{selectedOrderIds.length} orders selected</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">
              Cumulative Value: <strong className="text-white font-mono">{cumulativeValue} USD</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="xs"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-1.5 h-7 px-2.5"
            >
              <Truck className="size-3.5" />
              <span>Mark as Shipped</span>
            </Button>

            <Button
              size="xs"
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white gap-1.5 h-7 px-2.5"
            >
              <Printer className="size-3.5" />
              <span>Print Packing Slips ({selectedOrderIds.length})</span>
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
              <span>Cancel Orders</span>
            </Button>

            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="rounded p-1 text-slate-400 hover:text-white"
              title="Clear selection"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Split View Layout: Table on Left + Order Inspector Drawer on Right */}
      <div className="grid gap-3.5 lg:grid-cols-12 items-start">
        {/* Orders Data Table */}
        <div className={`${inspectingOrderId ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-12"} space-y-3`}>
          <Card className="shadow-2xs border-border/70 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.length === ORDERS_DATA.length}
                        onChange={toggleSelectAll}
                        className="rounded border-border text-indigo-600 focus:ring-indigo-500 size-3.5 cursor-pointer"
                      />
                    </th>
                    <th className="p-3 font-bold">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                        <span>ORDER ID</span>
                        <ArrowUpDown className="size-3 text-muted-foreground" />
                      </div>
                    </th>
                    <th className="p-3 font-bold">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                        <span>DATE &amp; TIME</span>
                        <ChevronDown className="size-3 text-muted-foreground" />
                      </div>
                    </th>
                    <th className="p-3 font-bold">CUSTOMER</th>
                    <th className="p-3 font-bold">PAYMENT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-normal">
                  {ORDERS_DATA.map((order) => {
                    const isSelected = selectedOrderIds.includes(order.id)
                    const isInspected = inspectingOrderId === order.id

                    return (
                      <tr
                        key={order.id}
                        onClick={() => setInspectingOrderId(order.id)}
                        className={`cursor-pointer transition-colors ${
                          isInspected
                            ? "bg-indigo-50/70 dark:bg-indigo-950/40"
                            : isSelected
                            ? "bg-muted/40"
                            : "hover:bg-muted/20"
                        }`}
                      >
                        <td className="p-3" onClick={(e) => toggleSelectOrder(order.id, e)}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-border text-indigo-600 focus:ring-indigo-500 size-3.5 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {order.id}
                            </span>
                            {order.id === "ORD-10248" && (
                              <span className="size-1.5 rounded-full bg-indigo-600" />
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          <div className="text-foreground">{order.date}</div>
                          <div className="text-muted-foreground text-[10px]">{order.time}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-foreground text-xs">
                            {order.customer.name}
                          </div>
                          <div className="text-[10.5px] text-muted-foreground">
                            {order.customer.email} • {order.customer.location}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={order.payment.badgeVariant}
                            className="text-[10px] font-medium"
                          >
                            {order.payment.status}
                          </Badge>
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
                <strong className="text-foreground font-semibold">12,482</strong> orders
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span>Rows per page:</span>
                  <select className="rounded border border-border bg-card px-2 py-0.5 text-xs font-medium text-foreground">
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button className="flex size-7 items-center justify-center rounded border border-border bg-card hover:bg-muted text-muted-foreground">
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button className="flex size-7 items-center justify-center rounded bg-indigo-600 font-bold text-white text-xs">
                    1
                  </button>
                  <button className="flex size-7 items-center justify-center rounded border border-border bg-card hover:bg-muted text-muted-foreground">
                    2
                  </button>
                  <button className="flex size-7 items-center justify-center rounded border border-border bg-card hover:bg-muted text-muted-foreground">
                    3
                  </button>
                  <span className="px-1 text-muted-foreground">...</span>
                  <button className="flex size-7 items-center justify-center rounded border border-border bg-card hover:bg-muted text-muted-foreground">
                    500
                  </button>
                  <button className="flex size-7 items-center justify-center rounded border border-border bg-card hover:bg-muted text-muted-foreground">
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Order Inspector Panel */}
        {inspectingOrder && (
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <Card className="shadow-2xs border-border/70">
              {/* Inspector Header */}
              <CardHeader className="p-4 pb-3 border-b border-border/60">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-bold">
                      <Receipt className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-foreground">
                          {inspectingOrder.id}
                        </span>
                        <Badge variant="brand" className="text-[10px] font-semibold">
                          {inspectingOrder.fulfillment.status}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Placed {inspectingOrder.date} at {inspectingOrder.time.replace(" EST", " EST")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button className="rounded p-1 text-muted-foreground hover:text-foreground">
                      <ExternalLink className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setInspectingOrderId(null)}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Top Action Bar */}
                <div className="flex items-center gap-2 pt-3">
                  <Button
                    size="sm"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-8 gap-1.5"
                  >
                    <Printer className="size-3.5" />
                    <span>Print Label</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8 gap-1.5 border-border/80"
                  >
                    <RotateCcw className="size-3.5 text-muted-foreground" />
                    <span>Mark Processing</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="size-8 p-0 border-border/80 text-muted-foreground"
                  >
                    <Pause className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* 1. Order Progress Step Tracker */}
                <div className="space-y-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">Order Progress</span>
                    <span className="font-semibold text-indigo-600 text-[11px]">
                      {inspectingOrder.progress.stepsCompleted} of {inspectingOrder.progress.totalSteps} Steps Complete
                    </span>
                  </div>

                  <div className="space-y-2 text-xs pt-1">
                    {inspectingOrder.progress.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="size-3.5 text-indigo-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-foreground text-[11.5px]">{step.title}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {step.time} • {step.detail}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Next step */}
                    <div className="flex items-start gap-2 pt-1 border-t border-border/40 text-xs">
                      <Clock className="size-3.5 text-indigo-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-indigo-700 dark:text-indigo-400 text-[11.5px]">
                          Next: {inspectingOrder.progress.nextStep.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {inspectingOrder.progress.nextStep.estimate}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Customer Snapshot */}
                <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      CUSTOMER SNAPSHOT
                    </span>
                    <Badge variant="success" className="text-[9.5px] font-bold px-1.5 py-0">
                      {inspectingOrder.customer.tier}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8 rounded-full border border-border/80">
                      <AvatarImage src={inspectingOrder.customer.avatar} />
                      <AvatarFallback className="text-xs bg-indigo-50 text-indigo-700">
                        {inspectingOrder.customer.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <div className="font-bold text-xs text-foreground">
                        {inspectingOrder.customer.name}
                      </div>
                      <div className="text-[10.5px] text-muted-foreground font-mono">
                        {inspectingOrder.customer.email}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded border border-border/40 bg-card p-2 text-xs">
                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                        LIFETIME VALUE
                      </div>
                      <div className="font-bold text-foreground mt-0.5">
                        {inspectingOrder.customer.lifetimeValue}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {inspectingOrder.customer.priorOrders} prior orders
                      </div>
                    </div>
                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                        FRAUD RISK
                      </div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {inspectingOrder.customer.fraudRisk}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Stripe Radar Pass
                      </div>
                    </div>
                  </div>

                  {/* Shipping Destination */}
                  <div className="text-xs space-y-0.5 pt-1">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                      SHIPPING DESTINATION
                    </div>
                    <div className="font-medium text-foreground text-xs">
                      {inspectingOrder.customer.shippingAddress.line1}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      {inspectingOrder.customer.shippingAddress.cityStateZip}, {inspectingOrder.customer.shippingAddress.country}
                    </div>
                    {inspectingOrder.customer.shippingAddress.uspsValidated && (
                      <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-[10.5px] font-medium pt-0.5">
                        <CheckCircle2 className="size-3" />
                        <span>Address validated via USPS DB</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Line Items */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                      LINE ITEMS ({inspectingOrder.items.length})
                    </span>
                    <span className="text-[10.5px] font-mono text-muted-foreground">
                      Weight: 1.84 kg
                    </span>
                  </div>

                  <div className="divide-y divide-border/40">
                    {inspectingOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="size-9 rounded-md border border-border/80 object-cover bg-muted"
                          />
                          <div>
                            <div className="font-semibold text-foreground text-xs">
                              {item.name}
                            </div>
                            <div className="text-[10.5px] text-muted-foreground font-mono">
                              SKU: {item.sku} • Qty: {item.qty}
                            </div>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-foreground text-xs">
                          {item.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Financial Breakdown */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono text-foreground">{inspectingOrder.payment.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping (FedEx Ground 2-Day)</span>
                    <span className="font-mono text-emerald-600 font-semibold">{inspectingOrder.payment.shipping}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated NY State Tax</span>
                    <span className="font-mono text-foreground">{inspectingOrder.payment.tax}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount Applied (OCTOBER10)</span>
                    <span className="font-mono text-foreground">{inspectingOrder.payment.discount}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-bold text-foreground">
                    <span>Total Paid</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {inspectingOrder.payment.total} USD
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
