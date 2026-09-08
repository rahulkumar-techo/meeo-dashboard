/**
 * @file use-order-query.ts
 * @description TanStack React Query hooks for Order Management lifecycle, fulfillment actions, and metrics.
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { orderService } from "@/services/order.service"
import type {
  AdminOrder,
  AdminOrderMetrics,
  AdminOrderQueryParams,
  AdminOrderMetricsQueryParams,
  ShipOrderPayload,
  DeliverOrderPayload,
  UpdateOrderStatusPayload,
  CancelOrderPayload,
  ExpireStaleOrdersPayload,
  AdminOrderListResponseData,
} from "@/types/order"

export const ORDERS_QUERY_KEY = ["orders", "admin"]
export const ORDER_METRICS_QUERY_KEY = ["orders", "admin", "metrics"]

/**
 * Hook to retrieve paginated admin orders with search and status filters.
 */
export function useAdminOrdersQuery(params?: AdminOrderQueryParams) {
  return useQuery<AdminOrderListResponseData>({
    queryKey: [...ORDERS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await orderService.getAdminOrders(params)
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
 * Hook to retrieve operational and fulfillment analytics metrics.
 */
export function useAdminOrderMetricsQuery(
  params?: AdminOrderMetricsQueryParams
) {
  return useQuery<AdminOrderMetrics>({
    queryKey: [...ORDER_METRICS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await orderService.getAdminMetrics(params)
      return (
        res?.data ?? {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          activeFulfillments: 0,
          statusCounts: {},
        }
      )
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to inspect a single order by UUID.
 */
export function useOrderByIdQuery(id: string) {
  return useQuery<AdminOrder | null>({
    queryKey: ["orders", "detail", id],
    queryFn: async () => {
      if (!id) return null
      const res = await orderService.getOrderById(id)
      return res?.data ?? null
    },
    enabled: Boolean(id),
    staleTime: 20 * 1000,
  })
}

/**
 * Hook to confirm an order for fulfillment (commits inventory hold).
 */
export function useConfirmOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await orderService.confirmOrder(id)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_METRICS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["orders", "detail", id] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
  })
}

/**
 * Hook to transition an order to warehouse processing.
 */
export function useProcessOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await orderService.processOrder(id)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_METRICS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["orders", "detail", id] })
    },
  })
}

/**
 * Hook to dispatch & ship an order with tracking.
 */
export function useShipOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: ShipOrderPayload
    }) => {
      return await orderService.shipOrder(id, payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_METRICS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: ["orders", "detail", variables.id],
      })
    },
  })
}

/**
 * Hook to mark an order as delivered.
 */
export function useDeliverOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload?: DeliverOrderPayload
    }) => {
      return await orderService.deliverOrder(id, payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_METRICS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: ["orders", "detail", variables.id],
      })
    },
  })
}

/**
 * Hook for manual state machine transition.
 */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateOrderStatusPayload
    }) => {
      return await orderService.updateOrderStatus(id, payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_METRICS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: ["orders", "detail", variables.id],
      })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
  })
}

/**
 * Hook to cancel an order and release reserved stock.
 */
export function useCancelOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload?: CancelOrderPayload
    }) => {
      return await orderService.cancelOrder(id, payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_METRICS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: ["orders", "detail", variables.id],
      })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
  })
}

/**
 * Hook for batch sweeping stale abandoned orders.
 */
export function useExpireStaleOrdersMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload?: ExpireStaleOrdersPayload) => {
      return await orderService.expireStaleOrders(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_METRICS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
  })
}
