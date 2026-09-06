"use client"

import * as React from "react"
import Link from "next/link"
import {
  Layers,
  Network,
  Plus,
  ArrowUpDown,
  Download,
  Search,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  SlidersHorizontal,
  Headphones,
  Cable,
  Armchair,
  Gamepad2,
  Terminal,
  Cpu,
  Boxes,
  AlertTriangle,
  History,
  X,
  Sparkles,
  GripVertical,
  Sliders,
  FolderTree,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface TreeNode {
  id: string
  name: string
  skus: number
  level: number
  icon: any
  statusDot?: string
  badge?: string
  badgeVariant?: "brand" | "secondary" | "warning"
  children?: TreeNode[]
  defaultOpen?: boolean
}

export default function CategoriesPage() {
  const [selectedNodeId, setSelectedNodeId] = React.useState<string>("node-mech-kb")
  const [activeTab, setActiveTab] = React.useState<"general" | "products" | "subcategories" | "facets">("general")
  const [isPublished, setIsPublished] = React.useState(true)
  const [copiedSlug, setCopiedSlug] = React.useState(false)
  const [filterQuery, setFilterQuery] = React.useState("")

  // Form state for the active node
  const [displayName, setDisplayName] = React.useState("Mechanical Keyboards")
  const [parentNode, setParentNode] = React.useState("Electronics & Hardware (Root L1)")
  const [description, setDescription] = React.useState(
    "High-end enthusiast mechanical keyboard barebones, switches, fully assembled custom decks, and hot-swap PCB assemblies configured for typing precision and low-latency operation."
  )

  // Facets
  const [facets, setFacets] = React.useState([
    "Switch Type (Tactile, Linear, Clicky)",
    "Layout Form Factor (65%, 75%, TKL, Full)",
    "Hot-Swappable PCB (Yes, Soldered)",
    "Connectivity (2.4G, Bluetooth 5.2, USB-C)",
    "RGB Backlight (Per-key, Underglow, None)",
  ])

  // Tree expanded state
  const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({
    "root-electronics": true,
    "node-mech-kb": true,
  })

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("https://apexcommerce.io/c/electronics/keyboards/mechanical")
    setCopiedSlug(true)
    setTimeout(() => setCopiedSlug(false), 2000)
  }

  const handleRemoveFacet = (facetToRemove: string) => {
    setFacets(facets.filter((f) => f !== facetToRemove))
  }

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Header Bar */}
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Categories &amp; Taxonomy
            </h1>
            <Badge
              variant="outline"
              className="border-indigo-200/80 bg-indigo-50/70 font-mono text-[11px] font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              38 Active Taxonomies
            </Badge>

            <div className="flex items-center gap-1.5 rounded-md border border-border/70 bg-card px-2.5 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-[11px]">Multi-channel sync: 2m ago</span>
            </div>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Manage global product classification, storefront navigational hierarchies, facet inheritance, and omni-channel mapping rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <span>Reorder Tree</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export JSON/CSV</span>
          </Button>

          <Button
            size="sm"
            className="h-8 gap-1.5 bg-indigo-600 px-3 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700"
          >
            <Plus className="size-3.5" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* 2. Four KPI Metric Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL CATEGORIES */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                TOTAL CATEGORIES
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <FolderTree className="size-4" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight text-foreground">42</span>
              <span className="text-xs font-medium text-muted-foreground font-mono">taxa</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-indigo-600" />
                <strong className="text-foreground">38</strong> Published
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-slate-400" />
                <strong className="text-foreground">4</strong> Draft
              </span>
            </div>
          </CardContent>
        </Card>

        {/* DEEPEST LEVEL */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                DEEPEST LEVEL
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Layers className="size-4" />
              </div>
            </div>
            <div className="mt-1 text-2xl font-black tracking-tight text-foreground">
              4 Levels
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Max tree limit: 6 levels</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">66% Utilized</span>
            </div>
          </CardContent>
        </Card>

        {/* UNCATEGORIZED SKUS */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                UNCATEGORIZED SKUS
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <AlertTriangle className="size-4" />
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground">14</span>
              <Badge variant="destructive" className="h-4.5 px-1.5 text-[9.5px] font-bold">
                Urgent Triage
              </Badge>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Imports pending mapping</span>
              <Link href="/products" className="font-semibold text-indigo-600 hover:underline">
                Assign →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* CHANNEL COVERAGE */}
        <Card className="shadow-2xs border-border/70">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                CHANNEL COVERAGE
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                <Network className="size-4" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight text-foreground">92.3%</span>
              <span className="text-xs text-muted-foreground">Weighted</span>
            </div>
            {/* 3 mini boxes */}
            <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px] font-mono">
              <div className="rounded bg-indigo-50/70 p-1 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                <div className="text-[9px] text-muted-foreground">WEB</div>
                <div className="font-bold">100%</div>
              </div>
              <div className="rounded bg-indigo-50/70 p-1 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                <div className="text-[9px] text-muted-foreground">B2B</div>
                <div className="font-bold">92%</div>
              </div>
              <div className="rounded bg-indigo-50/70 p-1 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                <div className="text-[9px] text-muted-foreground">POS</div>
                <div className="font-bold">85%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Split-View Workspace */}
      <div className="grid gap-4 lg:grid-cols-12 items-start">
        {/* Left Column (5 Cols): Taxonomy Tree */}
        <Card className="lg:col-span-5 shadow-2xs border-border/70 flex flex-col justify-between">
          <CardHeader className="p-3.5 pb-2.5 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold">Taxonomy Tree</CardTitle>
                <Badge
                  variant="secondary"
                  className="font-mono text-[9.5px] font-medium text-muted-foreground"
                >
                  Root Nodes: 4
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground">
                <button
                  type="button"
                  title="Expand/Collapse All"
                  className="rounded p-1 hover:bg-muted hover:text-foreground"
                >
                  <ArrowUpDown className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Input */}
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter taxonomy by name or SKU count..."
                className="h-8 w-full rounded-md border border-border/80 bg-background pl-8 pr-8 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/80 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
                ⌘F
              </kbd>
            </div>
          </CardHeader>

          <CardContent className="p-2 space-y-1 text-xs">
            {/* Tree Node 1: Electronics & Hardware (Root, Expanded) */}
            <div className="space-y-0.5">
              <div
                onClick={() => setSelectedNodeId("root-electronics")}
                className={`flex items-center justify-between rounded-md p-1.5 cursor-pointer transition-colors ${
                  selectedNodeId === "root-electronics"
                    ? "bg-indigo-50/70 text-indigo-700 font-semibold dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "hover:bg-muted/40 text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => toggleExpand("root-electronics", e)}
                    className="p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    {expandedNodes["root-electronics"] ? (
                      <ChevronDown className="size-3.5" />
                    ) : (
                      <ChevronRight className="size-3.5" />
                    )}
                  </button>
                  <Cpu className="size-4 text-indigo-600" />
                  <span className="font-semibold text-xs">Electronics &amp; Hardware</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
                  <span className="rounded bg-muted px-1 py-0.2 text-muted-foreground">1,420 SKUs</span>
                  <span className="size-1.5 rounded-full bg-indigo-600" />
                </div>
              </div>

              {/* Child Nodes of Electronics */}
              {expandedNodes["root-electronics"] && (
                <div className="ml-5 pl-2 border-l border-border/70 space-y-1 pt-1">
                  {/* Selected Node: Mechanical Keyboards */}
                  <div className="space-y-0.5">
                    <div
                      onClick={() => setSelectedNodeId("node-mech-kb")}
                      className={`flex items-center justify-between rounded-md p-1.5 cursor-pointer transition-colors ${
                        selectedNodeId === "node-mech-kb"
                          ? "bg-indigo-100/80 text-indigo-900 font-bold dark:bg-indigo-900/60 dark:text-indigo-100 shadow-2xs"
                          : "hover:bg-muted/40 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => toggleExpand("node-mech-kb", e)}
                          className="p-0.5 text-muted-foreground hover:text-foreground"
                        >
                          {expandedNodes["node-mech-kb"] ? (
                            <ChevronDown className="size-3" />
                          ) : (
                            <ChevronRight className="size-3" />
                          )}
                        </button>
                        <Boxes className="size-3.5 text-indigo-600" />
                        <span className="text-xs font-bold">Mechanical Keyboards</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">480 SKUs</span>
                        <Badge className="bg-indigo-600 text-white text-[8.5px] font-bold px-1 py-0">
                          ACTIVE
                        </Badge>
                        <button
                          type="button"
                          className="rounded p-0.5 text-indigo-600 hover:bg-indigo-200/50"
                          title="Add subcategory"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Sub-sub categories */}
                    {expandedNodes["node-mech-kb"] && (
                      <div className="ml-5 pl-2 border-l border-border/60 space-y-1 pt-0.5">
                        <div className="flex items-center justify-between rounded p-1 text-[11.5px] text-muted-foreground hover:bg-muted/30 cursor-pointer">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground font-mono">↳</span>
                            <Sparkles className="size-3 text-muted-foreground" />
                            <span>Custom Keycaps</span>
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">142 SKUs</span>
                        </div>

                        <div className="flex items-center justify-between rounded p-1 text-[11.5px] text-muted-foreground hover:bg-muted/30 cursor-pointer">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground font-mono">↳</span>
                            <SlidersHorizontal className="size-3 text-muted-foreground" />
                            <span>Switches &amp; Stabilizers</span>
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">210 SKUs</span>
                        </div>

                        <div className="flex items-center justify-between rounded p-1 text-[11.5px] text-muted-foreground hover:bg-muted/30 cursor-pointer">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground font-mono">↳</span>
                            <Sliders className="size-3 text-muted-foreground" />
                            <span>Barebones Kits</span>
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">128 SKUs</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Node: Studio Audio & Monitoring */}
                  <div
                    onClick={() => setSelectedNodeId("node-audio")}
                    className={`flex items-center justify-between rounded-md p-1.5 cursor-pointer transition-colors ${
                      selectedNodeId === "node-audio"
                        ? "bg-indigo-50/70 text-indigo-700 font-semibold"
                        : "hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground" />
                      <Headphones className="size-3.5 text-muted-foreground" />
                      <span className="text-xs">Studio Audio &amp; Monitoring</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">310 SKUs</span>
                  </div>

                  {/* Node: Cables & Desk Accessories */}
                  <div
                    onClick={() => setSelectedNodeId("node-cables")}
                    className={`flex items-center justify-between rounded-md p-1.5 cursor-pointer transition-colors ${
                      selectedNodeId === "node-cables"
                        ? "bg-indigo-50/70 text-indigo-700 font-semibold"
                        : "hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground" />
                      <Cable className="size-3.5 text-muted-foreground" />
                      <span className="text-xs">Cables &amp; Desk Accessories</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">630 SKUs</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tree Node 2: Office Ergonomics & Furniture */}
            <div
              onClick={() => setSelectedNodeId("root-furniture")}
              className={`flex items-center justify-between rounded-md p-1.5 cursor-pointer transition-colors ${
                selectedNodeId === "root-furniture"
                  ? "bg-indigo-50/70 text-indigo-700 font-semibold"
                  : "hover:bg-muted/40 text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5 text-muted-foreground" />
                <Armchair className="size-4 text-muted-foreground" />
                <span className="font-medium text-xs">Office Ergonomics &amp; Furniture</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
                <span className="rounded bg-muted px-1 py-0.2 text-muted-foreground">380 SKUs</span>
                <span className="size-1.5 rounded-full bg-indigo-600" />
              </div>
            </div>

            {/* Tree Node 3: Gaming & Performance Gear */}
            <div
              onClick={() => setSelectedNodeId("root-gaming")}
              className={`flex items-center justify-between rounded-md p-1.5 cursor-pointer transition-colors ${
                selectedNodeId === "root-gaming"
                  ? "bg-indigo-50/70 text-indigo-700 font-semibold"
                  : "hover:bg-muted/40 text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5 text-muted-foreground" />
                <Gamepad2 className="size-4 text-muted-foreground" />
                <span className="font-medium text-xs">Gaming &amp; Performance Gear</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
                <span className="rounded bg-muted px-1 py-0.2 text-muted-foreground">790 SKUs</span>
                <span className="size-1.5 rounded-full bg-indigo-600" />
              </div>
            </div>

            {/* Tree Node 4: Software & Firmware Tools */}
            <div
              onClick={() => setSelectedNodeId("root-software")}
              className={`flex items-center justify-between rounded-md p-1.5 cursor-pointer transition-colors ${
                selectedNodeId === "root-software"
                  ? "bg-indigo-50/70 text-indigo-700 font-semibold"
                  : "hover:bg-muted/40 text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5 text-muted-foreground" />
                <Terminal className="size-4 text-muted-foreground" />
                <span className="font-medium text-xs">Software &amp; Firmware Tools</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
                <span className="rounded bg-muted px-1 py-0.2 text-muted-foreground">45 SKUs</span>
                <Badge variant="secondary" className="text-[8.5px] font-bold px-1 py-0">
                  POS ONLY
                </Badge>
              </div>
            </div>
          </CardContent>

          {/* Footer Drag indicator */}
          <div className="border-t border-border/60 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between bg-muted/10">
            <div className="flex items-center gap-1.5">
              <GripVertical className="size-3.5" />
              <span>Drag handles to reorder parent/child links</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-600 font-medium">Auto-saved</span>
          </div>
        </Card>

        {/* Right Column (7 Cols): Node Inspector & General Configuration */}
        <Card className="lg:col-span-7 shadow-2xs border-border/70 flex flex-col justify-between">
          {/* Header of Inspector */}
          <CardHeader className="p-4 pb-3 border-b border-border/60">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  LEVEL 2 NODE • UUID: 8f9b20e1-kb
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">
                    {displayName}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mt-1">
                  <span>🔗 apexcommerce.io/c/electronics/keyboards/mechanical</span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="rounded p-0.5 hover:bg-muted hover:text-foreground"
                    title="Copy URL"
                  >
                    {copiedSlug ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action buttons & publish toggle */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="text-muted-foreground">Published</span>
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isPublished ? "bg-indigo-600" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isPublished ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="xs"
                  className="h-7 text-xs border-border/80"
                >
                  Discard
                </Button>

                <Button
                  size="xs"
                  className="h-7 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-2.5 shadow-2xs gap-1"
                >
                  <Check className="size-3" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </div>

            {/* Tabs Row */}
            <div className="flex flex-wrap items-center gap-1 border-t border-border/60 pt-2.5 mt-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  activeTab === "general"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                General &amp; SEO
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === "products"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Assigned Products (480)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("subcategories")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === "subcategories"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Subcategories (3)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("facets")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === "facets"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Channel Facets &amp; Rules
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Section 1: General Taxonomy Configuration */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                <span className="text-indigo-600">ⓘ</span>
                <span>General Taxonomy Configuration</span>
              </div>

              {/* Display Name & Parent Node */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Category Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-8.5 w-full rounded-md border border-border/80 bg-background px-3 text-xs font-medium text-foreground focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Parent Category Node
                  </label>
                  <select
                    value={parentNode}
                    onChange={(e) => setParentNode(e.target.value)}
                    className="h-8.5 w-full rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option>Electronics &amp; Hardware (Root L1)</option>
                    <option>Office Ergonomics &amp; Furniture (Root L1)</option>
                    <option>Gaming &amp; Performance Gear (Root L1)</option>
                    <option>None (Top Level Root)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Description (Storefront Collection Summary)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-border/80 bg-background p-2.5 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Taxonomy Banner Asset */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Taxonomy Banner Asset
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card p-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=160&auto=format&fit=crop&q=80"
                      alt="Banner Asset"
                      className="h-12 w-20 rounded-md border border-border object-cover bg-muted"
                    />
                    <div className="leading-tight">
                      <div className="font-mono font-medium text-xs text-foreground">
                        mech-keyboards-taxonomy-banner.webp
                      </div>
                      <div className="text-[10.5px] font-mono text-muted-foreground mt-0.5">
                        1200 × 480 px • 84 KB WebP
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-7 text-xs border-border/80"
                    >
                      Replace
                    </Button>
                    <button
                      type="button"
                      className="rounded p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete banner"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Inherited Storefront Facets */}
            <div className="space-y-2.5 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                    <Sliders className="size-3.5 text-indigo-600" />
                    <span>Inherited Storefront Facets</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Facets exposed to storefront customers when browsing this category and child branches.
                  </p>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  <Plus className="size-3.5" />
                  <span>Attach Facet</span>
                </button>
              </div>

              {/* Facet Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {facets.map((facet) => (
                  <Badge
                    key={facet}
                    variant="brand"
                    className="gap-1.5 px-2.5 py-1 text-xs font-medium font-sans"
                  >
                    <span>{facet}</span>
                    <X
                      onClick={() => handleRemoveFacet(facet)}
                      className="size-3 cursor-pointer text-indigo-600 hover:text-indigo-950 dark:text-indigo-300"
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>

          {/* Footer Metadata */}
          <div className="border-t border-border/60 p-3 text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2 bg-muted/10">
            <div className="flex flex-wrap items-center gap-2 font-mono">
              <span>
                Author: <strong className="text-foreground">Sarah Jenkins</strong>
              </span>
              <span>•</span>
              <span>Modified: Today at 14:22 EST</span>
              <span>•</span>
              <span>Version: v3.12</span>
            </div>

            <button
              type="button"
              className="flex items-center gap-1 font-medium text-indigo-600 hover:underline"
            >
              <History className="size-3.5" />
              <span>Audit Changelog (24 events)</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
