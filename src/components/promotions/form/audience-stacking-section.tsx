/**
 * @file audience-stacking-section.tsx
 * @description Customer Segmentation, Stacking Policies, First Order Constraint & Triggers.
 */

"use client"

import * as React from "react"
import { Users, Layers, Zap, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import type {
  CreatePromotionFormValues,
  CustomerSegment,
  StackingRule,
} from "@/types/promotion"

import { SectionHeaderGuide } from "./section-guide"

interface AudienceStackingSectionProps {
  formData: CreatePromotionFormValues
  onChange: React.Dispatch<React.SetStateAction<CreatePromotionFormValues>>
}

export function AudienceStackingSection({
  formData,
  onChange,
}: AudienceStackingSectionProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-2xs">
      <SectionHeaderGuide
        icon={Users}
        iconColor="text-purple-500"
        title="3. Audience Targeting, Stacking Rules & Trigger Mode"
        description="Specify target customer cohorts, promo voucher codes vs automatic checkout triggers, discount stacking compatibility, and new-buyer restrictions."
        tips={[
          "Customer Segment: Target all customers or restrict to VIP, Returning, Registered, or First-Time buyers.",
          "Stacking Policy: Control whether this discount combines with other promotions or coupons.",
          "Promo Code: Require entering a coupon code (e.g. SUMMER20) or leave empty for auto-apply.",
          "Automatic Mode: Automatically applies the best deal when basket qualification criteria are met.",
          "First Order Only: Prevents repeat customers from claiming introductory welcome discounts.",
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Target Customer Segment
          </label>
          <select
            value={formData.customerSegment}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                customerSegment: e.target.value as CustomerSegment,
              }))
            }
            className="h-9.5 w-full rounded-md border border-border bg-background px-3 text-xs sm:text-sm text-foreground focus:outline-hidden"
          >
            <option value="ALL">All Customers</option>
            <option value="FIRST_TIME_BUYER">First Time Buyers</option>
            <option value="VIP">VIP Tier</option>
            <option value="RETURNING">Returning Customers</option>
            <option value="REGISTERED">Registered Users</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Stacking Rule Policy
          </label>
          <select
            value={formData.stackingRule}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                stackingRule: e.target.value as StackingRule,
              }))
            }
            className="h-9.5 w-full rounded-md border border-border bg-background px-3 text-xs sm:text-sm text-foreground focus:outline-hidden"
          >
            <option value="EXCLUSIVE">Exclusive (No Stacking)</option>
            <option value="STACKABLE_WITH_OTHERS">Stackable With Other Promos</option>
            <option value="STACKABLE_WITH_COUPONS">Stackable With Coupons</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Trigger Promo Code (Optional)
          </label>
          <Input
            value={formData.code ?? ""}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                code: e.target.value || null,
              }))
            }
            placeholder="e.g. FLASH20"
            className="h-9.5 font-mono text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Boolean Switches & Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <label className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={formData.isAutomatic}
            onChange={(e) =>
              onChange((p) => ({ ...p, isAutomatic: e.target.checked }))
            }
            className="size-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
          />
          <div className="space-y-0.5">
            <span className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Zap className="size-3 text-amber-500" /> Automatic Cart Rule
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Applied automatically without voucher code
            </span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={formData.isStackable}
            onChange={(e) =>
              onChange((p) => ({ ...p, isStackable: e.target.checked }))
            }
            className="size-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
          />
          <div className="space-y-0.5">
            <span className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="size-3 text-indigo-500" /> Enable Stacking
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Allow combining with other campaigns
            </span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={formData.firstOrderOnly}
            onChange={(e) =>
              onChange((p) => ({ ...p, firstOrderOnly: e.target.checked }))
            }
            className="size-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
          />
          <div className="space-y-0.5">
            <span className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="size-3 text-emerald-500" /> First Order Only
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Restrict promotion to initial customer checkout
            </span>
          </div>
        </label>
      </div>
    </div>
  )
}
