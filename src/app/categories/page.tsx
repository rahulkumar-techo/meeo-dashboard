/**
 * @file page.tsx
 * @description Category Taxonomy & Facets Management Console (< 200 lines).
 * Connects to live /api/v1/categories/ endpoints for listing, filtering, updating, and deleting categories.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, RefreshCw, Search, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader, MetricGrid } from "@/components/common"
import { useCategoriesQuery } from "@/hooks/use-category-query"
import { CategoryTable } from "@/components/categories/category-table"
import { CategoryInspector } from "@/components/categories/category-inspector"
import { EditCategoryDialog } from "@/components/categories/edit-category-dialog"
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog"
import { PermissionGate } from "@/components/auth"
import type {
  Category,
  CategoryStatus,
  CategorySortBy,
  SortOrder,
} from "@/types/category"

export default function CategoriesPage() {
  // Query parameters state
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [sortBy, setSortBy] = React.useState<CategorySortBy>("sortOrder")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<CategoryStatus | "ALL">("ALL")
  const [selectedParentId, setSelectedParentId] = React.useState<string | undefined>(undefined)

  // Selected category for side inspector preview
  const [selectedCat, setSelectedCat] = React.useState<Category | null>(null)

  // Dialog states for updating and deleting categories
  const [categoryToEdit, setCategoryToEdit] = React.useState<Category | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [categoryToDelete, setCategoryToDelete] = React.useState<Category | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  // Debounce search input
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
    parentId: selectedParentId || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  }), [page, limit, sortBy, sortOrder, debouncedSearch, selectedParentId, statusFilter])

  // Fetch live categories via TanStack Query
  const { data, isLoading, isFetching, refetch } = useCategoriesQuery(queryParams)

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  // Automatically keep inspector panel in sync
  React.useEffect(() => {
    if (items.length > 0) {
      if (!selectedCat || !items.some((c) => c.id === selectedCat.id)) {
        setSelectedCat(items[0])
      } else {
        const updated = items.find((c) => c.id === selectedCat.id)
        if (updated) setSelectedCat(updated)
      }
    } else {
      setSelectedCat(null)
    }
  }, [items])

  // Derived KPI calculations
  const activeCount = React.useMemo(() => items.filter((c) => c.status === "ACTIVE").length, [items])
  const totalProducts = React.useMemo(() => items.reduce((acc, c) => acc + (c._count?.products ?? c.skusCount ?? 0), 0), [items])
  const totalSubcategories = React.useMemo(() => items.reduce((acc, c) => acc + (c._count?.children ?? 0), 0), [items])

  const handleOpenEdit = (cat: Category, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCategoryToEdit(cat)
    setIsEditDialogOpen(true)
  }

  const handleOpenDelete = (cat: Category, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCategoryToDelete(cat)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Category Taxonomy & Facets"
        badge={`${total} Categories`}
        badgeVariant="brand"
        module="category"
        description="Organize hierarchical catalog trees, manage product taxonomy, URL slugs, and faceted navigation."
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
        <PermissionGate permission="category:create">
          <Link href="/categories/create">
            <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              <Plus className="size-3.5" />
              <span>New Category</span>
            </Button>
          </Link>
        </PermissionGate>
      </PageHeader>

      {/* 2. KPI Metrics Grid */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Total Categories", value: `${total} Records`, colorTheme: "indigo", footnote: `${items.length} loaded on page` },
          { title: "Active Categories", value: `${activeCount} Published`, colorTheme: "emerald", badge: { text: "Live in Store", variant: "success" }, footnote: "Ready for storefront browsing" },
          { title: "Linked Products", value: `${totalProducts} SKUs`, colorTheme: "cyan", footnote: "Total mapped catalog items" },
          { title: "Subcategories Count", value: `${totalSubcategories} Nodes`, colorTheme: "amber", footnote: "Nested subcategory trees" },
        ]}
      />

      {/* 3. Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by category name, slug, description..."
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
              onChange={(e) => setSortBy(e.target.value as CategorySortBy)}
              className="h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="sortOrder">Sort Order</option>
              <option value="name">Name</option>
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

          {(search || statusFilter !== "ALL" || selectedParentId) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setDebouncedSearch(""); setStatusFilter("ALL"); setSelectedParentId(undefined); setPage(1) }}
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
          <CategoryTable
            items={items}
            total={total}
            totalPages={totalPages}
            page={page}
            pageSize={limit}
            isLoading={isLoading}
            selectedCat={selectedCat}
            hasActiveFilters={Boolean(debouncedSearch || statusFilter !== "ALL" || selectedParentId)}
            onSelectCategory={setSelectedCat}
            onEditCategory={handleOpenEdit}
            onDeleteCategory={handleOpenDelete}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => { setLimit(newSize); setPage(1) }}
          />
        </div>

        <div className="space-y-4 lg:col-span-4">
          <CategoryInspector
            selectedCat={selectedCat}
            onEdit={(cat) => handleOpenEdit(cat)}
            onDelete={(cat) => handleOpenDelete(cat)}
          />
        </div>
      </div>

      {/* Dialog Modals */}
      <EditCategoryDialog category={categoryToEdit} categories={items} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} onSuccess={() => refetch()} />
      <DeleteCategoryDialog category={categoryToDelete} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onSuccess={() => refetch()} />
    </div>
  )
}
