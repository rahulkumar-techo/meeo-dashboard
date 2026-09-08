/**
 * @file coupon.service.ts
 * @description Admin API communication layer for Coupons & Promotional Campaigns.
 * Provides client methods for coupon listing, performance analytics metrics, creation, updates, status toggles, deletion, and redemption audit logs.
 */

import { apiClient } from "@/config/client"
import type {
  Coupon,
  CouponDetail,
  CouponMetricsResponseData,
  CouponQueryParams,
  CreateCouponPayload,
  UpdateCouponPayload,
  ToggleCouponStatusPayload,
  DeleteCouponResponseData,
  CouponListResponseData,
  CouponUsagesResponseData,
  CouponApiResponse,
} from "@/types/coupon"

export const couponService = {
  /**
   * 1. List All Promotional Coupons with search, type, and status filtering.
   * Endpoint: GET /api/v1/coupons
   */
  async getCoupons(
    params?: CouponQueryParams
  ): Promise<CouponApiResponse<CouponListResponseData>> {
    const response = await apiClient.get<
      CouponApiResponse<CouponListResponseData>
    >("/coupons", {
      params,
    })
    return response.data
  },

  /**
   * 2. Get Promotion Analytics & Performance Metrics.
   * Endpoint: GET /api/v1/coupons/metrics
   */
  async getCouponMetrics(): Promise<
    CouponApiResponse<CouponMetricsResponseData>
  > {
    const response = await apiClient.get<
      CouponApiResponse<CouponMetricsResponseData>
    >("/coupons/metrics")
    return response.data
  },

  /**
   * 3. Get Coupon Details with Recent Usages.
   * Endpoint: GET /api/v1/coupons/:id
   */
  async getCouponById(
    id: string
  ): Promise<CouponApiResponse<CouponDetail>> {
    const response = await apiClient.get<CouponApiResponse<CouponDetail>>(
      `/coupons/${id}`
    )
    return response.data
  },

  /**
   * 4. Create Promotional Coupon.
   * Endpoint: POST /api/v1/coupons
   */
  async createCoupon(
    payload: CreateCouponPayload
  ): Promise<CouponApiResponse<Coupon>> {
    const response = await apiClient.post<CouponApiResponse<Coupon>>(
      "/coupons",
      payload
    )
    return response.data
  },

  /**
   * 5. Update Existing Coupon.
   * Endpoint: PUT /api/v1/coupons/:id
   */
  async updateCoupon(
    id: string,
    payload: UpdateCouponPayload
  ): Promise<CouponApiResponse<Coupon>> {
    const response = await apiClient.put<CouponApiResponse<Coupon>>(
      `/coupons/${id}`,
      payload
    )
    return response.data
  },

  /**
   * 6. Toggle Coupon Status (ACTIVE, INACTIVE, EXPIRED).
   * Endpoint: PATCH /api/v1/coupons/:id/status
   */
  async toggleCouponStatus(
    id: string,
    payload: ToggleCouponStatusPayload
  ): Promise<CouponApiResponse<Coupon>> {
    const response = await apiClient.patch<CouponApiResponse<Coupon>>(
      `/coupons/${id}/status`,
      payload
    )
    return response.data
  },

  /**
   * 7. Delete or Archive Coupon.
   * Endpoint: DELETE /api/v1/coupons/:id
   */
  async deleteCoupon(
    id: string
  ): Promise<CouponApiResponse<DeleteCouponResponseData>> {
    const response = await apiClient.delete<
      CouponApiResponse<DeleteCouponResponseData>
    >(`/coupons/${id}`)
    return response.data
  },

  /**
   * 8. List Coupon Redemption Audit Log.
   * Endpoint: GET /api/v1/coupons/:id/usages
   */
  async getCouponUsages(
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<CouponApiResponse<CouponUsagesResponseData>> {
    const response = await apiClient.get<
      CouponApiResponse<CouponUsagesResponseData>
    >(`/coupons/${id}/usages`, {
      params,
    })
    return response.data
  },
}
