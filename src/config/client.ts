/**
 * @file client.ts
 * @description Configured Axios HTTP client with request token injection and silent token refresh queue.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { useUserStore } from "@/store/user.store"
import type { ApiResponse, RefreshResponseData } from "@/types/auth"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://meeo-server.onrender.com/api"

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

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useUserStore.getState().accessToken
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 & Silent Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/verify-otp") ||
      originalRequest.url?.includes("/auth/reset-password")

    // Handle 401 Unauthorized for non-auth requests
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue the request until token refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const storedRefreshToken = useUserStore.getState().refreshToken

        if (!storedRefreshToken) {
          throw new Error("No refresh token available in storage")
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedRefreshToken}`,
          "x-refresh-token": storedRefreshToken,
        }

        const body = {
          refreshToken: storedRefreshToken,
          refresh_token: storedRefreshToken,
          token: storedRefreshToken,
        }

        // Attempt silent token refresh
        let refreshResponse
        try {
          refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, body, {
            withCredentials: true,
            headers,
          })
        } catch (initialErr: any) {
          // If /auth/refresh returns 404, fallback to /v1/auth/refresh
          if (initialErr.response?.status === 404) {
            refreshResponse = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, body, {
              withCredentials: true,
              headers,
            })
          } else {
            throw initialErr
          }
        }

        const resData: any = refreshResponse.data?.data || refreshResponse.data || {}

        const newAccessToken: string | null =
          resData.accessToken ||
          resData.tokens?.accessToken ||
          resData.access_token ||
          resData.token ||
          (typeof resData === "string" ? resData : null)

        const newRefreshToken: string | null =
          resData.refreshToken ||
          resData.tokens?.refreshToken ||
          resData.refresh_token ||
          storedRefreshToken

        if (newAccessToken) {
          useUserStore.getState().setTokens(newAccessToken, newRefreshToken || storedRefreshToken)
          processQueue(null, newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        } else {
          throw new Error("Invalid token format received from refresh endpoint")
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        useUserStore.getState().logout()

        // Redirect to login only if in browser and not already on auth page
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = `/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
