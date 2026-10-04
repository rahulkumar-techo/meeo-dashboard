"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authService } from "@/services/auth.service"
import { useUserStore } from "@/store/user.store"
import type {
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyResetOtpPayload,
} from "@/types/auth"

export const AUTH_QUERY_KEY = ["auth", "currentUser"]

/**
 * Hook to query and cache current authenticated user profile using TanStack Query.
 */
export function useCurrentUserQuery() {
  const { isAuthenticated, setUser } = useUserStore()

  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await authService.getMe()
        if (res.success && res.data) {
          setUser(res.data)
          return res.data
        }
        return null
      } catch (err) {
        // Return null gracefully without failing entire page rendering
        return null
      }
    },
    enabled: Boolean(isAuthenticated),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}


/**
 * Mutation for user login.
 */
export function useLoginMutation() {
  const queryClient = useQueryClient()
  const { setAuth } = useUserStore()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      return await authService.login(payload)
    },
    onSuccess: (response: any) => {
      const data = response?.data || response
      const user = data?.user || (data?.email ? data : null)
      const accessToken = data?.accessToken

      if (user) {
        setAuth(user, accessToken)
        queryClient.setQueryData(AUTH_QUERY_KEY, user)
      }
    },
  })
}

/**
 * Mutation for Route 1: POST /api/v1/auth/register
 * - Registers new account or refreshes unverified user details & OTP.
 */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      return await authService.register(payload)
    },
  })
}

/**
 * Mutation for Route 2: POST /api/v1/auth/verify-otp
 * - Validates account activation code against Keys.USER_OTP(email).
 */
export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: async (payload: VerifyOtpPayload) => {
      return await authService.verifyOtp(payload)
    },
  })
}

/**
 * Mutation for Route 3: POST /api/v1/auth/resend-otp
 * - Resends account activation OTP (Keys.USER_OTP) for /verify-otp screen.
 * - Rejects with 404 if user not found, 400 if already verified.
 */
export function useResendOtpMutation() {
  return useMutation({
    mutationFn: async (payload: ResendOtpPayload) => {
      return await authService.resendOtp(payload)
    },
  })
}

/**
 * Mutation for Route 4: POST /api/v1/auth/forgot-password
 * - Sends or resends password recovery code against Keys.PASSWORD_RESET_OTP(email).
 * - Used on /forgot-password AND as resend in Step 1 of /reset-password.
 */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      return await authService.forgotPassword(payload)
    },
  })
}

/**
 * Mutation for Route 5: POST /api/v1/auth/verify-reset-otp
 * - Non-destructive validation of Keys.PASSWORD_RESET_OTP(email) in Step 1 of /reset-password.
 */
export function useVerifyResetOtpMutation() {
  return useMutation({
    mutationFn: async (payload: VerifyResetOtpPayload) => {
      return await authService.verifyResetOtp(payload)
    },
  })
}

/**
 * Mutation for Route 6: POST /api/v1/auth/reset-password
 * - Finalizes password reset with verified OTP and revokes all active sessions.
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      return await authService.resetPassword(payload)
    },
  })
}

/**
 * Mutation for user logout (current device).
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const { logout } = useUserStore()

  return useMutation({
    mutationFn: async () => {
      return await authService.logout()
    },
    onSettled: () => {
      logout()
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY })
      queryClient.clear()
    },
  })
}

/**
 * Mutation for global user logout from all connected devices.
 */
export function useLogoutAllMutation() {
  const queryClient = useQueryClient()
  const { logout } = useUserStore()

  return useMutation({
    mutationFn: async () => {
      return await authService.logoutAll()
    },
    onSettled: () => {
      logout()
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY })
      queryClient.clear()
    },
  })
}

