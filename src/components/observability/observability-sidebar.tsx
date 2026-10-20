/**
 * @file observability-sidebar.tsx
 * @description Dedicated Navigation Sidebar for Server Status & Observability Command Center.
 * Replaces the main dashboard sidebar when navigating /system/metrics or /admin/observability.
 * Provides clean navigation across Metrics, React Flow Topology, Bull Board Queues,
 * OpenTelemetry Traces, and Loki Live Logs.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Activity,
  Layers,
  Cpu,
  GitBranch,
  Terminal,
  HardDrive,
  FileCode,
  RotateCw,
  Clock,
  Radio,
  Zap,
  ChevronRight,
  Server,
  ShieldCheck,
  AlertTriangle,
  Sliders,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  useObservabilityContext,
  type ObservabilityTabId,
} from "@/context/observability-context"
import { AlertRulesDialog } from "./alert-rules-dialog"

interface ObservabilityNavItem {
  id: ObservabilityTabId
  title: string
  subtitle: string
  icon: React.ElementType
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "brand"
}

interface NavSection {
  title: string
  items: ObservabilityNavItem[]
}

const TIME_RANGE_OPTIONS = [
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
  { label: "6h", value: "6h" },
  { label: "24h", value: "24h" },
]

const REFRESH_OPTIONS: { label: string; value: number | false }[] = [
  { label: "5s", value: 5000 },
  { label: "15s", value: 15000 },
  { label: "30s", value: 30000 },
  { label: "Off", value: false },
]

export function ObservabilitySidebar() {
  const router = useRouter()
  const {
    activeTab,
    setActiveTab,
    timeRange,
    setTimeRange,
    refreshInterval,
    setRefreshInterval,
    isFetching,
    handleGlobalRefresh,
    activeNodesCount,
    activeQueuesCount,
    tracesCount,
    overallErrorRatePercent,
    clusterStatus,
    hostMetrics,
  } = useObservabilityContext()

  const sections: NavSection[] = [
    {
      title: "TELEMETRY & FLOW",
      items: [
        {
          id: "overview",
          title: "Metrics & Charts",
          subtitle: "HTTP rate, latency & CPU charts",
          icon: Activity,
          badge: overallErrorRatePercent > 0 ? `${overallErrorRatePercent}% err` : undefined,
          badgeVariant: overallErrorRatePercent > 5 ? "destructive" : "secondary",
        },
        {
          id: "topology",
          title: "Service Topology",
          subtitle: `${activeNodesCount} live cluster nodes & flow`,
          icon: Layers,
          badge: "React Flow",
          badgeVariant: "brand",
        },
      ],
    },
    {
      title: "EXECUTION & PIPELINE",
      items: [
        {
          id: "queues",
          title: "Bull Board Queues",
          subtitle: `${activeQueuesCount} BullMQ workers on Redis`,
          icon: Cpu,
          badge: activeQueuesCount > 0 ? activeQueuesCount : undefined,
          badgeVariant: "secondary",
        },
        {
          id: "traces",
          title: "OpenTelemetry Traces",
          subtitle: `${tracesCount} distributed trace waterfalls`,
          icon: GitBranch,
          badge: tracesCount > 0 ? tracesCount : undefined,
          badgeVariant: "secondary",
        },
      ],
    },
    {
      title: "DIAGNOSTICS & SYSTEM",
      items: [
        {
          id: "logs",
          title: "Loki Live Logs",
          subtitle: "SSE / Socket.IO stream & LogQL",
          icon: Terminal,
          badge: "Live",
          badgeVariant: "success",
        },
        {
          id: "runtime",
          title: "V8 Heap & Hardware",
          subtitle: "Memory spaces, GC, handles",
          icon: HardDrive,
        },
        {
          id: "raw",
          title: "Raw Prometheus",
          subtitle: "Direct exposition scrape view",
          icon: FileCode,
        },
      ],
    },
  ]

  const nodeVersion = hostMetrics?.system?.nodeVersion || hostMetrics?.runtime?.version || "Node.js"
  const platform = hostMetrics?.system?.platform || "Server"

  return (
    <Sidebar className="border-r border-border/80 bg-sidebar">
      {/* 1. Header: Back link & Title */}
      <SidebarHeader className="border-b border-border/70 p-3.5 space-y-3">
        {/* Back to main dashboard link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Main Console</span>
        </Link>

        {/* Console Brand & Health Beacon */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Activity className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                Observability Center
              </h2>
              <p className="text-[11px] font-mono text-muted-foreground">
                Cluster Health & Diagnostics
              </p>
            </div>
          </div>

          {/* Beacon Badge */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono",
              clusterStatus === "critical"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                : clusterStatus === "degraded"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                clusterStatus === "critical"
                  ? "bg-rose-500 animate-ping"
                  : clusterStatus === "degraded"
                  ? "bg-amber-500"
                  : "bg-emerald-500 animate-pulse"
              )}
            />
            <span className="capitalize">{clusterStatus}</span>
          </div>
        </div>

        {/* Global Toolbar: Time Window & Polling Rate */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-2.5 space-y-2 text-xs">
          {/* Time Range Pills */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" /> Window:
            </span>
            <div className="flex items-center gap-1 bg-background/80 border border-border/70 rounded-md p-0.5">
              {TIME_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTimeRange(opt.value)}
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-mono rounded cursor-pointer transition-colors",
                    timeRange === opt.value
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Polling & Manual Sync */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Radio className="size-3" /> Auto:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 bg-background/80 border border-border/70 rounded-md p-0.5">
                {REFRESH_OPTIONS.map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setRefreshInterval(opt.value)}
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-mono rounded cursor-pointer transition-colors",
                      refreshInterval === opt.value
                        ? "bg-zinc-800 text-zinc-100 font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGlobalRefresh}
                className="p-1 rounded-md border border-border/70 bg-background/80 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Refresh telemetry"
              >
                <RotateCw
                  className={cn("size-3", isFetching && "animate-spin text-indigo-500")}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Alert Thresholds Trigger */}
        <div className="pt-0.5">
          <AlertRulesDialog
            trigger={
              <button
                type="button"
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="size-3.5 text-indigo-400" />
                  <span>Alert Rules & Limits</span>
                </span>
                <Badge
                  variant="outline"
                  className="border-indigo-500/40 text-[10px] px-1 py-0 text-indigo-300 font-mono"
                >
                  L1 Cache
                </Badge>
              </button>
            }
          />
        </div>
      </SidebarHeader>

      {/* 2. Navigation Items Grouped cleanly */}
      <SidebarContent className="p-2 space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2 text-[10px] font-bold tracking-wider text-muted-foreground/80 font-mono">
              {section.title}
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all cursor-pointer group",
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs font-medium"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "flex size-7 items-center justify-center rounded-lg transition-colors shrink-0",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={cn(
                            "text-xs font-semibold truncate leading-tight",
                            isActive ? "text-white" : "text-foreground"
                          )}
                        >
                          {item.title}
                        </div>
                        <div
                          className={cn(
                            "text-[10px] truncate leading-tight mt-0.5",
                            isActive ? "text-white/80" : "text-muted-foreground"
                          )}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {item.badge && (
                      <Badge
                        variant={item.badgeVariant as any || "secondary"}
                        className={cn(
                          "ml-1.5 shrink-0 text-[10px] font-mono px-1.5 py-0",
                          isActive && "bg-white/20 text-white border-white/30"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </SidebarContent>

      {/* 3. Footer: Runtime Specs */}
      <SidebarFooter className="border-t border-border/70 p-3 space-y-1.5 bg-muted/10 text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-foreground">
            <Server className="size-3 text-indigo-400" />
            <span>Fastify API</span>
          </span>
          <span className="text-[10px] text-emerald-400">Connected</span>
        </div>
        <div className="text-[10px] text-muted-foreground truncate">
          {nodeVersion} • {platform}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
