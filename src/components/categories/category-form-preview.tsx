/**
 * @file category-form-preview.tsx
 * @description Live Card preview and taxonomy guidelines for category creation form (< 120 lines).
 */

"use client"

import * as React from "react"
import { Eye, Image as ImageIcon, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Category, CategoryStatus } from "@/types/category"

export interface CategoryFormPreviewProps {
  name: string
  slug: string
  parentId: string
  status: CategoryStatus
  sortOrder: number
  imageUrl: string
  description: string
  existingCategories?: Category[]
}

export function CategoryFormPreview({
  name,
  slug,
  parentId,
  status,
  sortOrder,
  imageUrl,
  description,
  existingCategories = [],
}: CategoryFormPreviewProps) {
  const safeCategories = Array.isArray(existingCategories) ? existingCategories : []
  const selectedParent = safeCategories.find((c) => c.id === parentId)


  return (
    <div className="space-y-5">
      {/* Live Preview Card */}
      <Card className="border-border/70 shadow-2xs overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="size-3.5 text-indigo-500" />
              <span>Catalog Live Preview</span>
            </CardTitle>
            <Badge
              variant={status === "ACTIVE" ? "default" : "outline"}
              className="text-[10px] uppercase font-mono"
            >
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3.5">
          {imageUrl ? (
            <div className="relative h-32 w-full overflow-hidden rounded-lg bg-muted border border-border/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={name || "Preview"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = "none"
                }}
              />
            </div>
          ) : (
            <div className="flex h-24 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/30 text-muted-foreground text-xs gap-1">
              <ImageIcon className="size-5" />
              <span>No banner image set</span>
            </div>
          )}

          <div>
            <h3 className="font-bold text-sm text-foreground">{name || "Untitled Category"}</h3>
            <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
              /c/{slug || "category-slug"}
            </p>
          </div>

          <div className="rounded-md bg-muted/40 p-2.5 space-y-1 text-xs">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Parent Node:</span>
              <span className="font-medium text-foreground">
                {selectedParent ? selectedParent.name : "Root Level (None)"}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Sort Order:</span>
              <span className="font-mono text-foreground">{sortOrder}</span>
            </div>
          </div>

          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Security & Access Info Card */}
      <Card className="border-border/70 bg-muted/20 shadow-2xs">
        <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Taxonomy Permissions</span>
          </div>
          <p className="text-[11.5px] leading-relaxed">
            Requires <code className="text-foreground font-mono">category:create</code> or{" "}
            <code className="text-foreground font-mono">product:create</code> scope. Newly created
            records are attributed to your authenticated user account.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
