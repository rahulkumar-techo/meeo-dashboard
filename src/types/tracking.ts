/**
 * @file tracking.ts
 * @description Types for User 360 Analytics profile and cursor-based activity tracking.
 */

export interface User360Profile {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string
  phone?: string | null
  status: string
  createdAt: string
  lastLoginAt?: string | null
}

export interface User360CommerceMetrics {
  totalSpend: number
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  averageOrderValue: number
  firstOrderAt: string | null
  lastOrderAt: string | null
}

export interface User360BehaviorSummary {
  id?: string
  userId?: string
  productViews: number
  cartAdds: number
  cartRemoves: number
  checkoutStarted: number
  paymentSuccess: number
  paymentFailure: number
  totalSearches: number
  lastActiveAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface User360FunnelMetrics {
  viewToCartPercent: number
  cartToCheckoutPercent: number
  checkoutToPurchasePercent: number
  cartAbandonmentPercent: number
}

export interface User360TopInterest {
  type: string
  entityId: string
  score: number
  viewCount: number
  cartCount: number
  purchaseCount: number
}

export interface User360Insights {
  funnel: User360FunnelMetrics | null
  topInterests: User360TopInterest[]
}

export interface User360RecentOrder {
  id: string
  orderNumber: string
  status: string
  grandTotal: number
  itemCount: number
  createdAt: string
}

export interface User360RecentActivityItem {
  id: string
  event: string
  entityType: string | null
  entityId: string | null
  createdAt: string
}

export interface User360Data {
  profile: User360Profile
  commerce?: User360CommerceMetrics | null
  behavior?: User360BehaviorSummary | null
  insights?: User360Insights | null
  recentOrders: User360RecentOrder[]
  recentActivity: User360RecentActivityItem[]
}

export interface UserActivityEvent {
  id: string
  event: string
  entityType?: string | null
  entityId?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export interface UserActivityQueryParams {
  cursor?: string
  limit?: number
}

export interface UserActivityResponse {
  success: boolean
  items: UserActivityEvent[]
  nextCursor: string | null
  hasNextPage: boolean
}

export interface TrackingApiResponse<T> {
  success: boolean
  message?: string
  data: T
}
