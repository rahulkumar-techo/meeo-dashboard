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

export const outboxService = {
  /**
   * 1. List Outbox Events with status, aggregate, and eventType filters.
   * Endpoint: GET /api/v1/outbox/events
   */
  async getOutboxEvents(
    params?: OutboxQueryParams
  ): Promise<OutboxApiResponse<OutboxListResponseData>> {
    const response = await apiClient.get<
      OutboxApiResponse<OutboxListResponseData>
    >("/outbox/events", {
      params,
    })
    return response.data
  },

  /**
   * 2. Inspect Event Details, Full Payload, and Error Diagnostics.
   * Endpoint: GET /api/v1/outbox/events/:id
   */
  async getOutboxEventById(
    id: string
  ): Promise<OutboxApiResponse<OutboxEventDetail>> {
    const response = await apiClient.get<
      OutboxApiResponse<OutboxEventDetail>
    >(`/outbox/events/${id}`)
    return response.data
  },

  /**
   * 3. Trigger Immediate Batch Polling & Publishing.
   * Endpoint: POST /api/v1/outbox/publish-now
   */
  async publishNow(
    payload?: PublishNowPayload
  ): Promise<OutboxApiResponse<PublishNowResponseData>> {
    const response = await apiClient.post<
      OutboxApiResponse<PublishNowResponseData>
    >("/outbox/publish-now", payload ?? {})
    return response.data
  },

  /**
   * 4. Manually Retry Failed or Dead-Lettered Outbox Event.
   * Endpoint: POST /api/v1/outbox/events/:id/retry
   */
  async retryOutboxEvent(
    id: string
  ): Promise<OutboxApiResponse<RetryOutboxEventResponseData>> {
    const response = await apiClient.post<
      OutboxApiResponse<RetryOutboxEventResponseData>
    >(`/outbox/events/${id}/retry`)
    return response.data
  },

  /**
   * 5. Get System & BullMQ Operational Metrics.
   * Endpoint: GET /api/v1/outbox/metrics
   */
  async getOutboxMetrics(): Promise<
    OutboxApiResponse<OutboxMetricsResponseData>
  > {
    const response = await apiClient.get<
      OutboxApiResponse<OutboxMetricsResponseData>
    >("/outbox/metrics")
    return response.data
  },

  /**
   * 6. List Consumer Idempotency Audit Trail.
   * Endpoint: GET /api/v1/outbox/processed
   */
  async getProcessedEvents(
    params?: ProcessedQueryParams
  ): Promise<OutboxApiResponse<ProcessedListResponseData>> {
    const response = await apiClient.get<
      OutboxApiResponse<ProcessedListResponseData>
    >("/outbox/processed", {
      params,
    })
    return response.data
  },
}
