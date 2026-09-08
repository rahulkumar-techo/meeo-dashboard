/**
 * @file order.service.ts
 * @description Admin API communication layer for Order Management, fulfillment lifecycle, logistics dispatch, and metrics.
 */

import { apiClient } from "@/config/client"
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
  OrderApiResponse,
  AdminOrderListResponseData,
  ExpireStaleOrdersResponseData,
} from "@/types/order"

export const orderService = {
  /**
   * 1. Admin List All Platform Orders with search, status filtering, and pagination.
   * Endpoint: GET /api/v1/orders/admin
   */
  async getAdminOrders(
    params?: AdminOrderQueryParams
  ): Promise<OrderApiResponse<AdminOrderListResponseData>> {
    const response = await apiClient.get<
      OrderApiResponse<AdminOrderListResponseData>
    >("/orders/admin", {
      params,
    })
    return response.data
  },

  /**
   * 2. Admin Order & Fulfillment Analytics Metrics.
   * Endpoint: GET /api/v1/orders/admin/metrics
   */
  async getAdminMetrics(
    params?: AdminOrderMetricsQueryParams
  ): Promise<OrderApiResponse<AdminOrderMetrics>> {
    const response = await apiClient.get<OrderApiResponse<AdminOrderMetrics>>(
      "/orders/admin/metrics",
      { params }
    )
    return response.data
  },

  /**
   * 3. Admin Inspect Order by UUID.
   * Endpoint: GET /api/v1/orders/:id
   */
  async getOrderById(id: string): Promise<OrderApiResponse<AdminOrder>> {
    const response = await apiClient.get<OrderApiResponse<AdminOrder>>(
      `/orders/${id}`
    )
    return response.data
  },

  /**
   * 4. Admin Inspect Order by human-readable Order Number.
   * Endpoint: GET /api/v1/orders/number/:orderNumber
   */
  async getOrderByNumber(
    orderNumber: string
  ): Promise<OrderApiResponse<AdminOrder>> {
    const response = await apiClient.get<OrderApiResponse<AdminOrder>>(
      `/orders/number/${orderNumber}`
    )
    return response.data
  },

  /**
   * 5. Admin Confirm Order for fulfillment and commit stock hold.
   * Endpoint: POST /api/v1/orders/:id/confirm
   */
  async confirmOrder(
    id: string
  ): Promise<OrderApiResponse<{ id: string; orderNumber: string; status: string }>> {
    const response = await apiClient.post<
      OrderApiResponse<{ id: string; orderNumber: string; status: string }>
    >(`/orders/${id}/confirm`)
    return response.data
  },

  /**
   * 6. Admin Move Order to warehouse processing (picking/packing).
   * Endpoint: POST /api/v1/orders/:id/process
   */
  async processOrder(
    id: string
  ): Promise<OrderApiResponse<{ id: string; orderNumber: string; status: string }>> {
    const response = await apiClient.post<
      OrderApiResponse<{ id: string; orderNumber: string; status: string }>
    >(`/orders/${id}/process`)
    return response.data
  },

  /**
   * 7. Admin Dispatch & Ship Order with tracking and carrier information.
   * Endpoint: POST /api/v1/orders/:id/ship
   */
  async shipOrder(
    id: string,
    payload: ShipOrderPayload
  ): Promise<OrderApiResponse<{ id: string; orderNumber: string; status: string; shipment: any }>> {
    const response = await apiClient.post<
      OrderApiResponse<{ id: string; orderNumber: string; status: string; shipment: any }>
    >(`/orders/${id}/ship`, payload)
    return response.data
  },

  /**
   * 8. Admin Mark Order as Delivered with recipient acknowledgment.
   * Endpoint: POST /api/v1/orders/:id/deliver
   */
  async deliverOrder(
    id: string,
    payload?: DeliverOrderPayload
  ): Promise<OrderApiResponse<{ id: string; orderNumber: string; status: string }>> {
    const response = await apiClient.post<
      OrderApiResponse<{ id: string; orderNumber: string; status: string }>
    >(`/orders/${id}/deliver`, payload || {})
    return response.data
  },

  /**
   * 9. Admin Manual State Machine Transition with audit reason.
   * Endpoint: PATCH /api/v1/orders/:id/status
   */
  async updateOrderStatus(
    id: string,
    payload: UpdateOrderStatusPayload
  ): Promise<OrderApiResponse<{ id: string; status: string }>> {
    const response = await apiClient.patch<
      OrderApiResponse<{ id: string; status: string }>
    >(`/orders/${id}/status`, payload)
    return response.data
  },

  /**
   * 10. Admin Cancel Order & release inventory hold.
   * Endpoint: POST /api/v1/orders/:id/cancel
   */
  async cancelOrder(
    id: string,
    payload?: CancelOrderPayload
  ): Promise<OrderApiResponse<{ id: string; status: string }>> {
    const response = await apiClient.post<
      OrderApiResponse<{ id: string; status: string }>
    >(`/orders/${id}/cancel`, payload || {})
    return response.data
  },

  /**
   * 11. Admin / Cron Sweep Stale Orders.
   * Endpoint: POST /api/v1/orders/expire-stale
   */
  async expireStaleOrders(
    payload?: ExpireStaleOrdersPayload
  ): Promise<OrderApiResponse<ExpireStaleOrdersResponseData>> {
    const response = await apiClient.post<
      OrderApiResponse<ExpireStaleOrdersResponseData>
    >("/orders/expire-stale", payload || {})
    return response.data
  },
}
