/**
 * @file identity-section.tsx
 * @description Campaign Identity, Lifecycle State, and Evaluation Priority Section.
 */

"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import type {
  CreatePromotionFormValues,
  PromotionType,
  PromotionStatus,
} from "@/types/promotion"

import { SectionHeaderGuide } from "./section-guide"

interface IdentitySectionProps {
  formData: CreatePromotionFormValues
  onChange: React.Dispatch<React.SetStateAction<CreatePromotionFormValues>>
}

export function IdentitySection({ formData, onChange }: IdentitySectionProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange((prev) => ({
      ...prev,
      name: val,
      slug:
        !prev.slug ||
        prev.slug ===
          prev.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
          ? val
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
          : prev.slug,
    }))
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-2xs">
      <SectionHeaderGuide
        icon={Sparkles}
        iconColor="text-indigo-500"
        title="1. Campaign Identity & Lifecycle"
        description="Set the campaign name, slug for URLs, discount calculation mechanism, initial publishing status, and evaluation priority."
        tips={[
          "Campaign Name: Visible in admin lists, reports, and optionally on checkout invoices.",
          "Slug: Unique URL slug for marketing landing pages and direct promotion links.",
          "Discount Type: Determines whether discount computes by %, fixed amount, BxGy, or shipping.",
          "Evaluation Priority: Higher integers run first during cart calculation (e.g. 10 runs before 1).",
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Campaign Name *
          </label>
          <Input
            required
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g. Summer Flash Discount"
            className="h-9.5 text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Slug (Unique URL Identifier) *
          </label>
          <Input
            required
            value={formData.slug}
            onChange={(e) =>
              onChange((p) => ({ ...p, slug: e.target.value }))
            }
            placeholder="summer-flash-discount"
            className="h-9.5 font-mono text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Discount Computation Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                type: e.target.value as PromotionType,
              }))
            }
            className="h-9.5 w-full rounded-md border border-border bg-background px-3 text-xs sm:text-sm text-foreground focus:outline-hidden"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_DISCOUNT">Fixed Discount (₹)</option>
            <option value="BUY_X_GET_Y">Buy X Get Y (BOGO)</option>
            <option value="FREE_SHIPPING">Free Shipping</option>
            <option value="PRODUCT_DISCOUNT">Product Discount</option>
            <option value="CATEGORY_DISCOUNT">Category Discount</option>
            <option value="BRAND_DISCOUNT">Brand Discount</option>
            <option value="FLASH_SALE">Flash Sale</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Initial Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                status: e.target.value as PromotionStatus,
              }))
            }
            className="h-9.5 w-full rounded-md border border-border bg-background px-3 text-xs sm:text-sm text-foreground focus:outline-hidden"
          >
            <option value="DRAFT">Draft (Save without activating)</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ACTIVE">Active (Live Immediately)</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Priority (Evaluation Order)
          </label>
          <Input
            type="number"
            value={formData.priority}
            onChange={(e) =>
              onChange((p) => ({ ...p, priority: Number(e.target.value) }))
            }
            placeholder="0"
            className="h-9.5 text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>
  )
}
