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

export interface VerifyResetOtpPayload {
  email: string
  otp: string
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

export interface GoogleSignInPayload {
  idToken: string
  deviceName: string
  deviceId: string
}

export interface SetPasswordPayload {
  password: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface LinkGooglePayload {
  idToken: string
}

export type AuthProviderType = "PASSWORD" | "GOOGLE"

export interface AuthAccount {
  provider: AuthProviderType
  createdAt: string
  lastUsedAt?: string | null
}

export interface AuthAccountsResponse {
  accounts: AuthAccount[]
}

export interface UserSessionDevice {
  id: string
  deviceName?: string | null
  deviceId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  lastUsedAt?: string | null
  createdAt?: string
  isCurrent?: boolean
  expiresAt?: string
}

export interface UserSessionsListResponse {
  sessions: UserSessionDevice[]
}