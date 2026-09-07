/**
 * @file attribute-table.tsx
 * @description Data table displaying master product attributes, value badges, and actions.
 */

"use client"

import * as React from "react"
import { Tag, Edit2, Trash2, Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState, DataTablePagination } from "@/components/common"
import type { Attribute } from "@/types/attribute"

export interface AttributeTableProps {
  items: Attribute[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  hasActiveFilters?: boolean
  onCreateClick: () => void
  onEditAttribute: (attr: Attribute) => void
  onDeleteAttribute: (attr: Attribute) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function AttributeTable({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  hasActiveFilters,
  onCreateClick,
  onEditAttribute,
  onDeleteAttribute,
  onPageChange,
  onPageSizeChange,
}: AttributeTableProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader className="bg-muted/40 text-xs">
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4 font-semibold text-foreground">Attribute Name</TableHead>
            <TableHead className="font-semibold text-foreground">Configured Values</TableHead>
            <TableHead className="text-center font-semibold text-foreground">Values Count</TableHead>
            <TableHead className="font-semibold text-foreground">Created Date</TableHead>
            <TableHead className="text-right pr-4 font-semibold text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="text-xs">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx} className="animate-pulse">
                <TableCell className="pl-4 py-4"><div className="h-4 w-28 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-48 bg-muted rounded" /></TableCell>
                <TableCell className="text-center"><div className="h-4 w-12 bg-muted rounded mx-auto" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                <TableCell className="pr-4 text-right"><div className="h-4 w-16 bg-muted rounded ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center">
                <EmptyState
                  title={hasActiveFilters ? "No attributes match search" : "No Master Attributes Created"}
                  description={
                    hasActiveFilters
                      ? "Try searching for a different attribute name."
                      : "Define reusable attributes like Color, Size, Material, or Storage Capacity to generate SKU variant options."
                  }
                >
                  <Button
                    size="sm"
                    onClick={onCreateClick}
                    className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs mt-2"
                  >
                    <Plus className="size-3.5" />
                    <span>Create Attribute</span>
                  </Button>
                </EmptyState>
              </TableCell>
            </TableRow>
          ) : (
            items.map((attr) => {
              const values = attr.values ?? []
              const count = attr._count?.values ?? values.length

              return (
                <TableRow key={attr.id} className="hover:bg-muted/30 transition-colors">
                  {/* Name */}
                  <TableCell className="pl-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Tag className="size-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-foreground">{attr.name}</span>
                    </div>
                  </TableCell>

                  {/* Values preview */}
                  <TableCell>
                    {values.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1 max-w-md">
                        {values.slice(0, 6).map((v) => (
                          <Badge
                            key={v.id}
                            variant="secondary"
                            className="text-[10px] font-normal px-2 py-0.5 bg-muted/60 text-foreground"
                          >
                            {v.value}
                          </Badge>
                        ))}
                        {values.length > 6 && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            +{values.length - 6} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">
                        No values configured yet
                      </span>
                    )}
                  </TableCell>

                  {/* Count */}
                  <TableCell className="text-center font-mono text-[11px]">
                    <Badge variant="outline" className="px-2 py-0.5 font-mono text-[11px]">
                      {count} {count === 1 ? "value" : "values"}
                    </Badge>
                  </TableCell>

                  {/* Created Date */}
                  <TableCell className="text-muted-foreground text-[11px] font-mono">
                    {formatDate(attr.createdAt)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditAttribute(attr)}
                        className="h-7 px-2.5 text-xs gap-1.5 text-indigo-600 hover:bg-indigo-500/10 rounded-md font-medium"
                        title="Edit Attribute & Values"
                      >
                        <Edit2 className="size-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteAttribute(attr)}
                        className="size-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-md"
                        title="Delete Attribute"
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
