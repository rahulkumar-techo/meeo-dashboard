/**
 * @file socket.ts
 * @description Singleton Socket.IO client instance manager for Meeo Admin Console.
 * Handles auto-reconnection, auth bearer handshake, transport failover, and cleanup.
 */

import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

/**
 * Derives the Socket.IO root server URL from environment variables.
 * Strips `/api/v1` or `/api` suffix if configured from standard REST base URL.
 */
export function getSocketServerUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    return apiUrl.replace(/\/api(\/v\d+)?\/?$/, "")
  }

  return "http://localhost:5000"
}

/**
 * Retrieves or establishes the singleton authenticated admin socket client.
 *
 * @param accessToken - The JWT access token for administrative authentication.
 * @returns Active Socket.IO client instance.
 */
export function getAdminSocket(accessToken: string): Socket {
  const url = getSocketServerUrl()

  if (!socket) {
    socket = io(url, {
      path: "/socket.io",
      auth: { token: `Bearer ${accessToken}` },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })
  } else {
    // Update credentials if token changed
    if (socket.auth && typeof socket.auth === "object") {
      (socket.auth as { token?: string }).token = `Bearer ${accessToken}`
    } else {
      socket.auth = { token: `Bearer ${accessToken}` }
    }

    if (!socket.connected && !socket.active) {
      socket.connect()
    }
  }

  return socket
}

/**
 * Cleanly disconnects and disposes of the singleton admin socket client.
 */
export function disconnectAdminSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
