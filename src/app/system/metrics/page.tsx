/**
 * @file page.tsx
 * @description Fastify Server Status, Prometheus Metrics & Network Ingress Console.
 * Modular architecture with interactive Recharts graphs, route traffic matrix, and metric descriptions.
 */

"use client"

import * as React from "react"
import { Gauge, Network, HardDrive, Activity, Sliders, FileCode } from "lucide-react"
import { useServerMetricsQuery } from "@/hooks/use-server-metrics"
import { cn } from "@/lib/utils"
import {
  ServerMetricsHeader,
  ServerKpiGrid,
  SystemInfoCard,
  V8HeapSpacesChart,
  EventLoopLatencyChart,
  HandlesGcMatrix,
  RawPrometheusViewer,
  MetricsGlossaryCard,
  EndpointTrafficChart,
  EndpointLatencyChart,
  EndpointTrafficTable,
  EndpointMetricsGlossary,
} from "@/components/server-metrics"

export default function ServerMetricsPage() {
  const [refreshInterval, setRefreshInterval] = React.useState<number | false>(60000)
  const [activeTab, setActiveTab] = React.useState<"network" | "matrix" | "heap" | "eventloop" | "handles" | "raw">("network")

  const { data: metrics, isFetching, refetch } = useServerMetricsQuery({
    refetchInterval: refreshInterval,
  })

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto pb-16">
      {/* 1. Header Bar with Live Beacon, Node Version & Interval Controls */}
      <ServerMetricsHeader
        runtime={metrics?.runtime}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
        isFetching={isFetching}
        onRefresh={() => refetch()}
      />

      {/* 2. Top-Level Summary Metric KPI Grid */}
      <ServerKpiGrid metrics={metrics} />

      {/* 3. Host System Hardware, Processor & Physical RAM Specifications */}
      <SystemInfoCard system={metrics?.system} memory={metrics?.memory} cpu={metrics?.cpu} />

      {/* 4. Tab Navigation Switcher */}
      <div className="flex items-center justify-between border-b border-border/70 pb-2">
        <div className="flex rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs flex-wrap gap-1">
          {(
            [
              { key: "network", label: "Network Endpoints", icon: Network },
              { key: "matrix", label: "Overview Matrix", icon: Gauge },
              { key: "heap", label: "V8 Heap Spaces", icon: HardDrive },
              { key: "eventloop", label: "Event Loop Latency", icon: Activity },
              { key: "handles", label: "Handles & GC", icon: Sliders },
              { key: "raw", label: "Raw Prometheus", icon: FileCode },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <span className="text-[11px] font-mono text-muted-foreground hidden sm:block">
          Last polled: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* 5. Tab Content Views */}
      {activeTab === "network" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <EndpointTrafficChart endpoints={metrics?.httpTraffic?.endpoints || []} />
            </div>
            <div className="lg:col-span-6">
              <EndpointLatencyChart endpoints={metrics?.httpTraffic?.endpoints || []} />
            </div>
          </div>
          <EndpointTrafficTable endpoints={metrics?.httpTraffic?.endpoints || []} />
          <EndpointMetricsGlossary />
        </div>
      )}

      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <EndpointTrafficChart endpoints={metrics?.httpTraffic?.endpoints || []} />
            </div>
            <div className="lg:col-span-6">
              <EventLoopLatencyChart eventLoop={metrics?.eventLoop} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <V8HeapSpacesChart memory={metrics?.memory} className="lg:col-span-6" />
            <HandlesGcMatrix gc={metrics?.gc} handles={metrics?.handles} className="lg:col-span-6" />
          </div>
          <MetricsGlossaryCard />
        </div>
      )}

      {activeTab === "heap" && <V8HeapSpacesChart memory={metrics?.memory} />}

      {activeTab === "eventloop" && <EventLoopLatencyChart eventLoop={metrics?.eventLoop} />}

      {activeTab === "handles" && <HandlesGcMatrix gc={metrics?.gc} handles={metrics?.handles} />}

      {activeTab === "raw" && <RawPrometheusViewer rawText={metrics?.rawPrometheus} />}
    </div>
  )
}
