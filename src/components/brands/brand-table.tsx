/**
 * @file brand-table.tsx
 * @description Modular Table Component for rendering brand entities with actions.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit2, Trash2, Globe, ExternalLink, Package, Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge, EmptyState, DataTablePagination } from "@/components/common"
import type { Brand } from "@/types/brand"

export interface BrandTableProps {
  items: Brand[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  selectedBrand: Brand | null
  hasActiveFilters: boolean
  onSelectBrand: (brand: Brand) => void
  onEditBrand: (brand: Brand, e: React.MouseEvent) => void
  onDeleteBrand: (brand: Brand, e: React.MouseEvent) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function BrandTable({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  selectedBrand,
  hasActiveFilters,
  onSelectBrand,
  onEditBrand,
  onDeleteBrand,
  onPageChange,
  onPageSizeChange,
}: BrandTableProps) {
  const getMonogram = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
            <TableHead className="font-bold pl-4">BRAND / VENDOR</TableHead>
            <TableHead className="font-bold">DESCRIPTION</TableHead>
            <TableHead className="font-bold text-center">PRODUCTS</TableHead>
            <TableHead className="font-bold">STATUS</TableHead>
            <TableHead className="font-bold text-right pr-4">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs font-normal">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx} className="animate-pulse">
                <TableCell colSpan={5} className="py-4 text-center text-muted-foreground">
                  <div className="h-4 bg-muted/60 rounded w-full max-w-sm mx-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center">
                <EmptyState
                  title="No Brands Found"
                  description={
                    hasActiveFilters
                      ? "No brands matched your current query or filter criteria."
                      : "Register your first manufacturer or supplier brand."
                  }
                >
                  <Link href="/brands/create">
                    <Button size="sm" className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Plus className="size-3.5" />
                      <span>Register Brand</span>
                    </Button>
                  </Link>
                </EmptyState>
              </TableCell>
            </TableRow>
          ) : (
            items.map((b) => {
              const isSelected = selectedBrand?.id === b.id
              const prodCount = b._count?.products ?? 0

              return (
                <TableRow
                  key={b.id}
                  onClick={() => onSelectBrand(b)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-indigo-500/10 font-medium" : "hover:bg-muted/40"
                  }`}
                >
                  {/* Brand Logo & Name */}
                  <TableCell className="pl-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/60">
                        {b.logoUrl || b.logo ? (
                          <Image
                            src={b.logoUrl || b.logo || ""}
                            alt={b.name}
                            width={40}
                            height={40}
                            className="size-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-indigo-500/10 font-mono font-bold text-indigo-700 dark:text-indigo-300 text-xs">
                            {getMonogram(b.name)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{b.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          /brands/{b.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="max-w-[240px]">
                    <p className="truncate text-[11px] text-muted-foreground">
                      {b.description || "—"}
                    </p>
                  </TableCell>

                  {/* Products Count */}
                  <TableCell className="text-center font-mono text-[11px]">
                    <span className="inline-flex items-center gap-1 text-foreground">
                      <Package className="size-3 text-muted-foreground" />
                      {prodCount}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={b.status} showDot />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => onEditBrand(b, e)}
                        className="size-7 p-0 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-md"
                        title="Edit Brand"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => onDeleteBrand(b, e)}
                        className="size-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-md"
                        title="Delete Brand"
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
