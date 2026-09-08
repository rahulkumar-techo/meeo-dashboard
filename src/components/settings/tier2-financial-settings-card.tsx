/**
 * @file tier2-financial-settings-card.tsx
 * @description Form card for Tier 2: Financial Rules, Settlement Schedules, Reserves, & Refund Thresholds.
 */

"use client"

import * as React from "react"
import { DollarSign, ShieldCheck, Calendar, Percent, Landmark } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { SystemSettings, SettlementFrequency } from "@/types/settings"

export interface Tier2FinancialSettingsCardProps {
  settings: SystemSettings
  onChange: (updates: Partial<SystemSettings>) => void
}

export function Tier2FinancialSettingsCard({
  settings,
  onChange,
}: Tier2FinancialSettingsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Settlement Schedule & Payouts */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Landmark className="size-4 text-emerald-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Settlement Frequency & Automated Payouts
          </h2>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="size-3 text-indigo-500" /> Settlement Frequency
            </label>
            <select
              value={settings.settlementFrequency || "WEEKLY"}
              onChange={(e) =>
                onChange({
                  settlementFrequency: e.target.value as SettlementFrequency,
                })
              }
              className="w-full h-8.5 px-2.5 rounded-md border border-border bg-background text-xs font-mono text-foreground focus:outline-hidden"
            >
              <option value="DAILY">DAILY — Rolling Daily Settlement</option>
              <option value="WEEKLY">WEEKLY — Weekly Payout Cycle (Recommended)</option>
              <option value="BI_WEEKLY">BI_WEEKLY — Bi-Weekly (Every 14 Days)</option>
              <option value="MONTHLY">MONTHLY — Calendar Month End</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              Determines the automated schedule for calculating and disbursing merchant balances.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                Settlement Delay (Days)
              </label>
              <Input
                type="number"
                min={0}
                max={30}
                value={settings.settlementDelayDays ?? 2}
                onChange={(e) =>
                  onChange({
                    settlementDelayDays: parseInt(e.target.value) || 0,
                  })
                }
                className="h-8.5 text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Holding buffer (e.g. T+2).
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                Min Payout Amount ($)
              </label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={settings.minimumPayoutAmount ?? 50}
                onChange={(e) =>
                  onChange({
                    minimumPayoutAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8.5 text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Accrued balance threshold.
              </p>
            </div>
          </div>

          {/* Automated Payouts Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/30 pt-2">
            <div className="space-y-0.5 pr-3">
              <span className="font-semibold text-foreground">
                Automated Worker Payouts
              </span>
              <p className="text-[11px] text-muted-foreground">
                When enabled, background worker jobs automatically disburse payouts upon threshold attainment.
              </p>
            </div>
            <Switch
              checked={Boolean(settings.automatedPayouts)}
              onCheckedChange={(checked: boolean) =>
                onChange({ automatedPayouts: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Reserves & Refund Risk Thresholds */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Percent className="size-4 text-amber-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Rolling Reserves & Risk Controls
          </h2>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Rolling Reserve Percentage (%)
            </label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={50}
                step="0.1"
                value={settings.reservePercentage ?? 5.0}
                onChange={(e) =>
                  onChange({
                    reservePercentage: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8.5 text-xs font-mono pr-8"
              />
              <span className="absolute right-2.5 top-2 font-mono text-muted-foreground text-xs">
                %
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Percentage of gross sales held in rolling reserve to cover potential chargebacks and disputes.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Refund Dual-Approval Threshold ($)
            </label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                step="1"
                value={settings.refundApprovalThreshold ?? 500.0}
                onChange={(e) =>
                  onChange({
                    refundApprovalThreshold: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8.5 text-xs font-mono pl-6"
              />
              <span className="absolute left-2.5 top-2 font-mono text-muted-foreground text-xs">
                $
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Dollar amount threshold above which refunds require dual supervisor approval before gateway processing.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11.5px]">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>Accounting Compliance Guarantee</span>
            </div>
            <p className="text-muted-foreground text-[11px]">
              All adjustments to settlement rules and reserve buffers are double-entry recorded and emitted in audit logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
