/**
 * @file promotion-badges.tsx
 * @description Visual status and type badges for E-commerce Promotions.
 */

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Percent,
  IndianRupee,
  Gift,
  Truck,
  Package,
  FolderTree,
  Building2,
  Flame,
} from "lucide-react"
import type { PromotionStatus, PromotionType } from "@/types/promotion"

export function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium">
          Active (Live)
        </Badge>
      )
    case "SCHEDULED":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] font-medium">
          Scheduled
        </Badge>
      )
    case "PAUSED":
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-medium">
          Paused
        </Badge>
      )
    case "DRAFT":
      return (
        <Badge variant="outline" className="text-muted-foreground border-border text-[10px] font-medium">
          Draft
        </Badge>
      )
    case "EXPIRED":
      return (
        <Badge variant="secondary" className="text-muted-foreground text-[10px] font-medium">
          Expired
        </Badge>
      )
    case "ARCHIVED":
      return (
        <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-medium">
          Archived
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function PromotionTypeBadge({ type }: { type: PromotionType }) {
  switch (type) {
    case "PERCENTAGE":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
          <Percent className="size-3" /> Percentage
        </span>
      )
    case "FIXED_DISCOUNT":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <IndianRupee className="size-3" /> Fixed Discount
        </span>
      )
    case "BUY_X_GET_Y":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400">
          <Gift className="size-3" /> Buy X Get Y
        </span>
      )
    case "FREE_SHIPPING":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400">
          <Truck className="size-3" /> Free Shipping
        </span>
      )
    case "PRODUCT_DISCOUNT":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
          <Package className="size-3" /> Product Discount
        </span>
      )
    case "CATEGORY_DISCOUNT":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
          <FolderTree className="size-3" /> Category Discount
        </span>
      )
    case "BRAND_DISCOUNT":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          <Building2 className="size-3" /> Brand Discount
        </span>
      )
    case "FLASH_SALE":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
          <Flame className="size-3" /> Flash Sale
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="size-3" /> {type}
        </span>
      )
  }
}
