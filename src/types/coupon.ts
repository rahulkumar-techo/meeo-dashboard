/**
 * @file coupon.ts
 * @description Centralized TypeScript type definitions for Coupons & Promotional Campaigns.
 * Models discount calculations, rule constraints, usage limits, audit ledgers, and marketing performance metrics.
 */

/**
 * Supported coupon discount types
 */
export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING"

/**
 * Coupon campaign lifecycle states
 */
export type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED"

/**
 * Core Coupon Record
 */
export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  minimumOrderAmount?: number | null
  maximumDiscountAmount?: number | null
  usageLimit?: number | null
  usageLimitPerUser?: number | null
  startsAt?: string | null
  expiresAt?: string | null
  status: CouponStatus
  _count?: {
    usages: number
  }
  createdAt: string
  updatedAt: string
}

/**
 * Associated order summary in coupon usage audit
 */
export interface CouponUsageOrder {
  id: string
  orderNumber: string
  status?: string
  grandTotal?: number
  createdAt: string
}

/**
 * Single coupon redemption record
 */
export interface CouponUsage {
  id: string
  couponId: string
  orderId: string
  userId?: string | null
  discountAmount: number
  createdAt: string
  coupon?: {
    id: string
    code: string
    type: CouponType
    value: number
  }
  order?: CouponUsageOrder
}

/**
 * Detailed Coupon Specification with recent order redemptions
 */
export interface CouponDetail extends Coupon {
  usages?: CouponUsage[]
}

/**
 * Marketing performance summary metrics
 */
export interface CouponMetricsSummary {
  totalCoupons: number
  activeCoupons: number
  inactiveCoupons: number
  expiredCoupons: number
  totalRedemptions: number
  totalDiscountGiven: number
  averageDiscountPerOrder: number
}

/**
 * Top performing coupon item
 */
export interface TopCouponItem {
  id: string
  code: string
  type: CouponType
  value: number
  status: CouponStatus
  redemptionCount: number
}

/**
 * Response payload for GET /api/v1/coupons/metrics
 */
export interface CouponMetricsResponseData {
  summary: CouponMetricsSummary
  topCoupons: TopCouponItem[]
  generatedAt: string
}

/**
 * Query parameters for listing promotional coupons
 */
export interface CouponQueryParams {
  search?: string
  type?: CouponType | string
  status?: CouponStatus | string
  page?: number
  limit?: number
}

/**
 * Payload for creating a new promotional coupon
 */
export interface CreateCouponPayload {
  code: string
  type: CouponType
  value: number
  minimumOrderAmount?: number | null
  maximumDiscountAmount?: number | null
  usageLimit?: number | null
  usageLimitPerUser?: number | null
  startsAt?: string | null
  expiresAt?: string | null
  status?: CouponStatus
}

/**
 * Payload for updating an existing coupon
 */
export interface UpdateCouponPayload {
  code?: string
  type?: CouponType
  value?: number
  minimumOrderAmount?: number | null
  maximumDiscountAmount?: number | null
  usageLimit?: number | null
  usageLimitPerUser?: number | null
  startsAt?: string | null
  expiresAt?: string | null
  status?: CouponStatus
}

/**
 * Payload for toggling coupon status
 */
export interface ToggleCouponStatusPayload {
  status: CouponStatus
}

/**
 * Response payload for deleting or archiving a coupon
 */
export interface DeleteCouponResponseData {
  deleted: boolean
  archived: boolean
  id: string
}

/**
 * Paginated pagination metadata
 */
export interface CouponPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Paginated list response wrapper
 */
export interface CouponListResponseData {
  items: Coupon[]
  pagination: CouponPagination
}

/**
 * Paginated usages list response wrapper
 */
export interface CouponUsagesResponseData {
  items: CouponUsage[]
  pagination: CouponPagination
}

/**
 * Generic API response envelope from coupons backend
 */
export interface CouponApiResponse<T> {
  status: "success" | "error"
  message?: string
  data: T
  statusCode?: number
}
