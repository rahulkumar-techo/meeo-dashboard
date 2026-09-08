/**
 * @file outbox.ts
 * @description Centralized TypeScript type definitions for Transactional Outbox & Background Jobs.
 * Models transactional event publishing, BullMQ Redis queue metrics, DLQ recovery, and consumer idempotency.
 */

/**
 * Lifecycle states of an outbox event
 */
export type OutboxEventStatus = "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED"

/**
 * Standard Outbox Event List Item
 */
export interface OutboxEventItem {
  id: string
  eventType: string
  aggregateType: string
  aggregateId: string
  status: OutboxEventStatus
  attempts: number
  maxAttempts: number
  lockedBy?: string | null
  nextRetryAt?: string | null
  publishedAt?: string | null
  createdAt: string
}

/**
 * Comprehensive Outbox Event Specification with full JSON payload & error traces
 */
export interface OutboxEventDetail extends OutboxEventItem {
  payload: Record<string, any> | any
  lastError?: string | null
}

/**
 * BullMQ Redis Queue Depths
 */
export interface BullQueueMetrics {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
}

/**
 * Metrics response from GET /api/v1/outbox/metrics
 */
export interface OutboxMetricsResponseData {
  outbox: {
    totalEvents: number
    pending: number
    processing: number
    published: number
    failed: number
  }
  queues: {
    domainEvents: BullQueueMetrics
    deadLetter: BullQueueMetrics
    timestamp: string
  }
  timestamp: string
}

/**
 * Payload for POST /api/v1/outbox/publish-now
 */
export interface PublishNowPayload {
  batchSize?: number
}

/**
 * Response from POST /api/v1/outbox/publish-now
 */
export interface PublishNowResponseData {
  claimedCount: number
  publishedCount: number
  failedCount: number
  deadLetteredCount: number
}

/**
 * Response from POST /api/v1/outbox/events/:id/retry
 */
export interface RetryOutboxEventResponseData {
  id: string
  status: OutboxEventStatus
  attempts: number
  nextRetryAt?: string | null
  lastError?: string | null
}

/**
 * Processed consumer idempotency record
 */
export interface ProcessedEventItem {
  id: string
  eventId: string
  consumerName: string
  status: string
  processedAt: string
}

/**
 * Pagination metadata
 */
export interface OutboxPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Query parameters for listing outbox events
 */
export interface OutboxQueryParams {
  status?: OutboxEventStatus | string
  eventType?: string
  aggregateType?: string
  aggregateId?: string
  page?: number
  limit?: number
}

/**
 * Query parameters for consumer idempotency audit log
 */
export interface ProcessedQueryParams {
  status?: string
  consumerName?: string
  page?: number
  limit?: number
}

/**
 * Paginated outbox list response
 */
export interface OutboxListResponseData {
  items: OutboxEventItem[]
  pagination: OutboxPagination
}

/**
 * Paginated processed idempotency records response
 */
export interface ProcessedListResponseData {
  items: ProcessedEventItem[]
  pagination: OutboxPagination
}

/**
 * Generic API response envelope
 */
export interface OutboxApiResponse<T> {
  status: "success" | "error"
  message?: string
  data: T
  statusCode?: number
}
