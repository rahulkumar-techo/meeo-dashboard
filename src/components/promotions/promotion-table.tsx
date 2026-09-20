/**
 * @file promotion-table.tsx
 * @description Data table for promotional campaigns with quick status transitions, usage limits, and action menus.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Eye,
  Edit3,
  Play,
  Pause,
  Archive,
  Layers,
  Copy,
  CheckCircle2,
  Tag,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PromotionStatusBadge, PromotionTypeBadge } from "./promotion-badges"
import type { PromotionListItem } from "@/types/promotion"

interface PromotionTableProps {
  promotions: PromotionListItem[]
  isLoading?: boolean
  onInspect: (promotion: PromotionListItem) => void
  onEdit: (promotion: PromotionListItem) => void
  onPublish: (promotion: PromotionListItem) => void
  onPause: (promotion: PromotionListItem) => void
  onArchive: (promotion: PromotionListItem) => void
}

export function PromotionTable({
  promotions,
  isLoading,
  onInspect,
  onEdit,
  onPublish,
  onPause,
  onArchive,
}: PromotionTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground space-y-3">
        <div className="animate-spin inline-block size-6 border-2 border-current border-t-transparent rounded-full text-indigo-600" />
        <p>Loading promotional campaigns...</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
            <TableHead className="font-bold">CAMPAIGN & SLUG</TableHead>
            <TableHead className="font-bold">TYPE</TableHead>
            <TableHead className="font-bold">DISCOUNT</TableHead>
            <TableHead className="font-bold">PRIORITY</TableHead>
            <TableHead className="font-bold">TRIGGER</TableHead>
            <TableHead className="font-bold">REDEMPTIONS</TableHead>
            <TableHead className="font-bold">STATUS</TableHead>
            <TableHead className="font-bold text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs font-normal">
          {promotions.map((promo) => {
            const usageCount = promo.currentUsageCount ?? promo._count?.usages ?? 0
            const totalLimit = promo.totalUsageLimit
            const isLimitReached = totalLimit ? usageCount >= totalLimit : false

            return (
              <TableRow
                key={promo.id}
                className="hover:bg-muted/40 transition-colors group"
              >
                {/* 1. Campaign Name & Slug */}
                <TableCell>
                  <div className="space-y-0.5">
                    <button
                      onClick={() => onInspect(promo)}
                      className="text-left font-semibold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {promo.name}
                    </button>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                      <span>{promo.slug}</span>
                      <button
                        onClick={() => copyToClipboard(promo.slug, promo.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                        title="Copy slug"
                      >
                        {copiedId === promo.id ? (
                          <CheckCircle2 className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </TableCell>

                {/* 2. Type */}
                <TableCell>
                  <PromotionTypeBadge type={promo.type} />
                </TableCell>

                {/* 3. Discount Value */}
                <TableCell className="font-medium text-foreground">
                  {promo.type === "PERCENTAGE" && promo.discountValue
                    ? `${promo.discountValue}% OFF`
                    : (promo.type === "FIXED_DISCOUNT" || (promo.type as string) === "FIXED_AMOUNT") && promo.discountValue
                    ? `₹${promo.discountValue} OFF`
                    : promo.type === "BUY_X_GET_Y"
                    ? "BOGO Rule"
                    : promo.type === "FREE_SHIPPING"
                    ? "Free Shipping"
                    : promo.type === "FLASH_SALE" && promo.discountValue
                    ? `${promo.discountValue}% Flash`
                    : promo.discountValue
                    ? `${promo.discountValue}`
                    : "Dynamic"}
                </TableCell>

                {/* 4. Priority */}
                <TableCell>
                  <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                    <Layers className="size-2.5" /> P{promo.priority}
                  </span>
                </TableCell>

                {/* 5. Trigger (Automatic vs Code) */}
                <TableCell>
                  {promo.isAutomatic ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      <Zap className="size-3" /> Auto Applied
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      <Tag className="size-3" /> Code Trigger
                    </span>
                  )}
                </TableCell>

                {/* 6. Redemptions */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-mono">
                      <span className="font-bold text-foreground">
                        {usageCount.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        / {totalLimit ? totalLimit.toLocaleString() : "∞"}
                      </span>
                    </div>
                    {totalLimit && (
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isLimitReached
                              ? "bg-rose-500"
                              : usageCount / totalLimit > 0.8
                              ? "bg-amber-500"
                              : "bg-indigo-600"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (usageCount / totalLimit) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* 7. Status */}
                <TableCell>
                  <PromotionStatusBadge status={promo.status} />
                </TableCell>

                {/* 8. Action buttons */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View details */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => onInspect(promo)}
                      title="Inspect Details"
                    >
                      <Eye className="size-3.5" />
                    </Button>

                    {/* Edit */}
                    <Link href={`/marketing/promotions/${promo.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Edit Campaign"
                      >
                        <Edit3 className="size-3.5" />
                      </Button>
                    </Link>

                    {/* Publish (if Draft or Paused/Scheduled) */}
                    {promo.status !== "ACTIVE" && promo.status !== "ARCHIVED" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        onClick={() => onPublish(promo)}
                        title="Publish / Activate Campaign"
                      >
                        <Play className="size-3.5" />
                      </Button>
                    )}

                    {/* Pause (if Active) */}
                    {promo.status === "ACTIVE" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        onClick={() => onPause(promo)}
                        title="Pause Campaign"
                      >
                        <Pause className="size-3.5" />
                      </Button>
                    )}

                    {/* Archive (if not already archived) */}
                    {promo.status !== "ARCHIVED" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        onClick={() => onArchive(promo)}
                        title="Archive Campaign"
                      >
                        <Archive className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
