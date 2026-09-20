/**
 * @file use-promotion-query.ts
 * @description TanStack React Query hooks for E-commerce Promotions & Campaign Rules.
 * Manages caching, query key factories, automated cache invalidations, and optimistic state synchronization.
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { promotionService } from "@/services/promotion.service"
import type {
  PromotionQueryParams,
  CreatePromotionPayload,
  UpdatePromotionPayload,
  TogglePromotionStatusPayload,
} from "@/types/promotion"

export const PROMOTION_QUERY_KEYS = {
  all: ["promotions"] as const,
  lists: () => [...PROMOTION_QUERY_KEYS.all, "list"] as const,
  list: (params?: PromotionQueryParams) =>
    [...PROMOTION_QUERY_KEYS.lists(), params] as const,
  details: () => [...PROMOTION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PROMOTION_QUERY_KEYS.details(), id] as const,
}

/**
 * Hook to retrieve paginated promotional campaigns with filtering and sorting
 */
export function usePromotionsQuery(params?: PromotionQueryParams) {
  return useQuery({
    queryKey: PROMOTION_QUERY_KEYS.list(params),
    queryFn: async () => {
      const res = await promotionService.getPromotions(params)
      return res.data
    },
  })
}

/**
 * Hook to inspect single promotion detailed record
 */
export function usePromotionDetailQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: PROMOTION_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const res = await promotionService.getPromotionById(id)
      return res.data
    },
    enabled: enabled && Boolean(id),
  })
}

/**
 * Hook to create a new promotional campaign rule
 */
export function useCreatePromotionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePromotionPayload) =>
      promotionService.createPromotion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_QUERY_KEYS.all })
    },
  })
}

/**
 * Hook to update an existing promotional campaign rule
 */
export function useUpdatePromotionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdatePromotionPayload
    }) => promotionService.updatePromotion(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_QUERY_KEYS.all })
      queryClient.invalidateQueries({
        queryKey: PROMOTION_QUERY_KEYS.detail(variables.id),
      })
    },
  })
}

/**
 * Hook to publish a promotion into ACTIVE status
 */
export function usePublishPromotionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => promotionService.publishPromotion(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_QUERY_KEYS.all })
      queryClient.invalidateQueries({
        queryKey: PROMOTION_QUERY_KEYS.detail(id),
      })
    },
  })
}

/**
 * Hook to pause an active promotion
 */
export function usePausePromotionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => promotionService.pausePromotion(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_QUERY_KEYS.all })
      queryClient.invalidateQueries({
        queryKey: PROMOTION_QUERY_KEYS.detail(id),
      })
    },
  })
}

/**
 * Hook to permanently archive a promotion
 */
export function useArchivePromotionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => promotionService.archivePromotion(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_QUERY_KEYS.all })
      queryClient.invalidateQueries({
        queryKey: PROMOTION_QUERY_KEYS.detail(id),
      })
    },
  })
}

/**
 * Hook to toggle promotion status directly (e.g. SCHEDULED, DRAFT, etc.)
 */
export function useTogglePromotionStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: TogglePromotionStatusPayload
    }) => promotionService.togglePromotionStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_QUERY_KEYS.all })
      queryClient.invalidateQueries({
        queryKey: PROMOTION_QUERY_KEYS.detail(variables.id),
      })
    },
  })
}
