"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sparkles,
  Save,
  Trash2,
  Rocket,
  Edit3,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Table,
  Code,
  Image as ImageIcon,
  Link2,
  UploadCloud,
  Layers,
  ChevronDown,
  Plus,
  X,
  RotateCcw,
  Check,
  Globe,
  Tag,
  Package,
  Sliders,
  DollarSign,
  Boxes,
  Truck,
  HelpCircle,
  GripVertical,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface VariantRow {
  id: string
  color: string
  colorDot: string
  switchType: string
  sku: string
  barcode: string
  price: string
  stock: number
  enabled: boolean
}

export default function ProductMatrixPage() {
  const [productTitle, setProductTitle] = React.useState("Apex Precision Mechanical Keyboard")
  const [slug, setSlug] = React.useState("apex-precision-mechanical-keyboard")
  const [isEditingSlug, setIsEditingSlug] = React.useState(false)
  const [activeEditorTab, setActiveEditorTab] = React.useState<"rich" | "markdown">("rich")
  const [publishStatus, setPublishStatus] = React.useState<"draft" | "active" | "archived">("draft")

  // Color option chips
  const [colorOptions, setColorOptions] = React.useState([
    { label: "Matte Black", dot: "#1e293b" },
    { label: "Chalk White", dot: "#f8fafc" },
    { label: "Midnight Navy", dot: "#1e3a8a" },
  ])

  // Switch type option chips
  const [switchOptions, setSwitchOptions] = React.useState([
    { label: "Tactile Brown", dot: "#78350f" },
    { label: "Linear Red", dot: "#dc2626" },
    { label: "Clicky Blue", dot: "#2563eb" },
  ])

  // Bulk modifiers
  const [bulkPriceInput, setBulkPriceInput] = React.useState("189.00")
  const [bulkStockInput, setBulkStockInput] = React.useState("50")

  // Variant table rows
  const [variants, setVariants] = React.useState<VariantRow[]>([
    {
      id: "v1",
      color: "Matte Black",
      colorDot: "#1e293b",
      switchType: "Tactile Brown",
      sku: "APX-KB-BLK-TAC",
      barcode: "849201948210",
      price: "189.00",
      stock: 65,
      enabled: true,
    },
    {
      id: "v2",
      color: "Matte Black",
      colorDot: "#1e293b",
      switchType: "Linear Red",
      sku: "APX-KB-BLK-LIN",
      barcode: "849201948211",
      price: "189.00",
      stock: 55,
      enabled: true,
    },
    {
      id: "v3",
      color: "Chalk White",
      colorDot: "#e2e8f0",
      switchType: "Tactile Brown",
      sku: "APX-KB-WHT-TAC",
      barcode: "849201948220",
      price: "199.00",
      stock: 45,
      enabled: true,
    },
    {
      id: "v4",
      color: "Chalk White",
      colorDot: "#e2e8f0",
      switchType: "Linear Red",
      sku: "APX-KB-WHT-LIN",
      barcode: "849201948221",
      price: "199.00",
      stock: 70,
      enabled: true,
    },
    {
      id: "v5",
      color: "Midnight Navy",
      colorDot: "#1e3a8a",
      switchType: "Clicky Blue",
      sku: "APX-KB-NVY-CLK",
      barcode: "849201948230",
      price: "199.00",
      stock: 50,
      enabled: true,
    },
  ])

  // Tags
  const [tags, setTags] = React.useState(["Flagship", "Wireless", "Mechanical", "Aluminum"])
  const [newTagInput, setNewTagInput] = React.useState("")

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(newTagInput.trim())) {
        setTags([...tags, newTagInput.trim()])
      }
      setNewTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const applyBulkPrice = () => {
    setVariants((prev) => prev.map((v) => ({ ...v, price: bulkPriceInput })))
  }

  const applyBulkStock = () => {
    const s = parseInt(bulkStockInput) || 0
    setVariants((prev) => prev.map((v) => ({ ...v, stock: s })))
  }

  const toggleVariant = (id: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, enabled: !v.enabled } : v))
    )
  }

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Header with Breadcrumb & Action Buttons */}
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
            <span>📁 Products</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Create New Product</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Create Product
            </h1>
            <Badge
              variant="outline"
              className="border-indigo-200/80 bg-indigo-50/70 font-mono text-[10px] font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              • DRAFT MODE
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            <span>Discard Changes</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border/80"
          >
            <Save className="size-3.5 text-muted-foreground" />
            <span>Save Draft</span>
          </Button>

          <Button
            size="sm"
            className="h-8 gap-1.5 bg-indigo-600 px-3 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700"
          >
            <Rocket className="size-3.5" />
            <span>Publish Product</span>
          </Button>
        </div>
      </div>

      {/* 2. Main 12-Column Grid Layout */}
      <div className="grid gap-4 lg:grid-cols-12 items-start">
        {/* Left 8 Columns (Main Data Entry & Matrix Generator) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Section A: Basic Information (Core Metadata) */}
          <Card className="shadow-2xs border-border/70">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 font-bold">
                    <Edit3 className="size-3.5" />
                  </div>
                  <CardTitle className="text-sm font-bold">Basic Information</CardTitle>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Core Metadata
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5">
              {/* Product Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Product Title
                </label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => {
                    setProductTitle(e.target.value)
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
                  }}
                  className="h-9 w-full rounded-md border border-border/80 bg-background px-3 text-xs font-medium text-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>

              {/* URL Handle / Slug */}
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-mono">
                <span className="text-muted-foreground truncate">
                  https://apexcommerce.io/products/
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    {slug}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingSlug(!isEditingSlug)}
                  className="ml-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  <Edit3 className="size-3" />
                  <span>Edit Slug</span>
                </button>
              </div>

              {/* Short Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Short Summary
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    Used in listing cards &amp; SERP snippets
                  </span>
                </div>
                <textarea
                  rows={2}
                  defaultValue="Engineered for tactile perfection featuring aerospace-grade anodized aluminum chassis, dual sound-dampening silicone sheets, and tri-mode high-speed wireless connectivity."
                  className="w-full rounded-md border border-border/80 bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/30 resize-none leading-relaxed"
                />
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Full Description
                  </label>
                  <div className="flex rounded-md border border-border bg-muted/40 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab("rich")}
                      className={`rounded px-2 py-0.5 text-[10.5px] font-medium transition-colors ${
                        activeEditorTab === "rich"
                          ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Rich Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab("markdown")}
                      className={`rounded px-2 py-0.5 text-[10.5px] font-medium transition-colors ${
                        activeEditorTab === "markdown"
                          ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Markdown
                    </button>
                  </div>
                </div>

                {/* Rich Editor Box with Toolbar */}
                <div className="rounded-md border border-border/80 bg-background overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 border-b border-border/60 bg-muted/30 p-1.5 text-muted-foreground">
                    <button type="button" className="rounded p-1 hover:bg-muted hover:text-foreground">
                      <Bold className="size-3.5" />
                    </button>
                    <button type="button" className="rounded p-1 hover:bg-muted hover:text-foreground">
                      <Italic className="size-3.5" />
                    </button>
                    <button type="button" className="rounded p-1 hover:bg-muted hover:text-foreground">
                      <Underline className="size-3.5" />
                    </button>
                    <span className="text-border">|</span>
                    <button type="button" className="rounded p-1 hover:bg-muted hover:text-foreground">
                      <List className="size-3.5" />
                    </button>
                    <button type="button" className="rounded p-1 hover:bg-muted hover:text-foreground">
                      <ListOrdered className="size-3.5" />
                    </button>
                    <button type="button" className="rounded p-1 hover:bg-muted hover:text-foreground">
                      <Table className="size-3.5" />
                    </button>
                    <span className="text-border">|</span>
                    <button type="button" className="rounded p-1 hover:bg-muted hover:text-foreground">
                      <Code className="size-3.5" />
                    </button>
                    <button type="button" className="rounded p-1 hover:bg-muted hover:text-foreground">
                      <ImageIcon className="size-3.5" />
                    </button>
                    <button type="button" className="rounded p-1 hover:bg-muted hover:text-foreground">
                      <Link2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Editor Content Area */}
                  <div className="p-3 text-xs leading-relaxed text-foreground space-y-2">
                    <p>
                      The <strong>Apex Precision Mechanical Keyboard</strong> defines professional ergonomic typing. Custom CNC machined out of a single billet of 6063 aerospace aluminum, the chassis provides unyielding structural integrity paired with gasket-mounted comfort.
                    </p>
                    <p className="text-muted-foreground">
                      Includes factory-lubed custom mechanical switches, per-key programmable RGB illumination via QMK/VIA support, and a high-capacity 4000mAh dual battery setup delivering 220+ hours of continuous performance.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section B: Media Assets (4 of 10 Uploaded) */}
          <Card className="shadow-2xs border-border/70">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 font-bold">
                    <ImageIcon className="size-3.5" />
                  </div>
                  <CardTitle className="text-sm font-bold">Media Assets</CardTitle>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  4 of 10 Uploaded
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Dropzone */}
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50/20 p-6 text-center dark:border-indigo-900/50 dark:bg-indigo-950/20">
                <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-300 mb-2">
                  <UploadCloud className="size-5" />
                </div>
                <div className="text-xs font-semibold text-foreground">
                  Drag &amp; drop high-resolution imagery here
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Supports PNG, JPG, or WEBP up to 25MB each (Min recommended: 2400×2400px)
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  className="mt-3 h-7 text-xs font-medium border-border/80 bg-card"
                >
                  Browse Files
                </Button>
              </div>

              {/* 4 Image Thumbnails Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Image 1 (Primary) */}
                <div className="relative group overflow-hidden rounded-lg border border-indigo-300 bg-card p-1 shadow-2xs dark:border-indigo-800">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                    <img
                      src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80"
                      alt="apex-main.png"
                      className="size-full object-cover"
                    />
                    <div className="absolute top-1 left-1 flex items-center gap-1">
                      <Badge className="bg-indigo-600 text-white text-[9px] font-bold px-1 py-0">
                        PRIMARY
                      </Badge>
                      <span className="rounded bg-black/60 px-1 py-0.5 font-mono text-[8.5px] text-white">
                        2400×2400
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-1.5 text-[11px]">
                    <span className="font-mono text-muted-foreground truncate">apex-main.png</span>
                    <GripVertical className="size-3 text-muted-foreground" />
                  </div>
                </div>

                {/* Image 2 */}
                <div className="relative group overflow-hidden rounded-lg border border-border/70 bg-card p-1 shadow-2xs">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                    <img
                      src="https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=300&auto=format&fit=crop&q=80"
                      alt="white-hero.png"
                      className="size-full object-cover"
                    />
                    <span className="absolute top-1 right-1 rounded bg-black/60 px-1 py-0.5 font-mono text-[8.5px] text-white">
                      2400×2400
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 text-[11px]">
                    <span className="font-mono text-muted-foreground truncate">white-hero.png</span>
                    <GripVertical className="size-3 text-muted-foreground" />
                  </div>
                </div>

                {/* Image 3 */}
                <div className="relative group overflow-hidden rounded-lg border border-border/70 bg-card p-1 shadow-2xs">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                    <img
                      src="https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80"
                      alt="switch-macro.png"
                      className="size-full object-cover"
                    />
                    <span className="absolute top-1 right-1 rounded bg-black/60 px-1 py-0.5 font-mono text-[8.5px] text-white">
                      2400×2400
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 text-[11px]">
                    <span className="font-mono text-muted-foreground truncate">switch-macro.png</span>
                    <GripVertical className="size-3 text-muted-foreground" />
                  </div>
                </div>

                {/* Image 4 */}
                <div className="relative group overflow-hidden rounded-lg border border-border/70 bg-card p-1 shadow-2xs">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                    <img
                      src="https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=300&auto=format&fit=crop&q=80"
                      alt="chassis-navy.png"
                      className="size-full object-cover"
                    />
                    <span className="absolute top-1 right-1 rounded bg-black/60 px-1 py-0.5 font-mono text-[8.5px] text-white">
                      2400×2400
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 text-[11px]">
                    <span className="font-mono text-muted-foreground truncate">chassis-navy.png</span>
                    <GripVertical className="size-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section C: Variant Generator Matrix (9 SKUs Generated) */}
          <Card className="shadow-2xs border-border/70">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 font-bold">
                      <Sliders className="size-3.5" />
                    </div>
                    <CardTitle className="text-sm font-bold">
                      Variant Generator Matrix
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="border-indigo-200 bg-indigo-50 font-mono text-[9.5px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                    >
                      9 SKUs Generated
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Configure multi-attribute combinations and inventory rules
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Option 1: Color */}
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <GripVertical className="size-3 text-muted-foreground" />
                    <span>Option 1: Color</span>
                  </div>
                  <button type="button" className="text-muted-foreground hover:text-foreground">
                    <X className="size-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {colorOptions.map((opt) => (
                    <span
                      key={opt.label}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs"
                    >
                      <span
                        className="size-2 rounded-full border border-black/20"
                        style={{ backgroundColor: opt.dot }}
                      />
                      <span>{opt.label}</span>
                      <X className="size-3 cursor-pointer text-muted-foreground hover:text-foreground" />
                    </span>
                  ))}
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="size-3" />
                    <span>Add value...</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Switch Type */}
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <GripVertical className="size-3 text-muted-foreground" />
                    <span>Option 2: Switch Type</span>
                  </div>
                  <button type="button" className="text-muted-foreground hover:text-foreground">
                    <X className="size-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {switchOptions.map((opt) => (
                    <span
                      key={opt.label}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: opt.dot }}
                      />
                      <span>{opt.label}</span>
                      <X className="size-3 cursor-pointer text-muted-foreground hover:text-foreground" />
                    </span>
                  ))}
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="size-3" />
                    <span>Add value...</span>
                  </button>
                </div>
              </div>

              {/* Add another option link */}
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
              >
                <Plus className="size-3.5" />
                <span>Add another option (e.g., Layout, Connection Mode)</span>
              </button>

              {/* Bulk Modifier Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-indigo-200/70 bg-indigo-50/50 p-2.5 text-xs dark:border-indigo-900/50 dark:bg-indigo-950/20">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">Bulk Price:</span>
                    <div className="relative w-20">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-[11px]">$</span>
                      <input
                        type="text"
                        value={bulkPriceInput}
                        onChange={(e) => setBulkPriceInput(e.target.value)}
                        className="h-7 w-full rounded border border-border bg-card pl-4 pr-1 text-xs font-mono font-medium"
                      />
                    </div>
                    <Button
                      size="xs"
                      onClick={applyBulkPrice}
                      variant="outline"
                      className="h-7 text-[10.5px] border-border/80"
                    >
                      Apply All
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">Bulk Stock:</span>
                    <input
                      type="number"
                      value={bulkStockInput}
                      onChange={(e) => setBulkStockInput(e.target.value)}
                      className="h-7 w-16 rounded border border-border bg-card px-2 text-xs font-mono font-medium"
                    />
                    <Button
                      size="xs"
                      onClick={applyBulkStock}
                      variant="outline"
                      className="h-7 text-[10.5px] border-border/80"
                    >
                      Apply All
                    </Button>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="outline"
                  className="h-7 gap-1 text-[10.5px] border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300"
                >
                  <RotateCcw className="size-3" />
                  <span>Regenerate SKUs</span>
                </Button>
              </div>

              {/* Generated Variant Table */}
              <div className="overflow-x-auto rounded-lg border border-border/70">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="p-2.5 w-8">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-border text-indigo-600 focus:ring-indigo-500 size-3.5"
                        />
                      </th>
                      <th className="p-2.5 font-bold">VARIANT</th>
                      <th className="p-2.5 font-bold">SKU</th>
                      <th className="p-2.5 font-bold">BARCODE (UPC)</th>
                      <th className="p-2.5 font-bold text-right">PRICE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-normal">
                    {variants.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-2.5">
                          <input
                            type="checkbox"
                            checked={v.enabled}
                            onChange={() => toggleVariant(v.id)}
                            className="rounded border-border text-indigo-600 focus:ring-indigo-500 size-3.5"
                          />
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <span
                              className="size-2 rounded-full border border-black/20"
                              style={{ backgroundColor: v.colorDot }}
                            />
                            <span>{v.color} / {v.switchType}</span>
                          </div>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                          {v.sku}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-muted-foreground">
                          {v.barcode}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-foreground">
                          ${v.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Summary Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>
                    Total Units Allocated: <strong className="text-foreground font-semibold">285 units</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Average Margin: <strong className="text-emerald-600 font-semibold">63.8%</strong>
                  </span>
                </div>
                <button
                  type="button"
                  className="font-semibold text-indigo-600 hover:underline text-xs flex items-center gap-0.5"
                >
                  <span>View remaining 4 inactive combinations</span>
                  <span>›</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Section D: Search Engine Optimization (SERP Preview) */}
          <Card className="shadow-2xs border-border/70">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 font-bold">
                    <Globe className="size-3.5" />
                  </div>
                  <CardTitle className="text-sm font-bold">
                    Search Engine Optimization (SERP)
                  </CardTitle>
                </div>
                <Badge
                  variant="secondary"
                  className="font-mono text-[9.5px] font-medium text-muted-foreground"
                >
                  Google Desktop Preview
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="rounded-lg border border-border/60 bg-card p-3.5 space-y-1 text-left font-sans">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                  <span>https://apexcommerce.io</span>
                  <span>›</span>
                  <span>products</span>
                  <span>›</span>
                  <span>{slug}</span>
                </div>
                <div className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">
                  {productTitle} | ApexCommerce
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                  Engineered for tactile excellence with hot-swappable mechanical switches, custom aluminum housing, and 2.4GHz wireless connectivity. Available in Matte Black, Chalk White, and Midnight Navy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 4 Columns (Settings, Taxonomy, Publishing, Shipping) */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Publishing Status */}
          <Card className="shadow-2xs border-border/70">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Publishing Status</CardTitle>
                <Globe className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Segmented Status Selector */}
              <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/40 p-1 text-xs font-semibold">
                {(["draft", "active", "archived"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPublishStatus(st)}
                    className={`rounded py-1 text-center capitalize transition-colors ${
                      publishStatus === st
                        ? "bg-card text-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Sales Channels Visibility */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-foreground">
                  Sales Channels Visibility
                </span>

                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2 text-xs">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-border text-indigo-600 focus:ring-indigo-500 size-3.5 mt-0.5"
                      />
                      <div>
                        <div className="font-semibold text-foreground">Online Store</div>
                        <div className="text-[10px] text-muted-foreground font-mono">apexcommerce.io/store</div>
                      </div>
                    </div>
                    <Badge variant="success" className="text-[9.5px] font-bold px-1.5 py-0">
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2 text-xs">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-border text-indigo-600 focus:ring-indigo-500 size-3.5 mt-0.5"
                      />
                      <div>
                        <div className="font-semibold text-foreground">B2B Wholesale Portal</div>
                        <div className="text-[10px] text-muted-foreground">Tier-1 volume pricing</div>
                      </div>
                    </div>
                    <Badge variant="success" className="text-[9.5px] font-bold px-1.5 py-0">
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2 text-xs opacity-60">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-border text-indigo-600 focus:ring-indigo-500 size-3.5 mt-0.5"
                      />
                      <div>
                        <div className="font-semibold text-foreground">POS Retail Kiosks</div>
                        <div className="text-[10px] text-muted-foreground">Physical barcode sync</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[9.5px] font-bold px-1.5 py-0">
                      Disabled
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Schedule Release */}
              <div className="space-y-1.5 border-t border-border/60 pt-3 text-xs">
                <span className="font-semibold text-foreground">Schedule Release</span>
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/20 p-2 text-muted-foreground">
                  <span className="text-xs">📅</span>
                  <span>Immediate upon publication</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Organization */}
          <Card className="shadow-2xs border-border/70">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Organization</CardTitle>
                <Boxes className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* Product Category Hierarchy */}
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground">Product Category</span>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-2.5 py-1.5 text-foreground font-medium text-xs">
                  <span>Electronics &gt; Peripherals &gt; Keyboards</span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Brand Selector */}
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground">Brand</span>
                <div className="flex items-center justify-between rounded-md border border-border bg-card p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded bg-indigo-600 font-black text-white text-[10px]">
                      A
                    </div>
                    <span className="font-semibold text-foreground">Apex Hardware</span>
                  </div>
                  <Sliders className="size-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Tags & Collections */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Tags &amp; Collections</span>
                  <span className="text-[10px] text-muted-foreground">{tags.length} tags</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-border bg-muted/40 text-foreground font-mono text-[10.5px] px-2 py-0.5 gap-1"
                    >
                      <span>#{tag}</span>
                      <X
                        onClick={() => handleRemoveTag(tag)}
                        className="size-2.5 cursor-pointer text-muted-foreground hover:text-foreground"
                      />
                    </Badge>
                  ))}
                </div>

                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag and hit Enter..."
                  className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* 3. Shipping & Customs */}
          <Card className="shadow-2xs border-border/70">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Shipping &amp; Customs</CardTitle>
                <Truck className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* Physical Product Checkbox */}
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <div>
                  <div className="font-semibold text-foreground">Physical Product</div>
                  <div className="text-[10px] text-muted-foreground">
                    Requires carrier calculation &amp; shipping label
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-border text-indigo-600 focus:ring-indigo-500 size-3.5"
                />
              </div>

              {/* Weight & Dimensions */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[11px]">Weight</span>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="1.45"
                      className="h-8 w-full rounded border border-border bg-card px-2 text-xs font-mono font-medium"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-mono">
                      kg
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground text-[11px]">Dimensions (L×W×H)</span>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="36 × 14 × 4"
                      className="h-8 w-full rounded border border-border bg-card px-2 text-xs font-mono font-medium"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-mono">
                      cm
                    </span>
                  </div>
                </div>
              </div>

              {/* Harmonized Tariff (HS Code) */}
              <div className="space-y-1">
                <span className="text-muted-foreground text-[11px]">Harmonized Tariff (HS Code)</span>
                <div className="relative">
                  <input
                    type="text"
                    defaultValue="8471.60.20"
                    className="h-8 w-full rounded border border-border bg-card px-2 text-xs font-mono font-medium"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground">
                    US/EU
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground pt-0.5">
                  Input units: Automatic tariff valuation on cross-border fulfillment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
