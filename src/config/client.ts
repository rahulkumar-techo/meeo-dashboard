/**
 * @file client.ts
 * @description Configured Axios HTTP client with silent token refresh queue using HttpOnly cookies (withCredentials).
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { useUserStore } from "@/store/user.store"
import type { ApiResponse } from "@/types/auth"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://meeo-server.onrender.com/api/v1"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
})

// Variables for managing in-flight token refresh and request queue
let isRefreshing = false
let refreshPromise: Promise<{ success: boolean; accessToken: string }> | null = null
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  if (!config.headers) return
  if (typeof (config.headers as any).set === "function") {
    config.headers.set("Authorization", `Bearer ${token}`)
  } else {
    config.headers["Authorization"] = `Bearer ${token}`
  }
}

/**
 * Executes a token refresh attempt against POST /auth/refresh via HttpOnly cookies.
 * Deduplicates concurrent refresh attempts using a shared promise.
 */
export async function executeSilentRefresh(): Promise<{ success: boolean; accessToken: string }> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const token =
        response.data?.data?.accessToken ||
        (response.data as any)?.accessToken ||
        (response.data as any)?.token

      if (response.status >= 200 && response.status < 300 && token) {
        const refreshedUser = response.data?.data?.user || (response.data as any)?.user

        useUserStore.setState((prev) => ({
          ...prev,
          accessToken: token,
          isAuthenticated: true,
          ...(refreshedUser ? { user: { ...prev.user, ...refreshedUser } } : {}),
        }))

        return { success: true, accessToken: token }
      }

      throw new Error("Invalid response received from refresh endpoint")
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/verify-otp") ||
    url.includes("/auth/reset-password")
  )
}

function decodeBase64(str: string): string {
  try {
    if (typeof atob === "function") {
      return atob(str)
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(str, "base64").toString("utf-8")
    }
  } catch {
    return ""
  }
  return ""
}

/**
 * Extracts expiration timestamp (exp in seconds) from a JWT token.
 */
export function parseJwtExp(token: string): number | null {
  try {
    if (!token || typeof token !== "string") return null
    const parts = token.split(".")
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const raw = decodeBase64(base64)
    if (!raw) return null
    const payload = JSON.parse(raw)
    return typeof payload.exp === "number" ? payload.exp : null
  } catch {
    return null
  }
}

/**
 * Checks if a JWT token will expire within the given buffer window (default 60s).
 */
export function isTokenExpiringSoon(token: string, bufferSeconds = 60): boolean {
  const exp = parseJwtExp(token)
  if (!exp) return false
  const nowInSeconds = Math.floor(Date.now() / 1000)
  return exp - nowInSeconds <= bufferSeconds
}

// Request Interceptor: Pre-check token expiration (< 60s) & attach Access Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const state = useUserStore.getState() as any
    let token = state?.accessToken

    // Pre-check: If token is expiring within 60s, refresh first before sending request
    if (token && !isAuthEndpoint(config.url) && isTokenExpiringSoon(token, 60)) {
      try {
        const refreshResult = await executeSilentRefresh()
        if (refreshResult?.accessToken) {
          token = refreshResult.accessToken
        }
      } catch {
        // If pre-emptive refresh fails, proceed with existing token
      }
    }

    if (token && config.headers) {
      setAuthHeader(config, token)
    }

    // When payload is FormData, delete Content-Type so browser/Axios sets multipart/form-data with boundary
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (config.headers && typeof (config.headers as any).delete === "function") {
        config.headers.delete("Content-Type")
      } else if (config.headers) {
        delete config.headers["Content-Type"]
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 & Silent Refresh via HttpOnly cookies
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const isAuth = isAuthEndpoint(originalRequest.url)

    // Handle 401 Unauthorized for non-auth requests
    if (error.response?.status === 401 && !originalRequest._retry && !isAuth) {
      if (isRefreshing) {
        // Queue the request until token refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((freshToken) => {
            originalRequest._retry = true
            setAuthHeader(originalRequest, freshToken)
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { accessToken } = await executeSilentRefresh()
        processQueue(null, accessToken)

        setAuthHeader(originalRequest, accessToken)

        return apiClient(originalRequest)
      } catch (refreshError: any) {
        processQueue(refreshError, null)

        useUserStore.getState().logout()

        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/signup") &&
          !window.location.pathname.startsWith("/verify-otp") &&
          !window.location.pathname.startsWith("/forgot-password") &&
          !window.location.pathname.startsWith("/reset-password")
        ) {
          window.location.href = `/login?redirect=${encodeURIComponent(
            window.location.pathname + window.location.search
          )}`
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // If request already retried after refresh and still got 401
    if (error.response?.status === 401 && !isAuth && !isRefreshing) {
      useUserStore.getState().logout()
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup") &&
        !window.location.pathname.startsWith("/verify-otp") &&
        !window.location.pathname.startsWith("/forgot-password") &&
        !window.location.pathname.startsWith("/reset-password")
      ) {
        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`
      }
    }

    return Promise.reject(error)
  }
)
