/**
 * @file page.tsx
 * @description Customer Directory & 360 Intelligence Console with live ecommerce metrics, VIP tiers, and fraud risk tracking.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Download,
  Users,
  Crown,
  ShieldAlert,
  UserX,
  Plus,
  Layers,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PageHeader, DataTableToolbar } from "@/components/common"
import {
  useCustomersQuery,
  useCustomerMetricsQuery,
} from "@/hooks/use-customer-query"
import {
  CustomerMetricsCards,
  CustomerTable,
  CustomerStatusDialog,
  EditCustomerDialog,
  CustomerGuideCard,
} from "@/components/customers"
import type { AdminCustomer, CustomerStatus, LoyaltyTier } from "@/types/customer"

export default function CustomersPage() {
  const router = useRouter()

  // Tab state
  const [activeTab, setActiveTab] = React.useState<string>("all")

  // Filter & Pagination state
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [tierFilter, setTierFilter] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string>("createdAt")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Dialog state
  const [selectedCustomer, setSelectedCustomer] = React.useState<AdminCustomer | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)

  // Map active tab to query filters
  const queryParams = React.useMemo(() => {
    const p: any = {
      page,
      limit: pageSize,
      search: searchQuery.trim() || undefined,
      sortBy,
      sortOrder,
    }

    if (statusFilter !== "all") {
      p.status = statusFilter
    }

    if (tierFilter !== "all") {
      p.tier = tierFilter
    }

    if (activeTab === "vip") {
      // Filter VIP
      p.tier = "GOLD,PLATINUM"
    } else if (activeTab === "risk") {
      p.riskFlagOnly = true
    } else if (activeTab === "moderated") {
      p.status = "SUSPENDED,BLOCKED"
    }

    return p
  }, [page, pageSize, searchQuery, statusFilter, tierFilter, sortBy, sortOrder, activeTab])

  // Queries
  const {
    data: customersData,
    isLoading: isCustomersLoading,
    refetch: refetchCustomers,
  } = useCustomersQuery(queryParams)

  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useCustomerMetricsQuery()

  const items = customersData?.items ?? []
  const total = customersData?.pagination?.total ?? items.length
  const totalPages = customersData?.pagination?.totalPages ?? 1

  const handleRefresh = () => {
    refetchCustomers()
    refetchMetrics()
  }

  // Navigate to customer 360 view
  const handleInspect360 = (customer: AdminCustomer) => {
    router.push(`/customers/${customer.id}`)
  }

  // Client-side CSV export generator
  const handleExportCSV = () => {
    if (items.length === 0) return
    const headers = [
      "User ID",
      "Email",
      "First Name",
      "Last Name",
      "Status",
      "Loyalty Tier",
      "Total Orders",
      "Total Spend ($)",
      "Risk Score (0-100)",
      "Risk Level",
      "Created At",
    ]
    const rows = items.map((c) => [
      c.id,
      `"${c.email}"`,
      `"${c.firstName || ""}"`,
      `"${c.lastName || ""}"`,
      c.status,
      c.tier,
      c.totalOrders,
      c.totalSpend,
      c.riskScore,
      c.riskLevel,
      c.createdAt,
    ])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `customers_export_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Customer Directory & Intelligence"
        badge="Omnichannel CRM"
        badgeVariant="brand"
        module="user"
        description="Unified 360 customer profiles, non-cancelled spend tiers, automated fraud risk engine, and session management."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
        >
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Customers (CSV)</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics Grid */}
      <CustomerMetricsCards
        metrics={metricsData}
        isLoading={isMetricsLoading}
      />

      {/* 3. Onboarding & Intelligence Guide */}
      <CustomerGuideCard />

      {/* 4. Tabbed Views */}
      <Tabs
        value={activeTab}
        onValueChange={(tab) => {
          setActiveTab(tab)
          setStatusFilter("all")
          setTierFilter("all")
          setPage(1)
        }}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border/60">
          <TabsTrigger value="all" className="text-xs gap-1.5 font-medium">
            <Users className="size-3.5" />
            <span>All Customers</span>
          </TabsTrigger>
          <TabsTrigger value="vip" className="text-xs gap-1.5 font-medium">
            <Crown className="size-3.5 text-amber-500" />
            <span>VIP High Spenders</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="text-xs gap-1.5 font-medium relative">
            <ShieldAlert className="size-3.5 text-rose-500" />
            <span>Risk & Action Req</span>
            {metricsData?.riskFlaggedAccounts ? (
              <span className="ml-1 rounded-full bg-rose-600 text-white px-1.5 py-0.2 text-[10px] font-bold">
                {metricsData.riskFlaggedAccounts}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="moderated" className="text-xs gap-1.5 font-medium">
            <UserX className="size-3.5 text-slate-500" />
            <span>Suspended / Blocked</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Toolbar */}
          <DataTableToolbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q)
              setPage(1)
            }}
            searchPlaceholder="Search customer name, email address, phone..."
            filters={
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="ACTIVE">Active (Healthy)</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="BLOCKED">Blocked</option>
                </select>

                {/* Tier Filter */}
                <select
                  value={tierFilter}
                  onChange={(e) => {
                    setTierFilter(e.target.value)
                    setPage(1)
                  }}
                  className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
                >
                  <option value="all">All Loyalty Tiers</option>
                  <option value="PLATINUM">Platinum VIP ($5k+)</option>
                  <option value="GOLD">Gold VIP ($1k–$4.9k)</option>
                  <option value="SILVER">Silver ($200–$999)</option>
                  <option value="BRONZE">Bronze ($0–$199)</option>
                </select>

                {/* Sort Filter */}
                <select
                  value={`${sortBy}:${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split(":")
                    setSortBy(field)
                    setSortOrder(order as "asc" | "desc")
                    setPage(1)
                  }}
                  className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden font-mono"
                >
                  <option value="createdAt:desc">Newest Registered</option>
                  <option value="totalSpend:desc">Highest Lifetime Spend</option>
                  <option value="totalOrders:desc">Most Orders Placed</option>
                  <option value="riskScore:desc">Highest Risk Score</option>
                  <option value="lastLoginAt:desc">Recently Active</option>
                </select>
              </div>
            }
            activeFiltersCount={
              (statusFilter !== "all" ? 1 : 0) +
              (tierFilter !== "all" ? 1 : 0) +
              (sortBy !== "createdAt" ? 1 : 0)
            }
            onResetFilters={() => {
              setStatusFilter("all")
              setTierFilter("all")
              setSortBy("createdAt")
              setSortOrder("desc")
              setSearchQuery("")
              setPage(1)
            }}
          />

          {/* Customer Table */}
          <CustomerTable
            items={items}
            total={total}
            totalPages={totalPages}
            page={page}
            pageSize={pageSize}
            isLoading={isCustomersLoading}
            hasActiveFilters={Boolean(
              searchQuery ||
                statusFilter !== "all" ||
                tierFilter !== "all" ||
                sortBy !== "createdAt"
            )}
            onInspect360={handleInspect360}
            onModerateStatus={(customer) => {
              setSelectedCustomer(customer)
              setStatusDialogOpen(true)
            }}
            onEditProfile={(customer) => {
              setSelectedCustomer(customer)
              setEditDialogOpen(true)
            }}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onResetFilters={() => {
              setStatusFilter("all")
              setTierFilter("all")
              setSortBy("createdAt")
              setSortOrder("desc")
              setSearchQuery("")
              setPage(1)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* 5. Status Moderation Modal */}
      <CustomerStatusDialog
        customer={selectedCustomer}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onSuccess={handleRefresh}
      />

      {/* 6. Edit Profile Modal */}
      <EditCustomerDialog
        customer={selectedCustomer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
