/**
 * @file emergency-kill-switch-dialog.tsx
 * @description High-severity modal for engaging and disengaging platform emergency kill switch.
 */

"use client"

import * as React from "react"
import { AlertOctagon, ShieldAlert, CheckCircle2, Lock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export interface EmergencyKillSwitchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentKillSwitchActive: boolean
  onToggle: (active: boolean, message: string) => Promise<void>
  isPending?: boolean
}

export function EmergencyKillSwitchDialog({
  open,
  onOpenChange,
  currentKillSwitchActive,
  onToggle,
  isPending,
}: EmergencyKillSwitchDialogProps) {
  const [emergencyMessage, setEmergencyMessage] = React.useState("")
  const [confirmText, setConfirmText] = React.useState("")

  const nextState = !currentKillSwitchActive
  const expectedConfirmation = nextState ? "FREEZE PLATFORM" : "RESUME PLATFORM"

  React.useEffect(() => {
    if (open) {
      setEmergencyMessage(
        nextState
          ? "Critical payment gateway maintenance in progress. Orders are temporarily paused."
          : ""
      )
      setConfirmText("")
    }
  }, [open, nextState])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (confirmText !== expectedConfirmation) return
    await onToggle(nextState, emergencyMessage.trim())
    onOpenChange(false)
  }

  const isConfirmValid = confirmText === expectedConfirmation

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-rose-500/30">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className={`flex size-9 items-center justify-center rounded-lg shrink-0 ${
                nextState
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {nextState ? (
                <AlertOctagon className="size-5 animate-pulse" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>
                  {nextState
                    ? "Engage Emergency Platform Kill Switch"
                    : "Disengage Kill Switch & Resume Operations"}
                </span>
                <Badge
                  variant={nextState ? "destructive" : "default"}
                  className="text-[10px] uppercase font-mono"
                >
                  {nextState ? "High Severity" : "Recovery"}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {nextState
                  ? "Instantly freezes all checkout flows, payment processing, and non-whitelisted traffic across the entire platform."
                  : "Restores normal storefront traffic, cart checkouts, and payment gateway interactions."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {nextState && (
            <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="size-4" /> Immediate Protective Actions Triggered:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pl-1">
                <li>Enforces <strong>Maintenance Mode</strong> (503 Service Unavailable).</li>
                <li>Locks cart checkouts and blocks new payment intents.</li>
                <li>Allows internal operators to access via whitelisted maintenance IPs.</li>
                <li>Emits immutable high-severity forensic audit log.</li>
              </ul>
            </div>
          )}

          {/* Emergency Reason Message */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {nextState ? "Public / Internal Outage Reason" : "Resolution Summary"}
            </label>
            <Textarea
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
              placeholder={
                nextState
                  ? "Describe reason for freeze (e.g. Critical Stripe webhook anomaly)..."
                  : "Describe resolution summary..."
              }
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          {/* Type to confirm safeguard */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border bg-muted/40">
            <label className="font-medium text-muted-foreground block text-[11px]">
              Type <span className="font-bold font-mono text-foreground">{expectedConfirmation}</span> to confirm this action:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedConfirmation}
              className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs font-mono text-foreground focus:outline-hidden"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!isConfirmValid || isPending}
              variant={nextState ? "destructive" : "default"}
              className="gap-1.5 font-bold"
            >
              <Lock className="size-3.5" />
              {isPending
                ? "Executing State Change..."
                : nextState
                ? "ENGAGE KILL SWITCH"
                : "DISENGAGE & RESUME"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
