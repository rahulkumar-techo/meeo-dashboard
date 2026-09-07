/**
 * @file brand-inspector.tsx
 * @description Inspector card previewing selected brand profile, logo banner, and quick actions.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { Edit2, Trash2, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/common"
import type { Brand } from "@/types/brand"

export interface BrandInspectorProps {
  selectedBrand: Brand | null
  onEdit: (brand: Brand) => void
  onDelete: (brand: Brand) => void
}

export function BrandInspector({
  selectedBrand,
  onEdit,
  onDelete,
}: BrandInspectorProps) {
  if (!selectedBrand) {
    return (
      <Card className="border-border/70 bg-card/95 shadow-2xs text-xs p-6 text-center text-muted-foreground">
        <Building2 className="size-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="font-medium text-foreground">No Brand Selected</p>
        <p className="text-[11px] mt-1">
          Select a brand from the table to view its manufacturer profile and catalog metrics.
        </p>
      </Card>
    )
  }

  const getMonogram = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <Card className="border-border/70 bg-card/95 shadow-2xs text-xs overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Brand Profile</span>
          <StatusBadge status={selectedBrand.status} showDot />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Logo Banner Preview */}
        {selectedBrand.logoUrl || selectedBrand.logo ? (
          <div className="relative w-full h-28 rounded-lg overflow-hidden border border-border/60 bg-muted flex items-center justify-center p-3">
            <Image
              src={selectedBrand.logoUrl || selectedBrand.logo || ""}
              alt={selectedBrand.name}
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-20 w-full items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-2xl">
            {getMonogram(selectedBrand.name)}
          </div>
        )}

        {/* Primary Info */}
        <div>
          <h3 className="text-base font-bold text-foreground">{selectedBrand.name}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            /brands/{selectedBrand.slug}
          </p>
        </div>

        {/* Description */}
        <div>
          <span className="text-muted-foreground text-[10.5px] font-semibold uppercase tracking-wider">
            Overview
          </span>
          <p className="mt-1 text-muted-foreground leading-relaxed text-xs">
            {selectedBrand.description || "No overview provided for this brand."}
          </p>
        </div>

        {/* Products Metric */}
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-medium">Mapped Catalog SKUs:</span>
          <span className="text-xs font-mono font-bold text-foreground">
            {selectedBrand._count?.products ?? 0} SKUs
          </span>
        </div>

        {/* Timestamps */}
        <div className="space-y-1 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
          {selectedBrand.createdAt && (
            <div className="flex justify-between">
              <span>Registered:</span>
              <span className="font-mono text-foreground">
                {new Date(selectedBrand.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
          {selectedBrand.updatedAt && (
            <div className="flex justify-between">
              <span>Updated:</span>
              <span className="font-mono text-foreground">
                {new Date(selectedBrand.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 border-t border-border/60 pt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(selectedBrand)}
            className="flex-1 h-8 text-xs gap-1.5 font-medium border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          >
            <Edit2 className="size-3.5" />
            <span>Edit Brand</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(selectedBrand)}
            className="h-8 text-xs gap-1.5 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-200 dark:border-rose-900/50"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
