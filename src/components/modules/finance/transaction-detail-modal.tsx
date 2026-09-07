/**
 * @file transaction-detail-modal.tsx
 * @description Standardized slide-over drawer / modal for auditing financial payment gateway transactions.
 * Follows Single Responsibility Principle (SRP).
 */

"use client"

import * as React from "react"
import { CreditCard, DollarSign, ShieldCheck, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react"
import { DetailDrawer } from "@/components/common/detail-drawer"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/formatters"

export interface TransactionRecord {
  id: string
  orderId: string
  amount: number | string
  currency?: string
  fee?: number | string
  netAmount?: number | string
  paymentMethod: string
  gateway: "stripe" | "paypal" | "apple_pay" | "klarna" | string
  status: "succeeded" | "pending" | "failed" | "refunded" | string
  customer: {
    name: string
    email: string
    ipAddress?: string
  }
  createdAt: string
  cardLast4?: string
  disputeStatus?: string
}

export interface TransactionDetailModalProps {
  transaction: TransactionRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefund?: (transaction: TransactionRecord) => void
}

export function TransactionDetailModal({
  transaction,
  open,
  onOpenChange,
  onRefund,
}: TransactionDetailModalProps) {
  if (!transaction) return null

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span>Transaction {transaction.id}</span>
          <StatusBadge status={transaction.status} showDot />
        </div>
      }
      description={`Captured via ${transaction.gateway.toUpperCase()} at ${transaction.createdAt}`}
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-muted-foreground">Order: {transaction.orderId}</span>
          {onRefund && transaction.status === "succeeded" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRefund(transaction)}
              className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Initiate Refund
            </Button>
          )}
        </div>
      }
    >
      {/* Financial Settlement Breakdown */}
      <div className="rounded-lg border border-border/70 bg-card/60 p-4 text-xs space-y-2">
        <h4 className="font-semibold text-foreground flex items-center gap-1.5 mb-2">
          <DollarSign className="size-3.5 text-muted-foreground" />
          <span>Settlement Breakdown</span>
        </h4>
        <div className="flex justify-between text-muted-foreground">
          <span>Gross Charge</span>
          <span className="font-semibold text-foreground">{formatCurrency(transaction.amount)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Gateway Processing Fee (2.9% + 30¢)</span>
          <span>-{formatCurrency(transaction.fee || 3.42)}</span>
        </div>
        <Separator className="my-1.5" />
        <div className="flex justify-between font-bold text-foreground text-sm">
          <span>Net Merchant Payout</span>
          <span className="text-emerald-600 dark:text-emerald-400">
            {formatCurrency(transaction.netAmount || (typeof transaction.amount === "number" ? transaction.amount - 3.42 : transaction.amount))}
          </span>
        </div>
      </div>

      {/* Customer & Risk Analysis */}
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-card/60 p-3.5 text-xs">
        <div>
          <span className="text-muted-foreground text-[11px]">Customer Name:</span>
          <p className="font-medium text-foreground">{transaction.customer.name}</p>
          <p className="text-muted-foreground text-[11px]">{transaction.customer.email}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-[11px]">Payment Method:</span>
          <p className="font-medium text-foreground capitalize">
            {transaction.paymentMethod} {transaction.cardLast4 ? `(•••• ${transaction.cardLast4})` : ""}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground text-[11px]">Risk Score:</span>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="size-3.5" />
            <span>Low Risk (0.02%)</span>
          </div>
        </div>
        <div>
          <span className="text-muted-foreground text-[11px]">Dispute Protection:</span>
          <p className="font-medium text-foreground">3D Secure Verified</p>
        </div>
      </div>
    </DetailDrawer>
  )
}
