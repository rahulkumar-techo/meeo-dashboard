/**
 * @file page.tsx
 * @description Dedicated Full-Page Promotion Campaign Edit Console.
 * Loads existing promotional campaign rules and allows editing all 32 configuration parameters.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import {
  usePromotionDetailQuery,
  useUpdatePromotionMutation,
} from "@/hooks/use-promotion-query"
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

export default function EditPromotionPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || ""

  const { data: promotion, isLoading, isError } = usePromotionDetailQuery(id)
  const updateMutation = useUpdatePromotionMutation()

  const [formData, setFormData] = React.useState<CreatePromotionFormValues>(
    initialPromotionFormState
  )

  // Populate form with existing promotion data
  React.useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name || "",
        slug: promotion.slug || "",
        description: promotion.description || "",
        code: promotion.code || "",
        type: promotion.type || "PERCENTAGE",
        status: promotion.status || "DRAFT",
        priority: promotion.priority ?? 0,
        isStackable: Boolean(promotion.isStackable),
        stackingRule:
          (promotion.stackingRule as CreatePromotionFormValues["stackingRule"]) ||
          "EXCLUSIVE",
        isAutomatic: Boolean(promotion.isAutomatic),
        customerSegment:
          (promotion.customerSegment as CreatePromotionFormValues["customerSegment"]) ||
          "ALL",
        firstOrderOnly: Boolean(promotion.firstOrderOnly),
        discountValue:
          promotion.discountValue !== undefined && promotion.discountValue !== null
            ? Number(promotion.discountValue)
            : null,
        maxDiscountAmount:
          promotion.maxDiscountAmount !== undefined && promotion.maxDiscountAmount !== null
            ? Number(promotion.maxDiscountAmount)
            : null,
        minOrderSubtotal:
          promotion.minOrderSubtotal !== undefined && promotion.minOrderSubtotal !== null
            ? Number(promotion.minOrderSubtotal)
            : null,
        minQuantity:
          promotion.minQuantity !== undefined && promotion.minQuantity !== null
            ? Number(promotion.minQuantity)
            : null,
        buyXQuantity: promotion.buyXQuantity ?? null,
        getYQuantity: promotion.getYQuantity ?? null,
        getYDiscountPercentage: promotion.getYDiscountPercentage ?? 100,
        startsAt: promotion.startsAt
          ? new Date(promotion.startsAt).toISOString().slice(0, 16)
          : null,
        endsAt: promotion.endsAt
          ? new Date(promotion.endsAt).toISOString().slice(0, 16)
          : null,
        timeOfDayStart: promotion.timeOfDayStart ?? null,
        timeOfDayEnd: promotion.timeOfDayEnd ?? null,
        daysOfWeek: promotion.daysOfWeek ?? [],
        totalUsageLimit: promotion.totalUsageLimit ?? null,
        userUsageLimit: promotion.userUsageLimit ?? null,
        targetProductIds: promotion.targetProductIds ?? [],
        targetCategoryIds: promotion.targetCategoryIds ?? [],
        targetBrandIds: promotion.targetBrandIds ?? [],
        excludedProductIds: promotion.excludedProductIds ?? [],
        excludedCategoryIds: promotion.excludedCategoryIds ?? [],
        metadata: promotion.metadata ?? null,
      })
    }
  }, [promotion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await updateMutation.mutateAsync({
      id,
      payload: {
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
      },
    })

    router.push("/marketing/promotions")
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
        <Loader2 className="size-7 animate-spin text-indigo-600" />
        <p className="text-xs text-muted-foreground">Loading campaign rule details...</p>
      </div>
    )
  }

  if (isError || !promotion) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="size-8 text-rose-500" />
        <h3 className="text-base font-bold text-foreground">Promotion Not Found</h3>
        <p className="text-xs text-muted-foreground">
          The promotional campaign you are trying to edit could not be found or has been removed.
        </p>
        <Link href="/marketing/promotions">
          <Button variant="outline" size="sm">Back to Promotions</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6 max-w-[1200px] mx-auto pb-20">
      {/* 1. Navigation & Header */}
      <div className="space-y-3">
        <Link
          href="/marketing/promotions"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Campaigns</span>
        </Link>

        <PageHeader
          title={`Edit Promotion: ${promotion.name}`}
          badge={promotion.status}
          badgeVariant="brand"
          description="Update discount parameters, audience segmentation, validity dates, or redemption limits."
        />
      </div>

      {/* 2. Form with All 5 Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <IdentitySection formData={formData} onChange={setFormData} />
        <DiscountMechanicsSection formData={formData} onChange={setFormData} />
        <AudienceStackingSection formData={formData} onChange={setFormData} />
        <ScheduleLimitsSection formData={formData} onChange={setFormData} />
        <TargetingScopeSection formData={formData} onChange={setFormData} />

        {/* 3. Sticky Bottom Action Bar */}
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
            disabled={updateMutation.isPending}
            className="h-10 px-6 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
          >
            <Save className="size-4" />
            <span>
              {updateMutation.isPending
                ? "Saving Changes..."
                : "Save Promotion Changes"}
            </span>
          </Button>
        </div>
      </form>
    </div>
  )
}
