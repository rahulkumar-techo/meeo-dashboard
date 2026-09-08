/**
 * @file coupon-table.tsx
 * @description Master data table for promotional coupons with live copy controls, redemption progress indicators, quick status toggles, and action triggers.
 */

"use client"

import * as React from "react"
import {
  Copy,
  CheckCircle2,
  Eye,
  Edit3,
  Trash2,
  History,
  Power,
  PowerOff,
  AlertTriangle,
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
import { CouponStatusBadge } from "./coupon-status-badge"
import { CouponTypeBadge } from "./coupon-type-badge"
import type { Coupon } from "@/types/coupon"

interface CouponTableProps {
  coupons: Coupon[]
  isLoading?: boolean
  onInspect: (coupon: Coupon) => void
  onEdit: (coupon: Coupon) => void
  onViewUsages: (coupon: Coupon) => void
  onToggleStatus: (coupon: Coupon) => void
  onDelete: (coupon: Coupon) => void
}

export function CouponTable({
  coupons,
  isLoading,
  onInspect,
  onEdit,
  onViewUsages,
  onToggleStatus,
  onDelete,
}: CouponTableProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground space-y-3">
        <div className="animate-spin inline-block size-6 border-2 border-current border-t-transparent rounded-full text-indigo-600" />
        <p>Loading promotional campaigns from engine...</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
            <TableHead className="font-bold">COUPON CODE</TableHead>
            <TableHead className="font-bold">TYPE</TableHead>
            <TableHead className="font-bold">DISCOUNT VALUE</TableHead>
            <TableHead className="font-bold">MIN CART</TableHead>
            <TableHead className="font-bold">REDEMPTIONS</TableHead>
            <TableHead className="font-bold">VALIDITY</TableHead>
            <TableHead className="font-bold">STATUS</TableHead>
            <TableHead className="font-bold text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs font-normal">
          {coupons.map((coupon) => {
            const usageCount = coupon._count?.usages ?? 0
            const usageLimit = coupon.usageLimit
            const isLimitReached = usageLimit ? usageCount >= usageLimit : false

            return (
              <TableRow
                key={coupon.id}
                className="hover:bg-muted/40 transition-colors group"
              >
                {/* 1. Code */}
                <TableCell className="font-mono font-bold">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onInspect(coupon)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline tracking-wide"
                    >
                      {coupon.code}
                    </button>
                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                      title="Copy Code"
                    >
                      {copiedCode === coupon.code ? (
                        <CheckCircle2 className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </TableCell>

                {/* 2. Type */}
                <TableCell>
                  <CouponTypeBadge type={coupon.type} />
                </TableCell>

                {/* 3. Value & Cap */}
                <TableCell className="font-medium text-foreground">
                  {coupon.type === "PERCENTAGE" ? (
                    <div>
                      <span className="font-bold">{coupon.value}%</span>
                      {coupon.maximumDiscountAmount && (
                        <span className="text-[10px] text-muted-foreground ml-1">
                          (Cap ${Number(coupon.maximumDiscountAmount).toFixed(0)})
                        </span>
                      )}
                    </div>
                  ) : coupon.type === "FIXED_AMOUNT" ? (
                    <span className="font-bold">${Number(coupon.value).toFixed(2)} Off</span>
                  ) : (
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                      $0 Shipping
                    </span>
                  )}
                </TableCell>

                {/* 4. Min Cart */}
                <TableCell className="text-muted-foreground font-mono">
                  {coupon.minimumOrderAmount
                    ? `$${Number(coupon.minimumOrderAmount).toFixed(2)}`
                    : "None ($0)"}
                </TableCell>

                {/* 5. Usage Count / Limit */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-semibold text-foreground">
                        {usageCount}
                      </span>
                      <span className="text-muted-foreground">
                        / {usageLimit ? usageLimit : "∞"}
                      </span>
                    </div>
                    {usageLimit && (
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isLimitReached
                              ? "bg-rose-500"
                              : "bg-indigo-600 dark:bg-indigo-500"
                          }`}
                          style={{
                            width: `${Math.min(100, (usageCount / usageLimit) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* 6. Validity */}
                <TableCell className="text-muted-foreground text-[11px]">
                  {coupon.expiresAt ? (
                    <span>
                      Exp: {new Date(coupon.expiresAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      No Expiry
                    </span>
                  )}
                </TableCell>

                {/* 7. Status */}
                <TableCell>
                  <CouponStatusBadge status={coupon.status} />
                </TableCell>

                {/* 8. Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onInspect(coupon)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Inspect Details"
                    >
                      <Eye className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewUsages(coupon)}
                      className="h-7 w-7 p-0 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                      title="View Redemption History"
                    >
                      <History className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(coupon)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Edit Rules"
                    >
                      <Edit3 className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(coupon)}
                      className={`h-7 w-7 p-0 ${
                        coupon.status === "ACTIVE"
                          ? "text-amber-600 hover:bg-amber-500/10"
                          : "text-emerald-600 hover:bg-emerald-500/10"
                      }`}
                      title={coupon.status === "ACTIVE" ? "Pause Coupon" : "Activate Coupon"}
                    >
                      {coupon.status === "ACTIVE" ? (
                        <PowerOff className="size-3.5" />
                      ) : (
                        <Power className="size-3.5" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(coupon)}
                      className="h-7 w-7 p-0 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                      title="Delete / Archive Coupon"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
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
