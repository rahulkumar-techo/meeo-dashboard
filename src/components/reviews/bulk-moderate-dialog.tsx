/**
 * @file bulk-moderate-dialog.tsx
 * @description Modal dialog for bulk moderating up to 100 selected reviews in a single batch operation.
 */

"use client"

import * as React from "react"
import { CheckCircle2, XCircle, Loader2, AlertCircle, Layers } from "lucide-react"
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
import { useBulkModerateReviewsMutation } from "@/hooks/use-review-query"
import type { ReviewStatus } from "@/types/review"

export interface BulkModerateDialogProps {
  reviewIds: string[]
  targetStatus: "APPROVED" | "REJECTED"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function BulkModerateDialog({
  reviewIds,
  targetStatus,
  open,
  onOpenChange,
  onSuccess,
}: BulkModerateDialogProps) {
  const [moderationNote, setModerationNote] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const bulkMutation = useBulkModerateReviewsMutation()

  React.useEffect(() => {
    if (open) {
      setModerationNote(
        targetStatus === "APPROVED"
          ? "Batch approved verified reviews."
          : "Batch rejected policy violations."
      )
      setError(null)
    }
  }, [open, targetStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reviewIds.length === 0) {
      setError("No reviews selected for bulk action.")
      return
    }

    try {
      setError(null)
      await bulkMutation.mutateAsync({
        reviewIds,
        status: targetStatus,
        moderationNote: moderationNote.trim() || undefined,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to execute bulk moderation."
      setError(msg)
    }
  }

  const isApprove = targetStatus === "APPROVED"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className={`flex items-center gap-2 ${isApprove ? "text-emerald-600" : "text-rose-600"}`}>
              <Layers className="size-5" />
              <DialogTitle>
                Bulk {isApprove ? "Approve" : "Reject"} ({reviewIds.length} Reviews)
              </DialogTitle>
            </div>
            <DialogDescription>
              Apply <span className="font-bold">{targetStatus}</span> to all {reviewIds.length} selected reviews in a single batch operation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Batch Audit Note
              </label>
              <Input
                placeholder="e.g. Batch verified review content"
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
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
              disabled={bulkMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={isApprove ? "default" : "destructive"}
              className={`gap-1.5 font-medium ${isApprove ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
              disabled={bulkMutation.isPending}
            >
              {bulkMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isApprove ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Confirm Bulk Approval</span>
                </>
              ) : (
                <>
                  <XCircle className="size-3.5" />
                  <span>Confirm Bulk Rejection</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
