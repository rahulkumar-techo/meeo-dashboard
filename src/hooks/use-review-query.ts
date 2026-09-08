/**
 * @file use-review-query.ts
 * @description TanStack React Query hooks for Product Reviews, Moderation Queue, and Abuse Reports.
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { reviewService } from "@/services/review.service"
import type {
  AdminReview,
  ReviewAbuseReport,
  AdminReviewQueryParams,
  ModerationQueueQueryParams,
  AbuseReportsQueryParams,
  ModerateReviewPayload,
  BulkModerateReviewsPayload,
  ResolveAbuseReportPayload,
  AdminReviewListResponseData,
  AbuseReportListResponseData,
} from "@/types/review"

export const REVIEWS_QUERY_KEY = ["reviews", "admin"]
export const MODERATION_QUEUE_KEY = ["reviews", "admin", "queue"]
export const ABUSE_REPORTS_KEY = ["reviews", "admin", "reports"]

/**
 * Hook to retrieve all platform reviews with filters & pagination.
 */
export function useAdminReviewsQuery(params?: AdminReviewQueryParams) {
  return useQuery<AdminReviewListResponseData>({
    queryKey: [...REVIEWS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await reviewService.getAllReviews(params)
      const data = res?.data ?? (res as any)

      if (data && Array.isArray(data.items)) {
        return {
          items: data.items,
          pagination: data.pagination ?? {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.items.length,
            totalPages: Math.ceil(data.items.length / (params?.limit ?? 20)),
          },
        }
      }

      if (Array.isArray(data)) {
        return {
          items: data,
          pagination: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.length,
            totalPages: 1,
          },
        }
      }

      return {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }
    },
    staleTime: 15 * 1000,
  })
}

/**
 * Hook to retrieve prioritized pending moderation queue.
 */
export function useModerationQueueQuery(params?: ModerationQueueQueryParams) {
  return useQuery<AdminReviewListResponseData>({
    queryKey: [...MODERATION_QUEUE_KEY, params],
    queryFn: async () => {
      const res = await reviewService.getModerationQueue(params)
      const data = res?.data ?? (res as any)

      if (data && Array.isArray(data.items)) {
        return {
          items: data.items,
          pagination: data.pagination ?? {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.items.length,
            totalPages: Math.ceil(data.items.length / (params?.limit ?? 20)),
          },
        }
      }

      if (Array.isArray(data)) {
        return {
          items: data,
          pagination: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.length,
            totalPages: 1,
          },
        }
      }

      return {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }
    },
    staleTime: 15 * 1000,
  })
}

/**
 * Hook to retrieve user-flagged abuse & spam reports.
 */
export function useAbuseReportsQuery(params?: AbuseReportsQueryParams) {
  return useQuery<AbuseReportListResponseData>({
    queryKey: [...ABUSE_REPORTS_KEY, params],
    queryFn: async () => {
      const res = await reviewService.getAbuseReports(params)
      const data = res?.data ?? (res as any)

      if (data && Array.isArray(data.items)) {
        return {
          items: data.items,
          pagination: data.pagination ?? {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.items.length,
            totalPages: Math.ceil(data.items.length / (params?.limit ?? 20)),
          },
        }
      }

      if (Array.isArray(data)) {
        return {
          items: data,
          pagination: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.length,
            totalPages: 1,
          },
        }
      }

      return {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }
    },
    staleTime: 15 * 1000,
  })
}

/**
 * Hook to inspect a single abuse report by ID.
 */
export function useAbuseReportByIdQuery(id: string) {
  return useQuery<ReviewAbuseReport | null>({
    queryKey: [...ABUSE_REPORTS_KEY, id],
    queryFn: async () => {
      if (!id) return null
      const res = await reviewService.getAbuseReportById(id)
      return res?.data ?? null
    },
    enabled: Boolean(id),
    staleTime: 20 * 1000,
  })
}

/**
 * Mutation hook to moderate an individual review.
 */
export function useModerateReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: ModerateReviewPayload
    }) => {
      return await reviewService.moderateReview(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: MODERATION_QUEUE_KEY })
      queryClient.invalidateQueries({ queryKey: ABUSE_REPORTS_KEY })
    },
  })
}

/**
 * Mutation hook to bulk moderate up to 100 reviews simultaneously.
 */
export function useBulkModerateReviewsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: BulkModerateReviewsPayload) => {
      return await reviewService.bulkModerateReviews(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: MODERATION_QUEUE_KEY })
      queryClient.invalidateQueries({ queryKey: ABUSE_REPORTS_KEY })
    },
  })
}

/**
 * Mutation hook to resolve an abuse report.
 */
export function useResolveAbuseReportMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: ResolveAbuseReportPayload
    }) => {
      return await reviewService.resolveAbuseReport(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: MODERATION_QUEUE_KEY })
      queryClient.invalidateQueries({ queryKey: ABUSE_REPORTS_KEY })
    },
  })
}

/**
 * Mutation hook to permanently delete a review.
 */
export function useDeleteReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await reviewService.deleteReview(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: MODERATION_QUEUE_KEY })
      queryClient.invalidateQueries({ queryKey: ABUSE_REPORTS_KEY })
    },
  })
}
