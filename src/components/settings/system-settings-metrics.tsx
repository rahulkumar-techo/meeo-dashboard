/**
 * @file system-settings-metrics.tsx
 * @description KPI Summary cards displaying real-time platform governance status and operational states.
 */

"use client"

import * as React from "react"
import { MetricGrid } from "@/components/common/metric-grid"
import type { MetricCardProps } from "@/components/common/metric-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { SystemSettings } from "@/types/settings"

export interface SystemSettingsMetricsProps {
  settings?: SystemSettings | null
  isLoading?: boolean
}

export function SystemSettingsMetrics({
  settings,
  isLoading,
}: SystemSettingsMetricsProps) {
  if (isLoading || !settings) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const isKillSwitch = settings.emergencyControls?.killSwitchActive
  const isMaintenance = settings.maintenanceMode
  const isReadOnly = settings.readOnlyMode

  const platformStatus = isKillSwitch
    ? "FROZEN (KILL SWITCH)"
    : isMaintenance
    ? "MAINTENANCE"
    : isReadOnly
    ? "READ-ONLY"
    : "OPERATIONAL"

  const platformStatusTheme: MetricCardProps["colorTheme"] = isKillSwitch
    ? "rose"
    : isMaintenance || isReadOnly
    ? "amber"
    : "emerald"

  // Count active feature flags
  const flags = settings.featureFlags || {}
  const activeFlagsCount = Object.values(flags).filter(Boolean).length
  const totalFlagsCount = Object.keys(flags).length

  const items: MetricCardProps[] = [
    {
      title: "Platform Status",
      value: platformStatus,
      colorTheme: platformStatusTheme,
      badge: {
        text: isKillSwitch ? "CRITICAL" : isMaintenance ? "Staged" : "Nominal",
        variant: isKillSwitch ? "destructive" : isMaintenance ? "warning" : "success",
      },
      footnote: isKillSwitch
        ? "All checkouts & payments frozen"
        : "Public storefront routing normal",
    },
    {
      title: "Settlement Frequency",
      value: settings.settlementFrequency || "WEEKLY",
      colorTheme: "indigo",
      badge: {
        text: `T+${settings.settlementDelayDays || 2} Days`,
        variant: "outline",
      },
      footnote: `Min payout: ₹${settings.minimumPayoutAmount?.toFixed(2) || "50.00"}` ,
    },
    {
      title: "Feature Flags",
      value: `${activeFlagsCount} / ${totalFlagsCount || 6} Active`,
      colorTheme: "cyan",
      badge: { text: "Canary Ready", variant: "brand" },
      footnote: "Real-time client capability flags",
    },
    {
      title: "Global Rate Limit",
      value: `${settings.globalApiRateLimit || 100} req/min`,
      colorTheme: "violet",
      badge: { text: "Token Bucket", variant: "outline" },
      footnote: `Login: ${settings.loginRateLimit || 5} · Checkout: ${settings.checkoutRateLimit || 10}`,
    },
  ]

  return <MetricGrid columns={4} items={items} />
}
