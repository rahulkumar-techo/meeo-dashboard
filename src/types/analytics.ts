/**
 * @file analytics.ts
 * @description Centralized TypeScript type definitions for Executive Revenue, Funnel & Omnichannel Analytics.
 * Models Net GMV Velocity (30D), E-Commerce Conversion Funnel, Omnichannel Distribution, SKU Velocity, and Operational Health.
 */

export type AnalyticsPeriod = "today" | "7d" | "30d" | "90d" | "1y" | "all"

/**
 * Executive Financial Telemetry
 */
export interface ExecutiveFinancials {
  grossRevenue: number
  netRevenue: number
  netGmv30DVelocity: number
  totalDiscounts: number
  totalRefunds: number
  currency: string
  averageOrderValue: number
}

/**
 * Executive Orders Breakdown
 */
export interface ExecutiveOrders {
  totalOrders: number
  confirmed: number
  delivered: number
  processing: number
  pending: number
  cancelled: number
  refunded: number
}

/**
 * E-Commerce Conversion Funnel Throughput
 */
export interface ConversionFunnel {
  registeredUsers: number
  newSignupsInPeriod: number
  cartAdditions: number
  checkoutInitiated: number
  ordersPlaced: number
  ordersDelivered: number
  overallConversionRatePercent: number
}

/**
 * Omnichannel Revenue Distribution
 */
export interface OmnichannelShareItem {
  channel: string
  sharePercent: number
  gmv: number
}

/**
 * Payment Gateway Distribution
 */
export interface PaymentGatewayShareItem {
  provider: string
  sharePercent: number
  transactionCount: number
}

/**
 * Combined Channel Distribution
 */
export interface ChannelDistribution {
  omnichannelShare: OmnichannelShareItem[]
  paymentGateways: PaymentGatewayShareItem[]
}

/**
 * Executive User Cohorts
 */
export interface ExecutiveUsers {
  totalUsers: number
  active: number
  suspended: number
  blocked: number
  newInPeriod: number
}

/**
 * Executive Inventory Snapshot
 */
export interface ExecutiveInventory {
  totalSkus: number
  inStockSkus: number
  lowStockSkus: number
  outOfStockSkus: number
}

/**
 * Executive Payment Gateway Performance
 */
export interface ExecutivePayments {
  totalAttempts: number
  successfulAttempts: number
  failedAttempts: number
  failureRatePercent: number
}

/**
 * Executive Review Pipeline
 */
export interface ExecutiveReviews {
  totalReviews: number
  pendingModeration: number
  averageRating: number
}

/**
 * Executive Promotions & Discount Burn Rate
 */
export interface ExecutivePromotions {
  activeCoupons: number
  totalDiscountGranted: number
}

/**
 * Unified Executive Overview Response (GET /api/v1/admin/dashboard/overview)
 */
export interface ExecutiveOverviewData {
  period: string
  financials: ExecutiveFinancials
  orders: ExecutiveOrders
  conversionFunnel: ConversionFunnel
  channelDistribution: ChannelDistribution
  users: ExecutiveUsers
  inventory: ExecutiveInventory
  payments: ExecutivePayments
  reviews: ExecutiveReviews
  promotions: ExecutivePromotions
  generatedAt: string
}

/**
 * Time-Series Sales & Revenue Chart Point (GET /api/v1/admin/dashboard/sales-chart)
 */
export interface SalesChartPoint {
  date: string
  revenue: number
  ordersCount: number
  averageOrderValue: number
}

export interface SalesChartTotals {
  totalRevenue: number
  totalOrders: number
}

export interface SalesChartData {
  period: string
  interval: string
  points: SalesChartPoint[]
  totals: SalesChartTotals
}

/**
 * Top-Selling Products & SKU Velocity (GET /api/v1/admin/dashboard/top-sellers)
 */
export interface TopSellerItem {
  productId: string
  productName: string
  sku: string
  unitsSold: number
  grossRevenue: number
  currentAvailableStock: number
}

/**
 * Low-Stock Reorder Velocity Alerts (GET /api/v1/admin/dashboard/low-stock)
 */
export interface LowStockAlertItem {
  id: string
  productName: string
  sku: string
  currentStock: number
  threshold: number
  category?: string
}

/**
 * Failed Payment Triage Record (GET /api/v1/admin/dashboard/failed-payments)
 */
export interface FailedPaymentItem {
  id: string
  orderId: string
  customerEmail: string
  amount: number
  currency: string
  provider: string
  errorCode: string
  errorMessage: string
  createdAt: string
}

/**
 * Operational Backlog Health (GET /api/v1/admin/dashboard/health)
 */
export interface OperationalHealthData {
  outboxBacklog: number
  reviewQueue: number
  fulfillmentLagHours: number
  dlqDepth: number
  status: "HEALTHY" | "DEGRADED" | "CRITICAL" | string
}

/**
 * Query parameters for analytics endpoints
 */
export interface AnalyticsQueryParams {
  period?: AnalyticsPeriod | string
  startDate?: string
  endDate?: string
  interval?: "hour" | "day" | "week" | "month" | string
  limit?: number
  threshold?: number
  page?: number
}

/**
 * Generic API response envelope
 */
export interface AnalyticsApiResponse<T> {
  status: "success" | "error"
  success: boolean
  data: T
  message?: string
}
