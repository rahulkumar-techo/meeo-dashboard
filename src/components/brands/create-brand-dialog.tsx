/**
 * @file create-brand-dialog.tsx
 * @description Dialog modal for registering a new brand entity.
 */

"use client"

import * as React from "react"
import { Plus, Loader2, Sparkles, Image as ImageIcon } from "lucide-react"
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
import { useCreateBrandMutation } from "@/hooks/use-brand-query"
import type { BrandStatus, CreateBrandPayload } from "@/types/brand"

export interface CreateBrandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function CreateBrandDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateBrandDialogProps) {
  const [formData, setFormData] = React.useState<CreateBrandPayload>({
    name: "",
    slug: "",
    logoUrl: "",
    description: "",
    status: "ACTIVE",
  })
  const [isAutoSlug, setIsAutoSlug] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const createMutation = useCreateBrandMutation()

  React.useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        slug: "",
        logoUrl: "",
        description: "",
        status: "ACTIVE",
      })
      setIsAutoSlug(true)
      setError(null)
    }
  }, [open])

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: isAutoSlug ? generateSlug(val) : prev.slug,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) {
      setError("Brand name is required.")
      return
    }

    setError(null)
    createMutation.mutate(
      {
        name: formData.name.trim(),
        slug: formData.slug?.trim() ? formData.slug.trim() : generateSlug(formData.name),
        logoUrl: formData.logoUrl?.trim() || null,
        description: formData.description?.trim() || null,
        status: formData.status,
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
            "Failed to create brand. Please check the inputs."
          setError(msg)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Plus className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Register New Brand</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Add a brand or vendor partner to the catalog registry.
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

            {/* Brand Name & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  maxLength={100}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Sony, Logitech, Keychron"
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
                  maxLength={120}
                  onChange={(e) => {
                    setIsAutoSlug(false)
                    setFormData((p) => ({ ...p, slug: generateSlug(e.target.value) }))
                  }}
                  placeholder="e.g. logitech"
                  className="h-8.5 text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Publishing Status */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Publishing Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    status: e.target.value as BrandStatus,
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

            {/* Logo Image URL */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Brand Logo URL</label>
              <div className="relative">
                <Input
                  value={formData.logoUrl || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, logoUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="h-8.5 text-xs pl-7"
                />
                <ImageIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Description & Overview</label>
              <textarea
                value={formData.description || ""}
                maxLength={1000}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Key details about brand manufacturing, authorized vendor status, or product line..."
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
              disabled={createMutation.isPending}
              className="text-xs h-8.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="text-xs h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
