/**
 * @file product-table.tsx
 * @description Modular Table Component for rendering product catalog rows with status, images, taxonomy badges, and actions.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Edit2,
  Trash2,
  Package,
  FolderTree,
  Building2,
  Star,
  Plus,
  Rocket,
  Archive,
  FileEdit,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge, EmptyState, DataTablePagination } from "@/components/common"
import type { Product } from "@/types/product"

export interface ProductTableProps {
  items: Product[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  selectedProduct: Product | null
  hasActiveFilters: boolean
  onSelectProduct: (product: Product) => void
  onEditProduct: (product: Product, e: React.MouseEvent) => void
  onDeleteProduct: (product: Product, e: React.MouseEvent) => void
  onPublishProduct?: (product: Product, e: React.MouseEvent) => void
  onDraftProduct?: (product: Product, e: React.MouseEvent) => void
  onArchiveProduct?: (product: Product, e: React.MouseEvent) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function ProductTable({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  selectedProduct,
  hasActiveFilters,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  onPublishProduct,
  onDraftProduct,
  onArchiveProduct,
  onPageChange,
  onPageSizeChange,
}: ProductTableProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
            <TableHead className="font-bold pl-4">PRODUCT</TableHead>
            <TableHead className="font-bold">CATEGORY</TableHead>
            <TableHead className="font-bold">BRAND</TableHead>
            <TableHead className="font-bold text-center">VARIANTS</TableHead>
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
                  title="No Products Found"
                  description={
                    hasActiveFilters
                      ? "No products matched your search or filter options."
                      : "Create your first catalog product to start showcasing items."
                  }
                >
                  <Link href="/products/create">
                    <Button size="sm" className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Plus className="size-3.5" />
                      <span>Create Product</span>
                    </Button>
                  </Link>
                </EmptyState>
              </TableCell>
            </TableRow>
          ) : (
            items.map((prod) => {
              const isSelected = selectedProduct?.id === prod.id
              const heroImage = prod.images && prod.images.length > 0 ? prod.images[0].url : null
              const variantsCount = prod.variants?.length ?? prod.variantsCount ?? 0

              return (
                <TableRow
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-indigo-500/10 font-medium" : "hover:bg-muted/40"
                  }`}
                >
                  {/* Product Title & Hero Image */}
                  <TableCell className="pl-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/60">
                        {heroImage ? (
                          <Image
                            src={heroImage}
                            alt={prod.name}
                            width={40}
                            height={40}
                            className="size-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <Package className="size-4 text-muted-foreground/60" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-foreground truncate">{prod.name}</p>
                          {prod.isFeatured && (
                            <span title="Featured">
                              <Star className="size-3 fill-amber-500 text-amber-500 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          /products/{prod.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    {prod.category ? (
                      <Badge variant="outline" className="text-[10px] font-normal gap-1 py-0.5">
                        <FolderTree className="size-2.5 text-indigo-500" />
                        <span className="truncate max-w-[110px]">{prod.category.name}</span>
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Brand */}
                  <TableCell>
                    {prod.brand ? (
                      <Badge variant="outline" className="text-[10px] font-normal gap-1 py-0.5">
                        <Building2 className="size-2.5 text-emerald-500" />
                        <span className="truncate max-w-[110px]">{prod.brand.name}</span>
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Variants Count */}
                  <TableCell className="text-center font-mono text-[11px]">
                    <span className="inline-flex items-center gap-1 text-foreground">
                      <Package className="size-3 text-muted-foreground" />
                      {variantsCount} SKUs
                    </span>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <StatusBadge status={prod.status} showDot />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {/* Status quick toggle */}
                      {prod.status === "DRAFT" && onPublishProduct && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => onPublishProduct(prod, e)}
                          className="size-7 p-0 text-emerald-600 hover:bg-emerald-500/10 rounded-md"
                          title="Publish to Active"
                        >
                          <Rocket className="size-3.5" />
                        </Button>
                      )}
                      {prod.status === "ACTIVE" && onDraftProduct && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => onDraftProduct(prod, e)}
                          className="size-7 p-0 text-amber-600 hover:bg-amber-500/10 rounded-md"
                          title="Revert to Draft"
                        >
                          <FileEdit className="size-3.5" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => onEditProduct(prod, e)}
                        className="size-7 p-0 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-md"
                        title="Edit Product"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => onDeleteProduct(prod, e)}
                        className="size-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-md"
                        title="Delete Product"
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
        pageSize={pageSize}
        totalItems={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
