/**
 * @file page.tsx
 * @description Category Taxonomy & Management Console with Live API Integration.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  FolderTree,
  Package,
  Boxes,
  Sparkles,
  ExternalLink,
  ArrowUpDown,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Archive,
  Ban,
  Tag,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import { useCategoriesQuery } from "@/hooks/use-category-query"
import { EditCategoryDialog } from "@/components/categories/edit-category-dialog"
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog"
import type {
  Category,
  CategoryStatus,
  CategorySortBy,
  SortOrder,
} from "@/types/category"

export default function CategoriesPage() {
  // Query filters state
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [sortBy, setSortBy] = React.useState<CategorySortBy>("sortOrder")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<CategoryStatus | "ALL">("ALL")
  const [selectedParentId, setSelectedParentId] = React.useState<string | undefined>(undefined)

  // Selected category for detail panel preview
  const [selectedCat, setSelectedCat] = React.useState<Category | null>(null)

  // Dialog states
  const [categoryToEdit, setCategoryToEdit] = React.useState<Category | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [categoryToDelete, setCategoryToDelete] = React.useState<Category | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to page 1 on search
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  // Build query parameters
  const queryParams = React.useMemo(() => {
    return {
      page,
      limit,
      sortBy,
      sortOrder,
      search: debouncedSearch.trim() || undefined,
      parentId: selectedParentId || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    }
  }, [page, limit, sortBy, sortOrder, debouncedSearch, selectedParentId, statusFilter])

  // Fetch categories using TanStack Query
  const { data, isLoading, isFetching, refetch } = useCategoriesQuery(queryParams)

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  // Keep selected category in sync
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

  // Quick stats calculation
  const activeCount = React.useMemo(
    () => items.filter((c) => c.status === "ACTIVE").length,
    [items]
  )
  const totalProducts = React.useMemo(
    () => items.reduce((acc, c) => acc + (c._count?.products ?? c.skusCount ?? 0), 0),
    [items]
  )
  const totalSubcategories = React.useMemo(
    () => items.reduce((acc, c) => acc + (c._count?.children ?? 0), 0),
    [items]
  )

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
      {/* 1. Header */}
      <PageHeader
        title="Category Taxonomy & Facets"
        badge={`${total} Categories`}
        badgeVariant="brand"
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
        <Link href="/categories/create">
          <Button
            size="sm"
            className="h-8.5 gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>New Category</span>
          </Button>
        </Link>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          {
            title: "Total Categories",
            value: `${total} Records`,
            colorTheme: "indigo",
            footnote: `${items.length} loaded on page`,
          },
          {
            title: "Active Categories",
            value: `${activeCount} Published`,
            colorTheme: "emerald",
            badge: { text: "Live in Store", variant: "success" },
            footnote: "Ready for storefront browsing",
          },
          {
            title: "Linked Products",
            value: `${totalProducts} SKUs`,
            colorTheme: "cyan",
            footnote: "Total mapped catalog items",
          },
          {
            title: "Subcategories Count",
            value: `${totalSubcategories} Nodes`,
            colorTheme: "amber",
            footnote: "Nested subcategory trees",
          },
        ]}
      />

      {/* 3. Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by category name, slug, description..."
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

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any)
                setPage(1)
              }}
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

          {/* Reset Filters */}
          {(search || statusFilter !== "ALL" || selectedParentId) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setDebouncedSearch("")
                setStatusFilter("ALL")
                setSelectedParentId(undefined)
                setPage(1)
              }}
              className="h-8.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* 4. Split Layout: Table (Left) & Node Details (Right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Category Table */}
        <div className="space-y-3 lg:col-span-8">
          <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
                  <TableHead className="font-bold pl-4">CATEGORY</TableHead>
                  <TableHead className="font-bold">PARENT</TableHead>
                  <TableHead className="font-bold text-center">ORDER</TableHead>
                  <TableHead className="font-bold text-center">PRODUCTS</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-right pr-4">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx} className="animate-pulse">
                      <TableCell colSpan={6} className="py-4 text-center text-muted-foreground">
                        <div className="h-4 bg-muted/60 rounded w-full max-w-sm mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <EmptyState
                        title="No Categories Found"
                        description={
                          debouncedSearch || statusFilter !== "ALL"
                            ? "No categories matched your current query or filter criteria."
                            : "Create your first taxonomy category to organize your catalog products."
                        }
                      >
                        <Link href="/categories/create">
                          <Button size="sm" className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="size-3.5" />
                            <span>Create Category</span>
                          </Button>
                        </Link>
                      </EmptyState>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((cat) => {
                    const isSelected = selectedCat?.id === cat.id
                    const prodCount = cat._count?.products ?? cat.skusCount ?? 0
                    const childrenCount = cat._count?.children ?? 0

                    return (
                      <TableRow
                        key={cat.id}
                        onClick={() => setSelectedCat(cat)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-indigo-500/10 font-medium" : "hover:bg-muted/40"
                        }`}
                      >
                        {/* Category Name, Image & Slug */}
                        <TableCell className="pl-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative size-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/60">
                              {cat.imageUrl ? (
                                <Image
                                  src={cat.imageUrl}
                                  alt={cat.name}
                                  width={40}
                                  height={40}
                                  className="size-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <FolderTree className="size-4 text-muted-foreground/70" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{cat.name}</p>
                              <p className="text-[11px] text-muted-foreground font-mono truncate">
                                /c/{cat.slug}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Parent */}
                        <TableCell>
                          {cat.parent ? (
                            <Badge variant="outline" className="text-[10px] font-normal gap-1 py-0.5">
                              <FolderTree className="size-2.5 text-indigo-500" />
                              <span className="truncate max-w-[100px]">{cat.parent.name}</span>
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Root (Top)</span>
                          )}
                        </TableCell>

                        {/* Sort Order */}
                        <TableCell className="text-center font-mono text-[11px]">
                          {cat.sortOrder ?? 0}
                        </TableCell>

                        {/* Products / Subcategories Count */}
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-foreground">
                              <Package className="size-3 text-muted-foreground" />
                              {prodCount}
                            </span>
                            {childrenCount > 0 && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-mono">
                                +{childrenCount} subs
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <StatusBadge status={cat.status} showDot />
                        </TableCell>

                        {/* Actions: Edit & Delete */}
                        <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleOpenEdit(cat, e)}
                              className="size-7 p-0 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-md"
                              title="Edit Category"
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleOpenDelete(cat, e)}
                              className="size-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-md"
                              title="Delete Category"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={limit}
              totalItems={total}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setLimit(newSize)
                setPage(1)
              }}
            />
          </div>
        </div>

        {/* Right: Selected Category Details & Quick Inspector */}
        <div className="space-y-4 lg:col-span-4">
          {selectedCat ? (
            <Card className="border-border/70 bg-card/95 shadow-2xs text-xs overflow-hidden">
              <CardHeader className="p-4 pb-3 border-b border-border/60 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Category Inspector</span>
                  </div>
                  <StatusBadge status={selectedCat.status} showDot />
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Image Cover Preview */}
                {selectedCat.imageUrl && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border/60 bg-muted">
                    <Image
                      src={selectedCat.imageUrl}
                      alt={selectedCat.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {/* Primary Info */}
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedCat.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">/c/{selectedCat.slug}</p>
                </div>

                {/* Description */}
                <div>
                  <span className="text-muted-foreground text-[10.5px] font-semibold uppercase tracking-wider">
                    Description
                  </span>
                  <p className="mt-1 text-muted-foreground leading-relaxed text-xs">
                    {selectedCat.description || "No description provided for this category."}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Parent Node
                    </span>
                    <span className="text-xs font-medium text-foreground truncate block mt-0.5">
                      {selectedCat.parent?.name || "None (Root)"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Sort Order
                    </span>
                    <span className="text-xs font-mono font-medium text-foreground block mt-0.5">
                      {selectedCat.sortOrder ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Products Mapped
                    </span>
                    <span className="text-xs font-mono font-semibold text-foreground block mt-0.5">
                      {selectedCat._count?.products ?? selectedCat.skusCount ?? 0} SKUs
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Subcategories
                    </span>
                    <span className="text-xs font-mono font-semibold text-foreground block mt-0.5">
                      {selectedCat._count?.children ?? 0} Nodes
                    </span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-1 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
                  {selectedCat.createdAt && (
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-mono text-foreground">
                        {new Date(selectedCat.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {selectedCat.updatedAt && (
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span className="font-mono text-foreground">
                        {new Date(selectedCat.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Inspector Actions */}
                <div className="flex items-center gap-2 border-t border-border/60 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(selectedCat)}
                    className="flex-1 h-8 text-xs gap-1.5 font-medium border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  >
                    <Edit2 className="size-3.5" />
                    <span>Edit Category</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDelete(selectedCat)}
                    className="h-8 text-xs gap-1.5 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-200 dark:border-rose-900/50"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/70 bg-card/95 shadow-2xs text-xs p-6 text-center text-muted-foreground">
              <FolderTree className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-medium text-foreground">No Category Selected</p>
              <p className="text-[11px] mt-1">
                Select a category from the list to preview hierarchy properties and facets.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Category Modal */}
      <EditCategoryDialog
        category={categoryToEdit}
        categories={items}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* Delete Category Modal */}
      <DeleteCategoryDialog
        category={categoryToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
