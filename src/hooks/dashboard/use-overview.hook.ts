/**
 * @file use-overview.hook.ts
 * @description TanStack Query hook for fetching and caching executive dashboard overview metrics.
 */

import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/services/dashboard.service"
import { PayloadParams } from "@/types/dashboard-overview"

export const dashboardOverviewKeys = {
  all: ["dashboard", "overview"] as const,
  detail: (params?: PayloadParams) => ["dashboard", "overview", params] as const,
}

export const useOverView = (payload: PayloadParams = { period: "30d" }) => {
  return useQuery({
    queryKey: dashboardOverviewKeys.detail(payload),
    queryFn: () => dashboardService.getOverViews(payload),
    staleTime: 60 * 1000,
  })
}