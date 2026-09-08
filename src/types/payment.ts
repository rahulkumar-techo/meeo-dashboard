/**
 * @file payment.ts
 * @description Centralized TypeScript type definitions for the Payment & Financial Operations Module.
 * Models payment lifecycles, gateway attempt ledgers, double-entry financial transactions, refunds, and reconciliation.
 */

/**
 * Paginated metadata for payment lists
 */
export interface PaymentPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Standard payment lifecycle states across platform gateways
 */
export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "REQUIRES_ACTION"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"

/**
 * Supported payment gateway providers
 */
export type PaymentProvider = "STRIPE" | "RAZORPAY" | "MOCK"

/**
 * Immutable financial ledger transaction types
 */
export type TransactionType = "CAPTURE" | "REFUND" | "CHARGEBACK"

/**
 * Gateway attempt log entry
 */
export interface PaymentAttempt {
  id: string
  attemptNumber: number
  status: PaymentStatus | string
  gatewayTransactionId?: string | null
  gatewayResponseCode?: string | null
  createdAt: string
}

/**
 * Double-entry financial ledger transaction record
 */
export interface PaymentTransaction {
  id: string
  type: TransactionType
  amount: number
  currency: string
  gatewayTransactionId?: string | null
  createdAt: string
}

/**
 * Audit record of an issued refund
 */
export interface PaymentRefund {
  id: string
  amount: number
  currency: string
  status: "COMPLETED" | "PENDING" | "FAILED" | string
  reason?: string | null
  gatewayRefundId?: string | null
  createdAt: string
}

/**
 * Platform Payment List Item
 */
export interface PaymentListItem {
  id: string
  orderId: string
  status: PaymentStatus
  amount: number
  refundedAmount: number
  currency: string
  provider: PaymentProvider | string
  paymentMethod?: string | null
  attemptsCount?: number
  createdAt: string
  updatedAt: string
}

/**
 * Comprehensive Payment Specification with Attempts & Ledger Entries
 */
export interface PaymentDetail extends PaymentListItem {
  attempts: PaymentAttempt[]
  transactions: PaymentTransaction[]
  refunds: PaymentRefund[]
}

/**
 * Query parameters for listing platform payments
 */
export interface PaymentQueryParams {
  page?: number
  limit?: number
  status?: PaymentStatus | string
  orderId?: string
  provider?: PaymentProvider | string
}

/**
 * Payload for issuing full or partial refund
 */
export interface RefundPayload {
  paymentId: string
  amount?: number
  reason?: string
}

/**
 * Response payload from refund endpoint
 */
export interface RefundResponseData {
  refundId: string
  paymentId: string
  amount: number
  currency: string
  status: string
  gatewayRefundId?: string | null
  remainingRefundable: number
  paymentStatus: PaymentStatus
}

/**
 * Payload for triggering gateway reconciliation
 */
export interface ReconcilePayload {
  paymentId: string
}

/**
 * Response payload from reconcile endpoint
 */
export interface ReconcileResponseData {
  paymentId: string
  previousStatus: PaymentStatus
  currentStatus: PaymentStatus
  gatewayStatus?: string
  reconciled: boolean
  orderUpdated: boolean
}

/**
 * Paginated list response wrapper
 */
export interface PaymentListResponseData {
  items: PaymentListItem[]
  pagination: PaymentPagination
}

/**
 * Generic API response envelope
 */
export interface PaymentApiResponse<T> {
  success: boolean
  message: string
  data: T
  statusCode?: number
}
