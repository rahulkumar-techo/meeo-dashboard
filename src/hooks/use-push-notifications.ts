/**
 * @file use-push-notifications.ts
 * @description React hook managing Web Push Notification permissions, FCM device token lifecycle,
 * local token caching, backend sync, and foreground message handlers.
 */

"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  isPushNotificationSupported,
  getPushPermissionStatus,
  getLocalDeviceToken,
  clearLocalDeviceToken,
  requestWebPushToken,
  unregisterWebPushToken,
  onForegroundPushMessage,
  prewarmPushServiceWorker,
  PushPermissionStatus,
} from "@/lib/push-notifications"
import {
  useRegisteredDevicesQuery,
  useRegisterDeviceMutation,
  useUnregisterDeviceMutation,
} from "@/hooks/use-notification-query"
import { useUserStore } from "@/store/user.store"
import { notificationAudio } from "@/lib/notification-sound"
import { getApiErrorMessage } from "@/lib/utils"

interface ForegroundNotificationPayload {
  notification?: {
    title?: string
    body?: string
  }
  data?: {
    title?: string
    body?: string
  }
}

export function usePushNotifications() {
  const { isAuthenticated } = useUserStore()
  const [permission, setPermission] = React.useState<PushPermissionStatus>("default")
  const [cachedToken, setCachedToken] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const registerDeviceMutation = useRegisterDeviceMutation()
  const unregisterDeviceMutation = useUnregisterDeviceMutation()
  const devicesQuery = useRegisteredDevicesQuery(Boolean(isAuthenticated))

  // Initialize permission state, pre-warm SW, and setup foreground listener
  React.useEffect(() => {
    if (typeof window === "undefined") return

    // Pre-warm push service worker and messaging in background
    prewarmPushServiceWorker()

    const currentPerm = getPushPermissionStatus()
    setPermission(currentPerm)
    const localToken = getLocalDeviceToken()

    if (currentPerm === "denied") {
      clearLocalDeviceToken()
      setCachedToken(null)
    } else {
      setCachedToken(localToken)
    }

    // Setup foreground message listener
    const unsubscribe = onForegroundPushMessage((rawPayload) => {
      const payload = rawPayload as ForegroundNotificationPayload
      const title =
        payload?.notification?.title ||
        payload?.data?.title ||
        "New Notification"
      const body =
        payload?.notification?.body ||
        payload?.data?.body ||
        "You have a new update."

      notificationAudio.playChime()
      toast.info(title, {
        description: body,
      })
    })

    // If permission was granted and user is authenticated, validate token silently in background without blocking UI
    if (currentPerm === "granted" && isAuthenticated) {
      requestWebPushToken(false)
        .then((freshToken) => {
          if (freshToken) {
            setCachedToken(freshToken)
            if (freshToken !== localToken) {
              registerDeviceMutation.mutate({
                token: freshToken,
                platform: "web",
                userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
              })
            }
          }
        })
        .catch(() => {
          // Keep existing local token; do not wipe on transient error
        })
    }

    return () => {
      unsubscribe()
    }
  }, [isAuthenticated])

  /**
   * Request push permission, get/reuse local token, and sync with backend.
   */
  const enablePushNotifications = React.useCallback(async (forceRefresh = false) => {
    if (!isPushNotificationSupported()) {
      toast.error("Push notifications are not supported in this browser.")
      return false
    }

    setIsProcessing(true)
    try {
      const token = await requestWebPushToken(forceRefresh)
      setPermission(getPushPermissionStatus())

      if (!token) {
        if (Notification.permission === "denied") {
          toast.error("Notification permission was denied in browser settings.")
        } else {
          toast.error("Failed to generate web push notification token.")
        }
        return false
      }

      setCachedToken(token)

      // Register device token with backend
      await registerDeviceMutation.mutateAsync({
        token,
        platform: "web",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      })

      toast.success("Web push notifications enabled successfully!")
      return true
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Failed to register push notifications.")
      )
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [registerDeviceMutation])

  /**
   * Unregister token on backend, remove from Firebase and local cache.
   */
  const disablePushNotifications = React.useCallback(async () => {
    setIsProcessing(true)
    try {
      const tokenToUnregister = cachedToken || getLocalDeviceToken()
      if (tokenToUnregister) {
        try {
          await unregisterDeviceMutation.mutateAsync({ token: tokenToUnregister })
        } catch {
          // Continue local cleanup even if network request fails
        }
      }

      await unregisterWebPushToken()
      setCachedToken(null)
      toast.success("Push notifications disabled for this device.")
      return true
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Failed to unregister push notifications.")
      )
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [cachedToken, unregisterDeviceMutation])

  const isCurrentDeviceRegistered = Boolean(cachedToken && permission === "granted")

  return {
    isSupported: isPushNotificationSupported(),
    permission,
    cachedToken,
    isCurrentDeviceRegistered,
    isProcessing:
      isProcessing ||
      registerDeviceMutation.isPending ||
      unregisterDeviceMutation.isPending,
    enablePushNotifications,
    disablePushNotifications,
    registeredDevices: devicesQuery.data || [],
    isLoadingDevices: devicesQuery.isLoading,
    refetchDevices: devicesQuery.refetch,
  }
}
