/**
 * @file use-analytics-query.ts
 * @description TanStack React Query hooks for Executive Revenue, Funnel & Omnichannel Analytics.
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/services/dashboard.service"
import type { AnalyticsQueryParams } from "@/types/analytics"

export const ANALYTICS_QUERY_KEYS = {
  all: ["analytics"] as const,
  overview: (params?: AnalyticsQueryParams) =>
    [...ANALYTICS_QUERY_KEYS.all, "overview", params] as const,
  salesChart: (params?: AnalyticsQueryParams) =>
    [...ANALYTICS_QUERY_KEYS.all, "salesChart", params] as const,
  topSellers: (params?: AnalyticsQueryParams) =>
    [...ANALYTICS_QUERY_KEYS.all, "topSellers", params] as const,
  lowStock: (params?: AnalyticsQueryParams) =>
    [...ANALYTICS_QUERY_KEYS.all, "lowStock", params] as const,
  failedPayments: (params?: AnalyticsQueryParams) =>
    [...ANALYTICS_QUERY_KEYS.all, "failedPayments", params] as const,
  health: () => [...ANALYTICS_QUERY_KEYS.all, "health"] as const,
}

/**
 * 1. Hook to fetch Executive Overview KPIs
 */
export function useExecutiveOverviewQuery(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.overview(params),
    queryFn: async () => {
      const res = await dashboardService.getOverview(params)
      return res.data
    },
    staleTime: 60 * 1000,
  })
}

/**
 * 2. Hook to fetch Time-Series Sales & Revenue Trends
 */
export function useSalesChartQuery(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.salesChart(params),
    queryFn: async () => {
      const res = await dashboardService.getSalesChart(params)
      return res.data
    },
    staleTime: 60 * 1000,
  })
}

/**
 * 3. Hook to fetch Top-Selling Products & SKU Velocity
 */
export function useTopSellersQuery(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.topSellers(params),
    queryFn: async () => {
      const res = await dashboardService.getTopSellers(params)
      return res.data
    },
    staleTime: 60 * 1000,
  })
}

/**
 * 4. Hook to fetch Low-Stock Reorder Velocity Alerts
 */
export function useLowStockAlertsQuery(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.lowStock(params),
    queryFn: async () => {
      const res = await dashboardService.getLowStock(params)
      return res.data
    },
    staleTime: 60 * 1000,
  })
}

/**
 * 5. Hook to fetch Failed Payment Triage Logs
 */
export function useFailedPaymentsQuery(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.failedPayments(params),
    queryFn: async () => {
      const res = await dashboardService.getFailedPayments(params)
      return res.data
    },
    staleTime: 60 * 1000,
  })
}

/**
 * 6. Hook to fetch Operational Backlog Health
 */
export function useDashboardHealthQuery() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.health(),
    queryFn: async () => {
      const res = await dashboardService.getHealth()
      return res.data
    },
    refetchInterval: 30000, // Refetch every 30s
  })
}
