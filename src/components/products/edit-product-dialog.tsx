/**
 * @file edit-product-dialog.tsx
 * @description Comprehensive Multi-Tab Modal for Editing Products.
 * Provides granular controls for General Details, Media Gallery, SEO Metadata, and Lifecycle Transitions.
 */

"use client"

import * as React from "react"
import {
  Edit2,
  Loader2,
  Sparkles,
  Layers,
  Images,
  Globe,
  Activity,
  CheckCircle2,
  Archive,
  FileEdit,
  Check,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  useUpdateProductMutation,
  usePublishProductMutation,
  useDraftProductMutation,
  useArchiveProductMutation,
  useProductQuery,
} from "@/hooks/use-product-query"
import { EditProductImages } from "@/components/products/edit-product-images"
import type { Category } from "@/types/category"
import type { Brand } from "@/types/brand"
import type { Product, ProductStatus, UpdateProductPayload } from "@/types/product"

export interface EditProductDialogProps {
  product: Product | null
  categories?: Category[]
  brands?: Brand[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type EditTab = "general" | "media" | "seo" | "lifecycle"

export function EditProductDialog({
  product,
  categories = [],
  brands = [],
  open,
  onOpenChange,
  onSuccess,
}: EditProductDialogProps) {
  const [activeTab, setActiveTab] = React.useState<EditTab>("general")
  const [formData, setFormData] = React.useState<UpdateProductPayload>({
    name: "",
    slug: "",
    description: "",
    categoryId: null,
    brandId: null,
    status: "DRAFT",
    isFeatured: false,
    seoTitle: "",
    seoDescription: "",
  })
  const [error, setError] = React.useState<string | null>(null)
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)

  // Fetch updated product data
  const { data: liveProduct, refetch: refetchLiveProduct } = useProductQuery(product?.id || "")
  const currentProduct = liveProduct || product

  const updateMutation = useUpdateProductMutation()
  const publishMutation = usePublishProductMutation()
  const draftMutation = useDraftProductMutation()
  const archiveMutation = useArchiveProductMutation()

  // Initialize form state when product opens
  React.useEffect(() => {
    if (currentProduct) {
      setFormData({
        name: currentProduct.name || "",
        slug: currentProduct.slug || "",
        description: currentProduct.description || "",
        categoryId: currentProduct.categoryId || null,
        brandId: currentProduct.brandId || null,
        status: (currentProduct.status as ProductStatus) || "DRAFT",
        isFeatured: Boolean(currentProduct.isFeatured),
        seoTitle: currentProduct.seoTitle || "",
        seoDescription: currentProduct.seoDescription || "",
      })
      setError(null)
      setStatusMessage(null)
    }
  }, [currentProduct, open])

  if (!product || !currentProduct) return null

  // Generate slug helper
  const handleGenerateSlug = () => {
    if (!formData.name) return
    const generated = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
    setFormData((p) => ({ ...p, slug: generated }))
  }

  // Handle Form Submit (PATCH /api/v1/products/:id)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) {
      setError("Product name is required.")
      setActiveTab("general")
      return
    }

    setError(null)
    updateMutation.mutate(
      {
        id: product.id,
        payload: {
          name: formData.name.trim(),
          slug: formData.slug?.trim() ? formData.slug.trim() : undefined,
          description: formData.description?.trim() || null,
          categoryId: formData.categoryId || null,
          brandId: formData.brandId || null,
          status: formData.status,
          isFeatured: formData.isFeatured,
          seoTitle: formData.seoTitle?.trim() || null,
          seoDescription: formData.seoDescription?.trim() || null,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (err: any) => {
          const validationError = err.response?.data?.errors?.[0]?.message
          const msg =
            validationError ||
            err.response?.data?.message ||
            err.message ||
            "Failed to update product. Please check your inputs."
          setError(msg)
        },
      }
    )
  }

  // Handle Lifecycle Status Transitions
  const handleStatusChange = async (target: "publish" | "draft" | "archive") => {
    setError(null)
    setStatusMessage(null)
    try {
      if (target === "publish") {
        await publishMutation.mutateAsync(product.id)
        setStatusMessage("Product successfully published to store!")
      } else if (target === "draft") {
        await draftMutation.mutateAsync(product.id)
        setStatusMessage("Product moved back to Draft status.")
      } else if (target === "archive") {
        await archiveMutation.mutateAsync(product.id)
        setStatusMessage("Product archived.")
      }
      await refetchLiveProduct()
      onSuccess?.()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update status."
      setError(msg)
    }
  }

  const isTransitioning =
    publishMutation.isPending || draftMutation.isPending || archiveMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-5 pb-3 border-b border-border/70 bg-muted/10">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Edit2 className="size-4" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold flex items-center gap-2 truncate">
                  <span className="truncate">Edit {currentProduct.name || "Product"}</span>
                  <Badge
                    variant={
                      currentProduct.status === "ACTIVE"
                        ? "default"
                        : currentProduct.status === "DRAFT"
                        ? "outline"
                        : "secondary"
                    }
                    className="text-[10px] uppercase font-mono px-2 py-0 shrink-0"
                  >
                    {currentProduct.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  ID: <span className="font-mono text-[11px]">{product.id}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Navigation Tabs Bar */}
          <div className="flex flex-wrap items-center gap-1.5 mt-4 border-b border-border/40 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "general"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Layers className="size-3.5" />
              <span>General & Taxonomy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "media"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Images className="size-3.5" />
              <span>Gallery & Media ({currentProduct.images?.length ?? 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "seo"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Globe className="size-3.5" />
              <span>SEO & Meta</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("lifecycle")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "lifecycle"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Activity className="size-3.5" />
              <span>Status & Lifecycle</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {statusMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
              <Check className="size-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* TAB 1: General & Taxonomy */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    maxLength={200}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Nike Air Max Pulse"
                    className="h-8.5 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-foreground">
                      URL Slug <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="text-[10px] text-indigo-600 hover:underline font-semibold"
                    >
                      Auto-generate
                    </button>
                  </div>
                  <Input
                    value={formData.slug}
                    maxLength={220}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="nike-air-max-pulse"
                    className="h-8.5 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Primary Category</label>
                  <select
                    value={formData.categoryId || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, categoryId: e.target.value || null }))
                    }
                    className="w-full h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="">None (Uncategorized)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Brand Association</label>
                  <select
                    value={formData.brandId || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, brandId: e.target.value || null }))
                    }
                    className="w-full h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="">None (Generic)</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Featured Showcase Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20">
                <div>
                  <span className="font-bold text-foreground block">Featured in Showcase</span>
                  <span className="text-[11px] text-muted-foreground">
                    Display prominently on homepage collections and search highlights
                  </span>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(isFeatured) => setFormData((p) => ({ ...p, isFeatured }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">Product Description</label>
                  <span className="text-[10px] text-muted-foreground">
                    {formData.description?.length || 0} / 10,000
                  </span>
                </div>
                <textarea
                  value={formData.description || ""}
                  maxLength={10000}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Detailed product story, specifications, dimensions, materials..."
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Gallery & Media */}
          {activeTab === "media" && (
            <EditProductImages
              product={currentProduct}
              onImageChange={() => {
                refetchLiveProduct()
                onSuccess?.()
              }}
            />
          )}

          {/* TAB 3: SEO & Search Preview */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-foreground">SEO Title (Meta Title)</label>
                    <span className="text-[10px] text-muted-foreground">
                      {formData.seoTitle?.length || 0}/70 characters
                    </span>
                  </div>
                  <Input
                    value={formData.seoTitle || ""}
                    maxLength={70}
                    onChange={(e) => setFormData((p) => ({ ...p, seoTitle: e.target.value }))}
                    placeholder="e.g. Nike Air Max Pulse - Men's Running Shoes | Store"
                    className="h-8.5 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-foreground">SEO Meta Description</label>
                    <span className="text-[10px] text-muted-foreground">
                      {formData.seoDescription?.length || 0}/160 characters
                    </span>
                  </div>
                  <textarea
                    value={formData.seoDescription || ""}
                    maxLength={160}
                    onChange={(e) => setFormData((p) => ({ ...p, seoDescription: e.target.value }))}
                    placeholder="Concise overview displayed in search engine results..."
                    rows={2}
                    className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* SERP Search Preview */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Google Search Snippet Preview
                </span>
                <div className="space-y-0.5 pt-1">
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                    https://store.example.com/products/{formData.slug || "product-slug"}
                  </div>
                  <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline truncate">
                    {formData.seoTitle || formData.name || "Product Title Preview"}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {formData.seoDescription ||
                      formData.description ||
                      "Detailed preview description showing how your product appears in organic search engine rankings."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Status & Lifecycle Transitions */}
          {activeTab === "lifecycle" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Publishing Lifecycle State</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Change the live visibility of this item on your customer storefront.
                    </p>
                  </div>
                  <Badge
                    variant={
                      currentProduct.status === "ACTIVE"
                        ? "default"
                        : currentProduct.status === "DRAFT"
                        ? "outline"
                        : "secondary"
                    }
                    className="text-xs font-mono uppercase px-2.5 py-0.5"
                  >
                    {currentProduct.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant={currentProduct.status === "ACTIVE" ? "default" : "outline"}
                    size="sm"
                    disabled={isTransitioning || currentProduct.status === "ACTIVE"}
                    onClick={() => handleStatusChange("publish")}
                    className="h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>Publish (Active)</span>
                  </Button>

                  <Button
                    type="button"
                    variant={currentProduct.status === "DRAFT" ? "secondary" : "outline"}
                    size="sm"
                    disabled={isTransitioning || currentProduct.status === "DRAFT"}
                    onClick={() => handleStatusChange("draft")}
                    className="h-9 text-xs gap-1.5"
                  >
                    <FileEdit className="size-3.5" />
                    <span>Move to Draft</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isTransitioning || currentProduct.status === "ARCHIVED"}
                    onClick={() => handleStatusChange("archive")}
                    className="h-9 text-xs gap-1.5 text-amber-600 hover:bg-amber-500/10 border-amber-500/30"
                  >
                    <Archive className="size-3.5" />
                    <span>Archive Product</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <DialogFooter className="p-4 border-t border-border/70 bg-muted/10 gap-2 flex-col-reverse sm:flex-row justify-between">
          <div className="text-[11px] text-muted-foreground flex items-center">
            {updateMutation.isPending && (
              <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
                <Loader2 className="size-3.5 animate-spin" />
                Saving updates...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="text-xs h-8.5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              size="sm"
              disabled={updateMutation.isPending}
              className="text-xs h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {updateMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              <span>Save Changes</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
