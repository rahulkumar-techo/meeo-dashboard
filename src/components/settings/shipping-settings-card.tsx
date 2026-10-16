/**
 * @file shipping-settings-card.tsx
 * @description Form card for configuring Storefront Shipping Fees, Free Delivery Thresholds, and Platform Default GST Rate.
 */

"use client"

import * as React from "react"
import { Truck, IndianRupee, Percent, PackageCheck, Info, CheckCircle2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { SystemSettings } from "@/types/settings"

export interface ShippingSettingsCardProps {
  settings: SystemSettings
  onChange: (updates: Partial<SystemSettings>) => void
}

export function ShippingSettingsCard({
  settings,
  onChange,
}: ShippingSettingsCardProps) {
  const standardFee = settings.standardShippingFee ?? 40
  const freeThreshold = settings.freeShippingThreshold ?? 499
  const taxRate = settings.defaultTaxRate ?? 18

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Delivery Fee Rules */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-indigo-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Delivery Charges & Thresholds
              </h2>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-indigo-200 text-indigo-600 dark:text-indigo-400">
              Active Policy
            </Badge>
          </div>

          <div className="space-y-4 text-xs">
            {/* Standard Shipping Fee */}
            <div id="shipping-fee" className="space-y-1.5 p-2 rounded-lg transition-all">
              <label className="font-semibold text-foreground flex items-center justify-between">
                <span>Standard Delivery Fee (₹)</span>
                <span className="text-[11px] text-muted-foreground font-normal">Base fee</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-mono text-muted-foreground text-xs">
                  ₹
                </span>
                <Input
                  type="number"
                  name="standardShippingFee"
                  min={0}
                  step="1"
                  value={standardFee}
                  onChange={(e) =>
                    onChange({
                      standardShippingFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="40.00"
                  className="h-8.5 pl-7 text-xs font-mono"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Fixed delivery charge added to checkout when order subtotal is below the free delivery threshold.
              </p>
            </div>

            {/* Free Delivery Threshold */}
            <div id="shipping-threshold" className="space-y-1.5 p-2 rounded-lg transition-all">
              <label className="font-semibold text-foreground flex items-center justify-between">
                <span>Free Delivery Threshold (₹)</span>
                <span className="text-[11px] text-muted-foreground font-normal">Minimum cart value</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-mono text-muted-foreground text-xs">
                  ₹
                </span>
                <Input
                  type="number"
                  name="freeShippingThreshold"
                  min={0}
                  step="1"
                  value={freeThreshold}
                  onChange={(e) =>
                    onChange({
                      freeShippingThreshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="499.00"
                  className="h-8.5 pl-7 text-xs font-mono"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Orders with a cart subtotal equal to or above this value qualify for complimentary free delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Default Platform Tax Rate */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Percent className="size-4 text-emerald-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Global Platform Taxation (GST)
              </h2>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-emerald-200 text-emerald-600 dark:text-emerald-400">
              Fallback Tax
            </Badge>
          </div>

          <div className="space-y-4 text-xs">
            {/* Default Tax Rate */}
            <div id="shipping-tax" className="space-y-1.5 p-2 rounded-lg transition-all">
              <label className="font-semibold text-foreground flex items-center justify-between">
                <span>Default Platform Tax Rate (%)</span>
                <span className="text-[11px] text-muted-foreground font-normal">Default GST</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  name="defaultTaxRate"
                  min={0}
                  max={100}
                  step="0.1"
                  value={taxRate}
                  onChange={(e) =>
                    onChange({
                      defaultTaxRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="18.00"
                  className="h-8.5 pr-8 text-xs font-mono"
                />
                <span className="absolute right-3 top-2 font-mono text-muted-foreground text-xs">
                  %
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Standard platform tax rate applied to products that do not have a product-specific GST slab assigned.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11.5px]">
                <Info className="size-3.5 text-indigo-500 shrink-0" />
                <span>Product-Level Override</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Individual catalog products can specify custom GST slabs (0%, 5%, 12%, 18%, or 28%) and HSN codes in their product editor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Simulation & Live Cart Logic Breakdown */}
      <div id="shipping-simulator" className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 sm:p-5 text-xs space-y-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="size-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <h3 className="font-bold text-foreground text-xs sm:text-sm">
            Live Storefront Calculation Rules
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-background border border-border/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Standard Cart (&lt; ₹{freeThreshold})</span>
              <Badge variant="secondary" className="text-[10px] font-mono">
                +₹{standardFee} Fee
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Example: An order of ₹{Math.max(0, freeThreshold - 100)} will be charged a delivery fee of ₹{standardFee}.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-background border border-border/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Eligible Cart (≥ ₹{freeThreshold})</span>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-300 text-emerald-600 dark:text-emerald-400">
                FREE Delivery
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Example: An order of ₹{freeThreshold + 100} automatically receives free shipping at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
