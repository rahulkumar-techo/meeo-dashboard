/**
 * @file socket-provider.tsx
 * @description Global React Context Provider for Socket.IO lifecycle and connection management.
 * Manages authentication handshakes, administrative stream subscriptions, and auto-cleanup.
 */

"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { Socket } from "socket.io-client"
import { getAdminSocket, disconnectAdminSocket } from "@/lib/socket"
import { useUserStore } from "@/store/user.store"
import { useAdminSocketEvents } from "@/hooks/use-admin-socket"
import { executeSilentRefresh } from "@/config/client"

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
  const accessToken = useUserStore((s) => s.accessToken)
  const isAuthenticated = useUserStore((s) => s.isAuthenticated)
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

    const onConnectError = async (error: Error) => {
      const msg = error?.message || ""
      setIsConnected(false)

      const isAuthError =
        msg.toLowerCase().includes("token") ||
        msg.toLowerCase().includes("auth") ||
        msg.toLowerCase().includes("expired")

      if (isAuthError) {
        // Disconnect immediately to stop reconnecting with stale/expired credentials
        s.disconnect()

        try {
          const refreshResult = await executeSilentRefresh()
          if (refreshResult?.accessToken) {
            const cleanToken = refreshResult.accessToken.startsWith("Bearer ")
              ? refreshResult.accessToken
              : `Bearer ${refreshResult.accessToken}`
            const rawToken = refreshResult.accessToken.replace(/^Bearer\s+/i, "")

            s.auth = {
              token: cleanToken,
              accessToken: rawToken,
            }
            if (s.io.opts.extraHeaders) {
              s.io.opts.extraHeaders["Authorization"] = cleanToken
            }
            s.connect()
          }
        } catch {
          // If silent refresh fails, disconnect cleanly
          disconnectAdminSocket()
        }
      } else {
        console.warn("[Socket.IO] Connection error:", msg)
      }
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

  const contextValue = useMemo(() => ({ socket, isConnected }), [socket, isConnected])

  return (
    <SocketContext.Provider value={contextValue}>
      {isAuthenticated && isConnected && <AdminSocketEventSubscriber />}
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Hook to access the current WebSocket client instance and connection state.
 */
export const useSocket = () => useContext(SocketContext)
