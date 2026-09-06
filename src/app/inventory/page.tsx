"use client"

import * as React from "react"
import Link from "next/link"
import {
  Boxes,
  Store,
  ShoppingBag,
  Lock,
  AlertTriangle,
  ArrowLeftRight,
  Truck,
  FileSpreadsheet,
  RotateCcw,
  Search,
  CheckCircle2,
  ChevronDown,
  X,
  Plus,
  Minus,
  Scale,
  ShieldCheck,
  History,
  Building2,
  Layers,
  ArrowRight,
  Sparkles,
  Barcode,
  Package,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface InventoryItem {
  id: string
  name: string
  variant: string
  sku: string
  barcode: string
  primaryBin: string
  badge?: string
  njStock: number
  caStock: number
  nlStock: number
  reserved: number
  available: number
  image?: string
  isLowStock?: boolean
  isOutOfStock?: boolean
}

const INVENTORY_DATA: InventoryItem[] = [
  {
    id: "inv-mouse",
    name: "Apex Pro Wireless Mouse",
    variant: "Matte Black",
    sku: "APX-MS-BLK",
    barcode: "8490192841",
    primaryBin: "4B-12",
    badge: "Flagship",
    njStock: 2,
    caStock: 2,
    nlStock: 0,
    reserved: 4,
    available: 0,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=80&auto=format&fit=crop&q=80",
    isOutOfStock: true,
  },
  {
    id: "inv-keyboard",
    name: "Apex Precision Keyboard",
    variant: "Tactile Brown",
    sku: "APX-KB-BLK-TAC",
    barcode: "8490192848",
    primaryBin: "2A-04",
    njStock: 120,
    caStock: 85,
    nlStock: 42,
    reserved: 38,
    available: 209,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&auto=format&fit=crop&q=80",
  },
  {
    id: "inv-mount",
    name: "Studio Monitor Desk Mount",
    variant: "Dual Articulating",
    sku: "MNT-DK-DUAL",
    barcode: "7728190012",
    primaryBin: "9C-01",
    njStock: 0,
    caStock: 0,
    nlStock: 0,
    reserved: 6,
    available: 0,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&auto=format&fit=crop&q=80",
    isOutOfStock: true,
  },
  {
    id: "inv-keycaps",
    name: "Ergonomic Keycap Set",
    variant: "Nordic Layout",
    sku: "APX-KC-NOR",
    barcode: "8490192899",
    primaryBin: "1D-08",
    njStock: 1,
    caStock: 1,
    nlStock: 0,
    reserved: 1,
    available: 1,
    image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=80&auto=format&fit=crop&q=80",
    isLowStock: true,
  },
  {
    id: "inv-cable",
    name: "Coiled Aviator Cable",
    variant: "Charcoal",
    sku: "CBL-AVT-CHR",
    barcode: "9910248817",
    primaryBin: "3B-09",
    njStock: 420,
    caStock: 310,
    nlStock: 180,
    reserved: 45,
    available: 865,
    image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=80&auto=format&fit=crop&q=80",
  },
  {
    id: "inv-deskpad",
    name: "Precision Felt Desk Pad",
    variant: "XL 900x400mm",
    sku: "MAT-FLT-090",
    barcode: "5540192301",
    primaryBin: "5A-11",
    njStock: 280,
    caStock: 195,
    nlStock: 110,
    reserved: 22,
    available: 563,
    image: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=80&auto=format&fit=crop&q=80",
  },
]

export default function InventoryPage() {
  const [selectedItemId, setSelectedItemId] = React.useState<string>("inv-mouse")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [warehouseFilter, setWarehouseFilter] = React.useState<"all" | "nj" | "ca" | "nl">("all")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "low" | "out">("all")
  const [operationMode, setOperationMode] = React.useState<"add" | "damage" | "reconcile" | "relocate">("add")
  const [targetHub, setTargetHub] = React.useState("nj")
  const [quantityDelta, setQuantityDelta] = React.useState("50")

  const selectedItem = React.useMemo(() => {
    return INVENTORY_DATA.find((item) => item.id === selectedItemId) ?? INVENTORY_DATA[0]
  }, [selectedItemId])

  const currentHubStock = React.useMemo(() => {
    if (targetHub === "nj") return selectedItem.njStock
    if (targetHub === "ca") return selectedItem.caStock
    if (targetHub === "nl") return selectedItem.nlStock
    return selectedItem.njStock
  }, [selectedItem, targetHub])

  const projectedStock = React.useMemo(() => {
    const delta = parseInt(quantityDelta) || 0
    if (operationMode === "add") return currentHubStock + delta
    if (operationMode === "damage") return Math.max(0, currentHubStock - delta)
    if (operationMode === "reconcile") return delta
    return currentHubStock
  }, [currentHubStock, quantityDelta, operationMode])

  const filteredItems = React.useMemo(() => {
    return INVENTORY_DATA.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode.includes(searchQuery)
      if (statusFilter === "low") return matchesSearch && item.isLowStock
      if (statusFilter === "out") return matchesSearch && item.isOutOfStock
      return matchesSearch
    })
  }, [searchQuery, statusFilter])

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Header Bar */}
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
            <span>Commerce</span>
            <span>&gt;</span>
            <span>Logistics &amp; Hubs</span>
            <span>&gt;</span>
            <span className="text-foreground font-semibold">Inventory Matrix</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Inventory Overview &amp; Stock Matrix
            </h1>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-md border border-border/70 bg-card px-2 py-0.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Sync: Hubs Online</span>
              </span>
              <Badge variant="warning" className="h-4.5 px-1.5 text-[9.5px] font-bold">
                • 3 Low Stock
              </Badge>
              <Badge variant="destructive" className="h-4.5 px-1.5 text-[9.5px] font-bold">
                • 2 Out of Stock
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-indigo-600 px-3 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700"
          >
            <ArrowLeftRight className="size-3.5" />
            <span>Adjust Stock</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <Truck className="size-3.5 text-muted-foreground" />
            <span>Transfer Hub</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <FileSpreadsheet className="size-3.5 text-muted-foreground" />
            <span>Stock Ledger</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <RotateCcw className="size-3.5 text-muted-foreground" />
            <span>Cycle Count Run</span>
          </Button>
        </div>
      </div>

      {/* 2. Five KPI Metric Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* ACTIVE MONITORED */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                ACTIVE MONITORED
              </span>
              <div className="flex size-6 items-center justify-center rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <Boxes className="size-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight text-foreground">1,842</span>
              <span className="text-xs text-muted-foreground">SKUs Active</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              +14 onboarded this week
            </div>
          </CardContent>
        </Card>

        {/* ON-HAND TOTAL STOCK */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                ON-HAND TOTAL STOCK
              </span>
              <div className="flex size-6 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Store className="size-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight text-foreground">48,290</span>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">$1.82M</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Asset Value across 3 hubs
            </div>
          </CardContent>
        </Card>

        {/* AVAILABLE TO SELL */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                AVAILABLE TO SELL
              </span>
              <div className="flex size-6 items-center justify-center rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <ShoppingBag className="size-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight text-foreground">44,120</span>
              <span className="text-xs font-bold text-emerald-600">91.3%</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Unconstrained sellable quota
            </div>
          </CardContent>
        </Card>

        {/* RESERVED IN ORDERS */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                RESERVED IN ORDERS
              </span>
              <div className="flex size-6 items-center justify-center rounded bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                <Lock className="size-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight text-foreground">4,170</span>
              <span className="text-xs text-muted-foreground">Pick &amp; Pack</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Avg dwell time: <strong className="font-semibold text-foreground">3.8 hrs</strong>
            </div>
          </CardContent>
        </Card>

        {/* CRITICAL REORDERS */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                CRITICAL REORDERS
              </span>
              <div className="flex size-6 items-center justify-center rounded bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <AlertTriangle className="size-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">5 SKUs</span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Immediate</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              3 Low threshold, 2 Stockouts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Warehouse Hub Tabs & View Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWarehouseFilter("all")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              warehouseFilter === "all"
                ? "bg-indigo-600 text-white shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>All Warehouses</span>
            <span className="ml-1.5 font-mono text-[10.5px] opacity-80">48,290</span>
          </button>

          <button
            type="button"
            onClick={() => setWarehouseFilter("nj")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              warehouseFilter === "nj"
                ? "bg-indigo-600 text-white shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>East Hub (NJ-01)</span>
            <span className="ml-1.5 font-mono text-[10.5px] opacity-80">24,100</span>
          </button>

          <button
            type="button"
            onClick={() => setWarehouseFilter("ca")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              warehouseFilter === "ca"
                ? "bg-indigo-600 text-white shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>West Hub (CA-02)</span>
            <span className="ml-1.5 font-mono text-[10.5px] opacity-80">16,800</span>
          </button>

          <button
            type="button"
            onClick={() => setWarehouseFilter("nl")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              warehouseFilter === "nl"
                ? "bg-indigo-600 text-white shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>EU Hub (NL-01)</span>
            <span className="ml-1.5 font-mono text-[10.5px] opacity-80">7,390</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>View:</span>
          <button className="font-semibold text-indigo-600 hover:underline">
            Standard Matrix
          </button>
          <span>•</span>
          <button className="hover:text-foreground flex items-center gap-1">
            <span>Density Compact</span>
            <Layers className="size-3" />
          </button>
        </div>
      </div>

      {/* 4. Search & Status Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, barcode, title"
            className="h-8 w-full rounded-md border border-border/80 bg-background pl-8 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/80 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
            ⌘F
          </kbd>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
              statusFilter === "all"
                ? "bg-card border border-border text-foreground font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Statuses (1,842)
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("low")}
            className={`rounded-md px-2.5 py-1 text-xs flex items-center gap-1 transition-colors ${
              statusFilter === "low"
                ? "bg-amber-50 text-amber-800 border border-amber-200 font-bold dark:bg-amber-950/40 dark:text-amber-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>Low Stock (3)</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("out")}
            className={`rounded-md px-2.5 py-1 text-xs flex items-center gap-1 transition-colors ${
              statusFilter === "out"
                ? "bg-rose-50 text-rose-800 border border-rose-200 font-bold dark:bg-rose-950/40 dark:text-rose-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="size-1.5 rounded-full bg-rose-500" />
            <span>Out of Stock (2)</span>
          </button>

          <button className="rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">
            Overstocked &gt;120d
          </button>

          <button className="rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">
            Reserved Heavy
          </button>
        </div>
      </div>

      {/* 5. Main Split Workspace (Left: Multi-Warehouse Matrix | Right: Stock Adjustment Drawer) */}
      <div className="grid gap-4 lg:grid-cols-12 items-start">
        {/* Left Column (7 Cols): Multi-Warehouse Stock Table */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="shadow-2xs border-border/70 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-3 font-bold">PRODUCT &amp; SKU INFO</th>
                    <th className="p-3 font-bold text-center">PRIMARY BIN</th>
                    <th className="p-3 font-bold text-center">NJ-01</th>
                    <th className="p-3 font-bold text-center">CA-02</th>
                    <th className="p-3 font-bold text-center">NL-01</th>
                    <th className="p-3 font-bold text-center">RESERVED</th>
                    <th className="p-3 font-bold text-right">AVAILABLE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-normal">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItemId === item.id

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-indigo-50/80 dark:bg-indigo-950/40"
                            : "hover:bg-muted/20"
                        }`}
                      >
                        {/* Product Info */}
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="size-8 rounded-md border border-border object-cover bg-muted shrink-0"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                                <span>{item.name}</span>
                                {item.badge && (
                                  <Badge variant="brand" className="text-[9px] font-bold px-1 py-0">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[10.5px] font-mono text-muted-foreground">
                                {item.variant} • <span className="text-indigo-600 dark:text-indigo-400">{item.sku}</span> • {item.barcode}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Primary Bin */}
                        <td className="p-3 text-center font-mono text-[11px] text-muted-foreground">
                          <span className="rounded bg-muted px-1.5 py-0.5">{item.primaryBin}</span>
                        </td>

                        {/* NJ-01 */}
                        <td className="p-3 text-center font-mono font-semibold">
                          <span className={item.njStock <= 2 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}>
                            {item.njStock}
                          </span>
                        </td>

                        {/* CA-02 */}
                        <td className="p-3 text-center font-mono font-semibold">
                          <span className={item.caStock <= 2 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}>
                            {item.caStock}
                          </span>
                        </td>

                        {/* NL-01 */}
                        <td className="p-3 text-center font-mono font-semibold">
                          <span className={item.nlStock === 0 ? "text-muted-foreground" : "text-foreground"}>
                            {item.nlStock}
                          </span>
                        </td>

                        {/* Reserved */}
                        <td className="p-3 text-center font-mono text-muted-foreground">
                          {item.reserved}
                        </td>

                        {/* Available */}
                        <td className="p-3 text-right font-mono font-bold">
                          <span className={item.available <= 1 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                            {item.available}
                          </span>
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
                Showing <strong className="text-foreground font-semibold">1 - 6</strong> of{" "}
                <strong className="text-foreground font-semibold">1,842</strong> products
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
                    74
                  </button>
                  <button className="flex size-6 items-center justify-center rounded border border-border bg-card text-muted-foreground">
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (5 Cols): Stock Adjustment & Ledger Inspector */}
        <div className="lg:col-span-5 space-y-3">
          <Card className="shadow-2xs border-border/70 overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    <Boxes className="size-3" />
                    <span>STOCK ADJUSTMENT &amp; LEDGER</span>
                  </div>
                  <h2 className="text-base font-bold text-foreground mt-0.5">
                    {selectedItem.name}
                  </h2>
                  <div className="text-[10.5px] font-mono text-muted-foreground">
                    {selectedItem.sku} • Bin: Aisle {selectedItem.primaryBin}
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* Top 3 Metric Summary Boxes */}
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-center">
                <div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    AVAILABLE
                  </div>
                  <div className={`text-base font-black mt-0.5 font-mono ${selectedItem.available === 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {selectedItem.available}
                  </div>
                </div>

                <div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    RESERVED
                  </div>
                  <div className="text-base font-black text-foreground mt-0.5 font-mono">
                    {selectedItem.reserved}
                  </div>
                </div>

                <div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    TOTAL UNITS
                  </div>
                  <div className="text-base font-black text-foreground mt-0.5 font-mono">
                    {selectedItem.njStock + selectedItem.caStock + selectedItem.nlStock}
                  </div>
                </div>
              </div>

              {/* Adjustment Operation Mode 4-Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  ADJUSTMENT OPERATION MODE
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOperationMode("add")}
                    className={`flex items-center justify-center gap-1.5 rounded-md border p-2 text-xs font-semibold transition-colors ${
                      operationMode === "add"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 shadow-2xs"
                        : "border-border/80 bg-card text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Plus className="size-3.5 text-indigo-600" />
                    <span>Add Stock (Receipt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOperationMode("damage")}
                    className={`flex items-center justify-center gap-1.5 rounded-md border p-2 text-xs font-semibold transition-colors ${
                      operationMode === "damage"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 shadow-2xs"
                        : "border-border/80 bg-card text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Minus className="size-3.5 text-rose-600" />
                    <span>Damage / Shrink</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOperationMode("reconcile")}
                    className={`flex items-center justify-center gap-1.5 rounded-md border p-2 text-xs font-semibold transition-colors ${
                      operationMode === "reconcile"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 shadow-2xs"
                        : "border-border/80 bg-card text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Scale className="size-3.5 text-muted-foreground" />
                    <span>Reconcile Count</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOperationMode("relocate")}
                    className={`flex items-center justify-center gap-1.5 rounded-md border p-2 text-xs font-semibold transition-colors ${
                      operationMode === "relocate"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 shadow-2xs"
                        : "border-border/80 bg-card text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <ArrowLeftRight className="size-3.5 text-muted-foreground" />
                    <span>Inter-Hub Relocate</span>
                  </button>
                </div>
              </div>

              {/* Target Warehouse Hub */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  TARGET WAREHOUSE HUB
                </span>
                <select
                  value={targetHub}
                  onChange={(e) => setTargetHub(e.target.value)}
                  className="h-8.5 w-full rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="nj">East Hub (NJ-01) — Current Stock: {selectedItem.njStock} units</option>
                  <option value="ca">West Hub (CA-02) — Current Stock: {selectedItem.caStock} units</option>
                  <option value="nl">EU Hub (NL-01) — Current Stock: {selectedItem.nlStock} units</option>
                </select>
              </div>

              {/* Quantity Delta + Calculation Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    QUANTITY DELTA
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">UOM: Discrete Units</span>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center rounded-lg border border-border/60 bg-muted/20 p-2">
                  <div className="col-span-5 flex items-center gap-1">
                    <input
                      type="number"
                      value={quantityDelta}
                      onChange={(e) => setQuantityDelta(e.target.value)}
                      className="h-8 w-16 rounded border border-border bg-card px-2 font-mono font-bold text-sm text-foreground"
                    />
                    <span className="font-semibold text-indigo-600 text-xs">+ Units</span>
                  </div>

                  <div className="col-span-7 flex items-center justify-end gap-2 text-xs font-mono">
                    <div className="text-center">
                      <div className="text-[9px] text-muted-foreground">CURRENT</div>
                      <div className="font-bold text-foreground">{currentHubStock}</div>
                    </div>
                    <ArrowRight className="size-3 text-muted-foreground" />
                    <div className="text-center">
                      <div className="text-[9px] text-muted-foreground">PROJECTED</div>
                      <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {projectedStock}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accounting Reason Code */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  ACCOUNTING &amp; AUDIT REASON CODE
                </span>
                <select className="h-8.5 w-full rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground focus:border-indigo-500 focus:outline-hidden">
                  <option>Supplier PO Inbound Receipt (PO-2024-8891)</option>
                  <option>Cycle Count Discrepancy Reconciliation</option>
                  <option>Damaged in Transit / Scrap Write-off</option>
                  <option>Customer Return Restock</option>
                </select>
              </div>

              {/* Reference PO & Bin Override */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    REFERENCE PO / TICKET
                  </span>
                  <input
                    type="text"
                    defaultValue="PO-2024-8891"
                    className="h-8 w-full rounded border border-border/80 bg-card px-2.5 font-mono text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    BIN OVERRIDE (OPTIONAL)
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. 4B-12"
                    className="h-8 w-full rounded border border-border/80 bg-card px-2.5 font-mono text-xs text-muted-foreground"
                  />
                </div>
              </div>

              {/* Confirm Button */}
              <div className="space-y-1.5 pt-1">
                <Button
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-8.5 gap-1.5 shadow-2xs"
                >
                  <ShieldCheck className="size-4" />
                  <span>Confirm &amp; Post Stock Adjustment</span>
                </Button>
                <div className="flex items-center justify-center gap-1 text-[10.5px] text-muted-foreground">
                  <ShieldCheck className="size-3 text-indigo-600" />
                  <span>Ledger entry is cryptographically signed by Sarah Jenkins</span>
                </div>
              </div>

              {/* Recent Ledger Trail */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    RECENT LEDGER TRAIL
                  </span>
                  <button type="button" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                    Full Trace ›
                  </button>
                </div>

                <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/10 p-2.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">Order Reserve #89210</div>
                      <div className="text-[10px] text-muted-foreground">Today, 11:24 AM • Auto System</div>
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400">-2 Units</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-1">
                    <div>
                      <div className="font-semibold text-foreground">Order Reserve #89204</div>
                      <div className="text-[10px] text-muted-foreground">Today, 09:12 AM • Auto System</div>
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400">-2 Units</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-1">
                    <div>
                      <div className="font-semibold text-foreground">Cycle Count Variance</div>
                      <div className="text-[10px] text-muted-foreground">Yesterday • Marcus Vance</div>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+8 Units</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 6. Global Warehouse Utilization & Node Health Footer Banner */}
      <Card className="shadow-2xs border-border/70 p-4 bg-card">
        <div className="grid gap-4 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shrink-0 shadow-sm">
              <Building2 className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Global Warehouse Utilization &amp; Node Health
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Calculated against cubic storage metrics, active pick lanes, and cross-docking availability.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 grid gap-3 sm:grid-cols-3 text-xs">
            {/* NJ-01 East */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">NJ-01 East</span>
                <span className="text-indigo-600 font-mono">82% Cap</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[82%]" />
              </div>
              <div className="text-[10.5px] font-mono text-muted-foreground">
                24,100 / 29,400 Units
              </div>
            </div>

            {/* CA-02 West */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">CA-02 West</span>
                <span className="text-indigo-600 font-mono">68% Cap</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[68%]" />
              </div>
              <div className="text-[10.5px] font-mono text-muted-foreground">
                16,800 / 24,700 Units
              </div>
            </div>

            {/* NL-01 EU */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">NL-01 EU</span>
                <span className="text-indigo-600 font-mono">41% Cap</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[41%]" />
              </div>
              <div className="text-[10.5px] font-mono text-muted-foreground">
                7,390 / 18,000 Units
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
