/**
 * @file page.tsx
 * @description Multi-Warehouse Inventory Stock Matrix & Reorder Console (< 220 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Download, Plus, AlertTriangle, ArrowLeftRight, Package } from "lucide-react"
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
import { INVENTORY_DATA, InventoryItem } from "@/data/inventory"

export default function InventoryPage() {
  const [inventory, setInventory] = React.useState<InventoryItem[]>(INVENTORY_DATA)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [stockFilter, setStockFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredInventory = React.useMemo(() => {
    return inventory.filter((item) => {
      if (stockFilter === "low" && !item.isLowStock) return false
      if (stockFilter === "out" && !item.isOutOfStock) return false
      if (stockFilter === "in_stock" && (item.isLowStock || item.isOutOfStock)) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.barcode.includes(q)
        )
      }
      return true
    })
  }, [inventory, stockFilter, searchQuery])

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Multi-Warehouse Inventory Stock Matrix"
        badge="3 Fulfillment Hubs Synced"
        badgeVariant="brand"
        description="Real-time multi-location physical inventory, automated safety thresholds, reserved cart holds, and purchase order restock triage."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Stock (CSV)</span>
        </Button>
        <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>Restock Transfer</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Total Units on Hand", value: "3,892 Units", colorTheme: "indigo", footnote: "Valuation: $482,900.00" },
          { title: "Available for Sale", value: "3,480 Units", colorTheme: "emerald", footnote: "412 reserved in cart checkouts" },
          { title: "Low Stock Warning", value: "8 SKUs", colorTheme: "amber", badge: { text: "Reorder Triggered", variant: "warning" }, footnote: "Safety threshold < 25" },
          { title: "Out of Stock (Critical)", value: "2 SKUs", colorTheme: "rose", badge: { text: "Action Required", variant: "destructive" }, footnote: "Revenue lost: $420/day" },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search product name, SKU code, barcode..."
        filters={
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
          >
            <option value="all">All Inventory Levels</option>
            <option value="in_stock">In Stock (Healthy)</option>
            <option value="low">Low Stock Alerts</option>
            <option value="out">Out of Stock</option>
          </select>
        }
        activeFiltersCount={stockFilter !== "all" ? 1 : 0}
        onResetFilters={() => { setStockFilter("all"); setSearchQuery("") }}
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredInventory.length === 0 ? (
          <EmptyState
            title="No Inventory Items Found"
            description="No inventory records matched your filters."
            actionLabel="Reset Filters"
            onAction={() => { setStockFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">PRODUCT / SKU</TableHead>
                  <TableHead className="font-bold">PRIMARY BIN</TableHead>
                  <TableHead className="font-bold text-center">NJ HUB</TableHead>
                  <TableHead className="font-bold text-center">CA HUB</TableHead>
                  <TableHead className="font-bold text-center">NL HUB</TableHead>
                  <TableHead className="font-bold text-center">RESERVED</TableHead>
                  <TableHead className="font-bold text-right">AVAILABLE</TableHead>
                  <TableHead className="font-bold text-right">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredInventory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-[10.5px] text-muted-foreground font-mono">SKU: {item.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{item.primaryBin}</TableCell>
                    <TableCell className="text-center font-mono">{item.njStock}</TableCell>
                    <TableCell className="text-center font-mono">{item.caStock}</TableCell>
                    <TableCell className="text-center font-mono">{item.nlStock}</TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">{item.reserved}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">{item.available}</TableCell>
                    <TableCell className="text-right">
                      {item.isOutOfStock ? (
                        <StatusBadge status="out_of_stock" />
                      ) : item.isLowStock ? (
                        <StatusBadge status="low_stock" showDot />
                      ) : (
                        <StatusBadge status="in_stock" />
                      )}
                    </TableCell>
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
          totalItems={filteredInventory.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  )
}
