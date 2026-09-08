/**
 * @file coupon-detail-sheet.tsx
 * @description Slide-over drawer inspecting comprehensive coupon specifications, discount calculations, constraints, and recent order redemptions.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Tag,
  Copy,
  CheckCircle2,
  Calendar,
  Percent,
  DollarSign,
  Truck,
  Users,
  ExternalLink,
  History,
  ShieldCheck,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCouponDetailQuery } from "@/hooks/use-coupon-query"
import { CouponStatusBadge } from "./coupon-status-badge"
import { CouponTypeBadge } from "./coupon-type-badge"
import { CouponUsagesDialog } from "./coupon-usages-dialog"
import type { Coupon } from "@/types/coupon"

interface CouponDetailSheetProps {
  couponId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (coupon: Coupon) => void
}

export function CouponDetailSheet({
  couponId,
  open,
  onOpenChange,
  onEdit,
}: CouponDetailSheetProps) {
  const [copied, setCopied] = React.useState(false)
  const [usagesOpen, setUsagesOpen] = React.useState(false)

  const { data: coupon, isLoading } = useCouponDetailQuery(
    couponId || "",
    open && Boolean(couponId)
  )

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!couponId) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border/70 bg-muted/20">
            <SheetHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {coupon && <CouponTypeBadge type={coupon.type} />}
                  {coupon && <CouponStatusBadge status={coupon.status} />}
                </div>
                {coupon && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit?.(coupon)}
                    className="h-8 text-xs font-medium"
                  >
                    Edit Rules
                  </Button>
                )}
              </div>

              <div>
                <SheetTitle className="text-xl font-mono font-bold flex items-center gap-2">
                  <span>{coupon?.code || "Coupon"}</span>
                  {coupon && (
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="text-muted-foreground hover:text-foreground"
                      title="Copy Code"
                    >
                      {copied ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  )}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-1">
                  ID: {couponId}
                </SheetDescription>
              </div>
            </SheetHeader>
          </div>

          {isLoading || !coupon ? (
            <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
              <div className="animate-spin inline-block size-6 border-2 border-current border-t-transparent rounded-full text-indigo-600" />
              <p>Loading coupon rules & recent redemptions...</p>
            </div>
          ) : (
            <div className="flex-1 p-6 space-y-6 text-xs">
              {/* Discount Value Highlight */}
              <div className="rounded-xl border border-border/70 bg-card p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    Discount Formula
                  </div>
                  <div className="text-lg font-bold text-foreground mt-0.5">
                    {coupon.type === "PERCENTAGE"
                      ? `${coupon.value}% Off Subtotal`
                      : coupon.type === "FIXED_AMOUNT"
                      ? `$${Number(coupon.value).toFixed(2)} Off Order`
                      : "Free Shipping ($0)"}
                  </div>
                  {coupon.maximumDiscountAmount && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Capped at ${Number(coupon.maximumDiscountAmount).toFixed(2)} max
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground">
                    Total Redemptions
                  </div>
                  <div className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {coupon._count?.usages ?? coupon.usages?.length ?? 0} orders
                  </div>
                </div>
              </div>

              {/* Constraints Matrix */}
              <div className="rounded-lg border border-border/70 bg-card divide-y divide-border/60">
                <div className="p-3 flex justify-between items-center">
                  <span className="text-muted-foreground">Minimum Cart Subtotal:</span>
                  <span className="font-semibold text-foreground">
                    {coupon.minimumOrderAmount
                      ? `$${Number(coupon.minimumOrderAmount).toFixed(2)}`
                      : "None ($0)"}
                  </span>
                </div>

                <div className="p-3 flex justify-between items-center">
                  <span className="text-muted-foreground">Global Usage Limit:</span>
                  <span className="font-mono text-foreground font-medium">
                    {coupon.usageLimit ? `${coupon.usageLimit} total` : "Unlimited"}
                  </span>
                </div>

                <div className="p-3 flex justify-between items-center">
                  <span className="text-muted-foreground">Per-User Limit:</span>
                  <span className="font-mono text-foreground font-medium">
                    {coupon.usageLimitPerUser
                      ? `${coupon.usageLimitPerUser} per customer`
                      : "Unlimited"}
                  </span>
                </div>

                <div className="p-3 flex justify-between items-center">
                  <span className="text-muted-foreground">Campaign Validity:</span>
                  <span className="text-foreground text-[11px]">
                    {coupon.startsAt
                      ? new Date(coupon.startsAt).toLocaleDateString()
                      : "Now"}{" "}
                    ➔{" "}
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString()
                      : "Never (No Expiry)"}
                  </span>
                </div>

                <div className="p-3 flex justify-between items-center">
                  <span className="text-muted-foreground">Created Date:</span>
                  <span className="text-foreground text-[11px]">
                    {new Date(coupon.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Recent 5 Order Usages */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <History className="size-3.5" />
                    <span>Recent Order Redemptions</span>
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUsagesOpen(true)}
                    className="h-6 text-[11px] text-indigo-600 dark:text-indigo-400 p-0 hover:underline"
                  >
                    View All Redemptions
                  </Button>
                </div>

                <div className="rounded-lg border border-border/70 bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[10px] font-bold uppercase text-muted-foreground bg-muted/20">
                        <TableHead>ORDER</TableHead>
                        <TableHead className="text-right">DISCOUNT</TableHead>
                        <TableHead className="text-right">DATE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupon.usages && coupon.usages.length > 0 ? (
                        coupon.usages.slice(0, 5).map((usage) => (
                          <TableRow key={usage.id}>
                            <TableCell className="font-mono font-medium">
                              <Link
                                href="/orders"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                              >
                                {usage.order?.orderNumber || usage.orderId.slice(0, 10)}
                                <ExternalLink className="size-3" />
                              </Link>
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              -${Number(usage.discountAmount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground text-[11px]">
                              {new Date(usage.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-5 text-muted-foreground"
                          >
                            No orders have redeemed this coupon yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Usages Full Modal */}
      {coupon && (
        <CouponUsagesDialog
          coupon={coupon}
          open={usagesOpen}
          onOpenChange={setUsagesOpen}
        />
      )}
    </>
  )
}
