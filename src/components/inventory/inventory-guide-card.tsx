/**
 * @file inventory-guide-card.tsx
 * @description Quick contextual onboarding and explanation card for first-time admins to easily understand stock lifecycles, reservation rules, and audit invariants.
 */

"use client"

import * as React from "react"
import {
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
  PackageCheck,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function InventoryGuideCard() {
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
              Inventory System Overview & Core Invariants
            </h4>
            <p className="text-[11.5px] text-muted-foreground">
              Essential guide to available stock, cart holds, replenishment thresholds, and audit logging.
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
          {/* Card 1: Available vs Reserved */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <PackageCheck className="size-4 text-emerald-600" />
              <span>Available Stock Pool</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              Strictly non-reserved stock ready for customer orders. Calculated as:{" "}
              <code className="font-mono text-foreground font-semibold">Total - Reserved</code>.
            </p>
          </div>

          {/* Card 2: Checkout Holds */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="size-4 text-cyan-600" />
              <span>Checkout Holds (TTL)</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              Items held for checkout with a 15-min timer. Unpaid holds auto-expire and return units to available stock.
            </p>
          </div>

          {/* Card 3: Safety Thresholds */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <AlertTriangle className="size-4 text-amber-600" />
              <span>Reorder Levels</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              When available units drop to or below the safety threshold, the system triggers a restock triage alert.
            </p>
          </div>

          {/* Card 4: Audit Ledger */}
          <div className="rounded-lg bg-card/80 p-3 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <FileSpreadsheet className="size-4 text-indigo-600" />
              <span>Immutable Ledger</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              Every stock addition, write-off, adjustment, hold, and sale is permanently logged with tamper-proof reference IDs.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
