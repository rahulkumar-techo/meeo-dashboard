/**
 * @file create-brand-form.tsx
 * @description Interactive Form component for creating new brand entities.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles, Image as ImageIcon, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCreateBrandMutation } from "@/hooks/use-brand-query"
import type { BrandStatus, CreateBrandPayload } from "@/types/brand"

export interface CreateBrandFormProps {
  onFormChange?: (data: {
    name: string
    slug: string
    logoUrl: string
    description: string
    status: BrandStatus
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

export function CreateBrandForm({ onFormChange }: CreateBrandFormProps) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [logoUrl, setLogoUrl] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [status, setStatus] = React.useState<BrandStatus>("ACTIVE")
  const [isAutoSlug, setIsAutoSlug] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  const createMutation = useCreateBrandMutation()

  // Notify parent of live changes for real-time card preview
  React.useEffect(() => {
    onFormChange?.({ name, slug, logoUrl, description, status })
  }, [name, slug, logoUrl, description, status, onFormChange])

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
      setError("Brand name is required.")
      return
    }

    const payload: CreateBrandPayload = {
      name: name.trim(),
      slug: slug.trim() ? slug.trim() : generateSlug(name),
      logoUrl: logoUrl.trim() || null,
      description: description.trim() || null,
      status,
    }

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.success || res.data) {
          setSuccessMessage(res.message || `Brand "${name}" registered successfully!`)
          setTimeout(() => {
            router.push("/brands")
          }, 800)
        } else {
          setError(res.message || "Failed to register brand.")
        }
      },
      onError: (err: any) => {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "An error occurred while creating the brand."
        setError(msg)
      },
    })
  }

  return (
    <Card className="border-border/70 shadow-2xs">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <CardTitle className="text-base sm:text-lg font-bold">Brand Details & Identity</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter official vendor details, storefront slugs, and logo assets.
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
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                maxLength={100}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Sony, Logitech, Keychron"
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
                maxLength={120}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. logitech"
                className="h-9 text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* Publishing Status */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Publishing Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BrandStatus)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="ACTIVE">ACTIVE (Published)</option>
              <option value="DRAFT">DRAFT (Hidden)</option>
              <option value="INACTIVE">INACTIVE (Disabled)</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Logo URL */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Brand Logo URL</label>
            <div className="relative">
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="h-9 text-xs pl-8"
              />
              <ImageIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Overview & Brand Story</label>
            <textarea
              value={description}
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description for supplier records and SEO indexing..."
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
              onClick={() => router.push("/brands")}
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
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Register Brand</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
