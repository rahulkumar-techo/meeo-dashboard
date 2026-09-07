/**
 * @file page.tsx
 * @description Category Taxonomy & Faceted Filter Configuration Console (< 220 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Layers, Plus, Download, Edit, Trash2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  PageHeader,
  MetricGrid,
  StatusBadge,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import { CATEGORIES_DATA, CategoryItem } from "@/data/categories"

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<CategoryItem[]>(CATEGORIES_DATA)
  const [selectedCat, setSelectedCat] = React.useState<CategoryItem>(CATEGORIES_DATA[0])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredCategories = React.useMemo(() => {
    return categories.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.parentName?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [categories, searchQuery])

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <PageHeader
        title="Taxonomy & Category Facets"
        badge="Tree Depth L3"
        badgeVariant="brand"
        description="Configure dynamic multi-level category trees, search faceted navigation filters, URL route slugs, and automated catalog re-indexing."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Taxonomy</span>
        </Button>
        <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>New Category</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Total Categories", value: "3 Active Nodes", colorTheme: "indigo", footnote: "154 catalog SKUs mapped" },
          { title: "Indexed Facet Attributes", value: "9 Filter Types", colorTheme: "emerald", footnote: "Instant search enabled" },
          { title: "Catalog Coverage", value: "100%", colorTheme: "cyan", footnote: "0 uncategorized SKUs" },
          { title: "Taxonomy Health", value: "Optimal", colorTheme: "emerald", badge: { text: "Verified", variant: "success" }, footnote: "Zero broken parent links" },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter category name, slug, parent node..."
      />

      {/* 4. Split Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Table */}
        <div className="space-y-3 lg:col-span-7">
          <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">CATEGORY NAME</TableHead>
                  <TableHead className="font-bold">PARENT NODE</TableHead>
                  <TableHead className="font-bold">SKUS</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredCategories.map((cat) => (
                  <TableRow
                    key={cat.id}
                    onClick={() => setSelectedCat(cat)}
                    className={`cursor-pointer transition-colors ${selectedCat?.id === cat.id ? "bg-indigo-500/10 font-semibold" : "hover:bg-muted/40"}`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{cat.name}</p>
                        <p className="text-[10.5px] text-muted-foreground font-mono">/c/{cat.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cat.parentName}</TableCell>
                    <TableCell className="font-mono">{cat.skusCount} SKUs</TableCell>
                    <TableCell><StatusBadge status={cat.status} showDot /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DataTablePagination
              currentPage={page}
              totalPages={1}
              pageSize={pageSize}
              totalItems={filteredCategories.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>

        {/* Right: Selected Node Details & Facets */}
        <div className="space-y-4 lg:col-span-5">
          <Card className="border-border/70 bg-card/95 shadow-2xs text-xs">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold">{selectedCat.name}</CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">Level {selectedCat.level}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <div>
                <span className="text-muted-foreground text-[11px] font-semibold uppercase">Description</span>
                <p className="mt-1 text-muted-foreground leading-relaxed">{selectedCat.description}</p>
              </div>
              <div className="border-t border-border/60 pt-3">
                <span className="text-muted-foreground text-[11px] font-semibold uppercase">Faceted Navigation Filters</span>
                <div className="mt-2 space-y-1.5">
                  {selectedCat.facets.map((facet, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-md bg-muted/40 p-2 text-xs">
                      <span>{facet}</span>
                      <Badge variant="secondary" className="text-[9px]">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
