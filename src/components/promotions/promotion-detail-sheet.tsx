/**
 * @file promotion-detail-sheet.tsx
 * @description Slide-over drawer presenting detailed promotional rule specs, redemption KPIs, creator metadata, and audit logs.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tag,
  User,
  Calendar,
  Layers,
  Edit3,
  TrendingUp,
  IndianRupee,
  Receipt,
  Sparkles,
  Zap,
} from "lucide-react"
import { usePromotionDetailQuery } from "@/hooks/use-promotion-query"
import { PromotionStatusBadge, PromotionTypeBadge } from "./promotion-badges"
import type { PromotionListItem } from "@/types/promotion"

interface PromotionDetailSheetProps {
  promotionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (promotion: PromotionListItem) => void
}

export function PromotionDetailSheet({
  promotionId,
  open,
  onOpenChange,
  onEdit,
}: PromotionDetailSheetProps) {
  const { data: promo, isLoading } = usePromotionDetailQuery(
    promotionId ?? "",
    open && Boolean(promotionId)
  )

  if (!open) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-6 space-y-6">
        <SheetHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-mono text-[10px]">
              {promo?.slug || "PROMOTION"}
            </Badge>
            {promo?.status && <PromotionStatusBadge status={promo.status} />}
          </div>
          <SheetTitle className="text-xl font-bold tracking-tight">
            {promo?.name || "Promotion Details"}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {promo?.description || "Campaign rule details and real-time redemption analytics."}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <div className="animate-spin inline-block size-5 border-2 border-current border-t-transparent rounded-full text-indigo-600" />
            <p>Loading campaign specifications...</p>
          </div>
        ) : promo ? (
          <div className="space-y-6">
            {/* 1. Key Performance Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Receipt className="size-3.5 text-indigo-500" />
                  <span>Redemptions</span>
                </div>
                <div className="text-base font-bold text-foreground">
                  {(promo.stats?.totalRedemptions ?? promo.currentUsageCount ?? 0).toLocaleString()}
                </div>
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <IndianRupee className="size-3.5 text-emerald-500" />
                  <span>Discount Given</span>
                </div>
                <div className="text-base font-bold text-foreground">
                  ₹{(promo.stats?.totalDiscountGiven ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <TrendingUp className="size-3.5 text-amber-500" />
                  <span>Avg Discount</span>
                </div>
                <div className="text-base font-bold text-foreground">
                  ₹{(promo.stats?.averageDiscount ?? 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* 2. Configuration & Discount Rules */}
            <div className="space-y-3 rounded-lg border border-border/80 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-indigo-500" />
                <span>Rule Configuration</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Discount Type:</span>
                  <div className="mt-0.5"><PromotionTypeBadge type={promo.type} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority Level:</span>
                  <div className="mt-0.5 font-semibold font-mono">P{promo.priority}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Discount Value:</span>
                  <div className="mt-0.5 font-semibold text-foreground">
                    {promo.discountValue ? `${promo.discountValue}` : "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Discount Cap:</span>
                  <div className="mt-0.5 font-semibold text-foreground">
                    {promo.maxDiscountAmount ? `₹${promo.maxDiscountAmount}` : "None"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Min Order Subtotal:</span>
                  <div className="mt-0.5 font-semibold text-foreground">
                    {promo.minOrderSubtotal ? `₹${promo.minOrderSubtotal}` : "None"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Trigger Mode:</span>
                  <div className="mt-0.5 font-semibold flex items-center gap-1">
                    {promo.isAutomatic ? (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Zap className="size-3" /> Automatic
                      </span>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Tag className="size-3" /> Code Trigger ({promo.code || "None"})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {promo.type === "BUY_X_GET_Y" && (
                <div className="mt-2 pt-2 border-t border-border/50 text-xs">
                  <span className="text-muted-foreground">BOGO Terms:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    Buy {promo.buyXQuantity ?? 1} Get {promo.getYQuantity ?? 1} at {promo.getYDiscountPercentage ?? 100}% discount
                  </p>
                </div>
              )}
            </div>

            {/* 3. Creator Metadata */}
            {promo.creator && (
              <div className="space-y-2 rounded-lg border border-border/80 p-4 bg-muted/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-indigo-500" />
                  <span>Created By</span>
                </h4>
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-foreground">
                    {promo.creator.firstName} {promo.creator.lastName}
                  </p>
                  <p className="font-mono text-muted-foreground text-[11px]">
                    {promo.creator.email}
                  </p>
                </div>
              </div>
            )}

            {/* 4. Action button */}
            <div className="pt-2 flex justify-end">
              <Link href={`/marketing/promotions/${promo.id}/edit`}>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => onOpenChange(false)}
                >
                  <Edit3 className="size-3.5" />
                  <span>Edit Promotion</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
