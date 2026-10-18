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
  const cleanToken = accessToken.startsWith("Bearer ") ? accessToken : `Bearer ${accessToken}`
  const rawToken = accessToken.replace(/^Bearer\s+/i, "")

  if (!socket) {
    socket = io(url, {
      path: "/socket.io",
      auth: {
        token: cleanToken,
        accessToken: rawToken,
      },
      extraHeaders: {
        Authorization: cleanToken,
      },
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    })
  } else {
    // Update credentials if token changed
    socket.auth = {
      token: cleanToken,
      accessToken: rawToken,
    }

    if (!socket.connected) {
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
