/**
 * @file publish-now-dialog.tsx
 * @description Modal dialog for triggering on-demand outbox batch polling, recovering stale locks, and enqueuing pending events into BullMQ.
 */

"use client"

import * as React from "react"
import { Play, CheckCircle2, AlertCircle, RefreshCw, Layers } from "lucide-react"
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
import { usePublishNowMutation } from "@/hooks/use-outbox-query"
import type { PublishNowResponseData } from "@/types/outbox"

interface PublishNowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function PublishNowDialog({
  open,
  onOpenChange,
  onSuccess,
}: PublishNowDialogProps) {
  const [batchSize, setBatchSize] = React.useState<string>("50")
  const [result, setResult] = React.useState<PublishNowResponseData | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const publishMutation = usePublishNowMutation()

  React.useEffect(() => {
    if (open) {
      setResult(null)
      setErrorMsg(null)
    }
  }, [open])

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const parsedSize = parseInt(batchSize, 10)
    if (isNaN(parsedSize) || parsedSize <= 0) {
      setErrorMsg("Batch size must be a positive integer.")
      return
    }

    try {
      const res = await publishMutation.mutateAsync({ batchSize: parsedSize })
      setResult(res.data)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to trigger batch publishing cycle."
      setErrorMsg(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handlePublish}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <Play className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base">
                  Trigger Outbox Batch Publishing
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Forces an immediate polling cycle to claim pending events and enqueue into BullMQ.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMsg && (
            <div className="my-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result ? (
            <div className="my-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Publish Cycle Completed</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-emerald-500/20">
                <div>
                  <span className="text-muted-foreground">Claimed Events:</span>
                  <div className="font-bold text-foreground font-mono">
                    {result.claimedCount}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Enqueued to BullMQ:</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {result.publishedCount}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Failed Batch:</span>
                  <div className="font-mono text-foreground">{result.failedCount}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Sent to DLQ:</span>
                  <div className="font-mono text-foreground">{result.deadLetteredCount}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  Batch Polling Size (Max Events to Claim)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="500"
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value)}
                  placeholder="e.g. 50"
                  className="font-mono text-xs"
                  required
                />
                <span className="text-[10px] text-muted-foreground">
                  Claims unhandled events with publisher lock and pushes to Redis queue.
                </span>
              </div>

              <div className="rounded-md border border-indigo-500/20 bg-indigo-500/5 p-2.5 text-[11px] text-muted-foreground">
                This triggers <code className="text-[11px]">POST /api/v1/outbox/publish-now</code>, clearing any stale poller locks and dispatching domain events to background consumers.
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
              {result ? "Close" : "Cancel"}
            </Button>
            {!result && (
              <Button
                type="submit"
                size="sm"
                disabled={publishMutation.isPending}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {publishMutation.isPending ? (
                  <>Publishing Batch...</>
                ) : (
                  <>
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    Publish Now
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
