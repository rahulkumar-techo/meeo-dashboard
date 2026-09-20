/**
 * @file product-inspector.tsx
 * @description Inspector panel for viewing selected product media, taxonomy, status, and quick actions.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
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
  Layers,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge, CopyableId } from "@/components/common"
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
  const variantsCount =
    selectedProduct._count?.variants ??
    selectedProduct.variants?.length ??
    selectedProduct.variantsCount ??
    0

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
        {/* Campaign Banner Preview (if present) */}
        {selectedProduct.bannerImage?.url && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold uppercase">
              <span>Hero Campaign Banner</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-indigo-200 text-indigo-600 dark:text-indigo-400">
                ImageKit Banner
              </Badge>
            </div>
            <div className="relative w-full h-24 rounded-lg overflow-hidden border border-indigo-500/20 bg-muted">
              <Image
                src={selectedProduct.bannerImage.url}
                alt={selectedProduct.bannerImage.altText || "Product Banner"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}

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
          !selectedProduct.bannerImage?.url && (
            <div className="flex h-28 w-full items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/30 text-muted-foreground text-xs gap-1">
              <Package className="size-6 text-muted-foreground/50" />
              <span>No image attached</span>
            </div>
          )
        )}

        {/* Gallery Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.slice(1, 6).map((img, idx) => (
              <div key={idx} className="relative size-12 shrink-0 rounded-md overflow-hidden border border-border/60 bg-muted">
                <Image src={img.thumbnailUrl || img.url} alt={img.altText || "Gallery"} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        )}

        {/* Primary Info */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">{selectedProduct.name}</h3>
          <p className="text-xs text-muted-foreground font-mono">
            /products/{selectedProduct.slug}
          </p>
          <div className="pt-1">
            <CopyableId id={selectedProduct.id} label="Product ID" />
          </div>
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
          <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Category
            </span>
            <span className="text-xs font-medium text-foreground truncate block">
              {selectedProduct.category?.name || "Uncategorized"}
            </span>
            {(selectedProduct.categoryId || selectedProduct.category?.id) && (
              <CopyableId id={(selectedProduct.categoryId || selectedProduct.category?.id)!} label="Cat ID" />
            )}
          </div>
          <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Brand
            </span>
            <span className="text-xs font-medium text-foreground truncate block">
              {selectedProduct.brand?.name || "Unbranded"}
            </span>
            {(selectedProduct.brandId || selectedProduct.brand?.id) && (
              <CopyableId id={(selectedProduct.brandId || selectedProduct.brand?.id)!} label="Brand ID" />
            )}
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

        {/* Technical Specifications */}
        {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
          <div className="border-t border-border/60 pt-3 space-y-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Technical Specifications
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {Object.entries(selectedProduct.specifications).map(([group, fields]) => (
                <div key={group} className="p-2 rounded-lg bg-muted/20 border border-border/40 text-[11px] space-y-1">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 block">{group}</span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-muted-foreground">
                    {Object.entries(fields).map(([k, v]) => (
                      <div key={k} className="truncate">
                        <strong className="text-foreground font-normal">{k}:</strong> {v}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            <Link href={`/products/${selectedProduct.id}/variants`} className="flex-1">
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs gap-1.5 font-medium border-border hover:bg-muted text-foreground"
              >
                <Layers className="size-3.5 text-indigo-600" />
                <span>SKU Variants ({variantsCount})</span>
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(selectedProduct)}
              className="h-8 text-xs gap-1.5 font-medium border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              title="Edit Product Details"
            >
              <Edit2 className="size-3.5" />
              <span>Edit</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(selectedProduct)}
              className="h-8 text-xs gap-1.5 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-200 dark:border-rose-900/50"
              title="Delete Product"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
