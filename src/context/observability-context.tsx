/**
 * @file observability-context.tsx
 * @description Centralized React Context for Meeo Observability & Server Status Center.
 * Synchronizes active tab state between the dedicated ObservabilitySidebar and the main workspace,
 * URL query parameters (?tab=...), time window selections, refresh polling, and cross-module
 * telemetry correlation.
 */

"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  useMetricsRange,
  useServiceTopology,
  useBullQueues,
  useOtelTraces,
  useObservabilityConfigs,
  usePollingPolicy,
  useUpdatePollingPolicy,
} from "@/hooks/use-observability"
import { useServerMetricsQuery } from "@/hooks/use-server-metrics"
import type { ServerMetricsData } from "@/types/server-metrics"
import type {
  MetricsRangeResponse,
  ServiceNode,
  ServiceEdge,
  QueueSummary,
  QueueJob,
  OtelTrace,
  ObservabilityConfigItem,
  PollingPolicyData,
  UpdatePollingPolicyPayload,
} from "@/types/observability"

export function parseIntervalToMs(interval: string): number | false {
  if (!interval || interval.toLowerCase() === "off" || interval.toLowerCase() === "paused" || interval.toLowerCase() === "pause") {
    return false
  }
  const match = interval.match(/^(\d+)\s*(s|m|h)?$/i)
  if (!match) return false
  const val = parseInt(match[1], 10)
  const unit = (match[2] || "s").toLowerCase()
  if (unit === "m") return val * 60 * 1000
  if (unit === "h") return val * 3600 * 1000
  return val * 1000
}

export function formatMsToInterval(ms: number | false, allowedIntervals: string[] = ["5s", "15s", "30s", "Off"]): string {
  if (ms === false || ms <= 0) {
    const offItem = allowedIntervals.find((i) => i.toLowerCase() === "off" || i.toLowerCase() === "pause")
    return offItem || "Off"
  }
  const sec = Math.round(ms / 1000)
  const secStr = `${sec}s`
  if (allowedIntervals.includes(secStr)) {
    return secStr
  }
  if (sec % 60 === 0) {
    const minStr = `${sec / 60}m`
    if (allowedIntervals.includes(minStr)) {
      return minStr
    }
  }
  return allowedIntervals[0] || secStr
}

export type ObservabilityTabId =
  | "overview"
  | "topology"
  | "queues"
  | "traces"
  | "logs"
  | "runtime"
  | "raw"

export interface ObservabilityContextType {
  activeTab: ObservabilityTabId
  setActiveTab: (tab: ObservabilityTabId) => void

  // Time Window & Polling Controls
  timeRange: string
  setTimeRange: (range: string) => void
  refreshInterval: number | false
  setRefreshInterval: (interval: number | false) => void
  isFetching: boolean
  handleGlobalRefresh: () => void

  // Server-Enforced Polling Policy & Alert Suppression Cooldown
  pollingPolicy?: PollingPolicyData | null
  isPolicyLoading?: boolean
  updatePolicy: (payload: UpdatePollingPolicyPayload) => Promise<PollingPolicyData | null>

  // Telemetry Cross-Module Correlation
  correlatedLogQuery: string
  handleCorrelateLogs: (query: string) => void
  handleViewMetrics: () => void

  // Loaded Telemetry Data
  httpRateData?: MetricsRangeResponse
  errorRateData?: MetricsRangeResponse
  latencyData?: MetricsRangeResponse
  cpuData?: MetricsRangeResponse
  memoryData?: MetricsRangeResponse
  eventLoopData?: MetricsRangeResponse
  clientErrorRateData?: MetricsRangeResponse
  securityEventsData?: MetricsRangeResponse
  businessFailureData?: MetricsRangeResponse
  configs?: ObservabilityConfigItem[]
  isConfigsLoading?: boolean

  topologyNodes: ServiceNode[]
  topologyEdges: ServiceEdge[]
  queues: QueueSummary[]
  recentJobs: QueueJob[]
  traces: OtelTrace[]
  hostMetrics?: ServerMetricsData

  // Summary Counters for Sidebar Badges
  activeNodesCount: number
  activeQueuesCount: number
  tracesCount: number
  overallErrorRatePercent: number
  clusterStatus: "operational" | "degraded" | "critical"
}

const ObservabilityContext = React.createContext<ObservabilityContextType | null>(null)

const VALID_TABS: ObservabilityTabId[] = [
  "overview",
  "topology",
  "queues",
  "traces",
  "logs",
  "runtime",
  "raw",
]

export function ObservabilityProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeTabState, setActiveTabState] = React.useState<ObservabilityTabId>("overview")
  const [timeRange, setTimeRange] = React.useState<string>("15m")
  const [refreshInterval, setRefreshInterval] = React.useState<number | false>(15000)
  const [correlatedLogQuery, setCorrelatedLogQuery] = React.useState<string>('{job="meeo-api"}')

  // Query server-enforced polling policy (<0.1ms cache tier)
  const { data: pollingPolicy, isLoading: isPolicyLoading } = usePollingPolicy()
  const updatePollingPolicy = useUpdatePollingPolicy()

  // Initialize and synchronize activeWindow & activeInterval from server policy on load
  const hasInitializedPolicyRef = React.useRef(false)
  React.useEffect(() => {
    if (pollingPolicy && !hasInitializedPolicyRef.current) {
      hasInitializedPolicyRef.current = true
      if (pollingPolicy.activeWindow) {
        setTimeRange(pollingPolicy.activeWindow)
      }
      if (pollingPolicy.activeInterval) {
        const ms = parseIntervalToMs(pollingPolicy.activeInterval)
        setRefreshInterval(ms)
      }
    }
  }, [pollingPolicy])

  const setTimeRangeWithSync = React.useCallback(
    (newRange: string) => {
      setTimeRange(newRange)
      updatePollingPolicy.mutate({ activeWindow: newRange })
    },
    [updatePollingPolicy]
  )

  const setRefreshIntervalWithSync = React.useCallback(
    (newInterval: number | false) => {
      setRefreshInterval(newInterval)
      const allowed = pollingPolicy?.allowedIntervals || ["5s", "15s", "30s", "Off"]
      const strVal = formatMsToInterval(newInterval, allowed)
      updatePollingPolicy.mutate({ activeInterval: strVal })
    },
    [pollingPolicy?.allowedIntervals, updatePollingPolicy]
  )

  const handleUpdatePolicy = React.useCallback(
    async (payload: UpdatePollingPolicyPayload) => {
      const result = await updatePollingPolicy.mutateAsync(payload)
      if (payload.activeWindow) {
        setTimeRange(payload.activeWindow)
      }
      if (payload.activeInterval) {
        const ms = parseIntervalToMs(payload.activeInterval)
        setRefreshInterval(ms)
      }
      return result
    },
    [updatePollingPolicy]
  )

  // Sync tab from URL query parameter on initial load or navigation
  React.useEffect(() => {
    const tabParam = searchParams?.get("tab") as ObservabilityTabId | null
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTabState(tabParam)
    }
  }, [searchParams])

  const setActiveTab = React.useCallback(
    (tab: ObservabilityTabId) => {
      setActiveTabState(tab)
      if (pathname) {
        const params = new URLSearchParams(searchParams?.toString() || "")
        params.set("tab", tab)
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      }
    },
    [pathname, router, searchParams]
  )

  const handleCorrelateLogs = React.useCallback(
    (query: string) => {
      setCorrelatedLogQuery(query)
      setActiveTab("logs")
    },
    [setActiveTab]
  )

  const handleViewMetrics = React.useCallback(() => {
    setActiveTab("overview")
  }, [setActiveTab])

  // Calculate start ISO string based on selected time range
  const { start, end } = React.useMemo(() => {
    const endIso = new Date().toISOString()
    const now = Date.now()
    let offsetMs = 3600000 // default 1h
    if (timeRange === "15m") offsetMs = 900000
    if (timeRange === "6h") offsetMs = 21600000
    if (timeRange === "24h") offsetMs = 86400000

    return {
      start: new Date(now - offsetMs).toISOString(),
      end: endIso,
    }
  }, [timeRange])

  // 1. Prometheus Range Queries
  const { data: httpRateData, isLoading: isRateLoading, refetch: refetchRate } = useMetricsRange({
    preset: "http_request_rate",
    start,
    end,
    refreshInterval,
  })

  const { data: errorRateData, isLoading: isErrLoading, refetch: refetchErr } = useMetricsRange({
    preset: "http_error_rate",
    start,
    end,
    refreshInterval,
  })

  const { data: clientErrorRateData, isLoading: isClientErrLoading, refetch: refetchClientErr } = useMetricsRange({
    preset: "http_client_error_rate",
    start,
    end,
    refreshInterval,
  })

  const { data: securityEventsData, isLoading: isSecLoading, refetch: refetchSec } = useMetricsRange({
    preset: "http_security_events",
    start,
    end,
    refreshInterval,
  })

  const { data: businessFailureData, isLoading: isBizLoading, refetch: refetchBiz } = useMetricsRange({
    preset: "business_failure_rate",
    start,
    end,
    refreshInterval,
  })

  const { data: configs, isLoading: isConfigsLoading, refetch: refetchConfigs } = useObservabilityConfigs(refreshInterval)

  const { data: latencyData, isLoading: isLatLoading, refetch: refetchLat } = useMetricsRange({
    preset: "http_latency_p95",
    start,
    end,
    refreshInterval,
  })

  const { data: cpuData, isLoading: isCpuLoading, refetch: refetchCpu } = useMetricsRange({
    preset: "process_cpu_usage",
    start,
    end,
    refreshInterval,
  })

  const { data: memoryData, isLoading: isMemLoading, refetch: refetchMem } = useMetricsRange({
    preset: "process_memory_mb",
    start,
    end,
    refreshInterval,
  })

  const { data: eventLoopData, isLoading: isEvtLoading, refetch: refetchEvt } = useMetricsRange({
    preset: "node_event_loop_lag",
    start,
    end,
    refreshInterval,
  })

  // 2. Topology
  const { data: topologyData, isLoading: isTopLoading, refetch: refetchTop } =
    useServiceTopology(refreshInterval)

  // 3. Queues
  const { data: queuesData, isLoading: isQueueLoading, refetch: refetchQueues } =
    useBullQueues(refreshInterval)

  // 4. Traces
  const { data: tracesData, isLoading: isTracesLoading, refetch: refetchTraces } =
    useOtelTraces(refreshInterval)

  // 5. Host Metrics
  const { data: hostMetrics, isFetching: isHostFetching, refetch: refetchHost } =
    useServerMetricsQuery({
      refetchInterval: refreshInterval,
    })

  const handleGlobalRefresh = React.useCallback(() => {
    refetchRate()
    refetchErr()
    refetchClientErr()
    refetchSec()
    refetchBiz()
    refetchConfigs()
    refetchLat()
    refetchCpu()
    refetchMem()
    refetchEvt()
    refetchTop()
    refetchQueues()
    refetchTraces()
    refetchHost()
  }, [
    refetchRate,
    refetchErr,
    refetchClientErr,
    refetchSec,
    refetchBiz,
    refetchConfigs,
    refetchLat,
    refetchCpu,
    refetchMem,
    refetchEvt,
    refetchTop,
    refetchQueues,
    refetchTraces,
    refetchHost,
  ])

  const isFetching =
    isRateLoading ||
    isErrLoading ||
    isLatLoading ||
    isCpuLoading ||
    isMemLoading ||
    isEvtLoading ||
    isTopLoading ||
    isQueueLoading ||
    isTracesLoading ||
    isHostFetching

  // Compute summary values for sidebar
  const topologyNodes = topologyData?.nodes || []
  const topologyEdges = topologyData?.edges || []
  const queues = queuesData?.queues || []
  const recentJobs = queuesData?.recentJobs || []
  const traces = tracesData || []

  const activeNodesCount =
    topologyNodes.length > 0
      ? topologyNodes.length
      : hostMetrics?.httpTraffic?.endpoints?.length
      ? hostMetrics.httpTraffic.endpoints.length
      : 0

  const activeQueuesCount = queues.length
  const tracesCount = traces.length
  const overallErrorRatePercent = hostMetrics?.httpTraffic?.overallErrorRatePercent || 0

  const clusterStatus: "operational" | "degraded" | "critical" =
    overallErrorRatePercent > 10
      ? "critical"
      : overallErrorRatePercent > 2
      ? "degraded"
      : "operational"

  const value: ObservabilityContextType = {
    activeTab: activeTabState,
    setActiveTab,
    timeRange,
    setTimeRange: setTimeRangeWithSync,
    refreshInterval,
    setRefreshInterval: setRefreshIntervalWithSync,
    isFetching,
    handleGlobalRefresh,
    pollingPolicy,
    isPolicyLoading,
    updatePolicy: handleUpdatePolicy,
    correlatedLogQuery,
    handleCorrelateLogs,
    handleViewMetrics,
    httpRateData,
    errorRateData,
    latencyData,
    cpuData,
    memoryData,
    eventLoopData,
    clientErrorRateData,
    securityEventsData,
    businessFailureData,
    configs,
    isConfigsLoading,
    topologyNodes,
    topologyEdges,
    queues,
    recentJobs,
    traces,
    hostMetrics,
    activeNodesCount,
    activeQueuesCount,
    tracesCount,
    overallErrorRatePercent,
    clusterStatus,
  }

  return (
    <ObservabilityContext.Provider value={value}>
      {children}
    </ObservabilityContext.Provider>
  )
}

export function useObservabilityContext() {
  const context = React.useContext(ObservabilityContext)
  if (!context) {
    throw new Error(
      "useObservabilityContext must be used within an ObservabilityProvider"
    )
  }
  return context
}
