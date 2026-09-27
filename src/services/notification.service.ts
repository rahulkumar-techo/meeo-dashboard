/**
 * @file notification.service.ts
 * @description Admin API communication layer for Notification & Communication Operations.
 * Dispatches multi-channel messages and retries failed delivery attempts.
 */

import { apiClient } from "@/config/client"
import type {
  NotificationSendPayload,
  NotificationSendResponseData,
  NotificationRetryResponseData,
  NotificationApiResponse,
  RegisterDevicePayload,
  UnregisterDevicePayload,
  RegisteredDeviceItem,
  ListDevicesResponseData,
  NotificationPreferences,
  AdminNotificationOverviewData,
  AdminNotificationFilters,
  AdminNotificationListData,
  InAppNotificationListData,
  UnreadCountResponseData,
} from "@/types/notification"


export const notificationService = {
  /**
   * 1. Get Notification Dashboard Overview & Aggregated KPIs.
   * Endpoint: GET /api/v1/notifications/admin/overview
   */
  async getAdminOverview(): Promise<
    NotificationApiResponse<AdminNotificationOverviewData>
  > {
    const response = await apiClient.get<
      NotificationApiResponse<AdminNotificationOverviewData>
    >("/notifications/admin/overview")
    return response.data
  },

  /**
   * 2. Filter All Platform Notifications.
   * Endpoint: GET /api/v1/notifications/admin
   */
  async listAllNotifications(
    filters?: AdminNotificationFilters
  ): Promise<NotificationApiResponse<AdminNotificationListData>> {
    const params: Record<string, any> = {}
    if (filters) {
      if (filters.channel && filters.channel !== "all") params.channel = filters.channel
      if (filters.status && filters.status !== "all") params.status = filters.status
      if (filters.type) params.type = filters.type
      if (filters.userId) params.userId = filters.userId
      if (filters.search?.trim()) params.search = filters.search.trim()
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.page) params.page = filters.page
      if (filters.limit) params.limit = filters.limit
    }

    const response = await apiClient.get<
      NotificationApiResponse<AdminNotificationListData>
    >("/notifications/admin", { params })
    return response.data
  },

  /**
   * 3. Dispatch Targeted or Broadcast Notification.
   * Endpoint: POST /api/v1/notifications/send
   */
  async sendNotification(
    payload: NotificationSendPayload
  ): Promise<NotificationApiResponse<NotificationSendResponseData>> {
    const response = await apiClient.post<
      NotificationApiResponse<NotificationSendResponseData>
    >("/notifications/send", payload)
    return response.data
  },

  /**
   * 4. Retry Failed Notification Delivery.
   * Endpoint: POST /api/v1/notifications/:id/retry
   */
  async retryNotification(
    id: string
  ): Promise<NotificationApiResponse<NotificationRetryResponseData>> {
    const response = await apiClient.post<
      NotificationApiResponse<NotificationRetryResponseData>
    >(`/notifications/${id}/retry`)
    return response.data
  },

  /**
   * 5. Register or update FCM device token.
   * Endpoint: POST /api/v1/notifications/devices
   */
  async registerDevice(
    payload: RegisterDevicePayload
  ): Promise<NotificationApiResponse<RegisteredDeviceItem>> {
    const response = await apiClient.post<
      NotificationApiResponse<RegisteredDeviceItem>
    >("/notifications/devices", payload)
    return response.data
  },

  /**
   * 6. Unregister FCM device push token.
   * Endpoint: DELETE /api/v1/notifications/devices
   */
  async unregisterDevice(
    payload: UnregisterDevicePayload
  ): Promise<NotificationApiResponse<null>> {
    const response = await apiClient.delete<NotificationApiResponse<null>>(
      "/notifications/devices",
      { data: payload }
    )
    return response.data
  },

  /**
   * 7. List active registered devices for current user.
   * Endpoint: GET /api/v1/notifications/devices
   */
  async listDevices(): Promise<
    NotificationApiResponse<ListDevicesResponseData>
  > {
    const response = await apiClient.get<
      NotificationApiResponse<ListDevicesResponseData>
    >("/notifications/devices")
    return response.data
  },

  /**
   * 8. Get notification channel & category preferences for current user.
   * Endpoint: GET /api/v1/notifications/preferences
   */
  async getPreferences(): Promise<
    NotificationApiResponse<NotificationPreferences>
  > {
    const response = await apiClient.get<
      NotificationApiResponse<NotificationPreferences>
    >("/notifications/preferences")
    return response.data
  },

  /**
   * 9. Get Unread Notifications Count for current user.
   * Endpoint: GET /api/v1/notifications/unread-count
   */
  async getUnreadCount(): Promise<
    NotificationApiResponse<UnreadCountResponseData>
  > {
    const response = await apiClient.get<
      NotificationApiResponse<UnreadCountResponseData>
    >("/notifications/unread-count")
    return response.data
  },

  /**
   * 10. Get User's In-App Notifications Feed.
   * Endpoint: GET /api/v1/notifications?limit=10
   */
  async getMyNotifications(
    limit = 10
  ): Promise<NotificationApiResponse<InAppNotificationListData>> {
    const response = await apiClient.get<
      NotificationApiResponse<InAppNotificationListData>
    >("/notifications", { params: { limit } })
    return response.data
  },

  /**
   * 11. Mark single notification as read.
   * Endpoint: PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(id: string): Promise<NotificationApiResponse<null>> {
    const response = await apiClient.patch<NotificationApiResponse<null>>(
      `/notifications/${id}/read`
    )
    return response.data
  },

  /**
   * 12. Mark all notifications as read.
   * Endpoint: POST /api/v1/notifications/mark-all-read
   */
  async markAllAsRead(): Promise<NotificationApiResponse<null>> {
    const response = await apiClient.post<NotificationApiResponse<null>>(
      "/notifications/mark-all-read"
    )
    return response.data
  },
}



