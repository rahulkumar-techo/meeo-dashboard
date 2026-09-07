/**
 * @file dashboard.service.ts
 * @description Service for executive dashboard overview and analytics API endpoints.
 */

import { apiClient } from "@/config/client"
import { PayloadParams, DashboardOverviewData } from "@/types/dashboard-overview"
import type { ApiResponse } from "@/types/auth"

export const dashboardService = {
  /**
   * @access Super-admin/admin
   * @description Retrieves unified high-level KPI metrics across revenue,
   *  orders, user registrations, inventory levels, payment failure rates, review queues, and active coupon promotions.
   * @endpoint GET /api/v1/admin/dashboard/overview
   */
  async getOverViews(payload: PayloadParams = { period: "30d" }): Promise<DashboardOverviewData> {
    const response = await apiClient.get<DashboardOverviewData>(
      "/v1/admin/dashboard/overview",
      {
        params: payload,
      }
    )
    return response.data
  },
}