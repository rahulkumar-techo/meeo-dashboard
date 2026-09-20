/**
 * @file step-draft-details.tsx
 * @description Step 1 in Product creation wizard: Creates product draft with ImageKit Banner via POST /api/v1/products.
 */

"use client"

import * as React from "react"
import { Loader2, ArrowRight, Sparkles, Flag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ImageUploadDropzone } from "@/components/common"
import { ProductSpecificationsEditor } from "./product-specifications-editor"
import { useCreateProductMutation } from "@/hooks/use-product-query"
import type { Category } from "@/types/category"
import type { Brand } from "@/types/brand"
import type { Product, CreateProductPayload, ProductSpecifications } from "@/types/product"

export interface StepDraftDetailsProps {
  categories: Category[]
  brands: Brand[]
  initialProduct?: Product | null
  onDraftCreated: (product: Product) => void
  onFormChange?: (data: {
    name: string
    slug: string
    description: string
    categoryId: string
    brandId: string
    isFeatured: boolean
    seoTitle: string
    seoDescription: string
    bannerImageUrl: string
    specifications?: ProductSpecifications | null
  }) => void
}

function generateSlug(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
}

export function StepDraftDetails({
  categories = [],
  brands = [],
  initialProduct,
  onDraftCreated,
  onFormChange,
}: StepDraftDetailsProps) {
  const [name, setName] = React.useState(initialProduct?.name || "")
  const [slug, setSlug] = React.useState(initialProduct?.slug || "")
  const [description, setDescription] = React.useState(initialProduct?.description || "")
  const [categoryId, setCategoryId] = React.useState(initialProduct?.categoryId || "")
  const [brandId, setBrandId] = React.useState(initialProduct?.brandId || "")
  const [isFeatured, setIsFeatured] = React.useState(Boolean(initialProduct?.isFeatured))
  const [bannerImageUrl, setBannerImageUrl] = React.useState(initialProduct?.bannerImage?.url || "")
  const [bannerAltText, setBannerAltText] = React.useState(initialProduct?.bannerImage?.altText || "")
  const [seoTitle, setSeoTitle] = React.useState(initialProduct?.seoTitle || "")
  const [seoDescription, setSeoDescription] = React.useState(initialProduct?.seoDescription || "")
  const [specifications, setSpecifications] = React.useState<ProductSpecifications | null>(
    initialProduct?.specifications || null
  )
  const [isAutoSlug, setIsAutoSlug] = React.useState(!initialProduct?.slug)
  const [error, setError] = React.useState<string | null>(null)

  const createMutation = useCreateProductMutation()

  React.useEffect(() => {
    onFormChange?.({
      name,
      slug,
      description,
      categoryId,
      brandId,
      isFeatured,
      seoTitle,
      seoDescription,
      bannerImageUrl,
      specifications,
    })
  }, [name, slug, description, categoryId, brandId, isFeatured, seoTitle, seoDescription, bannerImageUrl, specifications, onFormChange])

  const handleNameChange = (val: string) => {
    setName(val)
    if (isAutoSlug) {
      setSlug(generateSlug(val))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Product name is required.")
      return
    }

    const payload: CreateProductPayload = {
      name: name.trim(),
      slug: slug.trim() ? slug.trim() : generateSlug(name),
      description: description.trim() || null,
      categoryId: categoryId.trim() ? categoryId : null,
      brandId: brandId.trim() ? brandId : null,
      status: "DRAFT",
      isFeatured,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      bannerImage: bannerImageUrl.trim()
        ? {
            url: bannerImageUrl.trim(),
            altText: bannerAltText.trim() || `${name.trim()} Banner`,
            thumbnailUrl: bannerImageUrl.trim().includes("imagekit.io")
              ? `${bannerImageUrl.trim()}?tr=w-300`
              : undefined,
          }
        : null,
      specifications: specifications && Object.keys(specifications).length > 0 ? specifications : null,
    }

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.data) {
          onDraftCreated(res.data)
        } else {
          setError(res.message || "Failed to create product draft.")
        }
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || err.message || "An error occurred while creating product draft.")
      },
    })
  }

  return (
    <Card className="border-border/70 shadow-2xs text-xs">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-sm sm:text-base font-bold">Step 1: Product Information (Draft)</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter product details and primary ImageKit Hero Banner to initialize the catalog draft.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Product Name <span className="text-rose-500">*</span></label>
              <Input value={name} maxLength={200} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Nike Air Max Pulse" className="h-8.5 text-xs" required />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">URL Slug <span className="text-rose-500">*</span></label>
              <Input value={slug} maxLength={220} onChange={(e) => { setIsAutoSlug(false); setSlug(generateSlug(e.target.value)) }} placeholder="e.g. nike-air-max-pulse" className="h-8.5 text-xs font-mono" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Taxonomy Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-8.5 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden">
                <option value="">None (Uncategorized)</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name} (/c/{c.slug})</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Manufacturer Brand</label>
              <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="w-full h-8.5 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden">
                <option value="">None (Generic / Unbranded)</option>
                {brands.map((b) => (<option key={b.id} value={b.id}>{b.name} (/brands/{b.slug})</option>))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/20">
            <div>
              <span className="font-semibold text-foreground block">Featured Showcase</span>
              <span className="text-[11px] text-muted-foreground">Highlight this item on homepage and promotional deals</span>
            </div>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>

          {/* Primary ImageKit Banner (Primary Image shown on catalog card) */}
          <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                <Flag className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                Primary Image & Hero Banner (ImageKit CDN)
              </span>
              <span className="text-[10.5px] text-indigo-600 dark:text-indigo-400 font-medium">Primary Catalog Card Image</span>
            </div>
            <ImageUploadDropzone
              value={bannerImageUrl}
              onChange={(url) => setBannerImageUrl(url)}
              folder="/products/banners"
              label="Upload Banner / Cover Image"
              description="Upload primary catalog image from device (PNG, JPG, WebP)"
              aspectRatio="banner"
              disabled={createMutation.isPending}
            />
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Banner Alt Caption</label>
              <Input
                value={bannerAltText}
                onChange={(e) => setBannerAltText(e.target.value)}
                placeholder="e.g. Nike Air Max Pulse Campaign Banner"
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Product Description</label>
            <textarea value={description} maxLength={10000} onChange={(e) => setDescription(e.target.value)} placeholder="Premium running shoes with responsive cushioning..." rows={3} className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden" />
          </div>

          {/* Technical Specifications Section */}
          <div className="pt-2 border-t border-border/60">
            <ProductSpecificationsEditor
              value={specifications}
              onChange={setSpecifications}
              disabled={createMutation.isPending}
            />
          </div>

          <div className="border-t border-border/60 pt-3 space-y-3">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Search Engine Optimization (SEO)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">SEO Title</label>
                <Input value={seoTitle} maxLength={70} onChange={(e) => setSeoTitle(e.target.value)} placeholder="e.g. Nike Air Max Pulse - Official Store" className="h-8.5 text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">SEO Description</label>
                <Input value={seoDescription} maxLength={160} onChange={(e) => setSeoDescription(e.target.value)} placeholder="e.g. Buy authentic Nike Air Max Pulse with fast delivery." className="h-8.5 text-xs" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button type="submit" size="sm" disabled={createMutation.isPending} className="h-8.5 gap-1.5 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs">
              {createMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              <span>Save Draft & Upload Gallery</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
