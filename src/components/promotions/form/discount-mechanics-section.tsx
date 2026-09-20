/**
 * @file discount-mechanics-section.tsx
 * @description Discount Computation, BxGy, Cart Thresholds & Min Quantity Section.
 */

"use client"

import * as React from "react"
import { ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { CreatePromotionFormValues } from "@/types/promotion"

import { SectionHeaderGuide } from "./section-guide"

interface DiscountMechanicsSectionProps {
  formData: CreatePromotionFormValues
  onChange: React.Dispatch<React.SetStateAction<CreatePromotionFormValues>>
}

export function DiscountMechanicsSection({
  formData,
  onChange,
}: DiscountMechanicsSectionProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-2xs">
      <SectionHeaderGuide
        icon={ShieldCheck}
        iconColor="text-emerald-500"
        title="2. Discount Formula & Cart Thresholds"
        description="Configure discount calculation rates, minimum cart subtotal requirements in ₹, maximum discount caps, and bundle rules (Buy X Get Y)."
        tips={[
          "Discount Value: The percentage (%) or rupee (₹) deduction applied to matched items.",
          "Max Discount Cap (₹): Maximum possible savings allowed per order to protect profit margins.",
          "Min Order Subtotal (₹): Basket subtotal necessary before the promotion triggers.",
          "Min Item Quantity: Minimum quantity of eligible items required in cart.",
          "Buy X Get Y: Number of items a customer must buy to receive the free/discounted units.",
        ]}
      />

      {formData.type === "BUY_X_GET_Y" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Buy Quantity (X) *
            </label>
            <Input
              type="number"
              value={formData.buyXQuantity ?? ""}
              onChange={(e) =>
                onChange((p) => ({
                  ...p,
                  buyXQuantity: e.target.value ? Number(e.target.value) : null,
                }))
              }
              placeholder="e.g. 2"
              className="h-9.5 text-xs sm:text-sm bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Get Quantity (Y) *
            </label>
            <Input
              type="number"
              value={formData.getYQuantity ?? ""}
              onChange={(e) =>
                onChange((p) => ({
                  ...p,
                  getYQuantity: e.target.value ? Number(e.target.value) : null,
                }))
              }
              placeholder="e.g. 1"
              className="h-9.5 text-xs sm:text-sm bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Y Discount Percentage (%) *
            </label>
            <Input
              type="number"
              value={formData.getYDiscountPercentage ?? 100}
              onChange={(e) =>
                onChange((p) => ({
                  ...p,
                  getYDiscountPercentage: e.target.value
                    ? Number(e.target.value)
                    : null,
                }))
              }
              placeholder="100 (Free)"
              className="h-9.5 text-xs sm:text-sm bg-background"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Discount Value {formData.type === "PERCENTAGE" ? "(%)" : "(₹)"}
            </label>
            <Input
              type="number"
              value={formData.discountValue ?? ""}
              onChange={(e) =>
                onChange((p) => ({
                  ...p,
                  discountValue: e.target.value ? Number(e.target.value) : null,
                }))
              }
              placeholder="15"
              className="h-9.5 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Minimum Order Subtotal (₹)
            </label>
            <Input
              type="number"
              value={formData.minOrderSubtotal ?? ""}
              onChange={(e) =>
                onChange((p) => ({
                  ...p,
                  minOrderSubtotal: e.target.value
                    ? Number(e.target.value)
                    : null,
                }))
              }
              placeholder="e.g. 500"
              className="h-9.5 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Maximum Discount Cap (₹)
            </label>
            <Input
              type="number"
              value={formData.maxDiscountAmount ?? ""}
              onChange={(e) =>
                onChange((p) => ({
                  ...p,
                  maxDiscountAmount: e.target.value
                    ? Number(e.target.value)
                    : null,
                }))
              }
              placeholder="e.g. 200"
              className="h-9.5 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Minimum Item Quantity
            </label>
            <Input
              type="number"
              value={formData.minQuantity ?? ""}
              onChange={(e) =>
                onChange((p) => ({
                  ...p,
                  minQuantity: e.target.value ? Number(e.target.value) : null,
                }))
              }
              placeholder="e.g. 1"
              className="h-9.5 text-xs sm:text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}
