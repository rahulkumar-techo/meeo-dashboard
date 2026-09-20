/**
 * @file step-edit-details.tsx
 * @description Step 1 in Product Edit Wizard: Updates general product details, banner, specifications, and SEO via PATCH /api/v1/products/:id.
 */

"use client"

import * as React from "react"
import { Loader2, ArrowRight, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ProductSpecificationsEditor } from "./product-specifications-editor"
import { useUpdateProductMutation } from "@/hooks/use-product-query"
import type { Category } from "@/types/category"
import type { Brand } from "@/types/brand"
import type { Product, UpdateProductPayload, ProductSpecifications } from "@/types/product"

export interface StepEditDetailsProps {
  product: Product
  categories: Category[]
  brands: Brand[]
  onSaved: (updatedProduct: Product) => void
  onFormChange?: (data: {
    name: string
    slug: string
    description: string
    categoryId: string
    brandId: string
    isFeatured: boolean
    seoTitle: string
    seoDescription: string
    specifications?: ProductSpecifications | null
  }) => void
}

function generateSlug(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
}

export function StepEditDetails({
  product,
  categories = [],
  brands = [],
  onSaved,
  onFormChange,
}: StepEditDetailsProps) {
  const [name, setName] = React.useState(product.name || "")
  const [slug, setSlug] = React.useState(product.slug || "")
  const [description, setDescription] = React.useState(product.description || "")
  const [categoryId, setCategoryId] = React.useState(product.categoryId || "")
  const [brandId, setBrandId] = React.useState(product.brandId || "")
  const [isFeatured, setIsFeatured] = React.useState(Boolean(product.isFeatured))
  const [seoTitle, setSeoTitle] = React.useState(product.seoTitle || "")
  const [seoDescription, setSeoDescription] = React.useState(product.seoDescription || "")
  const [specifications, setSpecifications] = React.useState<ProductSpecifications | null>(product.specifications || null)
  const [error, setError] = React.useState<string | null>(null)

  const updateMutation = useUpdateProductMutation()

  React.useEffect(() => {
    if (product) {
      setName(product.name || "")
      setSlug(product.slug || "")
      setDescription(product.description || "")
      setCategoryId(product.categoryId || "")
      setBrandId(product.brandId || "")
      setIsFeatured(Boolean(product.isFeatured))
      setSeoTitle(product.seoTitle || "")
      setSeoDescription(product.seoDescription || "")
      setSpecifications(product.specifications || null)
    }
  }, [product])

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
      specifications,
    })
  }, [name, slug, description, categoryId, brandId, isFeatured, seoTitle, seoDescription, specifications, onFormChange])

  const handleAutoSlug = () => {
    if (!name) return
    setSlug(generateSlug(name))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError("Product name is required.")
      return
    }

    const payload: UpdateProductPayload = {
      name: name.trim(),
      slug: slug.trim() ? slug.trim() : undefined,
      description: description.trim() || null,
      categoryId: categoryId.trim() ? categoryId : null,
      brandId: brandId.trim() ? brandId : null,
      isFeatured,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      specifications: specifications && Object.keys(specifications).length > 0 ? specifications : null,
    }

    updateMutation.mutate(
      { id: product.id, payload },
      {
        onSuccess: (res) => {
          if (res.data) onSaved(res.data)
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || err.message || "Failed to save product details.")
        },
      }
    )
  }

  return (
    <Card className="border-border/70 shadow-2xs">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold">Step 1: Product Specifications & Identity</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Update core identification, taxonomy associations, technical specifications, and SEO metadata.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAutoSlug} className="text-xs h-8 gap-1.5 hidden sm:flex">
            <Sparkles className="size-3 text-indigo-500" />
            <span>Sync Slug</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Product Title <span className="text-rose-500">*</span></label>
              <Input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nike Air Max Pulse" className="h-9 text-xs" required />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">URL Slug <span className="text-rose-500">*</span></label>
              <Input value={slug} maxLength={140} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. nike-air-max-pulse" className="h-9 text-xs font-mono" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Taxonomy Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden">
                <option value="">None (Uncategorized)</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name} (/c/{c.slug})</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Manufacturer Brand</label>
              <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden">
                <option value="">None (Generic / Unbranded)</option>
                {brands.map((b) => (<option key={b.id} value={b.id}>{b.name} (/brands/{b.slug})</option>))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-muted/20">
            <div>
              <span className="font-semibold text-foreground block">Featured Showcase</span>
              <span className="text-[11px] text-muted-foreground">Highlight this item on store homepage and promotional collections</span>
            </div>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Product Description</label>
            <textarea value={description} maxLength={10000} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." rows={3} className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden" />
          </div>

          {/* Technical Specifications Section */}
          <div className="pt-2 border-t border-border/60">
            <ProductSpecificationsEditor value={specifications} onChange={setSpecifications} disabled={updateMutation.isPending} />
          </div>

          <div className="border-t border-border/60 pt-3 space-y-3">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Search Engine Optimization (SEO)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">SEO Title (Max 70 chars)</label>
                <Input value={seoTitle} maxLength={70} onChange={(e) => setSeoTitle(e.target.value)} placeholder="e.g. Nike Air Max Pulse - Official Store" className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">SEO Meta Description (Max 160 chars)</label>
                <Input value={seoDescription} maxLength={160} onChange={(e) => setSeoDescription(e.target.value)} placeholder="e.g. Buy authentic Nike Air Max Pulse with fast delivery." className="h-9 text-xs" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button type="submit" size="sm" disabled={updateMutation.isPending} className="h-9 gap-1.5 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs">
              {updateMutation.isPending ? (<><Loader2 className="size-3.5 animate-spin" /><span>Saving Updates...</span></>) : (<><span>Save & Continue to Images</span><ArrowRight className="size-3.5" /></>)}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
