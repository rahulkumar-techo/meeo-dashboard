/**
 * @file page.tsx
 * @description Dedicated Category Creation Page (< 240 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  FolderPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CategoryFormPreview } from "@/components/categories/category-form-preview"
import { useCategoriesQuery, useCreateCategoryMutation } from "@/hooks/use-category-query"
import type { CategoryStatus, CreateCategoryPayload } from "@/types/category"

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function CreateCategoryPage() {
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

  const { data: rawCategories } = useCategoriesQuery()
  const existingCategories = rawCategories?.items ?? (Array.isArray(rawCategories) ? rawCategories : [])
  const createMutation = useCreateCategoryMutation()

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
          "Error creating category. Ensure you have category:create permissions."
        setError(msg)
      },
    })
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1400px] mx-auto">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/categories" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <ArrowLeft className="size-3.5" />
              <span>Categories Taxonomy</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">Create Category</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderPlus className="size-6 text-indigo-600 dark:text-indigo-400" />
            <span>Create New Category</span>
          </h1>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Create a new category. Requires category:create or product:create permission. Sets createdById to the authenticated user.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/categories">
            <Button variant="outline" size="sm" className="h-9 text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            form="create-category-form"
            size="sm"
            disabled={createMutation.isPending}
            className="h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FolderPlus className="size-3.5" />
                <span>Save Category</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notification Alerts */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{successMessage} Redirecting to catalog taxonomy...</span>
        </div>
      )}

      {/* Two Column Layout: Left Form / Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-8 space-y-6">
          <form id="create-category-form" onSubmit={handleSubmit} className="space-y-6">
            {/* General Info Card */}
            <Card className="border-border/70 shadow-2xs">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-bold">General Information</CardTitle>
                <CardDescription className="text-xs">
                  Category name, search URL slug, and meta hierarchy.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Category Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Wireless Audio"
                      className="h-10 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">
                        URL Slug <span className="text-rose-500">*</span>
                      </label>
                      {isAutoSlug && (
                        <span className="text-[10.5px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                          <Sparkles className="size-3" /> Auto-syncing
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-mono text-muted-foreground">/c/</span>
                      <Input
                        required
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="wireless-audio"
                        className="h-10 pl-9 text-xs sm:text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-foreground">Description</label>
                    <span className="text-[10.5px] text-muted-foreground">{description.length}/300 chars</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed taxonomy overview for faceted navigation and catalog SEO..."
                    className="w-full rounded-md border border-input bg-background p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hierarchy & Placement Card */}
            <Card className="border-border/70 shadow-2xs">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-bold">Taxonomy Placement & Status</CardTitle>
                <CardDescription className="text-xs">
                  Parent category relationship, display order priority, and publish state.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Parent Category Node</label>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-xs sm:text-sm text-foreground shadow-2xs focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="">None (Top-Level Root Category)</option>
                      {existingCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Publishing Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["ACTIVE", "INACTIVE", "ARCHIVED"] as const).map((st) => (
                        <Button
                          key={st}
                          type="button"
                          variant={status === st ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStatus(st)}
                          className={`h-10 text-xs font-semibold ${
                            status === st && st === "ACTIVE"
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : status === st
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                              : "border-border/80"
                          }`}
                        >
                          {st}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Display Sort Order</label>
                    <Input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                      placeholder="0"
                      className="h-10 text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Banner Image URL</label>
                    <Input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="h-10 text-xs sm:text-sm font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Right Column: Live Card Preview & Info */}
        <div className="lg:col-span-4">
          <CategoryFormPreview
            name={name}
            slug={slug}
            parentId={parentId}
            status={status}
            sortOrder={sortOrder}
            imageUrl={imageUrl}
            description={description}
            existingCategories={existingCategories}
          />
        </div>
      </div>
    </div>
  )
}
