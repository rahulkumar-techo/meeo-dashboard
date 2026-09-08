/**
 * @file settings.ts
 * @description Type definitions for Platform System Settings, Governance, Feature Flags, and Emergency Controls.
 */

export interface FeatureFlags {
  enableReviews: boolean
  enableCoupons: boolean
  enableWishlists: boolean
  enableGuestCheckout: boolean
  enableExpressPay: boolean
  enableAiSearch: boolean
  [key: string]: boolean | undefined
}

export interface PercentageFeatureRollout {
  newCheckoutFunnel?: number // 0-100
  aiProductRecommendations?: number // 0-100
  [key: string]: number | undefined
}

export interface EmergencyControls {
  killSwitchActive: boolean
  emergencyMessage: string | null
  frozenAt: string | null
}

export type SettlementFrequency = "DAILY" | "WEEKLY" | "BI_WEEKLY" | "MONTHLY"

export interface SystemSettings {
  // Tier 1 — Core Platform, Brand & Communication
  platformBrandName: string
  publicDomainUrl: string
  supportEmail: string
  operationsEmail: string
  securityEmail: string
  requireAdmin2FA: boolean
  defaultCurrency: string
  timezone: string

  // Operational Modes & Protective Toggles
  maintenanceMode: boolean
  readOnlyMode: boolean
  disableCheckout: boolean
  disablePayments: boolean

  // Dynamic Rate Limiting
  globalApiRateLimit: number
  loginRateLimit: number
  checkoutRateLimit: number

  // Feature Flags & Canary Percentage Rollout
  featureFlags: FeatureFlags
  percentageFeatureRollout: PercentageFeatureRollout

  // Tier 2 — Financial Rules & Settlement Policies
  settlementFrequency: SettlementFrequency
  settlementDelayDays: number
  minimumPayoutAmount: number
  reservePercentage: number
  refundApprovalThreshold: number
  automatedPayouts: boolean

  // Tier 3 — Advanced, Security & Emergency Controls
  allowedMaintenanceIps: string[]
  emergencyControls: EmergencyControls
  dataRetentionDays: number
}

export type UpdateSystemSettingsPayload = Partial<SystemSettings>

export interface EmergencyKillSwitchPayload {
  killSwitchActive: boolean
  emergencyMessage?: string | null
}

export interface SettingsApiResponse<T> {
  success: boolean
  status: string
  message?: string
  data: T
}
