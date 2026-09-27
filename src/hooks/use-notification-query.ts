/**
 * @file use-notification-query.ts
 * @description TanStack React Query hooks for Notifications & Communication Operations.
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notificationService } from "@/services/notification.service"
import { notificationAudio } from "@/lib/notification-sound"
import type {
  NotificationSendPayload,
  RegisterDevicePayload,
  UnregisterDevicePayload,
  AdminNotificationFilters,
} from "@/types/notification"

export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  unreadCount: () => [...NOTIFICATION_QUERY_KEYS.all, "unread-count"] as const,
  myFeed: (limit?: number) => [...NOTIFICATION_QUERY_KEYS.all, "feed", limit] as const,
  adminOverview: () => [...NOTIFICATION_QUERY_KEYS.all, "admin", "overview"] as const,
  adminList: (filters?: AdminNotificationFilters) =>
    [...NOTIFICATION_QUERY_KEYS.all, "admin", "list", filters] as const,
  devices: () => [...NOTIFICATION_QUERY_KEYS.all, "devices"] as const,
  preferences: () => [...NOTIFICATION_QUERY_KEYS.all, "preferences"] as const,
}

/**
 * Hook to fetch unread notification count for the authenticated user
 * Endpoint: GET /api/v1/notifications/unread-count
 */
export function useUnreadCountQuery() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    queryFn: async () => {
      const response = await notificationService.getUnreadCount()
      return response.data?.unreadCount ?? 0
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to fetch user's personal in-app notification feed
 * Endpoint: GET /api/v1/notifications?limit=10
 */
export function useMyNotificationsQuery(limit = 10) {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.myFeed(limit),
    queryFn: async () => {
      const response = await notificationService.getMyNotifications(limit)
      return response.data
    },
    staleTime: 15 * 1000,
  })
}

/**
 * Hook to mark a single notification as read
 * Endpoint: PATCH /api/v1/notifications/:id/read
 */
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount() })
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATION_QUERY_KEYS.all, "feed"] })
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.adminOverview() })
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATION_QUERY_KEYS.all, "admin", "list"] })
    },
  })
}

/**
 * Hook to mark all notifications as read
 * Endpoint: POST /api/v1/notifications/mark-all-read
 */
export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount() })
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATION_QUERY_KEYS.all, "feed"] })
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.adminOverview() })
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATION_QUERY_KEYS.all, "admin", "list"] })
    },
  })
}


/**
 * Hook to fetch aggregated admin notification KPIs & channel metrics
 * Endpoint: GET /api/v1/notifications/admin/overview
 */
export function useAdminNotificationOverviewQuery() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.adminOverview(),
    queryFn: async () => {
      const response = await notificationService.getAdminOverview()
      return response.data
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to query all platform notifications with filters
 * Endpoint: GET /api/v1/notifications/admin
 */
export function useAdminNotificationsQuery(filters?: AdminNotificationFilters) {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.adminList(filters),
    queryFn: async () => {
      const response = await notificationService.listAllNotifications(filters)
      return response.data
    },
    staleTime: 15 * 1000,
  })
}


/**
 * Hook to dispatch multi-channel notifications
 */
export function useSendNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: NotificationSendPayload) =>
      notificationService.sendNotification(payload),
    onSuccess: () => {
      // Play audio chime for successfully dispatched notification
      notificationAudio.playChime()
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all })
    },
  })
}

/**
 * Hook to retry a failed notification delivery
 */
export function useRetryNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.retryNotification(id),
    onSuccess: () => {
      notificationAudio.playChime()
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all })
    },
  })
}

/**
 * Hook to fetch active registered devices for the current user
 * Endpoint: GET /api/v1/notifications/devices
 */
export function useRegisteredDevicesQuery() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.devices(),
    queryFn: async () => {
      const response = await notificationService.listDevices()
      return response.data?.devices ?? []
    },
    staleTime: 60 * 1000,
  })
}

/**
 * Hook to fetch notification preferences for the current user
 * Endpoint: GET /api/v1/notifications/preferences
 */
export function useNotificationPreferencesQuery() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.preferences(),
    queryFn: async () => {
      const response = await notificationService.getPreferences()
      return response.data
    },
    staleTime: 60 * 1000,
  })
}

/**
 * Hook to register or update an FCM device token
 * Endpoint: POST /api/v1/notifications/devices
 */
export function useRegisterDeviceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterDevicePayload) =>
      notificationService.registerDevice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.devices() })
    },
  })
}

/**
 * Hook to unregister an FCM device token
 * Endpoint: DELETE /api/v1/notifications/devices
 */
export function useUnregisterDeviceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UnregisterDevicePayload) =>
      notificationService.unregisterDevice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.devices() })
    },
  })
}

