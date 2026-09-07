/**
 * @file promotion-simulator.tsx
 * @description Interactive cart promotion sandbox and discount calculator.
 * Follows Single Responsibility Principle (SRP).
 */

"use client"

import * as React from "react"
import { Sparkles, ShoppingBag, ArrowRight, RotateCcw, Check, Sliders } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/formatters"
import { cn } from "@/lib/utils"

export interface PromotionSimulatorProps {
  initialCartValue?: number
  className?: string
}

export function PromotionSimulator({
  initialCartValue = 185.0,
  className,
}: PromotionSimulatorProps) {
  const [subtotal, setSubtotal] = React.useState<number>(initialCartValue)
  const [itemCount, setItemCount] = React.useState<number>(3)
  const [selectedChannel, setSelectedChannel] = React.useState<string>("web")
  const [couponCode, setCouponCode] = React.useState<string>("")
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | null>(null)

  // Calculate discount logic based on simulation rules
  const tierDiscount = subtotal >= 200 ? subtotal * 0.2 : subtotal >= 100 ? subtotal * 0.15 : 0
  const couponDiscount = appliedCoupon ? 15.0 : 0
  const totalDiscount = Math.min(subtotal, tierDiscount + couponDiscount)
  const finalTotal = Math.max(0, subtotal - totalDiscount)

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "SAVE15" || couponCode.trim().toUpperCase() === "FLASH20") {
      setAppliedCoupon(couponCode.trim().toUpperCase())
    } else if (couponCode.trim()) {
      setAppliedCoupon("TEST-PROMO")
    }
  }

  return (
    <Card className={cn("border-border/70 bg-card/95 shadow-2xs", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Promotion Rule Engine Simulator
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Simulate cart conditions to verify compound discount stacking and margins
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSubtotal(185.0)
              setItemCount(3)
              setAppliedCoupon(null)
              setCouponCode("")
            }}
            className="h-7 text-xs text-muted-foreground"
          >
            <RotateCcw className="mr-1 size-3" />
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        {/* Input Parameters Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">
              Cart Subtotal ($)
            </label>
            <Input
              type="number"
              value={subtotal}
              onChange={(e) => setSubtotal(Math.max(0, parseFloat(e.target.value) || 0))}
              className="mt-1 h-8 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground">
              Item Count (Units)
            </label>
            <Input
              type="number"
              value={itemCount}
              onChange={(e) => setItemCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="mt-1 h-8 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground">
              Channel
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-hidden"
            >
              <option value="web">Web Storefront</option>
              <option value="mobile">Mobile iOS / Android</option>
              <option value="pos">POS Retail Store</option>
            </select>
          </div>
        </div>

        {/* Coupon input */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Try promo code (e.g. SAVE15)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="h-8 text-xs font-mono uppercase"
          />
          <Button
            size="sm"
            onClick={handleApplyCoupon}
            className="h-8 text-xs shrink-0"
          >
            Apply Code
          </Button>
        </div>

        {/* Calculation Result Breakdown */}
        <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5 space-y-2">
          <div className="flex justify-between text-muted-foreground">
            <span>Gross Merchandise Value</span>
            <span className="font-mono text-foreground">{formatCurrency(subtotal)}</span>
          </div>

          {tierDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Check className="size-3" />
                <span>Tiered Savings (15%)</span>
              </span>
              <span className="font-mono font-medium">-{formatCurrency(tierDiscount)}</span>
            </div>
          )}

          {appliedCoupon && (
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Check className="size-3" />
                <span>Promo Code ({appliedCoupon})</span>
              </span>
              <span className="font-mono font-medium">-{formatCurrency(couponDiscount)}</span>
            </div>
          )}

          <div className="border-t border-border/60 pt-2 flex items-center justify-between text-sm font-bold text-foreground">
            <span>Net Customer Pay</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
