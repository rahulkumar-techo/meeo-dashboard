/**
 * @file page.tsx
 * @description Platform System Settings, Governance, Dynamic Rate Limiting & Emergency Controls.
 * Connects directly to backend settings endpoints (/api/v1/settings) with zero mock data.
 */

"use client"

import * as React from "react"
import {
  Settings,
  Globe,
  DollarSign,
  Shield,
  Key,
  Save,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Lock,
  Sparkles,
  Activity,
  Check,
  AlertOctagon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PageHeader } from "@/components/common/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SettingsGuideCard,
  SystemSettingsMetrics,
  EmergencyKillSwitchDialog,
  Tier1BrandSettingsCard,
  Tier2FinancialSettingsCard,
  Tier3OperationalModesCard,
  FeatureFlagsCard,
  RateLimitsSettingsCard,
} from "@/components/settings"
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
  useEmergencyKillSwitchMutation,
} from "@/hooks/use-settings-query"
import type { SystemSettings, UpdateSystemSettingsPayload } from "@/types/settings"

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = React.useState("tier1")
  const [isKillSwitchModalOpen, setIsKillSwitchModalOpen] = React.useState(false)

  // Local form state
  const [formState, setFormState] = React.useState<SystemSettings | null>(null)
  const [isDirty, setIsDirty] = React.useState(false)

  // Feedback notifications
  const [banner, setBanner] = React.useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const showBanner = (type: "success" | "error", text: string) => {
    setBanner({ type, text })
    setTimeout(() => {
      setBanner((prev) => (prev?.text === text ? null : prev))
    }, 4500)
  }

  // Backend queries & mutations
  const { data: serverSettings, isLoading, refetch, isRefetching } = useSettingsQuery()
  const updateSettingsMutation = useUpdateSettingsMutation()
  const killSwitchMutation = useEmergencyKillSwitchMutation()

  // Sync server data into form state when loaded or refetched
  React.useEffect(() => {
    if (serverSettings && !isDirty) {
      setFormState(serverSettings)
    }
  }, [serverSettings, isDirty])

  // Initial sync
  React.useEffect(() => {
    if (serverSettings && !formState) {
      setFormState(serverSettings)
    }
  }, [serverSettings, formState])

  const handleFormChange = (updates: Partial<SystemSettings>) => {
    setFormState((prev) => {
      if (!prev) return null
      return {
        ...prev,
        ...updates,
      }
    })
    setIsDirty(true)
  }

  const handleReset = () => {
    if (serverSettings) {
      setFormState(serverSettings)
      setIsDirty(false)
      showBanner("success", "Settings reverted to active server configuration.")
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!formState) return

    try {
      await updateSettingsMutation.mutateAsync(formState)
      setIsDirty(false)
      showBanner("success", "System settings successfully updated and hot-reloaded.")
    } catch (err: any) {
      showBanner(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save system settings."
      )
    }
  }

  const handleToggleKillSwitch = async (
    active: boolean,
    emergencyMessage: string
  ) => {
    try {
      await killSwitchMutation.mutateAsync({
        killSwitchActive: active,
        emergencyMessage: emergencyMessage || null,
      })
      refetch()
      showBanner(
        "success",
        active
          ? "CRITICAL: Platform emergency kill switch engaged."
          : "Platform emergency kill switch disengaged. Operations resumed."
      )
    } catch (err: any) {
      showBanner(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to execute emergency kill switch toggle."
      )
    }
  }

  const isKillSwitchActive = Boolean(
    formState?.emergencyControls?.killSwitchActive ??
      serverSettings?.emergencyControls?.killSwitchActive
  )

  const isMaintenanceActive = Boolean(
    formState?.maintenanceMode ?? serverSettings?.maintenanceMode
  )

  const isReadOnlyActive = Boolean(
    formState?.readOnlyMode ?? serverSettings?.readOnlyMode
  )

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Platform System Settings & Governance"
        badge="Zero Downtime Hot-Reload"
        badgeVariant="brand"
        description="Configure Tier 1-3 platform rules, financial settlement policies, canary feature flags, and emergency freeze controls."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="h-8.5 gap-1.5 text-xs font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          {isDirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={updateSettingsMutation.isPending}
              className="h-8.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              <span>Discard Changes</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => handleSave()}
            disabled={!isDirty || updateSettingsMutation.isPending || !formState}
            className="h-8.5 gap-1.5 text-xs font-medium bg-primary text-primary-foreground shadow-xs"
          >
            <Save className="size-3.5" />
            <span>
              {updateSettingsMutation.isPending ? "Saving Settings..." : "Save Settings"}
            </span>
          </Button>
        </div>
      </PageHeader>

      {/* 2. Critical Alert Banners */}
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

      {/* 3. Operational Guide & Runbook */}
      <SettingsGuideCard />

      {/* 4. Real-time KPI Metrics */}
      <SystemSettingsMetrics
        settings={formState || serverSettings}
        isLoading={isLoading}
      />

      {/* 5. Main Settings Navigation Tabs */}
      {isLoading || !formState ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-4"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-muted/70 max-w-3xl">
            <TabsTrigger
              value="tier1"
              className="text-xs py-1.5 font-medium gap-1.5"
            >
              <Globe className="size-3.5" />
              <span>Brand & Core</span>
            </TabsTrigger>

            <TabsTrigger
              value="tier3"
              className="text-xs py-1.5 font-medium gap-1.5"
            >
              <Shield className="size-3.5" />
              <span>Modes & Security</span>
            </TabsTrigger>

            <TabsTrigger
              value="tier2"
              className="text-xs py-1.5 font-medium gap-1.5"
            >
              <DollarSign className="size-3.5" />
              <span>Finance & Payouts</span>
            </TabsTrigger>

            <TabsTrigger
              value="flags"
              className="text-xs py-1.5 font-medium gap-1.5"
            >
              <Sparkles className="size-3.5" />
              <span>Feature Flags</span>
            </TabsTrigger>

            <TabsTrigger
              value="ratelimits"
              className="text-xs py-1.5 font-medium gap-1.5"
            >
              <Activity className="size-3.5" />
              <span>Rate Limiting</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Core Brand & Communication */}
          <TabsContent value="tier1" className="focus-visible:outline-hidden">
            <Tier1BrandSettingsCard
              settings={formState}
              onChange={handleFormChange}
            />
          </TabsContent>

          {/* Tab 2: Operational Modes & Security */}
          <TabsContent value="tier3" className="focus-visible:outline-hidden">
            <Tier3OperationalModesCard
              settings={formState}
              onChange={handleFormChange}
              onOpenKillSwitchModal={() => setIsKillSwitchModalOpen(true)}
            />
          </TabsContent>

          {/* Tab 3: Finance & Settlements */}
          <TabsContent value="tier2" className="focus-visible:outline-hidden">
            <Tier2FinancialSettingsCard
              settings={formState}
              onChange={handleFormChange}
            />
          </TabsContent>

          {/* Tab 4: Feature Flags & Canary Rollouts */}
          <TabsContent value="flags" className="focus-visible:outline-hidden">
            <FeatureFlagsCard
              settings={formState}
              onChange={handleFormChange}
            />
          </TabsContent>

          {/* Tab 5: Dynamic Rate Limiting */}
          <TabsContent value="ratelimits" className="focus-visible:outline-hidden">
            <RateLimitsSettingsCard
              settings={formState}
              onChange={handleFormChange}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* 6. Emergency Kill Switch Dialog */}
      <EmergencyKillSwitchDialog
        open={isKillSwitchModalOpen}
        onOpenChange={setIsKillSwitchModalOpen}
        currentKillSwitchActive={isKillSwitchActive}
        onToggle={handleToggleKillSwitch}
        isPending={killSwitchMutation.isPending}
      />
    </div>
  )
}
