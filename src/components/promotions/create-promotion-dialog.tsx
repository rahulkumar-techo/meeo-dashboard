/**
 * @file create-promotion-dialog.tsx
 * @description Spacious, uncollapsed dialog modal for creating a new Promotion & Campaign Rule.
 */

"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreatePromotionMutation } from "@/hooks/use-promotion-query"
import {
  type PromotionType,
  type PromotionStatus,
  type CustomerSegment,
  type StackingRule,
  type CreatePromotionFormValues,
  initialPromotionFormState,
} from "@/types/promotion"

interface CreatePromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreatePromotionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePromotionDialogProps) {
  const [formData, setFormData] = React.useState<CreatePromotionFormValues>(initialPromotionFormState)

  const createMutation = useCreatePromotionMutation()

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug:
        !prev.slug || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          ? val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
          : prev.slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMutation.mutateAsync({
      ...formData,
      priority: Number(formData.priority) || 0,
      discountValue: formData.discountValue ? Number(formData.discountValue) : null,
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
      minOrderSubtotal: formData.minOrderSubtotal ? Number(formData.minOrderSubtotal) : null,
      totalUsageLimit: formData.totalUsageLimit ? Number(formData.totalUsageLimit) : null,
      userUsageLimit: formData.userUsageLimit ? Number(formData.userUsageLimit) : null,
      buyXQuantity: formData.type === "BUY_X_GET_Y" ? Number(formData.buyXQuantity) : null,
      getYQuantity: formData.type === "BUY_X_GET_Y" ? Number(formData.getYQuantity) : null,
      getYDiscountPercentage: formData.type === "BUY_X_GET_Y" ? Number(formData.getYDiscountPercentage) : null,
    })
    onOpenChange(false)
    setFormData(initialPromotionFormState)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto p-6 sm:p-7">
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="text-lg font-bold tracking-tight">Create New Promotion</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Configure dynamic cart discount rules, BOGO bundles, tiered savings, or targeted customer campaigns.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Section 1: Campaign Identity */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Campaign Identity & Lifecycle
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Campaign Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Summer Flash Discount"
                  className="h-9.5 text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Slug (Identifier) *</label>
                <Input
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="summer-flash-discount"
                  className="h-9.5 font-mono text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Discount Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value as PromotionType }))}
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
                <label className="block text-xs font-semibold text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as PromotionStatus }))}
                  className="h-9.5 w-full rounded-md border border-border bg-background px-3 text-xs sm:text-sm text-foreground focus:outline-hidden"
                >
                  <option value="DRAFT">Draft (Not Live)</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ACTIVE">Active (Live Immediately)</option>
                  <option value="PAUSED">Paused</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Priority (Evaluation Order)</label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData((p) => ({ ...p, priority: Number(e.target.value) }))}
                  className="h-9.5 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Discount Computation Rules */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Discount Formula & Thresholds
            </h4>

            {formData.type === "BUY_X_GET_Y" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Buy Quantity (X)</label>
                  <Input
                    type="number"
                    value={formData.buyXQuantity ?? ""}
                    onChange={(e) => setFormData((p) => ({ ...p, buyXQuantity: Number(e.target.value) }))}
                    placeholder="2"
                    className="h-9.5 text-xs sm:text-sm bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Get Quantity (Y)</label>
                  <Input
                    type="number"
                    value={formData.getYQuantity ?? ""}
                    onChange={(e) => setFormData((p) => ({ ...p, getYQuantity: Number(e.target.value) }))}
                    placeholder="1"
                    className="h-9.5 text-xs sm:text-sm bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Y Discount (%)</label>
                  <Input
                    type="number"
                    value={formData.getYDiscountPercentage ?? 100}
                    onChange={(e) => setFormData((p) => ({ ...p, getYDiscountPercentage: Number(e.target.value) }))}
                    placeholder="100"
                    className="h-9.5 text-xs sm:text-sm bg-background"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Discount Value</label>
                  <Input
                    type="number"
                    value={formData.discountValue ?? ""}
                    onChange={(e) => setFormData((p) => ({ ...p, discountValue: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="15"
                    className="h-9.5 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Min Order Subtotal (₹)</label>
                  <Input
                    type="number"
                    value={formData.minOrderSubtotal ?? ""}
                    onChange={(e) => setFormData((p) => ({ ...p, minOrderSubtotal: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="100"
                    className="h-9.5 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Max Discount Cap (₹)</label>
                  <Input
                    type="number"
                    value={formData.maxDiscountAmount ?? ""}
                    onChange={(e) => setFormData((p) => ({ ...p, maxDiscountAmount: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="50"
                    className="h-9.5 text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Audience, Stacking & Constraints */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Target Audience & Usage Caps
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Stacking Rule</label>
                <select
                  value={formData.stackingRule}
                  onChange={(e) => setFormData((p) => ({ ...p, stackingRule: e.target.value as StackingRule }))}
                  className="h-9.5 w-full rounded-md border border-border bg-background px-3 text-xs sm:text-sm text-foreground focus:outline-hidden"
                >
                  <option value="EXCLUSIVE">Exclusive (No Stacking)</option>
                  <option value="STACKABLE_WITH_OTHERS">Stackable With Others</option>
                  <option value="STACKABLE_WITH_COUPONS">Stackable With Coupons</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Customer Segment</label>
                <select
                  value={formData.customerSegment}
                  onChange={(e) => setFormData((p) => ({ ...p, customerSegment: e.target.value as CustomerSegment }))}
                  className="h-9.5 w-full rounded-md border border-border bg-background px-3 text-xs sm:text-sm text-foreground focus:outline-hidden"
                >
                  <option value="ALL">All Customers</option>
                  <option value="FIRST_TIME_BUYER">First Time Buyers Only</option>
                  <option value="VIP">VIP Tier</option>
                  <option value="RETURNING">Returning Customers</option>
                  <option value="REGISTERED">Registered Users</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Trigger Promo Code (Optional)</label>
                <Input
                  value={formData.code ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                  placeholder="e.g. SUMMER15"
                  className="h-9.5 font-mono text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Global Total Usage Limit</label>
                <Input
                  type="number"
                  value={formData.totalUsageLimit ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, totalUsageLimit: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="e.g. 1000 (Leave empty for unlimited)"
                  className="h-9.5 text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Per-Customer Usage Limit</label>
                <Input
                  type="number"
                  value={formData.userUsageLimit ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, userUsageLimit: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="e.g. 2 per customer"
                  className="h-9.5 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">Campaign Description (Optional)</label>
              <Textarea
                value={formData.description ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Internal notes or customer-facing promo description..."
                className="min-h-[72px] text-xs sm:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
            >
              {createMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
