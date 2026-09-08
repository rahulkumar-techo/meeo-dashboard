/**
 * @file order-guide-card.tsx
 * @description Quick onboarding and state machine guide for first-time admins to easily understand order fulfillment flows.
 */

"use client"

import * as React from "react"
import {
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function OrderGuideCard() {
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
              Order Fulfillment Lifecycle & State Machine
            </h4>
            <p className="text-[11.5px] text-muted-foreground">
              Guide to order confirmation, stock commitment, warehouse packaging, and tracking dispatch.
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
        <div className="mt-3.5 pt-3.5 border-t border-primary/15 space-y-3 text-xs">
          {/* Visual Step-by-Step Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Step 1 */}
            <div className="rounded-lg bg-card/80 p-2.5 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-600">
                <Clock className="size-3.5" />
                <span>1. PENDING</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Customer placed order; temporary stock hold is active in inventory.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg bg-card/80 p-2.5 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-blue-600">
                <CheckCircle2 className="size-3.5" />
                <span>2. CONFIRMED</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Order accepted; stock hold is permanently committed to sold revenue.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg bg-card/80 p-2.5 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-600">
                <Package className="size-3.5" />
                <span>3. PROCESSING</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Warehouse staff is picking items and packaging into shipping boxes.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-lg bg-card/80 p-2.5 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-600">
                <Truck className="size-3.5" />
                <span>4. SHIPPED</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dispatched with carrier & tracking AWB link for customer parcel tracking.
              </p>
            </div>

            {/* Step 5 */}
            <div className="rounded-lg bg-card/80 p-2.5 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <CheckCheck className="size-3.5" />
                <span>5. DELIVERED</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Package received & signed by recipient. Terminal fulfillment completion.
              </p>
            </div>
          </div>

          {/* Cancellation Invariant Note */}
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground border border-border/50">
            <XCircle className="size-3.5 text-rose-500 shrink-0" />
            <span>
              <strong className="text-foreground">Cancellations & Expirations:</strong> Cancelling an order or sweeping stale unconfirmed checkouts immediately returns all held units back to available stock.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
