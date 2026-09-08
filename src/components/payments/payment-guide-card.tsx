/**
 * @file payment-guide-card.tsx
 * @description Quick contextual onboarding and explanation card for finance operators.
 * Details the Double-Entry Ledger, Refund Invariants, Order State Sync, and Gateway Reconciliation.
 */

"use client"

import * as React from "react"
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowRightLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function PaymentGuideCard() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-background to-indigo-500/5 p-4 shadow-2xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Financial Architecture & Gateway Reconciliation Guide
            </h3>
            <p className="text-xs text-muted-foreground">
              Understand double-entry ledgers, safe refund limits, and self-healing webhooks.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <span>{isOpen ? "Hide Guide" : "View Architecture"}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="mt-4 grid gap-3 border-t border-border/60 pt-3 md:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
              <Layers className="h-4 w-4" />
              <span>Double-Entry Ledger</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Every capture, refund, or chargeback writes an immutable ledger entry with exact decimal amounts and cryptographic provider reference IDs.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Refund Invariant</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">refundAmount ≤ amount - refundedAmount</code>. Over-refunding and duplicate refunds are rejected at the database layer.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-purple-600 dark:text-purple-400">
              <ArrowRightLeft className="h-4 w-4" />
              <span>Order State Sync</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              <code className="text-[11px]">SUCCESS</code> transitions order to <code className="text-[11px]">CONFIRMED</code>, while full <code className="text-[11px]">REFUND</code> transitions order to <code className="text-[11px]">REFUNDED</code>.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-cyan-600 dark:text-cyan-400">
              <RefreshCw className="h-4 w-4" />
              <span>Self-Healing Reconcile</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Stuck in <code className="text-[11px]">PROCESSING</code>? The Reconcile action queries Stripe/Razorpay API directly to recover dropped or delayed webhooks.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
