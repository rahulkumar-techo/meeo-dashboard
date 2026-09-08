/**
 * @file notification.ts
 * @description Centralized TypeScript type definitions for Notification & Communication Operations.
 * Models multi-channel dispatch, delivery logs, template parameters, and retry attempts.
 */

/**
 * Supported notification delivery channels
 */
export type NotificationChannel = "EMAIL" | "PUSH" | "IN_APP"

/**
 * Delivery status states
 */
export type NotificationStatus = "SENT" | "FAILED" | "PENDING"

/**
 * Common notification categories & event types
 */
export type NotificationEventType =
  | "PROMOTION"
  | "SECURITY_ALERT"
  | "ORDER_CONFIRMED"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "LOW_STOCK"
  | "CUSTOM"
  | string

/**
 * Result of dispatching across a single channel
 */
export interface NotificationDispatchResult {
  channel: NotificationChannel
  success: boolean
  notificationId?: string
  error?: string
}

/**
 * Payload for POST /api/v1/notifications/send
 */
export interface NotificationSendPayload {
  userId?: string
  recipientEmail?: string
  type: NotificationEventType
  title: string
  body: string
  channels: NotificationChannel[]
  data?: Record<string, any>
}

/**
 * Response from POST /api/v1/notifications/send
 */
export interface NotificationSendResponseData {
  channelsDispatched: NotificationChannel[]
  results: NotificationDispatchResult[]
}

/**
 * Response from POST /api/v1/notifications/:id/retry
 */
export interface NotificationRetryResponseData {
  id: string
  channel: NotificationChannel
  status: NotificationStatus
  attempts: number
  sentAt?: string | null
  lastError?: string | null
}

/**
 * Single delivery log record
 */
export interface NotificationLogItem {
  id: string
  userId?: string | null
  recipientEmail?: string | null
  type: NotificationEventType
  title: string
  body: string
  channel: NotificationChannel
  status: NotificationStatus
  attempts: number
  lastError?: string | null
  sentAt?: string | null
  createdAt: string
}

/**
 * Standard notification template definition
 */
export interface NotificationTemplateDef {
  type: NotificationEventType
  name: string
  category: "orderUpdates" | "lowStockAlerts" | "marketing" | "system"
  defaultTitle: string
  defaultBody: string
  variables: string[]
}

/**
 * Generic API response wrapper from notifications controller
 */
export interface NotificationApiResponse<T> {
  status: "success" | "error"
  message?: string
  data: T
  statusCode?: number
}
