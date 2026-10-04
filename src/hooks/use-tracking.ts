/**
 * @file use-tracking.ts
 * @description TanStack React Query hooks for User 360 Analytics profile and cursor-based activity timeline.
 */

"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { trackingService } from "@/services/tracking.service"
import type {
  User360Data,
  UserActivityResponse,
  UserActivityQueryParams,
} from "@/types/tracking"

export const TRACKING_QUERY_KEYS = {
  all: ["track-user"] as const,
  user360: (userId: string) => [...TRACKING_QUERY_KEYS.all, "360", userId] as const,
  activity: (userId: string, params?: UserActivityQueryParams) =>
    [...TRACKING_QUERY_KEYS.all, "activity", userId, params] as const,
  activityInfinite: (userId: string, limit?: number) =>
    [...TRACKING_QUERY_KEYS.all, "activity", "infinite", userId, limit] as const,
}

/**
 * Hook to retrieve pre-aggregated User 360 analytics profile for a specific user ID.
 */
export function useUser360Query(
  userId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<User360Data | null>({
    queryKey: TRACKING_QUERY_KEYS.user360(userId),
    queryFn: async () => {
      if (!userId) return null
      const res = await trackingService.getUser360(userId)
      return res?.data ?? null
    },
    enabled: (options?.enabled ?? true) && Boolean(userId),
    staleTime: 15 * 1000,
  })
}

/**
 * Hook to retrieve a single page of user activity events.
 */
export function useUserActivityQuery(
  userId: string,
  params?: UserActivityQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<UserActivityResponse | null>({
    queryKey: TRACKING_QUERY_KEYS.activity(userId, params),
    queryFn: async () => {
      if (!userId) return null
      return await trackingService.getUserActivity(userId, params)
    },
    enabled: (options?.enabled ?? true) && Boolean(userId),
    staleTime: 10 * 1000,
  })
}

/**
 * Hook to retrieve cursor-based infinite paginated user activity events.
 */
export function useUserActivityInfiniteQuery(
  userId: string,
  limit = 20,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: TRACKING_QUERY_KEYS.activityInfinite(userId, limit),
    queryFn: async ({ pageParam }) => {
      return await trackingService.getUserActivity(userId, {
        cursor: pageParam as string | undefined,
        limit,
      })
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: (options?.enabled ?? true) && Boolean(userId),
    staleTime: 10 * 1000,
  })
}
