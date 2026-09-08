/**
 * @file coupon-usages-dialog.tsx
 * @description Modal dialog listing the full paginated order redemption audit log for a specific coupon campaign.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { History, ExternalLink, Calendar, DollarSign, Receipt } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/common"
import { useCouponUsagesQuery } from "@/hooks/use-coupon-query"
import type { Coupon } from "@/types/coupon"

interface CouponUsagesDialogProps {
  coupon: Coupon | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CouponUsagesDialog({
  coupon,
  open,
  onOpenChange,
}: CouponUsagesDialogProps) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const { data: usagesData, isLoading } = useCouponUsagesQuery(
    coupon?.id || "",
    { page, limit: pageSize },
    open && Boolean(coupon?.id)
  )

  React.useEffect(() => {
    if (open) setPage(1)
  }, [open])

  if (!coupon) return null

  const items = usagesData?.items ?? []
  const totalPages = usagesData?.pagination?.totalPages ?? 1
  const totalItems = usagesData?.pagination?.total ?? items.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Redemption Audit Log: {coupon.code}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Immutable record of all orders and discounts applied using this coupon.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 text-xs">
          <div className="rounded-lg border border-border/70 bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
                  <TableHead>ORDER #</TableHead>
                  <TableHead className="text-right">DISCOUNT GIVEN</TableHead>
                  <TableHead className="text-right">ORDER TOTAL</TableHead>
                  <TableHead>USER ID</TableHead>
                  <TableHead className="text-right">DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="animate-spin inline-block size-5 border-2 border-current border-t-transparent rounded-full text-indigo-600 mb-2" />
                      <div>Loading redemption logs...</div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No order redemptions recorded for this coupon yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((usage) => (
                    <TableRow key={usage.id} className="hover:bg-muted/40">
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

                      <TableCell className="text-right font-mono text-muted-foreground">
                        {usage.order?.grandTotal
                          ? `$${Number(usage.order.grandTotal).toFixed(2)}`
                          : "N/A"}
                      </TableCell>

                      <TableCell className="font-mono text-muted-foreground text-[11px]">
                        {usage.userId
                          ? `${usage.userId.slice(0, 8)}...`
                          : "Guest / Anon"}
                      </TableCell>

                      <TableCell className="text-right text-muted-foreground text-[11px]">
                        {new Date(usage.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
