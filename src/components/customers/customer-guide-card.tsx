/**
 * @file customer-guide-card.tsx
 * @description Quick onboarding guide for first-time admins explaining the Loyalty Tier engine and Fraud Risk Score calculations.
 */

"use client"

import * as React from "react"
import {
  Info,
  ChevronDown,
  ChevronUp,
  Crown,
  ShieldAlert,
  Repeat,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function CustomerGuideCard() {
  const [isOpen, setIsOpen] = React.useState(true)

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/15 p-1.5 text-primary">
            <Info className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Customer Intelligence, Loyalty Tiers & Risk Engine
            </h4>
            <p className="text-[11.5px] text-muted-foreground">
              Guide to automated VIP spend tiers ($0–$5,000+) and dynamic fraud risk scores (0–100).
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <span>{isOpen ? "Hide Guide" : "Show Guide"}</span>
          {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </Button>
      </div>

      {isOpen && (
        <div className="mt-3.5 pt-3.5 border-t border-primary/15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Card 1: Loyalty Tiers */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-600">
              <Crown className="size-4" />
              <span>VIP Loyalty Tiers</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Auto-calculated from non-cancelled lifetime spend: <b>Bronze</b> ($0–$199), <b>Silver</b> ($200–$999), <b>Gold</b> ($1k–$4.9k), and <b>Platinum</b> ($5k+).
            </p>
          </div>

          {/* Card 2: Risk Score Formula */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-rose-600">
              <ShieldAlert className="size-4" />
              <span>Risk Score Engine (0–100)</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Dynamic score based on unverified email (+15), unverified phone (+15), high cancellation ratio &gt;40% (+25), and account moderation penalty.
            </p>
          </div>

          {/* Card 3: Action Needed Flags */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="size-4 text-cyan-600" />
              <span>Risk Severity Levels</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <b>Low (0–34)</b>: Normal flow. <b>Medium (35–69)</b>: Monitored. <b>High (70–100)</b>: Flagged with <i>Action Needed</i> for manual operator review.
            </p>
          </div>

          {/* Card 4: 360 Intelligence View */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-600">
              <Repeat className="size-4" />
              <span>360° Profile & Sessions</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Click <b>360° View</b> on any customer to inspect order velocity, AOV, saved addresses, product reviews, and terminate device login sessions.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
