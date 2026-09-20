/**
 * @file page.tsx
 * @description Dedicated Full-Page Promotion Campaign Creation Console.
 * Assembles all 32 configuration parameters across modular form sections.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { useCreatePromotionMutation } from "@/hooks/use-promotion-query"
import {
  IdentitySection,
  DiscountMechanicsSection,
  AudienceStackingSection,
  ScheduleLimitsSection,
  TargetingScopeSection,
} from "@/components/promotions/form"
import {
  type CreatePromotionFormValues,
  initialPromotionFormState,
} from "@/types/promotion"

export default function CreatePromotionPage() {
  const router = useRouter()
  const [formData, setFormData] = React.useState<CreatePromotionFormValues>(
    initialPromotionFormState
  )

  const createMutation = useCreatePromotionMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Format and sanitize payload
    await createMutation.mutateAsync({
      ...formData,
      priority: Number(formData.priority) || 0,
      discountValue:
        formData.discountValue !== null && formData.discountValue !== undefined
          ? Number(formData.discountValue)
          : null,
      maxDiscountAmount:
        formData.maxDiscountAmount !== null && formData.maxDiscountAmount !== undefined
          ? Number(formData.maxDiscountAmount)
          : null,
      minOrderSubtotal:
        formData.minOrderSubtotal !== null && formData.minOrderSubtotal !== undefined
          ? Number(formData.minOrderSubtotal)
          : null,
      minQuantity:
        formData.minQuantity !== null && formData.minQuantity !== undefined
          ? Number(formData.minQuantity)
          : null,
      totalUsageLimit:
        formData.totalUsageLimit !== null && formData.totalUsageLimit !== undefined
          ? Number(formData.totalUsageLimit)
          : null,
      userUsageLimit:
        formData.userUsageLimit !== null && formData.userUsageLimit !== undefined
          ? Number(formData.userUsageLimit)
          : null,
      buyXQuantity:
        formData.type === "BUY_X_GET_Y" && formData.buyXQuantity
          ? Number(formData.buyXQuantity)
          : null,
      getYQuantity:
        formData.type === "BUY_X_GET_Y" && formData.getYQuantity
          ? Number(formData.getYQuantity)
          : null,
      getYDiscountPercentage:
        formData.type === "BUY_X_GET_Y" && formData.getYDiscountPercentage
          ? Number(formData.getYDiscountPercentage)
          : null,
      startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
      endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
    })

    router.push("/marketing/promotions")
  }

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6 max-w-[1200px] mx-auto pb-20">
      {/* 1. Header & Navigation */}
      <div className="space-y-3">
        <Link
          href="/marketing/promotions"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Campaigns</span>
        </Link>

        <PageHeader
          title="Create Promotion Campaign"
          badge="Rule Engine"
          badgeVariant="brand"
          description="Configure dynamic cart rules, BOGO bundles, tiered basket savings, and automated discount orchestrators."
        />
      </div>

      {/* 2. Comprehensive Multi-Section Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <IdentitySection formData={formData} onChange={setFormData} />
        <DiscountMechanicsSection formData={formData} onChange={setFormData} />
        <AudienceStackingSection formData={formData} onChange={setFormData} />
        <ScheduleLimitsSection formData={formData} onChange={setFormData} />
        <TargetingScopeSection formData={formData} onChange={setFormData} />

        {/* 3. Sticky Action Bar */}
        <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-xl border border-border/80 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
          <Link href="/marketing/promotions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 px-5 text-xs font-medium"
            >
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            size="sm"
            disabled={createMutation.isPending}
            className="h-10 px-6 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
          >
            <Save className="size-4" />
            <span>
              {createMutation.isPending
                ? "Creating Campaign..."
                : "Create Campaign"}
            </span>
          </Button>
        </div>
      </form>
    </div>
  )
}
