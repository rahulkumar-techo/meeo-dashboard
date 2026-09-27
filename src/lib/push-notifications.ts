/**
 * @file push-notifications.ts
 * @description Web Push Notification & Browser FCM Token Manager.
 * Handles permission requests, local token caching, Firebase Messaging initialization,
 * and service worker integration.
 */

import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getMessaging,
  getToken,
  deleteToken,
  onMessage,
  isSupported,
  Messaging,
} from "firebase/messaging"
import firebaseConfig, { FIREBASE_VAPID_KEY } from "@/config/firebase.config"

const FCM_TOKEN_STORAGE_KEY = "meeo_fcm_token"

export type PushPermissionStatus =
  | "granted"
  | "denied"
  | "default"
  | "unsupported"

/**
 * Check if the current browser environment supports Push Notifications & Service Workers.
 */
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  )
}

/**
 * Get current browser notification permission status.
 */
export function getPushPermissionStatus(): PushPermissionStatus {
  if (!isPushNotificationSupported()) {
    return "unsupported"
  }
  return Notification.permission
}

/**
 * Retrieve cached device token from localStorage to prevent generating duplicate tokens.
 */
export function getLocalDeviceToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(FCM_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Save device token to localStorage.
 */
export function setLocalDeviceToken(token: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token)
  } catch {
    // Ignore storage quota or access errors
  }
}

/**
 * Remove device token from localStorage.
 */
export function clearLocalDeviceToken(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}

/**
 * Initialize Firebase app instance safely.
 */
function getFirebaseAppInstance() {
  if (getApps().length > 0) {
    return getApp()
  }
  return initializeApp(firebaseConfig)
}

/**
 * Initialize Firebase Messaging instance. Returns null if not supported or running server-side.
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!isPushNotificationSupported()) return null
  try {
    const supported = await isSupported()
    if (!supported) return null
    const app = getFirebaseAppInstance()
    return getMessaging(app)
  } catch (err) {
    console.warn("Failed to initialize Firebase Messaging:", err)
    return null
  }
}

/**
 * Request Notification Permission and retrieve FCM Device Token.
 * If already cached locally and permission is granted, returns cached token immediately.
 */
export async function requestWebPushToken(forceRefresh = false): Promise<string | null> {
  if (!isPushNotificationSupported()) {
    return null
  }

  // 1. Check existing local cache if forceRefresh is false
  if (!forceRefresh) {
    const cachedToken = getLocalDeviceToken()
    if (cachedToken && Notification.permission === "granted") {
      return cachedToken
    }
  }

  // 2. Request browser permission directly
  const permission = await Notification.requestPermission()
  if (permission !== "granted") {
    clearLocalDeviceToken()
    return null
  }

  // 3. Obtain Firebase Messaging instance
  const messaging = await getFirebaseMessaging()
  if (!messaging) return null

  // 4. Register service worker for web push
  let swRegistration: ServiceWorkerRegistration | undefined
  if ("serviceWorker" in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      )
    } catch (swErr) {
      console.warn("Service worker registration skipped or failed:", swErr)
    }
  }

  // 5. Generate FCM token
  try {
    const token = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY || undefined,
      serviceWorkerRegistration: swRegistration,
    })

    if (token) {
      setLocalDeviceToken(token)
      return token
    }
  } catch (tokenErr) {
    console.error("Failed to generate FCM web token:", tokenErr)
  }

  return null
}

/**
 * Unregister FCM push token in Firebase and remove from local storage.
 */
export async function unregisterWebPushToken(): Promise<string | null> {
  const currentToken = getLocalDeviceToken()
  try {
    const messaging = await getFirebaseMessaging()
    if (messaging) {
      await deleteToken(messaging)
    }
  } catch (err) {
    console.warn("Error deleting Firebase FCM token:", err)
  } finally {
    clearLocalDeviceToken()
  }
  return currentToken
}

/**
 * Subscribe to foreground push messages while app is in active tab.
 */
export function onForegroundPushMessage(callback: (payload: any) => void): () => void {
  if (!isPushNotificationSupported()) return () => {}

  let unsubscribe: (() => void) | null = null

  getFirebaseMessaging().then((messaging) => {
    if (messaging) {
      unsubscribe = onMessage(messaging, (payload) => {
        callback(payload)
      })
    }
  })

  return () => {
    if (unsubscribe) {
      unsubscribe()
    }
  }
}
