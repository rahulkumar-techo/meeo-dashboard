/**
 * @file socket-provider.tsx
 * @description Global React Context Provider for Socket.IO lifecycle and connection management.
 * Manages authentication handshakes, administrative stream subscriptions, and auto-cleanup.
 */

"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import { getAdminSocket, disconnectAdminSocket } from "@/lib/socket"
import { useUserStore } from "@/store/user.store"
import { useAdminSocketEvents } from "@/hooks/use-admin-socket"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

/**
 * Internal listener component mounted inside SocketProvider to bind global admin events.
 */
function AdminSocketEventSubscriber() {
  useAdminSocketEvents()
  return null
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthenticated } = useUserStore()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // If user is not authenticated or access token is missing, disconnect socket
    if (!isAuthenticated || !accessToken) {
      disconnectAdminSocket()
      setSocket(null)
      setIsConnected(false)
      return
    }

    // Initialize singleton authenticated socket
    const s = getAdminSocket(accessToken)
    setSocket(s)

    const onConnect = () => {
      setIsConnected(true)
      // Join all administrative real-time broadcast streams (orders, inventory, payments)
      s.emit("join:admin", "all")
    }

    const onDisconnect = () => {
      setIsConnected(false)
    }

    const onConnectError = (error: Error) => {
      console.warn("[Socket.IO] Connection error:", error.message)
      setIsConnected(false)
    }

    s.on("connect", onConnect)
    s.on("disconnect", onDisconnect)
    s.on("connect_error", onConnectError)

    // If socket is already connected upon assignment
    if (s.connected) {
      onConnect()
    }

    return () => {
      s.emit("leave:admin")
      s.off("connect", onConnect)
      s.off("disconnect", onDisconnect)
      s.off("connect_error", onConnectError)
    }
  }, [isAuthenticated, accessToken])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {isAuthenticated && isConnected && <AdminSocketEventSubscriber />}
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Hook to access the current WebSocket client instance and connection state.
 */
export const useSocket = () => useContext(SocketContext)
