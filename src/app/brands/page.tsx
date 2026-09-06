"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShieldCheck,
  Store,
  Network,
  DollarSign,
  Download,
  SlidersHorizontal,
  Plus,
  Search,
  CheckCircle2,
  ChevronDown,
  X,
  Edit,
  ExternalLink,
  Layers,
  FileText,
  TrendingUp,
  Package,
  Award,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface BrandEntity {
  id: string
  code: string
  name: string
  monogram: string
  website: string
  vendorType: "1st Party Direct" | "3rd Party Vendor"
  skusCount: number
  gmv30d: string
  isDirect: boolean
  isVerified: boolean
  status: "Active" | "In Review" | "Suspended"
  category: "Keyboards" | "Audio" | "Ergonomics" | "Cables & Accs"
  targetMargin: string
  marginTier: string
  story: string
  topSkus: {
    name: string
    sku: string
    price: string
    revenue: string
    image: string
  }[]
}

const BRANDS_DATA: BrandEntity[] = [
  {
    id: "brand-apex",
    code: "APX-001",
    name: "Apex Hardware",
    monogram: "AH",
    website: "apex.internal",
    vendorType: "1st Party Direct",
    skusCount: 84,
    gmv30d: "$552,140",
    isDirect: true,
    isVerified: true,
    status: "Active",
    category: "Keyboards",
    targetMargin: "62.0%",
    marginTier: "Tier 1 Internal",
    story:
      "Precision-machined mechanical peripherals, high-frequency switches, and specialized desk ergonomics manufactured directly in-house under ApexCommerce core patents.",
    topSkus: [
      {
        name: "Apex Pro TKL Mechanical",
        sku: "APX-KB-01",
        price: "$189.00",
        revenue: "$142.8k",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "Apex Linear Switch (x110)",
        sku: "APX-SW-L1",
        price: "$54.00",
        revenue: "$98.2k",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "Stealth Aviator Coiled Cable",
        sku: "APX-CBL-09",
        price: "$32.00",
        revenue: "$41.5k",
        image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "brand-keychron",
    code: "V-8891",
    name: "Keychron Global",
    monogram: "KG",
    website: "keychron.com",
    vendorType: "3rd Party Vendor",
    skusCount: 142,
    gmv30d: "$248,200",
    isDirect: false,
    isVerified: true,
    status: "Active",
    category: "Keyboards",
    targetMargin: "38.5%",
    marginTier: "Tier 2 Wholesale",
    story:
      "Wireless mechanical keyboards compatible with Mac, Windows, and Linux. Premium wireless productivity tools for creators and engineers.",
    topSkus: [
      {
        name: "Keychron Q1 Pro Custom",
        sku: "KC-Q1-PRO",
        price: "$199.00",
        revenue: "$88.4k",
        image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "brand-gateron",
    code: "V-3021",
    name: "Gateron Switch Lab",
    monogram: "GS",
    website: "gateron.tech",
    vendorType: "3rd Party Vendor",
    skusCount: 65,
    gmv30d: "$184,900",
    isDirect: false,
    isVerified: true,
    status: "Active",
    category: "Keyboards",
    targetMargin: "45.0%",
    marginTier: "Tier 2 Wholesale",
    story:
      "World-class mechanical keyboard switch manufacturer producing ultra-smooth linear, tactile, and optical mechanical switches.",
    topSkus: [
      {
        name: "Gateron Oil King Switches (x90)",
        sku: "GAT-OIL-90",
        price: "$62.00",
        revenue: "$54.1k",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "brand-glorious",
    code: "V-1149",
    name: "Glorious PC Gaming",
    monogram: "GP",
    website: "gloriousgaming.com",
    vendorType: "3rd Party Vendor",
    skusCount: 39,
    gmv30d: "$112,400",
    isDirect: false,
    isVerified: true,
    status: "Active",
    category: "Ergonomics",
    targetMargin: "42.0%",
    marginTier: "Tier 2 Wholesale",
    story:
      "Modular mechanical keyboards, ultralight gaming mice, and premium ergonomic desk peripherals designed for competitive gamers.",
    topSkus: [
      {
        name: "Glorious GMMK Pro Barebones",
        sku: "GLR-GMMK-PRO",
        price: "$169.99",
        revenue: "$48.3k",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "brand-moondrop",
    code: "V-5092",
    name: "Moondrop Acoustic",
    monogram: "MA",
    website: "moondroplab.com",
    vendorType: "3rd Party Vendor",
    skusCount: 28,
    gmv30d: "$89,600",
    isDirect: false,
    isVerified: true,
    status: "Active",
    category: "Audio",
    targetMargin: "40.0%",
    marginTier: "Tier 3 Consignment",
    story:
      "Audiophile in-ear monitors, studio grade DACs, and dynamic planar headphones built with acoustic precision.",
    topSkus: [
      {
        name: "Moondrop Blessing 3 IEM",
        sku: "MD-BLS-03",
        price: "$319.99",
        revenue: "$38.2k",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "brand-wooting",
    code: "V-7801",
    name: "Wooting Ergonomics",
    monogram: "WE",
    website: "wooting.io",
    vendorType: "3rd Party Vendor",
    skusCount: 12,
    gmv30d: "$61,080",
    isDirect: false,
    isVerified: true,
    status: "Active",
    category: "Keyboards",
    targetMargin: "35.0%",
    marginTier: "Tier 3 Consignment",
    story:
      "Analog mechanical keyboards with Hall Effect magnetic switches for ultra-precise adjustable actuation.",
    topSkus: [
      {
        name: "Wooting 60HE+ Module",
        sku: "WT-60HE-MOD",
        price: "$175.00",
        revenue: "$32.9k",
        image: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
]

export default function BrandsPage() {
  const [selectedBrandId, setSelectedBrandId] = React.useState<string>("brand-apex")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "review" | "suspended">("all")
  const [isMapPolicyEnforced, setIsMapPolicyEnforced] = React.useState(true)

  const selectedBrand = React.useMemo(() => {
    return BRANDS_DATA.find((b) => b.id === selectedBrandId) ?? BRANDS_DATA[0]
  }, [selectedBrandId])

  const filteredBrands = React.useMemo(() => {
    return BRANDS_DATA.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat =
        activeCategory === "all" || b.category.toLowerCase().includes(activeCategory.toLowerCase())
      return matchSearch && matchCat
    })
  }, [searchQuery, activeCategory])

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Header Bar */}
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
            <span>Commerce</span>
            <span>&gt;</span>
            <span className="text-foreground font-semibold">Brands</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Brand Directory &amp; Vendor Management
            </h1>
            <Badge
              variant="outline"
              className="border-indigo-200/80 bg-indigo-50/70 font-mono text-[11px] font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              64 Registered Brands
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <span>Manage Vendor Tiers</span>
          </Button>

          <Button
            size="sm"
            className="h-8 gap-1.5 bg-indigo-600 px-3 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700"
          >
            <Plus className="size-3.5" />
            <span>Add Brand</span>
          </Button>
        </div>
      </div>

      {/* 2. Four KPI Metric Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* ACTIVE BRANDS */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                ACTIVE BRANDS
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <ShieldCheck className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground">64</span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                <TrendingUp className="size-3" /> +3 this quarter
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full w-full" />
            </div>
          </CardContent>
        </Card>

        {/* DIRECT MERCHANT BRANDS */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                DIRECT MERCHANT BRANDS
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Store className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground">18</span>
              <span className="text-xs text-muted-foreground">Private Label / 1st Party</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full w-[28%]" />
            </div>
          </CardContent>
        </Card>

        {/* 3RD-PARTY VENDORS */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                3RD-PARTY VENDORS
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                <Network className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground">46</span>
              <span className="text-xs text-muted-foreground">Consignment &amp; Wholesale</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-slate-700 dark:bg-slate-400 rounded-full w-[72%]" />
            </div>
          </CardContent>
        </Card>

        {/* BRAND GMV (30D) */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                BRAND GMV (30D)
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground">$1,248,320</span>
              <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                Apex HW: 44.2%
              </span>
            </div>
            <div className="flex h-1.5 w-full gap-1 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-l-full w-[44%]" />
              <div className="h-full bg-blue-500 w-[24%]" />
              <div className="h-full bg-slate-600 w-[18%]" />
              <div className="h-full bg-indigo-200 rounded-r-full w-[14%]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Split Screen (Left: Brands Directory Table | Right: Detailed Brand Inspector) */}
      <div className="grid gap-4 lg:grid-cols-12 items-start">
        {/* Left Column (7 Cols): Brands Directory Table */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="shadow-2xs border-border/70 overflow-hidden">
            {/* Filter Toolbar */}
            <div className="p-3.5 space-y-3 border-b border-border/60 bg-muted/10">
              {/* Search + Status Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search brands by name"
                    className="h-8 w-full rounded-md border border-border/80 bg-background pl-8 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
                  />
                  <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/80 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
                    ⌘F
                  </kbd>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                      statusFilter === "all"
                        ? "bg-card border border-border text-foreground font-bold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    58
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("review")}
                    className={`rounded-md px-2 py-1 text-xs flex items-center gap-1 transition-colors ${
                      statusFilter === "review"
                        ? "bg-card border border-border text-foreground font-bold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>In Review</span>
                    <Badge variant="secondary" className="h-3.5 px-1 text-[9px]">4</Badge>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("suspended")}
                    className={`rounded-md px-2 py-1 text-xs flex items-center gap-1 transition-colors ${
                      statusFilter === "suspended"
                        ? "bg-card border border-border text-foreground font-bold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>Suspended</span>
                    <Badge variant="destructive" className="h-3.5 px-1 text-[9px]">2</Badge>
                  </button>
                </div>
              </div>

              {/* Categories Tabs & Sort */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                    CATEGORIES:
                  </span>
                  {[
                    { id: "all", label: "All Categories" },
                    { id: "keyboards", label: "Keyboards" },
                    { id: "audio", label: "Audio" },
                    { id: "ergonomics", label: "Ergonomics" },
                    { id: "cables", label: "Cables & Accs" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveCategory(c.id)}
                      className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                        activeCategory === c.id
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>SORT:</span>
                  <button className="flex items-center gap-1 rounded border border-border/80 bg-card px-2 py-0.5 font-medium text-foreground">
                    <span>GMV (Highest first)</span>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-3 font-bold">BRAND</th>
                    <th className="p-3 font-bold">VENDOR TYPE</th>
                    <th className="p-3 font-bold text-center">PRODUCTS</th>
                    <th className="p-3 font-bold text-right">30D GMV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-normal">
                  {filteredBrands.map((brand) => {
                    const isSelected = selectedBrandId === brand.id

                    return (
                      <tr
                        key={brand.id}
                        onClick={() => setSelectedBrandId(brand.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-indigo-50/80 dark:bg-indigo-950/40"
                            : "hover:bg-muted/20"
                        }`}
                      >
                        {/* Brand Name & Monogram */}
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex size-8 items-center justify-center rounded-lg font-bold text-xs ${
                                brand.isDirect
                                  ? "bg-indigo-600 text-white shadow-2xs"
                                  : "bg-muted text-muted-foreground border border-border"
                              }`}
                            >
                              {brand.monogram}
                            </div>
                            <div>
                              <div className="flex items-center gap-1 font-bold text-foreground text-xs">
                                <span>{brand.name}</span>
                                {brand.isVerified && (
                                  <CheckCircle2 className="size-3 text-indigo-600 dark:text-indigo-400" />
                                )}
                              </div>
                              <div className="text-[10.5px] font-mono text-muted-foreground">
                                {brand.code} • {brand.website}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vendor Type Badge */}
                        <td className="p-3">
                          <Badge
                            variant={brand.isDirect ? "brand" : "secondary"}
                            className="text-[10px] font-medium gap-1"
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                brand.isDirect ? "bg-indigo-600" : "bg-slate-400"
                              }`}
                            />
                            <span>{brand.vendorType}</span>
                          </Badge>
                        </td>

                        {/* Products SKU Count */}
                        <td className="p-3 text-center">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {brand.skusCount} SKUs
                          </span>
                        </td>

                        {/* 30D GMV */}
                        <td className="p-3 text-right font-mono font-bold text-foreground">
                          {brand.gmv30d}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 p-3 text-xs bg-muted/10">
              <span className="text-muted-foreground">
                Showing 1 to 6 of 64 registered brand entities
              </span>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="xs" className="h-6 text-[11px] border-border/80">
                  Previous
                </Button>
                <button className="flex size-6 items-center justify-center rounded bg-indigo-600 font-bold text-white text-xs">
                  1
                </button>
                <button className="flex size-6 items-center justify-center rounded border border-border bg-card hover:bg-muted text-muted-foreground text-xs">
                  2
                </button>
                <button className="flex size-6 items-center justify-center rounded border border-border bg-card hover:bg-muted text-muted-foreground text-xs">
                  3
                </button>
                <Button variant="outline" size="xs" className="h-6 text-[11px] border-border/80">
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (5 Cols): Detailed Brand Inspector Panel */}
        <div className="lg:col-span-5 space-y-3">
          <Card className="shadow-2xs border-border/70 overflow-hidden">
            {/* Dark Brand Graphic Header Banner */}
            <div className="relative h-28 w-full bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-4 text-white flex flex-col justify-between overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-48 opacity-30 pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80"
                  alt="Pattern"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="font-mono font-black text-sm text-indigo-400 tracking-wider">
                    ⚡ APEX HARDWARE
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-black/40 p-1 text-slate-400 hover:text-white"
                  title="Close inspector"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <div className="relative z-10">
                <div className="text-xs font-bold uppercase tracking-wider text-white">
                  FLAGSHIP PRODUCT HUB
                </div>
                <div className="text-[10px] text-slate-300">
                  Streamline performance and vendor relations for {selectedBrand.name}.
                </div>
              </div>
            </div>

            {/* Profile Avatar & Header Identity */}
            <div className="p-4 pt-0 -mt-5 relative z-10 space-y-3.5">
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-lg border-2 border-background shadow-md">
                    {selectedBrand.monogram}
                  </div>
                  <div className="pt-4 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-bold text-foreground">
                        {selectedBrand.name}
                      </h2>
                      <CheckCircle2 className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-[10.5px] font-mono text-muted-foreground mt-0.5">
                      ID: {selectedBrand.code} • Primary Slug: /brands/{selectedBrand.name.toLowerCase().replace(/ /g, "-")}
                    </div>
                  </div>
                </div>

                <Badge variant="brand" className="text-[10px] font-semibold">
                  {selectedBrand.status}
                </Badge>
              </div>

              {/* Story & Positioning */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  STORY &amp; POSITIONING
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedBrand.story}
                </p>
              </div>

              {/* Two Metric Summary Boxes */}
              <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    TARGET MARGIN
                  </div>
                  <div className="text-lg font-black text-foreground mt-0.5">
                    {selectedBrand.targetMargin}
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-medium">
                    {selectedBrand.marginTier}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    30D VOLUME
                  </div>
                  <div className="text-lg font-black text-foreground mt-0.5">
                    {selectedBrand.gmv30d}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {selectedBrand.skusCount} Active SKUs
                  </div>
                </div>
              </div>

              {/* Policy & Commercial Terms */}
              <div className="space-y-2.5 rounded-lg border border-border/60 bg-muted/10 p-3 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  POLICY &amp; COMMERCIAL TERMS
                </div>

                {/* MAP Policy Enforcement Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground text-xs">
                      MAP Policy Enforcement
                    </div>
                    <div className="text-[10.5px] text-muted-foreground">
                      Automated repricing lock for authorized partners
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapPolicyEnforced(!isMapPolicyEnforced)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isMapPolicyEnforced ? "bg-indigo-600" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isMapPolicyEnforced ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Active Channels */}
                <div className="flex items-center justify-between border-t border-border/40 pt-2">
                  <div>
                    <div className="font-semibold text-foreground text-xs">Active Channels</div>
                    <div className="text-[10.5px] text-muted-foreground">
                      Online Webstore, Wholesale B2B, Kiosks
                    </div>
                  </div>
                  <Badge variant="brand" className="text-[10px] font-bold">
                    3 Active
                  </Badge>
                </div>
              </div>

              {/* Top Performing SKUs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    TOP PERFORMING SKUS
                  </span>
                  <Link
                    href="/products"
                    className="font-semibold text-indigo-600 hover:underline text-[11px]"
                  >
                    View All ({selectedBrand.skusCount})
                  </Link>
                </div>

                <div className="divide-y divide-border/40 rounded-lg border border-border/60 bg-card p-2">
                  {selectedBrand.topSkus.map((sku, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 text-xs first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={sku.image}
                          alt={sku.name}
                          className="size-8 rounded-md border border-border object-cover bg-muted"
                        />
                        <div>
                          <div className="font-semibold text-foreground text-xs">{sku.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            SKU: {sku.sku} • {sku.price}
                          </div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-foreground text-xs">
                        {sku.revenue}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Button
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-8 gap-1.5 shadow-2xs"
                >
                  <Edit className="size-3.5" />
                  <span>Edit Brand Settings</span>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 border-border/80"
                  >
                    <Package className="size-3.5 text-muted-foreground" />
                    <span>Products ({selectedBrand.skusCount})</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 border-border/80"
                  >
                    <FileText className="size-3.5 text-muted-foreground" />
                    <span>Contracts</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
