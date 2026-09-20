/**
 * @file promotion.service.ts
 * @description Admin API client communication layer for E-commerce Promotions & Campaign Rules.
 * Provides service methods for listing, detail inspection, creation, updates, lifecycle transitions (publish, pause, archive), and status toggling.
 * Base Route: /api/v1/promotions
 */

import { apiClient } from "@/config/client"
import type {
  PromotionListItem,
  PromotionDetail,
  PromotionListResponseData,
  PromotionQueryParams,
  CreatePromotionPayload,
  UpdatePromotionPayload,
  TogglePromotionStatusPayload,
  PromotionApiResponse,
} from "@/types/promotion"

export const promotionService = {
  /**
   * 1. List Promotions with advanced filtering, pagination, and sorting.
   * Authentication: Admin Required | Permission: promotion:read
   * Endpoint: GET /api/v1/promotions
   */
  async getPromotions(
    params?: PromotionQueryParams
  ): Promise<PromotionApiResponse<PromotionListResponseData>> {
    const response = await apiClient.get<
      PromotionApiResponse<PromotionListResponseData>
    >("/promotions", {
      params,
    })
    return response.data
  },

  /**
   * 2. Get Promotion Details by ID with creator info and redemption analytics.
   * Authentication: Admin Required | Permission: promotion:read
   * Endpoint: GET /api/v1/promotions/:id
   */
  async getPromotionById(
    id: string
  ): Promise<PromotionApiResponse<PromotionDetail>> {
    const response = await apiClient.get<PromotionApiResponse<PromotionDetail>>(
      `/promotions/${id}`
    )
    return response.data
  },

  /**
   * 3. Create a new Promotional Campaign Rule.
   * Authentication: Admin Required | Permission: promotion:create
   * Endpoint: POST /api/v1/promotions
   */
  async createPromotion(
    payload: CreatePromotionPayload
  ): Promise<PromotionApiResponse<PromotionListItem>> {
    const response = await apiClient.post<
      PromotionApiResponse<PromotionListItem>
    >("/promotions", payload)
    return response.data
  },

  /**
   * 4. Update an existing Promotional Campaign Rule.
   * Authentication: Admin Required | Permission: promotion:update
   * Endpoint: PUT /api/v1/promotions/:id
   */
  async updatePromotion(
    id: string,
    payload: UpdatePromotionPayload
  ): Promise<PromotionApiResponse<PromotionListItem>> {
    const response = await apiClient.put<
      PromotionApiResponse<PromotionListItem>
    >(`/promotions/${id}`, payload)
    return response.data
  },

  /**
   * 5. Publish Promotion (transitions DRAFT/SCHEDULED into ACTIVE status and invalidates cache).
   * Authentication: Admin Required | Permission: promotion:update
   * Endpoint: PATCH /api/v1/promotions/:id/publish
   */
  async publishPromotion(
    id: string
  ): Promise<PromotionApiResponse<{ id: string; status: string }>> {
    const response = await apiClient.patch<
      PromotionApiResponse<{ id: string; status: string }>
    >(`/promotions/${id}/publish`)
    return response.data
  },

  /**
   * 6. Pause Promotion (temporarily deactivates campaign from checkout evaluation).
   * Authentication: Admin Required | Permission: promotion:update
   * Endpoint: PATCH /api/v1/promotions/:id/pause
   */
  async pausePromotion(
    id: string
  ): Promise<PromotionApiResponse<{ id: string; status: string }>> {
    const response = await apiClient.patch<
      PromotionApiResponse<{ id: string; status: string }>
    >(`/promotions/${id}/pause`)
    return response.data
  },

  /**
   * 7. Archive Promotion (permanently deactivates and archives a campaign).
   * Authentication: Admin Required | Permission: promotion:delete
   * Endpoint: PATCH /api/v1/promotions/:id/archive
   */
  async archivePromotion(
    id: string
  ): Promise<PromotionApiResponse<{ id: string; status: string }>> {
    const response = await apiClient.patch<
      PromotionApiResponse<{ id: string; status: string }>
    >(`/promotions/${id}/archive`)
    return response.data
  },

  /**
   * 8. Toggle Promotion Status directly.
   * Authentication: Admin Required | Permission: promotion:update
   * Endpoint: PATCH /api/v1/promotions/:id/status
   */
  async togglePromotionStatus(
    id: string,
    payload: TogglePromotionStatusPayload
  ): Promise<PromotionApiResponse<{ id: string; status: string }>> {
    const response = await apiClient.patch<
      PromotionApiResponse<{ id: string; status: string }>
    >(`/promotions/${id}/status`, payload)
    return response.data
  },
}
