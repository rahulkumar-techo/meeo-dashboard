/**
 * @file brand-form-preview.tsx
 * @description Live card preview component for brand creation and editing.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { Eye, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BrandStatus } from "@/types/brand"

export interface BrandFormPreviewProps {
  name: string
  slug: string
  logoUrl: string
  description: string
  status: BrandStatus
}

export function BrandFormPreview({
  name,
  slug,
  logoUrl,
  description,
  status,
}: BrandFormPreviewProps) {
  const getMonogram = (n: string) => {
    if (!n.trim()) return "BR"
    return n
      .split(" ")
      .map((p) => p[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

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
          {/* Brand Logo or Monogram */}
          {logoUrl ? (
            <div className="relative h-28 w-full overflow-hidden rounded-lg bg-muted border border-border/60 flex items-center justify-center p-2">
              <Image
                src={logoUrl}
                alt={name || "Brand Logo"}
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-24 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-indigo-500/5 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xl gap-1">
              <span>{getMonogram(name)}</span>
              <span className="text-[10px] font-normal text-muted-foreground">Logo Preview</span>
            </div>
          )}

          <div>
            <h3 className="font-bold text-sm text-foreground">{name || "Untitled Brand"}</h3>
            <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
              /brands/{slug || "brand-slug"}
            </p>
          </div>

          {description ? (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {description}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No description provided.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Permissions Guide */}
      <Card className="border-border/70 bg-muted/20 shadow-2xs">
        <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Brand Ownership & Registry</span>
          </div>
          <p className="text-[11.5px] leading-relaxed">
            Registered brands can be immediately assigned to products across all taxonomy categories.
            Catalog attribution updates automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
