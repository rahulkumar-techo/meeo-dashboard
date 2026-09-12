/**
 * @file page.tsx
 * @description Brand Registry & Vendor Partner Management Console (< 200 lines).
 * Connects to live /api/v1/brand endpoints for paginated listing, searching, sorting, and dialog operations.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, RefreshCw, Search, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader, MetricGrid } from "@/components/common"
import { useBrandsQuery } from "@/hooks/use-brand-query"
import { BrandTable } from "@/components/brands/brand-table"
import { BrandInspector } from "@/components/brands/brand-inspector"
import { EditBrandDialog } from "@/components/brands/edit-brand-dialog"
import { DeleteBrandDialog } from "@/components/brands/delete-brand-dialog"
import { PermissionGate } from "@/components/auth"
import type { Brand, BrandStatus, BrandSortBy, SortOrder } from "@/types/brand"

export default function BrandsPage() {
  // Query parameters state
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [sortBy, setSortBy] = React.useState<BrandSortBy>("name")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<BrandStatus | "ALL">("ALL")

  // Selected brand for detail inspection
  const [selectedBrand, setSelectedBrand] = React.useState<Brand | null>(null)

  // Dialog states for updating and deleting brands
  const [brandToEdit, setBrandToEdit] = React.useState<Brand | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [brandToDelete, setBrandToDelete] = React.useState<Brand | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  // Debounce search query to avoid excessive API requests
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  // Build query parameter payload
  const queryParams = React.useMemo(() => ({
    page,
    limit,
    sortBy,
    sortOrder,
    search: debouncedSearch.trim() || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  }), [page, limit, sortBy, sortOrder, debouncedSearch, statusFilter])

  // Fetch live brands via TanStack Query
  const { data, isLoading, isFetching, refetch } = useBrandsQuery(queryParams)

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  // Automatically keep the inspector panel in sync with the first item or active selection
  React.useEffect(() => {
    if (items.length > 0) {
      if (!selectedBrand || !items.some((b) => b.id === selectedBrand.id)) {
        setSelectedBrand(items[0])
      } else {
        const updated = items.find((b) => b.id === selectedBrand.id)
        if (updated) setSelectedBrand(updated)
      }
    } else {
      setSelectedBrand(null)
    }
  }, [items])

  // Derived KPI calculations
  const activeCount = React.useMemo(() => items.filter((b) => b.status === "ACTIVE").length, [items])
  const totalProducts = React.useMemo(() => items.reduce((acc, b) => acc + (b._count?.products ?? 0), 0), [items])

  const handleOpenEdit = (b: Brand, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setBrandToEdit(b)
    setIsEditOpen(true)
  }

  const handleOpenDelete = (b: Brand, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setBrandToDelete(b)
    setIsDeleteOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Brand Registry & Vendor Partnerships"
        badge={`${total} Brands`}
        badgeVariant="brand"
        module="brand"
        description="Manage verified manufacturer brands, official website domains, product lines, and vendor catalog distributions."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : "text-muted-foreground"}`} />
          <span>Refresh</span>
        </Button>
        <PermissionGate permission="brand:create">
          <Link href="/brands/create">
            <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              <Plus className="size-3.5" />
              <span>Register Brand</span>
            </Button>
          </Link>
        </PermissionGate>
      </PageHeader>

      {/* 2. KPI Metrics Grid */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Registered Brands", value: `${total} Records`, colorTheme: "indigo", footnote: `${items.length} loaded on page` },
          { title: "Active Brands", value: `${activeCount} Published`, colorTheme: "emerald", badge: { text: "Live in Store", variant: "success" }, footnote: "Available for product assignment" },
          { title: "Catalog Products Mapped", value: `${totalProducts} SKUs`, colorTheme: "cyan", footnote: "Total linked products" },
          { title: "Registry Status", value: "100% Synced", colorTheme: "emerald", badge: { text: "Verified", variant: "success" }, footnote: "Direct vendor catalog links" },
        ]}
      />

      {/* 3. Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand name, slug, description..."
            className="h-8.5 pl-8 text-xs bg-background/80"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
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

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as BrandSortBy)}
              className="h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="name">Brand Name</option>
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
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

          {(search || statusFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setDebouncedSearch(""); setStatusFilter("ALL"); setPage(1) }}
              className="h-8.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* 4. Split Layout: Table (Left) & Inspector (Right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          <BrandTable
            items={items}
            total={total}
            totalPages={totalPages}
            page={page}
            pageSize={limit}
            isLoading={isLoading}
            selectedBrand={selectedBrand}
            hasActiveFilters={Boolean(debouncedSearch || statusFilter !== "ALL")}
            onSelectBrand={setSelectedBrand}
            onEditBrand={handleOpenEdit}
            onDeleteBrand={handleOpenDelete}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => { setLimit(newSize); setPage(1) }}
          />
        </div>

        <div className="space-y-4 lg:col-span-4">
          <BrandInspector
            selectedBrand={selectedBrand}
            onEdit={(b) => handleOpenEdit(b)}
            onDelete={(b) => handleOpenDelete(b)}
          />
        </div>
      </div>

      {/* Dialog Modals */}
      <EditBrandDialog brand={brandToEdit} open={isEditOpen} onOpenChange={setIsEditOpen} onSuccess={() => refetch()} />
      <DeleteBrandDialog brand={brandToDelete} open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onSuccess={() => refetch()} />
    </div>
  )
}
