/**
 * @file expire-stale-dialog.tsx
 * @description Modal dialog / trigger for sweeping stale unconfirmed checkouts and restoring held stock units.
 */

"use client"

import * as React from "react"
import { TimerOff, Loader2, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react"
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
import { useExpireStaleOrdersMutation } from "@/hooks/use-order-query"
import type { ExpireStaleOrdersResponseData } from "@/types/order"

export interface ExpireStaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ExpireStaleDialog({
  open,
  onOpenChange,
  onSuccess,
}: ExpireStaleDialogProps) {
  const [olderThanMinutes, setOlderThanMinutes] = React.useState<number>(30)
  const [result, setResult] = React.useState<ExpireStaleOrdersResponseData | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const expireMutation = useExpireStaleOrdersMutation()

  React.useEffect(() => {
    if (open) {
      setOlderThanMinutes(30)
      setResult(null)
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      const res = await expireMutation.mutateAsync({
        olderThanMinutes: Number(olderThanMinutes) || 30,
      })
      setResult(res.data)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to sweep stale orders."
      setError(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600">
              <TimerOff className="size-5" />
              <DialogTitle>Sweep Stale Abandoned Orders</DialogTitle>
            </div>
            <DialogDescription>
              Identify unconfirmed pending checkouts older than a specified duration, expire them, and release their held inventory units back to warehouse stock.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result ? (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="size-4" />
                  <span>Stale Orders Sweeper Completed</span>
                </div>
                <p>
                  Successfully expired <b>{result.expiredCount}</b> abandoned orders and restored inventory reservations.
                </p>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Cutoff Threshold (Minutes)
                </label>
                <Input
                  type="number"
                  min={5}
                  max={1440}
                  value={olderThanMinutes}
                  onChange={(e) => setOlderThanMinutes(Math.max(5, parseInt(e.target.value, 10) || 30))}
                  className="h-9 font-mono text-sm"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Orders in PENDING or PAYMENT_PENDING created before this window will be marked EXPIRED.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={expireMutation.isPending}
            >
              {result ? "Close" : "Cancel"}
            </Button>
            {!result && (
              <Button
                type="submit"
                size="sm"
                className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium"
                disabled={expireMutation.isPending}
              >
                {expireMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Sweeping...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="size-3.5" />
                    <span>Run Sweeper</span>
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
