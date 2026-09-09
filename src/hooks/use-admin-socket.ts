/**
 * @file use-admin-socket.ts
 * @description Real-time WebSocket event listener hook for Meeo Admin Console.
 * Subscribes to admin telemetry, triggers audio alerts & toasts, and automatically
 * invalidates TanStack Query caches to keep tables and charts synchronized with the database.
 */

"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useSocket } from "@/context/socket-provider"
import { playNotificationSound } from "@/lib/notification-sound"
import { toast } from "sonner"
import { ORDERS_QUERY_KEY, ORDER_METRICS_QUERY_KEY } from "@/hooks/use-order-query"
import { INVENTORY_QUERY_KEY, INVENTORY_LOW_STOCK_KEY } from "@/hooks/use-inventory-query"
import { PAYMENT_QUERY_KEYS } from "@/hooks/use-payment-query"
import { NOTIFICATION_QUERY_KEYS } from "@/hooks/use-notification-query"
import { dashboardOverviewKeys } from "@/hooks/dashboard/use-overview.hook"

export interface AdminSocketEventPayload<T = any> {
  event?: string
  timestamp?: string
  data: T
}

/**
 * Global Admin Socket subscriber hook.
 * Attach this at layout or provider level to listen to platform-wide events.
 */
export function useAdminSocketEvents() {
  const { socket, isConnected } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket || !isConnected) return

    // 1. New Incoming Order Alert
    const handleOrderCreated = (payload: AdminSocketEventPayload<{
      orderId?: string
      orderNumber?: string | number
      totalAmount?: number | string
      currency?: string
      customerName?: string
    }>) => {
      const data = payload?.data || (payload as any)
      const identifier = data?.orderNumber ?? data?.orderId ?? "New"
      const amount = data?.totalAmount != null ? `Amount: ₹${data.totalAmount}` : undefined

      playNotificationSound()
      toast.success(`New Order: #${identifier}`, {
        description: amount ?? "A new order has been placed.",
      })

      // Invalidate relevant queries so orders list and KPI cards auto-refresh
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_METRICS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.all })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    }

    // 2. Order Cancellation Alert
    const handleOrderCancelled = (payload: AdminSocketEventPayload<{
      orderId?: string
      orderNumber?: string | number
      reason?: string
    }>) => {
      const data = payload?.data || (payload as any)
      const identifier = data?.orderNumber ?? data?.orderId ?? "Unknown"

      toast.error(`Order #${identifier} was cancelled`, {
        description: data?.reason ? `Reason: ${data.reason}` : undefined,
      })

      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_METRICS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
    }

    // 3. Generic Order Lifecycle Changes (Confirmed, Shipped, Delivered)
    const handleOrderUpdated = (payload: AdminSocketEventPayload<{
      orderId?: string
      status?: string
    }>) => {
      const data = payload?.data || (payload as any)
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_METRICS_QUERY_KEY })
      if (data?.orderId) {
        queryClient.invalidateQueries({ queryKey: ["orders", "detail", data.orderId] })
      }
    }

    // 4. Low Stock Inventory Alert
    const handleInventoryLow = (payload: AdminSocketEventPayload<{
      productId?: string
      productName?: string
      sku?: string
      currentStock?: number
      threshold?: number
    }>) => {
      const data = payload?.data || (payload as any)
      const name = data?.productName || (data?.sku ? `SKU: ${data.sku}` : "Item")
      const units = data?.currentStock != null ? `${data.currentStock} units remaining!` : "Critical stock level"

      playNotificationSound()
      toast.warning(`Low Stock Warning: ${name}`, {
        description: `Only ${units}`,
      })

      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_LOW_STOCK_KEY })
    }

    // 5. Payment Success / Capture
    const handlePaymentSuccess = (payload: AdminSocketEventPayload<{
      paymentId?: string
      orderId?: string
      amount?: number
    }>) => {
      const data = payload?.data || (payload as any)
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.all })
      if (data?.paymentId) {
        queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.detail(data.paymentId) })
      }
    }

    // 6. Payment Refunded
    const handlePaymentRefunded = (payload: AdminSocketEventPayload<{
      paymentId?: string
      orderId?: string
      amount?: number
    }>) => {
      const data = payload?.data || (payload as any)
      const identifier = data?.orderId ? `order #${data.orderId}` : (data?.paymentId ? `payment #${data.paymentId}` : "")

      toast.info(`Refund processed ${identifier ? `for ${identifier}` : ""}`.trim())
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      if (data?.paymentId) {
        queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.detail(data.paymentId) })
      }
    }

    // 7. General Notification / In-App Message
    const handleNotificationCreated = () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all })
    }

    // Register all event listeners
    socket.on("order.created", handleOrderCreated)
    socket.on("order.cancelled", handleOrderCancelled)
    socket.on("order.confirmed", handleOrderUpdated)
    socket.on("order.processing", handleOrderUpdated)
    socket.on("order.shipped", handleOrderUpdated)
    socket.on("order.delivered", handleOrderUpdated)
    socket.on("order.updated", handleOrderUpdated)
    socket.on("inventory.low", handleInventoryLow)
    socket.on("payment.success", handlePaymentSuccess)
    socket.on("payment.refunded", handlePaymentRefunded)
    socket.on("notification.created", handleNotificationCreated)

    // Teardown event listeners on unmount or socket change
    return () => {
      socket.off("order.created", handleOrderCreated)
      socket.off("order.cancelled", handleOrderCancelled)
      socket.off("order.confirmed", handleOrderUpdated)
      socket.off("order.processing", handleOrderUpdated)
      socket.off("order.shipped", handleOrderUpdated)
      socket.off("order.delivered", handleOrderUpdated)
      socket.off("order.updated", handleOrderUpdated)
      socket.off("inventory.low", handleInventoryLow)
      socket.off("payment.success", handlePaymentSuccess)
      socket.off("payment.refunded", handlePaymentRefunded)
      socket.off("notification.created", handleNotificationCreated)
    }
  }, [socket, isConnected, queryClient])

  return { socket, isConnected }
}
