/**
 * @file category-inspector.tsx
 * @description Side card component for previewing selected category properties, hierarchy, and quick actions.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { Edit2, Trash2, FolderTree } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/common"
import type { Category } from "@/types/category"

export interface CategoryInspectorProps {
  selectedCat: Category | null
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
}

export function CategoryInspector({
  selectedCat,
  onEdit,
  onDelete,
}: CategoryInspectorProps) {
  if (!selectedCat) {
    return (
      <Card className="border-border/70 bg-card/95 shadow-2xs text-xs p-6 text-center text-muted-foreground">
        <FolderTree className="size-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="font-medium text-foreground">No Category Selected</p>
        <p className="text-[11px] mt-1">
          Select a category from the list to preview hierarchy properties and facets.
        </p>
      </Card>
    )
  }

  return (
    <Card className="border-border/70 bg-card/95 shadow-2xs text-xs overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Category Inspector</span>
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
            onClick={() => onEdit(selectedCat)}
            className="flex-1 h-8 text-xs gap-1.5 font-medium border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          >
            <Edit2 className="size-3.5" />
            <span>Edit Category</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(selectedCat)}
            className="h-8 text-xs gap-1.5 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-200 dark:border-rose-900/50"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
