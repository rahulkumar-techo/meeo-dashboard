/**
 * @file page.tsx
 * @description Dedicated Product Variants & SKU Matrix Management Console (< 230 lines).
 * Connects to live /api/v1/products/:productId/variants endpoints for listing, creating, and batch generation.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Grid,
  Search,
  RefreshCw,
  ArrowUpDown,
  Layers,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader, MetricGrid } from "@/components/common"
import { useProductQuery } from "@/hooks/use-product-query"
import { useProductVariantsQuery } from "@/hooks/use-variant-query"
import { VariantTable } from "@/components/variants/variant-table"
import { CreateVariantDialog } from "@/components/variants/create-variant-dialog"
import { BatchVariantDialog } from "@/components/variants/batch-variant-dialog"
import { EditVariantDialog } from "@/components/variants/edit-variant-dialog"
import { DeleteVariantDialog } from "@/components/variants/delete-variant-dialog"
import type { ProductVariant, VariantSortBy, VariantSortOrder, VariantStatus } from "@/types/variant"

export default function ProductVariantsPage() {
  const params = useParams()
  const productId = (params?.id as string) || ""

  // Query parameters state
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [sortBy, setSortBy] = React.useState<VariantSortBy>("createdAt")
  const [sortOrder, setSortOrder] = React.useState<VariantSortOrder>("desc")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<VariantStatus | "ALL">("ALL")

  // Modal dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isBatchOpen, setIsBatchOpen] = React.useState(false)
  const [variantToEdit, setVariantToEdit] = React.useState<ProductVariant | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [variantToDelete, setVariantToDelete] = React.useState<ProductVariant | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  // Fetch parent product & live variants
  const { data: product, isLoading: isProductLoading } = useProductQuery(productId)

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const queryParams = React.useMemo(() => ({
    page,
    limit,
    sortBy,
    sortOrder,
    search: debouncedSearch.trim() || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  }), [page, limit, sortBy, sortOrder, debouncedSearch, statusFilter])

  const { data, isLoading, isFetching, refetch } = useProductVariantsQuery(productId, queryParams)

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  // Derived KPI metrics
  const totalStock = React.useMemo(() => {
    return items.reduce((acc, v) => {
      const reserved = Number(v.inventory?.reservedQuantity ?? 0)
      const available = Number(v.inventory?.availableQuantity ?? 0)
      const stock =
        v.inventory?.quantity !== undefined && v.inventory.quantity !== null
          ? Number(v.inventory.quantity)
          : available + reserved
      return acc + stock
    }, 0)
  }, [items])

  const outOfStockCount = React.useMemo(() => {
    return items.filter((v) => {
      const reserved = Number(v.inventory?.reservedQuantity ?? 0)
      const available = Number(v.inventory?.availableQuantity ?? 0)
      const stock =
        v.inventory?.quantity !== undefined && v.inventory.quantity !== null
          ? Number(v.inventory.quantity)
          : available + reserved
      return stock <= 0
    }).length
  }, [items])

  const avgPrice = React.useMemo(() => {
    if (items.length === 0) return "$0.00"
    const sum = items.reduce((acc, v) => {
      const p = typeof v.price === "number" ? v.price : parseFloat(String(v.price || 0))
      return acc + (isNaN(p) ? 0 : p)
    }, 0)
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      sum / items.length
    )
  }, [items])

  const handleEditClick = (variant: ProductVariant) => {
    setVariantToEdit(variant)
    setIsEditOpen(true)
  }

  const handleDeleteClick = (variant: ProductVariant) => {
    setVariantToDelete(variant)
    setIsDeleteOpen(true)
  }

  if (isProductLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
        <p className="text-xs text-muted-foreground">Loading parent product & variants...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1500px] mx-auto">
      {/* 1. Back Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link href={`/products/${productId}/edit`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Product Details</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBatchOpen(true)}
            className="h-8.5 gap-1.5 text-xs border-indigo-200 text-indigo-600 dark:border-indigo-900/60 dark:text-indigo-400 hover:bg-indigo-500/10 font-medium"
          >
            <Grid className="size-3.5" />
            <span>Matrix Generator</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8.5 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>New Variant</span>
          </Button>
        </div>
      </div>

      <PageHeader
        title={`Variants: ${product?.name || "Product"}`}
        badge={`${total} SKUs`}
        badgeVariant="brand"
        description="Configure multi-attribute variants, individual SKU prices, barcodes, and inventory thresholds."
      />

      {/* 2. KPI Metrics Grid */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Total SKUs", value: `${total} Records`, colorTheme: "indigo", footnote: `${items.length} loaded on page` },
          { title: "Total Units in Stock", value: `${totalStock} Units`, colorTheme: "emerald", footnote: "Live on-hand inventory" },
          { title: "Out of Stock", value: `${outOfStockCount} SKUs`, colorTheme: outOfStockCount > 0 ? "rose" : "amber", footnote: "Requires replenishment" },
          { title: "Average Selling Price", value: avgPrice, colorTheme: "cyan", footnote: "Across active variants" },
        ]}
      />

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU code, barcode, or attribute..."
            className="h-8.5 pl-8 text-xs bg-background/80"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1) }}
              className="h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as VariantSortBy)}
              className="h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="createdAt">Created Date</option>
              <option value="sku">SKU Code</option>
              <option value="price">Price</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="h-8.5 gap-1 text-xs border-border/80 px-2.5"
            title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <span className="uppercase font-mono text-[10px]">{sortOrder}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8.5 px-2.5 text-xs border-border/80"
            title="Refresh variants"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : "text-muted-foreground"}`} />
          </Button>
        </div>
      </div>

      {/* 4. Variant Table */}
      <VariantTable
        items={items}
        total={total}
        totalPages={totalPages}
        page={page}
        pageSize={limit}
        isLoading={isLoading}
        hasActiveFilters={Boolean(debouncedSearch || statusFilter !== "ALL")}
        onCreateClick={() => setIsCreateOpen(true)}
        onBatchClick={() => setIsBatchOpen(true)}
        onEditVariant={handleEditClick}
        onDeleteVariant={handleDeleteClick}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => { setLimit(newSize); setPage(1) }}
      />

      {/* 5. Modals & Dialogs */}
      <CreateVariantDialog
        productId={productId}
        productName={product?.name}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => refetch()}
      />

      <BatchVariantDialog
        productId={productId}
        productName={product?.name}
        productSlug={product?.slug}
        open={isBatchOpen}
        onOpenChange={setIsBatchOpen}
        onSuccess={() => refetch()}
      />

      <EditVariantDialog
        variant={variantToEdit}
        productId={productId}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={() => refetch()}
      />

      <DeleteVariantDialog
        variant={variantToDelete}
        productId={productId}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
