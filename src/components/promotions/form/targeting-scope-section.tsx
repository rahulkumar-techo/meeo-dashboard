/**
 * @file targeting-scope-section.tsx
 * @description Catalog Targeting, Exclusions, UUID Scopes, Description & Metadata Section.
 */

"use client"

import * as React from "react"
import { Crosshair, FileJson } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CreatePromotionFormValues } from "@/types/promotion"

import { SectionHeaderGuide } from "./section-guide"

interface TargetingScopeSectionProps {
  formData: CreatePromotionFormValues
  onChange: React.Dispatch<React.SetStateAction<CreatePromotionFormValues>>
}

export function TargetingScopeSection({
  formData,
  onChange,
}: TargetingScopeSectionProps) {
  const [metadataText, setMetadataText] = React.useState(
    formData.metadata ? JSON.stringify(formData.metadata, null, 2) : ""
  )
  const [metadataError, setMetadataError] = React.useState<string | null>(null)

  const handleArrayInput = (
    field: keyof CreatePromotionFormValues,
    value: string
  ) => {
    const list = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    onChange((p) => ({ ...p, [field]: list }))
  }

  const handleMetadataChange = (val: string) => {
    setMetadataText(val)
    if (!val.trim()) {
      setMetadataError(null)
      onChange((p) => ({ ...p, metadata: null }))
      return
    }
    try {
      const parsed = JSON.parse(val)
      setMetadataError(null)
      onChange((p) => ({ ...p, metadata: parsed }))
    } catch {
      setMetadataError("Invalid JSON format")
    }
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-2xs">
      <SectionHeaderGuide
        icon={Crosshair}
        iconColor="text-cyan-500"
        title="5. Catalog Scope, Exclusions & Metadata"
        description="Limit the discount scope to specific categories, brands, or products using comma-separated UUIDs (easily copied from the catalog tables). You can also configure exclusion lists, terms, and custom JSON metadata."
        tips={[
          "Target IDs: Paste comma-separated Category, Brand, or Product UUIDs. Leave blank to apply to all items.",
          "Excluded Product IDs: Prevent specific items (e.g. clearance or luxury goods) from receiving discounts.",
          "Campaign Description: Markdown or plain text summary of promotional terms and eligibility criteria.",
          "Custom JSON Metadata: Optional structured payload for CMS badges, banner links, or webhooks.",
        ]}
      />

      {/* Target IDs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Target Category IDs
          </label>
          <Input
            value={formData.targetCategoryIds?.join(", ") ?? ""}
            onChange={(e) =>
              handleArrayInput("targetCategoryIds", e.target.value)
            }
            placeholder="UUID1, UUID2..."
            className="h-9.5 font-mono text-xs"
          />
          <span className="block text-[10px] text-muted-foreground">
            Comma-separated category UUIDs
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Target Brand IDs
          </label>
          <Input
            value={formData.targetBrandIds?.join(", ") ?? ""}
            onChange={(e) => handleArrayInput("targetBrandIds", e.target.value)}
            placeholder="UUID1, UUID2..."
            className="h-9.5 font-mono text-xs"
          />
          <span className="block text-[10px] text-muted-foreground">
            Comma-separated brand UUIDs
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Target Product IDs
          </label>
          <Input
            value={formData.targetProductIds?.join(", ") ?? ""}
            onChange={(e) =>
              handleArrayInput("targetProductIds", e.target.value)
            }
            placeholder="UUID1, UUID2..."
            className="h-9.5 font-mono text-xs"
          />
          <span className="block text-[10px] text-muted-foreground">
            Comma-separated product UUIDs
          </span>
        </div>
      </div>

      {/* Excluded IDs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Excluded Category IDs
          </label>
          <Input
            value={formData.excludedCategoryIds?.join(", ") ?? ""}
            onChange={(e) =>
              handleArrayInput("excludedCategoryIds", e.target.value)
            }
            placeholder="UUID1, UUID2..."
            className="h-9.5 font-mono text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Excluded Product IDs
          </label>
          <Input
            value={formData.excludedProductIds?.join(", ") ?? ""}
            onChange={(e) =>
              handleArrayInput("excludedProductIds", e.target.value)
            }
            placeholder="UUID1, UUID2..."
            className="h-9.5 font-mono text-xs"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-semibold text-foreground">
          Campaign Description & Terms
        </label>
        <Textarea
          value={formData.description ?? ""}
          onChange={(e) =>
            onChange((p) => ({
              ...p,
              description: e.target.value || null,
            }))
          }
          placeholder="Customer-facing or internal notes regarding promotional conditions..."
          className="min-h-[75px] text-xs sm:text-sm"
        />
      </div>

      {/* Metadata JSON */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-semibold text-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileJson className="size-3.5 text-muted-foreground" />
            <span>Custom Metadata (JSON)</span>
          </span>
          {metadataError && (
            <span className="text-[11px] font-normal text-rose-500">
              {metadataError}
            </span>
          )}
        </label>
        <Textarea
          value={metadataText}
          onChange={(e) => handleMetadataChange(e.target.value)}
          placeholder={`{\n  "bannerTag": "SUMMER_SALE",\n  "featured": true\n}`}
          className="min-h-[85px] font-mono text-xs"
        />
      </div>
    </div>
  )
}
