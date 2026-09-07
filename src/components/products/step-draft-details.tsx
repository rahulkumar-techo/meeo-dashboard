/**
 * @file step-draft-details.tsx
 * @description Step 1 in Product creation wizard: Creates product draft via POST /api/v1/products.
 */

"use client"

import * as React from "react"
import { Loader2, ArrowRight, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useCreateProductMutation } from "@/hooks/use-product-query"
import type { Category } from "@/types/category"
import type { Brand } from "@/types/brand"
import type { Product, CreateProductPayload } from "@/types/product"

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
  }) => void
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
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
  const [seoTitle, setSeoTitle] = React.useState(initialProduct?.seoTitle || "")
  const [seoDescription, setSeoDescription] = React.useState(initialProduct?.seoDescription || "")
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
    })
  }, [
    name,
    slug,
    description,
    categoryId,
    brandId,
    isFeatured,
    seoTitle,
    seoDescription,
    onFormChange,
  ])

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
        const msg =
          err.response?.data?.message ||
          err.message ||
          "An error occurred while creating the product draft."
        setError(msg)
      },
    })
  }

  return (
    <Card className="border-border/70 shadow-2xs">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <CardTitle className="text-base sm:text-lg font-bold">Step 1: Product Information (Draft)</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter product title, taxonomy category, brand, and description to initialize the catalog draft.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                maxLength={200}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Nike Air Max Pulse"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <Input
                value={slug}
                maxLength={220}
                onChange={(e) => {
                  setIsAutoSlug(false)
                  setSlug(generateSlug(e.target.value))
                }}
                placeholder="e.g. nike-air-max-pulse"
                className="h-9 text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Taxonomy Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="">None (Uncategorized)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (/c/{c.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Manufacturer Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="">None (Generic / Unbranded)</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (/brands/{b.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Showcase Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-muted/20">
            <div>
              <span className="font-semibold text-foreground block">Featured Showcase</span>
              <span className="text-[11px] text-muted-foreground">Highlight this item on store homepage and deals section</span>
            </div>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Product Description</label>
            <textarea
              value={description}
              maxLength={10000}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Premium running shoes with responsive cushioning..."
              rows={4}
              className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* SEO Metadata */}
          <div className="border-t border-border/60 pt-3 space-y-3">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Search Engine Optimization (SEO)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">SEO Title (Max 70 chars)</label>
                <Input
                  value={seoTitle}
                  maxLength={70}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. Nike Air Max Pulse - Official Store"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">SEO Meta Description (Max 160 chars)</label>
                <Input
                  value={seoDescription}
                  maxLength={160}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="e.g. Buy authentic Nike Air Max Pulse with fast delivery."
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="h-9 gap-1.5 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating Draft...</span>
                </>
              ) : (
                <>
                  <span>Save Draft & Upload Images</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
