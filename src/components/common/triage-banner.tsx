/**
 * @file triage-banner.tsx
 * @description Operational triage and system health alert strip.
 * Eliminates repetitive alert banner code across Dashboard, Orders, and Operations pages.
 */

"use client"

import * as React from "react"
import { Radio, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { TriageQueueItem } from "@/types/common"

export interface TriageBannerProps {
  /** Title prefix (default: "TRIAGE QUEUE:") */
  title?: string
  /** Pulse indicator active */
  live?: boolean
  /** List of triage alert items */
  items: TriageQueueItem[]
  /** Right side system health message */
  healthStatus?: {
    text: string
    isHealthy?: boolean
    icon?: React.ComponentType<{ className?: string }>
  }
  /** Custom container class */
  className?: string
}

export function TriageBanner({
  title = "TRIAGE QUEUE:",
  live = true,
  items,
  healthStatus = { text: "Cluster healthy (99.98%)", isHealthy: true },
  className,
}: TriageBannerProps) {
  const HealthIcon = healthStatus.icon || (healthStatus.isHealthy !== false ? CheckCircle2 : AlertTriangle)

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-border/70 bg-card p-2.5 shadow-2xs text-xs",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
          {live && <Radio className="size-3.5 animate-pulse" />}
          <span>{title}</span>
        </div>

        {items.map((item) => {
          const isDanger = item.severity === "danger"
          const isWarning = item.severity === "warning"
          const isInfo = item.severity === "info"

          if (isDanger) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border border-rose-200/60 bg-rose-50/80 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 transition-colors",
                  item.onClick && "hover:bg-rose-100/80 cursor-pointer"
                )}
              >
                <AlertTriangle className="size-3 text-rose-600" />
                <span>
                  {item.label}: <strong>{item.count}</strong>
                </span>
              </button>
            )
          }

          if (isWarning) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border border-amber-200/60 bg-amber-50/80 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 transition-colors",
                  item.onClick && "hover:bg-amber-100/80 cursor-pointer"
                )}
              >
                <RefreshCw className="size-3 text-amber-600" />
                <span>
                  {item.label}: <strong>{item.count}</strong>
                </span>
              </button>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={cn(
                "flex items-center gap-1.5 text-muted-foreground text-[11.5px] transition-colors",
                item.onClick && "hover:text-foreground cursor-pointer"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isInfo ? "bg-cyan-500" : "bg-indigo-500"
                )}
              />
              <span>{item.label}:</span>
              <strong className="font-semibold text-foreground">{item.count}</strong>
            </button>
          )
        })}
      </div>

      {healthStatus && (
        <div
          className={cn(
            "flex items-center gap-1 text-[11px] font-medium",
            healthStatus.isHealthy !== false
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          )}
        >
          <HealthIcon className="size-3.5" />
          <span>{healthStatus.text}</span>
        </div>
      )}
    </div>
  )
}
