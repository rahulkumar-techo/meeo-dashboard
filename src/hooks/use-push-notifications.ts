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
  requestWebPushToken,
  unregisterWebPushToken,
  onForegroundPushMessage,
  PushPermissionStatus,
} from "@/lib/push-notifications"
import {
  useRegisteredDevicesQuery,
  useRegisterDeviceMutation,
  useUnregisterDeviceMutation,
} from "@/hooks/use-notification-query"
import { notificationAudio } from "@/lib/notification-sound"

export function usePushNotifications() {
  const [permission, setPermission] = React.useState<PushPermissionStatus>("default")
  const [cachedToken, setCachedToken] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const registerDeviceMutation = useRegisterDeviceMutation()
  const unregisterDeviceMutation = useUnregisterDeviceMutation()
  const devicesQuery = useRegisteredDevicesQuery()

  // Initialize permission state, foreground listener, and silently validate token on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return

    const currentPerm = getPushPermissionStatus()
    setPermission(currentPerm)
    const localToken = getLocalDeviceToken()
    setCachedToken(localToken)

    // Setup foreground message listener
    const unsubscribe = onForegroundPushMessage((payload) => {
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

    // If permission was granted, validate token with Firebase to self-heal stale cached tokens
    if (currentPerm === "granted") {
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
          } else {
            setCachedToken(null)
          }
        })
        .catch(() => {
          setCachedToken(null)
        })
    }

    return () => {
      unsubscribe()
    }
  }, [])

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
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to register push notifications."
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
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to unregister push notifications."
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
