/**
 * @file edit-category-dialog.tsx
 * @description Dialog modal for updating an existing category entity.
 */

"use client"

import * as React from "react"
import { Edit2, Loader2, Sparkles, Image as ImageIcon } from "lucide-react"
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
import { useUpdateCategoryMutation } from "@/hooks/use-category-query"
import type { Category, CategoryStatus, UpdateCategoryPayload } from "@/types/category"

export interface EditCategoryDialogProps {
  category: Category | null
  categories?: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditCategoryDialog({
  category,
  categories = [],
  open,
  onOpenChange,
  onSuccess,
}: EditCategoryDialogProps) {
  const [formData, setFormData] = React.useState<UpdateCategoryPayload>({
    name: "",
    slug: "",
    parentId: null,
    description: "",
    imageUrl: "",
    status: "ACTIVE",
    sortOrder: 0,
  })
  const [error, setError] = React.useState<string | null>(null)
  const updateMutation = useUpdateCategoryMutation()

  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        parentId: category.parentId || null,
        description: category.description || "",
        imageUrl: category.imageUrl || "",
        status: (category.status as CategoryStatus) || "ACTIVE",
        sortOrder: category.sortOrder ?? 0,
      })
      setError(null)
    }
  }, [category, open])

  if (!category) return null

  const handleNameChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === "" || prev.slug === category.slug ? slug : prev.slug,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) {
      setError("Category name is required.")
      return
    }
    if (!formData.slug?.trim()) {
      setError("Slug is required.")
      return
    }

    setError(null)
    updateMutation.mutate(
      {
        id: category.id,
        payload: {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          parentId: formData.parentId || null,
          description: formData.description?.trim() || null,
          imageUrl: formData.imageUrl?.trim() || null,
          status: formData.status,
          sortOrder: Number(formData.sortOrder) || 0,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Failed to update category. Please try again."
          setError(msg)
        },
      }
    )
  }

  // Filter out self and circular references
  const eligibleParents = categories.filter((c) => c.id !== category.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Edit2 className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Edit Category</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update taxonomy properties, URL slug, hierarchy node, and status.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Name & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Wireless Headphones"
                  className="h-8.5 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="e.g. wireless-headphones"
                  className="h-8.5 text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Parent & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Parent Category</label>
                <select
                  value={formData.parentId || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, parentId: e.target.value || null }))
                  }
                  className="w-full h-8.5 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                >
                  <option value="">None (Top-level Root Category)</option>
                  {eligibleParents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name} (/c/{parent.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Publishing Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      status: e.target.value as CategoryStatus,
                    }))
                  }
                  className="w-full h-8.5 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                >
                  <option value="ACTIVE">ACTIVE (Published)</option>
                  <option value="DRAFT">DRAFT (Hidden)</option>
                  <option value="INACTIVE">INACTIVE (Disabled)</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>

            {/* Sort Order & Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="font-semibold text-foreground">Sort Order</label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))
                  }
                  placeholder="0"
                  className="h-8.5 text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-foreground">Cover Image URL</label>
                <div className="relative">
                  <Input
                    value={formData.imageUrl || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="h-8.5 text-xs pl-7"
                  />
                  <ImageIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Description</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Detailed overview for SEO metadata and taxonomy indexing..."
                rows={3}
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row pt-2">
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
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="text-xs h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
