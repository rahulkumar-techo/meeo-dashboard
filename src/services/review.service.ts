/**
 * @file review.service.ts
 * @description API communication layer for Reviews, Ratings, Moderation Queue, and Abuse Reports.
 */

import { apiClient } from "@/config/client"
import type {
  AdminReview,
  ReviewAbuseReport,
  AdminReviewQueryParams,
  ModerationQueueQueryParams,
  AbuseReportsQueryParams,
  ModerateReviewPayload,
  BulkModerateReviewsPayload,
  ResolveAbuseReportPayload,
  ReviewApiResponse,
  AdminReviewListResponseData,
  AbuseReportListResponseData,
  BulkModerationResponseData,
} from "@/types/review"

export const reviewService = {
  /**
   * 1. List all platform reviews across all moderation statuses.
   * Endpoint: GET /api/v1/reviews/admin/all
   */
  async getAllReviews(
    params?: AdminReviewQueryParams
  ): Promise<ReviewApiResponse<AdminReviewListResponseData>> {
    const response = await apiClient.get<
      ReviewApiResponse<AdminReviewListResponseData>
    >("/reviews/admin/all", {
      params,
    })
    return response.data
  },

  /**
   * 2. Get pending moderation queue (status: PENDING) with abuse report counts.
   * Endpoint: GET /api/v1/reviews/admin/queue
   */
  async getModerationQueue(
    params?: ModerationQueueQueryParams
  ): Promise<ReviewApiResponse<AdminReviewListResponseData>> {
    const response = await apiClient.get<
      ReviewApiResponse<AdminReviewListResponseData>
    >("/reviews/admin/queue", {
      params,
    })
    return response.data
  },

  /**
   * 3. Moderate single review (APPROVED or REJECTED) with audit note.
   * Endpoint: PATCH /api/v1/reviews/admin/:id/moderate
   */
  async moderateReview(
    id: string,
    payload: ModerateReviewPayload
  ): Promise<ReviewApiResponse<Partial<AdminReview>>> {
    const response = await apiClient.patch<
      ReviewApiResponse<Partial<AdminReview>>
    >(`/reviews/admin/${id}/moderate`, payload)
    return response.data
  },

  /**
   * 4. Bulk moderate up to 100 reviews in a single atomic transaction.
   * Endpoint: POST /api/v1/reviews/admin/bulk-moderate
   */
  async bulkModerateReviews(
    payload: BulkModerateReviewsPayload
  ): Promise<ReviewApiResponse<BulkModerationResponseData>> {
    const response = await apiClient.post<
      ReviewApiResponse<BulkModerationResponseData>
    >("/reviews/admin/bulk-moderate", payload)
    return response.data
  },

  /**
   * 5. List user-submitted abuse & spam reports with filters.
   * Endpoint: GET /api/v1/reviews/admin/reports
   */
  async getAbuseReports(
    params?: AbuseReportsQueryParams
  ): Promise<ReviewApiResponse<AbuseReportListResponseData>> {
    const response = await apiClient.get<
      ReviewApiResponse<AbuseReportListResponseData>
    >("/reviews/admin/reports", {
      params,
    })
    return response.data
  },

  /**
   * 6. Get abuse report details by UUID.
   * Endpoint: GET /api/v1/reviews/admin/reports/:id
   */
  async getAbuseReportById(
    id: string
  ): Promise<ReviewApiResponse<ReviewAbuseReport>> {
    const response = await apiClient.get<ReviewApiResponse<ReviewAbuseReport>>(
      `/reviews/admin/reports/${id}`
    )
    return response.data
  },

  /**
   * 7. Resolve abuse report and automatically action target review.
   * Endpoint: PATCH /api/v1/reviews/admin/reports/:id/resolve
   */
  async resolveAbuseReport(
    id: string,
    payload: ResolveAbuseReportPayload
  ): Promise<ReviewApiResponse<Partial<ReviewAbuseReport>>> {
    const response = await apiClient.patch<
      ReviewApiResponse<Partial<ReviewAbuseReport>>
    >(`/reviews/admin/reports/${id}/resolve`, payload)
    return response.data
  },

  /**
   * 8. Permanently delete a review and recalculate star average.
   * Endpoint: DELETE /api/v1/reviews/:id
   */
  async deleteReview(
    id: string
  ): Promise<ReviewApiResponse<{ success: boolean; message: string }>> {
    const response = await apiClient.delete<
      ReviewApiResponse<{ success: boolean; message: string }>
    >(`/reviews/${id}`)
    return response.data
  },
}
