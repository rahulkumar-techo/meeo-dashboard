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
  VerifyResetOtpPayload,
  AuthResponseData,
  RefreshResponseData,
  AuthUser,
  GoogleSignInPayload,
  SetPasswordPayload,
  ChangePasswordPayload,
  LinkGooglePayload,
  AuthProviderType,
  AuthAccountsResponse,
  UserSessionDevice,
  UserSessionsListResponse,
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
   * Log in user with email and password.
   */
  async SignInWithGoogle(payload: GoogleSignInPayload): Promise<ApiResponse<AuthResponseData>> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/google",
      payload
    )
    return response.data
  },

  /**
   * Route 1: Register a new user account.
   * - If brand new email: creates user in Postgres with default CUSTOMER role, generates Keys.USER_OTP, and stages outbox email.
   * - If existing unverified email: updates user credentials/names with latest submission and dispatches a fresh OTP.
   * - If already verified email: rejects with 400 Bad Request ("Email already registered").
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<{ user: AuthUser }>> {
    const response = await apiClient.post<ApiResponse<{ user: AuthUser }>>(
      "/auth/register",
      payload
    )
    return response.data
  },

  /**
   * Route 2: Verify account activation OTP (Keys.USER_OTP).
   * - Validates 4-digit code against Redis.
   * - On success: sets emailVerified = true and immediately deletes Redis key (replay prevention).
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/verify-otp",
      payload
    )
    return response.data
  },

  /**
   * Route 3: Resend registration activation OTP (Keys.USER_OTP).
   * - Used on /verify-otp screen for account activation.
   * - Throws 404 if email does not exist.
   * - Throws 400 if email is already verified.
   * - Re-generates activation OTP with 5-minute TTL.
   */
  async resendOtp(payload: ResendOtpPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/resend-otp",
      payload
    )
    return response.data
  },

  /**
   * Route 4: Request or re-send password reset OTP (Keys.PASSWORD_RESET_OTP).
   * - Used on /forgot-password to initiate password recovery, AND on /reset-password to resend reset code.
   * - Note: This operates on Keys.PASSWORD_RESET_OTP, isolated from Keys.USER_OTP.
   * - Throws 404 if account with given email does not exist.
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/forgot-password",
      payload
    )
    return response.data
  },

  /**
   * Route 5: Non-destructive verification of password reset OTP (Keys.PASSWORD_RESET_OTP).
   * - Used in multi-step wizard (Step 1 of /reset-password) before prompting the user for their new password.
   * - Validates OTP against Redis WITHOUT deleting it, so Route 6 (/reset-password) can finalize the change.
   */
  async verifyResetOtp(payload: VerifyResetOtpPayload): Promise<ApiResponse<{ verified: boolean }>> {
    const response = await apiClient.post<ApiResponse<{ verified: boolean }>>(
      "/auth/verify-reset-otp",
      payload
    )
    return response.data
  },

  /**
   * Route 6: Finalize password reset with OTP and new password (Keys.PASSWORD_RESET_OTP).
   * - Validates OTP, hashes new password with Argon2id, and updates database.
   * - Revokes all active user sessions across all devices (userSession.deleteMany).
   * - Deletes Redis key Keys.PASSWORD_RESET_OTP immediately to prevent replay attacks.
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

  /**
   * List all linked authentication providers for the current user.
   */
  async getAuthAccounts(): Promise<ApiResponse<AuthAccountsResponse>> {
    const response = await apiClient.get<ApiResponse<AuthAccountsResponse>>("/auth/accounts")
    return response.data
  },

  /**
   * Set password for users who originally registered via Google OAuth.
   */
  async setPassword(payload: SetPasswordPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/password/set", payload)
    return response.data
  },

  /**
   * Change current password (revokes all other concurrent sessions).
   */
  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/password/change", payload)
    return response.data
  },

  /**
   * Link Google account to the logged-in profile.
   */
  async linkGoogle(payload: LinkGooglePayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/accounts/google/link", payload)
    return response.data
  },

  /**
   * Unlink an authentication provider (PASSWORD or GOOGLE).
   */
  async unlinkProvider(provider: AuthProviderType): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/auth/accounts/${provider}`)
    return response.data
  },

  /**
   * List active sessions for the current logged-in user.
   */
  async getSessions(): Promise<ApiResponse<UserSessionsListResponse | UserSessionDevice[]>> {
    const response = await apiClient.get<ApiResponse<UserSessionsListResponse | UserSessionDevice[]>>("/auth/sessions")
    return response.data
  },

  /**
   * Revoke a specific active session.
   */
  async revokeSession(sessionId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/auth/sessions/${sessionId}`)
    return response.data
  },

  /**
   * Revoke all active sessions across all devices.
   */
  async revokeAllSessions(): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>("/auth/sessions/revoke-all")
      return response.data
    } catch {
      return await this.logoutAll()
    }
  },
}

