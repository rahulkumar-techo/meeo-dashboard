/**
 * @file analytics-guide-card.tsx
 * @description Executive Analytics & Financial Accounting Runbook Card.
 * Explains Net GMV formulas, Funnel Progression thresholds, and Gateway Attributions.
 */

"use client"

import * as React from "react"
import {
  HelpCircle,
  Calculator,
  Filter,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AnalyticsGuideCard() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-xs transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                Executive Analytics & Accounting Glossary
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Mathematical formulas, cohort attribution rules, and conversion funnel thresholds.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-7 text-xs gap-1 text-muted-foreground"
          >
            {isOpen ? (
              <>
                Hide Formulas <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                View Formulas <ChevronDown className="size-3.5" />
              </>
            )}
          </Button>
        </div>

        {isOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-border/60 text-xs">
            {/* 1. Net GMV Velocity (30D) */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Calculator className="size-3.5 text-emerald-500" />
                <span>Net GMV Velocity Formula</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>
                  • <strong className="text-foreground">Gross GMV:</strong> Sum(Item Prices) + Shipping + Taxes.
                </p>
                <p>
                  • <strong className="text-foreground">Net GMV:</strong> Gross GMV - Discounts - Refunds - Cancels.
                </p>
                <p>
                  • <strong className="text-foreground">30D Velocity:</strong> Net GMV (30D) ÷ 30 Days (Daily Run-Rate).
                </p>
              </div>
            </div>

            {/* 2. E-Commerce Conversion Throughput */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Filter className="size-3.5 text-indigo-500" />
                <span>Conversion Funnel Ratios</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>
                  • <strong className="text-foreground">Overall Rate:</strong> (Orders Placed ÷ Registered Users) × 100.
                </p>
                <p>
                  • <strong className="text-foreground">Cart Abandonment:</strong> [1 - (Completed ÷ Cart Adds)] × 100.
                </p>
                <p>
                  • <strong className="text-foreground">Average Order Value:</strong> Total Gross Revenue ÷ Total Orders.
                </p>
              </div>
            </div>

            {/* 3. Payment Failure & Gateway Quality */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <DollarSign className="size-3.5 text-amber-500" />
                <span>Payment Health & Attribution</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>
                  • <strong className="text-foreground">Failure Rate:</strong> (Failed Attempts ÷ Total Attempts) × 100.
                </p>
                <p>
                  • <strong className="text-foreground">Omnichannel Split:</strong> Desktop Web vs Mobile Web vs Native App.
                </p>
                <p>
                  • <strong className="text-foreground">Gateways:</strong> Real-time capture share for Stripe, Razorpay & COD.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
