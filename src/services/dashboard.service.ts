/**
 * @file dashboard.service.ts
 * @description Service for executive dashboard overview and analytics API endpoints.
 * Connects to unified macro KPIs, time-series sales trends, SKU velocity, inventory alerts, and payment triage.
 */

import { apiClient } from "@/config/client"
import type { PayloadParams, DashboardOverviewData } from "@/types/dashboard-overview"
import type {
  ExecutiveOverviewData,
  SalesChartData,
  TopSellerItem,
  LowStockAlertItem,
  FailedPaymentItem,
  OperationalHealthData,
  AnalyticsQueryParams,
  AnalyticsApiResponse,
} from "@/types/analytics"

export const dashboardService = {
  /**
   * 1. Executive Overview KPIs
   * Endpoint: GET /api/v1/admin/dashboard/overview
   */
  async getOverview(
    params?: AnalyticsQueryParams
  ): Promise<AnalyticsApiResponse<ExecutiveOverviewData>> {
    const response = await apiClient.get<
      AnalyticsApiResponse<ExecutiveOverviewData>
    >("/admin/dashboard/overview", {
      params,
    })
    return response.data
  },

  /**
   * Backwards-compatible alias for existing callers
   */
  async getOverViews(
    payload: PayloadParams = { period: "30d" }
  ): Promise<DashboardOverviewData> {
    const response = await apiClient.get<DashboardOverviewData>(
      "/admin/dashboard/overview",
      {
        params: payload,
      }
    )
    return response.data
  },

  /**
   * 2. Time-Series Sales & Revenue Trends
   * Endpoint: GET /api/v1/admin/dashboard/sales-chart
   */
  async getSalesChart(
    params?: AnalyticsQueryParams
  ): Promise<AnalyticsApiResponse<SalesChartData>> {
    const response = await apiClient.get<
      AnalyticsApiResponse<SalesChartData>
    >("/admin/dashboard/sales-chart", {
      params,
    })
    return response.data
  },

  /**
   * 3. Top-Selling Products & SKU Velocity
   * Endpoint: GET /api/v1/admin/dashboard/top-sellers
   */
  async getTopSellers(
    params?: AnalyticsQueryParams
  ): Promise<AnalyticsApiResponse<TopSellerItem[]>> {
    const response = await apiClient.get<
      AnalyticsApiResponse<TopSellerItem[]>
    >("/admin/dashboard/top-sellers", {
      params,
    })
    return response.data
  },

  /**
   * 4. Low-Stock Reorder Velocity Alerts
   * Endpoint: GET /api/v1/admin/dashboard/low-stock
   */
  async getLowStock(
    params?: AnalyticsQueryParams
  ): Promise<AnalyticsApiResponse<LowStockAlertItem[]>> {
    const response = await apiClient.get<
      AnalyticsApiResponse<LowStockAlertItem[]>
    >("/admin/dashboard/low-stock", {
      params,
    })
    return response.data
  },

  /**
   * 5. Failed Payment Triage & Reason Codes
   * Endpoint: GET /api/v1/admin/dashboard/failed-payments
   */
  async getFailedPayments(
    params?: AnalyticsQueryParams
  ): Promise<AnalyticsApiResponse<FailedPaymentItem[]>> {
    const response = await apiClient.get<
      AnalyticsApiResponse<FailedPaymentItem[]>
    >("/admin/dashboard/failed-payments", {
      params,
    })
    return response.data
  },

  /**
   * 6. Operational Backlog Health
   * Endpoint: GET /api/v1/admin/dashboard/health
   */
  async getHealth(): Promise<AnalyticsApiResponse<OperationalHealthData>> {
    const response = await apiClient.get<
      AnalyticsApiResponse<OperationalHealthData>
    >("/admin/dashboard/health")
    return response.data
  },
}