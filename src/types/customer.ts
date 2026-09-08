/**
 * @file customer.ts
 * @description Centralized TypeScript type definitions for the Customer Management & 360 Intelligence Module.
 * Covers customer profiles, loyalty tiers, fraud risk score engine, engagement analytics, and active session management.
 */

/**
 * Customer Account Status
 */
export type CustomerStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "BLOCKED"
  | "PENDING_VERIFICATION"

/**
 * Ecommerce VIP Loyalty Tier based on lifetime spend
 */
export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"

/**
 * Dynamic Fraud Risk Level
 */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

/**
 * Main Customer entity with ecommerce intelligence
 */
export interface AdminCustomer {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  avatarUrl?: string | null
  status: CustomerStatus
  emailVerified: boolean
  phoneVerified: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt?: string
  roles: string[]
  totalOrders: number
  totalSpend: number
  tier: LoyaltyTier
  riskScore: number
  riskLevel: RiskLevel
  riskFlag: boolean
  actionNeeded: boolean
  lastOrderDate?: string | null
}

/**
 * Customer Metrics & High-Level KPIs
 */
export interface CustomerMetrics {
  totalCustomers: number
  activeCustomers: number
  newCustomersThisMonth: number
  repeatPurchaseRate: number
  averageLifetimeValue: number
  riskFlaggedAccounts: number
  statusDistribution: {
    ACTIVE?: number
    SUSPENDED?: number
    BLOCKED?: number
    PENDING_VERIFICATION?: number
    [key: string]: number | undefined
  }
  tierDistribution: {
    BRONZE?: number
    SILVER?: number
    GOLD?: number
    PLATINUM?: number
    [key: string]: number | undefined
  }
}

/**
 * Saved shipping address in 360 view
 */
export interface CustomerAddress {
  id: string
  recipientName: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  createdAt: string
}

/**
 * Recent order snapshot in 360 view
 */
export interface CustomerRecentOrder {
  id: string
  orderNumber: string
  status: string
  grandTotal: number
  itemCount: number
  items?: Array<{
    id: string
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  createdAt: string
}

/**
 * Recent product review in 360 view
 */
export interface CustomerRecentReview {
  id: string
  product: {
    id: string
    name: string
    slug: string
  }
  rating: number
  title?: string | null
  comment?: string | null
  status: string
  createdAt: string
}

/**
 * Active login session device
 */
export interface CustomerActiveSession {
  id: string
  ipAddress: string
  userAgent: string
  createdAt: string
  lastUsedAt: string
  expiresAt: string
}

/**
 * Complete 360-Degree Customer Intelligence View
 */
export interface Customer360Intelligence {
  profile: {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    avatarUrl?: string | null
    status: CustomerStatus
    emailVerified: boolean
    phoneVerified: boolean
    createdAt: string
    updatedAt?: string
    lastLoginAt?: string | null
    roles: string[]
  }
  summary: {
    tier: LoyaltyTier
    totalSpend: number
    totalOrders: number
    completedOrders: number
    cancelledOrders: number
    averageOrderValue: number
    riskScore: number
    riskLevel: RiskLevel
    riskFlag: boolean
    actionNeeded: boolean
  }
  engagement: {
    totalReviews: number
    averageRatingGiven: number
    activeCartItemsCount: number
    wishlistItemsCount: number
  }
  addresses: CustomerAddress[]
  recentOrders: CustomerRecentOrder[]
  recentReviews: CustomerRecentReview[]
  activeSessions: CustomerActiveSession[]
}

// ---------------------------------------------------------------------------
// Request Payloads
// ---------------------------------------------------------------------------

/**
 * Payload for changing customer account status
 * Endpoint: PATCH /api/v1/user/admin/:userId/status
 */
export interface UpdateCustomerStatusPayload {
  status: CustomerStatus
  reason?: string
}

/**
 * Payload for editing user profile
 * Endpoint: PATCH /api/v1/user/admin/:userId
 */
export interface UpdateCustomerProfilePayload {
  firstName?: string
  lastName?: string
  status?: CustomerStatus
}

// ---------------------------------------------------------------------------
// Query Parameters
// ---------------------------------------------------------------------------

/**
 * Query parameters for admin customer list
 * Endpoint: GET /api/v1/user/admin
 */
export interface CustomerQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: CustomerStatus | string
  tier?: LoyaltyTier | string
  riskFlagOnly?: boolean
  sortBy?: "createdAt" | "totalSpend" | "totalOrders" | "lastLoginAt" | "riskScore" | string
  sortOrder?: "asc" | "desc"
}

// ---------------------------------------------------------------------------
// API Responses
// ---------------------------------------------------------------------------

export interface CustomerApiResponse<T> {
  success: boolean
  message: string
  data: T
  statusCode?: number
}

export interface CustomerListResponseData {
  items: AdminCustomer[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
