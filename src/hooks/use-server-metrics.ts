/**
 * @file use-server-metrics.ts
 * @description TanStack Query hook for polling live server status & Prometheus metrics telemetry.
 * Default interval set to 1 minute (60,000ms) to avoid unnecessary server load.
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { metricsService, type ServerMetricsData } from "@/services/metrics.service"

export const SERVER_METRICS_QUERY_KEY = ["system", "server-metrics"] as const

export interface UseServerMetricsOptions {
  refetchInterval?: number | false
  enabled?: boolean
}

export function useServerMetricsQuery(options: UseServerMetricsOptions = {}) {
  const { refetchInterval = 60000, enabled = true } = options

  return useQuery<ServerMetricsData>({
    queryKey: SERVER_METRICS_QUERY_KEY,
    queryFn: () => metricsService.getServerMetrics(),
    refetchInterval,
    enabled,
    staleTime: 30000,
  })
}
