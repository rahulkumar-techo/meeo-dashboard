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

/**
 * Supported FCM client platforms
 */
export type DevicePlatform = "web" | "android" | "ios"

/**
 * Payload for POST /api/v1/notifications/devices
 */
export interface RegisterDevicePayload {
  token: string
  platform: DevicePlatform
  userAgent?: string
}

/**
 * Payload for DELETE /api/v1/notifications/devices
 */
export interface UnregisterDevicePayload {
  token: string
}

/**
 * Single registered device record
 */
export interface RegisteredDeviceItem {
  id: string
  userId?: string
  token?: string
  platform: DevicePlatform
  userAgent?: string | null
  isActive?: boolean
  lastUsedAt?: string | null
  createdAt?: string
}

/**
 * Response for GET /api/v1/notifications/devices
 */
export interface ListDevicesResponseData {
  devices: RegisteredDeviceItem[]
}

/**
 * User notification channel & category preferences (GET /api/v1/notifications/preferences)
 */
export interface NotificationPreferences {
  id: string
  userId: string
  emailEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  orderUpdates: boolean
  promotions: boolean
  securityAlerts: boolean
  lowStockAlerts: boolean
}

/**
 * Admin Notification Overview KPI Summary (GET /api/v1/notifications/admin/overview)
 */
export interface AdminNotificationOverview {
  totalNotifications: number
  todayNotifications: number
  successfulDeliveries: number
  failedDeliveries: number
  pendingDeliveries: number
  successRate: number
}

export interface AdminNotificationRecentFailure {
  id: string
  channel: NotificationChannel
  type: string
  title: string
  lastError: string | null
  createdAt: string
  user?: {
    id: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
}

export interface AdminNotificationOverviewData {
  overview: AdminNotificationOverview
  channelBreakdown: {
    EMAIL: number
    PUSH: number
    IN_APP: number
  }
  statusBreakdown: {
    SENT: number
    READ?: number
    FAILED: number
    PENDING: number
  }
  devices: {
    totalRegistered: number
    activeDevices: number
    platforms: {
      web: number
      android: number
      ios: number
    }
  }
  recentFailures: AdminNotificationRecentFailure[]
}

/**
 * Filters for administrative notification queries (GET /api/v1/notifications/admin)
 */
export interface AdminNotificationFilters {
  channel?: NotificationChannel | "all"
  status?: NotificationStatus | "READ" | "all"
  type?: string
  userId?: string
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

/**
 * Single platform notification item returned from administrative query
 */
export interface AdminNotificationItem {
  id: string
  userId?: string | null
  recipientEmail?: string | null
  type: NotificationEventType
  title: string
  body: string
  channel: NotificationChannel
  status: NotificationStatus | "READ"
  attempts: number
  lastError?: string | null
  readAt?: string | null
  sentAt?: string | null
  createdAt: string
  user?: {
    id: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  } | null
}

/**
 * Response data for administrative notification query (GET /api/v1/notifications/admin)
 */
export interface AdminNotificationListData {
  items: AdminNotificationItem[]
  summary: {
    total: number
    channelCounts: {
      EMAIL: number
      PUSH: number
      IN_APP: number
    }
    statusCounts: {
      SENT: number
      FAILED: number
      PENDING: number
      READ: number
    }
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * User In-App Notification Item (GET /api/v1/notifications)
 */
export interface InAppNotificationItem {

  id: string
  type: string
  title: string
  body: string
  channel: NotificationChannel
  status: NotificationStatus | "READ"
  readAt: string | null
  createdAt: string
  data?: Record<string, any>
}

export interface InAppNotificationListData {
  items: InAppNotificationItem[]
  unreadCount?: number
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UnreadCountResponseData {
  unreadCount: number
}

