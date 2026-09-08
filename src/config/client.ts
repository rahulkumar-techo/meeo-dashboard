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
let failedQueue: Array<{
  resolve: () => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

/**
 * Executes a token refresh attempt against POST /auth/refresh via HttpOnly cookies.
 */
export async function executeSilentRefresh(): Promise<{ success: boolean }> {
  // Directly hit the backend refresh route
  const response = await axios.post<ApiResponse<{ accessToken: string }>>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  if (response.status >= 200 && response.status < 300 && response.data?.data?.accessToken) {
    // 🔥 FIXED: Store the new fresh access token directly in the client state memory
    const newAccessToken = response.data.data.accessToken;
    
    // Yahan aapke store ke structure ke mutabik state update honi chahiye (e.g., setAccessToken method)
    // Assuming your store has a method to update the token:
    if ((useUserStore.getState() as any).setAccessToken) {
      (useUserStore.getState() as any).setAccessToken(newAccessToken);
    } else {
      // Fallback: If you only store full user state, patch it accordingly
      const currentStore = useUserStore.getState() as any;
      useUserStore.setState({ ...currentStore, accessToken: newAccessToken });
    }

    return { success: true }
  }

  throw new Error("Invalid response received from refresh endpoint")
}

// Request Interceptor: Attach Access Token from State & Handle FormData
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 🔥 FIXED: Pull access token from state memory and attach to active headers
    const state = useUserStore.getState() as any;
    const token = state?.accessToken;

    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            originalRequest._retry = true
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await executeSilentRefresh()
        processQueue(null)
        
        // 🔥 FIXED: Refresh call hone ke baad request header par naya fresh token explicitly overwrite karein
        const updatedState = useUserStore.getState() as any;
        if (updatedState?.accessToken && originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${updatedState.accessToken}`;
        }

        return apiClient(originalRequest)
      } catch (refreshError: any) {
        processQueue(refreshError)

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
    if (error.response?.status === 401 && !isAuthEndpoint) {
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
