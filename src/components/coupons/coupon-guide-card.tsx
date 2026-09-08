/**
 * @file coupon-guide-card.tsx
 * @description Contextual onboarding and architecture explanation card for marketing operations.
 * Details the Discount Rules Engine, Calculation Rules, Audit Invariants (Archival vs Hard Delete), and Code Normalization.
 */

"use client"

import * as React from "react"
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Percent,
  ShieldCheck,
  Tag,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function CouponGuideCard() {
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
              Promotions Engine & Discount Rules Architecture
            </h3>
            <p className="text-xs text-muted-foreground">
              Learn about calculation caps, subtotal safeguards, code normalization, and audit invariants.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <span>{isOpen ? "Hide Guide" : "View Engine Rules"}</span>
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
            <div className="flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400">
              <Percent className="h-4 w-4" />
              <span>Discount Formulas</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Percentage:</strong> <code className="text-[11px]">min(subtotal * %, maxCap)</code>.<br />
              <strong>Fixed Amount:</strong> <code className="text-[11px]">min(value, subtotal)</code> (prevents negative totals).<br />
              <strong>Free Shipping:</strong> Sets shipping fee to $0.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Audit Safe Archival</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Coupons with existing order redemptions cannot be hard-deleted. Calling Delete automatically deactivates (<code className="text-[11px]">INACTIVE</code>) to preserve invoice and financial ledger history.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
              <Tag className="h-4 w-4" />
              <span>Code Normalization</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              All codes are automatically whitespace-trimmed and converted to UPPERCASE upon creation, updating, and checkout verification (e.g. <code className="text-[11px]">summer20</code> ➔ <code className="text-[11px]">SUMMER20</code>).
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-cyan-600 dark:text-cyan-400">
              <Lock className="h-4 w-4" />
              <span>Concurrency & Limits</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Global usage limits and per-user limits are checked and atomically incremented within the ACID database transaction during order placement.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
