/**
 * @file page.tsx
 * @description Platform System Settings & Governance Console.
 * Consumes SettingsContext connected directly to the dedicated SettingsSidebar and /api/v1/settings.
 */

"use client"

import * as React from "react"
import {
  Save,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Lock,
  AlertOctagon,
  Globe,
  Truck,
  IndianRupee,
  Shield,
  Sparkles,
  Activity,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SettingsGuideCard,
  SystemSettingsMetrics,
  EmergencyKillSwitchDialog,
  Tier1BrandSettingsCard,
  Tier2FinancialSettingsCard,
  Tier3OperationalModesCard,
  ShippingSettingsCard,
  FeatureFlagsCard,
  RateLimitsSettingsCard,
} from "@/components/settings"
import { useSettingsContext } from "@/context/settings-context"

const TAB_METADATA: Record<
  string,
  {
    title: string
    badge: string
    badgeVariant?: "brand" | "success" | "warning" | "secondary" | "outline"
    description: string
    icon: React.ElementType
  }
> = {
  tier1: {
    title: "Brand & Core Identity",
    badge: "Core Identity",
    badgeVariant: "brand",
    description:
      "Configure canonical platform domain, public brand name, contact escalation emails, currency, and timezone.",
    icon: Globe,
  },
  shipping: {
    title: "Shipping & Delivery Policies",
    badge: "Storefront Policies",
    badgeVariant: "brand",
    description:
      "Configure standard delivery fees, free delivery order thresholds, and platform-wide fallback GST tax rates.",
    icon: Truck,
  },
  tier2: {
    title: "Finance & Settlement Policies",
    badge: "Financial Governance",
    badgeVariant: "brand",
    description:
      "Configure automated settlement schedules, holding buffers, rolling reserves, and refund approval thresholds.",
    icon: IndianRupee,
  },
  tier3: {
    title: "Operational Modes & Security",
    badge: "Protective Controls",
    badgeVariant: "warning",
    description:
      "Manage maintenance mode, read-only freeze, IP access whitelists, and cluster emergency kill switch controls.",
    icon: Shield,
  },
  flags: {
    title: "Feature Flags & Canary Rollouts",
    badge: "Storefront Capabilities",
    badgeVariant: "secondary",
    description:
      "Toggle storefront features (Reviews, Coupons, AI Search) and configure percentage-based progressive rollouts.",
    icon: Sparkles,
  },
  ratelimits: {
    title: "Dynamic Rate Limiting",
    badge: "Traffic Throttling",
    badgeVariant: "secondary",
    description:
      "Configure real-time throttle caps for global API traffic, operator login attempts, and checkout intents.",
    icon: Activity,
  },
  metrics: {
    title: "Telemetry & Governance Runbook",
    badge: "System Telemetry",
    badgeVariant: "success",
    description:
      "Inspect real-time system metrics, configuration telemetry, and platform administrative operating runbooks.",
    icon: BarChart3,
  },
}

export default function AdminSettingsPage() {
  const {
    activeTab,
    formState,
    serverSettings,
    isDirty,
    isLoading,
    isRefetching,
    isSaving,
    handleFormChange,
    handleSave,
    handleReset,
    refetch,
    isKillSwitchActive,
    isMaintenanceActive,
    isReadOnlyActive,
    isKillSwitchModalOpen,
    setIsKillSwitchModalOpen,
    handleToggleKillSwitch,
    banner,
  } = useSettingsContext()

  const currentTabMeta = TAB_METADATA[activeTab] || TAB_METADATA.tier1
  const TabIcon = currentTabMeta.icon

  return (
    <div className="flex-1 space-y-6 max-w-[1400px] mx-auto pb-28">
      {/* 1. Header with Title & Action Controls */}
      <PageHeader
        title={currentTabMeta.title}
        badge={currentTabMeta.badge}
        badgeVariant={currentTabMeta.badgeVariant || "brand"}
        description={currentTabMeta.description}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="h-8.5 gap-1.5 text-xs font-medium border-border/80"
          >
            <RefreshCw
              className={`size-3.5 ${isRefetching ? "animate-spin" : "text-muted-foreground"}`}
            />
            <span>Refresh</span>
          </Button>

          {isDirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
              className="h-8.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              <span>Discard Changes</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => handleSave()}
            disabled={!isDirty || isSaving || !formState}
            className="h-8.5 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
          >
            <Save className="size-3.5" />
            <span>{isSaving ? "Saving Settings..." : "Save Settings"}</span>
          </Button>
        </div>
      </PageHeader>

      {/* 2. Critical Operational Alert Banners */}
      {isKillSwitchActive && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertOctagon className="size-5 text-rose-600 animate-pulse shrink-0" />
            <div>
              <p className="font-bold">
                EMERGENCY PLATFORM FREEZE IS CURRENTLY ACTIVE
              </p>
              <p className="text-[11px] opacity-90">
                {formState?.emergencyControls?.emergencyMessage ||
                  "All storefront checkout operations and payment intents are locked cluster-wide."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsKillSwitchModalOpen(true)}
            className="h-8 text-xs font-bold shrink-0"
          >
            Manage Kill Switch
          </Button>
        </div>
      )}

      {isMaintenanceActive && !isKillSwitchActive && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs flex items-center gap-3 text-amber-700 dark:text-amber-300">
          <AlertTriangle className="size-4 shrink-0 text-amber-600" />
          <span>
            <strong>Maintenance Mode Enabled:</strong> Public storefront traffic will receive 503 Service Unavailable pages. Whitelisted IPs maintain direct access.
          </span>
        </div>
      )}

      {isReadOnlyActive && !isKillSwitchActive && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs flex items-center gap-3 text-amber-700 dark:text-amber-300">
          <Lock className="size-4 shrink-0 text-amber-600" />
          <span>
            <strong>Read-Only Mode Active:</strong> All mutating requests (POST, PUT, DELETE) are rejected with HTTP 423 Locked.
          </span>
        </div>
      )}

      {/* Dynamic Feedback Banner */}
      {banner && (
        <div
          className={`rounded-lg p-3 text-xs border ${
            banner.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
          }`}
        >
          {banner.text}
        </div>
      )}

      {/* 3. Main Settings Content Area */}
      {isLoading || !formState ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section: Brand & Core Identity */}
          {activeTab === "tier1" && (
            <Tier1BrandSettingsCard
              settings={formState}
              onChange={handleFormChange}
            />
          )}

          {/* Section: Shipping & Delivery Policies (NEW) */}
          {activeTab === "shipping" && (
            <ShippingSettingsCard
              settings={formState}
              onChange={handleFormChange}
            />
          )}

          {/* Section: Finance & Settlements */}
          {activeTab === "tier2" && (
            <Tier2FinancialSettingsCard
              settings={formState}
              onChange={handleFormChange}
            />
          )}

          {/* Section: Operational Modes & Security */}
          {activeTab === "tier3" && (
            <Tier3OperationalModesCard
              settings={formState}
              onChange={handleFormChange}
              onOpenKillSwitchModal={() => setIsKillSwitchModalOpen(true)}
            />
          )}

          {/* Section: Feature Flags & Canary Rollouts */}
          {activeTab === "flags" && (
            <FeatureFlagsCard
              settings={formState}
              onChange={handleFormChange}
            />
          )}

          {/* Section: Dynamic Rate Limiting */}
          {activeTab === "ratelimits" && (
            <RateLimitsSettingsCard
              settings={formState}
              onChange={handleFormChange}
            />
          )}

          {/* Section: Telemetry Metrics & Operating Runbook */}
          {activeTab === "metrics" && (
            <div className="space-y-6">
              <SystemSettingsMetrics
                settings={formState || serverSettings}
                isLoading={isLoading}
              />
              <SettingsGuideCard />
            </div>
          )}
        </div>
      )}

      {/* 4. Sticky Floating Save Changes Bar when Dirty */}
      {isDirty && formState && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[90%] sm:w-auto bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-full px-5 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-foreground">
              You have unsaved changes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
              className="h-7.5 px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Discard
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="h-7.5 px-4 text-xs font-semibold bg-primary text-primary-foreground shadow-xs gap-1.5"
            >
              <Save className="size-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* 5. Emergency Kill Switch Dialog */}
      <EmergencyKillSwitchDialog
        open={isKillSwitchModalOpen}
        onOpenChange={setIsKillSwitchModalOpen}
        currentKillSwitchActive={isKillSwitchActive}
        onToggle={handleToggleKillSwitch}
        isPending={isSaving}
      />
    </div>
  )
}
