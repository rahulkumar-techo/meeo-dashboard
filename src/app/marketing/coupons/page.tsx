/**
 * @file page.tsx
 * @description Coupon Code Management & Promo Token Engine (< 220 lines).
 */

"use client"

import * as React from "react"
import { Download, Plus, Eye, Copy, Check } from "lucide-react"
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
  DetailDrawer,
} from "@/components/common"
import { COUPONS_DATA, CouponRecord } from "@/data/coupons"

export default function CouponsPage() {
  const [coupons, setCoupons] = React.useState<CouponRecord[]>(COUPONS_DATA)
  const [selectedCoupon, setSelectedCoupon] = React.useState<CouponRecord | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredCoupons = React.useMemo(() => {
    return coupons.filter((c) => {
      if (statusFilter !== "all" && c.status.toLowerCase() !== statusFilter.toLowerCase()) return false
      if (typeFilter !== "all" && !c.type.toLowerCase().includes(typeFilter.toLowerCase())) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.eligibility.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [coupons, statusFilter, typeFilter, searchQuery])

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <PageHeader
        title="Coupon Code Management & Promo Tokens"
        badge="Realtime Token Engine"
        badgeVariant="brand"
        description="Issue single-use and multi-use promo vouchers, velocity rate-limits, minimum cart conditions, and attribution ledger."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Vouchers (CSV)</span>
        </Button>
        <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>Create Coupon Code</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Active Coupon Codes", value: "3 Active", colorTheme: "emerald", badge: { text: "1 Expired", variant: "outline" }, footnote: "Velocity throttles active" },
          { title: "Attributed Revenue (30D)", value: "$540,000.00", colorTheme: "indigo", trend: { value: "+21.4%", isPositive: true }, footnote: "Avg ROI: 5.8x" },
          { title: "Total Redemptions", value: "3,600", colorTheme: "cyan", trend: { value: "+14.8%", isPositive: true }, footnote: "Total discount: $99,375.00" },
          { title: "Abuse Rate (Blocked)", value: "0.04%", colorTheme: "amber", badge: { text: "Card Lock Active", variant: "success" }, footnote: "Bot scraping prevented" },
        ]}
      />

      {/* 3. Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter promo code, campaign name, eligibility..."
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Discount Types</option>
              <option value="percentage">Percentage Off</option>
              <option value="fixed">Fixed Cash</option>
            </select>
          </div>
        }
        activeFiltersCount={(statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0)}
        onResetFilters={() => { setStatusFilter("all"); setTypeFilter("all"); setSearchQuery("") }}
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredCoupons.length === 0 ? (
          <EmptyState
            title="No Coupons Found"
            description="No coupons matched your filter criteria."
            actionLabel="Reset Filters"
            onAction={() => { setStatusFilter("all"); setTypeFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">PROMO CODE</TableHead>
                  <TableHead className="font-bold">CAMPAIGN NAME</TableHead>
                  <TableHead className="font-bold">DISCOUNT</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">REDEMPTIONS</TableHead>
                  <TableHead className="font-bold text-right">ATTRIBUTED GMV</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredCoupons.map((coupon) => (
                  <TableRow
                    key={coupon.id}
                    onClick={() => { setSelectedCoupon(coupon); setIsDrawerOpen(true) }}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(coupon.code) }}
                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/10 px-2 py-1 font-mono font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20"
                      >
                        {copiedCode === coupon.code ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                        <span>{coupon.code}</span>
                      </button>
                    </TableCell>
                    <TableCell><p className="font-semibold text-foreground">{coupon.name}</p><p className="text-[10.5px] text-muted-foreground">{coupon.eligibility}</p></TableCell>
                    <TableCell><Badge variant="outline" className="font-bold">{coupon.discountValue}</Badge></TableCell>
                    <TableCell><StatusBadge status={coupon.status.toLowerCase()} showDot /></TableCell>
                    <TableCell className="font-mono text-muted-foreground">{coupon.redemptionsCount} / {coupon.redemptionsCap}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{coupon.gmvGenerated}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedCoupon(coupon); setIsDrawerOpen(true) }} className="h-7 px-2 text-xs">
                        <Eye className="mr-1 size-3.5" /> Details
                      </Button>
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
          totalItems={filteredCoupons.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 5. Detail Drawer */}
      {selectedCoupon && (
        <DetailDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          size="lg"
          title={<div className="flex items-center gap-2"><span className="font-mono">{selectedCoupon.code}</span><StatusBadge status={selectedCoupon.status.toLowerCase()} /></div>}
          description={selectedCoupon.name}
        >
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-card/60 p-3.5 text-xs">
            <div><span className="text-muted-foreground text-[11px]">Discount Type:</span><p className="font-semibold">{selectedCoupon.typeDetail}</p></div>
            <div><span className="text-muted-foreground text-[11px]">Min Cart Spend:</span><p className="font-semibold">{selectedCoupon.minSpend}</p></div>
            <div><span className="text-muted-foreground text-[11px]">Max Discount Cap:</span><p className="font-semibold">{selectedCoupon.maxDiscountCap}</p></div>
            <div><span className="text-muted-foreground text-[11px]">Attributed ROI:</span><p className="font-bold text-emerald-600">{selectedCoupon.roi} ({selectedCoupon.lift} lift)</p></div>
          </div>
        </DetailDrawer>
      )}
    </div>
  )
}
