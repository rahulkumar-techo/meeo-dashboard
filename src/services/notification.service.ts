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
} from "@/types/notification"

export const notificationService = {
  /**
   * 1. Dispatch Targeted or Broadcast Notification.
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
   * 2. Retry Failed Notification Delivery.
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
}
