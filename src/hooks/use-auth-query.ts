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
} from "@/types/auth"

export const AUTH_QUERY_KEY = ["auth", "currentUser"]

/**
 * Hook to query and cache current authenticated user profile using TanStack Query.
 */
export function useCurrentUserQuery() {
  const { accessToken, isAuthenticated, setUser } = useUserStore()

  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const res = await authService.getMe()
      if (res.success && res.data) {
        setUser(res.data)
        return res.data
      }
      return null
    },
    enabled: Boolean(accessToken && isAuthenticated),
    staleTime: 5 * 60 * 1000,
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
    onSuccess: (data: any) => {
      const payload = data?.data || data || {}
      const user = payload.user || payload.profile || (payload.email ? payload : null)
      const accessToken =
        payload.accessToken ||
        payload.tokens?.accessToken ||
        payload.access_token ||
        payload.token
      const refreshToken =
        payload.refreshToken ||
        payload.tokens?.refreshToken ||
        payload.refresh_token

      if (accessToken) {
        setAuth(
          user || { id: "user", email: "", firstName: "Admin", lastName: "User", isVerified: true },
          accessToken,
          refreshToken
        )
        if (user) {
          queryClient.setQueryData(AUTH_QUERY_KEY, user)
        }
      }
    },
  })
}

/**
 * Mutation for user registration.
 */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      return await authService.register(payload)
    },
  })
}

/**
 * Mutation for OTP verification.
 */
export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: async (payload: VerifyOtpPayload) => {
      return await authService.verifyOtp(payload)
    },
  })
}

/**
 * Mutation for resending OTP code.
 */
export function useResendOtpMutation() {
  return useMutation({
    mutationFn: async (payload: ResendOtpPayload) => {
      return await authService.resendOtp(payload)
    },
  })
}

/**
 * Mutation for requesting password reset OTP.
 */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      return await authService.forgotPassword(payload)
    },
  })
}

/**
 * Mutation for setting a new password with reset OTP.
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      return await authService.resetPassword(payload)
    },
  })
}

/**
 * Mutation for user logout.
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
