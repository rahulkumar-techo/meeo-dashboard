/**
 * @file payment.service.ts
 * @description Admin API communication layer for Payment & Financial Operations.
 * Interacts with backend payment list, detailed ledger breakdown, refund dispatch, and gateway reconciliation.
 */

import { apiClient } from "@/config/client"
import type {
  PaymentListItem,
  PaymentDetail,
  PaymentQueryParams,
  RefundPayload,
  RefundResponseData,
  ReconcilePayload,
  ReconcileResponseData,
  PaymentListResponseData,
  PaymentApiResponse,
} from "@/types/payment"

export const paymentService = {
  /**
   * 1. List All Platform Payments with pagination, status, order UUID, and provider filters.
   * Endpoint: GET /api/v1/payments/admin/list
   */
  async getAdminPayments(
    params?: PaymentQueryParams
  ): Promise<PaymentApiResponse<PaymentListResponseData>> {
    const response = await apiClient.get<
      PaymentApiResponse<PaymentListResponseData>
    >("/payments/admin/list", {
      params,
    })
    return response.data
  },

  /**
   * 2. Inspect Payment Breakdown & Attempt Ledger.
   * Endpoint: GET /api/v1/payments/:id
   */
  async getPaymentById(
    id: string
  ): Promise<PaymentApiResponse<PaymentDetail>> {
    const response = await apiClient.get<PaymentApiResponse<PaymentDetail>>(
      `/payments/${id}`
    )
    return response.data
  },

  /**
   * 3. Issue Full or Partial Refund.
   * Endpoint: POST /api/v1/payments/refund
   */
  async issueRefund(
    payload: RefundPayload
  ): Promise<PaymentApiResponse<RefundResponseData>> {
    const response = await apiClient.post<PaymentApiResponse<RefundResponseData>>(
      "/payments/refund",
      payload
    )
    return response.data
  },

  /**
   * 4. Self-Healing Reconcile Payment with Gateway (Stripe/Razorpay/Mock).
   * Endpoint: POST /api/v1/payments/reconcile
   */
  async reconcilePayment(
    payload: ReconcilePayload
  ): Promise<PaymentApiResponse<ReconcileResponseData>> {
    const response = await apiClient.post<
      PaymentApiResponse<ReconcileResponseData>
    >("/payments/reconcile", payload)
    return response.data
  },
}
