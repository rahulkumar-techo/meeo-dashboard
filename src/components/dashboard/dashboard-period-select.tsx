/**
 * @file dashboard-period-select.tsx
 * @description Period and custom date range selector for Dashboard Overview.
 * Supports preset intervals (today, 7d, 30d, 90d, 1y, all) and custom startDate/endDate ranges.
 */

"use client"

import * as React from "react"
import { Calendar, Check, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { DashboardOverviewPeriod, PayloadParams } from "@/types/dashboard-overview"
import { cn } from "@/lib/utils"

export interface DashboardPeriodSelectProps {
  value: PayloadParams
  onChange: (value: PayloadParams) => void
  disabled?: boolean
  className?: string
}

const PRESET_OPTIONS: Array<{ label: string; period: DashboardOverviewPeriod }> = [
  { label: "Today", period: "today" },
  { label: "Last 7 Days", period: "7d" },
  { label: "Last 30 Days", period: "30d" },
  { label: "Last 90 Days", period: "90d" },
  { label: "Last 1 Year", period: "1y" },
  { label: "All Time", period: "all" },
]

export function DashboardPeriodSelect({
  value,
  onChange,
  disabled = false,
  className,
}: DashboardPeriodSelectProps) {
  const [customDialogOpen, setCustomDialogOpen] = React.useState(false)
  const [tempStartDate, setTempStartDate] = React.useState(value.startDate || "")
  const [tempEndDate, setTempEndDate] = React.useState(value.endDate || "")

  // Determine current display label
  const currentLabel = React.useMemo(() => {
    if (value.startDate && value.endDate) {
      return `${value.startDate} to ${value.endDate}`
    }
    const match = PRESET_OPTIONS.find((opt) => opt.period === value.period)
    return match ? match.label : "Last 30 Days"
  }, [value])

  const handleSelectPreset = (period: DashboardOverviewPeriod) => {
    onChange({ period, startDate: undefined, endDate: undefined })
  }

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempStartDate || !tempEndDate) return

    onChange({
      period: "custom",
      startDate: tempStartDate,
      endDate: tempEndDate,
    })
    setCustomDialogOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          className={cn(
            "inline-flex items-center justify-between gap-1.5 rounded-md border border-border/80 bg-background px-2.5 h-8 text-xs font-medium shadow-2xs hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring min-w-[130px] cursor-pointer disabled:pointer-events-none disabled:opacity-50",
            className
          )}
          aria-label="Select overview period"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{currentLabel}</span>
          </div>
          <span className="text-muted-foreground ml-1">▾</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48 text-xs">
          {PRESET_OPTIONS.map((opt) => {
            const isSelected = value.period === opt.period && !value.startDate
            return (
              <DropdownMenuItem
                key={opt.period}
                onClick={() => handleSelectPreset(opt.period)}
                className="flex items-center justify-between text-xs cursor-pointer py-1.5"
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="size-3.5 text-indigo-600" />}
              </DropdownMenuItem>
            )
          })}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setTempStartDate(value.startDate || "")
              setTempEndDate(value.endDate || "")
              setCustomDialogOpen(true)
            }}
            className="flex items-center justify-between text-xs cursor-pointer py-1.5 text-indigo-600 dark:text-indigo-400 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              <span>Custom Date Range...</span>
            </div>
            {value.startDate && value.endDate && <Check className="size-3.5 text-indigo-600" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Date Range Dialog */}
      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CalendarDays className="size-4 text-indigo-600" />
              <span>Custom Date Range</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select custom start and end dates to filter dashboard analytics.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplyCustomRange} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Start Date</label>
                <Input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">End Date</label>
                <Input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  min={tempStartDate}
                  required
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCustomDialogOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!tempStartDate || !tempEndDate}
                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Apply Range
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
