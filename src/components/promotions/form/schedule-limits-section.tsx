/**
 * @file schedule-limits-section.tsx
 * @description Scheduling, Happy Hours / Time of Day, Days of Week & Usage Caps.
 */

"use client"

import * as React from "react"
import { Calendar, Clock, Gauge } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { CreatePromotionFormValues } from "@/types/promotion"

import { SectionHeaderGuide } from "./section-guide"

interface ScheduleLimitsSectionProps {
  formData: CreatePromotionFormValues
  onChange: React.Dispatch<React.SetStateAction<CreatePromotionFormValues>>
}

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
]

export function ScheduleLimitsSection({
  formData,
  onChange,
}: ScheduleLimitsSectionProps) {
  const toggleDay = (dayValue: number) => {
    const current = formData.daysOfWeek || []
    const updated = current.includes(dayValue)
      ? current.filter((d) => d !== dayValue)
      : [...current, dayValue].sort((a, b) => a - b)
    onChange((p) => ({ ...p, daysOfWeek: updated }))
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-2xs">
      <SectionHeaderGuide
        icon={Calendar}
        iconColor="text-blue-500"
        title="4. Scheduling, Happy Hours & Usage Caps"
        description="Configure start and expiry dates, recurring time-of-day flash sale hours, specific active days of week, and customer redemption limits."
        tips={[
          "Starts / Ends At: Campaign launch and expiration timestamps in local time.",
          "Time of Day (HH:mm): Restrict promotion to happy hours (e.g. 18:00 to 22:00 evening sales).",
          "Active Days: Limit campaign to specific days of the week (e.g. Weekend Flash Sale on Sat & Sun).",
          "Total Usage Limit: Hard ceiling on total redemptions across the entire platform before auto-pausing.",
          "Limit Per User: Maximum number of times an individual shopper can claim this discount.",
        ]}
      />

      {/* Date Validity Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Starts At (Date & Time)
          </label>
          <Input
            type="datetime-local"
            value={formData.startsAt ?? ""}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                startsAt: e.target.value || null,
              }))
            }
            className="h-9.5 text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Ends At (Date & Time)
          </label>
          <Input
            type="datetime-local"
            value={formData.endsAt ?? ""}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                endsAt: e.target.value || null,
              }))
            }
            className="h-9.5 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Daily Time of Day (Happy Hours) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 text-muted-foreground" />
            <span>Time of Day Start (Happy Hour From)</span>
          </label>
          <Input
            type="time"
            value={formData.timeOfDayStart ?? ""}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                timeOfDayStart: e.target.value || null,
              }))
            }
            placeholder="14:00"
            className="h-9.5 text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 text-muted-foreground" />
            <span>Time of Day End (Happy Hour To)</span>
          </label>
          <Input
            type="time"
            value={formData.timeOfDayEnd ?? ""}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                timeOfDayEnd: e.target.value || null,
              }))
            }
            placeholder="18:00"
            className="h-9.5 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Days of Week Filter */}
      <div className="space-y-2 pt-1">
        <label className="block text-xs font-semibold text-foreground">
          Active Days of the Week (Leave all unselected for everyday)
        </label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const isSelected = formData.daysOfWeek?.includes(day.value)
            return (
              <button
                type="button"
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-muted/40 text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                }`}
              >
                {day.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Usage Limits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-border/50">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Gauge className="size-3.5 text-muted-foreground" />
            <span>Global Total Redemptions Limit</span>
          </label>
          <Input
            type="number"
            value={formData.totalUsageLimit ?? ""}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                totalUsageLimit: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
            placeholder="e.g. 1000 (Empty for unlimited)"
            className="h-9.5 text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Gauge className="size-3.5 text-muted-foreground" />
            <span>Per-Customer Usage Limit</span>
          </label>
          <Input
            type="number"
            value={formData.userUsageLimit ?? ""}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                userUsageLimit: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
            placeholder="e.g. 2 per customer"
            className="h-9.5 text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>
  )
}
