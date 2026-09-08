/**
 * @file customer-status-dialog.tsx
 * @description Modal dialog to moderate customer account status (Activate, Suspend, Block).
 * Automatically revokes all active login sessions and invalidates auth cache when suspended or blocked.
 */

"use client"

import * as React from "react"
import { ShieldAlert, Loader2, AlertCircle, AlertTriangle } from "lucide-react"
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
import { useUpdateCustomerStatusMutation } from "@/hooks/use-customer-query"
import type { AdminCustomer, CustomerStatus } from "@/types/customer"

export interface CustomerStatusDialogProps {
  customer: AdminCustomer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CustomerStatusDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: CustomerStatusDialogProps) {
  const [status, setStatus] = React.useState<CustomerStatus>("ACTIVE")
  const [reason, setReason] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const updateStatusMutation = useUpdateCustomerStatusMutation()

  React.useEffect(() => {
    if (open && customer) {
      setStatus(customer.status)
      setReason("")
      setError(null)
    }
  }, [open, customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer?.id) {
      setError("No customer selected.")
      return
    }

    try {
      setError(null)
      await updateStatusMutation.mutateAsync({
        userId: customer.id,
        payload: {
          status,
          reason: reason.trim() || undefined,
        },
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update customer status."
      setError(msg)
    }
  }

  const customerName =
    customer?.firstName || customer?.lastName
      ? `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim()
      : customer?.email || "Customer"

  const isSevere = status === "SUSPENDED" || status === "BLOCKED"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <ShieldAlert className="size-5" />
              <DialogTitle>Moderate Customer Status</DialogTitle>
            </div>
            <DialogDescription>
              Update account status for{" "}
              <span className="font-semibold text-foreground">{customerName}</span> (
              <span className="font-mono">{customer?.email}</span>).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSevere && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  Transitioning to <b>{status}</b> will immediately terminate all active device login sessions and prevent further purchases.
                </span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Target Account Status <span className="text-destructive">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden font-semibold"
              >
                <option value="ACTIVE">ACTIVE (In Good Standing)</option>
                <option value="SUSPENDED">SUSPENDED (Temporary Freeze)</option>
                <option value="BLOCKED">BLOCKED (Permanent Ban)</option>
                <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Moderation Reason / Audit Note
              </label>
              <Input
                placeholder="e.g. Chargeback abuse / Account recovery verified"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={isSevere ? "destructive" : "default"}
              className="gap-1.5 font-medium"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="size-3.5" />
                  <span>Save Status</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
