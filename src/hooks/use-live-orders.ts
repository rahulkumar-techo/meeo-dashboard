/**
 * @file use-live-orders.ts
 * @description Real-time order tracking hook for specific orders or live order feeds.
 * Joins order-specific rooms, receives status transitions, and automatically syncs TanStack Query.
 */

"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useSocket } from "@/context/socket-provider"
import { ORDERS_QUERY_KEY, ORDER_METRICS_QUERY_KEY } from "@/hooks/use-order-query"

export interface UseLiveOrderOptions {
  orderId?: string
  initialStatus?: string
  onStatusChange?: (status: string, payload?: unknown) => void
}

/**
 * Hook to track real-time status transitions for a specific order.
 * Automatically joins the order room and invalidates order queries upon state changes.
 */
export function useLiveOrder({ orderId, initialStatus, onStatusChange }: UseLiveOrderOptions) {
  const { socket, isConnected } = useSocket()
  const [liveStatus, setLiveStatus] = useState<string | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket || !isConnected || !orderId) return

    // Join order-specific room for targeted push updates
    socket.emit("join:order", orderId, (response?: { success: boolean; error?: string }) => {
      if (response && !response.success) {
        console.warn(`[Socket] Could not join room for order ${orderId}:`, response.error)
      }
    })

    const handleStatusTransition = (status: string) => (payload?: unknown) => {
      setLiveStatus(status)
      onStatusChange?.(status, payload)

      // Invalidate individual order and general order lists
      queryClient.invalidateQueries({ queryKey: ["orders", "detail", orderId] })
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_METRICS_QUERY_KEY })
    }

    const onConfirmed = handleStatusTransition("CONFIRMED")
    const onProcessing = handleStatusTransition("PROCESSING")
    const onShipped = handleStatusTransition("SHIPPED")
    const onDelivered = handleStatusTransition("DELIVERED")
    const onCancelled = handleStatusTransition("CANCELLED")
    const onUpdated = handleStatusTransition("UPDATED")

    socket.on("order.confirmed", onConfirmed)
    socket.on("order.processing", onProcessing)
    socket.on("order.shipped", onShipped)
    socket.on("order.delivered", onDelivered)
    socket.on("order.cancelled", onCancelled)
    socket.on("order.updated", onUpdated)

    return () => {
      socket.emit("leave:order", orderId)
      socket.off("order.confirmed", onConfirmed)
      socket.off("order.processing", onProcessing)
      socket.off("order.shipped", onShipped)
      socket.off("order.delivered", onDelivered)
      socket.off("order.cancelled", onCancelled)
      socket.off("order.updated", onUpdated)
    }
  }, [socket, isConnected, orderId, queryClient, onStatusChange])

  return {
    currentStatus: liveStatus ?? initialStatus,
    isConnected,
  }
}
