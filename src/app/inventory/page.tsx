/**
 * @file page.tsx
 * @description Central Inventory Management Console integrating Stock Matrix, Low-Stock Triage, Audit Ledger, and Checkout Holds Simulator.
 */

"use client"

import * as React from "react"
import {
  Download,
  Plus,
  AlertTriangle,
  History,
  Layers,
  Zap,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  PageHeader,
  DataTableToolbar,
} from "@/components/common"
import {
  useInventoriesQuery,
  useLowStockAlertsQuery,
  useInventoryTransactionsQuery,
} from "@/hooks/use-inventory-query"
import {
  InventoryMetrics,
  InventoryTable,
  LowStockTriage,
  InventoryTransactionsTable,
  CheckoutSimulationPane,
  InventoryGuideCard,
  AddStockDialog,
  RemoveStockDialog,
  AdjustStockDialog,
  ReserveStockDialog,
} from "@/components/inventory"
import type { InventoryRecord, LowStockAlert } from "@/types/inventory"

export default function InventoryPage() {
  // Navigation tab state
  const [activeTab, setActiveTab] = React.useState<string>("matrix")

  // Query & pagination state for Master Stock Matrix
  const [searchQuery, setSearchQuery] = React.useState("")
  const [stockFilter, setStockFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // Query & pagination state for Transaction Audit Ledger
  const [txType, setTxType] = React.useState("")
  const [txRefType, setTxRefType] = React.useState("")
  const [txVariantId, setTxVariantId] = React.useState("")
  const [txPage, setTxPage] = React.useState(1)
  const [txPageSize, setTxPageSize] = React.useState(15)

  // Dialog state management
  const [selectedItem, setSelectedItem] = React.useState<InventoryRecord | null>(null)
  const [addStockOpen, setAddStockOpen] = React.useState(false)
  const [removeStockOpen, setRemoveStockOpen] = React.useState(false)
  const [adjustStockOpen, setAdjustStockOpen] = React.useState(false)
  const [reserveStockOpen, setReserveStockOpen] = React.useState(false)

  // API Queries
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    refetch: refetchInventory,
  } = useInventoriesQuery({
    page,
    limit: pageSize,
    search: searchQuery.trim() || undefined,
    lowStockOnly: stockFilter === "low" ? true : undefined,
  })

  const {
    data: lowStockAlerts = [],
    isLoading: isAlertsLoading,
    refetch: refetchAlerts,
  } = useLowStockAlertsQuery()

  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useInventoryTransactionsQuery({
    page: txPage,
    limit: txPageSize,
    type: txType || undefined,
    referenceType: txRefType || undefined,
    variantId: txVariantId || undefined,
  })

  const items = inventoryData?.items ?? []
  const total = inventoryData?.pagination?.total ?? items.length
  const totalPages = inventoryData?.pagination?.totalPages ?? 1

  // Filter items in-memory for custom quick filters if needed
  const displayItems = React.useMemo(() => {
    if (stockFilter === "out") {
      return items.filter((i) => i.availableQuantity === 0)
    }
    if (stockFilter === "in_stock") {
      return items.filter(
        (i) => i.availableQuantity > (i.reorderLevel ?? 10)
      )
    }
    return items
  }, [items, stockFilter])

  // Restock action handler from Low Stock Triage
  const handleRestockFromAlert = (alert: LowStockAlert) => {
    const matched = items.find((i) => i.variantId === alert.variantId) || {
      id: alert.id,
      variantId: alert.variantId,
      availableQuantity: alert.availableQuantity,
      reservedQuantity: alert.reservedQuantity,
      reorderLevel: alert.reorderLevel,
      variant: alert.variant as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSelectedItem(matched as InventoryRecord)
    setAddStockOpen(true)
  }

  // Open audit ledger filtered by variant
  const handleViewTransactionsForVariant = (variantId: string) => {
    setTxVariantId(variantId)
    setActiveTab("transactions")
  }

  // Client-side CSV export generator
  const handleExportCSV = () => {
    if (items.length === 0) return
    const headers = [
      "Variant ID",
      "Product Name",
      "SKU",
      "Barcode",
      "Available",
      "Reserved",
      "Total Stock",
      "Reorder Level",
    ]
    const rows = items.map((i) => [
      i.variantId,
      `"${i.variant?.product?.name || ""}"`,
      i.variant?.sku || "",
      i.variant?.barcode || "",
      i.availableQuantity,
      i.reservedQuantity,
      i.totalStock ?? i.availableQuantity + i.reservedQuantity,
      i.reorderLevel,
    ])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Inventory & Stock Management"
        badge="Real-Time Atomic Matrix"
        badgeVariant="brand"
        description="Comprehensive stock tracking, automated TTL checkout reservations, immutable transaction audit logs, and overselling guards."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
        >
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Stock (CSV)</span>
        </Button>
        <Button
          size="sm"
          onClick={() => {
            if (items.length > 0) {
              setSelectedItem(items[0])
              setAddStockOpen(true)
            }
          }}
          className="h-8.5 gap-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="size-3.5" />
          <span>Restock Units</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics Grid */}
      <InventoryMetrics
        items={items}
        lowStockAlerts={lowStockAlerts}
        isLoading={isInventoryLoading || isAlertsLoading}
      />

      {/* 3. First-Time User Onboarding & Stock Lifecycle Guide */}
      <InventoryGuideCard />

      {/* 4. Tabbed Subsystems */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border/60">
          <TabsTrigger value="matrix" className="text-xs gap-1.5 font-medium">
            <Layers className="size-3.5" />
            <span>Stock Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="text-xs gap-1.5 font-medium relative">
            <AlertTriangle className="size-3.5 text-amber-500" />
            <span>Low Stock Alerts</span>
            {lowStockAlerts.length > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
                {lowStockAlerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs gap-1.5 font-medium">
            <History className="size-3.5" />
            <span>Audit Ledger</span>
          </TabsTrigger>
          <TabsTrigger value="simulation" className="text-xs gap-1.5 font-medium">
            <Zap className="size-3.5 text-primary" />
            <span>Checkout Holds & QA</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Master Stock Matrix */}
        <TabsContent value="matrix" className="space-y-4">
          <DataTableToolbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q)
              setPage(1)
            }}
            searchPlaceholder="Search product name, SKU code, or barcode..."
            filters={
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value)
                  setPage(1)
                }}
                className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
              >
                <option value="all">All Inventory Levels</option>
                <option value="in_stock">In Stock (Healthy)</option>
                <option value="low">Low Stock (Alerts)</option>
                <option value="out">Out of Stock (0 units)</option>
              </select>
            }
            activeFiltersCount={stockFilter !== "all" ? 1 : 0}
            onResetFilters={() => {
              setStockFilter("all")
              setSearchQuery("")
              setPage(1)
            }}
          />

          <InventoryTable
            items={displayItems}
            total={total}
            totalPages={totalPages}
            page={page}
            pageSize={pageSize}
            isLoading={isInventoryLoading}
            hasActiveFilters={Boolean(searchQuery || stockFilter !== "all")}
            onAddStock={(item) => {
              setSelectedItem(item)
              setAddStockOpen(true)
            }}
            onRemoveStock={(item) => {
              setSelectedItem(item)
              setRemoveStockOpen(true)
            }}
            onAdjustStock={(item) => {
              setSelectedItem(item)
              setAdjustStockOpen(true)
            }}
            onReserveStock={(item) => {
              setSelectedItem(item)
              setReserveStockOpen(true)
            }}
            onViewTransactions={handleViewTransactionsForVariant}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onResetFilters={() => {
              setStockFilter("all")
              setSearchQuery("")
              setPage(1)
            }}
          />
        </TabsContent>

        {/* Tab 2: Low Stock Triage */}
        <TabsContent value="low-stock">
          <LowStockTriage
            alerts={lowStockAlerts}
            isLoading={isAlertsLoading}
            onRestock={handleRestockFromAlert}
            onRefresh={() => refetchAlerts()}
          />
        </TabsContent>

        {/* Tab 3: Immutable Transaction Audit Ledger */}
        <TabsContent value="transactions">
          <InventoryTransactionsTable
            items={transactionsData?.items ?? []}
            total={transactionsData?.pagination?.total ?? 0}
            totalPages={transactionsData?.pagination?.totalPages ?? 1}
            page={txPage}
            pageSize={txPageSize}
            isLoading={isTransactionsLoading}
            selectedType={txType}
            selectedReferenceType={txRefType}
            variantFilter={txVariantId}
            onTypeChange={(t) => {
              setTxType(t)
              setTxPage(1)
            }}
            onReferenceTypeChange={(r) => {
              setTxRefType(r)
              setTxPage(1)
            }}
            onVariantFilterChange={(v) => {
              setTxVariantId(v)
              setTxPage(1)
            }}
            onPageChange={setTxPage}
            onPageSizeChange={setTxPageSize}
            onResetFilters={() => {
              setTxType("")
              setTxRefType("")
              setTxVariantId("")
              setTxPage(1)
            }}
          />
        </TabsContent>

        {/* Tab 4: Checkout Hold Simulation & Expired Sweeper */}
        <TabsContent value="simulation">
          <CheckoutSimulationPane
            items={items}
            onSuccess={() => {
              refetchInventory()
              refetchAlerts()
              refetchTransactions()
            }}
          />
        </TabsContent>
      </Tabs>

      {/* 4. Action Modals */}
      <AddStockDialog
        item={selectedItem}
        open={addStockOpen}
        onOpenChange={setAddStockOpen}
        onSuccess={() => {
          refetchInventory()
          refetchAlerts()
          refetchTransactions()
        }}
      />

      <RemoveStockDialog
        item={selectedItem}
        open={removeStockOpen}
        onOpenChange={setRemoveStockOpen}
        onSuccess={() => {
          refetchInventory()
          refetchAlerts()
          refetchTransactions()
        }}
      />

      <AdjustStockDialog
        item={selectedItem}
        open={adjustStockOpen}
        onOpenChange={setAdjustStockOpen}
        onSuccess={() => {
          refetchInventory()
          refetchAlerts()
          refetchTransactions()
        }}
      />

      <ReserveStockDialog
        item={selectedItem}
        open={reserveStockOpen}
        onOpenChange={setReserveStockOpen}
        onSuccess={() => {
          refetchInventory()
          refetchAlerts()
          refetchTransactions()
        }}
      />
    </div>
  )
}
