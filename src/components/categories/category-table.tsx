/**
 * @file category-table.tsx
 * @description Modular Table Component for rendering category entities and actions.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit2, Trash2, FolderTree, Package, Plus } from "lucide-react"
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
import type { Category } from "@/types/category"

export interface CategoryTableProps {
  items: Category[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  selectedCat: Category | null
  hasActiveFilters: boolean
  onSelectCategory: (cat: Category) => void
  onEditCategory: (cat: Category, e: React.MouseEvent) => void
  onDeleteCategory: (cat: Category, e: React.MouseEvent) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function CategoryTable({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  selectedCat,
  hasActiveFilters,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
  onPageChange,
  onPageSizeChange,
}: CategoryTableProps) {
  return (
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
                    hasActiveFilters
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
                  onClick={() => onSelectCategory(cat)}
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
                        onClick={(e) => onEditCategory(cat, e)}
                        className="size-7 p-0 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-md"
                        title="Edit Category"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => onDeleteCategory(cat, e)}
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
        pageSize={pageSize}
        totalItems={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
