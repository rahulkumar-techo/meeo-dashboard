/**
 * @file use-payment-query.ts
 * @description TanStack React Query hooks for Payment Management & Financial Operations.
 * Manages caching, query invalidation, refetching, and mutations with toast notifications.
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { paymentService } from "@/services/payment.service"
import type {
  PaymentQueryParams,
  RefundPayload,
  ReconcilePayload,
} from "@/types/payment"

export const PAYMENT_QUERY_KEYS = {
  all: ["payments"] as const,
  lists: () => [...PAYMENT_QUERY_KEYS.all, "list"] as const,
  list: (params?: PaymentQueryParams) =>
    [...PAYMENT_QUERY_KEYS.lists(), params] as const,
  details: () => [...PAYMENT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PAYMENT_QUERY_KEYS.details(), id] as const,
}

/**
 * Hook to fetch paginated platform payments with filtering
 */
export function useAdminPayments(params?: PaymentQueryParams) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.list(params),
    queryFn: async () => {
      const res = await paymentService.getAdminPayments(params)
      return res.data
    },
  })
}

/**
 * Hook to fetch deep payment details and attempt/ledger records
 */
export function usePaymentDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const res = await paymentService.getPaymentById(id)
      return res.data
    },
    enabled: enabled && Boolean(id),
  })
}

/**
 * Hook to execute full or partial refund mutation
 */
export function useIssueRefundMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RefundPayload) => paymentService.issueRefund(payload),
    onSuccess: (res, variables) => {
      // Invalidate relevant payment and orders queries
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      if (variables.paymentId) {
        queryClient.invalidateQueries({
          queryKey: PAYMENT_QUERY_KEYS.detail(variables.paymentId),
        })
      }
    },
  })
}

/**
 * Hook to reconcile payment state with external gateway
 */
export function useReconcilePaymentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReconcilePayload) =>
      paymentService.reconcilePayment(payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      if (variables.paymentId) {
        queryClient.invalidateQueries({
          queryKey: PAYMENT_QUERY_KEYS.detail(variables.paymentId),
        })
      }
    },
  })
}

