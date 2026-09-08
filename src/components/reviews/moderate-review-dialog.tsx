/**
 * @file moderate-review-dialog.tsx
 * @description Modal dialog to approve or reject a customer review with audit note logging.
 */

"use client"

import * as React from "react"
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"
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
import { useModerateReviewMutation } from "@/hooks/use-review-query"
import type { AdminReview, ReviewStatus } from "@/types/review"

export interface ModerateReviewDialogProps {
  review: AdminReview | null
  targetStatus: "APPROVED" | "REJECTED"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ModerateReviewDialog({
  review,
  targetStatus,
  open,
  onOpenChange,
  onSuccess,
}: ModerateReviewDialogProps) {
  const [moderationNote, setModerationNote] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const moderateMutation = useModerateReviewMutation()

  React.useEffect(() => {
    if (open) {
      setModerationNote(
        targetStatus === "APPROVED"
          ? "Verified authentic review content."
          : "Violates content policy (Spam / Referral links)."
      )
      setError(null)
    }
  }, [open, targetStatus, review])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!review?.id) {
      setError("No review selected.")
      return
    }

    try {
      setError(null)
      await moderateMutation.mutateAsync({
        id: review.id,
        payload: {
          status: targetStatus,
          moderationNote: moderationNote.trim() || undefined,
        },
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to moderate review."
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
              {isApprove ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
              <DialogTitle>
                {isApprove ? "Approve & Publish Review" : "Reject & Hide Review"}
              </DialogTitle>
            </div>
            <DialogDescription>
              {isApprove
                ? "Approving will immediately render this review on the storefront product page and factor it into the star rating average."
                : "Rejecting will hide this review from the public storefront and exclude it from star rating calculations."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Review Snippet Banner */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs border border-border/60 space-y-1">
              <p className="font-semibold text-foreground">{review?.product?.name || "Product"}</p>
              {review?.title && <p className="font-medium text-foreground italic">"{review.title}"</p>}
              <p className="text-muted-foreground line-clamp-2">{review?.content}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Moderation Audit Note
              </label>
              <Input
                placeholder="e.g. Verified authentic customer photos"
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
              disabled={moderateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={isApprove ? "default" : "destructive"}
              className={`gap-1.5 font-medium ${isApprove ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
              disabled={moderateMutation.isPending}
            >
              {moderateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : isApprove ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Confirm Approval</span>
                </>
              ) : (
                <>
                  <XCircle className="size-3.5" />
                  <span>Confirm Rejection</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
