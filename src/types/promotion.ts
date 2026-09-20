/**
 * @file promotion.ts
 * @description Centralized TypeScript type definitions for E-commerce Promotions & Campaign Rules.
 * Covers discount types, lifecycle statuses, stacking rules, customer segments, form values, DTOs, and API responses.
 */

/**
 * Supported promotion discount computation types
 */
export type PromotionType =
  | "PERCENTAGE"
  | "FIXED_DISCOUNT"
  | "BUY_X_GET_Y"
  | "FREE_SHIPPING"
  | "PRODUCT_DISCOUNT"
  | "CATEGORY_DISCOUNT"
  | "BRAND_DISCOUNT"
  | "FLASH_SALE"

/**
 * Promotion campaign lifecycle states
 */
export type PromotionStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED"
  | "ARCHIVED"

/**
 * Stacking rules determining how promotion interacts with other discounts
 */
export type StackingRule =
  | "EXCLUSIVE"
  | "STACKABLE_WITH_OTHERS"
  | "STACKABLE_WITH_COUPONS"

/**
 * Target audience customer segments
 */
export type CustomerSegment =
  | "ALL"
  | "FIRST_TIME_BUYER"
  | "VIP"
  | "RETURNING"
  | "REGISTERED"

/**
 * Form values interface for creating or updating a promotion
 */
export interface CreatePromotionFormValues {
  name: string
  slug: string
  description?: string | null
  code?: string | null
  type: PromotionType
  status: PromotionStatus
  priority: number
  isStackable: boolean
  stackingRule: StackingRule
  isAutomatic: boolean
  customerSegment: CustomerSegment
  firstOrderOnly: boolean

  // Discount values
  discountValue?: number | null
  maxDiscountAmount?: number | null
  minOrderSubtotal?: number | null
  minQuantity?: number | null

  // BxGy fields (Required if type === 'BUY_X_GET_Y')
  buyXQuantity?: number | null
  getYQuantity?: number | null
  getYDiscountPercentage?: number | null

  // Scheduling
  startsAt?: string | null // ISO Date String
  endsAt?: string | null   // ISO Date String
  timeOfDayStart?: string | null // Format "HH:mm" (e.g. "14:00")
  timeOfDayEnd?: string | null   // Format "HH:mm" (e.g. "16:00")
  daysOfWeek?: number[]          // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Limits
  totalUsageLimit?: number | null
  userUsageLimit?: number | null

  // Targeting scope (UUIDs)
  targetProductIds?: string[]
  targetCategoryIds?: string[]
  targetBrandIds?: string[]
  excludedProductIds?: string[]
  excludedCategoryIds?: string[]

  metadata?: Record<string, any> | null
}

/**
 * Initial empty state for promotion creation forms
 */
export const initialPromotionFormState: CreatePromotionFormValues = {
  name: "",
  slug: "",
  description: "",
  code: "",
  type: "PERCENTAGE",
  status: "DRAFT",
  priority: 0,
  isStackable: false,
  stackingRule: "EXCLUSIVE",
  isAutomatic: false,
  customerSegment: "ALL",
  firstOrderOnly: false,
  discountValue: null,
  maxDiscountAmount: null,
  minOrderSubtotal: null,
  minQuantity: null,
  buyXQuantity: null,
  getYQuantity: null,
  getYDiscountPercentage: 100,
  startsAt: null,
  endsAt: null,
  timeOfDayStart: null,
  timeOfDayEnd: null,
  daysOfWeek: [],
  totalUsageLimit: null,
  userUsageLimit: null,
  targetProductIds: [],
  targetCategoryIds: [],
  targetBrandIds: [],
  excludedProductIds: [],
  excludedCategoryIds: [],
  metadata: null,
}

/**
 * Minimal payload for quick promotion creation
 */
export interface MinimalCreatePromotionPayload {
  name: string
  slug: string
  type: PromotionType
  discountValue?: number | string | null
}

/**
 * Full payload for creating a new promotional campaign
 */
export type CreatePromotionPayload = Partial<CreatePromotionFormValues> & MinimalCreatePromotionPayload

/**
 * Payload for updating an existing promotional campaign
 */
export type UpdatePromotionPayload = Partial<CreatePromotionFormValues>

/**
 * Promotion Creator metadata
 */
export interface PromotionCreator {
  id: string
  firstName: string
  lastName: string
  email: string
}

/**
 * Promotion redemption statistics and audit metrics
 */
export interface PromotionStats {
  totalRedemptions: number
  totalDiscountGiven: number
  averageDiscount: number
  recentUsages?: Array<{
    id: string
    orderId: string
    orderNumber?: string
    discountAmount: number
    createdAt: string
    user?: {
      id: string
      name?: string
      email?: string
    }
  }>
}

/**
 * Item representation in the paginated promotion list
 */
export interface PromotionListItem {
  id: string
  name: string
  slug: string
  code?: string | null
  type: PromotionType
  status: PromotionStatus
  priority: number
  isStackable: boolean
  isAutomatic: boolean
  discountValue?: string | number | null
  currentUsageCount: number
  totalUsageLimit?: number | null
  userUsageLimit?: number | null
  startsAt?: string | null
  endsAt?: string | null
  createdAt?: string
  updatedAt?: string
  _count?: {
    usages: number
  }
}

/**
 * Detailed promotion entity specification
 */
export interface PromotionDetail extends Partial<CreatePromotionFormValues> {
  id: string
  name: string
  slug: string
  code?: string | null
  description?: string | null
  type: PromotionType
  status: PromotionStatus
  priority: number
  currentUsageCount: number
  creator?: PromotionCreator | null
  stats?: PromotionStats | null
  createdAt?: string
  updatedAt?: string
}

/**
 * Query parameters for filtering and paginating promotions
 */
export interface PromotionQueryParams {
  search?: string
  type?: PromotionType | string
  status?: PromotionStatus | string
  isAutomatic?: boolean | string
  customerSegment?: CustomerSegment | string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

/**
 * Payload for toggling promotion status directly
 */
export interface TogglePromotionStatusPayload {
  status: PromotionStatus
}

/**
 * Pagination metadata envelope
 */
export interface PromotionPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Response data payload for GET /api/v1/promotions
 */
export interface PromotionListResponseData {
  promotions: PromotionListItem[]
  pagination: PromotionPagination
}

/**
 * Standard API response envelope from the Promotions API
 */
export interface PromotionApiResponse<T> {
  status: "success" | "error"
  message?: string
  data: T
  statusCode?: number
}
