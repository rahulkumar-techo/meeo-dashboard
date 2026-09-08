/**
 * @file review.ts
 * @description Centralized TypeScript type definitions for the Reviews & Ratings Moderation Admin Module.
 * Covers review status transitions, verified buyer checks, bulk moderation, and abuse/spam report resolution.
 */

/**
 * Review moderation statuses
 */
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED"

/**
 * User-flagged abuse report reasons
 */
export type ReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "INAPPROPRIATE"
  | "FAKE_REVIEW"
  | "OFF_TOPIC"
  | "OTHER"

/**
 * Abuse report lifecycle resolution status
 */
export type ReportStatus = "PENDING" | "REVIEWED" | "DISMISSED" | "ACTIONED"

/**
 * Automated moderation action when resolving abuse reports
 */
export type ReportResolutionAction =
  | "APPROVE_REVIEW"
  | "REJECT_REVIEW"
  | "DELETE_REVIEW"
  | "NO_ACTION"

/**
 * Author profile attached to reviews
 */
export interface ReviewAuthor {
  id: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  avatarUrl?: string | null
}

/**
 * Product summary attached to reviews
 */
export interface ReviewProduct {
  id: string
  name: string
  slug?: string
}

/**
 * Main Admin Review model
 */
export interface AdminReview {
  id: string
  productId: string
  userId: string
  rating: number
  title?: string | null
  content: string
  images?: string[]
  isVerifiedPurchase: boolean
  status: ReviewStatus
  moderatedBy?: string | null
  moderatedAt?: string | null
  moderationNote?: string | null
  _count?: {
    reports?: number
  }
  user?: ReviewAuthor | null
  product?: ReviewProduct | null
  createdAt: string
  updatedAt?: string
}

/**
 * User-submitted abuse & spam report
 */
export interface ReviewAbuseReport {
  id: string
  reviewId: string
  reporterId: string
  reason: ReportReason
  details?: string | null
  status: ReportStatus
  action?: ReportResolutionAction | null
  resolutionNote?: string | null
  resolvedBy?: string | null
  resolvedAt?: string | null
  createdAt: string
  reporter?: ReviewAuthor | null
  review?: AdminReview | null
}

/**
 * High-level Review Metrics
 */
export interface ReviewMetrics {
  totalReviews: number
  averageRating: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  reportedCount: number
  verifiedBuyerPercentage: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

// ---------------------------------------------------------------------------
// Request Payloads
// ---------------------------------------------------------------------------

/**
 * Payload for moderating an individual review
 * Endpoint: PATCH /api/v1/reviews/admin/:id/moderate
 */
export interface ModerateReviewPayload {
  status: "APPROVED" | "REJECTED"
  moderationNote?: string
}

/**
 * Payload for bulk moderating multiple reviews
 * Endpoint: POST /api/v1/reviews/admin/bulk-moderate
 */
export interface BulkModerateReviewsPayload {
  reviewIds: string[]
  status: "APPROVED" | "REJECTED"
  moderationNote?: string
}

/**
 * Payload for resolving an abuse report
 * Endpoint: PATCH /api/v1/reviews/admin/reports/:id/resolve
 */
export interface ResolveAbuseReportPayload {
  status: ReportStatus
  action?: ReportResolutionAction
  resolutionNote?: string
}

// ---------------------------------------------------------------------------
// Query Parameters
// ---------------------------------------------------------------------------

/**
 * Query parameters for admin reviews list
 * Endpoint: GET /api/v1/reviews/admin/all
 */
export interface AdminReviewQueryParams {
  page?: number
  limit?: number
  productId?: string
  userId?: string
  status?: ReviewStatus | string
  rating?: number
  isVerifiedPurchase?: boolean
  sortBy?: "createdAt" | "rating" | string
  sortOrder?: "asc" | "desc"
  search?: string
}

/**
 * Query parameters for pending moderation queue
 * Endpoint: GET /api/v1/reviews/admin/queue
 */
export interface ModerationQueueQueryParams {
  page?: number
  limit?: number
  productId?: string
}

/**
 * Query parameters for abuse reports list
 * Endpoint: GET /api/v1/reviews/admin/reports
 */
export interface AbuseReportsQueryParams {
  page?: number
  limit?: number
  status?: ReportStatus | string
  reason?: ReportReason | string
  reviewId?: string
  reporterId?: string
}

// ---------------------------------------------------------------------------
// API Responses
// ---------------------------------------------------------------------------

export interface ReviewApiResponse<T> {
  success: boolean
  message: string
  data: T
  statusCode?: number
}

export interface AdminReviewListResponseData {
  items: AdminReview[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AbuseReportListResponseData {
  items: ReviewAbuseReport[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface BulkModerationResponseData {
  status: ReviewStatus
  affectedCount: number
  requestedCount: number
  moderatedBy: string
  moderatedAt: string
}
