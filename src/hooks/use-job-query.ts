/**
 * @file use-job-query.ts
 * @description TanStack React Query hooks for Background Jobs & Worker Nodes Observability.
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { jobService } from "@/services/job.service"
import type {
  JobsQueryParams,
  BulkJobActionPayload,
} from "@/types/job"

export const JOB_QUERY_KEYS = {
  all: ["jobs"] as const,
  overview: () => [...JOB_QUERY_KEYS.all, "overview"] as const,
  workers: () => [...JOB_QUERY_KEYS.all, "workers"] as const,
  list: (params?: JobsQueryParams) =>
    [...JOB_QUERY_KEYS.all, "list", params] as const,
  detail: (id: string) => [...JOB_QUERY_KEYS.all, "detail", id] as const,
}

/**
 * Hook to retrieve Background Jobs Overview & Throughput KPIs
 */
export function useJobsOverviewQuery() {
  return useQuery({
    queryKey: JOB_QUERY_KEYS.overview(),
    queryFn: async () => {
      const res = await jobService.getOverview()
      return res.data
    },
    refetchInterval: 10000, // Live poll every 10s
  })
}

/**
 * Hook to retrieve Worker Nodes Health & Pod Utilization
 */
export function useWorkersQuery() {
  return useQuery({
    queryKey: JOB_QUERY_KEYS.workers(),
    queryFn: async () => {
      const res = await jobService.getWorkers()
      return res.data
    },
    refetchInterval: 10000, // Live poll every 10s
  })
}

/**
 * Hook to list background jobs with category, status, and pagination filters
 */
export function useJobsQuery(params?: JobsQueryParams) {
  return useQuery({
    queryKey: JOB_QUERY_KEYS.list(params),
    queryFn: async () => {
      const res = await jobService.getJobs(params)
      return res.data
    },
  })
}

/**
 * Hook to inspect detailed job payload & execution traces
 */
export function useJobDetailQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: JOB_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const res = await jobService.getJobById(id)
      return res.data
    },
    enabled: enabled && Boolean(id),
  })
}

/**
 * Hook to retry a failed or dead-lettered job
 */
export function useRetryJobMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => jobService.retryJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.detail(id) })
    },
  })
}

/**
 * Hook to cancel / discard a job
 */
export function useCancelJobMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => jobService.cancelJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.detail(id) })
    },
  })
}

/**
 * Hook to execute bulk queue actions (retry all failed, purge DLQ, pause, resume)
 */
export function useBulkJobActionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkJobActionPayload) =>
      jobService.executeBulkAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.all })
    },
  })
}
