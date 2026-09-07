/**
 * @file product-inspector.tsx
 * @description Inspector panel for viewing selected product media, taxonomy, status, and quick actions.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import {
  Edit2,
  Trash2,
  Rocket,
  Archive,
  FileEdit,
  FolderTree,
  Building2,
  Package,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/common"
import type { Product } from "@/types/product"

export interface ProductInspectorProps {
  selectedProduct: Product | null
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onPublish: (product: Product) => void
  onDraft: (product: Product) => void
  onArchive: (product: Product) => void
}

export function ProductInspector({
  selectedProduct,
  onEdit,
  onDelete,
  onPublish,
  onDraft,
  onArchive,
}: ProductInspectorProps) {
  if (!selectedProduct) {
    return (
      <Card className="border-border/70 bg-card/95 shadow-2xs text-xs p-6 text-center text-muted-foreground">
        <Package className="size-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="font-medium text-foreground">No Product Selected</p>
        <p className="text-[11px] mt-1">
          Select a product from the list to view gallery images, SKU variants, and publishing options.
        </p>
      </Card>
    )
  }

  const images = selectedProduct.images ?? []
  const heroImage = images.length > 0 ? images[0].url : null
  const variantsCount = selectedProduct.variants?.length ?? selectedProduct.variantsCount ?? 0

  return (
    <Card className="border-border/70 bg-card/95 shadow-2xs text-xs overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">Product Details</span>
            {selectedProduct.isFeatured && (
              <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 gap-1 font-semibold">
                <Star className="size-2.5 fill-amber-500 text-amber-500" />
                Featured
              </Badge>
            )}
          </div>
          <StatusBadge status={selectedProduct.status} showDot />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Cover / Hero Image */}
        {heroImage ? (
          <div className="relative w-full h-36 rounded-lg overflow-hidden border border-border/60 bg-muted">
            <Image
              src={heroImage}
              alt={selectedProduct.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-28 w-full items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/30 text-muted-foreground text-xs gap-1">
            <Package className="size-6 text-muted-foreground/50" />
            <span>No image attached</span>
          </div>
        )}

        {/* Gallery Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative size-12 shrink-0 rounded-md overflow-hidden border border-border/60 bg-muted">
                <Image src={img.url} alt={img.altText || "Gallery"} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        )}

        {/* Primary Info */}
        <div>
          <h3 className="text-base font-bold text-foreground">{selectedProduct.name}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            /products/{selectedProduct.slug}
          </p>
        </div>

        {/* Description */}
        <div>
          <span className="text-muted-foreground text-[10.5px] font-semibold uppercase tracking-wider">
            Description
          </span>
          <p className="mt-1 text-muted-foreground leading-relaxed text-xs line-clamp-3">
            {selectedProduct.description || "No description provided for this product."}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
          <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Category
            </span>
            <span className="text-xs font-medium text-foreground truncate block mt-0.5">
              {selectedProduct.category?.name || "Uncategorized"}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Brand
            </span>
            <span className="text-xs font-medium text-foreground truncate block mt-0.5">
              {selectedProduct.brand?.name || "Unbranded"}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Variants Count
            </span>
            <span className="text-xs font-mono font-semibold text-foreground block mt-0.5">
              {variantsCount} SKUs
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Media Assets
            </span>
            <span className="text-xs font-mono font-semibold text-foreground block mt-0.5">
              {images.length} Images
            </span>
          </div>
        </div>

        {/* SEO Metadata */}
        {(selectedProduct.seoTitle || selectedProduct.seoDescription) && (
          <div className="border-t border-border/60 pt-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              SEO Title & Snippet
            </span>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate">
              {selectedProduct.seoTitle || selectedProduct.name}
            </p>
            {selectedProduct.seoDescription && (
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {selectedProduct.seoDescription}
              </p>
            )}
          </div>
        )}

        {/* Lifecycle Transitions & Quick Actions */}
        <div className="border-t border-border/60 pt-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {selectedProduct.status !== "ACTIVE" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPublish(selectedProduct)}
                className="flex-1 h-7.5 text-xs gap-1 border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
              >
                <Rocket className="size-3" />
                <span>Publish Active</span>
              </Button>
            )}
            {selectedProduct.status !== "DRAFT" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDraft(selectedProduct)}
                className="flex-1 h-7.5 text-xs gap-1 border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
              >
                <FileEdit className="size-3" />
                <span>Move to Draft</span>
              </Button>
            )}
            {selectedProduct.status !== "ARCHIVED" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onArchive(selectedProduct)}
                className="h-7.5 text-xs gap-1 border-border text-muted-foreground hover:text-foreground"
              >
                <Archive className="size-3" />
                <span>Archive</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(selectedProduct)}
              className="flex-1 h-8 text-xs gap-1.5 font-medium border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            >
              <Edit2 className="size-3.5" />
              <span>Edit Details</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(selectedProduct)}
              className="h-8 text-xs gap-1.5 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-200 dark:border-rose-900/50"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
