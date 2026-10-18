/**
 * @file use-live-logs-sse.ts
 * @description Real-time Log Streaming hook supporting both Socket.IO (primary)
 * and Server-Sent Events (SSE) transports as specified in the Observability Integration Guide.
 * Includes auto-buffer trimming, pause/resume, historical pre-seeding, and connection recovery.
 */

"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useUserStore } from "@/store/user.store"
import { API_BASE_URL } from "@/config/client"
import { useSocket } from "@/context/socket-provider"
import { observabilityService } from "@/services/observability.service"
import { normalizeLogEntry } from "@/utils/logParser"
import type { NormalizedLogEntry } from "@/types/observability"

export type LogStreamTransport = "sse" | "socket"

interface UseLiveLogsOptions {
  query?: string
  maxBuffer?: number
  autoConnect?: boolean
  transport?: LogStreamTransport
}

export function useLiveLogsSSE({
  query = '{job="meeo-api"}',
  maxBuffer = 800,
  autoConnect = true,
  transport: initialTransport = "socket",
}: UseLiveLogsOptions = {}) {
  const { accessToken, isAuthenticated } = useUserStore()
  const { socket, isConnected: isSocketConnected } = useSocket()

  const [transport, setTransport] = useState<LogStreamTransport>(initialTransport)
  const [logs, setLogs] = useState<NormalizedLogEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const isPausedRef = useRef(false)
  isPausedRef.current = isPaused

  const appendLog = useCallback((entry: NormalizedLogEntry) => {
    if (isPausedRef.current) return
    setLogs((prev) => {
      // Avoid duplicate log IDs
      if (prev.some((p) => p.id === entry.id)) {
        return prev
      }
      const next = [...prev, entry]
      return next.length > maxBuffer ? next.slice(next.length - maxBuffer) : next
    })
  }, [maxBuffer])

  // Pre-seed buffer with latest logs on query change so the terminal displays instant data
  useEffect(() => {
    let isCancelled = false
    if (!autoConnect || !isAuthenticated) return

    observabilityService
      .getHistoricalLogs({ query, limit: 60, direction: "backward" })
      .then((res) => {
        if (!isCancelled && res?.logs && res.logs.length > 0) {
          const normalized = res.logs.map(normalizeLogEntry)
          setLogs((prev) => {
            if (prev.length === 0) {
              return normalized
            }
            return prev
          })
        }
      })
      .catch((err) => {
        console.warn("[LiveLogs] Historical pre-seed warning:", err)
      })

    return () => {
      isCancelled = true
    }
  }, [query, autoConnect, isAuthenticated])

  // ============================
  // 1. SSE Connection Handler
  // ============================
  const connectSSE = useCallback(() => {
    if (typeof window === "undefined" || !isAuthenticated) return

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const url = new URL(`${API_BASE_URL}/observability/logs/stream`)
      url.searchParams.set("query", query)
      if (accessToken) {
        url.searchParams.set("token", accessToken)
      }

      const es = new EventSource(url.toString(), { withCredentials: true })
      eventSourceRef.current = es

      es.addEventListener("open", () => {
        setIsConnected(true)
        setError(null)
      })

      es.addEventListener("connected", () => {
        setIsConnected(true)
        setError(null)
      })

      es.addEventListener("log", (event) => {
        try {
          const raw = JSON.parse(event.data)
          const items = Array.isArray(raw) ? raw : [raw]
          for (const item of items) {
            if (!item) continue
            appendLog(normalizeLogEntry(item))
          }
        } catch (err) {
          console.warn("[LiveLogs] Failed to parse SSE log stream payload", err)
        }
      })

      es.addEventListener("error", () => {
        setIsConnected(false)
        setError("Reconnecting to live log stream...")
      })
    } catch {
      setError("Failed to initialize live log stream")
      setIsConnected(false)
    }
  }, [query, accessToken, isAuthenticated, appendLog])

  // ============================
  // 2. Socket.IO Handler
  // ============================
  const connectSocket = useCallback(() => {
    if (!socket || !isAuthenticated) {
      setIsConnected(false)
      return
    }

    const handleSocketLog = (payload: any) => {
      const raw = payload?.data !== undefined ? payload.data : payload
      const list = Array.isArray(raw) ? raw : [raw]

      for (const item of list) {
        if (!item) continue
        appendLog(normalizeLogEntry(item))
      }
    }

    const subscribeToLogs = () => {
      setIsConnected(true)
      setError(null)

      socket.emit("join:logs", { query }, (ack?: { success?: boolean; error?: string }) => {
        if (ack?.success) {
          setIsConnected(true)
          setError(null)
        } else if (ack?.error) {
          setError(ack.error)
          console.warn("[LiveLogs] join:logs error from server:", ack.error)
        }
      })
    }

    // Attach listeners
    socket.on("observability.log", handleSocketLog)
    socket.on("observability:log", handleSocketLog)
    socket.on("log", handleSocketLog)
    socket.on("connect", subscribeToLogs)
    socket.on("disconnect", () => setIsConnected(false))
    socket.on("connect_error", (err: Error) => {
      setIsConnected(false)
      setError(`Socket connection error: ${err.message}`)
    })

    if (socket.connected) {
      subscribeToLogs()
    } else {
      socket.connect()
    }

    return () => {
      socket.emit("leave:logs")
      socket.off("observability.log", handleSocketLog)
      socket.off("observability:log", handleSocketLog)
      socket.off("log", handleSocketLog)
      socket.off("connect", subscribeToLogs)
    }
  }, [socket, isAuthenticated, query, appendLog])

  // Lifecycle manager based on chosen transport
  useEffect(() => {
    if (!autoConnect || !isAuthenticated) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      setIsConnected(false)
      return
    }

    if (transport === "sse") {
      connectSSE()
      return () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
          eventSourceRef.current = null
        }
        setIsConnected(false)
      }
    } else {
      const cleanupSocket = connectSocket()
      return () => {
        if (cleanupSocket) cleanupSocket()
        setIsConnected(false)
      }
    }
  }, [transport, autoConnect, isAuthenticated, connectSSE, connectSocket])

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p)
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    logs,
    isConnected,
    isPaused,
    error,
    transport,
    setTransport,
    togglePause,
    clearLogs,
    isSocketAvailable: Boolean(socket),
  }
}
