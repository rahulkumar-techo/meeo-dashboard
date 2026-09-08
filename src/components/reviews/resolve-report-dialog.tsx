/**
 * @file resolve-report-dialog.tsx
 * @description Modal dialog for resolving user-submitted abuse & spam reports and taking automated review actions.
 */

"use client"

import * as React from "react"
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react"
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
import { useResolveAbuseReportMutation } from "@/hooks/use-review-query"
import type {
  ReviewAbuseReport,
  ReportStatus,
  ReportResolutionAction,
} from "@/types/review"

export interface ResolveReportDialogProps {
  report: ReviewAbuseReport | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ResolveReportDialog({
  report,
  open,
  onOpenChange,
  onSuccess,
}: ResolveReportDialogProps) {
  const [status, setStatus] = React.useState<ReportStatus>("ACTIONED")
  const [action, setAction] = React.useState<ReportResolutionAction>("REJECT_REVIEW")
  const [resolutionNote, setResolutionNote] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const resolveMutation = useResolveAbuseReportMutation()

  React.useEffect(() => {
    if (open && report) {
      setStatus("ACTIONED")
      setAction("REJECT_REVIEW")
      setResolutionNote("Confirmed violation. Rejected review.")
      setError(null)
    }
  }, [open, report])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!report?.id) {
      setError("No report selected.")
      return
    }

    try {
      setError(null)
      await resolveMutation.mutateAsync({
        id: report.id,
        payload: {
          status,
          action,
          resolutionNote: resolutionNote.trim() || undefined,
        },
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resolve report."
      setError(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-5" />
              <DialogTitle>Resolve Abuse & Spam Report</DialogTitle>
            </div>
            <DialogDescription>
              Select resolution state and choose automated action on the reported review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reported Reason & Details Banner */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs border border-border/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-600">Reason: {report?.reason}</span>
                <span className="text-muted-foreground font-mono">By: {report?.reporter?.email || "User"}</span>
              </div>
              {report?.details && (
                <p className="text-muted-foreground italic text-[11px]">"{report.details}"</p>
              )}
            </div>

            {/* Resolution Status */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Resolution State <span className="text-destructive">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
                className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden font-semibold"
              >
                <option value="ACTIONED">ACTIONED (Policy Violation Confirmed)</option>
                <option value="DISMISSED">DISMISSED (False Positive / No Violation)</option>
                <option value="REVIEWED">REVIEWED (Kept Under Observation)</option>
              </select>
            </div>

            {/* Automated Review Action */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Action on Target Review
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as ReportResolutionAction)}
                className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden font-mono"
              >
                <option value="REJECT_REVIEW">REJECT_REVIEW (Hide from Storefront)</option>
                <option value="DELETE_REVIEW">DELETE_REVIEW (Hard Delete Review)</option>
                <option value="APPROVE_REVIEW">APPROVE_REVIEW (Keep Approved)</option>
                <option value="NO_ACTION">NO_ACTION (No change to review)</option>
              </select>
            </div>

            {/* Resolution Note */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Resolution Audit Note
              </label>
              <Input
                placeholder="e.g. Confirmed competitor spam; review rejected"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
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
              disabled={resolveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 font-medium bg-primary text-primary-foreground"
              disabled={resolveMutation.isPending}
            >
              {resolveMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Resolving...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3.5" />
                  <span>Confirm Resolution</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
