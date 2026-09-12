/**
 * @file auth.ts
 * @description Type definitions for Authentication, User sessions, and API request/response payloads.
 */

export interface AuthRoleDetailPermission {
  id: string
  name: string
  description?: string
}

export interface AuthRoleDetail {
  id: string
  name: string
  description?: string
  permissions?: AuthRoleDetailPermission[]
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  avatarUrl?: string | null
  avatar?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  isVerified?: boolean
  status?: string
  role?: string
  roles?: string[]
  permissions?: string[]
  roleDetails?: AuthRoleDetail[]
  createdAt?: string
  updatedAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string | string[]>
}

export interface LoginPayload {
  email: string
  password: string
  deviceName?: string
  deviceId?: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface ResendOtpPayload {
  email: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  otp: string
  password: string
}

export interface AuthResponseData {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface RefreshResponseData {
  accessToken: string
  refreshToken: string
}
