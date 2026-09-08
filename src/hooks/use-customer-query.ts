/**
 * @file use-customer-query.ts
 * @description TanStack React Query hooks for Customer Intelligence, 360 view, status moderation, and session revocation.
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { customerService } from "@/services/customer.service"
import type {
  AdminCustomer,
  CustomerMetrics,
  Customer360Intelligence,
  CustomerQueryParams,
  UpdateCustomerStatusPayload,
  UpdateCustomerProfilePayload,
  CustomerListResponseData,
} from "@/types/customer"

export const CUSTOMERS_QUERY_KEY = ["customers", "admin"]
export const CUSTOMER_METRICS_QUERY_KEY = ["customers", "admin", "metrics"]

/**
 * Hook to retrieve paginated customer accounts with ecommerce intelligence.
 */
export function useCustomersQuery(params?: CustomerQueryParams) {
  return useQuery<CustomerListResponseData>({
    queryKey: [...CUSTOMERS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await customerService.getCustomers(params)
      const data = res?.data ?? (res as any)

      if (data && Array.isArray(data.items)) {
        return {
          items: data.items,
          pagination: data.pagination ?? {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.items.length,
            totalPages: Math.ceil(data.items.length / (params?.limit ?? 20)),
          },
        }
      }

      if (Array.isArray(data)) {
        return {
          items: data,
          pagination: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.length,
            totalPages: 1,
          },
        }
      }

      return {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }
    },
    staleTime: 15 * 1000,
  })
}

/**
 * Hook to retrieve platform customer KPIs and tier breakdowns.
 */
export function useCustomerMetricsQuery() {
  return useQuery<CustomerMetrics>({
    queryKey: CUSTOMER_METRICS_QUERY_KEY,
    queryFn: async () => {
      const res = await customerService.getCustomerMetrics()
      return (
        res?.data ?? {
          totalCustomers: 0,
          activeCustomers: 0,
          newCustomersThisMonth: 0,
          repeatPurchaseRate: 0,
          averageLifetimeValue: 0,
          riskFlaggedAccounts: 0,
          statusDistribution: {},
          tierDistribution: {},
        }
      )
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to retrieve complete 360-degree intelligence for a specific user ID.
 */
export function useCustomer360Query(userId: string) {
  return useQuery<Customer360Intelligence | null>({
    queryKey: ["customers", "360", userId],
    queryFn: async () => {
      if (!userId) return null
      const res = await customerService.getCustomer360(userId)
      return res?.data ?? null
    },
    enabled: Boolean(userId),
    staleTime: 15 * 1000,
  })
}

/**
 * Hook to moderate customer status (Active, Suspended, Blocked, Pending Verification).
 */
export function useUpdateCustomerStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string
      payload: UpdateCustomerStatusPayload
    }) => {
      return await customerService.updateCustomerStatus(userId, payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: CUSTOMER_METRICS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: ["customers", "360", variables.userId],
      })
    },
  })
}

/**
 * Hook to update customer profile names / status.
 */
export function useUpdateCustomerProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string
      payload: UpdateCustomerProfilePayload
    }) => {
      return await customerService.updateCustomerProfile(userId, payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: ["customers", "360", variables.userId],
      })
    },
  })
}

/**
 * Hook to forcibly revoke a customer device session.
 */
export function useRevokeCustomerSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      sessionId,
    }: {
      userId: string
      sessionId: string
    }) => {
      return await customerService.revokeUserSession(userId, sessionId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customers", "360", variables.userId],
      })
    },
  })
}
