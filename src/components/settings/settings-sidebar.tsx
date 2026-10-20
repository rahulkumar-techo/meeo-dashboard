/**
 * @file settings-sidebar.tsx
 * @description Dedicated Navigation Sidebar for Admin System Settings Console.
 * Replaces the main dashboard sidebar when navigating /admin/settings.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Settings,
  Globe,
  Truck,
  IndianRupee,
  Shield,
  Sparkles,
  Activity,
  BarChart3,
  ChevronRight,
  Save,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSettingsContext } from "@/context/settings-context"

export interface SettingsCategory {
  id: string
  title: string
  icon: React.ElementType
  badge?: string
  subItems: {
    id: string
    label: string
  }[]
}

const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: "tier1",
    title: "Brand & Identity",
    icon: Globe,
    subItems: [
      { id: "brand-name", label: "Platform Brand Name" },
      { id: "brand-domain", label: "Canonical Domain URL" },
      { id: "brand-emails", label: "Escalation & Support Emails" },
      { id: "brand-locale", label: "Currency & Timezone" },
    ],
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    icon: Truck,
    badge: "NEW",
    subItems: [
      { id: "shipping-fee", label: "Standard Delivery Fee" },
      { id: "shipping-threshold", label: "Free Delivery Threshold" },
      { id: "shipping-tax", label: "Global Platform GST" },
      { id: "shipping-simulator", label: "Cart Calculation Rules" },
    ],
  },
  {
    id: "tier2",
    title: "Finance & Payouts",
    icon: IndianRupee,
    subItems: [
      { id: "finance-schedule", label: "Settlement Frequency" },
      { id: "finance-delay", label: "Holding Buffer & Min Payout" },
      { id: "finance-reserves", label: "Rolling Reserve %" },
      { id: "finance-refunds", label: "Refund Dual-Approval" },
    ],
  },
  {
    id: "tier3",
    title: "Modes & Security",
    icon: Shield,
    subItems: [
      { id: "security-modes", label: "Maintenance & Read-Only" },
      { id: "security-killswitch", label: "Emergency Freeze Switch" },
      { id: "security-ips", label: "IP Whitelist Rules" },
    ],
  },
  {
    id: "flags",
    title: "Feature Flags",
    icon: Sparkles,
    subItems: [
      { id: "flags-toggles", label: "Storefront Capabilities" },
      { id: "flags-canary", label: "Canary Percentage Rollout" },
    ],
  },
  {
    id: "ratelimits",
    title: "Dynamic Rate Limits",
    icon: Activity,
    subItems: [
      { id: "rate-global", label: "Global API Traffic Cap" },
      { id: "rate-login", label: "Operator Login Throttle" },
      { id: "rate-checkout", label: "Checkout Traffic Guard" },
    ],
  },
  {
    id: "metrics",
    title: "Telemetry & Runbook",
    icon: BarChart3,
    subItems: [
      { id: "metrics-telemetry", label: "Live Telemetry KPIs" },
      { id: "metrics-guide", label: "Governance Operating Guide" },
    ],
  },
]

export function SettingsSidebar() {
  const router = useRouter()
  const {
    activeTab,
    setActiveTab,
    isDirty,
    handleSave,
    handleReset,
    isSaving,
    isKillSwitchActive,
    isMaintenanceActive,
  } = useSettingsContext()

  return (
    <Sidebar collapsible="icon" className="border-r border-border/70 bg-card">
      {/* 1. Header with Back Button & Title */}
      <SidebarHeader className="border-b border-border/60 p-3 space-y-3">
        <Button
          render={<Link href="/" prefetch={true} />}
          variant="outline"
          size="sm"
          className="w-full justify-start h-8.5 gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground border-border/80 bg-background/80 hover:bg-muted"
        >
          <ArrowLeft className="size-3.5 text-indigo-500" />
          <span>Back to Console</span>
        </Button>

        <div className="flex items-center gap-2.5 px-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs shrink-0">
            <Settings className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-bold text-foreground truncate">
              Platform Settings
            </h2>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              Zero-Downtime Governance
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* 2. Structured Category & Sub-Nav Menu */}
      <SidebarContent className="px-2 py-3 overflow-y-auto space-y-4">
        {SETTINGS_CATEGORIES.map((category) => {
          const Icon = category.icon
          const isActive = activeTab === category.id
          const hasWarning =
            category.id === "tier3" && (isKillSwitchActive || isMaintenanceActive)

          return (
            <div key={category.id} className="space-y-1">
              {/* Main Category Header Button */}
              <button
                type="button"
                onClick={() => setActiveTab(category.id)}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-foreground hover:bg-muted/70"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{category.title}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {category.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200"
                      }`}
                    >
                      {category.badge}
                    </span>
                  )}
                  {hasWarning && (
                    <AlertTriangle className="size-3 text-amber-500 shrink-0 animate-pulse" />
                  )}
                  <ChevronRight
                    className={`size-3.5 transition-transform ${
                      isActive ? "rotate-90 text-white" : "text-muted-foreground"
                    }`}
                  />
                </div>
              </button>

              {/* Sub-Nav Items */}
              {isActive && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-indigo-500/30 ml-4 my-1">
                  {category.subItems.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setActiveTab(category.id, sub.id)}
                      className="w-full text-left px-2 py-1.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1.5"
                    >
                      <span className="size-1 rounded-full bg-indigo-500/70" />
                      <span className="truncate">{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </SidebarContent>

      {/* 3. Footer with Unsaved Changes Bar & Cluster Health */}
      <SidebarFooter className="border-t border-border/60 p-3 space-y-2.5">
        {isDirty ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-bold">Unsaved Changes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="h-7 flex-1 text-[10.5px] p-0 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3 mr-1" />
                Discard
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="h-7 flex-1 text-[10.5px] p-0 font-semibold bg-primary text-primary-foreground gap-1"
              >
                <Save className="size-3" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cluster Active
            </span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
              Live
            </Badge>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
