/**
 * @file tracking.service.ts
 * @description API service for User 360 Analytics profile and cursor-based activity timeline.
 */

import { apiClient } from "@/config/client"
import type {
  User360Data,
  UserActivityResponse,
  UserActivityQueryParams,
  TrackingApiResponse,
} from "@/types/tracking"

export const trackingService = {
  /**
   * Fetch pre-aggregated User 360 profile (commerce, behaviour summary, funnel, recent activity).
   * Endpoint: GET /api/v1/track-user/:userId/360
   */
  async getUser360(userId: string): Promise<TrackingApiResponse<User360Data>> {
    const response = await apiClient.get<TrackingApiResponse<User360Data>>(
      `/track-user/${userId}/360`
    )
    return response.data
  },

  /**
   * Fetch cursor-based paginated user activity timeline.
   * Endpoint: GET /api/v1/track-user/:userId/360/activity?cursor=...&limit=20
   */
  async getUserActivity(
    userId: string,
    params?: UserActivityQueryParams
  ): Promise<UserActivityResponse> {
    const response = await apiClient.get<UserActivityResponse>(
      `/track-user/${userId}/360/activity`,
      { params }
    )
    return response.data
  },
}
