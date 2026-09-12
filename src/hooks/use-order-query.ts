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
 * Normalizes backend order format to ensure all properties (financials, customer, shippingAddress, items) are consistently mapped.
 */
export function normalizeAdminOrder(order: any): AdminOrder {
  if (!order) return order
  const financials = order.financials || {}
  const items = Array.isArray(order.items)
    ? order.items.map((item: any) => ({
        ...item,
        totalPrice:
          item.total ??
          item.totalPrice ??
          Number(item.unitPrice || 0) * Number(item.quantity || 1),
        image: item.variantSnapshot?.thumbnail || item.image || null,
      }))
    : []

  return {
    ...order,
    currency: financials.currency || order.currency || "INR",
    subtotal: financials.subtotal ?? order.subtotal ?? 0,
    discountTotal: financials.discountTotal ?? order.discountTotal ?? 0,
    shippingTotal: financials.shippingTotal ?? order.shippingTotal ?? 0,
    taxTotal: financials.taxTotal ?? order.taxTotal ?? 0,
    grandTotal: financials.grandTotal ?? order.grandTotal ?? 0,
    financials: {
      currency: financials.currency || order.currency || "INR",
      subtotal: financials.subtotal ?? order.subtotal ?? 0,
      discountTotal: financials.discountTotal ?? order.discountTotal ?? 0,
      shippingTotal: financials.shippingTotal ?? order.shippingTotal ?? 0,
      taxTotal: financials.taxTotal ?? order.taxTotal ?? 0,
      grandTotal: financials.grandTotal ?? order.grandTotal ?? 0,
    },
    user: order.customer || order.user || null,
    customer: order.customer || order.user || null,
    address: order.shippingAddress || order.address || null,
    shippingAddress: order.shippingAddress || order.address || null,
    itemCount: items.length || order.itemCount || 1,
    items,
  }
}

/**
 * Hook to retrieve paginated admin orders with search and status filters.
 */
export function useAdminOrdersQuery(params?: AdminOrderQueryParams) {
  return useQuery<AdminOrderListResponseData>({
    queryKey: [...ORDERS_QUERY_KEY, params],
    queryFn: async () => {
      const res: any = await orderService.getAdminOrders(params)
      const data = res?.data ?? res

      // Case 1: Backend envelope { success: true, data: [...], meta: { page, limit, total, totalPages } }
      if (Array.isArray(data)) {
        const items = data.map(normalizeAdminOrder)
        return {
          items,
          pagination: res?.meta ?? {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: items.length,
            totalPages: Math.ceil(items.length / (params?.limit ?? 20)) || 1,
          },
        }
      }

      // Case 2: data has items array
      if (data && Array.isArray(data.items)) {
        const items = data.items.map(normalizeAdminOrder)
        return {
          items,
          pagination: data.pagination ?? res?.meta ?? {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: items.length,
            totalPages: Math.ceil(items.length / (params?.limit ?? 20)) || 1,
          },
        }
      }

      // Case 3: Raw array response
      if (Array.isArray(res)) {
        const items = res.map(normalizeAdminOrder)
        return {
          items,
          pagination: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: items.length,
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
      const res: any = await orderService.getAdminMetrics(params)
      const data = res?.data ?? res ?? {}

      const totalRevenue = Number(
        data.financials?.totalRevenue ??
          data.totalRevenue ??
          data.revenue ??
          data.grossRevenue ??
          data.totalPlatformRevenue ??
          0
      )

      const averageOrderValue = Number(
        data.financials?.averageOrderValue ??
          data.averageOrderValue ??
          data.aov ??
          data.avgOrderValue ??
          0
      )

      const totalOrders = Number(
        data.totalOrders ??
          data.total ??
          data.count ??
          0
      )

      const activeFulfillments = Number(
        data.activeFulfillmentCount ??
          data.activeFulfillments ??
          data.activeOrders ??
          data.pipeline ??
          0
      )

      const statusCounts = data.countsByStatus ?? data.statusCounts ?? data.byStatus ?? {}

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        activeFulfillments,
        fulfilledOrders: Number(data.fulfilledOrders ?? data.deliveredCount ?? 0),
        activeFulfillmentCount: activeFulfillments,
        countsByStatus: statusCounts,
        statusCounts,
        financials: data.financials ?? {
          totalRevenue,
          averageOrderValue,
          paidOrderCount: Number(data.financials?.paidOrderCount ?? 0),
        },
        currency: data.currency,
      }
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
      const order = res?.data ?? res ?? null
      return order ? normalizeAdminOrder(order) : null
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
