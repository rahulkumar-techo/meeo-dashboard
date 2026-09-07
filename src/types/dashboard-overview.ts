/**
 * @file dashboard-overview.ts
 * @description Types and interfaces for the admin executive dashboard overview.
 */

export type DashboardOverviewPeriod = "today" | "7d" | "30d" | "90d" | "1y" | "all"

export interface PayloadParams {
  period?: DashboardOverviewPeriod | string
  startDate?: string
  endDate?: string
}

export interface DashboardOverviewKPI {
  value: number
  change?: number
  trend?: "up" | "down" | "neutral"
  period?: string
}

export type DashboardOverviewPayload = DashboardOverviewData["data"]

export interface DashboardOverviewData {
  status: string
  success: boolean
  data: {
    period: string
    revenue: {
      netRevenue: number
      grossRevenue: number
      averageOrderValue: number
      totalDiscountGranted: number
      totalRefunds: number
      change?: number // Keep optional if added by a transformer later
    }
    orders: {
      totalOrders: number
      successfulOrders: number
      fulfillmentRate: number
      statusBreakdown: {
        PENDING: number
        PROCESSING: number
        CONFIRMED: number
        SHIPPED: number
        DELIVERED: number
        CANCELLED: number
        REFUNDED: number
        PAYMENT_PENDING: number
        EXPIRED: number
      }
    }
    users: {
      totalUsers: number
      activeUsers: number
      newUsersInPeriod: number
      blockedUsers: number
      suspendedUsers: number
    }
    inventory: {
      inStockCount: number
      lowStockCount: number
      outOfStockCount: number
      totalPhysicalUnits: number
      totalReservedUnits: number
      totalTrackedVariants: number
    }
    payments: {
      totalAttempts: number
      successfulPayments: number
      failedPayments: number
      failureRate: number
      gatewayBreakdown: Record<string, unknown>
    }
    reviews: {
      totalReviews: number
      approvedReviews: number
      rejectedReviews: number
      pendingModeration: number
      pendingAbuseReports: number
      averagePlatformRating: number
    }
    promotions: {
      activeCouponsCount: number
    }
  }
}
