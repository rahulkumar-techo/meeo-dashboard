/**
 * @file page.tsx
 * @description Customer Directory & Cohort Intelligence Console (< 220 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Download, Plus, Eye, Mail, ShieldAlert } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { CUSTOMERS_LIST_DATA, CustomerRecord } from "@/data/customers"

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<CustomerRecord[]>(CUSTOMERS_LIST_DATA)
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerRecord | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredCustomers = React.useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter !== "all" && c.status.toLowerCase() !== statusFilter.toLowerCase()) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [customers, statusFilter, searchQuery])

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <PageHeader
        title="Customer Directory & Intelligence"
        badge="8,940 Active Profiles"
        badgeVariant="brand"
        description="Unified 360 customer profiles, purchase velocity cohorts, automated fraud risk tagging, and support communication ledger."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Cohorts (CSV)</span>
        </Button>
        <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>New Customer</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Total Customers", value: "8,940", colorTheme: "indigo", trend: { value: "+9.8%", isPositive: true }, footnote: "Active across global stores" },
          { title: "Repeat Purchase Rate", value: "38.2%", colorTheme: "emerald", trend: { value: "+3.4%", isPositive: true }, footnote: "Avg orders: 2.8 per buyer" },
          { title: "Average Lifetime Value", value: "$412.80", colorTheme: "cyan", trend: { value: "+14.2%", isPositive: true }, footnote: "VIP threshold: $1,000+" },
          { title: "Risk Flagged Accounts", value: "12 Profiles", colorTheme: "rose", badge: { text: "Action Req", variant: "destructive" }, footnote: "High fraud velocity" },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search customer name, email, account ID..."
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="attention">Attention Needed</option>
          </select>
        }
        activeFiltersCount={statusFilter !== "all" ? 1 : 0}
        onResetFilters={() => { setStatusFilter("all"); setSearchQuery("") }}
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            title="No Customers Found"
            description="No customer accounts matched your search."
            actionLabel="Reset Filters"
            onAction={() => { setStatusFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">CUSTOMER</TableHead>
                  <TableHead className="font-bold">TIER</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">TOTAL ORDERS</TableHead>
                  <TableHead className="font-bold">TOTAL SPEND</TableHead>
                  <TableHead className="font-bold">RISK SCORE</TableHead>
                  <TableHead className="font-bold text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredCustomers.map((cust) => (
                  <TableRow
                    key={cust.id}
                    onClick={() => { setSelectedCustomer(cust); setIsDrawerOpen(true) }}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7 border border-border">
                          <AvatarImage src={cust.avatar} />
                          <AvatarFallback>{cust.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{cust.name}</p>
                          <p className="text-[10.5px] text-muted-foreground">{cust.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] font-medium">{cust.tier}</Badge></TableCell>
                    <TableCell><StatusBadge status={cust.status.toLowerCase()} showDot /></TableCell>
                    <TableCell className="font-mono">{cust.ordersCount} ({cust.ordersCadence})</TableCell>
                    <TableCell className="font-mono font-bold text-foreground">{cust.totalSpend}</TableCell>
                    <TableCell>
                      <span className={`font-mono text-xs ${parseFloat(cust.riskScore) > 0.5 ? "text-rose-600 font-bold" : "text-emerald-600 font-medium"}`}>
                        {cust.riskScore} ({cust.riskLabel})
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link href="/customers/360" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            360° View
                          </Button>
                        </Link>
                      </div>
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
          totalItems={filteredCustomers.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 5. Detail Drawer */}
      {selectedCustomer && (
        <DetailDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          size="lg"
          title={<div className="flex items-center gap-2"><span>{selectedCustomer.name}</span><Badge variant="outline">{selectedCustomer.tier}</Badge></div>}
          description={selectedCustomer.email}
          footer={
            <Link href="/customers/360" className="w-full">
              <Button size="sm" className="w-full text-xs">Open Complete 360° Profile →</Button>
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-card/60 p-3.5 text-xs">
            <div><span className="text-muted-foreground text-[11px]">Phone:</span><p className="font-medium">{selectedCustomer.phone}</p></div>
            <div><span className="text-muted-foreground text-[11px]">Address:</span><p className="font-medium">{selectedCustomer.address}</p></div>
            <div><span className="text-muted-foreground text-[11px]">Average Order:</span><p className="font-mono font-bold text-foreground">{selectedCustomer.avgOrderValue}</p></div>
            <div><span className="text-muted-foreground text-[11px]">Return Rate:</span><p className="font-mono text-emerald-600">{selectedCustomer.returnRate}</p></div>
          </div>
        </DetailDrawer>
      )}
    </div>
  )
}
