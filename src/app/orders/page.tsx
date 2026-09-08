/**
 * @file page.tsx
 * @description Central Order Management & Fulfillment Console with live state machine transitions, carrier dispatch, and analytics metrics.
 */

"use client"

import * as React from "react"
import {
  Download,
  TimerOff,
  ShoppingBag,
  Truck,
  CheckCheck,
  XCircle,
  Clock,
  Layers,
  RefreshCw,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PageHeader, DataTableToolbar } from "@/components/common"
import {
  useAdminOrdersQuery,
  useAdminOrderMetricsQuery,
  useConfirmOrderMutation,
  useProcessOrderMutation,
} from "@/hooks/use-order-query"
import {
  OrderMetrics,
  OrderTable,
  OrderDetailSheet,
  ShipOrderDialog,
  DeliverOrderDialog,
  CancelOrderDialog,
  UpdateStatusDialog,
  ExpireStaleDialog,
  OrderGuideCard,
} from "@/components/orders"
import type { AdminOrder, OrderStatus } from "@/types/order"

export default function OrdersPage() {
  // Navigation tab state
  const [activeTab, setActiveTab] = React.useState<string>("all")

  // Query & pagination state
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Dialog & Slide-over states
  const [selectedOrder, setSelectedOrder] = React.useState<AdminOrder | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [shipDialogOpen, setShipDialogOpen] = React.useState(false)
  const [deliverDialogOpen, setDeliverDialogOpen] = React.useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false)
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = React.useState(false)
  const [expireStaleDialogOpen, setExpireStaleDialogOpen] = React.useState(false)

  // Map active tab to effective status filter if specific tab selected
  const effectiveStatus = React.useMemo(() => {
    if (statusFilter !== "all") return statusFilter
    if (activeTab === "active") return undefined // we filter in-memory or pass list
    if (activeTab === "delivered") return "DELIVERED"
    if (activeTab === "cancelled") return "CANCELLED"
    return undefined
  }, [activeTab, statusFilter])

  // Queries
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useAdminOrdersQuery({
    page,
    limit: pageSize,
    search: searchQuery.trim() || undefined,
    status: effectiveStatus,
  })

  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useAdminOrderMetricsQuery()

  // Mutations
  const confirmMutation = useConfirmOrderMutation()
  const processMutation = useProcessOrderMutation()

  const items = ordersData?.items ?? []
  const total = ordersData?.pagination?.total ?? items.length
  const totalPages = ordersData?.pagination?.totalPages ?? 1

  // In-memory filter for Active Pipeline tab if tab is selected
  const displayItems = React.useMemo(() => {
    if (activeTab === "active") {
      const activeStates: OrderStatus[] = [
        "PENDING",
        "PAYMENT_PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
      ]
      return items.filter((o) => activeStates.includes(o.status))
    }
    return items
  }, [items, activeTab])

  // Refetch all queries after any action
  const handleDataRefresh = () => {
    refetchOrders()
    refetchMetrics()
  }

  // Action handlers
  const handleInspect = (order: AdminOrder) => {
    setSelectedOrder(order)
    setIsSheetOpen(true)
  }

  const handleConfirmOrder = async (order: AdminOrder) => {
    try {
      await confirmMutation.mutateAsync(order.id)
      handleDataRefresh()
    } catch (err) {
      console.error("Failed to confirm order", err)
    }
  }

  const handleProcessOrder = async (order: AdminOrder) => {
    try {
      await processMutation.mutateAsync(order.id)
      handleDataRefresh()
    } catch (err) {
      console.error("Failed to process order", err)
    }
  }

  const handleShipOrder = (order: AdminOrder) => {
    setSelectedOrder(order)
    setShipDialogOpen(true)
  }

  const handleDeliverOrder = (order: AdminOrder) => {
    setSelectedOrder(order)
    setDeliverDialogOpen(true)
  }

  const handleCancelOrder = (order: AdminOrder) => {
    setSelectedOrder(order)
    setCancelDialogOpen(true)
  }

  const handleUpdateStatus = (order: AdminOrder) => {
    setSelectedOrder(order)
    setUpdateStatusDialogOpen(true)
  }

  // Client-side CSV export generator
  const handleExportCSV = () => {
    if (items.length === 0) return
    const headers = [
      "Order Number",
      "Customer Email",
      "Recipient Name",
      "Status",
      "Items Count",
      "Subtotal",
      "Shipping",
      "Tax",
      "Grand Total",
      "Created At",
    ]
    const rows = items.map((o) => [
      o.orderNumber,
      `"${o.user?.email || ""}"`,
      `"${o.address?.recipientName || ""}"`,
      o.status,
      o.itemCount || o.items?.length || 1,
      o.subtotal,
      o.shippingTotal,
      o.taxTotal,
      o.grandTotal,
      o.createdAt,
    ])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `orders_export_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Orders & Live Fulfillment"
        badge="Realtime Operations"
        badgeVariant="brand"
        description="Omnichannel order triage, inventory hold commitments, courier tracking dispatch, and terminal delivery settlements."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpireStaleDialogOpen(true)}
          className="h-8.5 gap-1.5 text-xs font-medium border-amber-500/40 hover:bg-amber-500/10 text-foreground"
        >
          <TimerOff className="size-3.5 text-amber-600" />
          <span>Sweep Stale Holds</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
        >
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Orders</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics Grid */}
      <OrderMetrics metrics={metricsData} isLoading={isMetricsLoading} />

      {/* 3. Onboarding & Fulfillment State Machine Guide */}
      <OrderGuideCard />

      {/* 4. Tabbed Views */}
      <Tabs
        value={activeTab}
        onValueChange={(tab) => {
          setActiveTab(tab)
          setStatusFilter("all")
          setPage(1)
        }}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border/60">
          <TabsTrigger value="all" className="text-xs gap-1.5 font-medium">
            <Layers className="size-3.5" />
            <span>All Orders</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs gap-1.5 font-medium relative">
            <Truck className="size-3.5 text-cyan-600" />
            <span>Active Pipeline</span>
            {metricsData?.activeFulfillments ? (
              <span className="ml-1 rounded-full bg-cyan-600 text-white px-1.5 py-0.2 text-[10px] font-bold">
                {metricsData.activeFulfillments}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="delivered" className="text-xs gap-1.5 font-medium">
            <CheckCheck className="size-3.5 text-emerald-600" />
            <span>Delivered & Settled</span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs gap-1.5 font-medium">
            <XCircle className="size-3.5 text-rose-600" />
            <span>Cancelled / Expired</span>
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
            searchPlaceholder="Search order number, customer name, email address..."
            filters={
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending (Cart Hold)</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing (Packing)</option>
                <option value="SHIPPED">Shipped (In Transit)</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            }
            activeFiltersCount={statusFilter !== "all" ? 1 : 0}
            onResetFilters={() => {
              setStatusFilter("all")
              setSearchQuery("")
              setPage(1)
            }}
          />

          {/* Orders Table */}
          <OrderTable
            items={displayItems}
            total={total}
            totalPages={totalPages}
            page={page}
            pageSize={pageSize}
            isLoading={isOrdersLoading}
            hasActiveFilters={Boolean(searchQuery || statusFilter !== "all")}
            onInspect={handleInspect}
            onConfirm={handleConfirmOrder}
            onProcess={handleProcessOrder}
            onShip={handleShipOrder}
            onDeliver={handleDeliverOrder}
            onUpdateStatus={handleUpdateStatus}
            onCancel={handleCancelOrder}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onResetFilters={() => {
              setStatusFilter("all")
              setSearchQuery("")
              setPage(1)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* 5. Slide-Over Order Detail Inspector */}
      <OrderDetailSheet
        order={selectedOrder}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onConfirm={(order) => {
          handleConfirmOrder(order)
          setIsSheetOpen(false)
        }}
        onProcess={(order) => {
          handleProcessOrder(order)
          setIsSheetOpen(false)
        }}
        onShip={(order) => {
          setIsSheetOpen(false)
          handleShipOrder(order)
        }}
        onDeliver={(order) => {
          setIsSheetOpen(false)
          handleDeliverOrder(order)
        }}
        onCancel={(order) => {
          setIsSheetOpen(false)
          handleCancelOrder(order)
        }}
        onUpdateStatus={(order) => {
          setIsSheetOpen(false)
          handleUpdateStatus(order)
        }}
      />

      {/* 6. Action Modals */}
      <ShipOrderDialog
        order={selectedOrder}
        open={shipDialogOpen}
        onOpenChange={setShipDialogOpen}
        onSuccess={handleDataRefresh}
      />

      <DeliverOrderDialog
        order={selectedOrder}
        open={deliverDialogOpen}
        onOpenChange={setDeliverDialogOpen}
        onSuccess={handleDataRefresh}
      />

      <CancelOrderDialog
        order={selectedOrder}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onSuccess={handleDataRefresh}
      />

      <UpdateStatusDialog
        order={selectedOrder}
        open={updateStatusDialogOpen}
        onOpenChange={setUpdateStatusDialogOpen}
        onSuccess={handleDataRefresh}
      />

      <ExpireStaleDialog
        open={expireStaleDialogOpen}
        onOpenChange={setExpireStaleDialogOpen}
        onSuccess={handleDataRefresh}
      />
    </div>
  )
}
