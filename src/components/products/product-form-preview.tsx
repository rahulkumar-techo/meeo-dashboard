/**
 * @file product-form-preview.tsx
 * @description Live card preview component for product creation and editing.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { Eye, ShieldCheck, Tag, Star, FolderTree, Building2, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProductStatus } from "@/types/product"
import type { Category } from "@/types/category"
import type { Brand } from "@/types/brand"

export interface ProductFormPreviewProps {
  name: string
  slug: string
  description?: string
  categoryId?: string
  brandId?: string
  status: ProductStatus
  isFeatured: boolean
  seoTitle?: string
  seoDescription?: string
  imageUrl?: string
  categories?: Category[]
  brands?: Brand[]
}

export function ProductFormPreview({
  name,
  slug,
  description,
  categoryId,
  brandId,
  status,
  isFeatured,
  seoTitle,
  seoDescription,
  imageUrl,
  categories = [],
  brands = [],
}: ProductFormPreviewProps) {
  const selectedCategory = categories.find((c) => c.id === categoryId)
  const selectedBrand = brands.find((b) => b.id === brandId)

  return (
    <div className="space-y-5">
      {/* Live Storefront Preview Card */}
      <Card className="border-border/70 shadow-2xs overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="size-3.5 text-indigo-500" />
              <span>Storefront Live Preview</span>
            </CardTitle>
            <div className="flex items-center gap-1.5">
              {isFeatured && (
                <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 gap-1 font-semibold">
                  <Star className="size-2.5 fill-amber-500 text-amber-500" />
                  Featured
                </Badge>
              )}
              <Badge
                variant={status === "ACTIVE" ? "default" : "outline"}
                className="text-[10px] uppercase font-mono"
              >
                {status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3.5">
          {/* Main Hero Image Preview */}
          {imageUrl ? (
            <div className="relative h-44 w-full overflow-hidden rounded-lg bg-muted border border-border/60 flex items-center justify-center">
              <Image
                src={imageUrl}
                alt={name || "Product preview"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-36 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-indigo-500/5 text-muted-foreground text-xs gap-1">
              <Package className="size-6 text-muted-foreground/60" />
              <span className="text-[11px]">No cover image set</span>
            </div>
          )}

          {/* Title and Category/Brand Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {selectedCategory && (
                <Badge variant="outline" className="text-[10px] gap-1 py-0.5">
                  <FolderTree className="size-2.5 text-indigo-500" />
                  {selectedCategory.name}
                </Badge>
              )}
              {selectedBrand && (
                <Badge variant="outline" className="text-[10px] gap-1 py-0.5">
                  <Building2 className="size-2.5 text-emerald-500" />
                  {selectedBrand.name}
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">
              {name || "Untitled Product"}
            </h3>
            <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
              /products/{slug || "product-slug"}
            </p>
          </div>

          {/* Description Snippet */}
          {description ? (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {description}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No description entered yet.
            </p>
          )}

          {/* SEO Metadata Snippet */}
          {(seoTitle || seoDescription) && (
            <div className="rounded-lg bg-muted/40 p-2.5 space-y-1 text-xs border border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Google Search Snippet Preview
              </span>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs truncate">
                {seoTitle || name || "Product Page Title"}
              </p>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {seoDescription || description || "No meta description set."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Guidelines */}
      <Card className="border-border/70 bg-muted/20 shadow-2xs">
        <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Ownership & Publishing Rights</span>
          </div>
          <p className="text-[11.5px] leading-relaxed">
            As the creator, you retain full ownership to edit details, manage media assets, publish, or
            archive this product. Role permissions (<code className="text-foreground font-mono">product:create</code>) apply for elevated actions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
