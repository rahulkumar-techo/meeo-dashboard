/**
 * @file refund-dialog.tsx
 * @description Modal dialog for issuing full or partial refunds against a successful payment.
 * Validates remaining refundable balance, calls gateway refund API, writes ledger transaction, and updates order status.
 */

"use client"

import * as React from "react"
import { RotateCcw, AlertCircle, DollarSign, ShieldAlert, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useIssueRefundMutation } from "@/hooks/use-payment-query"
import { formatCurrency } from "@/lib/formatters"
import type { PaymentListItem, PaymentDetail } from "@/types/payment"

interface RefundDialogProps {
  payment: PaymentListItem | PaymentDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RefundDialog({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: RefundDialogProps) {
  const [amount, setAmount] = React.useState<string>("")
  const [reason, setReason] = React.useState<string>("")
  const [isFullRefund, setIsFullRefund] = React.useState<boolean>(true)

  const issueRefundMutation = useIssueRefundMutation()

  const totalAmount = Number(payment?.amount) || 0
  const alreadyRefunded = Number(payment?.refundedAmount) || 0
  const remainingRefundable = Math.max(0, totalAmount - alreadyRefunded)
  const curr = payment?.currency || "INR"

  React.useEffect(() => {
    if (open && payment) {
      setIsFullRefund(true)
      setAmount(remainingRefundable.toFixed(2))
      setReason("")
    }
  }, [open, payment, remainingRefundable])

  const parsedAmount = parseFloat(amount) || 0
  const isAmountValid =
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= remainingRefundable + 0.001

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payment || !isAmountValid) return

    await issueRefundMutation.mutateAsync({
      paymentId: payment.id,
      amount: isFullRefund ? undefined : parsedAmount,
      reason: reason.trim() || undefined,
    })

    onOpenChange(false)
    onSuccess?.()
  }

  if (!payment) return null

  const isEligible =
    payment.status === "SUCCESS" || payment.status === "PARTIALLY_REFUNDED"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base">
                  Issue Gateway Refund
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Dispatches a refund to {payment.provider} and updates ledger balance.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {!isEligible ? (
            <div className="my-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Cannot refund payment in &quot;{payment.status}&quot; status. Only
                SUCCESS or PARTIALLY_REFUNDED payments can be refunded.
              </span>
            </div>
          ) : remainingRefundable <= 0 ? (
            <div className="my-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                This payment has already been completely refunded (
                {formatCurrency(alreadyRefunded, { currency: curr })} of {formatCurrency(totalAmount, { currency: curr })}).
              </span>
            </div>
          ) : (
            <div className="space-y-4 py-4 text-xs">
              {/* Payment Summary Box */}
              <div className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment ID:</span>
                  <span className="font-mono font-medium text-foreground">
                    {payment.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order Ref:</span>
                  <span className="font-mono font-medium text-foreground">
                    {payment.order?.orderNumber || payment.orderId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Original:</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(totalAmount, { currency: curr })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Already Refunded:</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {formatCurrency(alreadyRefunded, { currency: curr })}
                  </span>
                </div>
                <div className="border-t border-border/60 pt-1.5 flex justify-between items-center">
                  <span className="font-medium text-foreground">
                    Available to Refund:
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(remainingRefundable, { currency: curr })}
                  </span>
                </div>
              </div>

              {/* Refund Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold">Refund Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFullRefund(true)
                      setAmount(remainingRefundable.toFixed(2))
                    }}
                    className={`flex items-center justify-between rounded-lg border p-2.5 text-left transition-all ${
                      isFullRefund
                        ? "border-indigo-600 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Full Refund</div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatCurrency(remainingRefundable, { currency: curr })}
                      </div>
                    </div>
                    {isFullRefund && <Check className="h-4 w-4 text-indigo-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFullRefund(false)
                      setAmount((remainingRefundable / 2).toFixed(2))
                    }}
                    className={`flex items-center justify-between rounded-lg border p-2.5 text-left transition-all ${
                      !isFullRefund
                        ? "border-indigo-600 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Partial Refund</div>
                      <div className="text-[11px] text-muted-foreground">
                        Custom Amount
                      </div>
                    </div>
                    {!isFullRefund && <Check className="h-4 w-4 text-indigo-600" />}
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              {!isFullRefund && (
                <div className="space-y-1.5">
                  <label htmlFor="refund-amount" className="text-xs font-semibold">
                    Refund Amount ({curr})
                  </label>
                  <div className="relative">
                    <Input
                      id="refund-amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={remainingRefundable}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="text-xs font-mono"
                      required
                    />
                  </div>
                  {!isAmountValid && (
                    <p className="text-[11px] text-rose-500">
                      Amount must be between 0.01 and {formatCurrency(remainingRefundable, { currency: curr })}
                    </p>
                  )}
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1.5">
                <label htmlFor="refund-reason" className="text-xs font-semibold">
                  Reason / Audit Justification (Optional)
                </label>
                <Textarea
                  id="refund-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Customer returned 1 damaged item, or customer cancellation..."
                  className="text-xs min-h-[60px]"
                  rows={2}
                />
              </div>

              <div className="rounded-md border border-indigo-500/20 bg-indigo-500/5 p-2.5 flex items-start gap-2 text-[11px] text-muted-foreground">
                <ShieldAlert className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  This triggers a live refund API call to <strong>{payment.provider}</strong>, writes a <code>REFUND</code> transaction to the double-entry ledger, and updates the parent order state.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            {isEligible && remainingRefundable > 0 && (
              <Button
                type="submit"
                size="sm"
                disabled={!isAmountValid || issueRefundMutation.isPending}
                className="text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              >
                {issueRefundMutation.isPending ? (
                  <>Processing Refund...</>
                ) : (
                  <>
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Refund {formatCurrency(parsedAmount, { currency: curr })}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
