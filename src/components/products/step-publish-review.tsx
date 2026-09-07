/**
 * @file step-publish-review.tsx
 * @description Step 3 in Product creation wizard: Review draft and publish to ACTIVE via POST /api/v1/products/:id/publish.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Rocket, FileText, ArrowLeft, CheckCircle2, Loader2, Package, FolderTree, Building2, Star, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePublishProductMutation, useProductQuery } from "@/hooks/use-product-query"
import type { Category } from "@/types/category"
import type { Brand } from "@/types/brand"
import type { Product } from "@/types/product"

export interface StepPublishReviewProps {
  product: Product
  categories?: Category[]
  brands?: Brand[]
  onBack: () => void
}

export function StepPublishReview({
  product,
  categories = [],
  brands = [],
  onBack,
}: StepPublishReviewProps) {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [isPublished, setIsPublished] = React.useState(false)

  const { data: liveProduct } = useProductQuery(product.id)
  const activeProduct = liveProduct || product

  const selectedCategory = categories.find((c) => c.id === activeProduct.categoryId) || activeProduct.category
  const selectedBrand = brands.find((b) => b.id === activeProduct.brandId) || activeProduct.brand
  const images = activeProduct.images || []
  const heroImage = images.length > 0 ? images[0].url : null

  const publishMutation = usePublishProductMutation()

  const handlePublish = () => {
    setError(null)
    publishMutation.mutate(activeProduct.id, {
      onSuccess: () => {
        setIsPublished(true)
        setTimeout(() => {
          router.push("/products")
        }, 1000)
      },
      onError: (err: any) => {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to publish product."
        setError(msg)
      },
    })
  }

  const handleSaveAsDraft = () => {
    router.push("/products")
  }

  return (
    <Card className="border-border/70 shadow-2xs">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <CardTitle className="text-base sm:text-lg font-bold">Step 3: Review & Publish</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Confirm product summary, gallery assets, and publish to make active in the storefront catalog.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {isPublished && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Product Published Successfully!</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                The product is now ACTIVE and visible across all sales channels. Redirecting to catalog...
              </p>
            </div>
          </div>
        )}

        {/* Product Review Card */}
        <div className="rounded-xl border border-border/70 bg-card p-4 space-y-4 shadow-2xs text-xs">
          <div className="flex items-start gap-4">
            {/* Hero Image Thumbnail */}
            <div className="relative size-20 rounded-lg overflow-hidden border border-border/70 bg-muted shrink-0 flex items-center justify-center">
              {heroImage ? (
                <Image src={heroImage} alt={activeProduct.name} fill className="object-cover" unoptimized />
              ) : (
                <Package className="size-6 text-muted-foreground/50" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="outline" className="text-[10px] font-mono">DRAFT READY</Badge>
                {activeProduct.isFeatured && (
                  <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 gap-1 font-semibold">
                    <Star className="size-2.5 fill-amber-500 text-amber-500" />
                    Featured
                  </Badge>
                )}
              </div>
              <h3 className="text-base font-bold text-foreground">{activeProduct.name}</h3>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">/products/{activeProduct.slug}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border/60 pt-3">
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Category</span>
              <span className="text-xs font-medium text-foreground block mt-0.5">
                {selectedCategory?.name || "Uncategorized"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Brand</span>
              <span className="text-xs font-medium text-foreground block mt-0.5">
                {selectedBrand?.name || "Unbranded"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Media Assets</span>
              <span className="text-xs font-mono font-bold text-foreground block mt-0.5">
                {images.length} Image(s) Attached
              </span>
            </div>
          </div>

          {/* Description */}
          {activeProduct.description && (
            <div className="border-t border-border/60 pt-3">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Description</span>
              <p className="mt-1 text-muted-foreground leading-relaxed line-clamp-3">
                {activeProduct.description}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-8.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Images</span>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push(`/products/${activeProduct.id}/variants`)}
              className="h-8.5 gap-1.5 text-xs border-indigo-200 text-indigo-600 dark:border-indigo-900/60 dark:text-indigo-400 hover:bg-indigo-500/10 font-medium"
            >
              <Layers className="size-3.5" />
              <span>Configure Variants & SKUs</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveAsDraft}
              className="h-8.5 gap-1.5 text-xs border-border/80"
            >
              <FileText className="size-3.5 text-muted-foreground" />
              <span>Keep as Draft & Exit</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handlePublish}
              disabled={publishMutation.isPending || isPublished}
              className="h-8.5 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
            >
              {publishMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Rocket className="size-3.5" />
                  <span>Publish Product Now</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
