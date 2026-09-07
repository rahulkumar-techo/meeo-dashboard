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

        // Attempt silent token refresh
        const refreshResponse = await axios.post<ApiResponse<RefreshResponseData>>(
          `${API_BASE_URL}/auth/refresh`,
          storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        )

        const newAccessToken =
          refreshResponse.data?.data?.accessToken ||
          (refreshResponse.data as unknown as RefreshResponseData)?.accessToken
        const newRefreshToken =
          refreshResponse.data?.data?.refreshToken ||
          (refreshResponse.data as unknown as RefreshResponseData)?.refreshToken

        if (newAccessToken) {
          useUserStore.getState().setTokens(newAccessToken, newRefreshToken)
          processQueue(null, newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        } else {
          throw new Error("No access token returned from refresh")
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        useUserStore.getState().logout()

        // Redirect to login if in browser
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
