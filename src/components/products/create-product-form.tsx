/**
 * @file create-product-form.tsx
 * @description Form component for creating new catalog products with image, taxonomy, and SEO settings.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles, Image as ImageIcon, CheckCircle2, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useCreateProductMutation } from "@/hooks/use-product-query"
import type { Category } from "@/types/category"
import type { Brand } from "@/types/brand"
import type { ProductStatus, CreateProductPayload } from "@/types/product"

export interface CreateProductFormProps {
  categories: Category[]
  brands: Brand[]
  onFormChange?: (data: {
    name: string
    slug: string
    description: string
    categoryId: string
    brandId: string
    status: ProductStatus
    isFeatured: boolean
    seoTitle: string
    seoDescription: string
    imageUrl: string
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

export function CreateProductForm({
  categories = [],
  brands = [],
  onFormChange,
}: CreateProductFormProps) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [categoryId, setCategoryId] = React.useState("")
  const [brandId, setBrandId] = React.useState("")
  const [status, setStatus] = React.useState<ProductStatus>("DRAFT")
  const [isFeatured, setIsFeatured] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState("")
  const [seoTitle, setSeoTitle] = React.useState("")
  const [seoDescription, setSeoDescription] = React.useState("")
  const [isAutoSlug, setIsAutoSlug] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  const createMutation = useCreateProductMutation()

  // Real-time synchronization with preview card
  React.useEffect(() => {
    onFormChange?.({
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
    })
  }, [
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
    onFormChange,
  ])

  const handleNameChange = (val: string) => {
    setName(val)
    if (isAutoSlug) {
      setSlug(generateSlug(val))
    }
  }

  const handleSlugChange = (val: string) => {
    setIsAutoSlug(false)
    setSlug(generateSlug(val))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

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
      status,
      isFeatured,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      images: imageUrl.trim()
        ? [{ url: imageUrl.trim(), altText: name.trim(), sortOrder: 0 }]
        : [],
    }

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.success || res.data) {
          setSuccessMessage(res.message || `Product "${name}" created successfully!`)
          setTimeout(() => {
            router.push("/products")
          }, 800)
        } else {
          setError(res.message || "Failed to create product.")
        }
      },
      onError: (err: any) => {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "An error occurred while creating the product."
        setError(msg)
      },
    })
  }

  return (
    <Card className="border-border/70 shadow-2xs">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <CardTitle className="text-base sm:text-lg font-bold">Product Information</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Configure product title, category links, manufacturer brand, media, and SEO attributes.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
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
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
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
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. sony-wh-1000xm5"
                className="h-9 text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* Category & Brand Selectors */}
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

          {/* Status & Featured Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Publishing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="DRAFT">DRAFT (Hidden from Store)</option>
                <option value="ACTIVE">ACTIVE (Published in Catalog)</option>
                <option value="ARCHIVED">ARCHIVED (Discontinued)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/20">
              <div>
                <span className="font-semibold text-foreground block">Featured Showcase</span>
                <span className="text-[11px] text-muted-foreground">Highlight on homepage & deals</span>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
          </div>

          {/* Cover Image URL */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Cover Image URL</label>
            <div className="relative">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://ik.imagekit.io/... or https://images.unsplash.com/..."
                className="h-9 text-xs pl-8"
              />
              <ImageIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Product Description</label>
            <textarea
              value={description}
              maxLength={10000}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed specifications, features, in-the-box contents, and warranty..."
              rows={4}
              className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* SEO Metadata Fields */}
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
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones | Official Store"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">SEO Meta Description (Max 160 chars)</label>
                <Input
                  value={seoDescription}
                  maxLength={160}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="e.g. Buy Sony WH-1000XM5 with industry-leading noise cancelation."
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/products")}
              disabled={createMutation.isPending}
              className="h-8.5 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="h-8.5 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Create Product</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
