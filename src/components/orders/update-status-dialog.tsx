/**
 * @file update-status-dialog.tsx
 * @description Modal dialog for manual order lifecycle state transitions with audit reason logging.
 */

"use client"

import * as React from "react"
import {
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUpdateOrderStatusMutation } from "@/hooks/use-order-query"
import {
  useAdminPayments,
  useUpdatePaymentStatusMutation,
} from "@/hooks/use-payment-query"
import { OrderStatusBadge } from "./order-status-badge"
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge"
import {
  type AdminOrder,
  type OrderStatus,
  VALID_ORDER_TRANSITIONS,
} from "@/types/order"
import type { ManualPaymentMethod, PaymentStatus } from "@/types/payment"

export interface UpdateStatusDialogProps {
  order: AdminOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAYMENT_PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
]

const PAYMENT_METHODS: Array<{ value: ManualPaymentMethod; label: string }> = [
  { value: "UPI_DOORSTEP", label: "Doorstep UPI (Agent QR)" },
  { value: "CASH", label: "Cash on Delivery (Cash Collection)" },
  { value: "BANK_TRANSFER", label: "Bank Transfer (NEFT / RTGS / IMPS)" },
  { value: "CARD_OFFLINE", label: "Doorstep Card / POS Machine" },
  { value: "OTHER", label: "Other / Manual Offline Wire" },
]

export function UpdateStatusDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: UpdateStatusDialogProps) {
  const [activeTab, setActiveTab] = React.useState<"order" | "payment">("order")

  // --- Order Status Transition State ---
  const [status, setStatus] = React.useState<OrderStatus>("PROCESSING")
  const [reason, setReason] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [allowOverride, setAllowOverride] = React.useState(false)

  // --- Manual Payment Update State ---
  const [paymentStatus, setPaymentStatus] = React.useState<"SUCCESS" | "FAILED">("SUCCESS")
  const [customPaymentId, setCustomPaymentId] = React.useState("")
  const [paidAmount, setPaidAmount] = React.useState<number>(0)
  const [paymentMethod, setPaymentMethod] = React.useState<string>("UPI_DOORSTEP")
  const [transactionId, setTransactionId] = React.useState("")
  const [paymentReason, setPaymentReason] = React.useState("")

  const updateOrderMutation = useUpdateOrderStatusMutation()
  const updatePaymentMutation = useUpdatePaymentStatusMutation()

  // Find existing payment record for this order
  const { data: paymentData, isLoading: isLoadingPayment } = useAdminPayments(
    open && order?.id
      ? {
          orderId: order.id,
          limit: 5,
        }
      : undefined
  )

  const linkedPayment = paymentData?.items?.[0] || null
  const effectivePaymentId = order?.paymentId || linkedPayment?.id || customPaymentId

  // Compute valid forward transitions from current status according to state machine
  const currentStatus = order?.status
  const validTransitions = React.useMemo(() => {
    if (!currentStatus) return ALL_STATUSES
    const allowed = VALID_ORDER_TRANSITIONS[currentStatus]
    return allowed ? [...allowed] : []
  }, [currentStatus])

  const availableStatuses = allowOverride
    ? ALL_STATUSES.filter((s) => s !== currentStatus)
    : validTransitions

  const isTerminal = !allowOverride && validTransitions.length === 0

  React.useEffect(() => {
    if (open && order) {
      const allowed = VALID_ORDER_TRANSITIONS[order.status] ?? []
      if (allowed.length > 0) {
        setStatus(allowed[0])
      } else {
        setStatus(order.status)
      }
      setReason("")
      setError(null)
      setAllowOverride(false)

      // Initialize payment fields
      setActiveTab(
        order.status === "PENDING" || order.status === "PAYMENT_PENDING"
          ? "order"
          : "order"
      )
      setPaymentStatus("SUCCESS")
      setPaidAmount(Number(order.grandTotal) || 0)
      setPaymentMethod("UPI_DOORSTEP")
      setTransactionId("")
      setPaymentReason("")
      setCustomPaymentId(order.paymentId || "")
    }
  }, [open, order])

  // Sync custom payment ID once linked payment resolves
  React.useEffect(() => {
    if (linkedPayment?.id && !customPaymentId) {
      setCustomPaymentId(linkedPayment.id)
    }
  }, [linkedPayment, customPaymentId])

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order?.id) {
      setError("No order selected.")
      return
    }

    if (status === order.status) {
      setError("Please select a target status different from current status.")
      return
    }

    if (!allowOverride && !validTransitions.includes(status)) {
      setError(`Transitioning from ${order.status} to ${status} is not allowed by the order lifecycle state machine.`)
      return
    }

    try {
      setError(null)
      await updateOrderMutation.mutateAsync({
        id: order.id,
        payload: {
          status,
          reason: reason.trim() || undefined,
        },
      })
      toast.success(`Order #${order.orderNumber} transitioned to ${status}`)
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update order status."
      setError(msg)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const paymentIdToUpdate = effectivePaymentId.trim()
    if (!paymentIdToUpdate) {
      setError("Payment UUID is required. Please provide a valid Payment ID.")
      return
    }

    try {
      setError(null)
      if (paymentStatus === "SUCCESS") {
        await updatePaymentMutation.mutateAsync({
          paymentId: paymentIdToUpdate,
          payload: {
            status: "SUCCESS",
            paidAmount: Number(paidAmount) || Number(order?.grandTotal) || 0,
            paymentMethod: paymentMethod.trim() || "UPI_DOORSTEP",
            transactionId: transactionId.trim() || undefined,
            reason: paymentReason.trim() || "Doorstep / Offline payment collected",
          },
        })
        toast.success("Payment marked SUCCESS. Order cascaded to CONFIRMED!")
      } else {
        if (!paymentReason.trim()) {
          setError("Please provide a reason why this payment failed / bounced.")
          return
        }
        await updatePaymentMutation.mutateAsync({
          paymentId: paymentIdToUpdate,
          payload: {
            status: "FAILED",
            reason: paymentReason.trim(),
          },
        })
        toast.success("Payment marked FAILED.")
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update payment status."
      setError(msg)
    }
  }

  const isSubmitting =
    updateOrderMutation.isPending || updatePaymentMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-indigo-600">
            <SlidersHorizontal className="size-5" />
            <DialogTitle>Manual Status Transition</DialogTitle>
          </div>
          <DialogDescription>
            Transition order{" "}
            <span className="font-mono font-bold text-foreground">
              {order?.orderNumber}
            </span>{" "}
            or record doorstep/offline payment collection.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1 bg-muted/70 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setActiveTab("order")
              setError(null)
            }}
            className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "order"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Order Lifecycle</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("payment")
              setError(null)
            }}
            className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "payment"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="size-3.5" />
            <span>Payment Collection</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: ORDER LIFECYCLE TRANSITION */}
        {activeTab === "order" && (
          <form onSubmit={handleOrderSubmit}>
            <div className="space-y-4 py-2">
              {/* Current Status Overview */}
              <div className="flex items-center justify-between rounded-lg bg-muted/50 border border-border/70 px-3 py-2 text-xs">
                <span className="text-muted-foreground font-medium">Current Status</span>
                {order?.status ? (
                  <OrderStatusBadge status={order.status} />
                ) : (
                  <span className="font-mono text-muted-foreground">UNKNOWN</span>
                )}
              </div>

              {/* Terminal State Warning */}
              {isTerminal && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-semibold">Terminal State</p>
                    <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90 mt-0.5">
                      Order is in terminal status <strong>{order?.status}</strong>. No further valid forward transitions exist in the standard lifecycle.
                    </p>
                  </div>
                </div>
              )}

              {/* Target Status Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Valid Target Status <span className="text-destructive">*</span>
                  </label>
                  {order?.status && status && status !== order.status && (
                    <span className="text-[10.5px] font-mono text-muted-foreground flex items-center gap-1">
                      {order.status} <ArrowRight className="size-2.5" /> {status}
                    </span>
                  )}
                </div>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  disabled={isTerminal || updateOrderMutation.isPending}
                  className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {availableStatuses.length > 0 ? (
                    availableStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No valid transitions available
                    </option>
                  )}
                </select>

                {!allowOverride && validTransitions.length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Showing {validTransitions.length} valid target {validTransitions.length === 1 ? "state" : "states"} from {order?.status}.
                  </p>
                )}
              </div>

              {/* Emergency Override Option */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-muted-foreground hover:text-foreground select-none">
                  <input
                    type="checkbox"
                    checked={allowOverride}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setAllowOverride(checked)
                      if (checked) {
                        const other = ALL_STATUSES.find((s) => s !== currentStatus)
                        if (other) setStatus(other)
                      } else {
                        const allowed = VALID_ORDER_TRANSITIONS[order?.status as OrderStatus] ?? []
                        if (allowed.length > 0) setStatus(allowed[0])
                      }
                    }}
                    className="rounded border-border text-indigo-600 focus:ring-indigo-500 size-3.5"
                  />
                  <span>Allow any status (Emergency Admin Override)</span>
                </label>
              </div>

              {/* Audit Reason */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Audit Reason / Notes
                </label>
                <Input
                  placeholder="e.g. Verified payment received / Carrier dispatch override"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={updateOrderMutation.isPending}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-50"
                disabled={isSubmitting || (isTerminal && !allowOverride) || status === order?.status}
              >
                {updateOrderMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="size-3.5" />
                    <span>Apply Transition</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* TAB 2: MANUAL PAYMENT COLLECTION / UPDATE */}
        {activeTab === "payment" && (
          <form onSubmit={handlePaymentSubmit}>
            <div className="space-y-3.5 py-2">
              {/* Cascade Info Banner */}
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <p className="font-semibold">Automatic Order Cascade</p>
                  <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90 mt-0.5">
                    Marking payment as <strong>SUCCESS</strong> will automatically transition the order to <strong>CONFIRMED</strong> if it is currently PENDING or PAYMENT_PENDING.
                  </p>
                </div>
              </div>

              {/* Linked Payment Record Summary */}
              <div className="rounded-lg bg-muted/50 border border-border/70 p-2.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Payment ID</span>
                  {linkedPayment ? (
                    <span className="font-mono font-bold text-foreground text-[11px]">
                      {linkedPayment.id.slice(0, 12)}...
                    </span>
                  ) : isLoadingPayment ? (
                    <span className="text-[11px] text-muted-foreground animate-pulse">Finding payment...</span>
                  ) : (
                    <span className="text-[11px] text-amber-600 font-medium">Manual input required</span>
                  )}
                </div>

                {linkedPayment && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <span className="text-muted-foreground">Current Payment Status</span>
                    <PaymentStatusBadge status={linkedPayment.status} />
                  </div>
                )}
              </div>

              {/* Payment ID Input if not detected */}
              {!linkedPayment && (
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Target Payment UUID <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
                    value={customPaymentId}
                    onChange={(e) => setCustomPaymentId(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
              )}

              {/* Status Outcome Selector */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Payment Outcome <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("SUCCESS")}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      paymentStatus === "SUCCESS"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    <span>Collected (SUCCESS)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("FAILED")}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      paymentStatus === "FAILED"
                        ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <AlertCircle className="size-3.5 text-rose-600" />
                    <span>Failed / Bounced (FAILED)</span>
                  </button>
                </div>
              </div>

              {/* Fields for SUCCESS */}
              {paymentStatus === "SUCCESS" && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Paid Amount (₹) <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                        disabled={isSubmitting}
                        className="h-9 text-xs font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Collection Method <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={isSubmitting}
                        className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden font-medium"
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Transaction / Reference ID
                    </label>
                    <Input
                      placeholder="e.g. UPI_REF_987654321 / Bank UTR"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      disabled={isSubmitting}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Audit Reason / Verification Note
                    </label>
                    <Input
                      placeholder="e.g. Payment received via delivery agent QR code"
                      value={paymentReason}
                      onChange={(e) => setPaymentReason(e.target.value)}
                      disabled={isSubmitting}
                      className="h-9 text-xs"
                    />
                  </div>
                </>
              )}

              {/* Fields for FAILED */}
              {paymentStatus === "FAILED" && (
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Failure / Rejection Reason <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Customer refused cash payment on delivery"
                    value={paymentReason}
                    onChange={(e) => setPaymentReason(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 text-xs"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    A rejection reason is required for administrative audit logging.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className={`gap-1.5 text-white font-medium ${
                  paymentStatus === "SUCCESS"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
                disabled={isSubmitting || !effectivePaymentId.trim()}
              >
                {updatePaymentMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Updating Payment...</span>
                  </>
                ) : paymentStatus === "SUCCESS" ? (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Record Payment SUCCESS</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="size-3.5" />
                    <span>Mark Payment FAILED</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

