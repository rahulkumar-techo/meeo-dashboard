/**
 * @file reconcile-dialog.tsx
 * @description Modal dialog to trigger direct self-healing gateway reconciliation for payments stuck in PROCESSING or out of sync.
 */

"use client"

import * as React from "react"
import { RefreshCw, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useReconcilePaymentMutation } from "@/hooks/use-payment-query"
import { PaymentStatusBadge } from "./payment-status-badge"
import type { PaymentListItem, PaymentDetail, ReconcileResponseData } from "@/types/payment"

interface ReconcileDialogProps {
  payment: PaymentListItem | PaymentDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReconcileDialog({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: ReconcileDialogProps) {
  const [result, setResult] = React.useState<ReconcileResponseData | null>(null)
  const reconcileMutation = useReconcilePaymentMutation()

  React.useEffect(() => {
    if (open) {
      setResult(null)
    }
  }, [open])

  const handleReconcile = async () => {
    if (!payment) return

    try {
      const res = await reconcileMutation.mutateAsync({ paymentId: payment.id })
      setResult(res.data)
      onSuccess?.()
    } catch {
      // Error handled by hook toast
    }
  }

  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base">
                Reconcile with Gateway Provider
              </DialogTitle>
              <DialogDescription className="text-xs">
                Synchronizes payment intent status with {payment.provider} in real-time.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4 text-xs">
          {/* Payment Info Card */}
          <div className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Payment ID:</span>
              <span className="font-mono font-medium text-foreground">
                {payment.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Gateway:</span>
              <span className="font-semibold text-foreground">
                {payment.provider}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current DB Status:</span>
              <PaymentStatusBadge status={payment.status} />
            </div>
          </div>

          {/* If Result Available */}
          {result ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2.5">
              <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>Reconciliation Complete</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-500/20">
                <div>
                  <span className="text-muted-foreground">Previous State:</span>
                  <div className="font-medium text-foreground">{result.previousStatus}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated State:</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{result.currentStatus}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Provider Status:</span>
                  <div className="font-mono text-foreground">{result.gatewayStatus || "succeeded"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Order Sync:</span>
                  <div className="font-medium text-foreground">{result.orderUpdated ? "Order Updated" : "Unchanged"}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-indigo-500/20 bg-indigo-500/5 p-3 flex items-start gap-2.5 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                This will make an authoritative server-to-server call directly to the <strong>{payment.provider}</strong> API to verify if the charge was captured, failed, or refunded, recovering any dropped webhooks.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              type="button"
              size="sm"
              onClick={handleReconcile}
              disabled={reconcileMutation.isPending}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {reconcileMutation.isPending ? (
                <>Querying Gateway...</>
              ) : (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Query & Reconcile
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
