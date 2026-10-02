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
 * Request Notification Permission and retrieve FCM Device Token directly from Firebase.
 */
export async function requestWebPushToken(forceRefresh = false): Promise<string | null> {
  if (!isPushNotificationSupported()) {
    return null
  }

  // 1. Request browser permission directly
  const permission = await Notification.requestPermission()
  if (permission !== "granted") {
    clearLocalDeviceToken()
    return null
  }

  // 2. Obtain Firebase Messaging instance
  const messaging = await getFirebaseMessaging()
  if (!messaging) return null

  if (forceRefresh) {
    clearLocalDeviceToken()
    try {
      await deleteToken(messaging)
    } catch {}
  }

  // 3. Register service worker for web push and wait until active
  let swRegistration: ServiceWorkerRegistration | undefined
  if ("serviceWorker" in navigator) {
    try {
      const swUrl = new URL("/firebase-messaging-sw.js", window.location.origin)
      if (firebaseConfig.apiKey) swUrl.searchParams.set("apiKey", firebaseConfig.apiKey)
      if (firebaseConfig.projectId) swUrl.searchParams.set("projectId", firebaseConfig.projectId)
      if (firebaseConfig.messagingSenderId) swUrl.searchParams.set("messagingSenderId", firebaseConfig.messagingSenderId)
      if (firebaseConfig.appId) swUrl.searchParams.set("appId", firebaseConfig.appId)

      swRegistration = await navigator.serviceWorker.register(
        `${swUrl.pathname}${swUrl.search}`,
        { scope: "/" }
      )
      await navigator.serviceWorker.ready
    } catch (swErr) {
      console.warn("Service worker registration skipped or failed:", swErr)
    }
  }

  // 4. Generate FCM token directly from Firebase to ensure token validity
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
    clearLocalDeviceToken()
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

/**
 * Fully reset push notification state: remove local storage token, delete token in Firebase, and unregister sw.
 */
export async function resetPushNotificationCache(): Promise<void> {
  clearLocalDeviceToken()
  try {
    const messaging = await getFirebaseMessaging()
    if (messaging) {
      await deleteToken(messaging)
    }
  } catch {}

  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const reg of registrations) {
        if (reg.active?.scriptURL?.includes("firebase-messaging-sw")) {
          await reg.unregister()
        }
      }
    } catch {}
  }
}
