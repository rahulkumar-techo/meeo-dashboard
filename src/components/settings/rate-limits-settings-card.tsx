/**
 * @file rate-limits-settings-card.tsx
 * @description Form card for Dynamic Rate Limiting & Traffic Ingestion Controls.
 */

"use client"

import * as React from "react"
import { ShieldCheck, Activity, KeyRound, ShoppingCart, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { SystemSettings } from "@/types/settings"

export interface RateLimitsSettingsCardProps {
  settings: SystemSettings
  onChange: (updates: Partial<SystemSettings>) => void
}

export function RateLimitsSettingsCard({
  settings,
  onChange,
}: RateLimitsSettingsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Global API Rate Limit */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Activity className="size-4 text-violet-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Global API Ingestion Limit
            </h2>
          </div>

          <p className="text-xs text-muted-foreground">
            Protects the cluster against DDoS attacks and high-volume burst spikes across all public REST endpoints.
          </p>
        </div>

        <div className="space-y-2 pt-2 text-xs">
          <label className="font-semibold text-foreground">
            Threshold (Requests / Minute / IP)
          </label>
          <div className="relative">
            <Input
              type="number"
              min={10}
              max={100000}
              value={settings.globalApiRateLimit ?? 100}
              onChange={(e) =>
                onChange({
                  globalApiRateLimit: parseInt(e.target.value) || 100,
                })
              }
              className="h-8.5 text-xs font-mono pr-16"
            />
            <span className="absolute right-2.5 top-2 font-mono text-muted-foreground text-[11px]">
              req/min
            </span>
          </div>
          <p className="text-[10.5px] text-muted-foreground">
            Default: 100 req / min per remote client IP address.
          </p>
        </div>
      </div>

      {/* 2. Login Rate Limit */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <KeyRound className="size-4 text-rose-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Authentication Brute-Force Guard
            </h2>
          </div>

          <p className="text-xs text-muted-foreground">
            Strict token-bucket rate limiter for /auth/login and credential submission endpoints.
          </p>
        </div>

        <div className="space-y-2 pt-2 text-xs">
          <label className="font-semibold text-foreground">
            Threshold (Attempts / Minute / IP)
          </label>
          <div className="relative">
            <Input
              type="number"
              min={1}
              max={60}
              value={settings.loginRateLimit ?? 5}
              onChange={(e) =>
                onChange({
                  loginRateLimit: parseInt(e.target.value) || 5,
                })
              }
              className="h-8.5 text-xs font-mono pr-16"
            />
            <span className="absolute right-2.5 top-2 font-mono text-muted-foreground text-[11px]">
              req/min
            </span>
          </div>
          <p className="text-[10.5px] text-muted-foreground">
            Default: 5 attempts / min to prevent automated credential stuffing.
          </p>
        </div>
      </div>

      {/* 3. Checkout Rate Limit */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <ShoppingCart className="size-4 text-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Checkout & Card Testing Guard
            </h2>
          </div>

          <p className="text-xs text-muted-foreground">
            Mitigates card testing attacks and coupon brute-forcing on cart checkout sessions.
          </p>
        </div>

        <div className="space-y-2 pt-2 text-xs">
          <label className="font-semibold text-foreground">
            Threshold (Checkouts / Minute / User)
          </label>
          <div className="relative">
            <Input
              type="number"
              min={1}
              max={120}
              value={settings.checkoutRateLimit ?? 10}
              onChange={(e) =>
                onChange({
                  checkoutRateLimit: parseInt(e.target.value) || 10,
                })
              }
              className="h-8.5 text-xs font-mono pr-16"
            />
            <span className="absolute right-2.5 top-2 font-mono text-muted-foreground text-[11px]">
              req/min
            </span>
          </div>
          <p className="text-[10.5px] text-muted-foreground">
            Default: 10 attempts / min per authenticated customer / session token.
          </p>
        </div>
      </div>
    </div>
  )
}
