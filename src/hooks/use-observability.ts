/**
 * @file use-observability.ts
 * @description React Query hooks for Prometheus Metrics, Loki historical logs,
 * OpenTelemetry traces, BullMQ queues, and Service Topology.
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  observabilityService,
  MetricsRangeQueryOptions,
  HistoricalLogsQueryOptions,
} from "@/services/observability.service"
import { useUserStore } from "@/store/user.store"
import type {
  MetricsRangeResponse,
  LogsQueryResponse,
  MetricPresetDefinition,
  ServiceNode,
  ServiceEdge,
  QueueSummary,
  QueueJob,
  OtelTrace,
  MetricsInstantQueryResponse,
  ObservabilityConfigItem,
} from "@/types/observability"
import type { MetricsInstantQueryOptions } from "@/services/observability.service"

export const OBSERVABILITY_QUERY_KEYS = {
  all: ["observability"] as const,
  presets: () => [...OBSERVABILITY_QUERY_KEYS.all, "presets"] as const,
  range: (options: MetricsRangeQueryOptions) =>
    [...OBSERVABILITY_QUERY_KEYS.all, "range", options] as const,
  instant: (options: MetricsInstantQueryOptions) =>
    [...OBSERVABILITY_QUERY_KEYS.all, "instant", options] as const,
  logs: (options: HistoricalLogsQueryOptions) =>
    [...OBSERVABILITY_QUERY_KEYS.all, "logs", options] as const,
  topology: () => [...OBSERVABILITY_QUERY_KEYS.all, "topology"] as const,
  queues: () => [...OBSERVABILITY_QUERY_KEYS.all, "queues"] as const,
  traces: () => [...OBSERVABILITY_QUERY_KEYS.all, "traces"] as const,
  configs: () => [...OBSERVABILITY_QUERY_KEYS.all, "configs"] as const,
}

// 1. Fetch available metric presets
export function useMetricPresets() {
  const { isAuthenticated } = useUserStore()

  return useQuery<MetricPresetDefinition[]>({
    queryKey: OBSERVABILITY_QUERY_KEYS.presets(),
    queryFn: () => observabilityService.getMetricPresets(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: Boolean(isAuthenticated),
  })
}

// 2a. Fetch time-series metric data for charts
interface UseMetricsRangeOptions extends MetricsRangeQueryOptions {
  refreshInterval?: number | false
  enabled?: boolean
}

export function useMetricsRange(options: UseMetricsRangeOptions) {
  const { isAuthenticated } = useUserStore()
  const {
    preset,
    query,
    start,
    end,
    step,
    refreshInterval = 30000,
    enabled = true,
  } = options

  return useQuery<MetricsRangeResponse>({
    queryKey: OBSERVABILITY_QUERY_KEYS.range({ preset, query, start, end, step }),
    queryFn: () =>
      observabilityService.getMetricsRange({ preset, query, start, end, step }),
    refetchInterval: refreshInterval || false,
    enabled: enabled && Boolean(isAuthenticated) && Boolean(preset || query),
    placeholderData: (previousData) => previousData,
  })
}

// 2b. Instant evaluation query (React Flow node telemetry badges & edge flow)
export interface UseMetricsInstantOptions extends MetricsInstantQueryOptions {
  refreshInterval?: number | false
  enabled?: boolean
}

export function useMetricsInstantQuery(options: UseMetricsInstantOptions = {}) {
  const { isAuthenticated } = useUserStore()
  const { preset, query, time, refreshInterval = 10000, enabled = true } = options

  return useQuery<MetricsInstantQueryResponse>({
    queryKey: OBSERVABILITY_QUERY_KEYS.instant({ preset, query, time }),
    queryFn: () => observabilityService.getMetricsInstantQuery({ preset, query, time }),
    refetchInterval: refreshInterval || false,
    enabled: enabled && Boolean(isAuthenticated) && Boolean(preset || query),
    staleTime: 1000 * 5,
    placeholderData: (previousData) => previousData,
  })
}

// 3. Fetch historical logs
export function useHistoricalLogs(options: HistoricalLogsQueryOptions = {}) {
  const { isAuthenticated } = useUserStore()

  return useQuery<LogsQueryResponse>({
    queryKey: OBSERVABILITY_QUERY_KEYS.logs(options),
    queryFn: () => observabilityService.getHistoricalLogs(options),
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 15,
  })
}

// 4. Fetch service topology nodes and edges (React Flow visual graph)
export function useServiceTopology(refreshInterval: number | false = 30000) {
  const { isAuthenticated } = useUserStore()

  return useQuery<{ nodes: ServiceNode[]; edges: ServiceEdge[] }>({
    queryKey: OBSERVABILITY_QUERY_KEYS.topology(),
    queryFn: () => observabilityService.getServiceTopology(),
    refetchInterval: refreshInterval || false,
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 20,
  })
}

// 5. Fetch Bull Board queue summaries and jobs
export function useBullQueues(refreshInterval: number | false = 10000) {
  const { isAuthenticated } = useUserStore()

  return useQuery<{ queues: QueueSummary[]; recentJobs: QueueJob[] }>({
    queryKey: OBSERVABILITY_QUERY_KEYS.queues(),
    queryFn: () => observabilityService.getBullQueues(),
    refetchInterval: refreshInterval || false,
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 10,
  })
}

// 6. Fetch OpenTelemetry distributed traces
export function useOtelTraces(refreshInterval: number | false = 20000) {
  const { isAuthenticated } = useUserStore()

  return useQuery<OtelTrace[]>({
    queryKey: OBSERVABILITY_QUERY_KEYS.traces(),
    queryFn: () => observabilityService.getOtelTraces(),
    refetchInterval: refreshInterval || false,
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 15,
  })
}

// 7. Fetch dynamic observability configs and thresholds (served from L1/L2 cache)
export function useObservabilityConfigs(refreshInterval: number | false = 30000) {
  const { isAuthenticated } = useUserStore()

  return useQuery<ObservabilityConfigItem[]>({
    queryKey: OBSERVABILITY_QUERY_KEYS.configs(),
    queryFn: () => observabilityService.getObservabilityConfigs(),
    refetchInterval: refreshInterval || false,
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 20,
  })
}

// 8. Update a dynamic observability config
export function useUpdateObservabilityConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      key,
      payload,
    }: {
      key: string
      payload: { isEnabled?: boolean; description?: string; value?: Record<string, unknown> }
    }) => observabilityService.updateObservabilityConfig(key, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBSERVABILITY_QUERY_KEYS.configs() })
    },
  })
}

// 9. Reset observability configs to defaults
export function useResetObservabilityConfigs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => observabilityService.resetObservabilityConfigs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBSERVABILITY_QUERY_KEYS.configs() })
    },
  })
}