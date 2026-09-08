/**
 * @file review-guide-card.tsx
 * @description Quick onboarding guide for first-time admins explaining the Review Moderation Architecture, Storefront Impact, and Abuse Reports workflow.
 */

"use client"

import * as React from "react"
import {
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Star,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function ReviewGuideCard() {
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
              Reviews & Ratings Moderation Architecture
            </h4>
            <p className="text-[11.5px] text-muted-foreground">
              Guide to review approvals, verified buyer verification, star score recalculation, and spam abuse reporting.
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
          {/* Card 1: Moderation Queue */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-600">
              <Clock className="size-4" />
              <span>Pending Moderation</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              New customer reviews start in <code className="font-mono text-foreground font-semibold">PENDING</code> status until verified by trust & safety moderators.
            </p>
          </div>

          {/* Card 2: Storefront Visibility */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <Star className="size-4 fill-emerald-600" />
              <span>Storefront Star Ratings</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Only <code className="font-mono text-foreground font-semibold">APPROVED</code> reviews are visible on product pages and factored into average star rating calculations.
            </p>
          </div>

          {/* Card 3: Verified Purchase Badging */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-600">
              <ShieldCheck className="size-4" />
              <span>Verified Buyer Lookup</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The system automatically verifies if the reviewer has a confirmed, completed purchase order for that specific product SKU.
            </p>
          </div>

          {/* Card 4: Bulk & Abuse Reports */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-600">
              <Layers className="size-4" />
              <span>Bulk Moderation & Reports</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Batch approve/reject up to 100 reviews in one click, or resolve user spam/abuse reports with automated review actions.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
