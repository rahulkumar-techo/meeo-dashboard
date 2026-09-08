/**
 * @file use-outbox-query.ts
 * @description TanStack React Query hooks for Transactional Outbox & Background Jobs.
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { outboxService } from "@/services/outbox.service"
import type {
  OutboxQueryParams,
  ProcessedQueryParams,
  PublishNowPayload,
} from "@/types/outbox"

export const OUTBOX_QUERY_KEYS = {
  all: ["outbox"] as const,
  events: () => [...OUTBOX_QUERY_KEYS.all, "events"] as const,
  eventList: (params?: OutboxQueryParams) =>
    [...OUTBOX_QUERY_KEYS.events(), params] as const,
  metrics: () => [...OUTBOX_QUERY_KEYS.all, "metrics"] as const,
  detail: (id: string) => [...OUTBOX_QUERY_KEYS.all, "detail", id] as const,
  processed: (params?: ProcessedQueryParams) =>
    [...OUTBOX_QUERY_KEYS.all, "processed", params] as const,
}

/**
 * Hook to retrieve paginated outbox events with filters
 */
export function useOutboxEventsQuery(params?: OutboxQueryParams) {
  return useQuery({
    queryKey: OUTBOX_QUERY_KEYS.eventList(params),
    queryFn: async () => {
      const res = await outboxService.getOutboxEvents(params)
      return res.data
    },
  })
}

/**
 * Hook to retrieve live Outbox & BullMQ operational metrics
 */
export function useOutboxMetricsQuery() {
  return useQuery({
    queryKey: OUTBOX_QUERY_KEYS.metrics(),
    queryFn: async () => {
      const res = await outboxService.getOutboxMetrics()
      return res.data
    },
    refetchInterval: 10000, // Poll every 10s for live telemetry
  })
}

/**
 * Hook to inspect detailed outbox event with JSON payload
 */
export function useOutboxEventDetailQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: OUTBOX_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const res = await outboxService.getOutboxEventById(id)
      return res.data
    },
    enabled: enabled && Boolean(id),
  })
}

/**
 * Hook to list consumer idempotency audit records
 */
export function useProcessedEventsQuery(
  params?: ProcessedQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: OUTBOX_QUERY_KEYS.processed(params),
    queryFn: async () => {
      const res = await outboxService.getProcessedEvents(params)
      return res.data
    },
    enabled,
  })
}

/**
 * Hook to trigger immediate outbox batch publishing
 */
export function usePublishNowMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload?: PublishNowPayload) =>
      outboxService.publishNow(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OUTBOX_QUERY_KEYS.all })
    },
  })
}

/**
 * Hook to retry a failed outbox event
 */
export function useRetryOutboxEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => outboxService.retryOutboxEvent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: OUTBOX_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: OUTBOX_QUERY_KEYS.detail(id) })
    },
  })
}
