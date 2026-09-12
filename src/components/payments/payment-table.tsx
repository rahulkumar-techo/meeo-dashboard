/**
 * @file payment-table.tsx
 * @description Master data table for platform payments with real-time status badges, provider filters, refund & reconcile action triggers, and detail slide-over.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Eye,
  RotateCcw,
  RefreshCw,
  Copy,
  ExternalLink,
  CreditCard,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/formatters"
import { PaymentStatusBadge } from "./payment-status-badge"
import type { PaymentListItem } from "@/types/payment"

interface PaymentTableProps {
  payments: PaymentListItem[]
  isLoading?: boolean
  onInspect: (payment: PaymentListItem) => void
  onRefund: (payment: PaymentListItem) => void
  onReconcile: (payment: PaymentListItem) => void
}

export function PaymentTable({
  payments,
  isLoading,
  onInspect,
  onRefund,
  onReconcile,
}: PaymentTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground space-y-3">
        <div className="animate-spin inline-block size-6 border-2 border-current border-t-transparent rounded-full text-indigo-600" />
        <p>Loading platform payments from ledger...</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
            <TableHead className="font-bold">PAYMENT ID</TableHead>
            <TableHead className="font-bold">ORDER REF</TableHead>
            <TableHead className="font-bold">PROVIDER</TableHead>
            <TableHead className="font-bold">METHOD</TableHead>
            <TableHead className="font-bold text-right">AMOUNT</TableHead>
            <TableHead className="font-bold text-right">REFUNDED</TableHead>
            <TableHead className="font-bold">STATUS</TableHead>
            <TableHead className="font-bold">DATE</TableHead>
            <TableHead className="font-bold text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs font-normal">
          {payments.map((pay) => {
            const amount = Number(pay.amount) || 0
            const refunded = Number(pay.refundedAmount) || 0
            const isRefundable =
              (pay.status === "SUCCESS" || pay.status === "PARTIALLY_REFUNDED") &&
              amount - refunded > 0
            const orderLabel =
              pay.order?.orderNumber ||
              (pay.orderId.length > 16
                ? `${pay.orderId.slice(0, 10)}...`
                : pay.orderId)

            return (
              <TableRow
                key={pay.id}
                className="hover:bg-muted/40 transition-colors group"
              >
                {/* 1. Payment ID */}
                <TableCell className="font-mono font-medium">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onInspect(pay)}
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {pay.id.length > 16 ? `${pay.id.slice(0, 12)}...` : pay.id}
                    </button>
                    <button
                      onClick={() => copyToClipboard(pay.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                      title="Copy Payment ID"
                    >
                      {copiedId === pay.id ? (
                        <CheckCircle2 className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </TableCell>

                {/* 2. Order ID */}
                <TableCell className="font-mono">
                  <div className="flex items-center gap-1">
                    <Link
                      href="/orders"
                      className="text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                    >
                      {orderLabel}
                    </Link>
                  </div>
                </TableCell>

                {/* 3. Provider */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono uppercase bg-muted/30"
                  >
                    {pay.provider}
                  </Badge>
                </TableCell>

                {/* 4. Method */}
                <TableCell className="capitalize text-muted-foreground">
                  {pay.paymentMethod || "UPI"}
                </TableCell>

                {/* 5. Gross Amount */}
                <TableCell className="text-right font-mono font-bold text-foreground">
                  {formatCurrency(amount, { currency: pay.currency })}
                </TableCell>

                {/* 6. Refunded Amount */}
                <TableCell className="text-right font-mono">
                  {refunded > 0 ? (
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      -{formatCurrency(refunded, { currency: pay.currency })}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {formatCurrency(0, { currency: pay.currency })}
                    </span>
                  )}
                </TableCell>

                {/* 7. Status Badge */}
                <TableCell>
                  <PaymentStatusBadge status={pay.status} />
                </TableCell>

                {/* 8. Date */}
                <TableCell className="text-muted-foreground text-[11px]">
                  {new Date(pay.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>

                {/* 9. Action Triggers */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onInspect(pay)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Inspect Ledger Breakdown"
                    >
                      <Eye className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReconcile(pay)}
                      className="h-7 w-7 p-0 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                      title="Reconcile with Gateway"
                    >
                      <RefreshCw className="size-3.5" />
                    </Button>

                    {isRefundable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRefund(pay)}
                        className="h-7 w-7 p-0 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                        title="Issue Refund"
                      >
                        <RotateCcw className="size-3.5" />
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
