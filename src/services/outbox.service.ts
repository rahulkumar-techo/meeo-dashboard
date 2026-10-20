/**
 * @file outbox.service.ts
 * @description Admin API communication layer for Transactional Outbox & Background Jobs.
 * Connects to event streams, detail inspections, manual batch triggers, DLQ retries, metrics, and consumer idempotency logs.
 */

import { apiClient } from "@/config/client"
import type {
  OutboxEventItem,
  OutboxEventDetail,
  OutboxMetricsResponseData,
  PublishNowPayload,
  PublishNowResponseData,
  RetryOutboxEventResponseData,
  OutboxQueryParams,
  ProcessedQueryParams,
  OutboxListResponseData,
  ProcessedListResponseData,
  OutboxApiResponse,
} from "@/types/outbox"

async function fetchOutboxEndpoint(path: string, options?: any) {
  try {
    return await apiClient.get<any>(`/outbox${path}`, options)
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return await apiClient.get<any>(`/admin/outbox${path}`, options)
    }
    throw err
  }
}

async function postOutboxEndpoint(path: string, payload?: any) {
  try {
    return await apiClient.post<any>(`/outbox${path}`, payload)
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return await apiClient.post<any>(`/admin/outbox${path}`, payload)
    }
    throw err
  }
}

export const outboxService = {
  /**
   * 1. List Outbox Events with status, aggregate, and eventType filters.
   * Endpoint: GET /api/v1/outbox/events or /api/v1/admin/outbox/events
   */
  async getOutboxEvents(
    params?: OutboxQueryParams
  ): Promise<OutboxApiResponse<OutboxListResponseData>> {
    const response = await fetchOutboxEndpoint("/events", {
      params,
    })
    return response.data
  },

  /**
   * 2. Inspect Event Details, Full Payload, and Error Diagnostics.
   * Endpoint: GET /api/v1/outbox/events/:id or /api/v1/admin/outbox/events/:id
   */
  async getOutboxEventById(
    id: string
  ): Promise<OutboxApiResponse<OutboxEventDetail>> {
    const response = await fetchOutboxEndpoint(`/events/${id}`)
    return response.data
  },

  /**
   * 3. Trigger Immediate Batch Polling & Publishing.
   * Endpoint: POST /api/v1/outbox/publish-now
   */
  async publishNow(
    payload?: PublishNowPayload
  ): Promise<OutboxApiResponse<PublishNowResponseData>> {
    const response = await postOutboxEndpoint("/publish-now", payload ?? {})
    return response.data
  },

  /**
   * 4. Manually Retry Failed or Dead-Lettered Outbox Event.
   * Endpoint: POST /api/v1/outbox/events/:id/retry
   */
  async retryOutboxEvent(
    id: string
  ): Promise<OutboxApiResponse<RetryOutboxEventResponseData>> {
    const response = await postOutboxEndpoint(`/events/${id}/retry`)
    return response.data
  },

  /**
   * 5. Get System & BullMQ Operational Metrics.
   * Endpoint: GET /api/v1/outbox/metrics or /api/v1/admin/outbox/metrics
   */
  async getOutboxMetrics(): Promise<
    OutboxApiResponse<OutboxMetricsResponseData>
  > {
    const response = await fetchOutboxEndpoint("/metrics")
    return response.data
  },

  /**
   * 6. List Consumer Idempotency Audit Trail.
   * Endpoint: GET /api/v1/outbox/processed or /api/v1/admin/outbox/processed
   */
  async getProcessedEvents(
    params?: ProcessedQueryParams
  ): Promise<OutboxApiResponse<ProcessedListResponseData>> {
    const response = await fetchOutboxEndpoint("/processed", {
      params,
    })
    return response.data
  },
}
