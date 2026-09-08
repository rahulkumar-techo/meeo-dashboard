/**
 * @file use-coupon-query.ts
 * @description TanStack React Query hooks for Coupons & Promotional Campaigns.
 * Provides caching, background refetching, and automated query cache invalidations for mutations.
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { couponService } from "@/services/coupon.service"
import type {
  CouponQueryParams,
  CreateCouponPayload,
  UpdateCouponPayload,
  ToggleCouponStatusPayload,
} from "@/types/coupon"

export const COUPON_QUERY_KEYS = {
  all: ["coupons"] as const,
  lists: () => [...COUPON_QUERY_KEYS.all, "list"] as const,
  list: (params?: CouponQueryParams) =>
    [...COUPON_QUERY_KEYS.lists(), params] as const,
  metrics: () => [...COUPON_QUERY_KEYS.all, "metrics"] as const,
  details: () => [...COUPON_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...COUPON_QUERY_KEYS.details(), id] as const,
  usages: (id: string, params?: { page?: number; limit?: number }) =>
    [...COUPON_QUERY_KEYS.all, "usages", id, params] as const,
}

/**
 * Hook to retrieve paginated promotional coupons with search and status filtering
 */
export function useCouponsQuery(params?: CouponQueryParams) {
  return useQuery({
    queryKey: COUPON_QUERY_KEYS.list(params),
    queryFn: async () => {
      const res = await couponService.getCoupons(params)
      return res.data
    },
  })
}

/**
 * Hook to retrieve coupon analytics & performance metrics
 */
export function useCouponMetricsQuery() {
  return useQuery({
    queryKey: COUPON_QUERY_KEYS.metrics(),
    queryFn: async () => {
      const res = await couponService.getCouponMetrics()
      return res.data
    },
  })
}

/**
 * Hook to inspect single coupon detail with recent redemptions
 */
export function useCouponDetailQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: COUPON_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const res = await couponService.getCouponById(id)
      return res.data
    },
    enabled: enabled && Boolean(id),
  })
}

/**
 * Hook to retrieve paginated redemption audit log for a specific coupon
 */
export function useCouponUsagesQuery(
  id: string,
  params?: { page?: number; limit?: number },
  enabled = true
) {
  return useQuery({
    queryKey: COUPON_QUERY_KEYS.usages(id, params),
    queryFn: async () => {
      const res = await couponService.getCouponUsages(id, params)
      return res.data
    },
    enabled: enabled && Boolean(id),
  })
}

/**
 * Hook to create a new promotional coupon
 */
export function useCreateCouponMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCouponPayload) =>
      couponService.createCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEYS.all })
    },
  })
}

/**
 * Hook to update an existing coupon
 */
export function useUpdateCouponMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCouponPayload }) =>
      couponService.updateCoupon(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEYS.all })
      queryClient.invalidateQueries({
        queryKey: COUPON_QUERY_KEYS.detail(variables.id),
      })
    },
  })
}

/**
 * Hook to toggle coupon status (ACTIVE, INACTIVE, EXPIRED)
 */
export function useToggleCouponStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ToggleCouponStatusPayload
    }) => couponService.toggleCouponStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEYS.all })
      queryClient.invalidateQueries({
        queryKey: COUPON_QUERY_KEYS.detail(variables.id),
      })
    },
  })
}

/**
 * Hook to delete or archive a coupon
 */
export function useDeleteCouponMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEYS.all })
    },
  })
}
