/**
 * @file tax-sidebar.tsx
 * @description Dedicated Navigation Sidebar for Meeo GST Statutory Tax Engine.
 * Replaces the main dashboard sidebar when navigating /finance/tax or /tax.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Landmark,
  Scale,
  Tag,
  ShieldCheck,
  Calculator,
  FileBarChart,
  BookOpenCheck,
  Building2,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Database,
  ExternalLink,
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
import { useTaxContext, type TaxTabId } from "@/context/tax-context"

interface TaxNavItem {
  id: TaxTabId
  title: string
  subtitle: string
  icon: React.ElementType
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "brand"
  hasWarning?: boolean
}

export function TaxSidebar() {
  const router = useRouter()
  const {
    activeTab,
    setActiveTab,
    pendingRulesCount,
    unverifiedClassificationsCount,
    activeRulesCount,
    totalRulesCount,
    setIsSeedModalOpen,
    setIsCreateRuleModalOpen,
  } = useTaxContext()

  const navItems: TaxNavItem[] = [
    {
      id: "rules",
      title: "Statutory Rules",
      subtitle: `${activeRulesCount} active, ${totalRulesCount} total`,
      icon: Scale,
      badge: totalRulesCount > 0 ? totalRulesCount : undefined,
      badgeVariant: "secondary",
    },
    {
      id: "classifications",
      title: "HSN / SAC Master",
      subtitle: unverifiedClassificationsCount > 0
        ? `${unverifiedClassificationsCount} unverified`
        : "All verified",
      icon: Tag,
      badge: unverifiedClassificationsCount > 0 ? unverifiedClassificationsCount : undefined,
      badgeVariant: unverifiedClassificationsCount > 0 ? "warning" : "secondary",
      hasWarning: unverifiedClassificationsCount > 0,
    },
    {
      id: "approvals",
      title: "Dual Authorization",
      subtitle: pendingRulesCount > 0
        ? `${pendingRulesCount} draft rules pending`
        : "Queue clear",
      icon: ShieldCheck,
      badge: pendingRulesCount > 0 ? pendingRulesCount : undefined,
      badgeVariant: pendingRulesCount > 0 ? "warning" : "success",
      hasWarning: pendingRulesCount > 0,
    },
    {
      id: "simulator",
      title: "POS Quote Simulator",
      subtitle: "Place of Supply & GST split",
      icon: Calculator,
      badge: "LIVE",
      badgeVariant: "brand",
    },
    {
      id: "reconciliation",
      title: "Tax Reconciliation",
      subtitle: "GSTR-1, GSTR-8 & Audits",
      icon: FileBarChart,
    },
    {
      id: "runbook",
      title: "CBIC Runbook SOP",
      subtitle: "Statutory changes & incidents",
      icon: BookOpenCheck,
      badge: "SOP",
      badgeVariant: "outline",
    },
    {
      id: "sellers",
      title: "Seller Tax Profiles",
      subtitle: "GSTINs & CBIC seed runner",
      icon: Building2,
    },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-border/70 bg-card">
      {/* 1. Header with Back Button & Engine Title */}
      <SidebarHeader className="border-b border-border/60 p-3 space-y-3">
        <Button
          render={<Link href="/" prefetch={false} />}
          variant="outline"
          size="sm"
          className="w-full justify-start h-8.5 gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground border-border/80 bg-background/80 hover:bg-muted"
        >
          <ArrowLeft className="size-3.5 text-indigo-500" />
          <span>Back to Console</span>
        </Button>

        <div className="flex items-center gap-2.5 px-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs shrink-0">
            <Landmark className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-foreground truncate">
                GST Tax Engine
              </h2>
              <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                CBIC
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              Statutory Dual-Auth Catalog
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* 2. Structured Navigation Items */}
      <SidebarContent className="px-2 py-3 overflow-y-auto space-y-1">
        <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
          Tax Engine Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs font-medium"
                  : "text-foreground hover:bg-muted/70 font-normal"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`size-4 shrink-0 ${
                    isActive ? "text-white" : "text-muted-foreground"
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{item.title}</div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? "text-white/80" : "text-muted-foreground"
                    }`}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.hasWarning && (
                  <AlertTriangle
                    className={`size-3 shrink-0 ${
                      isActive ? "text-amber-200" : "text-amber-500 animate-pulse"
                    }`}
                  />
                )}
                {item.badge !== undefined && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isActive
                        ? "bg-white/20 text-white"
                        : item.badgeVariant === "warning"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : item.badgeVariant === "brand"
                        ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`size-3.5 transition-transform ${
                    isActive ? "text-white" : "text-muted-foreground/60"
                  }`}
                />
              </div>
            </button>
          )
        })}

        {/* Quick Operations Box */}
        <div className="pt-3 px-1">
          <div className="rounded-lg border border-border/80 bg-background/50 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
              <span>Quick Actions</span>
              <Sparkles className="size-3 text-indigo-500" />
            </div>

            <Button
              size="sm"
              variant="default"
              onClick={() => setIsCreateRuleModalOpen(true)}
              className="w-full h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white justify-center shadow-xs"
            >
              + Draft New Rule
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSeedModalOpen(true)}
              className="w-full h-7 text-xs justify-center border-border/80 text-muted-foreground hover:text-foreground"
            >
              <Database className="size-3 mr-1 text-emerald-500" />
              Seed CBIC Slabs
            </Button>
          </div>
        </div>
      </SidebarContent>

      {/* 3. Footer with Statutory Audit & Gazette Status */}
      <SidebarFooter className="border-t border-border/60 p-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            CBIC Gazette Sync
          </span>
          <span className="font-mono text-[9px]">v1.0.4</span>
        </div>

        <a
          href="https://cbic.gov.in"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between text-[10px] text-muted-foreground hover:text-indigo-600 transition-colors p-1.5 rounded bg-muted/50 border border-border/50"
        >
          <span className="truncate">Official CBIC Gazette Portal</span>
          <ExternalLink className="size-3 shrink-0" />
        </a>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
