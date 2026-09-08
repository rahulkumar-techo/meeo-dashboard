/**
 * @file use-notification-query.ts
 * @description TanStack React Query hooks for Notifications & Communication Operations.
 */

"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationService } from "@/services/notification.service"
import { notificationAudio } from "@/lib/notification-sound"
import type { NotificationSendPayload } from "@/types/notification"

export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  logs: () => [...NOTIFICATION_QUERY_KEYS.all, "logs"] as const,
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
