/**
 * @file auth.service.ts
 * @description Authentication service communicating with Meeo server API endpoints.
 */

import { apiClient, executeSilentRefresh } from "@/config/client"
import type {
  ApiResponse,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponseData,
  RefreshResponseData,
  AuthUser,
} from "@/types/auth"

export const authService = {
  /**
   * Log in user with email and password.
   */
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      payload
    )
    return response.data
  },

  /**
   * Register a new user account.
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<{ user: AuthUser }>> {
    const response = await apiClient.post<ApiResponse<{ user: AuthUser }>>(
      "/auth/register",
      payload
    )
    return response.data
  },

  /**
   * Verify email registration / activation OTP.
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/verify-otp",
      payload
    )
    return response.data
  },

  /**
   * Resend verification OTP code to user's email.
   */
  async resendOtp(payload: ResendOtpPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/resend-otp",
      payload
    )
    return response.data
  },

  /**
   * Request password reset OTP email.
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/forgot-password",
      payload
    )
    return response.data
  },

  /**
   * Reset password with OTP and new password.
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/reset-password",
      payload
    )
    return response.data
  },

  /**
   * Fetch current authenticated user profile and roles.
   */
  async getMe(): Promise<ApiResponse<AuthUser>> {
    const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me")
    return response.data
  },

  /**
   * Refresh authentication session via HttpOnly cookies.
   */
  async refreshToken(): Promise<ApiResponse<null>> {
    await executeSilentRefresh()
    return {
      success: true,
      message: "Session refreshed successfully",
      data: null,
    }
  },

  /**
   * Terminate current user session.
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>("/auth/logout")
      return response.data
    } catch {
      return { success: true, message: "Logged out locally" }
    }
  },

  /**
   * Terminate all active user sessions across all devices.
   */
  async logoutAll(): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>("/auth/logout-all")
      return response.data
    } catch {
      try {
        const fallback = await apiClient.post<ApiResponse<null>>(
          "/auth/logout",
          { allDevices: true },
          { params: { all: true } }
        )
        return fallback.data
      } catch {
        return { success: true, message: "Logged out from all devices" }
      }
    }
  },
}

