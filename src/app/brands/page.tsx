/**
 * @file page.tsx
 * @description Brand Registry & Vendor Partner Management Console (< 220 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Download, Plus, Store, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { BRANDS_DATA, BrandEntity } from "@/data/brands"

export default function BrandsPage() {
  const [brands, setBrands] = React.useState<BrandEntity[]>(BRANDS_DATA)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredBrands = React.useMemo(() => {
    return brands.filter((b) => {
      if (categoryFilter !== "all" && b.category.toLowerCase() !== categoryFilter.toLowerCase()) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [brands, categoryFilter, searchQuery])

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Brand Registry & Vendor Partnerships"
        badge="Direct & 3rd-Party"
        badgeVariant="brand"
        description="Manage brand ownership, first-party vs third-party supplier margins, verified manufacturer badges, and catalog SKU distributions."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Vendors (CSV)</span>
        </Button>
        <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>Register New Brand</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Registered Brands", value: "3 Brands", colorTheme: "indigo", footnote: "154 active catalog SKUs" },
          { title: "1st Party Direct Turnover", value: "$552,140.00", colorTheme: "emerald", trend: { value: "+28.4%", isPositive: true }, footnote: "Gross Margin: 62.0%" },
          { title: "3rd Party Vendor GMV", value: "$341,200.00", colorTheme: "cyan", trend: { value: "+14.1%", isPositive: true }, footnote: "Blended margin: 41.2%" },
          { title: "Supplier Health Score", value: "99.4%", colorTheme: "emerald", badge: { text: "Optimal", variant: "success" }, footnote: "Zero fulfillment delays" },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search brand name, vendor code, category..."
        filters={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="keyboards">Keyboards</option>
            <option value="audio">Audio</option>
          </select>
        }
        activeFiltersCount={categoryFilter !== "all" ? 1 : 0}
        onResetFilters={() => { setCategoryFilter("all"); setSearchQuery("") }}
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredBrands.length === 0 ? (
          <EmptyState
            title="No Brands Found"
            description="No brand records matched your filters."
            actionLabel="Reset Filters"
            onAction={() => { setCategoryFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">BRAND / VENDOR</TableHead>
                  <TableHead className="font-bold">VENDOR TYPE</TableHead>
                  <TableHead className="font-bold">CATEGORY</TableHead>
                  <TableHead className="font-bold">CATALOG SKUS</TableHead>
                  <TableHead className="font-bold">TARGET MARGIN</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-right">30D GMV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredBrands.map((b) => (
                  <TableRow key={b.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-md bg-indigo-500/10 font-mono font-bold text-indigo-700 dark:text-indigo-300 text-xs">
                          {b.monogram}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{b.name}</p>
                          <p className="text-[10.5px] text-muted-foreground font-mono">{b.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{b.vendorType}</Badge></TableCell>
                    <TableCell className="font-medium">{b.category}</TableCell>
                    <TableCell className="font-mono">{b.skusCount} SKUs</TableCell>
                    <TableCell className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{b.targetMargin}</TableCell>
                    <TableCell><StatusBadge status={b.status.toLowerCase()} showDot /></TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">{b.gmv30d}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DataTablePagination
          currentPage={page}
          totalPages={1}
          pageSize={pageSize}
          totalItems={filteredBrands.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  )
}
