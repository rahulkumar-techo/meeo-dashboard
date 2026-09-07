/**
 * @file create-category-form.tsx
 * @description Form component for creating new catalog category entities.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles, CheckCircle2, Image as ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCreateCategoryMutation } from "@/hooks/use-category-query"
import type { Category, CategoryStatus, CreateCategoryPayload } from "@/types/category"

export interface CreateCategoryFormProps {
  existingCategories: Category[]
  onFormChange?: (data: {
    name: string
    slug: string
    parentId: string
    status: CategoryStatus
    sortOrder: number
    imageUrl: string
    description: string
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

export function CreateCategoryForm({ existingCategories, onFormChange }: CreateCategoryFormProps) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [parentId, setParentId] = React.useState<string>("")
  const [description, setDescription] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [status, setStatus] = React.useState<CategoryStatus>("ACTIVE")
  const [sortOrder, setSortOrder] = React.useState<number>(0)
  const [isAutoSlug, setIsAutoSlug] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  const createMutation = useCreateCategoryMutation()

  React.useEffect(() => {
    onFormChange?.({ name, slug, parentId, status, sortOrder, imageUrl, description })
  }, [name, slug, parentId, status, sortOrder, imageUrl, description, onFormChange])

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
      setError("Category name is required.")
      return
    }

    if (!slug.trim()) {
      setError("Category slug is required.")
      return
    }

    const payload: CreateCategoryPayload = {
      name: name.trim(),
      slug: slug.trim(),
      parentId: parentId.trim() ? parentId : null,
      description: description.trim() ? description.trim() : null,
      imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
      status,
      sortOrder: Number(sortOrder) || 0,
    }

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.success || res.data) {
          setSuccessMessage(res.message || `Category "${name}" created successfully!`)
          setTimeout(() => {
            router.push("/categories")
          }, 800)
        } else {
          setError(res.message || "Failed to create category.")
        }
      },
      onError: (err: any) => {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to create category. Please check your inputs."
        setError(msg)
      },
    })
  }

  return (
    <Card className="border-border/70 shadow-2xs">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <CardTitle className="text-base sm:text-lg font-bold">Category Properties</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Define taxonomy nodes, hierarchy levels, URL routes, and SEO descriptions.
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
                Category Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Mechanical Keyboards"
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
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. mechanical-keyboards"
                className="h-9 text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* Parent Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Parent Category</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="">None (Top-level Root Category)</option>
                {existingCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (/c/{cat.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Publishing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CategoryStatus)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="ACTIVE">ACTIVE (Published)</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="INACTIVE">INACTIVE (Disabled)</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          {/* Sort Order & Cover Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="font-semibold text-foreground">Sort Order</label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-foreground">Cover Image URL</label>
              <div className="relative">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="h-9 text-xs pl-8"
                />
                <ImageIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Description & SEO Overview</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description for search faceted filters and catalog navigation..."
              rows={4}
              className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/categories")}
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
                  <span>Create Category</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
