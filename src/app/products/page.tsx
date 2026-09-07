/**
 * @file page.tsx
 * @description Product Matrix & Variant SKU Matrix Console (< 220 lines).
 */

"use client"

import * as React from "react"
import { Sparkles, Save, Rocket, Plus, Trash2, Globe, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader, StatusBadge } from "@/components/common"
import {
  INITIAL_VARIANTS,
  COLOR_OPTIONS,
  SWITCH_OPTIONS,
  VariantRow,
} from "@/data/products"

export default function ProductMatrixPage() {
  const [productTitle, setProductTitle] = React.useState("Apex Precision Mechanical Keyboard")
  const [slug, setSlug] = React.useState("apex-precision-mechanical-keyboard")
  const [publishStatus, setPublishStatus] = React.useState<"draft" | "active" | "archived">("active")
  const [variants, setVariants] = React.useState<VariantRow[]>(INITIAL_VARIANTS)
  const [bulkPrice, setBulkPrice] = React.useState("189.00")
  const [bulkStock, setBulkStock] = React.useState("50")

  const handleApplyBulk = () => {
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        price: bulkPrice || v.price,
        stock: parseInt(bulkStock) || v.stock,
      }))
    )
  }

  const handleToggleVariant = (id: string, enabled: boolean) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, enabled } : v)))
  }

  const totalStock = variants.reduce((acc, curr) => acc + (curr.enabled ? curr.stock : 0), 0)

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Product Variant Matrix & Catalog Builder"
        badge={publishStatus.toUpperCase()}
        badgeVariant={publishStatus === "active" ? "success" : "outline"}
        description="Configure dynamic Cartesian variant matrices, multi-warehouse stock allocations, SKU barcode sync, and SEO attributes."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs">
          <Save className="size-3.5" /> Save Draft
        </Button>
        <Button
          size="sm"
          onClick={() => setPublishStatus("active")}
          className="h-8.5 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Rocket className="size-3.5" /> Publish to All Channels
        </Button>
      </PageHeader>

      {/* 2. Top Product Info Card */}
      <Card className="border-border/70 bg-card/95 shadow-2xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">Product Title</label>
              <Input
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="mt-1 h-8.5 text-xs font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">URL Slug / Handle</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1 h-8.5 text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Bulk Edit Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card p-3 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-semibold text-foreground">Bulk Variant Adjustments:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Price ($):</span>
            <Input
              type="number"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              className="h-7 w-20 text-xs font-mono"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Stock (Units):</span>
            <Input
              type="number"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              className="h-7 w-20 text-xs font-mono"
            />
          </div>
          <Button size="sm" onClick={handleApplyBulk} className="h-7 text-xs">
            Apply to All
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Total Inventory across variants: <strong className="text-foreground">{totalStock} Units</strong>
        </div>
      </div>

      {/* 4. Variant SKUs Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <TableHead className="font-bold">ENABLED</TableHead>
              <TableHead className="font-bold">COLOR</TableHead>
              <TableHead className="font-bold">SWITCH TYPE</TableHead>
              <TableHead className="font-bold">SKU CODE</TableHead>
              <TableHead className="font-bold">BARCODE (EAN)</TableHead>
              <TableHead className="font-bold text-right">UNIT PRICE ($)</TableHead>
              <TableHead className="font-bold text-right">STOCK LEVEL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs font-normal">
            {variants.map((v) => (
              <TableRow key={v.id} className={v.enabled ? "hover:bg-muted/40" : "opacity-50"}>
                <TableCell>
                  <Switch checked={v.enabled} onCheckedChange={(checked) => handleToggleVariant(v.id, checked)} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full border" style={{ backgroundColor: v.colorDot }} />
                    <span className="font-semibold text-foreground">{v.color}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline">{v.switchType}</Badge></TableCell>
                <TableCell className="font-mono font-medium text-indigo-600 dark:text-indigo-400">{v.sku}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{v.barcode}</TableCell>
                <TableCell className="text-right font-mono font-bold text-foreground">${v.price}</TableCell>
                <TableCell className="text-right font-mono font-bold text-foreground">{v.stock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
