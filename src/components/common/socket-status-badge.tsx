/**
 * @file socket-status-badge.tsx
 * @description Real-time WebSocket connection status indicator with live animated blinker.
 */

"use client"

import * as React from "react"
import { useSocket } from "@/context/socket-provider"
import { cn } from "@/lib/utils"

export interface SocketStatusBadgeProps {
  /** Display variant: dot only, full pill, or compact badge */
  variant?: "dot" | "pill" | "badge"
  /** Custom label override */
  label?: string
  /** Additional CSS class names */
  className?: string
}

export function SocketStatusBadge({
  variant = "pill",
  label,
  className,
}: SocketStatusBadgeProps) {
  const { isConnected } = useSocket()

  if (variant === "dot") {
    return (
      <span
        className={cn("relative inline-flex size-2 items-center justify-center", className)}
        title={isConnected ? "WebSocket: Live connected" : "WebSocket: Disconnected / Connecting"}
      >
        {isConnected ? (
          <>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
          </>
        ) : (
          <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
        )}
      </span>
    )
  }

  if (variant === "badge") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium border transition-colors",
          isConnected
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
          className
        )}
      >
        <span className="relative flex size-1.5">
          {isConnected ? (
            <>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </>
          ) : (
            <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
          )}
        </span>
        <span>{label ?? (isConnected ? "LIVE WS" : "CONNECTING")}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs transition-colors",
        isConnected
          ? "border-emerald-500/20 bg-emerald-500/5 text-foreground"
          : "border-amber-500/20 bg-amber-500/5 text-muted-foreground",
        className
      )}
    >
      <span className="relative flex size-2">
        {isConnected ? (
          <>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </>
        ) : (
          <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
        )}
      </span>
      <span className="text-[11px] font-medium text-foreground">
        {label ?? (isConnected ? "Real-time Live" : "Connecting WS...")}
      </span>
      <span
        className={cn(
          "rounded px-1.5 py-0.2 font-mono text-[10px] border",
          isConnected
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
            : "bg-muted text-muted-foreground border-border/40"
        )}
      >
        {isConnected ? "CONNECTED" : "STANDBY"}
      </span>
    </div>
  )
}
