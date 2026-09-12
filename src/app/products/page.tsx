/**
 * @file page.tsx
 * @description Product Catalog Management Console (< 230 lines).
 * Connects to live /api/v1/products endpoints for listing, filtering, publishing, and deleting products.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, RefreshCw, Search, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader, MetricGrid } from "@/components/common"
import {
  useProductsQuery,
  usePublishProductMutation,
  useDraftProductMutation,
  useArchiveProductMutation,
} from "@/hooks/use-product-query"
import { useCategoriesQuery } from "@/hooks/use-category-query"
import { useBrandsQuery } from "@/hooks/use-brand-query"
import { ProductTable } from "@/components/products/product-table"
import { ProductInspector } from "@/components/products/product-inspector"
import { DeleteProductDialog } from "@/components/products/delete-product-dialog"
import { PermissionGate } from "@/components/auth"
import type { Product, ProductStatus, ProductSortBy, SortOrder } from "@/types/product"

export default function ProductsPage() {
  const router = useRouter()

  // Query parameters state
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [sortBy, setSortBy] = React.useState<ProductSortBy>("createdAt")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<ProductStatus | "ALL">("ALL")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL")
  const [brandFilter, setBrandFilter] = React.useState<string>("ALL")

  // Selected product for inspector preview
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

  // Dialog states
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  // Fetch taxonomy and brand options for filters and modals
  const { data: categoriesData } = useCategoriesQuery({ limit: 100 })
  const { data: brandsData } = useBrandsQuery({ limit: 100 })
  const categories = categoriesData?.items ?? []
  const brands = brandsData?.items ?? []

  // Status transitions mutations
  const publishMutation = usePublishProductMutation()
  const draftMutation = useDraftProductMutation()
  const archiveMutation = useArchiveProductMutation()

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
    status: statusFilter === "ALL" ? undefined : statusFilter,
    categoryId: categoryFilter === "ALL" ? undefined : categoryFilter,
    brandId: brandFilter === "ALL" ? undefined : brandFilter,
  }), [page, limit, sortBy, sortOrder, debouncedSearch, statusFilter, categoryFilter, brandFilter])

  // Fetch live products
  const { data, isLoading, isFetching, refetch } = useProductsQuery(queryParams)

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  // Keep inspector in sync
  React.useEffect(() => {
    if (items.length > 0) {
      if (!selectedProduct || !items.some((p) => p.id === selectedProduct.id)) {
        setSelectedProduct(items[0])
      } else {
        const updated = items.find((p) => p.id === selectedProduct.id)
        if (updated) setSelectedProduct(updated)
      }
    } else {
      setSelectedProduct(null)
    }
  }, [items])

  // Derived KPI metrics
  const activeCount = React.useMemo(() => items.filter((p) => p.status === "ACTIVE").length, [items])
  const draftCount = React.useMemo(() => items.filter((p) => p.status === "DRAFT").length, [items])
  const featuredCount = React.useMemo(() => items.filter((p) => p.isFeatured).length, [items])

  const handleOpenEdit = (p: Product, e?: React.MouseEvent) => {
    e?.stopPropagation()
    router.push(`/products/${p.id}/edit`)
  }

  const handleOpenDelete = (p: Product, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setProductToDelete(p)
    setIsDeleteOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Product Catalog & Inventory Items"
        badge={`${total} Products`}
        badgeVariant="brand"
        module="product"
        description="Manage catalog products, multi-variant SKUs, media gallery assets, brand associations, and SEO metadata."
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
        <PermissionGate permission="product:create">
          <Link href="/products/create">
            <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              <Plus className="size-3.5" />
              <span>New Product</span>
            </Button>
          </Link>
        </PermissionGate>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Catalog Items", value: `${total} Records`, colorTheme: "indigo", footnote: `${items.length} loaded on page` },
          { title: "Active in Store", value: `${activeCount} Published`, colorTheme: "emerald", badge: { text: "Live Storefront", variant: "success" }, footnote: "Publicly visible to shoppers" },
          { title: "Draft Products", value: `${draftCount} Pending`, colorTheme: "amber", footnote: "Unpublished catalog items" },
          { title: "Featured Highlights", value: `${featuredCount} Featured`, colorTheme: "cyan", footnote: "Homepage & deals showcase" },
        ]}
      />

      {/* 3. Search & Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, slug, description..."
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
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
              className="h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring max-w-[140px]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortBy)}
              className="h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="createdAt">Created Date</option>
              <option value="name">Name</option>
              <option value="updatedAt">Updated Date</option>
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

          {(search || statusFilter !== "ALL" || categoryFilter !== "ALL" || brandFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setDebouncedSearch(""); setStatusFilter("ALL"); setCategoryFilter("ALL"); setBrandFilter("ALL"); setPage(1) }}
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
          <ProductTable
            items={items}
            total={total}
            totalPages={totalPages}
            page={page}
            pageSize={limit}
            isLoading={isLoading}
            selectedProduct={selectedProduct}
            hasActiveFilters={Boolean(debouncedSearch || statusFilter !== "ALL" || categoryFilter !== "ALL" || brandFilter !== "ALL")}
            onSelectProduct={setSelectedProduct}
            onEditProduct={handleOpenEdit}
            onDeleteProduct={handleOpenDelete}
            onPublishProduct={(p) => publishMutation.mutate(p.id)}
            onDraftProduct={(p) => draftMutation.mutate(p.id)}
            onArchiveProduct={(p) => archiveMutation.mutate(p.id)}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => { setLimit(newSize); setPage(1) }}
          />
        </div>

        <div className="space-y-4 lg:col-span-4">
          <ProductInspector
            selectedProduct={selectedProduct}
            onEdit={(p) => handleOpenEdit(p)}
            onDelete={(p) => handleOpenDelete(p)}
            onPublish={(p) => publishMutation.mutate(p.id)}
            onDraft={(p) => draftMutation.mutate(p.id)}
            onArchive={(p) => archiveMutation.mutate(p.id)}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteProductDialog
        product={productToDelete}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
