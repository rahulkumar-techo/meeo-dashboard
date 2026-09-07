/**
 * @file order-timeline-step.tsx
 * @description Visual timeline component for tracking order fulfillment steps and events.
 * Follows Single Responsibility Principle (SRP).
 */

"use client"

import * as React from "react"
import { CheckCircle2, Clock, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimelineStepItem {
  title: string
  time?: string
  detail?: string
  completed: boolean
  isCurrent?: boolean
}

export interface OrderTimelineProps {
  steps: TimelineStepItem[]
  className?: string
}

export function OrderTimeline({ steps, className }: OrderTimelineProps) {
  return (
    <div className={cn("relative space-y-4 pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60", className)}>
      {steps.map((step, idx) => (
        <div key={idx} className="relative group">
          {/* Step Icon / Dot */}
          <div className="absolute -left-6 top-0.5 flex size-5 items-center justify-center">
            {step.completed ? (
              <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
              </div>
            ) : step.isCurrent ? (
              <div className="relative flex size-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              </div>
            ) : (
              <div className="size-3 rounded-full border-2 border-border bg-background" />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <span
                className={cn(
                  "font-medium",
                  step.completed
                    ? "text-foreground"
                    : step.isCurrent
                    ? "font-semibold text-indigo-600 dark:text-indigo-400"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
              {step.time && (
                <span className="text-[11px] text-muted-foreground">{step.time}</span>
              )}
            </div>
            {step.detail && (
              <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
